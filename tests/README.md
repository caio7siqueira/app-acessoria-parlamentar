# Testes Automatizados

## Estrutura

Este projeto inclui testes de acessibilidade e visuais usando Playwright.

### Tipos de Testes

1. **Acessibilidade (axe-core)**

   - Valida conformidade WCAG 2.0 AA e WCAG 2.1 AA
   - Testa todos os componentes principais (Combobox, Accordion, FilterTags)
   - Verifica todas as páginas (Atendimentos, Contatos, Relatórios)

2. **Visual Snapshots (Playwright)**
   - Capturas de tela em light mode e dark mode
   - Testes responsivos (desktop e iPhone 375×812)
   - Valida estados de componentes (aberto, fechado, com seleção)
   - Testa animações e gestos (swipe, drag)

## Comandos

```bash
# Todos os testes
npm test

# Apenas acessibilidade
npm run test:a11y

# Apenas snapshots visuais
npm run test:visual

# Interface interativa
npm run test:ui
```

## Executar Testes

1. Certifique-se de que o servidor está rodando:

```bash
npm run dev
```

2. Em outro terminal, execute os testes:

```bash
npm test
```

## Atualizar Snapshots

Quando o design mudar intencionalmente:

```bash
npx playwright test --update-snapshots
```

## Relatórios

Após executar os testes, abra o relatório HTML:

```bash
npx playwright show-report
```

## Estrutura de Arquivos

```
tests/
  ├── accessibility.spec.ts  # Testes axe-core (a11y)
  └── visual.spec.ts         # Testes de snapshot visual
```

## Conformidade WCAG

Todos os componentes devem passar nos seguintes critérios:

- ✅ WCAG 2.0 Level A
- ✅ WCAG 2.0 Level AA
- ✅ WCAG 2.1 Level A
- ✅ WCAG 2.1 Level AA

### Verificações Principais

- Contraste de cores (mínimo 4.5:1 para texto)
- Navegação por teclado completa
- Labels ARIA apropriados
- Estados focáveis visíveis
- Ordem de tabulação lógica
- Alternativas textuais para ícones
- Touch targets ≥44px (mobile)
