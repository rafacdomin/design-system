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
