@echo off
set PROJECT_ROOT=%~dp0
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Gestion Cabinet.lnk

echo ===========================================
echo    Gestion Cabinet - Démarrage (Windows)   
echo ===========================================

:: Create Desktop Shortcut if it doesn't exist
if not exist "%SHORTCUT_PATH%" (
    echo Création du raccourci sur le bureau...
    echo set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
    echo sLinkFile = "%SHORTCUT_PATH%" >> "%TEMP%\CreateShortcut.vbs"
    echo set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
    echo oLink.TargetPath = "%~f0" >> "%TEMP%\CreateShortcut.vbs"
    echo oLink.WorkingDirectory = "%PROJECT_ROOT%" >> "%TEMP%\CreateShortcut.vbs"
    echo oLink.Description = "Lancer Gestion Cabinet" >> "%TEMP%\CreateShortcut.vbs"
    echo oLink.IconLocation = "shell32.dll, 194" >> "%TEMP%\CreateShortcut.vbs"
    echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"
    cscript //nologo "%TEMP%\CreateShortcut.vbs"
    del "%TEMP%\CreateShortcut.vbs"
    echo ✅ Raccourci créé avec succès !
)

echo [0/3] Démarrage de Docker (Base de données)...
cd /D "%PROJECT_ROOT%"
docker-compose up -d
echo Attente de 5 secondes pour que la base de donnees soit prete...
timeout /t 5 /nobreak > NUL

echo [1/3] Initialisation de la base de donnees...
if not exist "%PROJECT_ROOT%backend\db_initialized.lock" (
    cd /D "%PROJECT_ROOT%backend"
    python -m pip install -r requirements.txt
    python -m alembic upgrade head
    python scripts\load_legacy_dump.py --dump-file ..\gestcab_anonymized.sql
    echo true > db_initialized.lock
    cd /D "%PROJECT_ROOT%"
    echo ✅ Base de donnees initialisee.
) else (
    echo ✅ Base de donnees deja initialisee.
)

echo [2/3] Lancement du Backend...
start /D "%PROJECT_ROOT%backend" /B python server.py

echo [3/3] Lancement du Frontend...
if not exist "%PROJECT_ROOT%frontend\node_modules" (
    echo Installation des dependances frontend...
    cd /D "%PROJECT_ROOT%frontend"
    call npm install
)
start /D "%PROJECT_ROOT%frontend" /B npm run dev

echo.
echo ✅ Application lancée !
echo 🌐 Accès : http://localhost:5173
echo.
echo Gardez cette fenêtre ouverte. Pour arrêter, fermez-la.
pause