#!/bin/bash

# Configuration
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "==========================================="
echo "   Gestion Cabinet - Démarrage en cours    "
echo "==========================================="

# Create shortcut automatically if it doesn't exist
SHORTCUT_FILE="$HOME/Desktop/GestionCabinet.desktop"
if [ ! -f "$SHORTCUT_FILE" ]; then
    echo "Initialisation : Création du raccourci sur le bureau..."
    ./create_shortcut.sh
fi

# Function to kill processes on exit
cleanup() {
    echo ""
    echo "Arrêt de l'application..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Start Backend
echo "[1/2] Lancement du Backend (Python)..."
cd "$BACKEND_DIR"
# Check if virtualenv exists, if not use global python
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python3 server.py > /dev/null 2>&1 &

# 2. Start Frontend
echo "[2/2] Lancement du Frontend (Vite)..."
cd "$FRONTEND_DIR"
npm run dev > /dev/null 2>&1 &

echo ""
echo "✅ Application lancée avec succès !"
echo "🌐 Accès : http://localhost:5173"
echo "-------------------------------------------"
echo "Gardez cette fenêtre ouverte pour maintenir l'application active."
echo "Appuyez sur Ctrl+C pour arrêter."

# Wait for background jobs
wait
