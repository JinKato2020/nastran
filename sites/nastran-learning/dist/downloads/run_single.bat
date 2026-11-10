@echo off
setlocal EnableExtensions DisableDelayedExpansion
set "NASTRAN=C:\YOUR_NASTRAN\bin\YOUR_LAUNCHER.exe"
set "INPUT=model.bdf"
set "SMP=4"
set "DMP=0"
set "MEMORY_GB=4"
set "RUN_DIR=%~dp0runs\trial01_single"
if not exist "%NASTRAN%" goto missing_launcher
if exist "%RUN_DIR%" goto existing_run
if not exist "%~dp0%INPUT%" goto missing_input
mkdir "%RUN_DIR%\scratch"
if errorlevel 1 goto folder_error
pushd "%~dp0"
if errorlevel 1 goto folder_error
"%NASTRAN%" "%INPUT%" smp=%SMP% dmp=%DMP% memory=max memorymax=%MEMORY_GB%gb pause=no scratch=yes "out=%RUN_DIR%\model" "sdir=%RUN_DIR%\scratch" > "%RUN_DIR%\console.txt" 2>&1
set "RC=%ERRORLEVEL%"
> "%RUN_DIR%\launcher_exit.txt" echo %RC%
popd
echo Launcher returned %RC%. Check model.f06, model.log and console.txt.
exit /b %RC%
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
