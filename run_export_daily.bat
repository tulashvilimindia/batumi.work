@echo off
chcp 65001 >nul
title Jobs.ge - Export Daily Files

echo ============================================================
echo      Exporting Daily JSON Files + Master Index
echo ============================================================
echo.
echo This will create:
echo   - data/daily/master_index_adjara.json (all jobs with date index)
echo   - data/daily/jobs_adjara_YYYY-MM-DD.json (one file per day)
echo.

cd /d "%~dp0"

python jobs_parser.py --export-daily --no-bodies

echo.
echo Check the data\daily\ folder for the export files.
pause
