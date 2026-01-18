@echo off
chcp 65001 >nul
title Jobs.ge - Statistics

cd /d "%~dp0"

python jobs_parser.py --stats

pause
