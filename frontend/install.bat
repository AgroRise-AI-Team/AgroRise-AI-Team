@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo Installing dependencies...
echo.
call npm install
echo.
echo Done! You can now start the dev server by running start.bat or: npm run dev
pause
