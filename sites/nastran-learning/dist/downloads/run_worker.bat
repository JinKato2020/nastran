@echo off
setlocal EnableExtensions DisableDelayedExpansion
set "CASE_NAME=%~1"
set "OUT_DIR=%~2"
if not defined NASTRAN goto bad_worker
if not defined INPUT goto bad_worker
if not defined OUT_DIR goto bad_worker
if not exist "%OUT_DIR%\scratch\" goto bad_worker
if /i not "%CASE_NAME%"=="case_A" if /i not "%CASE_NAME%"=="case_B" goto bad_worker
pushd "%~dp0%CASE_NAME%"
if errorlevel 1 goto bad_worker
"%NASTRAN%" "%INPUT%" smp=%SMP% dmp=%DMP% memory=max memorymax=%MEMORY_GB%gb pause=no scratch=yes "out=%OUT_DIR%\model" "sdir=%OUT_DIR%\scratch" > "%OUT_DIR%\console.txt" 2>&1
set "RC=%ERRORLEVEL%"
> "%OUT_DIR%\launcher_exit.txt" echo %RC%
popd
echo %CASE_NAME% launcher returned %RC%. Check its F06 and LOG.
exit /b %RC%
:bad_worker
echo ERROR: Start this worker through run_in_order.bat or run_two_parallel.bat.
exit /b 7
