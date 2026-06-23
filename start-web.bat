@echo off
echo.
echo ============================================
echo  DOOKKI LIVE BOARD - Starting Web App
echo ============================================
echo.
cd /d "%~dp0web"
npm run dev
pause
