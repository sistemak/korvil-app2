#!/usr/bin/env bash
set -euo pipefail

echo "══════════════════════════════════════════"
echo "  KORVIL APP — SETUP AUTOMÁTICO"
echo "══════════════════════════════════════════"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 1. Garante que .env existe
if [ ! -f .env ]; then
  echo "[1/4] Copiando .env.example -> .env"
  cp .env.example .env
  echo "  Edite .env com suas credenciais reais antes de subir."
  echo "  Depois rode novamente: ./scripts/setup.sh"
  exit 0
fi

echo "[1/4] .env já existe — usando credenciais atuais"

# 2. Instala dependências (para desenvolvimento local)
if [ ! -d node_modules ]; then
  echo "[2/4] Instalando dependências (npm install)..."
  npm install
else
  echo "[2/4] node_modules já existe — pulando"
fi

# 3. Verifica Docker
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  echo "[3/4] Docker detectado — subindo container..."
  docker compose up -d --build
  echo ""
  echo "✓ Projeto rodando em http://localhost:3000"
  echo "  Para parar:  docker compose down"
  echo "  Para ver logs: docker compose logs -f"
else
  echo "[3/4] Docker não encontrado — modo dev local"
  echo "  Rodando: npm run build && npm run preview"
  npm run build
  echo "✓ Build pronto em dist/"
  echo "  Para servir: npm run preview"
fi

echo ""
echo "[4/4] Pronto! O projeto é portátil:"
echo "  - Copie a pasta inteira para qualquer máquina"
echo "  - Rode: ./scripts/setup.sh  (ou docker compose up)"
echo "  Tudo já vem configurado no .env"
echo "══════════════════════════════════════════"
