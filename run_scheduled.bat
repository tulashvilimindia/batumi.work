@echo off
chcp 65001 >nul
title Jobs.ge Parser - Scheduled (Every 60 min)

echo ============================================================
echo       Jobs.ge Parser - SCHEDULED MODE (Every 60 minutes)
echo ============================================================
echo.
echo Press Ctrl+C to stop the scheduler.
echo.

cd /d "%~dp0"

:: Install dependencies
python -m pip install -q requests beautifulsoup4 schedule 2>nul

:: Run with 60 minute schedule
python jobs_parser.py --schedule 60 --export
