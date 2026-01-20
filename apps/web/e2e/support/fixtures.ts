/**
 * Fixture data for E2E tests.
 * Contains test users, churches, and other entities used across test scenarios.
 */

/**
 * Test user credentials for different scenarios.
 */
export const testUsers = {
    admin: {
        email: 'admin@igreja.com',
        password: 'MinhaS3nh@Segura',
        name: 'Administrador Teste',
    },
    member: {
        email: 'membro@igreja.com',
        password: 'S3nh@Membro',
        name: 'Maria Silva',
    },
    invalid: {
        email: 'usuario@inexistente.com',
        password: 'senhaerrada',
    },
} as const;

/**
 * Test church data for registration scenarios.
 */
export const testChurches = {
    newChurch: {
        name: 'Igreja Presbiteriana Central',
        identifier: 'ipc-centro-test',
        cep: '01310-100',
        number: '100',
        adminName: 'Pastor João Silva',
        adminEmail: 'pastor@ipc-centro-test.com',
        adminPhone: '(11) 99999-9999',
        password: 'S3nh@Segura123',
    },
    existingChurch: {
        identifier: 'ipc-existente',
    },
} as const;

/**
 * Test members for member management scenarios.
 */
export const testMembers = {
    existing: {
        name: 'Maria Santos',
        email: 'maria@igreja.com',
        status: 'Comungante',
    },
    new: {
        name: 'João Pereira',
        email: 'joao@email.com',
        status: 'Comungante',
    },
    forEdit: {
        name: 'Carlos Silva',
        phone: '(11) 88888-8888',
    },
} as const;

/**
 * Bible-related test data.
 */
export const testBible = {
    oldTestamentBooks: ['Gênesis', 'Êxodo', 'Levítico'],
    newTestamentBooks: ['Mateus', 'Marcos', 'Lucas', 'João'],
    versions: ['ARA', 'NVI', 'ACF'],
    searchQuery: 'João 3:16',
} as const;

/**
 * Hymnal test data.
 */
export const testHymnal = {
    firstHymn: {
        number: '001',
        title: 'Santo, Santo, Santo',
    },
    searchHymn: {
        title: 'Castelo Forte',
        number: '581',
    },
} as const;

/**
 * Financial test data.
 */
export const testFinancial = {
    income: {
        category: 'Dízimo',
        value: '500,00',
        description: 'Dízimo - João Silva',
    },
    expense: {
        category: 'Conta de luz',
        value: '350,00',
        description: 'Conta de luz - Janeiro',
    },
} as const;
