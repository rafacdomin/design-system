# #018 — Pipeline de Deploy do Storybook no GitHub Pages

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Configurar o workflow do GitHub Actions para gerar a build estática do Storybook e publicá-la automaticamente no GitHub Pages sempre que uma biblioteca for publicada com sucesso, ou manualmente quando solicitado.

## Critérios de Aceite

- [ ] Criar o arquivo `.github/workflows/deploy-storybook.yml`.
- [ ] Definir o gatilho automático escutando a conclusão com sucesso dos workflows de release das libs (`workflow_run` com workflows `Release Core Package` e `Release Carousel Package` e tipo `completed`).
- [ ] Definir o gatilho manual (`workflow_dispatch`).
- [ ] Declarar as permissões de gravação exigidas pelo GitHub Pages no arquivo do workflow (`pages: write`, `id-token: write`).
- [ ] Adicionar controle de concorrência (`concurrency`) para evitar deploys simultâneos corrompendo a build ativa do GitHub Pages.
- [ ] Executar o build estático de todo o monorepo (`pnpm build`) antes do Storybook para garantir que as dependências internas do workspaces estejam resolvidas.
- [ ] Gerar o Storybook estático utilizando o script `pnpm --filter @ds/docs build-storybook` direcionando para a pasta `packages/docs/storybook-static`.
- [ ] Realizar o deploy usando as actions oficiais e recomendadas pelo GitHub:
  - `actions/configure-pages@v5`
  - `actions/upload-pages-artifact@v3` (apontando para a pasta estática gerada)
  - `actions/deploy-pages@v4` (recuperando a URL do deploy correspondente).

## Cenários de Validação

- [ ] Verificar se o workflow é iniciado de forma correta ao disparar manualmente.
- [ ] Garantir que se a pipeline de origem (`release-core` ou `release-carousel`) falhar, o deploy automático não é acionado (usando a validação condicional de sucesso no job).
- [ ] Confirmar se o deploy é publicado na URL pública do GitHub Pages do repositório.

## Arquivos a Criar/Modificar

- `.github/workflows/deploy-storybook.yml` (Criar)

## Dependências Externas

Nenhuma.

## Depende de

#004 (Storybook Setup), #017 (Release Pipelines)

## Estimativa

M
