[CmdletBinding()]
param(
    [string]$InstallDirectory,
    [string]$InstallerUrl = 'https://cdn.hancom.com/pds/hnc/FNT/HWPX_converter.zip',
    [switch]$KeepShortcuts
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $InstallDirectory) {
    $InstallDirectory = Join-Path $PSScriptRoot 'HwpxConverter'
}

function Remove-ConverterShortcuts {
    $shortcutRoots = @(
        (Join-Path $env:PUBLIC 'Desktop')
        (Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs')
    )
    foreach ($root in $shortcutRoots) {
        if (Test-Path -LiteralPath $root) {
            Get-ChildItem -LiteralPath $root -Filter 'HWPX*.lnk' -File -Recurse -ErrorAction SilentlyContinue |
                ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }
        }
    }
}

$installDirectory = [IO.Path]::GetFullPath($InstallDirectory)
$converterExe = Join-Path $installDirectory 'HwpxConverter.exe'
if (Test-Path -LiteralPath $converterExe) {
    if (-not $KeepShortcuts) {
        Remove-ConverterShortcuts
    }
    Write-Output "HWPX Converter already installed: $converterExe"
    exit 0
}

$setupWork = Join-Path $PSScriptRoot '_setup_work'
if (Test-Path -LiteralPath $setupWork) {
    Remove-Item -LiteralPath $setupWork -Recurse -Force
}
New-Item -ItemType Directory -Path $setupWork -Force | Out-Null

try {
    $installerZip = Join-Path $setupWork 'HWPX_converter.zip'
    $downloadHeaders = @{
        Referer = 'https://www.store.hancom.com/support/downloadCenter/download'
        'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        Accept = 'application/zip,application/octet-stream,*/*'
    }
    Invoke-WebRequest -Uri $InstallerUrl -Headers $downloadHeaders -OutFile $installerZip -UseBasicParsing
    if ((Get-Item -LiteralPath $installerZip).Length -lt 100000) {
        throw 'Downloaded installer file is unexpectedly small. Check the official download URL.'
    }

    Expand-Archive -LiteralPath $installerZip -DestinationPath $setupWork -Force
    $setupExe = Get-ChildItem -LiteralPath $setupWork -Filter '*.exe' -File | Select-Object -First 1
    if (-not $setupExe) {
        throw 'Setup executable was not found in the official installer ZIP.'
    }

    $logPath = Join-Path $PSScriptRoot 'install_hwpx_converter.log'
    $arguments = @(
        '/VERYSILENT'
        '/SUPPRESSMSGBOXES'
        '/NORESTART'
        '/SP-'
        ('/DIR="' + $installDirectory + '"')
        ('/LOG="' + $logPath + '"')
    )
    $process = Start-Process -FilePath $setupExe.FullName -ArgumentList $arguments -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $converterExe)) {
        throw "HWPX Converter installation failed. Exit code: $($process.ExitCode)"
    }

    if (-not $KeepShortcuts) {
        Remove-ConverterShortcuts
    }

    Write-Output "HWPX Converter installed: $converterExe"
}
finally {
    if (Test-Path -LiteralPath $setupWork) {
        Remove-Item -LiteralPath $setupWork -Recurse -Force
    }
}
