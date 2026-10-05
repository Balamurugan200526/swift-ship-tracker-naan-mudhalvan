@echo off
echo ============================================
echo   SwiftShip Tracker - Starting Application
echo ============================================

echo [1/3] Starting MongoDB...
if not exist "C:\data\db_swiftship" mkdir "C:\data\db_swiftship"
start "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db_swiftship" --bind_ip 127.0.0.1 --port 27017
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API (port 5000)...
start "SwiftShip Backend" cmd /k "cd /d "%~dp0server" && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (port 5173)...
start "SwiftShip Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo   Application is starting up!
echo ============================================
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000/api
echo.
echo   Admin:    admin@swiftship.com    / Admin@123
echo   Agent:    agent1@swiftship.com   / Agent@123
echo   Customer: customer1@swiftship.com / Customer@123
echo   Support:  support@swiftship.com  / Support@123
echo ============================================
pause
