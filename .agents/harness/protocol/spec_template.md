# Harness Spec

## Metadata

- Modulo:
- Tipo de cambio: migracion / feature / bugfix / refactor / UX / performance / documentacion
- Fecha:
- Orquestador:
- Personas requeridas:
- Estado: draft / listo para implementacion / bloqueado / aprobado

## 1. Objetivo

### Problema

Describir el problema observable o solicitud del usuario.

### Resultado esperado

Describir que debe poder hacer el usuario o el sistema al terminar.

### No objetivos

Listar lo que queda fuera de alcance para evitar expansion accidental.

## 2. Trazabilidad legacy

| Archivo legacy           | Funcion/componente | Regla extraida | Nota |
| :----------------------- | :----------------- | :------------- | :--- |
| `../medaapp/app/src/...` |                    |                |      |

### Reglas de negocio

- Pendiente.

### Edge cases conocidos

- Pendiente.

## 3. Diseno por capas

### Domain

- Entidades/value objects:
- Puertos:
- Errores/resultados:

### Application

- Casos de uso:
- Dependencias de puertos:
- Politica de errores:

### Infrastructure

- Adaptadores:
- Endpoints/payloads:
- Storage/permisos/APIs nativas:
- Mappers DTO <-> dominio:

### UI

- Pantallas:
- Componentes:
- Hooks/providers:
- Estados: loading / empty / error / success / offline / permisos
- Navegacion:

### Composition/config

- Wiring:
- Variables de entorno:
- Flags/configuracion:

## 4. UX, accesibilidad y contenido

- Jerarquia visual:
- Copy/mensajes:
- Accesibilidad:
- Safe area/teclado/scroll:
- Confirmaciones o flujos sensibles:

## 5. Performance y seguridad

- Riesgos de render/listas:
- Riesgos de startup/bundle:
- Red/cache/retry:
- Datos sensibles/logs/storage:
- Mediciones requeridas:

## 6. Plan de pruebas

| Nivel          | Casos | Script/evidencia                    |
| :------------- | :---- | :---------------------------------- |
| Domain         |       | `npm run typecheck:domain`          |
| Application    |       | `npm test -- --runInBand`           |
| Infrastructure |       |                                     |
| UI             |       | `npm run lint`, `npm run typecheck` |
| Manual         |       |                                     |

## 7. Riesgos y supuestos

### Riesgos

- Pendiente.

### Supuestos

- Pendiente.

### Preguntas abiertas

- Pendiente.

## 8. Definition of Done

- [ ] Reglas legacy trazadas o no aplican.
- [ ] Contratos de dominio/application definidos.
- [ ] Implementacion respeta arquitectura.
- [ ] UI cubre estados requeridos.
- [ ] Accesibilidad basica revisada.
- [ ] Performance revisada para el flujo.
- [ ] Tests agregados/actualizados.
- [ ] Scripts relevantes ejecutados.
- [ ] Audit report completado si el cambio lo amerita.
