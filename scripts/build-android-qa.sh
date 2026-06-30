#!/usr/bin/env bash
# Genera el APK de release para QA (emulador/dispositivo físico).
# Oculta .env.production durante el bundle para que Expo use solo .env (QA).
# Uso: bash scripts/build-android-qa.sh
# Opciones:
#   --no-install  Solo construye, no instala en el emulador

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_PROD="$ROOT/.env.production"
ENV_PROD_BAK="$ROOT/.env.production.qa-bak"
NO_INSTALL=false

for arg in "$@"; do
  [[ "$arg" == "--no-install" ]] && NO_INSTALL=true
done

# Ocultar .env.production para que expo no lo cargue con prioridad sobre .env
if [ -f "$ENV_PROD" ]; then
  echo "→ Ocultando .env.production para que Expo use solo .env (QA)..."
  mv "$ENV_PROD" "$ENV_PROD_BAK"
fi

restore_prod_env() {
  if [ -f "$ENV_PROD_BAK" ]; then
    mv "$ENV_PROD_BAK" "$ENV_PROD"
    echo "→ .env.production restaurado."
  fi
}
trap restore_prod_env EXIT

echo "→ Generando bundle de JavaScript (QA, --dev false)..."
npx expo export:embed \
  --platform android \
  --entry-file node_modules/expo/AppEntry.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res \
  --dev false

echo "→ Compilando APK de release (QA)..."
cd "$ROOT/android"
./gradlew assembleRelease --rerun-tasks

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
SIZE=$(du -sh "$APK" | cut -f1)

echo ""
echo "✅ BUILD QA EXITOSO"
echo "   Archivo: $APK"
echo "   Tamaño:  $SIZE"
echo ""

if [ "$NO_INSTALL" = true ]; then
  echo "   (--no-install: omitiendo instalación)"
  exit 0
fi

ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"
DEVICE=$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1; exit}')
if [ -z "$DEVICE" ]; then
  echo "   ⚠️  No hay emulador/dispositivo conectado. Instala manualmente:"
  echo "   $ADB install -r \"$APK\""
  exit 0
fi

echo "→ Desinstalando versión anterior (evita conflicto de firma)..."
"$ADB" -s "$DEVICE" uninstall com.medafintech 2>/dev/null || true

echo "→ Instalando en $DEVICE..."
"$ADB" -s "$DEVICE" install "$APK"
echo "✅ Instalado. Abre la app en el emulador."
echo ""
echo "📋 Para ver logs en tiempo real:"
echo "   $ADB logcat -s ReactNativeJS:V"
