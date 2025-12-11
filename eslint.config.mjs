import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.nyc_output/**',
      '.DS_Store',
      '*.log',
      '.env',
      '.env.local',
      '.env.production.local',
      '.env.development.local',
      '.env.test.local',
      '.vscode/**',
      '.idea/**',
      '*.swp',
      '*.swo',
      '*~',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  prettier,
];

export default eslintConfig;
