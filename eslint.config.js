import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import globals from 'globals';

export default [
  // Global configuration
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/.obsidian',
      '**/manifest.json',
      '**/versions.json',
      'main.js',
      '*.mjs',
      'eslint.config.js'
    ]
  },

  // Global environment settings
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly'
      },
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': eslintPluginImport
    },
    rules: {
      'no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'import/no-unresolved': ['error', {
        commonjs: true,
        caseSensitive: true,
        ignore: ['obsidian']
      }],
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'no-undef': 'error'
    }
  },

  // TypeScript specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module'
      }
    },
    rules: {
      // TypeScript specific rules can be added here
    }
  },

  // Test files configuration
  {
    files: ['tests/**/*.ts', 'tests/**/*.js', '**/*.test.ts', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly'
      },
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.test.json',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': eslintPluginImport
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', 'src/']
        }
      },
      'import/core-modules': ['obsidian']
    },
    rules: {
      'no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'import/no-unresolved': ['error', {
        commonjs: true,
        caseSensitive: true,
        ignore: ['obsidian']
      }],
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'no-undef': 'off' // Jest globals are handled by globals.jest
    }
  },

  // Import plugin configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    ignores: ['tests/**/*.ts', 'tests/**/*.js', '**/*.test.ts', '**/*.test.js'],
    plugins: {
      import: eslintPluginImport
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', 'src/']
        }
      },
      'import/core-modules': ['obsidian']
    },
    rules: {
      'import/no-unresolved': ['error', {
        commonjs: true,
        caseSensitive: true,
        ignore: ['obsidian']
      }],
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-empty-function': 'off'
    }
  }
];
