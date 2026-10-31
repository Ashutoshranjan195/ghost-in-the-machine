@echo off
title Echoes Memory Keeper - Backend
echo ========================================================
echo   Starting Echoes Local Backend (FastAPI + SQLite)
echo ========================================================
cd /d "%~dp0\..\backend"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
