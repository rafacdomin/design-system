# #016 — Integração dos Testes Visuais com o Browserstack

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Configurar o Playwright e o pipeline de execução para rodar os testes visuais de regressão contra navegadores reais na grade remota do Browserstack em ambiente de Integração Contínua (CI).

## Critérios de Aceite

- [ ] Modificar o `packages/docs/playwright.config.ts` para detectar as variáveis de ambiente `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`.
- [ ] Implementar a conexão via WebSocket CDP (Chrome DevTools Protocol) com o endpoint de Playwright do Browserstack:
      `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`
- [ ] Configurar a matriz de capacidades do Browserstack com combinações de sistemas operacionais e navegadores reais (ex: Windows 11 Chrome, macOS Sonoma Safari, etc.).
- [ ] Configurar o túnel local do Browserstack (`browserstack-local`) ou usar a SDK oficial para que as máquinas virtuais do Browserstack consigam acessar a build estática local do Storybook servida na porta `6006`.
- [ ] Adicionar script `"test:visual:ci"` no `packages/docs/package.json` para englobar a execução remota direcionada.
- [ ] Assegurar que credenciais sensíveis não fiquem expostas ou versionadas nos arquivos de configuração do projeto.

## Cenários de Validação

- [ ] Simular a execução em CI com credenciais (válidas ou simuladas) e garantir que o Playwright direciona a execução para o host do Browserstack e inicia a sessão remota.
- [ ] Verificar que logs de status e resultados de teste são reportados corretamente no terminal e integrados de volta.

## Arquivos a Criar/Modificar

- `packages/docs/playwright.config.ts` (Modificar)
- `packages/docs/package.json` (Modificar)

## Dependências Externas

- `browserstack-node-sdk` (opcional/se necessário para gerenciamento simplificado)

## Depende de

#015 (Teste de Varredura Dinâmica)

## Estimativa

M

## Pesquisa

### Conexão via WebSocket CDP no BrowserStack

Para conectar o Playwright ao BrowserStack sem o uso de SDK externo que gerencie tudo e de forma customizada, utilizamos o parâmetro `connectOptions` no `playwright.config.ts`.
O endpoint de WebSocket é estruturado como:
`wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`

### Segurança de Credenciais

Credenciais do BrowserStack devem ser lidas exclusivamente de variáveis de ambiente do sistema (`BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`). Nunca devem ser gravadas em disco ou versionadas em arquivos de configuração públicos.

### Túnel Local (`browserstack-local`)

Para expor a build local do Storybook servido na porta `6006` para os servidores do BrowserStack, precisamos inicializar e encerrar o túnel utilizando a biblioteca oficial `browserstack-local` nos hooks `globalSetup` e `globalTeardown` do Playwright.

---

## Decisões Técnicas

1. **Gestão do Túnel Local via hooks do Playwright**:
   Faremos a inicialização de `browserstack-local` programaticamente dentro do `globalSetup` e o encerramento no `globalTeardown`. A instância do túnel local é compartilhada entre os processos de inicialização e encerramento através do objeto global `globalThis` mapeado de forma tipada, sem utilizar `any`.

2. **Detecção Dinâmica da Versão do Playwright**:
   Para evitar incompatibilidades entre o cliente de testes local e os navegadores do BrowserStack, leremos a versão do `@playwright/test` dinamicamente de `packages/docs/package.json` em tempo de execução, alimentando a capabilidade `client.playwrightVersion`.

3. **Fallback Automático para Execução Local**:
   O `playwright.config.ts` detectará a flag `RUN_ON_BROWSERSTACK === 'true'`. Se não estiver ativada, o comportamento padrão executará os navegadores locais (Chromium, Firefox e WebKit), garantindo que desenvolvedores possam rodar testes visuais locais sem necessidade de credenciais.

4. **Matriz de Projetos Remotos**:
   Mapearemos nossos testes para:
   - Chrome em Windows 11 (`1280x800`)
   - Firefox em Windows 11 (`1280x800`)
   - Safari em macOS Sonoma (`1280x800`)
   - Safari em macOS Sonoma com viewport emulado móvel (`375x812`)
   - Safari em macOS Sonoma com viewport emulado tablet (`768x1024`)

---

## Implementação Planejada

### Estrutura de Arquivos

Mapeamento de arquivos novos e modificados:

- [NEW] `packages/docs/src/test-visual/browserstack-setup.ts`
- [NEW] `packages/docs/src/test-visual/browserstack-teardown.ts`
- [MODIFY] `packages/docs/playwright.config.ts`
- [MODIFY] `packages/docs/package.json`
- [MODIFY] `package.json`
- [MODIFY] `turbo.json`

---

## Checklist de Implementação

- [x] Instalar o pacote `browserstack-local` como dependência de desenvolvimento no pacote `@rafacdomin/ds-docs` (`pnpm --filter @rafacdomin/ds-docs add -D browserstack-local`).
- [x] Criar o arquivo `packages/docs/src/test-visual/browserstack-setup.ts` para gerenciar o início do túnel local.
- [x] Implementar validação da presença de `BROWSERSTACK_ACCESS_KEY` no `browserstack-setup.ts`.
- [x] Iniciar a conexão do túnel `browserstack-local` e expor a instância em `globalThis.__bsLocal__` de forma segura (sem usar `any`).
- [x] Criar o arquivo `packages/docs/src/test-visual/browserstack-teardown.ts` para gerenciar o encerramento do túnel.
- [x] Implementar a lógica de parada de `globalThis.__bsLocal__` no teardown.
- [x] Modificar o `packages/docs/playwright.config.ts` para carregar condicionalmente o `globalSetup` e `globalTeardown` se a flag de BrowserStack estiver ativada.
- [x] Adicionar lógica de validação de credenciais (`BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`) caso `RUN_ON_BROWSERSTACK === 'true'`.
- [x] Ler a versão instalada do `@playwright/test` a partir do `package.json` do pacote de documentação em tempo de execução para alimentar `client.playwrightVersion`.
- [x] Definir a função auxiliar `getBrowserStackWS(projectName, caps)` para codificar e expor a URL de conexão CDP para cada projeto BrowserStack.
- [x] Configurar os projetos remotos no `playwright.config.ts` utilizando as capacidades apropriadas de OS e navegadores de forma condicional.
- [x] Garantir que o `webServer` seja mantido ativo no arquivo de configuração do Playwright, servindo o Storybook estático localmente para o túnel.
- [x] Adicionar script `"test:visual:ci"` no arquivo `packages/docs/package.json` ativando a flag `RUN_ON_BROWSERSTACK=true`.
- [x] Adicionar atalho para o script `"test:visual:ci"` no `package.json` raiz via Turborepo.
- [x] Configurar a tarefa `test:visual:ci` no `turbo.json` com dependência no build do Storybook e cache nos diretórios de output do Playwright.
- [x] Testar se a execução sem credenciais adequadas falha de forma informativa e clara.
- [x] Validar a configuração rodando localmente (sem a flag) para garantir que o comportamento padrão de execução local continua intacto.
- [x] Validar as regras de tipagem do TypeScript do design system, garantindo que não existam instâncias de `any` ou asserções inseguras nos arquivos criados.
