# MEDA — Auditoría y rediseño de UI/UX (alineación a Binance)

> Documento de trabajo para Claude Code.
> Objetivo: auditar el diseño actual de la app móvil MEDA y mejorar su **usabilidad**,
> apegándose al **lenguaje UI y, sobre todo, a los patrones de UX de Binance**, sin
> romper la identidad de marca de MEDA (ámbar + negro, light/dark).

---

## 0. Contexto del proyecto

- **Producto:** app móvil de MEDA (IFPE regulada en México). Billetera de fondos de
  pago electrónico: saldo, envíos SPEI vía STP, recepción por CLABE, KYC/onboarding,
  beneficiarios, perfil.
- **Stack:** Expo (React Native), bundle `com.medafintech`. Hoy corre en Expo Go
  (se ve el diálogo nativo de "Allow Expo Go..." en onboarding → migrar a dev client /
  build standalone para producción).
- **Temas:** ya existen **light y dark mode**. Ambos deben tratarse como ciudadanos de
  primera clase; nada hardcodeado a un solo tema.
- **Idioma de la app:** español (México).

### Reglas duras (no negociables)

1. **No tocar datos reales / PII.** En la app hay CURP, CLABE, UUID de cuenta,
   beneficiarios reales, teléfonos. Para cualquier ejemplo, mock, fixture, story o
   captura usar **solo datos ficticios**. Nunca commitear PII.
2. **Trabajar en rama dedicada.** Ver §1.
3. **No cambiar lógica de negocio ni contratos de API** salvo lo necesario para el
   manejo de errores de UI (§6). Esto es una auditoría de **diseño/UX**, no un refactor
   funcional.
4. **Accesibilidad mínima:** focus visible en teclado, `accessibilityLabel` en
   controles, contraste AA, `reduce motion` respetado, touch targets ≥ 44×44.

---

## 1. Estrategia de rama y entrega

```bash
git checkout -b design/binance-ux-audit
```

- Trabajar por commits pequeños y temáticos (un commit por sección del §5 / §7).
- **No** mezclar la migración de tokens con cambios de flujo en el mismo commit.
- Entregar al final:
  1. PR con descripción que enlace cada cambio a la sección de este doc.
  2. Un archivo `DESIGN_AUDIT_FINDINGS.md` en la raíz con: hallazgos encontrados en el
     código (no solo los listados aquí), antes/después por pantalla, y deuda pendiente.
  3. Tabla de tokens final (light + dark) en `theme/` (ver §3).

### Orden de ejecución recomendado

1. Inventario real del código (§2).
2. Sistema de tokens + theming light/dark (§3).
3. Tipografía, espaciado, radios, sombras (§3).
4. Consolidación de componentes base (§4).
5. **Rediseño del flujo de transacción** ← mayor prioridad de UX (§5).
6. Manejo de errores y estados (§6).
7. Pulido por pantalla (§7).
8. Checklist de aceptación (§9).

---

## 2. Inventario previo (hacer antes de tocar nada)

Antes de proponer cambios, Claude Code debe **mapear lo que ya existe** y documentarlo en
`DESIGN_AUDIT_FINDINGS.md`:

- Lista de componentes UI actuales y dónde se repiten (ej. balance card, transaction row,
  teclado NIP, inputs, chips, botón primario).
- Cómo se resuelve hoy el theming (¿context? ¿hook? ¿valores hardcodeados?).
- Dónde hay colores/espaciados/typography en literal vs token.
- Dónde se muestran errores de red al usuario.
- Identificar duplicación (mismo componente reimplementado en varias pantallas).

> Regla: **no reinventar lo que ya está bien**. La balance card, la transaction row y el
> teclado custom de NIP ya son buenos patrones; el trabajo es **parametrizarlos y
> reutilizarlos**, no reescribirlos desde cero.

---

## 3. Sistema de diseño: tokens

### 3.1 Principio

Definir **tokens semánticos** (no por color literal) en dos capas: `light` y `dark`.
Los componentes consumen tokens semánticos, nunca hex directos.

```
primitivos (hex)  →  tokens semánticos (light/dark)  →  componentes
```

### 3.2 Paleta (primitivos)

La marca MEDA usa un **ámbar cálido** (más cálido que el amarillo limón de Binance);
mantenerlo. Tomar de Binance la **estructura** (jerarquía de grises, densidad, neutrales
de fondo en dark), no el tono.

