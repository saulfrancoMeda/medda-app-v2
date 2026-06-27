# MedaApp v2 Agent Operating Manual

## Expo SDK 56 es obligatorio

Antes de escribir o modificar codigo de runtime, consulta la documentacion versionada exacta:

https://docs.expo.dev/versions/v56.0.0/

Base actual verificada para este repositorio:

- `expo`: `~56.0.8`
- React Native objetivo de Expo SDK 56: `0.85`
- React objetivo de Expo SDK 56: `19.2.3`
- Node.js minimo para Expo SDK 56: `22.13.x`
- Paquetes Expo SDK: instalar o corregir con `npx expo install`, no con versiones adivinadas.

Si una API de Expo, React Native, React Navigation, NativeWind, Reanimated, SecureStore, Camera, Location, Notifications o cualquier dependencia movil puede haber cambiado, revisa documentacion oficial versionada antes de implementar.

## Fuente canonica para LLM

Este archivo es el contrato raiz para Codex, Claude y cualquier otro asistente que trabaje en `medaapp-v2`.

- `CLAUDE.md` debe apuntar a este archivo y no duplicar reglas incompatibles.
- Las personas viven en `.agents/harness/personas/*.md`.
- Los contratos de comunicacion viven en `.agents/harness/protocol/*.md`.
- Los workflows viven en `.agents/workflows/*.md`.
- Si hay conflicto: instrucciones del usuario y del entorno > `AGENTS.md` > persona > workflow > preferencia local.
- Si no existe herramienta real de sub-agentes, el Orquestador debe ejecutar las revisiones de las personas de forma secuencial y dejar evidencia.

## Arquitectura del repositorio

MedaApp v2 usa arquitectura hexagonal con TypeScript estricto.

- `src/domain/`: entidades, value objects, reglas de negocio y puertos. Debe ser TypeScript puro, sin React, Expo, UI, storage, red ni APIs de dispositivo.
- `src/application/`: casos de uso que orquestan dominio y puertos. No importa `ui` ni `infrastructure`.
- `src/infrastructure/`: adaptadores concretos, HTTP, storage, auth real, mapeo de DTOs y dependencias externas.
- `src/ui/`: pantallas, componentes, navegacion, hooks de UI, providers y sistema de diseno.
- `src/composition/`: ensamblaje de dependencias. Es el unico lugar donde se conectan puertos con adaptadores.
- `src/config/`: configuracion, environment y constantes globales.

Los aliases definidos en `tsconfig.json` son la forma preferida de importar capas: `@domain/*`, `@application/*`, `@infrastructure/*`, `@ui/*`, `@composition/*`, `@config/*`.

## Roles del Harness

| Rol                    | Archivo                                              | Responsabilidad                                                      |
| :--------------------- | :--------------------------------------------------- | :------------------------------------------------------------------- |
| Orquestador            | `.agents/harness/personas/orchestrator.md`           | Coordina contexto, plan, ejecucion, revisiones y reporte final.      |
| Legacy Expert          | `.agents/harness/personas/legacy_expert.md`          | Extrae reglas, endpoints, payloads y edge cases desde `../medaapp`.  |
| Planner                | `.agents/harness/personas/planner.md`                | Convierte requisitos en spec tecnica, contratos y plan por capas.    |
| RN Developer           | `.agents/harness/personas/generator.md`              | Implementa con TypeScript, React Native, Expo y arquitectura limpia. |
| Tester & QA            | `.agents/harness/personas/evaluator.md`              | Verifica funcionalidad, regresiones, scripts y paridad legacy.       |
| UI/UX Auditor          | `.agents/harness/personas/ui_ux_auditor.md`          | Audita usabilidad, accesibilidad, estados e identidad visual.        |
| Performance Specialist | `.agents/harness/personas/performance_specialist.md` | Evalua FPS, renders, memoria, red, startup y escalabilidad.          |

## Proceso obligatorio del Orquestador

Para cambios no triviales, el Orquestador debe:

1. Entender el objetivo del usuario y detectar si es migracion legacy, feature nueva, bugfix, refactor, diseno, performance o documentacion.
2. Leer contexto local antes de proponer cambios: archivos afectados, tests existentes, scripts, patrones vecinos y reglas en `.agents/`.
3. Si toca codigo de runtime, leer la documentacion Expo SDK 56 indicada arriba antes de implementar.
4. Si el cambio depende del legacy, pedir al Legacy Expert extraer reglas desde `../medaapp` y registrar trazabilidad. No inventar comportamiento.
5. Crear o actualizar una especificacion usando `.agents/harness/protocol/spec_template.md` cuando el cambio tenga mas de una capa, modifique reglas de negocio o toque UX critica.
6. Definir un Sprint Contract con `.agents/harness/protocol/sprint_contract_template.md` antes de implementar tareas medianas o grandes.
7. Implementar con la persona RN Developer, respetando capas, puertos y pruebas.
8. Auditar con Tester & QA, UI/UX Auditor y Performance Specialist segun el impacto.
9. Ejecutar los scripts relevantes de la Quality Gate. Si algo no se puede ejecutar, explicar por que y que riesgo queda.
10. Entregar un resumen final con archivos modificados, evidencias, pruebas y pendientes reales.

## Quality Gate de scripts

