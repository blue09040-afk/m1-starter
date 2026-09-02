param(
  [Parameter(Mandatory=$true)][string]$Target,
  [ValidateSet("auto", "text", "ocr")][string]$Mode = "text",
  [string]$Model = "",
  [int]$ChunkSize = 8,
  [int]$Retries = 3,
  [int]$Timeout = 180,
  [int]$Parallel = 0,
  [string]$PythonPath = "",
  [string]$OutputDir = "",
  [string]$ChunkDir = "",
  [string]$ManifestDir = "",
  [switch]$MaskPii,
  [string[]]$PreserveValue = @(),
  [string[]]$MaskValue = @()
)

$ErrorActionPreference = "Stop"

function Test-PythonExecutable {
  param([string]$Path)
  if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
  try {
    $output = & $Path --version 2>&1
    if ($LASTEXITCODE -ne 0) { return $false }
    return ($output -join " ") -match "^Python 3\."
  } catch { return $false }
}

function Resolve-PythonExecutable {
  $candidates = @()
  if ($PythonPath -ne "") { $candidates += $PythonPath }
  if ($env:PDF_OCR_PYTHON) { $candidates += $env:PDF_OCR_PYTHON }
  $candidates += ".\.venv\Scripts\python.exe"
  foreach ($candidate in $candidates) {
    $resolved = $candidate
    if (-not [System.IO.Path]::IsPathRooted($resolved)) { $resolved = Join-Path (Get-Location) $resolved }
    if (Test-PythonExecutable $resolved) { return $resolved }
  }
  foreach ($name in @("python.exe", "python")) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source -notmatch "\\WindowsApps\\" -and (Test-PythonExecutable $cmd.Source)) { return $cmd.Source }
  }
  throw "Python 3 runtime not found. Install Python 3 or create .venv, then rerun."
}

$python = Resolve-PythonExecutable
$argsList = @(".\src\pdf_to_md.py", $Target, "--mode", $Mode, "--chunk-size", "$ChunkSize", "--retries", "$Retries", "--timeout", "$Timeout", "--parallel", "$Parallel")
if ($Model -ne "") { $argsList += @("--model", $Model) }
if ($OutputDir -ne "") { $argsList += @("--output-dir", $OutputDir) }
if ($ChunkDir -ne "") { $argsList += @("--chunk-dir", $ChunkDir) }
if ($ManifestDir -ne "") { $argsList += @("--manifest-dir", $ManifestDir) }
if ($MaskPii) {
  $argsList += "--mask-pii"
  foreach ($value in $PreserveValue) { $argsList += @("--preserve-value", $value) }
  foreach ($value in $MaskValue) { $argsList += @("--mask-value", $value) }
}
& $python @argsList
