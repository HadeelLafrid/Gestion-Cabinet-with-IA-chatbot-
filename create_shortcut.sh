#!/bin/bash

# Configuration
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DESKTOP_DIR="$HOME/Desktop"
SHORTCUT_FILE="$DESKTOP_DIR/GestionCabinet.desktop"

echo "Création du raccourci sur le bureau..."

# Create the .desktop file
cat <<EOF > "$SHORTCUT_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=Gestion Cabinet
Comment=Lanceur de l'application de Gestion de Cabinet
Exec=gnome-terminal -- bash -c "$PROJECT_ROOT/run.sh"
Icon=$PROJECT_ROOT/frontend/public/favicon.svg
Path=$PROJECT_ROOT
Terminal=false
Categories=Medicine;Office;
EOF

chmod +x "$SHORTCUT_FILE"
if command -v gio &> /dev/null; then
    gio set "$SHORTCUT_FILE" metadata::trusted true
fi

echo "✅ Raccourci créé avec succès sur le bureau !"
echo "Vous pouvez maintenant lancer l'application en double-cliquant sur 'Gestion Cabinet'."
