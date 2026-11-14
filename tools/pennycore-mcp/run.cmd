@echo off
setlocal
if exist "%ProgramFiles%\nodejs\node.exe" (
  "%ProgramFiles%\nodejs\node.exe" "%~dp0src\launcher.js"
) else (
  node "%~dp0src\launcher.js"
)
set "PENNYCORE_MCP_EXIT=%ERRORLEVEL%"
endlocal & exit /b %PENNYCORE_MCP_EXIT%
