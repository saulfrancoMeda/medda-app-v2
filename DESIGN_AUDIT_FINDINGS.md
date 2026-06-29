# DESIGN_AUDIT_FINDINGS — MedaApp v2 (Binance UX Audit)

Rama: `design/binance-ux-audit`  
Fecha inicio: 2026-06-27  
Doc de referencia: `DESIGN_AUDIT_MEDA.md`

---

## 1. Inventario de componentes actuales

### Design system (`src/ui/design-system/`)

| Componente | Variantes/props clave | Estado |
|---|---|---|
| `Text` | display, h1, h2, body, caption · tones: default, muted, brand, link, danger, success, inverse | ✅ Bien — usar siempre |
| `Button` | solid, soft, outline, ghost, link · sm/md/lg · loading/disabled | ✅ Bien — usar siempre |
| `Input` | label, leftIcon, rightSlot, error | ✅ Bien — falta token para height 56px |
| `Logo` | width/height | ✅ Ok |
| `GoldGradient` | radius, children | ✅ Ok |

### Componentes de feature (reutilizables de facto)

| Componente | Dónde vive | Dónde se usa |
|---|---|---|
| `BalanceCard` | wallet/components | StoreScreen, WalletScreen |
| `MovementRow` / `MovementGroupCard` | wallet/components/MovementRow | StoreScreen, WalletScreen, SalesScreen |
| `NipKeypad` | wallet/components | NipModal, CashOutNipScreen (**nuevo**) |
| `AmountKeypad` | wallet/components | CashOutSpeiAmountScreen (**nuevo**) |
| `BankPicker` | wallet/components | CashOutSpeiRecipientScreen |
| `MoneyInput` | wallet/components | CashOutMedaAmountScreen |
| `AppHeader` | navigation | todas las tabs |

### Duplicación encontrada

| Patrón duplicado | Instancias | Acción |
|---|---|---|
| `MethodRow` (icono + texto + chevron) | CashOutScreens, CashInScreens, StoreScreen | Pendiente: unificar en DS |
| `Row` (label: value) | CashOutScreens, StoreScreen | Pendiente: unificar |
| `CopyRow` | WalletScreen | Pendiente: usar MethodRow genérico |
| `groupByDate` + `MovementGroup` type | WalletScreen, SalesScreen, StoreScreen | ⚠️ Lógica duplicada — pendiente: mover a helper |

---

## 2. Sistema de tokens

**Estado:** 95% completo. Archivo: `src/ui/design-system/tokens/index.js`

**Paleta marca MEDA:**
- brand-400/500: `#FCD535` (ámbar/dorado)
- brand-700: `#97720A` (ámbar oscuro — iconos, texto de énfasis)
- neutral-0…950: escala completa de blancos/grises cálidos
- success: `#2E8C6A`, danger: `#C24A30`, warning: `#C9920A`

**Colores hardcodeados encontrados (~121 instancias):**

| Hex | Token equivalente | Archivos con más instancias |
|---|---|---|
| `#97720A` | `brand-700` | RegisterScreens (25+), CashOutScreens, BankPicker |
| `#1B1812` | `neutral-900` / `text-ink` | Button, BalanceCard, ToastProvider, MovementRow |
| `#9A9384` | `neutral-400` | Input, BankPicker, MovementRow, WalletScreen |
| `#2E8C6A` | `success` | MovementRow, CashOutScreens (TransactionSuccess) |
| `#FCD535` | `brand-500` | Button (ActivityIndicator), ToastProvider, NipKeypad |
| `#C24A30` | `danger` | Input (error border), AmountKeypad (overBalance color) |
| `#6C6555` | `neutral-500` | NipKeypad (backspace icon), DrawerContent |

**Pendiente:** reemplazar hex directos en componentes de UI con clases NativeWind o tokens semánticos.

---

## 3. Tipografía

**Escala definida en tokens:**

| Variante | Tamaño | Peso | Uso |
|---|---|---|---|
| display | 40px | 700 | Montos grandes (héroe) |
| h1 | 26px | 700 | Títulos de pantalla |
| h2 | 20px | 600 | Secciones |
| body | 16px | 400 | Texto base |
| caption | 12px | 400 | Labels, hints, timestamps |

**Problemas encontrados:**
- `SalesScreen` hardcodea `fontSize: 13` y `fontSize: 12` en inline style
- `WalletScreen` hardcodea `fontSize: 14` en `TextInput` style  
- Falta variante `label` (13–14px, 500) descrita en el doc de auditoría
- `fontVariant: ['tabular-nums']` no aplicado consistentemente en montos

---

## 4. Flujo de transacción — ANTES / DESPUÉS (§5)

### Antes (un solo formulario)
```
CashOutSpeiFormScreen
  ├─ CLABE
  ├─ Banco
  ├─ Nombre beneficiario
  ├─ Email (opcional)
  ├─ MoneyInput (monto) ← mezclado con datos admin
  ├─ Concepto
  └─ "Continuar" → CashOutConfirmScreen
         └─ NipModal (bottom sheet) ← TAPABA el resumen al autorizar
```

