[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$scriptPath = Join-Path $PSScriptRoot 'compare_guidance_manifest.ps1'
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('guidance-sync-compare-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $testRoot | Out-Null

try {
    $repo = Join-Path $testRoot 'repo'
    New-Item -ItemType Directory -Path $repo | Out-Null
    git -C $repo init --quiet
    git -C $repo config user.name 'Codex Test'
    git -C $repo config user.email 'codex-test@example.invalid'
    $utf8 = New-Object System.Text.UTF8Encoding $false
    [IO.File]::WriteAllText((Join-Path $repo 'same.txt'), "same`n", $utf8)
    git -C $repo add same.txt
    git -C $repo commit --quiet -m 'seed'
    $sameSha = (git -C $repo hash-object --no-filters -- same.txt).Trim()

    [IO.File]::WriteAllText((Join-Path $repo 'changed.txt'), "old`n", $utf8)
    git -C $repo add changed.txt
    git -C $repo commit --quiet -m 'changed seed'
    $oldSha = (git -C $repo hash-object --no-filters -- changed.txt).Trim()
    [IO.File]::WriteAllText((Join-Path $repo 'changed.txt'), "new`n", $utf8)

    $manifestPath = Join-Path $testRoot 'manifest.json'
    $manifest = @{
        base_sha = 'test'
        files    = @(
            @{ path = 'same.txt'; sha = $sameSha }
            @{ path = 'changed.txt'; sha = $oldSha }
            @{ path = 'missing.txt'; sha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }
        )
    }
    [IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 6), $utf8)

    $outputPath = Join-Path $testRoot 'result.json'
    & $scriptPath -RepoRoot $repo -ManifestPath $manifestPath -OutputPath $outputPath | Out-Null
    $result = Get-Content -LiteralPath $outputPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($result.matched -ne 1) { throw "matched=$($result.matched)" }
    if ($result.mismatched -ne 1) { throw "mismatched=$($result.mismatched)" }
    if ($result.missing -ne 1) { throw "missing=$($result.missing)" }
    Write-Output 'PASS: compare_guidance_manifest matched/mismatched/missing'
}
finally {
    Remove-Item -LiteralPath $testRoot -Recurse -Force
}
