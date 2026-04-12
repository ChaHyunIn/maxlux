module.exports = {
    extends: [
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/strict',
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
            },
        ],
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/consistent-type-assertions': [
            'error',
            {
                assertionStyle: 'never',
            },
        ],
        'no-console': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'import/no-duplicates': 'error',
        'no-duplicate-imports': 'off',
        'import/no-unused-modules': 'off',

        // @typescript-eslint/no-magic-numbers 활성화 시 아래 옵션 사용 예정:
        // ignore: [0, 1, -1, 2, 100], ignoreArrayIndexes: true,
        // ignoreDefaultValues: true, ignoreEnums: true,
        // ignoreNumericLiteralTypes: true, ignoreReadonlyClassProperties: true,
        // ignoreTypeIndexes: true
        // TODO: enable after baseline cleanup (currently 62 warnings)
        '@typescript-eslint/no-magic-numbers': 'off',

        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'type'],
                pathGroups: [
                    {
                        pattern: 'react',
                        group: 'builtin',
                        position: 'before',
                    },
                    {
                        pattern: 'next/**',
                        group: 'builtin',
                        position: 'before',
                    },
                    {
                        pattern: '@/**',
                        group: 'internal',
                        position: 'before',
                    },
                ],
                pathGroupsExcludedImportTypes: ['type'],
                'newlines-between': 'never',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            },
        ],
        'react-hooks/exhaustive-deps': 'warn',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 'error',
        'default-case': 'error',
        eqeqeq: ['error', 'always'],
        'no-constant-condition': 'error',
        'no-restricted-syntax': [
            'error',
            {
                selector: "CallExpression[callee.property.name='toLocaleString'][callee.object.type='Literal']",
                message: '가격 포맷팅은 formatPrice() 유틸을 사용하세요.',
            },
            {
                selector: 'Literal[value=10000]',
                message: '만원 단위 나누기는 LOCALE_DEFAULTS.priceUnitManDivisor를 사용하세요.',
            },
            {
                selector: 'Literal[value=2000000]',
                message: '가격 필터 상한은 DEFAULT_FILTER_PRICE_RANGE를 사용하세요.',
            },
            {
                selector: 'Literal[value=350000]',
                message: '핫딜 임계값은 HOT_DEAL_THRESHOLD를 사용하세요.',
            },
            {
                selector: 'Literal[value=1400]',
                message: '환율은 LOCALE_DEFAULTS.exchangeRateUsd를 사용하세요.',
            },
            {
                selector: "MemberExpression[object.name='localStorage'][property.name='getItem']",
                message: 'localStorage 접근은 STORAGE_KEYS 상수와 전용 hook을 통해서만 하세요.',
            },
        ],
    },
    overrides: [
        {
            files: ['*.test.ts', '*.test.tsx', '*.spec.ts'],
            rules: {
                '@typescript-eslint/no-magic-numbers': 'off',
            },
        },
        {
            files: ['lib/constants.ts'],
            rules: {
                'no-restricted-syntax': 'off',
                '@typescript-eslint/no-magic-numbers': 'off',
            },
        },
        {
            files: ['hooks/useFavorites.ts', 'hooks/useLocalStorage.ts'],
            rules: {
                'no-restricted-syntax': 'off',
            },
        },
        {
            files: [
                'lib/supabase/server.ts',
                'app/sitemap.ts',
                'app/**/page.tsx',
                'app/**/layout.tsx',
                'components/shared/ErrorBoundary.tsx',
            ],
            rules: {
                'no-console': 'off',
            },
        },
    ],
};
