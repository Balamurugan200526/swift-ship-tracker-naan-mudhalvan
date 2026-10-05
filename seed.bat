@echo off
echo ============================================
echo   SwiftShip Tracker - Re-seeding Database
echo ============================================

echo Checking MongoDB is running on port 27017...
netstat -ano | findstr ":27017" >nul 2>&1
if errorlevel 1 (
  echo Starting MongoDB first...
  if not exist "C:\data\db_swiftship" mkdir "C:\data\db_swiftship"
  start "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db_swiftship" --bind_ip 127.0.0.1 --port 27017
  timeout /t 4 /nobreak >nul
)

echo Running seed script...
cd /d "%~dp0server"
npx ts-node-dev --transpile-only src/seed/seed.ts

echo.
echo Seed complete! Start the app with start.bat
pause
