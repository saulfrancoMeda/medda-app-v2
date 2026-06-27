---
description: Proceso de migracion y desarrollo con Harness Engineering
---

# Workflow: Harness Migration & Mobile Delivery

Usar este workflow para migraciones legacy, features medianas/grandes, cambios de arquitectura, flujos sensibles o trabajo que toque varias capas.

## 0. Preparacion

1. Leer `AGENTS.md`.
2. Confirmar que la solicitud esta clara. Si falta informacion critica, preguntar solo lo indispensable.
3. Revisar `git status --short` para proteger cambios ajenos.
4. Revisar `package.json` y scripts disponibles.
5. Si se va a modificar runtime, consultar https://docs.expo.dev/versions/v56.0.0/.

## 1. Legacy Expert

- Buscar en `../medaapp` los archivos relacionados.
- Extraer reglas de negocio, endpoints, payloads, mensajes, edge cases y dependencias.
- Separar comportamiento obligatorio de deuda legacy.
- Entregar trazabilidad al Planner.

Salida esperada:

- Reglas legacy.
- Tabla de endpoints/payloads.
- Edge cases.
- Preguntas abiertas.

## 2. Planner

- Crear o actualizar spec con `.agents/harness/protocol/spec_template.md`.
- Definir cambios por capa.
- Definir contratos antes de implementar.
- Crear Sprint Contract con `.agents/harness/protocol/sprint_contract_template.md` si el cambio requiere coordinacion.
- Elegir Quality Gate.

Salida esperada:

- Spec lista para implementar.
- Definition of Done.
- Scripts obligatorios por riesgo.

## 3. RN Developer

- Implementar de dominio hacia afuera.
- Mantener pantallas delgadas y componentes reutilizables.
- Agregar tests junto al comportamiento nuevo o modificado.
- No introducir dependencias sin justificar compatibilidad con Expo SDK 56.

Salida esperada:

- Codigo por capas.
- Tests nuevos/actualizados.
- Notas para QA, UI/UX y Performance.

## 4. UI/UX Auditor

- Revisar jerarquia, copy, estados, accesibilidad, safe areas, teclado y consistencia visual.
- Confirmar que el flujo es usable en movil real.
- Proponer mejoras sin cambiar reglas de negocio sin autorizacion.

Salida esperada:

- Hallazgos con severidad.
- Recomendaciones concretas.

## 5. Tester & QA

- Ejecutar scripts pactados.
- Validar casos de exito, error, edge cases, offline/permisos y paridad legacy.
- Confirmar que tests cubren reglas criticas.

Salida esperada:

- Reporte usando `.agents/harness/protocol/audit_report_template.md` para cambios medianos/grandes.

## 6. Performance Specialist

- Revisar renders, listas, memoria, red, startup y assets.
- Medir cuando sea posible y cuando el riesgo lo amerite.
- Bloquear cambios que introduzcan cuellos de botella evidentes en flujos criticos.

Salida esperada:

- Riesgos, metricas y recomendaciones priorizadas.

## 7. Cierre

1. Ejecutar o reportar la Quality Gate seleccionada.
2. Revisar `git diff --check`.
3. Resumir archivos tocados, pruebas, riesgos y pendientes.
4. Si queda bloqueo, explicar exactamente que informacion o accion falta.

## Quality Gate de referencia

| Tipo de cambio        | Scripts minimos                                                                                                    |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------- |
| Documentacion/agentes | `git diff --check`                                                                                                 |
| Domain                | `npm run typecheck:domain`, `npm test -- --runInBand`                                                              |
| Application           | `npm run typecheck`, `npm test -- --runInBand`                                                                     |
| Infrastructure        | `npm run typecheck`, tests/mocks de payloads si existen                                                            |
| UI/navegacion         | `npm run lint`, `npm run typecheck`, tests relacionados                                                            |
| Transversal           | `npm run lint`, `npm run typecheck`, `npm run typecheck:domain`, `npm test -- --runInBand`, `npm run format:check` |

Si un script no se ejecuta, el cierre debe decir por que y que riesgo queda.
