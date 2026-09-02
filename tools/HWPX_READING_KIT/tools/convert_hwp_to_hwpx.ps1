[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Target,
    [string]$OutputDirectory,
    [string]$ConverterPath,
    [switch]$Recurse,
    [switch]$Overwrite,
    [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) 'output\hwpx'
}

function Find-Converter {
    param([string]$RequestedPath)

    $candidates = @()
    if ($RequestedPath) {
        $candidates += $RequestedPath
    }
    $candidates += (Join-Path $PSScriptRoot 'HwpxConverter\HwpxConverter.exe')
    $candidates += 'C:\Program Files (x86)\HNC\HwpxConverter\HwpxConverter.exe'
    $candidates += 'C:\Program Files\HNC\HwpxConverter\HwpxConverter.exe'

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    throw 'HwpxConverter.exe was not found. Run tools\install_hwpx_converter.ps1 first or pass -ConverterPath.'
}

function Test-HwpxStructure {
    param([string]$Path)

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $required = @(
        'mimetype'
        'Contents/header.xml'
        'Contents/section0.xml'
        'Preview/PrvText.txt'
        'META-INF/container.xml'
        'META-INF/manifest.xml'
    )
    $archive = [IO.Compression.ZipFile]::OpenRead($Path)
    try {
        $names = @($archive.Entries | ForEach-Object { $_.FullName })
        $missing = @($required | Where-Object { $_ -notin $names })
        return [PSCustomObject]@{
            Valid = ($missing.Count -eq 0)
            Missing = $missing
            EntryCount = $names.Count
        }
    }
    finally {
        $archive.Dispose()
    }
}

$converter = Find-Converter -RequestedPath $ConverterPath
$resolvedTarget = Resolve-Path -LiteralPath $Target
$targetItem = Get-Item -LiteralPath $resolvedTarget.Path
if ($targetItem.PSIsContainer) {
    $files = @(Get-ChildItem -LiteralPath $targetItem.FullName -Filter '*.hwp' -File -Recurse:$Recurse)
}
elseif ($targetItem.Extension -ieq '.hwp') {
    $files = @($targetItem)
}
else {
    throw 'Target must be an .hwp file or a folder containing .hwp files.'
}

if ($files.Count -eq 0) {
    throw 'No .hwp files were found.'
}

$outputRoot = [IO.Path]::GetFullPath($OutputDirectory)
$logsRoot = Join-Path (Split-Path -Parent $outputRoot) 'logs'
$workRoot = Join-Path $outputRoot '.convert_work'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
New-Item -ItemType Directory -Path $logsRoot -Force | Out-Null
New-Item -ItemType Directory -Path $workRoot -Force | Out-Null

$results = [System.Collections.Generic.List[object]]::new()
foreach ($file in $files) {
    $destination = Join-Path $outputRoot ([IO.Path]::GetFileNameWithoutExtension($file.Name) + '.hwpx')
    $workDirectory = Join-Path $workRoot ([Guid]::NewGuid().ToString('N'))
    $workInput = Join-Path $workDirectory $file.Name
    $workOutput = [IO.Path]::ChangeExtension($workInput, '.hwpx')
    $started = Get-Date

    try {
        if ((Test-Path -LiteralPath $destination) -and -not $Overwrite) {
            throw "Output already exists: $destination"
        }
        New-Item -ItemType Directory -Path $workDirectory -Force | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $workInput -Force

        $argument = '"' + $workInput + '"'
        $process = Start-Process -FilePath $converter -ArgumentList @($argument) -PassThru -WindowStyle Hidden
        if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            throw "Conversion timed out after $TimeoutSeconds seconds."
        }
        if ($process.ExitCode -ne 0) {
            throw "Converter exited with code $($process.ExitCode)."
        }
        if (-not (Test-Path -LiteralPath $workOutput)) {
            throw 'Converter completed but no HWPX output was created.'
        }

        $validation = Test-HwpxStructure -Path $workOutput
        if (-not $validation.Valid) {
            throw ('HWPX validation failed. Missing: ' + ($validation.Missing -join ', '))
        }
        Move-Item -LiteralPath $workOutput -Destination $destination -Force:$Overwrite
        $results.Add([PSCustomObject]@{
            Source = $file.FullName
            Output = $destination
            Status = 'converted'
            EntryCount = $validation.EntryCount
            StartedAt = $started.ToString('s')
            CompletedAt = (Get-Date).ToString('s')
            Error = $null
        })
        Write-Output "Converted: $($file.Name) -> $destination"
    }
    catch {
        $results.Add([PSCustomObject]@{
            Source = $file.FullName
            Output = $destination
            Status = 'failed'
            EntryCount = $null
            StartedAt = $started.ToString('s')
            CompletedAt = (Get-Date).ToString('s')
            Error = $_.Exception.Message
        })
        Write-Warning "Failed: $($file.FullName) :: $($_.Exception.Message)"
    }
    finally {
        if (Test-Path -LiteralPath $workDirectory) {
            Remove-Item -LiteralPath $workDirectory -Recurse -Force
        }
    }
}

if ((Get-ChildItem -LiteralPath $workRoot -Force -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
    Remove-Item -LiteralPath $workRoot -Force
}

$logPath = Join-Path $logsRoot ('hwp_to_hwpx_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.json')
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $logPath -Encoding UTF8
Write-Output "Log: $logPath"

if (@($results | Where-Object Status -eq 'failed').Count -gt 0) {
    exit 1
}
