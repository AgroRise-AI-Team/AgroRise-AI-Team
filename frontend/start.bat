@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo Starting React Development Server...
echo.
call npm run dev
if errorlevel 1 (
  echo.
  echo Server stopped or encountered an error.
  pause
)
