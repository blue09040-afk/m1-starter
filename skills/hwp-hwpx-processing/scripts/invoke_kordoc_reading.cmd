@echo off
setlocal EnableExtensions

if "%~1"=="" (
  echo [ERROR] This wrapper requires an HWP/HWPX input file, --help, or --version. 1>&2
  exit /b 2
)

if /I "%~1"=="--version" goto :resolve_runtime
if /I "%~1"=="-V" goto :resolve_runtime
if /I "%~1"=="--help" goto :resolve_runtime
if /I "%~1"=="-h" goto :resolve_runtime

if /I "%~x1"==".hwp" goto :check_input
if /I "%~x1"==".hwpx" goto :check_input

echo [ERROR] This read-only wrapper accepts only .hwp/.hwpx input as its first argument. 1>&2
echo [ERROR] Kordoc subcommands are not allowed; use the dedicated authoring or utility route instead. 1>&2
exit /b 2

:check_input
if not exist "%~1" (
  echo [ERROR] Input file was not found: "%~1" 1>&2
  exit /b 2
)

:resolve_runtime
if defined KORDOC_ONEOCR_HOME (
  set "KORDOC_RUNTIME=%KORDOC_ONEOCR_HOME%"
  set "KORDOC_READING_CLI=%KORDOC_ONEOCR_HOME%\node_modules\kordoc\dist\cli.js"
  set "KORDOC_PACKAGE=%KORDOC_ONEOCR_HOME%\node_modules\kordoc\package.json"
  if exist "%KORDOC_ONEOCR_HOME%\node_modules\kordoc\dist\cli.js" if exist "%KORDOC_ONEOCR_HOME%\node_modules\kordoc\package.json" goto :run
)

set "KORDOC_RUNTIME=C:\Tools\KordocOneOCR"
set "KORDOC_READING_CLI=%KORDOC_RUNTIME%\node_modules\kordoc\dist\cli.js"
set "KORDOC_PACKAGE=%KORDOC_RUNTIME%\node_modules\kordoc\package.json"
if exist "%KORDOC_READING_CLI%" if exist "%KORDOC_PACKAGE%" goto :run

set "KORDOC_RUNTIME=%~dp0kordoc"
set "KORDOC_READING_CLI=%KORDOC_RUNTIME%\node_modules\kordoc\dist\cli.js"
set "KORDOC_PACKAGE=%KORDOC_RUNTIME%\node_modules\kordoc\package.json"
if exist "%KORDOC_READING_CLI%" if exist "%KORDOC_PACKAGE%" goto :run

echo [ERROR] No compatible Kordoc reading runtime was found. 1>&2
echo [ERROR] Checked KORDOC_ONEOCR_HOME, C:\Tools\KordocOneOCR, and the skill-local runtime. 1>&2
echo [ERROR] A missing global kordoc command does not prove that these runtime paths are unavailable. 1>&2
exit /b 1

:run
where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found. 1>&2
  exit /b 1
)
node "%KORDOC_READING_CLI%" %*
exit /b %errorlevel%
