# Echoes Launcher Script for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Amber
Write-Host "  Echoes - The Offline Memory Keeper Launcher" -ForegroundColor Yellow
Write-Host "  Some voices deserve to live forever." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Amber

$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n[1/3] Checking Local Ollama Status..." -ForegroundColor White
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Ollama is online with $($ollamaCheck.models.Count) local model(s)." -ForegroundColor Green
} catch {
    Write-Host "! Ollama daemon is not yet responding. Built-in BM25 vault search will be active." -ForegroundColor Yellow
    Write-Host "  To enable full local LLM inference: open a terminal and run 'ollama serve'" -ForegroundColor Gray
}

Write-Host "`n[2/3] Launching FastAPI Backend (Port 8000)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[3/3] Launching Vite Frontend (Port 5173)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host "`n✓ Both services launched! Visit: http://localhost:5173" -ForegroundColor Green
