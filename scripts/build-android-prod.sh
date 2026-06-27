#!/usr/bin/env bash
# Genera el AAB de producción para Google Play Store.
# Usa .env.production como configuración durante el build y restaura .env al terminar.
# Uso: bash scripts/build-android-prod.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
ENV_PROD="$ROOT/.env.production"
ENV_BACKUP="$ROOT/.env.qa.bak"

if [ ! -f "$ENV_PROD" ]; then
  echo "ERROR: No se encontró .env.production en $ROOT"
  echo "Crea el archivo copiando .env.example y llenando los valores de producción."
  exit 1
fi

echo "→ Haciendo backup de .env (QA)..."
cp "$ENV_FILE" "$ENV_BACKUP"

cleanup() {
  echo "→ Restaurando .env (QA)..."
  mv "$ENV_BACKUP" "$ENV_FILE"
}
trap cleanup EXIT

echo "→ Activando .env.production..."
cp "$ENV_PROD" "$ENV_FILE"

echo "→ Generando bundle de JavaScript (--dev false)..."
npx expo export:embed \
  --platform android \
  --entry-file node_modules/expo/AppEntry.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res \
  --dev false

echo "→ Compilando AAB de release..."
cd "$ROOT/android"
./gradlew bundleRelease

AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
SIZE=$(du -sh "$AAB" | cut -f1)

echo ""
echo "✅ BUILD EXITOSO"
echo "   Archivo: $AAB"
echo "   Tamaño:  $SIZE"
echo ""
echo "El .env de QA fue restaurado automáticamente."
