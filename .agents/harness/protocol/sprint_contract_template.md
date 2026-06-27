# Sprint Contract

## Metadata

- Modulo:
- Spec relacionada:
- Responsable de implementacion:
- Responsable de evaluacion:
- Fecha:
- Estado: draft / aceptado / bloqueado / cerrado

## Alcance

### Incluye

-

### No incluye

-

## Archivos esperados

| Capa           | Archivos nuevos/modificados | Notas |
| :------------- | :-------------------------- | :---- |
| Domain         |                             |       |
| Application    |                             |       |
| Infrastructure |                             |       |
| UI             |                             |       |
| Tests          |                             |       |
| Docs           |                             |       |

## Contratos de entrada y salida

- Puertos:
- DTOs/payloads:
- Entidades/value objects:
- Estados de UI:
- Errores esperados:

## Definition of Done pactada

- [ ] Compila TypeScript.
- [ ] `domain` permanece puro.
- [ ] Tests relevantes pasan.
- [ ] UI cubre estados de pantalla.
- [ ] QA revisa paridad o comportamiento esperado.
- [ ] UI/UX revisa accesibilidad y consistencia si toca pantallas.
- [ ] Performance revisa listas, red, memoria o startup si aplica.
- [ ] No quedan logs sensibles ni secretos.

## Quality Gate pactada

| Comando                    |  Obligatorio  | Motivo              | Resultado |
| :------------------------- | :-----------: | :------------------ | :-------- |
| `git diff --check`         |      Si       | Higiene del diff    |           |
| `npm run typecheck:domain` | Segun cambio  | Pureza de dominio   |           |
| `npm run typecheck`        | Segun cambio  | Tipado general      |           |
| `npm run lint`             | Segun cambio  | Arquitectura/estilo |           |
| `npm test -- --runInBand`  | Segun cambio  | Regresion funcional |           |
| `npm run format:check`     | Cierre amplio | Formato             |           |

## Riesgos aceptados

-

## Handoff

### Para RN Developer

-

### Para Tester & QA

-

### Para UI/UX Auditor

-

### Para Performance Specialist

-
