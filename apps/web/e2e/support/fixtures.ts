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
    pastor: {
        email: 'pastor@igreja.com',
        password: 'S3nh@Pastor',
        name: 'Rev. João Silva',
        office: 'PASTOR',
    },
    presbitero: {
        email: 'presbitero@igreja.com',
        password: 'S3nh@Presb',
        name: 'Presb. Carlos Santos',
        office: 'PRESBITERO',
    },
    diacono: {
        email: 'diacono@igreja.com',
        password: 'S3nh@Diac',
        name: 'Diác. Pedro Lima',
        office: 'DIACONO',
    },
    tesoureiro: {
        email: 'tesoureiro@igreja.com',
        password: 'S3nh@Tes',
        name: 'Ana Tesoureira',
        office: 'MEMBRO',
        functions: ['TESOUREIRO'],
    },
    secretario: {
        email: 'secretario@igreja.com',
        password: 'S3nh@Sec',
        name: 'José Secretário',
        office: 'MEMBRO',
        functions: ['SECRETARIO'],
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
    accounts: {
        bank: {
            name: 'Banco do Brasil',
            type: 'BANK',
            balance: 10000.00,
        },
        cash: {
            name: 'Caixa Geral',
            type: 'CASH',
            balance: 500.00,
        },
    },
    categories: {
        tithe: {
            name: 'Dízimos',
            type: 'INCOME',
        },
        offering: {
            name: 'Ofertas',
            type: 'INCOME',
        },
        utilities: {
            name: 'Contas de Consumo',
            type: 'EXPENSE',
        },
    },
    transactions: [
        { description: 'Dízimo Janeiro', amount: 500, type: 'CREDIT', date: '2026-01-05' },
        { description: 'Oferta Culto', amount: 150, type: 'CREDIT', date: '2026-01-07' },
        { description: 'Conta de Luz', amount: 200, type: 'DEBIT', date: '2026-01-10' },
        { description: 'Dízimo Janeiro', amount: 800, type: 'CREDIT', date: '2026-01-12' },
        { description: 'Oferta Missões', amount: 300, type: 'CREDIT', date: '2026-01-14' },
        { description: 'Material Limpeza', amount: 50, type: 'DEBIT', date: '2026-01-15' },
        { description: 'Dízimo Janeiro', amount: 1200, type: 'CREDIT', date: '2026-01-18' },
        { description: 'Conta de Água', amount: 80, type: 'DEBIT', date: '2026-01-20' },
        { description: 'Oferta Especial', amount: 500, type: 'CREDIT', date: '2026-01-22' },
        { description: 'Manutenção', amount: 350, type: 'DEBIT', date: '2026-01-24' },
        { description: 'Dízimo Janeiro', amount: 600, type: 'CREDIT', date: '2026-01-25' },
        { description: 'Internet', amount: 120, type: 'DEBIT', date: '2026-01-26' },
    ],
} as const;

/**
 * Tithe/Offering test data.
 */
export const testTithe = {
    records: {
        pending: {
            amount: 500.00,
            type: 'DIZIMO',
            date: '2026-01-15',
            notes: 'Dízimo de janeiro',
            status: 'PENDING',
        },
        approved: {
            amount: 300.00,
            type: 'OFERTA',
            date: '2026-01-10',
            notes: 'Oferta missionária',
            status: 'APPROVED',
        },
        rejected: {
            amount: 100.00,
            type: 'OFERTA',
            date: '2026-01-05',
            notes: 'Oferta especial',
            status: 'REJECTED',
            rejectionReason: 'Comprovante ilegível',
        },
    },
    newTithe: {
        amount: '1000',
        type: 'Dízimo',
        date: '2026-01-20',
        notes: 'Dízimo referente ao mês de janeiro',
    },
    newOffering: {
        amount: '250',
        type: 'Oferta',
        date: '2026-01-22',
        notes: 'Oferta para missões',
    },
} as const;

/**
 * Devotional test data.
 */
export const testDevotionals = {
    today: {
        title: 'O Amor de Deus',
        verseReference: 'João 3:16',
        verseText: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...',
        meditation: 'Reflexão sobre o amor incondicional de Deus pela humanidade.',
    },
    new: {
        title: 'A Graça Salvadora',
        verseReference: 'Efésios 2:8',
        verseText: 'Porque pela graça sois salvos, mediante a fé...',
        meditation: 'Meditação sobre a graça divina e a salvação pela fé.',
    },
} as const;

/**
 * Prayer request test data.
 */
export const testPrayerRequests = {
    public: {
        content: 'Oração pela minha família',
        category: 'Família',
        isAnonymous: false,
    },
    anonymous: {
        content: 'Pedido confidencial de oração',
        category: 'Espiritual',
        isAnonymous: true,
    },
    healing: {
        content: 'Oração pela cura de um irmão',
        category: 'Saúde',
        isAnonymous: false,
    },
} as const;

/**
 * Event test data.
 */
export const testEvents = {
    upcoming: {
        title: 'Culto de Celebração',
        date: '2026-02-15',
        time: '19:00',
        location: 'Templo Principal',
    },
    conference: {
        title: 'Conferência Missionária',
        date: '2026-03-20',
        time: '09:00',
        location: 'Auditório Central',
    },
} as const;

/**
 * Governance test data (councils and meetings).
 */
export const testGovernance = {
    councils: {
        session: {
            name: 'Conselho da Igreja',
            type: 'SESSION',
            description: 'Conselho deliberativo principal',
        },
        deacons: {
            name: 'Junta Diaconal',
            type: 'DEACONS',
            description: 'Órgão de serviço e assistência',
        },
        assembly: {
            name: 'Assembleia Geral',
            type: 'ASSEMBLY',
            description: 'Reunião de todos os membros',
        },
    },
    meetings: {
        ordinary: {
            date: '2026-04-15',
            time: '19:30',
            location: 'Salão da Igreja',
            agenda: 'Reunião ordinária mensal - Planejamento do semestre',
            meetingType: 'ORDINARY',
        },
        extraordinary: {
            date: '2026-04-20',
            time: '10:00',
            location: 'Sala de Reuniões',
            agenda: 'Reunião extraordinária - Assunto urgente',
            meetingType: 'EXTRAORDINARY',
        },
        completed: {
            date: '2026-01-10',
            time: '19:30',
            location: 'Salão da Igreja',
            agenda: 'Reunião ordinária - Janeiro',
            minutes: 'Ata da reunião: Foram discutidos os temas da pauta e tomadas as seguintes decisões...',
            attendees: ['member-1', 'member-2', 'member-3'],
        },
    },
} as const;
