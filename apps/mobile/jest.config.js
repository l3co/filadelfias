module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules 2/',
    ],
    watchPathIgnorePatterns: [
        '<rootDir>/node_modules 2/',
    ],
    collectCoverageFrom: [
        'src/lib/**/*.ts',
        'src/constants/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types/**',
    ],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
};