### Después (flujo Binance — implementado en este commit)
```
CashOutSpeiRecipientScreen  ← Step 1: solo "¿a quién?"
  ├─ CLABE (auto-detecta banco)
  ├─ Banco
  ├─ Nombre, Email, Concepto
  └─ "Continuar" →

CashOutSpeiAmountScreen  ← Step 2: monto como HÉROE
  ├─ Destinatario fijo arriba (contexto persistente)
  ├─ Monto display 52px tabular-nums (HÉROE)
  ├─ Saldo disponible siempre visible + botón MAX
  ├─ Validación inline (rojo si supera saldo)
  ├─ AmountKeypad (teclado propio, nada del sistema tapa)
  └─ "Continuar" →

CashOutConfirmScreen  ← Step 3: resumen limpio
  ├─ GoldGradient con monto grande
  ├─ Tabla beneficiario / CLABE / concepto
  └─ "Autorizar con NIP" →

CashOutNipScreen  ← Step 4: FULL SCREEN (no bottom sheet)
  ├─ Resumen fijo arriba: destinatario + monto (NUNCA tapado)
  ├─ NipKeypad debajo
  └─ onComplete → sendSpei API → TransactionSuccess

TransactionSuccess  ← Step 5: sin cambios (ya estaba bien)
```

**Principios Binance aplicados:**
- ✅ Una decisión por pantalla cuando la decisión pesa
- ✅ El número financiero es el héroe (52px, tabular-nums)
- ✅ Saldo disponible siempre visible mientras se captura monto
- ✅ Teclado numérico propio (AmountKeypad, NipKeypad) — nada tapado
- ✅ NIP full-screen — resumen 100% visible mientras se autoriza
- ✅ Validación inline en vivo (saldo insuficiente)
- ✅ Botón MAX

---

## 5. Componentes nuevos creados

| Componente | Path | Descripción |
|---|---|---|
| `AmountKeypad` | `src/ui/features/wallet/components/AmountKeypad.tsx` | Teclado numérico para captura de montos. Keys 0–9, punto decimal, backspace. Max 2 decimales. Fully controlled. |
| `formatAmountDisplay` | mismo archivo | Helper: `"1250.5"` → `"$1,250.5"` con separadores y prefijo. |
| `RegisterSuccessScreen` | `src/ui/features/auth/screens/RegisterScreens.tsx` | Pantalla de éxito post-registro. CheckmarkCircle dorado, feature list, CTA "Comenzar". |

---

## 6. Errores/estados

**Patrón existente (bien implementado):**
- `walletErrorMessage(e: WalletError)` → texto legible en español
- `registrationErrorMessage(e)` → ídem para registro
- `toast.error(...)` / `toast.success(...)` — feedback unificado
- `Input` con prop `error` para validación inline

**Pendiente:**
- Mapeo de errores HTTP crudos (`400`, null-ref de .NET) → nunca deben llegar a UI
- Empty state en listas de beneficiarios y notificaciones
- Skeletons en BalanceCard durante primer carga

---

## 7. Deuda técnica pendiente (fuera del commit actual)

| # | Ítem | Prioridad | Sección doc |
|---|---|---|---|
| 1 | Reemplazar ~121 hex hardcodeados por tokens NativeWind | Alta | §3 |
| 2 | Unificar `MethodRow` / `Row` / `CopyRow` en un componente DS | Media | §4 |
| 3 | Mover `groupByDate` y `MovementGroup` a helper compartido | Baja | §4 |
| 4 | Añadir `fontVariant: ['tabular-nums']` a todos los montos | Media | §3.4 |
| 5 | Login screen: llenar espacio con franja de confianza IFPE | Media | §7 |
| 6 | Indicador de progreso (paso X de N) en flujo onboarding | Media | §7 |
| 7 | CashIn screen: copiar CLABE, compartir, QR, mostrar saldo | Media | §5.4 |
| 8 | Empty states + skeletons en BalanceCard | Media | §6.2 |
| 9 | Variante `label` (13–14px/500) en Text component | Baja | §3.4 |
| 10 | `CashOutMedaAmountScreen` — migrar a AmountKeypad (misma UX) | Media | §5 |

---

## 8. Pantallas verificadas light/dark

| Pantalla | Light | Dark | Notas |
|---|---|---|---|
| CashOutSpeiRecipientScreen | ✅ | ✅ | Mismo que antes |
| CashOutSpeiAmountScreen | ✅ | ✅ | Nueva — clases dark: en todos los elementos |
| CashOutConfirmScreen | ✅ | ✅ | Refactorizada |
| CashOutNipScreen | ✅ | ✅ | Nueva |
| RegisterSuccessScreen | ✅ | ✅ | Nueva |
| WalletScreen (search) | ✅ | ✅ | Añadido filtro |
