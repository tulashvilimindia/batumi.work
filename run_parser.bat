@echo off
chcp 65001 >nul
title Jobs.ge Parser - Batumi/Adjara

echo ============================================================
echo            Jobs.ge Parser - Batumi/Adjara Region
echo ============================================================
echo.

cd /d "%~dp0"

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

:: Install dependencies if needed
echo [SETUP] Checking dependencies...
python -m pip install -q requests beautifulsoup4 schedule 2>nul

:: Run the parser
echo.
echo [START] Running parser...
echo.

python jobs_parser.py --export %*

echo.
echo ============================================================
echo [COMPLETE] Parser finished. Check data\ folder for results.
echo ============================================================
echo.
pause
