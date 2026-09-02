[CmdletBinding()]
param(
    [string]$SourceRoot = '',
    [string]$TargetRoot = '',
    [switch]$NoBackup,
    [switch]$DryRun,
    [switch]$VerifyOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Get-SkillHashMap {
    param([Parameter(Mandatory = $true)][string]$Root)

    $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd(
        [IO.Path]::DirectorySeparatorChar,
        [IO.Path]::AltDirectorySeparatorChar
    )
    $map = @{}
    foreach ($file in @(Get-ChildItem -LiteralPath $rootPath -Recurse -Force -File | Sort-Object FullName)) {
        $relative = $file.FullName.Substring($rootPath.Length).TrimStart('\\', '/').Replace('\\', '/')
        $map[$relative] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    }
    return $map
}

function Assert-SkillTreesMatch {
    param(
        [Parameter(Mandatory = $true)][string]$SourcePath,
        [Parameter(Mandatory = $true)][string]$TargetPath,
        [Parameter(Mandatory = $true)][array]$Skills
    )

    if (-not (Test-Path -LiteralPath $TargetPath -PathType Container)) {
        throw "Target skills directory does not exist: $TargetPath"
    }

    $differences = New-Object 'System.Collections.Generic.List[string]'
    foreach ($skill in $Skills) {
        $sourceSkill = Join-Path $SourcePath $skill.Name
        $targetSkill = Join-Path $TargetPath $skill.Name
        $before = $differences.Count

        if (-not (Test-Path -LiteralPath $targetSkill -PathType Container)) {
            [void]$differences.Add("MISSING SKILL: $($skill.Name)")
            continue
        }

        $sourceMap = Get-SkillHashMap -Root $sourceSkill
        $targetMap = Get-SkillHashMap -Root $targetSkill
        $allPaths = @($sourceMap.Keys) + @($targetMap.Keys) | Sort-Object -Unique

        foreach ($relative in $allPaths) {
            if (-not $sourceMap.ContainsKey($relative)) {
                [void]$differences.Add("EXTRA: $($skill.Name)/$relative")
            }
            elseif (-not $targetMap.ContainsKey($relative)) {
                [void]$differences.Add("MISSING: $($skill.Name)/$relative")
            }
            elseif ($sourceMap[$relative] -ne $targetMap[$relative]) {
                [void]$differences.Add("CHANGED: $($skill.Name)/$relative")
            }
        }

        if ($differences.Count -eq $before) {
            Write-Output "Verified $($skill.Name) ($($sourceMap.Count) files)"
        }
    }

    if ($differences.Count -gt 0) {
        $shown = @($differences | Select-Object -First 20)
        $suffix = if ($differences.Count -gt $shown.Count) {
            "$([Environment]::NewLine)... and $($differences.Count - $shown.Count) more difference(s)"
        }
        else {
            ''
        }
        throw "Skill verification failed.$([Environment]::NewLine)$($shown -join [Environment]::NewLine)$suffix"
    }

    Write-Output "Skill verification complete: $TargetPath"
}

if ($DryRun -and $VerifyOnly) {
    throw 'DryRun and VerifyOnly cannot be used together.'
}

$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $SourceRoot) {
    $SourceRoot = Join-Path $repoRoot 'skills'
}
if (-not $TargetRoot) {
    $TargetRoot = Join-Path $env:USERPROFILE '.codex\skills'
}

$source = Resolve-Path -LiteralPath $SourceRoot
$sourcePath = $source.Path
$targetPath = [IO.Path]::GetFullPath($TargetRoot)

if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
    throw "Source skills directory does not exist: $sourcePath"
}

$blockedNames = @('.env', 'output', '_validation', '__pycache__', '.convert_work', '_delete_later')
$blockedExtensions = @('.pyc', '.log')
$blocked = @(
    Get-ChildItem -LiteralPath $sourcePath -Recurse -Force -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -in $blockedNames -or $_.Extension -in $blockedExtensions }
)
$blocked += @(
    Get-ChildItem -LiteralPath $sourcePath -Recurse -Force -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -in $blockedNames }
)
if ($blocked.Count -gt 0) {
    $list = ($blocked | Select-Object -First 20 | ForEach-Object { $_.FullName }) -join [Environment]::NewLine
    throw "Blocked files or directories are present in skill source. Remove them before syncing.$([Environment]::NewLine)$list"
}

$skills = @(Get-ChildItem -LiteralPath $sourcePath -Directory | Sort-Object Name)
if ($skills.Count -eq 0) {
    throw "No skill directories found under: $sourcePath"
}

foreach ($skill in $skills) {
    $manifest = Join-Path $skill.FullName 'SKILL.md'
    if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
        throw "Skill is missing SKILL.md: $($skill.FullName)"
    }
}

if ($VerifyOnly) {
    Assert-SkillTreesMatch -SourcePath $sourcePath -TargetPath $targetPath -Skills $skills
    Write-Output 'Verification covers source-managed skills only. Other target skills and removed legacy skill directories are not changed.'
    return
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupParent = Join-Path (Split-Path -Parent $targetPath) 'skills_backups'
$backupRoot = Join-Path $backupParent $timestamp

if ($DryRun) {
    Write-Output "DRY RUN"
    Write-Output "Source: $sourcePath"
    Write-Output "Target: $targetPath"
    Write-Output "Skills: $($skills.Name -join ', ')"
    return
}

New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
if (-not $NoBackup) {
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
}

foreach ($skill in $skills) {
    $destination = Join-Path $targetPath $skill.Name
    if (Test-Path -LiteralPath $destination) {
        if ($NoBackup) {
            Remove-Item -LiteralPath $destination -Recurse -Force
        }
        else {
            Move-Item -LiteralPath $destination -Destination (Join-Path $backupRoot $skill.Name) -Force
        }
    }
    Copy-Item -LiteralPath $skill.FullName -Destination $destination -Recurse -Force
    Write-Output "Synced $($skill.Name)"
}

Assert-SkillTreesMatch -SourcePath $sourcePath -TargetPath $targetPath -Skills $skills
Write-Output "Skill sync complete: $targetPath"
Write-Output 'If a newly added or renamed skill is not visible in the current Codex task, check a new task first and restart the app only if needed.'