```
# Marca
amber-500   #F0B90B-ish  → ajustar al ámbar real de MEDA (extraer del logo/diseño actual)
amber-400   (hover/active claro)
amber-600   (pressed)

# Neutrales light
white       #FFFFFF
gray-50     #F5F5F5   (fondos de input)
gray-100    #EEEEEE   (divisores)
gray-400    #9A9A9A   (placeholder / texto terciario)
gray-700    #4A4A4A   (texto secundario)
black-900   #0B0B0B   (texto primario)

# Neutrales dark (estilo Binance: NO negro puro, grises azulados/cálidos)
bg-dark-900 #1E2026   (fondo base)
bg-dark-800 #2B3139   (superficie / card)
bg-dark-700 #363B44   (input / elevado)
text-dark-hi #EAECEF
text-dark-lo #848E9C

# Semánticos de estado
success     #16A34A   (ya usado en "Envío exitoso")
danger      #D33     (errores, "Eliminar")
warning     amber
```

> **Acción:** extraer los hex reales del código/diseño actual y registrarlos; los de
> arriba son referencia, no verdad absoluta.

### 3.3 Tokens semánticos (definir ambos temas)

| Token                  | Uso                                  |
|------------------------|--------------------------------------|
| `bg.base`              | fondo de pantalla                    |
| `bg.surface`           | tarjetas, sheets                     |
| `bg.input`             | campos de formulario                 |
| `bg.elevated`          | menús, dropdowns                     |
| `text.primary`         | títulos, montos                      |
| `text.secondary`       | labels, subtítulos                   |
| `text.tertiary`        | placeholders, hints                  |
| `text.onBrand`         | texto sobre ámbar (negro)            |
| `border.subtle`        | divisores                            |
| `border.focus`         | borde activo (ámbar)                 |
| `brand.solid`          | botón primario / héroe               |
| `brand.muted`          | chips activos, fondos suaves         |
| `state.success/danger/warning` | toasts, validaciones         |

### 3.4 Tipografía

Definir **una sola escala** y usarla en todas las pantallas (hoy hay densidad dispar).

| Rol            | Tamaño | Peso     | Uso                                   |
|----------------|--------|----------|---------------------------------------|
| `display`      | 40–56  | 700      | **monto en flujo de dinero** (§5)     |
| `h1`           | 28–32  | 700      | título de pantalla ("Tus datos")      |
| `h2`           | 20–22  | 600      | secciones                             |
| `body`         | 16     | 400/500  | texto base, inputs                    |
| `label`        | 13–14  | 500      | labels de campo, eyebrows             |
| `caption`      | 12     | 400      | timestamps, hints, "Vía STP"          |
| `mono`         | 16     | 500      | **CLABE, claves de rastreo, montos**  |

> Binance usa **tabular/monospace para números financieros**. Aplicar `fontVariant:
> ['tabular-nums']` (o fuente mono) a montos, CLABE, claves de rastreo y saldos para que
> no "bailen" al actualizarse.

### 3.5 Espaciado, radio, sombra

- **Escala de espaciado** base 4: `4, 8, 12, 16, 20, 24, 32, 40`. Nada fuera de escala.
- **Radio:** definir `radius.sm=8`, `radius.md=12`, `radius.lg=16`, `radius.pill=999`.
  Hoy conviven inputs muy redondeados con cards menos redondeadas → unificar.
- **Sombra/elevación:** en light, sombras suaves; en dark, **elevación por color de
  superficie** (Binance casi no usa sombra en dark, usa `bg.surface` más claro).

---

## 4. Componentes base a consolidar

Crear/normalizar estos componentes y reemplazar las copias dispersas:

1. **`<BalanceCard>`** — un solo componente con prop `actions: Action[]` para soportar las
   3 variantes vistas (Inicio = 4 acciones, Mi Billetera = 2, Mis gastos = modo "total").
2. **`<TransactionRow>`** — usada en Inicio, Mis gastos, Mi Billetera, Notificaciones.
   Props: `direction (in/out)`, `title`, `subtitle`, `amount`, `timestamp`. Monto en mono.
3. **`<AmountKeypad>`** — extraer el teclado custom del NIP y **reutilizarlo para capturar
   montos** (§5). Es la pieza clave para arreglar transaccionar.
4. **`<TextField>`** — input unificado (icono izq, label, estado focus/error, helper text).
   Hoy varios inputs casi iguales reimplementados.
5. **`<ChipGroup>`** — para opciones cortas (género, nacionalidad, porcentaje, perfil
   transaccional). Estado activo = `brand.muted` + borde ámbar.
6. **`<FullScreenPicker>`** — para listas largas con búsqueda (ocupación, colonia, banco).
   Unificar el estilo (hoy hay dos variantes visuales).
7. **`<BottomSheet>` y `<Dialog>`** — decidir **un criterio único**:
   - Bottom sheet → acciones contextuales y selección.
   - Dialog centrado → confirmaciones bloqueantes / estados de sistema (sesión expirada).
