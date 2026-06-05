# Medá Agentes (v2)

Reescritura modernizada de la app de agentes Medá. Proyecto nuevo en **React Native + TypeScript**
con arquitectura por capas, pensado para tener paridad funcional con el legacy, ser mantenible por
una sola persona y permitir migrar piezas a nativo (Kotlin/Swift) en el futuro.

> Plan completo: `~/.claude/plans/binary-soaring-acorn.md`. App legacy de referencia: `../medaapp`.

## Stack

- **Expo SDK 56** · **React Native 0.85** · **React 19** (New Architecture activa por defecto)
- **TypeScript 6 strict** (+ `tsconfig.domain.json` que verifica la pureza del dominio)
- **NativeWind v4** (Tailwind 3) + design system propio con tokens
- **class-variance-authority** para variantes tipadas de componentes
- **Jest** (jest-expo) para tests

## Requisitos

- **Node 22** (ver `.nvmrc`): `nvm use`
- iOS local requiere Xcode (hoy solo hay Command Line Tools → usar EAS para iOS por ahora)

## Comandos

```bash
npm start              # Metro / Expo dev server
npm run android        # correr en Android
npm run ios            # correr en iOS (requiere Xcode)
npm run typecheck      # tsc de todo el proyecto
npm run typecheck:domain  # verifica que domain sea TS PURO (sin imports de RN/Expo)
npm run lint           # ESLint (incluye la regla de aislamiento de capas)
npm run format         # Prettier
npm test               # Jest
```

## Arquitectura por capas

Regla de dependencias (forzada por ESLint `import/no-restricted-paths`):
`ui → application → domain` y `infrastructure → domain`.
**`domain` no importa NADA externo** (ni React, ni RN, ni Expo). Es la capa portable a Kotlin/Swift.

```
src/
  domain/          # TS PURO: entidades, reglas de negocio, puertos (interfaces). Sin framework.
  application/     # casos de uso que orquestan domain + puertos
  infrastructure/  # adaptadores que implementan los puertos (HTTP, storage, auth, push)
  ui/              # SOLO React Native: design-system, providers, hooks, navigation, features
  config/  test/
```

### Por qué esto hace seguros los cambios

- **Aislamiento:** un cambio en una pantalla no puede tocar la lógica de negocio ni otro feature
  (las dependencias van en una sola dirección; el lint lo impide).
- **`tsc` strict:** cualquier cambio de contrato marca en compilación todos los lugares afectados.
- **Tests:** el dominio (TS puro) y los casos de uso se testean rápido como red de regresión.
- **Pureza del dominio:** `npm run typecheck:domain` falla si algo de RN/Expo se cuela en `domain`.

## Estado actual (Fase 0 — Fundaciones)

Hecho y verificado: scaffold, capas + aliases, NativeWind + tokens, ESLint/Prettier, tests,
dominio de auth (Session, SessionManager, puertos), caso de uso `login`, componentes `Text` y `Button`.

Pendiente Fase 0: extraer tokens de marca reales de meda.com.mx (los colores actuales son placeholder),
tipar `MedaApiClient` contra los endpoints del legacy, EAS + CI.
