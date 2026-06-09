---
description: Proceso de Migración con Harness (Planner-Generator-Evaluator)
---

# Workflow: Migración con Harness Engineering (Equipo Completo)

Este workflow coordina a todos los sub-agentes para una migración pixel-perfect y de alto rendimiento.

// turbo-all

1. **Sincronización (Legacy Expert)**:
   - Extraer lógica de negocio de `../medaapp`.
   - Documentar edge cases y comportamientos específicos del legacy.

2. **Diseño Técnico (Planner)**:
   - Crear `spec.md` mapeando a la Arquitectura Hexagonal.
   - Definir Puertos y Entidades en `src/domain`.

3. **Construcción Modular (RN Developer)**:
   - Implementar el código siguiendo la especificación.
   - Asegurar modularización de componentes y hooks.
   - Aplicar buenas prácticas de React Native (NativeWind v4, TS).

4. **Auditoría UI/UX (UI/UX Auditor)**:
   - Verificar usabilidad y consistencia de marca.
   - Revisar accesibilidad e interactividad.

5. **Control de Calidad (Tester & QA)**:
   - Pruebas de paridad funcional con el legacy.
   - Ejecución de tests unitarios y de integración.

6. **Optimización (Performance Specialist)**:
   - Analizar frames y uso de memoria del nuevo módulo.
   - Aplicar optimizaciones en renderizado y llamadas de red.

7. **Aprobación Final**:
   - Consolidar el reporte de auditoría y actualizar `README.md`.

---
*Orquestado por Antigravity.*
