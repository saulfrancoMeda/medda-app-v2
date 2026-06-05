// ESLint flat config. Extiende la config de Expo y añade la regla de ARQUITECTURA:
// import/no-restricted-paths fuerza la dirección de dependencias entre capas.
// Si violas el aislamiento (p.ej. domain importa de ui), el lint falla. Este es el
// guardrail mecánico que hace que un cambio en una capa no pueda romper otra.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'expo-env.d.ts', '*.config.js'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/domain',
              from: ['./src/application', './src/infrastructure', './src/ui'],
              message:
                'domain debe ser TS puro: no puede importar de application/infrastructure/ui.',
            },
            {
              target: './src/application',
              from: ['./src/infrastructure', './src/ui'],
              message: 'application solo puede depender de domain.',
            },
            {
              target: './src/ui',
              from: ['./src/infrastructure'],
              message:
                'ui no importa infrastructure directamente: usa application + providers/hooks.',
            },
          ],
        },
      ],
    },
  },
];
