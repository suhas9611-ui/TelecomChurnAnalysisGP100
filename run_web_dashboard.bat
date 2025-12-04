@echo off
echo ========================================
echo   Customer Churn Dashboard
echo ========================================
echo.

REM Check if virtual environment exists
if exist "myvenv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call myvenv\Scripts\activate.bat
) else (
    echo No virtual environment found. Using system Python...
)

echo.
echo Starting Flask server...
echo.
echo The dashboard will be available at:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server.
echo.

python server.py

pause
