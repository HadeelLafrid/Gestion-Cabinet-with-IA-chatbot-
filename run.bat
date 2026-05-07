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

echo [1/2] Lancement du Backend...
start /D "%PROJECT_ROOT%backend" /B python server.py

echo [2/2] Lancement du Frontend...
start /D "%PROJECT_ROOT%frontend" /B npm run dev

echo.
echo ✅ Application lancée !
echo 🌐 Accès : http://localhost:5173
echo.
echo Gardez cette fenêtre ouverte. Pour arrêter, fermez-la.
pause