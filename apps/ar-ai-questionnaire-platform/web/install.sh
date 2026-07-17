#!/usr/bin/env bash
# Re-fetch HeroUI Pro after pnpm install (postinstall is gated by pnpm `onlyBuiltDependencies`).
# Reads HEROUI_AUTH_TOKEN from .env.local automatically.
set -euo pipefail

if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

if [ -z "${HEROUI_AUTH_TOKEN:-}" ]; then
  echo "HEROUI_AUTH_TOKEN not set. Add it to .env.local (kept out of git)."
  exit 1
fi

pnpm install
node node_modules/@heroui-pro/react/pre/postinstall/index.js
echo "✓ HeroUI Pro components fetched."
