/**
 * Step definitions for governance meetings E2E tests.
 * Covers meeting creation, editing, attendance tracking, and completion.
 */

import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { testGovernance } from '../support/fixtures';

const { Given, When, Then } = createBdd();

// ============================================
// Given Steps
// ============================================

Given('que existe um conselho cadastrado', async ({ page }) => {
    // Navigate to governance page to verify councils exist
    await page.goto('/app/governance');
    await page.waitForLoadState('networkidle');
    // Council list should be loaded
    await expect(page.locator('text=Conselhos e Juntas').or(page.locator('[data-testid="council-card"]').first())).toBeVisible({ timeout: 10000 });
});

Given('que existe uma reunião agendada no conselho', async function () {
    // Meeting should be created via API or seed data before this step
    // Store reference for later use in world context
    this.meetingData = testGovernance.meetings.ordinary;
});

Given('que o conselho possui membros cadastrados', async function () {
    // Members should be seeded in the council
    // This is handled by backend seed data
    this.hasMembers = true;
});

Given('que registrei a ata e as presenças', async function () {
    // This assumes previous steps already recorded minutes and attendance
    this.hasMinutes = true;
    this.hasAttendance = true;
});

Given('que existe uma reunião finalizada no conselho', async function () {
    this.completedMeeting = testGovernance.meetings.completed;
});

Given('que existem reuniões finalizadas no conselho', async function () {
    // Multiple completed meetings should exist via seed data
    this.hasCompletedMeetings = true;
});

// ============================================
// When Steps - Meetings Dialog
// ============================================

When('eu abro o dialog de reuniões do conselho', async ({ page }) => {
    // Click on the meetings button of a council card
    const meetingsButton = page.getByRole('button', { name: /reuniões/i }).first();
    await meetingsButton.click();

    // Wait for meetings dialog to open
    await expect(page.locator('[data-testid="meetings-dialog"]')).toBeVisible({ timeout: 5000 });
});

When('preencho o formulário de reunião:', async ({ page }, dataTable) => {
    const data = dataTable.hashes();

    for (const row of data) {
        const { campo, valor } = row;

        switch (campo.toLowerCase()) {
            case 'tipo':
                await page.locator('[data-testid="meeting-type-select"]').click();
                await page.getByRole('option', { name: new RegExp(valor, 'i') }).click();
                break;
            case 'data':
                await page.locator('[data-testid="meeting-date-input"]').fill(valor);
                break;
            case 'horario':
                await page.locator('[data-testid="meeting-time-input"]').fill(valor);
                break;
            case 'local':
                await page.locator('[data-testid="meeting-location-input"]').fill(valor);
                break;
            case 'pauta':
                await page.locator('[data-testid="meeting-agenda-input"]').fill(valor);
                break;
        }
    }
});

When('seleciono o tipo {string}', async ({ page }, tipo: string) => {
    await page.locator('[data-testid="meeting-type-select"]').click();
    await page.getByRole('option', { name: new RegExp(tipo, 'i') }).click();
});

When('preencho os dados da reunião', async ({ page }) => {
    const meeting = testGovernance.meetings.extraordinary;

    await page.locator('[data-testid="meeting-date-input"]').fill(meeting.date);
    await page.locator('[data-testid="meeting-time-input"]').fill(meeting.time);
    await page.locator('[data-testid="meeting-location-input"]').fill(meeting.location);
    await page.locator('[data-testid="meeting-agenda-input"]').fill(meeting.agenda);
});

When('confirmo o agendamento', async ({ page }) => {
    await page.locator('[data-testid="submit-create-meeting"]').click();
    await page.waitForLoadState('networkidle');
});

When('clico em {string} da reunião', async ({ page }, action: string) => {
    // Find the first meeting card and click the action button
    const meetingCard = page.locator('[data-testid^="meeting-card-"]').first();
    await meetingCard.getByRole('button', { name: new RegExp(action, 'i') }).click();
});

When('clico em {string} na seção de ata', async ({ page }, buttonText: string) => {
    // Find edit button near the "Ata" section
    const ataSection = page.locator('text=Ata da Reunião').locator('..');
    await ataSection.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
});

When('preencho a ata com {string}', async ({ page }, content: string) => {
    await page.locator('[data-testid="meeting-minutes-input"]').fill(content);
});

When('marco os membros presentes na lista', async ({ page }) => {
    // Click on checkboxes for attendance
    const checkboxes = page.locator('[data-testid^="attendee-checkbox-"]');
    const count = await checkboxes.count();

    // Mark at least some members present
    for (let i = 0; i < Math.min(count, 3); i++) {
        await checkboxes.nth(i).click();
    }
});

When('eu abro os detalhes da reunião', async ({ page }) => {
    await page.getByRole('button', { name: /ver ata|detalhes/i }).first().click();
    await expect(page.locator('[data-testid="meeting-details-dialog"]')).toBeVisible();
});

When('clico na aba {string}', async ({ page }, tabName: string) => {
    await page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
});

// ============================================
// Then Steps - Meetings Assertions
// ============================================

Then('a reunião deve aparecer na aba {string}', async ({ page }, tabName: string) => {
    await page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
    await expect(page.locator('[data-testid^="meeting-card-"]').first()).toBeVisible();
});

Then('a reunião deve aparecer com badge {string}', async ({ page }, badgeText: string) => {
    await expect(page.locator(`text=${badgeText}`)).toBeVisible();
});

Then('devo ver os dados da reunião:', async ({ page }) => {
    // Meeting details dialog should be visible with data
    await expect(page.locator('[data-testid="meeting-details-dialog"]')).toBeVisible();
});

Then('devo ver a lista de presença vazia', async ({ page }) => {
    // Check attendance count shows 0
    await expect(page.getByText(/lista de presença \(0\//i)).toBeVisible();
});

Then('devo ver opção para editar ata', async ({ page }) => {
    await expect(page.getByRole('button', { name: /editar/i })).toBeVisible();
});

Then('a ata deve estar salva', async ({ page }) => {
    // After saving, the textarea should not be visible (view mode)
    await expect(page.locator('[data-testid="meeting-minutes-input"]')).not.toBeVisible();
});

Then('a contagem de presenças deve ser atualizada', async ({ page }) => {
    // Verify attendance count is no longer 0
    await expect(page.getByText(/lista de presença \(0\//i)).not.toBeVisible();
});

Then('a reunião deve mostrar badge {string}', async ({ page }, badgeText: string) => {
    await expect(page.getByText(new RegExp(badgeText, 'i'))).toBeVisible();
});

Then('não devo ver o botão {string}', async ({ page }, buttonText: string) => {
    await expect(page.getByRole('button', { name: new RegExp(buttonText, 'i') })).not.toBeVisible();
});

Then('devo ver a ata em modo somente leitura', async ({ page }) => {
    // Textarea for editing should not be visible
    await expect(page.locator('[data-testid="meeting-minutes-input"]')).not.toBeVisible();
    // But the ata content should be visible
    await expect(page.getByText(/ata/i)).toBeVisible();
});

Then('devo ver a lista de reuniões passadas', async ({ page }) => {
    await expect(page.locator('[data-testid^="meeting-card-"]').first()).toBeVisible();
});

Then('cada reunião deve mostrar indicador de presença', async ({ page }) => {
    // Check for presence indicator text in meeting cards
    await expect(page.getByText(/presente\(s\)/i)).toBeVisible();
});

Then('cada reunião deve ter opção {string}', async ({ page }, optionText: string) => {
    await expect(page.getByRole('button', { name: new RegExp(optionText, 'i') }).first()).toBeVisible();
});
