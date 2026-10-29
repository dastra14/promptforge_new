@echo off
echo ========================================================
echo           Starting PromptForge AI Studio
echo ========================================================
echo.
echo 1. Launching AI Module on port 5001...
start "PromptForge AI Module (5001)" cmd /k "cd ai-module && npm run dev"
timeout /t 2 /nobreak >nul

echo 2. Launching Backend on port 5000...
start "PromptForge Backend (5000)" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul

echo 3. Launching Frontend on port 5173...
start "PromptForge Frontend (5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  All services are running!
echo  Open http://localhost:5173 in your browser.
echo ========================================================
