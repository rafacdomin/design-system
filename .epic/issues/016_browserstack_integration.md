# #016 — Integração dos Testes Visuais com o Browserstack

## Status

`[ ] A Fazer` `[ ] Em progresso` `[ ] Concluído`

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
