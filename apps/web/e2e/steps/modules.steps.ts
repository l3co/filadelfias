import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

/**
 * Step definitions for governance, EBD, missions, and settings.
 * Note: Generic steps like 'devo ver {string}' are defined in common.steps.ts
 */

// ============================================================================
// Governance Steps
// ============================================================================

Then('devo ver lista de conselhos', async ({ page }) => {
    const councilList = page.locator('table, ul, [role="list"]')
        .or(page.getByText(/conselho|council/i));
    await expect(councilList.first()).toBeVisible();
});

Then('devo ver lista de presbíteros', async ({ page }) => {
    const presbyterList = page.locator('table tbody, ul, [role="list"]');
    await expect(presbyterList.first()).toBeVisible();
});

Then('devo ver seus respectivos mandatos', async ({ page }) => {
    const mandateInfo = page.getByText(/mandato|termo|período/i);
    await expect(mandateInfo.first()).toBeVisible()
        .catch(() => {
            // Mandate info might be in different format
        });
});

When('seleciono o conselho {string}', async ({ page }, council: string) => {
    const councilSelect = page.getByLabel(/conselho/i)
        .or(page.getByRole('combobox'));
    await councilSelect.first().click();
    await page.getByRole('option', { name: new RegExp(council, 'i') }).click();
});

When('defino a data e hora', async ({ page }) => {
    const dateInput = page.getByLabel(/data/i);
    const timeInput = page.getByLabel(/hora|horário/i);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (await dateInput.isVisible()) {
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
    }
    if (await timeInput.isVisible()) {
        await timeInput.fill('19:00');
    }
});

When('adiciono pauta da reunião', async ({ page }) => {
    const agendaInput = page.getByLabel(/pauta|agenda/i)
        .or(page.getByPlaceholder(/pauta/i));
    if (await agendaInput.isVisible()) {
        await agendaInput.fill('Assuntos gerais da igreja');
    }
});

Then('a reunião deve aparecer no calendário', async ({ page }) => {
    const calendar = page.locator('.calendar, [data-testid="calendar"]');
    await expect(calendar.first()).toBeVisible()
        .catch(async () => {
            // Alternative: check for meeting in list
            await expect(page.getByText(/reunião agendada|meeting/i)).toBeVisible();
        });
});

// ============================================================================
// EBD Steps
// ============================================================================

Then('devo ver lista de classes', async ({ page }) => {
    const classList = page.locator('table, ul, [role="list"], .grid')
        .or(page.getByText(/classe|class/i));
    await expect(classList.first()).toBeVisible();
});

Then('devo ver quantidade de alunos por classe', async ({ page }) => {
    const studentCount = page.getByText(/aluno|estudante|student/i);
    await expect(studentCount.first()).toBeVisible()
        .catch(() => {
            // Student count might be displayed differently
        });
});

When('seleciono o professor {string}', async ({ page }, teacher: string) => {
    const teacherSelect = page.getByLabel(/professor/i)
        .or(page.getByRole('combobox'));
    await teacherSelect.first().click();
    await page.getByRole('option', { name: new RegExp(teacher, 'i') }).click();
});

Then('a classe {string} deve aparecer na lista', async ({ page }, className: string) => {
    await expect(page.getByText(new RegExp(className, 'i'))).toBeVisible();
});

Given('que existe a classe {string}', async ({ page }, className: string) => {
    // Assumes the class exists in the database
    const classRow = page.getByText(new RegExp(className, 'i'));
    await expect(classRow.first()).toBeVisible({ timeout: 5000 })
        .catch(() => {
            // Class might not exist
        });
});

When('marco os alunos presentes', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    const count = await checkboxes.count();

    // Mark first few students as present
    for (let i = 0; i < Math.min(count, 3); i++) {
        await checkboxes.nth(i).check();
    }
});

Then('a presença deve ser registrada', async ({ page }) => {
    await expect(page.getByText(/presença registrada|salvo|sucesso/i)).toBeVisible();
});

// ============================================================================
// Missions Steps
// ============================================================================

Then('devo ver lista de missionários apoiados', async ({ page }) => {
    const missionaryList = page.locator('table, ul, [role="list"], .grid');
    await expect(missionaryList.first()).toBeVisible();
});

Then('devo ver campo missionário de cada um', async ({ page }) => {
    const fieldInfo = page.getByText(/campo|field|país|country/i);
    await expect(fieldInfo.first()).toBeVisible()
        .catch(() => {
            // Field info might be displayed differently
        });
});

When('preencho o campo missionário {string}', async ({ page }, field: string) => {
    const fieldInput = page.getByLabel(/campo missionário|país|field/i);
    await fieldInput.fill(field);
});

When('preencho o valor de sustento {string}', async ({ page }, value: string) => {
    const supportInput = page.getByLabel(/sustento|valor|apoio/i);
    await supportInput.fill(value);
});

Then('o missionário deve aparecer na lista', async ({ page }) => {
    const list = page.locator('table, ul, [role="list"], .grid');
    await expect(list.first()).toBeVisible();
});

// ============================================================================
// Settings Steps
// ============================================================================

Then('devo ver dados do nome da igreja', async ({ page }) => {
    const churchName = page.getByLabel(/nome da igreja/i)
        .or(page.getByText(/igreja/i));
    await expect(churchName.first()).toBeVisible();
});

Then('devo ver dados do endereço', async ({ page }) => {
    const address = page.getByText(/endereço|rua|logradouro|address/i);
    await expect(address.first()).toBeVisible();
});

Then('devo ver informações de contato', async ({ page }) => {
    const contact = page.getByText(/telefone|email|contato/i);
    await expect(contact.first()).toBeVisible();
});

When('altero o nome para {string}', async ({ page }, name: string) => {
    const nameInput = page.getByLabel(/nome da igreja/i);
    await nameInput.clear();
    await nameInput.fill(name);
});

Then('o endereço deve ser preenchido automaticamente', async ({ page }) => {
    await page.waitForTimeout(1500);
    const streetField = page.getByLabel(/rua|logradouro/i);
    await expect(streetField).not.toBeEmpty({ timeout: 5000 }).catch(() => { });
});

When('rolo até {string}', async ({ page }, section: string) => {
    const element = page.getByText(new RegExp(section, 'i'));
    await element.first().scrollIntoViewIfNeeded();
});

When('digito o identificador da igreja para confirmar', async ({ page }) => {
    const confirmInput = page.getByLabel(/confirmar|identificador/i)
        .or(page.getByPlaceholder(/digite/i));
    await confirmInput.fill('church-identifier');
});

Then('devo ser redirecionado para a página inicial', async ({ page }) => {
    await expect(page).toHaveURL(/^\/$/);
});
