# #020 — Documentação Completa de CI/CD e Publicação

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Criar o arquivo `references/PUBLISHING.md` detalhando toda a infraestrutura e arquitetura de CI/CD do repositório, e atualizar os guias principais do projeto (READMEs, CONTRIBUTINGs e diretrizes para agentes) para garantir que desenvolvedores humanos e agentes de IA estejam cientes do fluxo de deploys.

## Critérios de Aceite

- [ ] Criar o arquivo `references/PUBLISHING.md` descrevendo detalhadamente:
  - O design de Multi-Pipelines do GitHub Actions.
  - Como preparar as builds de produção das bibliotecas no `package.json`.
  - Como funciona a publicação automatizada no NPM via tokens de segurança.
  - O deploy do Storybook estático no GitHub Pages.
  - A formatação de payloads de webhooks das notificações de status.
- [ ] Atualizar o arquivo `AGENTS.md` na raiz do projeto com links para `references/PUBLISHING.md` e regras desencorajando edições não alinhadas em builders, bundlers e workflows de CI/CD.
- [ ] Atualizar os arquivos `README.md` e `README_PT-BR.md` com uma nova seção **🚀 CI/CD & Publishing** / **🚀 CI/CD & Publicação** mapeando os fluxos e contendo link para a documentação técnica oficial.
- [ ] Atualizar os arquivos `CONTRIBUTING.md` e `CONTRIBUTING_PT-BR.md` adicionando subseções explicativas sobre o fluxo de integração contínua e publicação para orientar os desenvolvedores.

## Cenários de Validação

- [ ] Validar que todos os links internos no formato `file:///` e links de referência no repositório apontam para os caminhos corretos e existentes.
- [ ] Executar o formatador Prettier em todos os arquivos modificados e garantir que não há erros visuais ou de quebra de markdown.

## Arquivos a Criar/Modificar

- `references/PUBLISHING.md` (Criar)
- `AGENTS.md` (Modificar)
- `README.md` (Modificar)
- `README_PT-BR.md` (Modificar)
- `CONTRIBUTING.md` (Modificar)
- `CONTRIBUTING_PT-BR.md` (Modificar)

## Dependências Externas

Nenhuma.

## Depende de

#017 (Release Pipelines), #018 (Storybook Deploy), #019 (Pipeline Notifications)

## Estimativa

P
