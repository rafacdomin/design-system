# #019 — Integração de Notificações via Webhook

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Configurar as etapas de notificação de sucesso e falha via webhook nas pipelines de liberação (`release-core` e `release-carousel`) e deploy (`deploy-storybook`), enviando payloads formatados para Slack, Discord ou Microsoft Teams de forma segura.

## Critérios de Aceite

- [ ] Adicionar etapas condicionais de sucesso (`if: success()`) e falha (`if: failure()`) no final de cada um dos workflows (`release-core.yml`, `release-carousel.yml` e `deploy-storybook.yml`).
- [ ] Implementar o envio de notificações utilizando `curl` nativo na máquina de execução do GitHub Actions.
- [ ] As URLs dos webhooks devem ser obtidas de segredos do repositório no GitHub:
  - `SLACK_WEBHOOK_URL`
  - `DISCORD_WEBHOOK_URL`
  - `TEAMS_WEBHOOK_URL`
- [ ] Implementar verificação de presença do segredo antes do envio, para garantir degradação amigável (o pipeline não deve falhar se o segredo não estiver configurado).
- [ ] Formatar o payload do Slack com blocos markdown ricos incluindo o nome da lib, a versão publicada e o link da execução do job.
- [ ] Formatar o payload do Discord com o conteúdo da mensagem e URL do deploy no Storybook.
- [ ] Formatar o payload do Microsoft Teams usando a especificação de Adaptive Cards.

## Cenários de Validação

- [ ] Simular um deploy com sucesso (com URLs mockadas ou segredos reais) e verificar se o payload enviado corresponde ao schema aceito pelas APIs de webhook de cada plataforma.
- [ ] Simular uma falha induzida e certificar-se de que a notificação de erro é disparada e o status da pipeline não falha devido à chamada do `curl`.

## Arquivos a Criar/Modificar

- `.github/workflows/release-core.yml` (Modificar)
- `.github/workflows/release-carousel.yml` (Modificar)
- `.github/workflows/deploy-storybook.yml` (Modificar)

## Dependências Externas

Nenhuma.

## Depende de

#017 (Release Pipelines), #018 (Storybook Deploy)

## Estimativa

P

---

## Pesquisa

### 1. Chamadas de Webhook no GitHub Actions

Para enviar dados formatados em JSON para webhooks, a ferramenta mais comum e portável instalada nos runners do GitHub Actions (Ubuntu) é o `curl`:

```bash
curl -X POST -H 'Content-Type: application/json' -d '<json-payload>' <webhook-url>
```

### 2. Formato de Payloads Ricos

- **Slack:** O Slack aceita payloads simples via campo `text` ou estruturas mais complexas usando o padrão Block Kit.
- **Discord:** O Discord aceita um payload simples usando o campo `content` ou objetos de embeds para formatação enriquecida com cores.
- **Microsoft Teams:** O Teams utiliza Adaptive Cards para exibir blocos adaptáveis e botões interativos diretamente no chat.

### 3. Evitando Vazamentos de Chaves nos Logs

Por padrão, segredos referenciados via `${{ secrets.* }}` são mascarados como `***` pelo GitHub. Contudo, é uma boa prática não realizar `echo` de URLs completas e garantir que o webhook seja consumido diretamente pelo comando de envio.

---

## Implementação Planejada

As etapas de notificação serão anexadas ao final dos jobs `ci-cd-core`, `ci-cd-carousel` e `deploy-storybook`.
Elas lerão a versão do pacote dinamicamente via script Node:

```bash
PACKAGE_VERSION=$(node -p "require('./packages/<pacote>/package.json').version")
```

Em seguida, testarão a existência de cada segredo individualmente antes de executar o `curl`.

---

## Decisões Técnicas

- **Decisão: Uso de curl em Bash Shell Nativo**
  _Justificativa:_ Usar actions de terceiros para notificações de Slack/Discord adiciona dependências externas no monorepo e limita a customização dos payloads. O uso de `curl` é leve, imediato, flexível e totalmente adaptável para qualquer plataforma que aceite requisições HTTP POST.
- **Decisão: Degradação Segura (Graceful Degradation)**
  _Justificativa:_ Caso um repositório clonado ou um fork não possua os segredos de webhook configurados, os testes de presença `[ -n "$SECRET_URL" ]` evitam falhas no job de CI/CD, permitindo deploys de Storybook e publicações limpas.

---

## Checklist de Implementação

- [x] Identificar a seção de notificações de sucesso em `.github/workflows/release-core.yml`.
- [x] Validar a leitura dinâmica de versão do `@ds/core` via Node.js em ambiente bash.
- [x] Validar que o payload do Discord em `release-core.yml` inclui o nome do pacote e versão.
- [x] Validar que o payload do Slack em `release-core.yml` está devidamente formatado.
- [x] Validar que o payload do Teams (Adaptive Card) está especificado com a URL de schema e versão corretas.
- [x] Identificar a seção de notificações de falha em `.github/workflows/release-core.yml`.
- [x] Validar o payload do Slack, Discord e Teams para casos de falha na pipeline de core.
- [x] Repetir a validação para o arquivo `.github/workflows/release-carousel.yml`.
- [x] Ajustar a leitura dinâmica de versão do `@ds/carousel` no script bash de sucesso.
- [x] Validar o comportamento sob falha no workflow do `@ds/carousel`.
- [x] Identificar a seção de notificações de sucesso e falha em `.github/workflows/deploy-storybook.yml`.
- [x] Mapear o link do deploy `${{ steps.deployment.outputs.page_url }}` nos payloads de sucesso do Storybook.
- [x] Garantir que todas as chamadas `curl` utilizam a flag `-H "Content-Type: application/json"`.
- [x] Validar se as aspas simples e duplas nos scripts de shell não quebram a sintaxe do JSON enviado.
- [x] Verificar a sintaxe geral de todas as pipelines com as chamadas de webhook integradas.
