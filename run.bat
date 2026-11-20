@echo off
title StockSmart - One-Click Launcher

echo ======================================================================
echo           StockSmart: Retail Inventory Optimization Platform
echo ======================================================================
echo.

cd /d "%~dp0"

:: --------------------------------------------------------------------
:: Step 1: Check Python and Virtual Environment
:: --------------------------------------------------------------------
echo [1/5] Checking Python Virtual Environment in backend\venv...
if not exist "backend\venv\Scripts\python.exe" (
    echo Virtual environment not found. Detecting system Python...
    where python >nul 2>&1
    if errorlevel 1 (
        where py >nul 2>&1
        if errorlevel 1 (
            echo.
            echo ERROR: Python is not installed or not in your system PATH.
            echo Please install Python 3.10+ from https://www.python.org/
            echo.
            pause
            exit /b 1
        ) else (
            py -3 -m venv backend\venv
        )
    ) else (
        python -m venv backend\venv
    )
    if errorlevel 1 (
        echo ERROR: Failed to create Python virtual environment.
        pause
        exit /b 1
    )

    echo Installing backend dependencies into backend\venv...
    backend\venv\Scripts\pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install Python dependencies.
        pause
        exit /b 1
    )
) else (
    echo Python virtual environment verified.
)

:: --------------------------------------------------------------------
:: Step 2: Check Supabase Database Connection and Migrations
:: --------------------------------------------------------------------
echo.
echo [2/5] Verifying Supabase Database Connection and Migrations...
if not exist "backend\.env" (
    if exist ".env" (
        copy /y ".env" "backend\.env" >nul
    ) else (
        echo Warning: backend\.env not found. Please ensure Supabase DATABASE_URL is configured.
    )
)

backend\venv\Scripts\python backend\manage.py migrate --noinput
if errorlevel 1 (
    echo.
    echo WARNING: Database migration returned an error.
    echo Please verify your Supabase database password and network connection.
    echo Continuing to seed step...
)

backend\venv\Scripts\python backend\manage.py seed_data --if-needed

:: --------------------------------------------------------------------
:: Step 3: Check Frontend Dependencies
:: --------------------------------------------------------------------
echo.
echo [3/5] Checking Frontend Dependencies in frontend\node_modules...
if not exist "frontend\node_modules" (
    echo Installing frontend packages with npm...
    cd frontend
    call npm install
    cd ..
    if errorlevel 1 (
        echo ERROR: npm install failed. Please verify Node.js is installed.
        pause
        exit /b 1
    )
) else (
    echo Frontend node_modules verified.
)

:: --------------------------------------------------------------------
:: Step 4: Clean up any stale processes on ports 8000 and 5173
:: --------------------------------------------------------------------
echo.
echo [4/5] Checking Local Ports (8000 and 5173)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: --------------------------------------------------------------------
:: Step 5: Launch Backend and Frontend Servers
:: --------------------------------------------------------------------
echo.
echo [5/5] Launching Servers...
echo   * Starting Django Backend on http://127.0.0.1:8000 ...
start "StockSmart - Django Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python manage.py runserver 127.0.0.1:8000"

echo   * Starting Vite React Frontend on http://localhost:5173 ...
start "StockSmart - React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo           StockSmart Servers Started Successfully!
echo ======================================================================
echo.
echo   [Web App]      http://localhost:5173/
echo   [API Docs]     http://127.0.0.1:8000/api/
echo   [Health Check] http://127.0.0.1:8000/api/health/
echo   [Admin Panel]  http://127.0.0.1:8000/admin/
echo   [Database]     Supabase PostgreSQL (aws-1-ap-southeast-2.pooler.supabase.com)
echo.
echo  Demo Credentials:
echo   - Admin:               admin           / StockSmart@2026
echo   - Warehouse Manager:   warehouse_mgr   / StockSmart@2026
echo   - Store Associate:     store_associate / StockSmart@2026
echo   - Inventory Auditor:   auditor_sunil   / StockSmart@2026
echo.
echo  Opening http://localhost:5173/ in your default browser...
echo.

ping 127.0.0.1 -n 4 >nul
start http://localhost:5173/

echo To terminate all StockSmart servers, close the open windows
echo or run stop.bat at any time.
echo.
pause
