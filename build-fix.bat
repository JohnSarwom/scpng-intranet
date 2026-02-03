@echo off
echo =========================================
echo Building Unitopia Hub Production Build
echo =========================================

echo.
echo Step 1: Making sure all dependencies are installed...
call npm install

echo.
echo Step 2: Lint check to detect potential errors...
call npm run lint -- --fix

echo.
echo Step 3: Pre-build cleanup...
if exist dist (
  echo Cleaning existing build files...
  rmdir /s /q dist
)

echo.
echo Step 4: Building production bundle...
call npm run build

if %errorlevel% neq 0 (
  echo.
  echo Build failed with error level %errorlevel%
  echo Please check the error messages above.
  exit /b %errorlevel%
)

echo.
echo =========================================
echo Build completed successfully!
echo The build files are in the dist/ folder
echo =========================================

exit /b 0 