Selecciona los scripts por riesgo. No todos los cambios necesitan todo, pero todo cambio debe justificar su verificacion.

- Documentacion o agentes: `git diff --check`.
- Dominio: `npm run typecheck:domain`, `npm test -- --runInBand` para tests relacionados, y `npm run typecheck` si cambia contrato usado por otras capas.
- Application: `npm run typecheck`, tests de casos de uso y mocks de puertos.
- Infrastructure: `npm run typecheck`, tests de mapeo/errores cuando sea posible, validacion de payloads y manejo de red/offline.
- UI o navegacion: `npm run lint`, `npm run typecheck`, tests existentes, revision de estados loading/empty/error/success, safe area, teclado y accesibilidad.
- Cambio transversal o antes de cerrar una entrega: `npm run lint`, `npm run typecheck`, `npm run typecheck:domain`, `npm test -- --runInBand`, `npm run format:check`.

Si un script falla por una razon existente o externa al cambio, no ocultarlo: reportar comando, resultado, archivo implicado y si bloquea la entrega.

## Reglas de oro de ingenieria

- No inventar reglas de negocio. Legacy, spec o usuario deben respaldar cada comportamiento.
- Mantener el dominio puro y portable. Si `typecheck:domain` falla, la arquitectura esta contaminada.
- Aplicar SOLID de forma pragmatica: responsabilidad unica por modulo, inversion de dependencias con puertos, interfaces pequenas, entidades sin conocimiento de frameworks y extension sin condicionales gigantes.
- Preferir patrones ya presentes en el repo: Use Case, Repository/Port, Adapter, Factory, Mapper, Result, Provider y Composition Root.
- Evitar abstracciones prematuras. Crear una abstraccion solo si reduce duplicacion real, aisla una dependencia o aclara un contrato.
- Los errores esperados deben modelarse como resultados controlados o errores de dominio, no como excepciones opacas que llegan a UI.
- No filtrar secretos, tokens, NIP, PII o respuestas sensibles en logs, errores visibles o snapshots.
- No revertir cambios ajenos sin permiso. Leer el estado de git antes de editar si hay dudas.
- Mantener cambios pequenos y trazables. Cada diff debe explicar por que existe.

## Mejores practicas mobile

- UI debe ser declarativa y delgada: pantallas coordinan hooks/casos de uso; no contienen reglas de negocio.
- Cada pantalla importante debe contemplar loading, empty, error, success, offline/retry y permisos cuando aplique.
- Usar `SafeAreaView`/safe areas, evitar solapes con notch, teclado, header, tab bar y gestos del sistema.
- Usar componentes del design system en `src/ui/design-system` antes de crear variantes locales.
- NativeWind v4 debe apoyarse en tokens del sistema de diseno. No introducir paletas o espaciados sueltos sin razon.
- Accesibilidad: labels utiles, roles cuando apliquen, targets tactiles minimos de 44x44, contraste legible, soporte de font scaling razonable y foco/feedback claro.
- Formularios: validacion cercana al input, mensajes accionables, teclado correcto, submit seguro contra doble toque y estados de carga no ambiguos.
- Listas: `FlatList`/listas virtualizadas para colecciones medianas o grandes, keys estables, paginacion y renders itemizados.
- Performance: no hacer trabajo costoso durante render, no crear objetos/funciones pesadas sin necesidad, medir antes de memoizar de forma masiva.
- Imagenes y assets: tamanos adecuados, cache cuando corresponda, placeholders y evitar cargar recursos pesados al inicio.
- Red: React Query para datos remotos cuando aplique, invalidacion clara, retries razonables, cancelacion/abort en flujos sensibles y mapeo robusto de errores.
- Seguridad local: tokens y datos sensibles en `expo-secure-store` o mecanismo aprobado, nunca en AsyncStorage plano.

## Matriz minima de pruebas

- Unitarias de dominio para entidades, value objects y reglas criticas.
- Unitarias de application para casos de uso, errores, edge cases y contratos de puertos.
- Tests de infraestructura para mappers, payloads, parseo de errores y compatibilidad con endpoints cuando sea posible.
- Tests de UI para componentes con logica, formularios y estados condicionales cuando el framework del repo lo permita.
- Pruebas manuales documentadas para permisos nativos, camara, ubicacion, biometria, notificaciones, deep links, navegacion y flujos dependientes de dispositivo.
- Auditoria de accesibilidad para pantallas nuevas o modificadas.
- Auditoria de performance para listas, pantallas de alto trafico, animaciones, startup y flujos con red intensiva.

## Comunicacion file-based

Usa estos artefactos cuando el cambio lo amerite:

1. Spec tecnica: `.agents/harness/protocol/spec_template.md`.
2. Sprint Contract: `.agents/harness/protocol/sprint_contract_template.md`.
3. Audit & Perf Report: `.agents/harness/protocol/audit_report_template.md`.

El workflow principal es `.agents/workflows/harness_migration.md`.

## Salida esperada de cualquier agente

Cada respuesta final debe ser breve pero verificable:

- Que se hizo.
- Archivos tocados.
- Scripts/pruebas ejecutadas y resultado.
- Riesgos, bloqueos o pendientes.
- Decisiones relevantes, especialmente si se eligio no ejecutar un script o no tocar un archivo.
