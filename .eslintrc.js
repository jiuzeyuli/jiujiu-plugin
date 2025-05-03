// @ts-check
module.exports = {
  // 基本配置
  env: {
    node: true,    // 启用Node.js全局变量
    es2021: true,  // 使用ES2021语法
    jest: true     // 支持Jest测试语法
  },
  parserOptions: {
    ecmaVersion: 'latest',  // 使用最新ECMAScript标准
    sourceType: 'module',   // 使用ES模块
    ecmaFeatures: {
      jsx: false           // 不启用JSX
    }
  },

  // 扩展规则集（顺序重要，后面的会覆盖前面的）
  extends: [
    'eslint:recommended',            // ESLint推荐规则
    'plugin:@typescript-eslint/recommended', // TypeScript推荐规则
    'plugin:prettier/recommended'    // 整合Prettier
  ],

  // 插件
  plugins: [
    '@typescript-eslint',   // TypeScript支持
    'import',              // 改进import规则
    'promise',             // Promise最佳实践
    'unicorn'              // 高级代码质量规则
  ],

  // 自定义规则（覆盖extends中的配置）
  rules: {
    // TypeScript相关
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],

    // 基本JavaScript规则
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],
    'eqeqeq': ['error', 'smart'],
    
    // 代码风格
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'comma-dangle': ['error', 'only-multiline'],
    'object-curly-spacing': ['error', 'always'],
    
    // 导入/导出规则
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always'
      }
    ],
    'import/no-default-export': 'error',
    'import/no-unresolved': 'off', // 由TypeScript处理
    
    // 异步代码规则
    'promise/catch-or-return': 'error',
    'promise/always-return': 'off',
    'promise/no-nesting': 'warn',
    
    // 高级代码质量
    'unicorn/better-regex': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-ternary': 'off',
    
    // 错误预防
    'no-prototype-builtins': 'off',
    'require-atomic-updates': 'error',
    'no-unsafe-optional-chaining': 'error'
  },

  // 针对特定文件的覆盖配置
  overrides: [
    {
      // 测试文件使用更宽松的规则
      files: ['**/*.test.js', '**/*.spec.js'],
      rules: {
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      // 配置文件使用CommonJS
      files: ['*.config.js', '.eslintrc.js'],
      env: {
        node: true
      },
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-default-export': 'off'
      }
    }
  ],

  // 忽略规则
  ignorePatterns: [
    '**/node_modules/',
    '**/dist/',
    '**/coverage/',
    '**/.yarn/',
    '**/__snapshots__/',
    '!.prettierrc.js' // 不忽略配置文件
  ],

  // 全局变量（避免未定义警告）
  globals: {
    segment: 'readonly',  // Yunzai的segment
    logger: 'readonly',   // 插件logger
    Plugin: 'readonly'    // Yunzai插件基类
  }
};