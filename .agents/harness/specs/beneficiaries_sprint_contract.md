# Sprint Contract: Beneficiarios

## Metadata

- Modulo: Beneficiarios
- Spec relacionada: `.agents/harness/specs/beneficiaries_spec.md`
- Responsable de implementacion: RN Developer
- Responsable de evaluacion: Tester & QA
- Fecha: 2026-06-09
- Estado: aceptado

## Alcance

### Incluye

- Dominio y puerto dedicados.
- Repositorio HTTP con endpoints legacy.
- Hooks React Query.
- Listado, edicion, alta, eliminacion y guardado.
- Pruebas de reglas de negocio y use cases.

### No incluye

- Dependencias nuevas.
- Picker nativo de fecha.
- Cambios backend.

## Archivos esperados

| Capa | Archivos nuevos/modificados | Notas |
| :--- | :--- | :--- |
| Domain | `src/domain/beneficiaries/**` | Reglas puras. |
| Application | `src/application/beneficiaries/**` | Use cases. |
| Infrastructure | `src/infrastructure/beneficiaries/**`, `endpoints.ts`, `appContainer.ts` | Adaptadores. |
| UI | `src/ui/features/beneficiaries/**`, navegacion | Flujo completo. |
| Tests | `*.test.ts` de dominio/application | Sin tests de UI por falta de harness actual. |
| Docs | README status | Beneficiaries pasa a migrado. |

## Quality Gate pactada

| Comando | Obligatorio | Motivo | Resultado |
| :--- | :---: | :--- | :--- |
| `git diff --check` | Si | Higiene del diff | OK (sin errores) |
| `npm run typecheck:domain` | Si | Pureza de dominio | OK |
| `npm run typecheck` | Si | Tipado general | OK |
| `npm run lint` | Si | Arquitectura/estilo | OK |
| `npm test -- --runInBand` | Si | Regresion funcional | OK (18/18) |
| `npm run format:check` | Si | Formato | OK en archivos tocados; el repo arrastra 52 archivos con estilo previo no relacionados a este cambio |

## Riesgos aceptados

- La fecha se captura como texto `DD/MM/AAAA`; se valida en dominio para evitar dependencia adicional.
- El endpoint de CP usa la forma legacy `/public/postalCode/info?postalCode=...`.
