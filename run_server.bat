@echo off
chcp 65001 >nul
title Jobs.ge - API Server with Dashboard

echo ============================================================
echo          Starting Jobs.ge API Server v3.0
echo ============================================================
echo.

cd /d "%~dp0"

echo Open your browser to: http://localhost:8080/
echo.
echo Dashboard:     http://localhost:8080/
echo Prometheus:    http://localhost:8080/metrics
echo API:           http://localhost:8080/api/dashboard
echo.

python server.py --host 127.0.0.1 --port 8080

pause
