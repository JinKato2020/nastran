@echo off
setlocal EnableExtensions DisableDelayedExpansion
set "NASTRAN=C:\YOUR_NASTRAN\bin\YOUR_LAUNCHER.exe"
set "INPUT=model.bdf"
set "SMP=4"
set "DMP=0"
set "MEMORY_GB=4"
set "RUN_DIR=%~dp0runs\trial01_sequence"
if not exist "%NASTRAN%" goto missing_launcher
if exist "%RUN_DIR%" goto existing_run
if not exist "%~dp0run_worker.bat" goto missing_input
if not exist "%~dp0case_A\%INPUT%" goto missing_input
if not exist "%~dp0case_B\%INPUT%" goto missing_input
mkdir "%RUN_DIR%\case_A\scratch"
if errorlevel 1 goto folder_error
mkdir "%RUN_DIR%\case_B\scratch"
if errorlevel 1 goto folder_error
call "%~dp0run_worker.bat" "case_A" "%RUN_DIR%\case_A"
if not "%ERRORLEVEL%"=="0" goto child_error
call "%~dp0run_worker.bat" "case_B" "%RUN_DIR%\case_B"
if not "%ERRORLEVEL%"=="0" goto child_error
echo Both launcher calls returned. Check both F06 and LOG files.
exit /b 0
:child_error
echo ERROR: A job launch or call failed. Inspect each result folder.
exit /b 6
:missing_launcher
echo ERROR: Set NASTRAN to the installed launcher .exe.
exit /b 2
:existing_run
echo ERROR: Run folder exists. Use a new run name.
exit /b 3
:missing_input
echo ERROR: Check the input file and run_worker.bat if used.
exit /b 4
:folder_error
echo ERROR: Could not create or enter the working folder.
exit /b 5
