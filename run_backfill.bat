@echo off
chcp 65001 >nul
title Jobs.ge - Backfill Missing Bodies

echo ============================================================
echo          Fetching body content for jobs missing it
echo ============================================================
echo.

cd /d "%~dp0"

python jobs_parser.py --backfill-bodies

echo.
echo Done!
pause
