import { Page, BrowserContext } from '@playwright/test';

/**
 * Shared context for Cucumber steps.
 * Contains page instance and utility methods for test scenarios.
 */
export interface WorldContext {
    page: Page;
    context: BrowserContext;
    testData: TestData;
}

/**
 * Test data that can be shared between steps.
 */
export interface TestData {
    currentUser?: {
        email: string;
        password: string;
        name?: string;
    };
    currentChurch?: {
        name: string;
        identifier: string;
    };
    createdEntities: Map<string, string>;
}

/**
 * Creates initial test data structure.
 */
export function createTestData(): TestData {
    return {
        createdEntities: new Map(),
    };
}
