# Handoff — Publicar `com.medafintech` (Medá) en Google Play

Documento para continuar en **Claude Code**. Resume el estado real verificado en Play Console y los pasos pendientes. El `eas build` va al **final**: primero configuración, luego empaquetado.

---

## 0. Contexto y datos clave (verificados)

| Dato | Valor |
|---|---|
| Cuenta de organización | aplicaciones@meda.com.mx |
| ID de cuenta | 6260483831826971833 |
| App destino | **`com.medafintech`** ("Medá") |
| Estado actual | Borrador · Prueba interna **Activo / Sin revisar** (ya hay un build subido) |
| App content | 10 de 11 completadas |
| Play App Signing | **Activado** |

> **Decisión tomada:** NO se crea app nueva. Se usa `com.medafintech` que ya existe.

### Certificados (Play App Signing)
- **App signing key** (la guarda Google, NO se toca): SHA-256 termina en `...4A:65:14:0D:4B:60:8F:6B`
- **Upload key actual** (registrada por el CTO anterior, keystore probablemente perdido):
  - SHA-1: `6C:4E:5F:0A:43:F9:BA:79:A3:DF:A2:CE:90:B4:28:DF:A0:D0:D1:AE`
  - SHA-256: `E7:8E:C4:92:00:3F:AD:FE:B9:50:8D:B2:22:81:FF:49:12:82:A0:75:AE:5B:F0:78:28:27:31:AE:5E:6F:28:A5`

---

## ⚠️ Avisos importantes (leer antes de empezar)

1. **La app cambió de funcionalidad: ya NO hace "pago de servicios".** Las descripciones y capturas de la app de agentes (las moradas que dicen "PAGA SERVICIOS") **no se pueden reusar**. Hay que escribir descripción nueva y generar capturas nuevas que reflejen lo que la app hace HOY. → Confirmar con el equipo qué funciones tiene la versión nueva.
2. **El upload key lo manejaba alguien que ya salió (CTO anterior).** Hay que hacer **reset de upload key** y dejar el nuevo keystore **gestionado por EAS** (cuenta de la organización), no en una máquina personal, para no volver a quedar atrapados.
3. **Declaración de funciones financieras (Financial features):** obligatoria por ser fintech (IFPE). Verificar que esté completa en App content; podría ser el item 11/11 que falta.
4. **Acciones que debe hacer Saúl manualmente en el navegador** (no automatizables): aceptar políticas/términos, subir el `.pem`, subir el `.aab`, publicar versiones. Claude Code ayuda con el proyecto y el build, no opera Play Console.

---

## 1. Pendiente en el NAVEGADOR (Play Console) — no requiere build

### 1.1 Ficha principal de Play Store
Ruta: **Aumentar usuarios → Presencia en Google Play Store → Fichas de Play Store**

Campos obligatorios (`*`) que faltan:
- [ ] **Descripción breve** (máx 80) — texto nuevo SIN "pago de servicios"
- [ ] **Descripción completa** (máx 4000) — texto nuevo
- [ ] **Icono de la app** — PNG/JPEG, **512×512**, máx 1 MB (reemplaza el robot gris)
- [ ] **Gráfico de funciones** — PNG/JPEG, **1024×500**, máx 15 MB
- [ ] **Capturas de teléfono** — mínimo 2 (recomendado 4 de ≥1080×1080), 16:9 o 9:16, lados 320–3840 px
- [ ] **Capturas tablet 7"** y **tablet 10"** — aparecen como obligatorias en esta ficha; preparar al menos 2 de cada una

> Borrador de descripción (AJUSTAR a las funciones reales actuales; quitar lo que ya no aplica):
>
> **Breve:** `Recibe, envía y administra tu dinero de forma fácil, rápida y segura.`
>
> **Completa:**
> ```
> Con Medá manejas tu dinero sin complicaciones y de forma segura.
>
> ¿Qué puedes hacer con Medá?
> • Recibe o envía dinero de forma fácil y rápida.
> • Consulta tu saldo y tus movimientos en tiempo real.
> • Administra tu billetera desde un solo lugar.
> • Tu CLABE y número de cuenta siempre a la mano.
>
> Seguridad primero:
> Tus operaciones están protegidas con NIP y medidas de seguridad.
> ```

