# #014 — Setup e Configuração do Playwright Local

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Instalar o Playwright no pacote `@ds/docs` e configurar a execução local dos testes de regressão visual contra a build estática do Storybook.

## Critérios de Aceite

- [x] Instalar `@playwright/test` como `devDependency` no pacote `@ds/docs`.
- [x] Criar o arquivo `packages/docs/playwright.config.ts` configurado para rodar localmente.
- [x] Configurar múltiplos navegadores locais: Chromium, Firefox e WebKit (Safari).
- [x] Configurar viewports de testes padrão:
  - `mobile`: width 375, height 812
  - `tablet`: width 768, height 1024
  - `desktop`: width 1280, height 800
- [x] Configurar o recurso `webServer` no Playwright para subir um servidor estático local (como `http-server` ou similar) na porta `6006` a partir do diretório `packages/docs/storybook-static`.
- [x] Adicionar scripts `"test:visual"` e `"test:visual:update"` no `packages/docs/package.json`.
- [x] Configurar o Turborepo (`turbo.json` na raiz) para registrar a tarefa `test:visual` com dependência direta do build estático (`build-storybook`) e de compilação dos pacotes locais.
- [x] Validar que `pnpm test:visual` na raiz executa com sucesso o pipeline do Playwright.

## Cenários de Validação

- [x] Executar o script `"test:visual"` e validar que a build estática do Storybook é inicializada no servidor local temporário e que o Playwright tenta executar os testes.
- [x] Executar `"test:visual:update"` e conferir se os diretórios de baselines locais são gerados no caminho esperado.

## Arquivos a Criar/Modificar

- `packages/docs/package.json` (Modificar)
- `packages/docs/playwright.config.ts` (Criar)
- `turbo.json` (Modificar)

## Dependências Externas

- `@playwright/test`
- `http-server` (ou similar)

## Depende de

#004 (Storybook Setup)

## Estimativa

M

---

## Pesquisa

### Melhores Práticas do Playwright para Testes de Regressão Visual

- **Instalação Local:** Playwright é instalado via `@playwright/test` e requer o download de binários do navegador via `playwright install`. No monorepo, instalamos no pacote `@ds/docs` pois é onde residem as configurações e stories do Storybook.
- **Uso de WebServer Integrado:** O Playwright oferece a opção `webServer` em seu arquivo de configuração. Essa funcionalidade lança automaticamente um servidor HTTP local antes de rodar os testes e o encerra ao terminar, mitigando a necessidade de gerenciar o ciclo de vida do servidor manualmente em scripts shell ou pipelines de CI.
- **Execução contra Build Estática:** Rodar testes contra a build de produção estática (`storybook-static`) gerada pelo `build-storybook` é mais estável e rápido do que rodar contra o servidor de desenvolvimento (`storybook dev`), além de garantir que estamos testando o bundle de produção dos componentes.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta

```
packages/docs/
├── playwright.config.ts  # Configuração de Viewports, Browsers e Servidor
└── package.json          # Adição de scripts de teste
```

### Esboço de `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/test-visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'webkit-tablet',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
  ],
  webServer: {
    command: 'npx http-server storybook-static -p 6006 --silent',
    port: 6006,
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Decisões Técnicas

- **Por que `http-server`?:** O `http-server` é um pacote npm extremamente leve e focado, ideal para servir a pasta `storybook-static/` na porta `6006` com baixa sobrecarga de CPU e memória.
- **Mapeamento de Engines de Browser:** Escolhemos Chromium, Firefox e WebKit localmente para garantir compatibilidade cruzada de CSS entre Blink (Chrome), Gecko (Firefox) e WebKit (Safari). As viewports foram configuradas explicitamente para simular resoluções de Desktop, Tablet (iPad Mini) e Mobile (iPhone 12).
- **Subir Servidor via Playwright vs Script Customizado:** Delegar o gerenciamento do servidor web ao Playwright (`webServer`) previne portas presas (port leaks) e garante que os testes só comecem quando a porta `6006` estiver de fato respondendo a requisições HTTP.

---

## Checklist de Implementação

1. [ ] Navegar até o diretório `packages/docs` para gerenciar dependências.
2. [ ] Instalar `@playwright/test` como `devDependency` no `packages/docs/package.json`.
3. [ ] Instalar `http-server` como `devDependency` no `packages/docs/package.json`.
4. [ ] Configurar os diretórios gerados pelo Playwright (`playwright-report/`, `test-results/`) no arquivo `.gitignore` da raiz do projeto.
5. [ ] Criar o arquivo `packages/docs/playwright.config.ts` no diretório do pacote de documentação.
6. [ ] Configurar a pasta de testes (`testDir`) apontando para `./src/test-visual`.
7. [ ] Configurar a política de paralelismo e workers no `playwright.config.ts`.
8. [ ] Definir a URL base (`baseURL`) dos testes como `http://localhost:6006`.
9. [ ] Configurar o projeto `chromium-desktop` com viewport `1280x800`.
10. [ ] Configurar o projeto `firefox-desktop` with viewport `1280x800`.
11. [ ] Configurar o projeto `webkit-desktop` com viewport `1280x800`.
12. [ ] Configurar o projeto `webkit-mobile` com perfil de `iPhone 12` (viewport `375x812`).
13. [ ] Configurar o projeto `webkit-tablet` com perfil de `iPad Mini` (viewport `768x1024`).
14. [ ] Configurar o bloco `webServer` para executar o `http-server` servindo `storybook-static` na porta `6006`.
15. [ ] Adicionar o script `"test:visual"` no `package.json` do `@ds/docs`: `"playwright test"`.
16. [ ] Adicionar o script `"test:visual:update"` no `package.json` do `@ds/docs`: `"playwright test --update-snapshots"`.
17. [ ] Configurar a tarefa `"test:visual"` no `turbo.json` da raiz, marcando dependência do pipeline `"build"` e mapeando saídas apropriadas.
18. [ ] Adicionar scripts globais de conveniência no `package.json` da raiz para facilitar execução dos testes visuais.
19. [ ] Compilar localmente o Storybook executando `pnpm build` para assegurar que a pasta `storybook-static` está presente.
20. [ ] Executar `pnpm --filter @ds/docs test:visual` para validar que o setup inicia a execução dos testes com sucesso.
