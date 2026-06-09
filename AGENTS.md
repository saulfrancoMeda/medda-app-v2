# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Harness Engineering - Marco de Trabajo para Agentes (v2+)

Este repositorio utiliza un sistema de **Harness Engineering** avanzado inspirado en el diseño de Anthropic para aplicaciones de larga duración. Cada cambio es revisado por múltiples "personas" virtuales para asegurar calidad total.

## 🏗️ La Estructura del Harness

El sistema reside en `.agents/harness/` y se compone de:

- **Personas (Roles)**: Instrucciones específicas para cada sub-agente en `personas/*.md`.
- **Protocolos**: Contratos y templates para la comunicación inter-agente en `protocol/*.md`.
- **Workflows**: Guías paso a paso para tareas comunes en `.agents/workflows/`.

## 🤖 El Orphestrador y sus Sub-Agentes

Como **Orquestador**, mi deber es invocar y coordinar los siguientes roles:

| Rol | Documento de Referencia | Misión Crítica |
| :--- | :--- | :--- |
| **Legacy Expert** | `personas/legacy_expert.md` | Extracción de reglas de negocio desde `medaapp`. |
| **Planner** | `personas/planner.md` | Especificación técnica y mapeo arquitectónico. |
| **RN Developer** | `personas/generator.md` | Modularización, buenas prácticas y TypeScript. |
| **Tester & QA** | `personas/evaluator.md` | Verificación de funcionalidad y paridad legacy. |
| **UI/UX Auditor** | `personas/ui_ux_auditor.md` | Usabilidad, accesibilidad y diseño de marca. |
| **Performance Spec** | `personas/performance_specialist.md` | Optimización de FPS, memoria y tiempo de carga. |

## 📋 Proceso de Comunicación (File-based Communication)

Agentes se comunican vía:
1. **Spec File (`spec.md`)**: El Blueprint del Planner.
2. **Sprint Contract**: Acuerdo Generator-Evaluator sobre definición de "Done".
3. **Audit & Perf Report**: Documento de salida del Evaluator y Performance Spec.

## 🚀 Cómo ejecutar la migración

Utiliza el comando de workflow:
`/harness_migration`

---
*Este marco de trabajo garantiza que cada cambio sea revisado con "visión de rayos X", eliminando la improvisación y el error técnico.*
