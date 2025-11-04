import { test, expect } from '@playwright/test';

test.describe('Testes de Snapshot Visual', () => {
  test('Atendimentos - Light Mode', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('atendimentos-light.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Atendimentos - Dark Mode', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    
    // Ativa dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await expect(page).toHaveScreenshot('atendimentos-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Contatos - Light Mode', async ({ page }) => {
    await page.goto('/contatos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('contatos-light.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Contatos - Dark Mode', async ({ page }) => {
    await page.goto('/contatos');
    await page.waitForLoadState('networkidle');
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await expect(page).toHaveScreenshot('contatos-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Relatórios - Light Mode', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('relatorios-light.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Relatórios - Dark Mode', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await expect(page).toHaveScreenshot('relatorios-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Combobox - Aberto com Chips', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    
    // Abre combobox e seleciona opção
    await page.click('[role="combobox"]');
    await page.click('text=Pendente');
    
    // Abre novamente para capturar estado com chips
    await page.click('[role="combobox"]');
    
    await expect(page.locator('[role="combobox"]').first()).toHaveScreenshot('combobox-with-chips.png');
  });

  test('FilterTags - Com múltiplos filtros', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    
    // Adiciona múltiplos filtros
    await page.click('[role="combobox"]');
    await page.click('text=Pendente');
    
    const filterSection = page.locator('.border-t').first();
    await expect(filterSection).toHaveScreenshot('filter-tags-multiple.png');
  });

  test('Accordion - Animação de abertura', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    
    // Gera relatório
    await page.click('text=Gerar relatório');
    await page.waitForTimeout(1000);
    
    // Localiza e clica em accordion
    const accordion = page.locator('[role="button"]').filter({ hasText: 'Por status' }).first();
    await accordion.click();
    await page.waitForTimeout(300); // Espera animação completar
    
    await expect(page).toHaveScreenshot('accordion-open.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Testes Responsivos - iPhone', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Atendimentos - Mobile', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('atendimentos-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Contatos - Mobile', async ({ page }) => {
    await page.goto('/contatos');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('contatos-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Relatórios - Mobile', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('relatorios-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('Swipe gesture - Accordion (iOS)', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    
    // Gera relatório
    await page.click('text=Gerar relatório');
    await page.waitForTimeout(1000);
    
    // Abre accordion
    const accordion = page.locator('[role="button"]').filter({ hasText: 'Por status' }).first();
    await accordion.click();
    await page.waitForTimeout(300);
    
    // Simula swipe down
    const content = page.locator('[role="region"]').first();
    await content.dragTo(content, { 
      sourcePosition: { x: 50, y: 10 },
      targetPosition: { x: 50, y: 100 }
    });
    
    await page.waitForTimeout(300);
    
    // Verifica se fechou
    await expect(content).not.toBeVisible();
  });
});
