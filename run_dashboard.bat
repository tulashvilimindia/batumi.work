@echo off
chcp 65001 >nul
title Jobs.ge - Analytics Dashboard

echo ============================================================
echo          Generating Analytics Dashboard
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Classifying jobs and generating metrics...
python dashboard.py

echo.
echo [2/3] Opening dashboard in browser...
start "" dashboard.html

echo.
echo [3/3] Dashboard generated and opened!
echo.
echo To view live updates, run: run_server.bat
echo Then open: http://localhost:8080/
echo.
pause