8. **`<Toast>` / `<InlineError>`** — único sistema de feedback (§6).
9. **`<PrimaryButton>` / `<SecondaryButton>` / `<TextButton>`** — estados loading,
   disabled y pressed bien definidos. El CTA primario nunca debe quedar "flotando" solo
   en pantallas vacías (§7).

---

## 5. PRIORIDAD #1 — Rediseño del flujo de transacción (UX Binance)

> Este es el cambio de mayor impacto. El usuario reportó que **transaccionar no se siente
> cómodo**: el monto se mezcla con datos administrativos, no ve su saldo, y el NIP tapa el
> contexto. Binance resuelve esto separando claramente cada decisión.

### 5.1 Problemas actuales (SPEI a terceros)

- El monto (`$0.00`) se captura en un input chico **junto a** CLABE, banco, beneficiario,
  email y concepto. La decisión más importante compite con 5 campos.
- **El saldo disponible nunca está visible** durante el envío. El usuario opera a ciegas.
- En "Confirmar envío", el **bottom sheet del NIP sube y tapa** el resumen → al autorizar
  dinero no ves bien cuánto ni a quién.

### 5.2 Flujo objetivo (patrón Binance)

```
[1 Destinatario] → [2 Monto] → [3 Confirmar] → [4 NIP] → [5 Éxito]
```

**Paso 1 — Destinatario** (solo "a quién"):
- CLABE destino, banco (auto-detectable desde la CLABE), nombre, email/concepto opcional.
- NO pedir monto aquí. CTA: "Continuar".

**Paso 2 — Monto** (pantalla dedicada, el monto es el héroe):
```
┌─────────────────────────────┐
│        Enviar a              │
│        Esther Sando         │  ← contexto del destinatario, fijo arriba
│                             │
│         $ 1,250.00          │  ← display 40–56px, mono, centrado (HÉROE)
│                             │
│   Disponible: $3,470.00     │  ← SALDO SIEMPRE VISIBLE  +  [ MAX ]
│                             │
│   (validación inline)       │  ← si monto > saldo: número en rojo, CTA disabled
│                             │
│   [ teclado numérico custom ]  ← AmountKeypad (§4.3), NO el del sistema
│                             │
│   [        Continuar       ]│
└─────────────────────────────┘
```
- Reusar `<AmountKeypad>`. Cada dígito se refleja arriba en grande; **nada se tapa**.
- Botón **MAX** que llena el saldo disponible.
- Validación en vivo (saldo insuficiente, monto 0, límites IFPE/perfil transaccional).

**Paso 3 — Confirmar** (resumen limpio, sin nada encima):
- Monto grande arriba, beneficiario, CLABE, cargo por transacción, total.
- CTA "Enviar".

**Paso 4 — NIP** (autorización):
- **Full-screen**, NO bottom sheet que tape. El monto y el destinatario permanecen
  **100% visibles y legibles** (nunca atenuados ni cubiertos) mientras se teclea el NIP.
- Usar 6 cajitas estilo OTP o el teclado custom con el resumen fijo arriba.

