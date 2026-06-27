# Harness Spec: Beneficiarios

## Metadata

- Modulo: Beneficiarios
- Tipo de cambio: migracion
- Fecha: 2026-06-09
- Orquestador: Codex
- Personas requeridas: Legacy Expert, Planner, RN Developer, Tester & QA, UI/UX Auditor, Performance Specialist
- Estado: listo para implementacion

## 1. Objetivo

### Problema

La ruta `Mis beneficiarios` en v2 solo muestra un listado basico. Falta migrar el flujo completo del legacy: carga detallada, edicion, alta, eliminacion con reasignacion manual, validaciones y guardado.

### Resultado esperado

El usuario puede consultar, agregar, editar, eliminar y guardar beneficiarios. La suma de porcentajes debe ser 100%, con maximo 4 beneficiarios y payload compatible con `/beneficiaries/edit`.

### No objetivos

- No se agrega picker nativo de fecha ni dependencia nueva.
- No se cambia la regla legacy de porcentajes discretos: 25, 50, 75 y 100.

## 2. Trazabilidad legacy

| Archivo legacy | Funcion/componente | Regla extraida | Nota |
| :--- | :--- | :--- | :--- |
| `../medaapp/app/src/Beneficiaries/Overview/index.js` | `loadBeneficiaries`, `renderBeneficiaries`, `renderBeneficiaryDeletePopup` | GET `/beneficiaries/list`, empty/error/loading, ultima actualizacion, eliminar navega a edicion con lista remanente | Se elimina el `console.warn` legacy. |
| `../medaapp/app/src/Beneficiaries/Edit/index.js` | `addBeneficiary`, `onPercentChange`, `validate`, `save` | Maximo 4 beneficiarios, total 100%, confirmacion antes de guardar, PUT/POST `/beneficiaries/edit` con `{ beneficiaries }` | v2 usa modal nativo y React Query. |
| `../medaapp/app/src/Forms/Beneficiary/index.js` | `setFields`, `getData`, `loadPostalCodeInfo` | Nombre/apellidos min 2 letras, CP 5 digitos, colonia desde `/public/postalCode/info`, calle min 3, exterior requerido, fecha opcional 18-80 anos, porcentaje choice | Fecha se captura como `DD/MM/AAAA`. |
| `../medaapp/app/src/AppConfig/apiEndpoints.js` | `beneficiariesList`, `editBeneficiaries`, `cp` | Endpoints requeridos | Requieren auth user salvo CP publico. |

### Reglas de negocio

- Debe existir al menos un beneficiario para guardar.
- Debe haber maximo 4 beneficiarios.
- La suma de porcentajes debe ser exactamente 100.
- Cada porcentaje debe ser uno de 25, 50, 75 o 100.
- Fecha de nacimiento es opcional; si se captura, debe estar entre 18 y 80 anos.
- Direccion requiere CP, colonia, calle y numero exterior.
- Al eliminar se edita la lista restante para reasignar porcentajes o agregar un nuevo beneficiario.

## 3. Diseno por capas

### Domain

- `Beneficiary`, `BeneficiaryAddress`, `PostalCodeInfo`, `BeneficiaryDraft`.
- Validadores puros para nombres, CP, fecha y suma de porcentajes.
- Helpers de formato para nombre, direccion y fecha.

### Application

- Casos de uso `listBeneficiaries`, `saveBeneficiaries`, `lookupPostalCode`.

### Infrastructure

- `MedaBeneficiaryRepository` con endpoints legacy.
- Mapper DTO <-> dominio y payload `{ beneficiaries }`.

### UI

- `BeneficiariesScreen`: listado, refresh, empty/error, ultima actualizacion, eliminar, CTA editar.
- `BeneficiariesEditScreen`: formulario dinamico, agregar max 4, validacion, modal de confirmacion, guardado.
- Componentes locales: selector de porcentaje y colonia.

## 4. Plan de pruebas

| Nivel | Casos | Script/evidencia |
| :--- | :--- | :--- |
| Domain | validacion de total, maximo, fecha, payload | `npm run typecheck:domain`, `npm test -- --runInBand` |
| Application | casos de uso propagan Result | `npm test -- --runInBand` |
| Infrastructure | mapper y endpoints en typecheck | `npm run typecheck` |
| UI | navegacion tipada, estados, formularios | `npm run lint`, `npm run typecheck` |

## 5. Definition of Done

- [x] Reglas legacy trazadas.
- [x] Dominio puro (`typecheck:domain` verde).
- [x] Flujo de listado y edicion completo (UI + navegacion).
- [x] Endpoints `/beneficiaries/list`, `/beneficiaries/edit` y `/public/postalCode/info`.
- [x] Tests de dominio/application.
- [x] Quality Gate ejecutada.
