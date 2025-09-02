@echo off
echo Starting Z3R Simulator Offline server on http://localhost:8000
echo Press Ctrl+C to stop the server
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    python3 -m http.server 8000
) else (
    python -m http.server 8000
)
pause
