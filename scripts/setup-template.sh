#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Arquivo .env criado a partir de .env.example"
else
  echo ".env já existe; pulando criação"
fi

if [ ! -d node_modules ]; then
  npm install
fi

echo "Setup concluído."
echo "Agora rode: npm run dev"
