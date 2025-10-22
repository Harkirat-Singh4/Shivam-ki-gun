@echo off
echo ==================================================
echo   AI SNIPER DETECTION SYSTEM - INTERFACE STARTUP
echo ==================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo [OK] Python found

REM Install requirements
echo.
echo Installing dependencies...
pip install -q -r requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo [OK] Dependencies installed

REM Check for model file
if exist "my_model.pt" (
    echo [OK] Model file found: my_model.pt
) else (
    echo [WARNING] Model file 'my_model.pt' not found. Running in DEMO MODE.
)

echo.
echo ==================================================
echo   STARTING SERVER...
echo ==================================================
echo.
echo Interface will be available at:
echo    http://localhost:5000
echo.
echo Press CTRL+C to stop the server
echo ==================================================
echo.

REM Start the Flask server
python app.py

pause
