[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$RepoRoot,
    [Parameter(Mandatory = $true)][string]$ManifestPath,
    [string]$OutputPath = '',
    [string]$GitSafeDirectory = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repo = [IO.Path]::GetFullPath($RepoRoot).TrimEnd([char]0x5C, [char]0x2F)
if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) {
    throw "Not a git repository: $repo"
}

$manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $manifest.files) {
    throw 'Manifest must contain a files array of {path, sha} objects.'
}

function Get-GitHash {
    param(
        [Parameter(Mandatory = $true)][string]$RelativePath,
        [switch]$NoFilters
    )

    $gitArgs = @()
    if ($GitSafeDirectory) {
        $gitArgs += @('-c', "safe.directory=$GitSafeDirectory")
    }
    $gitArgs += 'hash-object'
    if ($NoFilters) {
        $gitArgs += '--no-filters'
    }
    $gitArgs += @('--', $RelativePath)

    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $hash = (@(& git -C $repo @gitArgs 2>&1 | ForEach-Object { $_.ToString() }) -join '').Trim()
        if ($LASTEXITCODE -ne 0) {
            throw "git hash-object failed for $RelativePath"
        }
        return $hash.ToLowerInvariant()
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

$matched = @()
$lineEndingOrFilter = @()
$mismatched = @()
$missing = @()
$invalid = @()

foreach ($item in @($manifest.files)) {
    $rel = [string]$item.path
    $expected = ([string]$item.sha).ToLowerInvariant()
    if ([string]::IsNullOrWhiteSpace($rel) -or [string]::IsNullOrWhiteSpace($expected)) {
        $invalid += $rel
        continue
    }
    if ($rel.Contains('..') -or $rel.StartsWith('/') -or $rel.StartsWith([string][char]0x5C) -or $rel -match '^[A-Za-z]:') {
        $invalid += $rel
        continue
    }

    $full = Join-Path $repo ($rel.Replace('/', [string][char]0x5C))
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $missing += $rel
        continue
    }

    $raw = Get-GitHash -RelativePath $rel -NoFilters
    if ($raw -eq $expected) {
        $matched += $rel
        continue
    }

    $filtered = Get-GitHash -RelativePath $rel
    if ($filtered -eq $expected) {
        $lineEndingOrFilter += $rel
        continue
    }

    $mismatched += [pscustomobject]@{
        path     = $rel
        expected = $expected
        raw      = $raw
        filtered = $filtered
    }
}

$result = [pscustomobject]@{
    repo_root                   = $repo
    base_sha                    = [string]$manifest.base_sha
    total                       = @($manifest.files).Count
    matched                     = @($matched).Count
    line_ending_or_filter       = @($lineEndingOrFilter).Count
    missing                     = @($missing).Count
    mismatched                  = @($mismatched).Count
    invalid                     = @($invalid).Count
    missing_paths               = @($missing)
    line_ending_or_filter_paths = @($lineEndingOrFilter)
    mismatched_files            = @($mismatched)
    invalid_paths               = @($invalid)
}

$json = $result | ConvertTo-Json -Depth 6
if ($OutputPath) {
    $parent = Split-Path -Parent $OutputPath
    if ($parent -and -not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    [IO.File]::WriteAllText($OutputPath, $json, [Text.UTF8Encoding]::new($false))
}

Write-Output $json