**Paso 5 — Éxito:**
- Mantener la pantalla actual (check verde, # transacción, clave de rastreo) — está bien.
- Unificar su data con "Detalle del movimiento" (hoy comparten estructura duplicada →
  un solo `<TransactionDetail>`).

### 5.3 Regla de oro

> En cualquier momento en que el usuario decide o autoriza dinero, **el "cuánto" y el "a
> quién" deben estar visibles, en grande y sin obstrucción**. Saldo disponible visible
> siempre que se captura un monto.

### 5.4 Aplica también a "Abonar / Recepción SPEI"

La pantalla de recepción (CLABE para abonar) se siente vacía: agregar acciones útiles
(copiar CLABE con feedback, compartir, QR) y mostrar el saldo actual para dar contexto.

---

## 6. Manejo de errores y estados (crítico para producción regulada)

### 6.1 Nunca mostrar errores crudos del backend

Se observaron en pantalla:
- `[API] POST /public/register/v2 -> 400 {"status":...}`
- `[Armor] Object reference not set to an instance of an object.` (null-ref de .NET)

**Acción:**
- Crear una capa de mapeo de errores: `errorCode → mensaje legible en español`.
- Mensajes en la voz de la interfaz, accionables: qué pasó + qué hacer. Sin disculpas
  genéricas, sin jerga, sin stack traces.
  - Ej: en vez de `400`, → "No pudimos crear tu cuenta. Revisa tus datos e inténtalo de
    nuevo." (+ detalle de campo si el backend lo da).
- Loggear el error técnico a observabilidad (Sentry/console en dev), **no** a la UI.
- Asegurar que los toasts de dev (los de Expo) **no** aparezcan en builds de producción.

### 6.2 Estados vacíos, carga y skeletons

- Toda lista (transacciones, beneficiarios, notificaciones) necesita **empty state** con
  invitación a actuar, no una pantalla en blanco.
- Estados de carga con **skeletons** (no spinners a pantalla completa) en saldo,
  transacciones y detalle.

### 6.3 Expo Go vs build

- El diálogo "Allow **Expo Go**..." en onboarding confirma ejecución en Expo Go.
- Para el listing de Play Store, usar **dev client / build standalone** para que los
  permisos digan "MEDA" y la experiencia sea la de producción.

---

## 7. Pulido por pantalla

> Para cada una: aplicar tokens, escala tipográfica y espaciado; eliminar aire muerto;
> dar jerarquía. El "vacío de UI" que se percibe casi siempre es **falta de jerarquía
> intermedia**, no exceso de minimalismo.

- **Login** (se ve "vacío"): la marca está bien, pero hay un hueco enorme entre el input
  y el CTA. Opciones (estilo Binance, sin recargar):
  - Anclar el CTA abajo y subir el input dentro de un bloque con más presencia
    (selector de lada `+52`, ayuda contextual debajo del campo).
  - Añadir una franja de confianza discreta (ej. "Regulado como IFPE", icono de
    seguridad) que llene el espacio con **contexto útil**, no decoración.
  - Considerar acceso biométrico para usuarios recurrentes.
- **Inicio:** jerarquía clara saldo → acciones → transacciones; el "Ver todas" debe llevar
  a la lista completa con filtros.
- **Mis gastos / Mi Billetera:** reusar `<TransactionRow>` y `<TransactionDetail>` únicos.
- **Onboarding/KYC:** ya es buen flujo; solo unificar pickers (§4.6), chips (§4.5) y la
  escala tipográfica. Añadir indicador de progreso (paso X de N) — Binance siempre te dice
  dónde estás en un flujo largo.
- **Términos / permisos:** limpiar errores de dev (§6); el CTA "Crear cuenta" no debe
  quedar solo en una pantalla casi vacía.
- **Drawer de cuenta:** consistente con tokens; ok.

---

## 8. Principios de UX de Binance a seguir (resumen accionable)

1. **Una decisión por pantalla** cuando la decisión pesa (monto, autorización).
2. **El número financiero es el héroe** y siempre legible; mono/tabular para no "bailar".
3. **Contexto persistente al operar:** saldo y destino visibles mientras decides/autorizas.
4. **Teclado numérico propio** para montos y NIP (control total del layout, nada tapado).
5. **Feedback inmediato e inline** (validación en vivo, no al siguiente paso).
6. **Densidad con jerarquía:** llenar el espacio con información útil, no con aire ni
   decoración. Minimalismo = precisión, no vacío.
7. **Consistencia total** de vocabulario y componentes: el botón "Enviar" produce un toast
   "Enviado"; un mismo patrón se ve igual en toda la app.
8. **Dark mode de primera clase**, neutrales por superficie, no negro puro.

---

## 9. Checklist de aceptación

- [ ] Inventario del código documentado en `DESIGN_AUDIT_FINDINGS.md`.
- [ ] Tokens semánticos light + dark en `theme/`; cero hex hardcodeados en componentes.
- [ ] Una sola escala tipográfica y de espaciado aplicada en todas las pantallas.
- [ ] Componentes base consolidados (§4); copias duplicadas eliminadas.
- [ ] **Flujo de transacción rediseñado** (§5): monto en pantalla dedicada, saldo siempre
      visible, teclado custom, NIP full-screen sin tapar contexto.
- [ ] Botón MAX y validación inline de saldo insuficiente.
- [ ] Cero errores crudos del backend en UI; mapeo de errores legible (§6.1).
- [ ] Empty states + skeletons en listas y saldo.
- [ ] A11y: focus visible, labels, contraste AA, targets ≥44, reduce-motion.
- [ ] Ningún dato real/PII en mocks, fixtures, stories ni capturas.
- [ ] Light y dark verificados en cada pantalla modificada.
- [ ] PR con cada cambio enlazado a su sección de este documento.

---

## 10. Fuera de alcance (no hacer en esta rama)

- Refactor de lógica de negocio o cambios de contrato de API (más allá del mapeo de
  errores de UI).
- Nuevas funcionalidades no relacionadas con diseño/UX.
- Cambiar la identidad de marca (el ámbar de MEDA se conserva; se adopta la **estructura**
  de Binance, no su tono).
