# Build de producción — Android AAB para Google Play Store

## Archivos de entorno

| Archivo | Propósito | ¿Se commitea? |
|---|---|---|
| `.env` | Configuración activa (QA por defecto) | ❌ gitignored |
| `.env.production` | Valores de producción | ❌ gitignored |
| `.env.example` | Plantilla vacía de referencia | ✅ sí |

> Ambos `.env` y `.env.production` están cubiertos por la regla `.env*` del `.gitignore`.
> Nunca subas credenciales al repositorio.

---

## Generar el AAB de producción (método recomendado)

```bash
bash scripts/build-android-prod.sh
```

El script:
1. Hace backup del `.env` de QA
2. Copia `.env.production` como `.env` activo
3. Ejecuta `expo export:embed --dev false` (bundle de JS sin Metro)
4. Ejecuta `./gradlew bundleRelease`
5. Restaura el `.env` de QA automáticamente

El AAB queda en:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Pasos manuales (si no usas el script)

```bash
# 1. Activar env de producción
cp .env .env.qa.bak
cp .env.production .env

# 2. Generar bundle JS
npx expo export:embed \
  --platform android \
  --entry-file node_modules/expo/AppEntry.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res \
  --dev false

# 3. Compilar AAB
cd android && ./gradlew bundleRelease

# 4. Restaurar env QA
cd .. && mv .env.qa.bak .env
```

---

## Subir a Google Play Console

### Restricción de clave de subida

> A partir del **28 de junio de 2026 a las 5:21 AM UTC**, la clave de subida cambia.
> No es posible subir nuevos bundles hasta que la nueva clave esté activa.

### Pasos en Play Console (después del 28 de junio)

1. Ir a: **Probar y publicar → Pruebas → Prueba cerrada → Alpha**
2. Click **"Crear nueva versión"**
3. Subir el archivo `app-release.aab`
4. Llenar el campo "Novedades de esta versión" (opcional para alpha)
5. Click **"Guardar"** → **"Revisar versión"**
6. Verificar que no haya errores bloqueantes
7. Click **"Enviar a Google para revisión"**

### Tiempo de revisión

- Prueba cerrada (alpha): **1–3 días hábiles**
- Producción: **3–7 días hábiles**

---

## Incrementar versión antes de cada subida

Cada nueva subida a Play Console requiere un `versionCode` mayor. Edita `app.json`:

```json
"android": {
  "versionCode": 3,   // ← incrementar en 1 por cada nueva subida
  "version": "1.0.1"  // ← opcional, versión visible al usuario
}
```

El `versionCode` actual es `2` (el draft inicial fue `1`).

---

## Checklist pre-subida

- [ ] `.env.production` tiene todos los valores de producción
- [ ] `versionCode` en `app.json` es mayor al último subido
- [ ] Bundle generado con `--dev false` y `.env.production` activo
- [ ] AAB generado con `./gradlew bundleRelease`
- [ ] Esperar 28 de junio 5:21 UTC (si aplica key change)
- [ ] Subir AAB en Play Console → Crear nueva versión
- [ ] Enviar a revisión
