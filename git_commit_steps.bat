@echo off
echo ==================================================
echo   Starting Step-by-Step Git Commits (EquipShare)  
echo ==================================================

echo.
echo [Step 1/8] Committing workspace root package configs...
git add package.json package-lock.json
git commit -m "chore: initialize project workspace root package configuration"

echo.
echo [Step 2/8] Committing backend package and dev scripts...
git add backend/package.json backend/package-lock.json backend/run.js
git commit -m "chore(backend): configure startup scripts, dev dependencies, and run wrapper"

echo.
echo [Step 3/8] Committing main backend server setup...
git add backend/app.js
git commit -m "feat(backend): configure main express server with background DB connection and CORS"

echo.
echo [Step 4/8] Committing backend auth routers...
git add backend/routers/auth/login.js backend/routers/auth/signup.js
git commit -m "feat(backend): implement separate auth routers for student signup and login"

echo.
echo [Step 5/8] Committing frontend configuration and files...
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/src/index.css
git commit -m "chore(frontend): configure initial frontend dependencies and index setups"

echo.
echo [Step 6/8] Committing frontend router definitions...
git add frontend/src/App.jsx
git commit -m "feat(frontend): set up client-side routes in App component"

echo.
echo [Step 7/8] Committing frontend authentication components...
git add frontend/src/components/
git commit -m "feat(frontend): integrate login and signup pages with backend endpoints"

echo.
echo [Step 8/8] Pushing all commits to remote branch...
git push

echo.
echo ==================================================
echo   Done! All 7 commits pushed successfully.        
echo ==================================================