### 1.2 App content (cerrar 11/11)
Ruta: **Política y programas → Contenido de la app**
- [ ] Completar el item faltante
- [ ] **Financial features declaration** — declarar las funciones financieras reales; tener a la mano la autorización IFPE/CNBV por si Google pide documentación

---

## 2. Pendiente en CLAUDE CODE (proyecto Expo) — build al final

### 2.1 Configurar `app.json` / `app.config.js`
```jsonc
{
  "expo": {
    "version": "X.Y.Z",                    // versionName visible
    "android": {
      "package": "com.medafintech",        // OBLIGATORIO: este exacto
      "versionCode": <MAYOR_AL_ACTUAL>,    // ver nota abajo
      "adaptiveIcon": {                    // ícono del launcher = logo nuevo
        "foregroundImage": "./assets/icon-foreground.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [ /* solo las mínimas que use la app */ ]
    }
  }
}
```
> **versionCode:** debe ser mayor al del build que ya está en Prueba interna. Verificarlo en
> **Probar y publicar → Últimas versiones y app bundles** (o dentro de Prueba interna). Anotar ese número y subirle +1.

### 2.2 Configurar `eas.json`
```jsonc
{
  "build": {
    "production": {
      "android": { "buildType": "app-bundle" }   // genera .aab
    }
  }
}
```

### 2.3 Firma: generar keystore nuevo y resetear upload key
Como el upload key viejo se perdió:
```bash
npm i -g eas-cli
eas login
eas credentials        # Android → generar/gestionar keystore NUEVO en EAS (org)
```
Luego exportar el certificado público del nuevo upload key como `.pem`:
```bash
keytool -export -rfc -keystore upload-keystore.jks -alias upload -file upload_certificate.pem
```
(si EAS gestiona el keystore, descargarlo desde EAS o usar el comando que EAS indique para obtener el `.pem`)

**Acción en navegador (Saúl):** Play Console → la app → Protegida con Play → "Gestiona la firma de aplicaciones de Play" → **Solicitar cambio de la clave de subida**
- Motivo: **"Un desarrollador con acceso al almacén de claves ha dejado mi empresa"**
- Subir el `upload_certificate.pem`
- Enviar. Google lo procesa solo (no es a una persona); aprobación de horas a ~48 h.

> ✅ Checkpoint firma: tras la aprobación, el certificado de subida en Play debe coincidir con el SHA del keystore nuevo de EAS.

### 2.4 Empaquetar (ÚLTIMO PASO)
```bash
eas build:configure        # si falta
eas build -p android --profile production
```
Descargar el `.aab` del dashboard de EAS (https://expo.dev).

---

## 3. Verificación (Claude Code + Console)

### En terminal
```bash
# certificado con el que se firmó el bundle (debe coincidir con el upload key NUEVO)
jarsigner -verify -verbose -certs <archivo>.aab
```
- [ ] El SHA del `.aab` coincide con el upload key nuevo registrado en Play
- [ ] `versionCode` del build = el configurado y es mayor al anterior
- [ ] target API 35+ (Expo SDK reciente ya lo cumple)

### En navegador
- [ ] Subir el `.aab` a **Prueba interna → Crear nueva versión** (primera subida manual)
- [ ] Revisar **Registro previo / Pre-launch report** (crashes en dispositivos reales)
- [ ] Sin advertencias de política ni de target API
- [ ] Promover a **Producción** cuando todo esté en verde

---

## Resumen del orden recomendado
1. Navegador: completar ficha (texto + ícono + gráficos + capturas NUEVAS) y cerrar App content 11/11.
2. Claude Code: configurar `app.json` + `eas.json`, generar keystore nuevo en EAS.
3. Navegador: solicitar reset de upload key con el `.pem` → esperar aprobación de Google.
4. Claude Code: `eas build` (el .aab final).
5. Navegador: subir a Prueba interna → verificar pre-launch report → promover a Producción.
