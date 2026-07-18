@echo off
start "Backend" cmd /k "cd /d C:\Users\namrataba\OneDrive\Desktop\gym project\server && node server.js"
timeout /t 10 /nobreak >nul
start "Frontend" cmd /k "cd /d C:\Users\namrataba\OneDrive\Desktop\gym project\client && npx vite --host --port 3000"
echo.
echo ========================================
echo  FitLife Gym Management System
echo ========================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo.
echo  Login: admin@gym.com / admin123
echo ========================================
echo.
pause
