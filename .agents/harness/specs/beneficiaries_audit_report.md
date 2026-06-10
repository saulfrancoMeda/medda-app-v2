# Audit & Performance Report

## Metadata

- Modulo: Beneficiarios (flujo de eliminacion + revision UX)
- Spec/Sprint Contract: `.agents/harness/specs/beneficiaries_spec.md`, `.agents/harness/specs/beneficiaries_sprint_contract.md`
- Evaluador: Orquestador (Claude) con personas Legacy Expert, UI/UX Auditor, Tester & QA
- Fecha: 2026-06-09
- Estado: aprobado con riesgos

## Resumen

- Se corrigio el flujo de "Eliminar" del listado: ya no navega al formulario al tocar el boton; ahora abre una confirmacion (bottom sheet) y resuelve la eliminacion respetando la regla legacy de sumar 100%.
- Se ejecutaron personas del Harness con herramienta real de sub-agentes y se dejo evidencia (abajo).

## Archivos revisados / tocados

- `src/ui/features/beneficiaries/screens/BeneficiariesScreen.tsx` (reescrito: confirmacion + ramificacion de borrado).
- `src/ui/features/beneficiaries/components/DeleteBeneficiaryModal.tsx` (nuevo: confirmacion destructiva).
- `src/ui/features/beneficiaries/hooks/useBeneficiaries.ts`, `components/ColonyPicker.tsx`, `components/PercentSelector.tsx`, `components/ConfirmSaveModal.tsx` (limpieza de comentarios: solo ingles y minimos).

## Quality Gate

| Comando                    | Resultado | Evidencia/notas |
| :------------------------- | :-------- | :-------------- |
| `git diff --check`         | OK        | Sin errores de whitespace |
| `npm run typecheck:domain` | OK        | Dominio puro intacto |
| `npm run typecheck`        | OK        | Sin errores |
| `npm run lint`             | OK        | Sin warnings |
| `npm test -- --runInBand`  | OK        | 18/18 |
| `npm run format:check`     | OK*       | OK en archivos tocados; repo arrastra 52 archivos con estilo previo ajeno a este cambio |

## QA funcional (Tester & QA)

### Casos verificados (logica de `buildDeletePlan`)

- 2 beneficiarios -> eliminar uno: el sobreviviente queda al 100% automaticamente y persiste en un solo PUT. Tambien corrige datos invalidos previos (ej. 25% + 100% = 125%).
- >=2 restantes que ya suman 100%: persiste directo sin pasar por el formulario.
- >=2 restantes que NO suman 100% (ej. 4x25 -> 3x25 = 75%): confirma y navega al Edit para reasignar manualmente; "Guardar" bloquea hasta llegar a 100%.
- Eliminar al unico beneficiario (quedaria 0): no se permite quedar en cero; el sheet lo explica y ofrece "Editar beneficiario".
- Error de red/sesion al persistir: se muestra banner accionable en el listado; no se pierde el listado en cache.

### Bugs o regresiones

| Severidad | Archivo/pantalla | Hallazgo | Reproduccion |
| :-------- | :--------------- | :------- | :----------- |
| Resuelto  | BeneficiariesScreen | "Eliminar" navegaba al formulario en vez de confirmar | Tocar Eliminar en el listado |

## Paridad legacy (Legacy Expert)

- Archivos legacy comparados: `../medaapp/app/src/Beneficiaries/Overview/index.js`, `Edit/index.js`, `Forms/Beneficiary/index.js`, `api.js`, `apiEndpoints.js`.
- Hallazgos clave: en legacy "Eliminar" abre popup contextual y al confirmar navega al Edit con la lista recortada (persiste solo al guardar); total debe ser 100% (validado al guardar); porcentajes discretos 25/50/75/100; sin auto-redistribucion; no se puede guardar con cero (el Edit auto-agrega un formulario vacio).
- Diferencias aceptadas (instruccion del usuario > legacy): para el caso comun (queda 1 beneficiario o el resto ya suma 100%) se persiste en sitio tras confirmar, sin mandar al formulario. Se conserva el ruteo al Edit solo cuando la reasignacion es genuinamente ambigua (>=2 restantes sin sumar 100%).
- Diferencias no resueltas: ninguna que rompa la regla de negocio del 100%.

