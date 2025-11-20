@echo off
echo ==========================================
echo   Railway Simulation - Local Environment
echo ==========================================
echo.
echo Starting backend and frontend services...
echo.

REM Start backend API in background
echo [1/2] Starting FastAPI backend on port 8001...
start "Backend API" cmd /k "cd /d %~dp0 && python -m uvicorn data.api.gestor_alimentos_api:app --host 0.0.0.0 --port 8001 --reload"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in background
echo [2/2] Starting Vite frontend on port 5173...
start "Frontend Dev" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ==========================================
echo   Services started successfully!
echo ==========================================
echo.
echo Backend API:  http://localhost:8001
echo Frontend:     http://localhost:5173
echo API Docs:     http://localhost:8001/docs
echo.
echo Press any key to stop all services...
pause > nul

REM Kill all related processes
taskkill /FI "WindowTitle eq Backend API*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Frontend Dev*" /T /F > nul 2>&1

echo.
echo All services stopped.
pause
