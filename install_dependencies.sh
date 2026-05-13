#!/bin/bash

echo "==========================================="
echo "   Installation des dépendances           "
echo "==========================================="

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Backend dependencies
echo "[1/2] Installation des dépendances Backend..."
cd "$PROJECT_ROOT/backend"
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    echo "❌ Erreur: Python/pip3 n'est pas installé."
fi

# 2. Frontend dependencies
echo "[2/2] Installation des dépendances Frontend..."
cd "$PROJECT_ROOT/frontend"
if command -v npm &> /dev/null; then
    npm install
else
    echo "❌ Erreur: Node.js/npm n'est pas installé."
fi

echo ""
echo "✅ Installation terminée !"
