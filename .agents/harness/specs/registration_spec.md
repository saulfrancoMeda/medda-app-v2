# Harness Spec: Registro / Onboarding (Prospect)

## Metadata

- Modulo: Registro de usuario (Onboarding / Prospect)
- Tipo de cambio: migracion (feature grande, multi-fase)
- Fecha: 2026-06-09
- Orquestador: Claude
- Personas: Legacy Expert, Planner, RN Developer, Tester & QA, UI/UX Auditor
- Estado: en implementacion por fases

## 1. Objetivo

Migrar el alta de usuario del legacy (`../medaapp/app/src/Onboading/`) a v2 con paridad de pasos y reglas,
pero con UX fluida (paso a paso), persistencia para reanudar donde se quedo, y SMS con cooldown de 60s.

## 2. Trazabilidad legacy (extraido por Legacy Expert)

Secuencia legacy: Steep1 telefono -> Steep2 OTP SMS -> Steep3 nombre+contrasena -> Steep4 ubicacion+bienvenida ->
Steep5 demografia+CURP -> Steep6 documento (camara+OCR) -> Steep7 domicilio+comprobante -> Steep8 beneficiarios ->
Steep9 encuesta -> NIP + NipRepeat -> Legal (3 checks) -> POST registro.

Endpoints clave:

- Enviar SMS: `POST /public/security/phone/validation/sendCode` `{ phone, validate }`.
- Validar OTP: `POST /public/security/code/validate` `{ code, phone, omitUserValidation }`.
- Telefono existente: `GET /public/user/name?cellphone=` (404 = no registrado, ok para alta).
- Catalogos: `/public/catalogs/{genres|nationalities|occupations|countries|federal-entities}`.
- Documento requerido: `/documents/id/required` `{ nationality, resident }`.
- OCR: `POST /public/document/{id}/data-extract` (multipart).
- Black list: `POST /public/black-lists/check`.
- Registro final: `POST /public/register/v2` (multipart con todo el payload + nipSignature SHA256).

Reglas:

- Password: min 8, mayuscula, minuscula, numero, especial de `_?@.+#$&`, sin >3 iguales seguidos,
  sin secuencias largas, no contiene "meda", ni telefono, ni fecha de nacimiento. (Umbral exacto de
  secuencia a confirmar contra legacy; se implementa >3.)
- NIP: 6 digitos, confirmacion, firma SHA256.
- CURP: 18 caracteres (obligatorio si nacionalidad mexicana).
- Edad: 18+.
- Legal: 3 aceptaciones (terminos, privacidad, apertura de cuenta).
- Persistencia legacy: `WalletCacheResources.onboarding_state` con todos los steps + `currentScreen`.

## 3. Plan por fases (cada fase pasa Quality Gate)

- Fase 0 (hecha): icono de app + nombre "Medá".
- Fase 1 (esta): dominio puro -> validadores (password/nip/curp/phone/otp/nombre/edad), modelo de
  draft + pasos, y tests. Es la base portable; sin React/Expo.
- Fase 2: persistencia (puerto + adaptardor SecureStore) para reanudar, puerto de gateway de registro,
  casos de uso (enviar codigo, validar codigo, verificar telefono, crear cuenta), infra HTTP, wiring.
- Fase 3: navegador de onboarding + Step1 telefono + Step2 OTP (cooldown 60s) + entrada desde Login.
- Fase 4: Step3 personal+password, Step nip + confirmar, Step legal -> registro minimo login-ready.
- Fase 5: demografia+CURP, domicilio, beneficiarios (reusa modulo), encuesta.
- Fase 6: KYC documento (camara + OCR) + black list + payload multipart completo a /public/register/v2.

## 4. Decisiones de UX

- Un paso por pantalla, barra de progreso, back que no pierde datos (persistencia por paso).
- SMS: reenvio deshabilitado con cuenta regresiva de 60s; se informa al usuario.
- Si el usuario sale, al volver se reanuda en el paso guardado (draft persistido).

## 5. Definition of Done (global)

- [x] Flujo completo paso a paso con persistencia/reanudacion (draft en SecureStore).
- [x] SMS con cooldown de 60s.
- [x] Reglas de password/nip/curp/edad/legal trazadas a legacy.
- [x] KYC: captura de documento con camara + OCR, black-list, nipSignature (SHA-256) y multipart.
- [~] Registro crea cuenta que puede iniciar sesion: flujo y payload completos; el contrato del
  backend `/public/register/v2` se implemento a ciegas (paridad legacy) y queda por validar contra
  un entorno real.
- [x] Quality Gate por fase.

Flujo final: telefono -> OTP (60s) -> datos+password -> demografia+CURP -> documento (camara+OCR)
-> domicilio -> beneficiarios (opcional) -> encuesta (opcional) -> NIP -> legal -> registro.
