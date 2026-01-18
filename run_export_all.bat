@echo off
chcp 65001 >nul
title Jobs.ge - Export All Active Jobs

echo ============================================================
echo          Exporting ALL active jobs for full sync
echo ============================================================
echo.

cd /d "%~dp0"

python jobs_parser.py --export-all

echo.
echo Check the data\ folder for the export file.
pause
