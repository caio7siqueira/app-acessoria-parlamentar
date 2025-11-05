import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Testes de Acessibilidade', () => {
  test('Combobox deve ser acessível', async ({ page }) => {
    await page.goto('/relatorios');
    
    // Espera a página carregar completamente
    await page.waitForLoadState('networkidle');
    
    // Abre um dos Combobox
    await page.click('[role="combobox"]');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Accordion deve ser acessível', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    
    // Gera relatório para exibir accordions
    await page.click('text=Gerar relatório');
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('FilterTags devem ser acessíveis', async ({ page }) => {
    await page.goto('/relatorios');
    await page.waitForLoadState('networkidle');
    
    // Seleciona filtros
    await page.click('[role="combobox"]');
    await page.click('text=Pendente');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Atendimentos page deve ser acessível', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Contatos page deve ser acessível', async ({ page }) => {
    await page.goto('/contatos');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Navegação por teclado deve funcionar em todos os botões', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    
    // Tab através dos elementos interativos
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(focusedElement);
  });

  test('Botões devem ter tamanho mínimo de 44x44px (Apple HIG)', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box && await button.isVisible()) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Contraste de cores deve atender WCAG AA', async ({ page }) => {
    await page.goto('/atendimentos');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Formulários devem ter labels ou aria-labels', async ({ page }) => {
    await page.goto('/atendimentos/novo');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    const labelViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'label' || v.id === 'aria-input-field-name'
    );
    expect(labelViolations.length).toBe(0);
  });
});
