@echo off
title VaanEye - Local Server
cd /d "%~dp0"
echo.
echo   VaanEye local server starting...
echo   Browser will open automatically.
echo   Close this window to stop the server.
echo.
start "" http://localhost:8080/index.html
python -m http.server 8080 2>nul || py -m http.server 8080
pause