## UI/UX y accesibilidad (UI/UX Auditor)

- Patron de confirmacion: bottom sheet propio (consistente con `ConfirmSaveModal`/`BankPicker`) en lugar de `Alert.alert`, para controlar el estilo destructivo y comunicar la consecuencia.
- Estados revisados: loading, error con reintento, empty, refetch (pull-to-refresh), confirmacion y error de accion.
- Accesibilidad: `accessibilityLabel` por fila ("Eliminar a {nombre}"), target tactil del boton elevado a `minHeight: 44` con `hitSlop`, `accessibilityViewIsModal` en el sheet, mensaje destructivo con icono + texto + color (no solo color).
- Safe area/teclado/scroll: listado en `FlatList`; CTA inferior sobre borde; sheet con backdrop bloqueado durante el guardado para evitar doble submit.

## Performance

- Riesgos revisados: listado pequeno (<=4) en `FlatList`; `buildDeletePlan` es O(n) trivial por render solo cuando hay pendiente.
- Hallazgos: sin trabajo costoso en render; sin memoizacion necesaria a esta escala.

## Seguridad y privacidad

- Datos sensibles: PII de beneficiarios (nombre/direccion) no se loguea; errores se mapean a mensajes genericos.
- Storage/logs: sin secretos ni tokens en UI; persistencia via repositorio autenticado.

## Riesgos residuales

- Sin tests de UI (el repo aun no tiene React Native Testing Library); la logica de la regla 100% esta cubierta en dominio/application.
- Falta verificacion manual en dispositivo del flujo de colonias por CP (depende del backend `/public/postalCode/info`).
- `format:check` global sigue reportando archivos previos no relacionados; pendiente de limpieza transversal aparte.

## Iteracion 2 — UX de asignacion de porcentajes y fecha de nacimiento

Hallazgos del usuario atendidos (con consulta a UI/UX Auditor, evidencia en el sub-agente):

- Feedback del total movido de un banner superior a un **footer fijo** (sobre "Guardar") con barra de progreso y copy por estado (<100 / =100 / >100), donde el usuario actua.
- Acciones proactivas en el footer: **"Agregar beneficiario"** (cuando <4) y **"Repartir"** con etiqueta exacta por conteo (Asignar 100% / Repartir 50/50 / Sugerir 50/25/25 / Repartir 25/25/25/25). El caso 3 no divide exacto con valores discretos: se sugiere 50/25/25.
- `PercentSelector` ahora **deshabilita** opciones que excederian 100% y el 100% cuando hay mas de un beneficiario; la opcion seleccionada siempre queda activa para no atrapar al usuario.
- Al **agregar** un beneficiario cuando otro tiene 100%, se limpia ese 100% (queda invalido con >1) y se avisa con un hint, resolviendo el dead-end de "dos al 100%".
- **Fecha de nacimiento**: mascara con clamping en vivo (dia 01–31, mes 01–12, auto-cero) + validacion en blur con mensajes especificos (incompleta / fecha inexistente / fuera de 18–80). Nueva funcion de dominio `validateBirthDate` reutilizada por `validateBeneficiaries` (sin reglas nuevas; reusa `parseDate`/`isAllowedBirthDate`).

Quality Gate iteracion 2: typecheck:domain OK, typecheck OK, lint OK, tests 22/22 OK, format:check OK (archivos tocados), git diff --check OK.

Archivos tocados: `domain/beneficiaries/entities/Beneficiary.ts` (+ test), `ui/features/beneficiaries/screens/BeneficiariesEditScreen.tsx`, `ui/features/beneficiaries/components/PercentSelector.tsx`.

## Decision final

- Aprobado con riesgos: el flujo de eliminacion cumple la regla de negocio y mejora la UX; la edicion ahora guia la asignacion del 100% y valida la fecha. Quedan pendientes de pruebas manuales en dispositivo y tests de UI cuando exista harness.
