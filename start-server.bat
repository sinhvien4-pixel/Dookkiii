@echo off
echo.
echo ============================================
echo  DOOKKI LIVE BOARD - Starting Backend Server
echo ============================================
echo.
cd /d "%~dp0server"
npx ts-node src/index.ts
pause
