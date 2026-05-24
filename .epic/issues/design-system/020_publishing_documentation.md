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

---

## Pesquisa

### 1. Links em Markdown no Monorepo

Os links para arquivos locais devem utilizar o endereço completo do repositório no GitHub apontando para a branch `main`:

- Exemplo: `[Guia de Publicação](https://github.com/rafacdomin/design-system/blob/main/PUBLISHING.md)`

### 2. Contexto de IA no AGENTS.md

O arquivo `AGENTS.md` funciona como barreira de segurança e contextualização para LLMs e agentes de codificação. Para evitar quebras nas esteiras de produção, os agentes devem ser explicitamente instruídos a não modificar arquivos como `tsup.config.ts`, `.github/workflows/*.yml` ou propriedades críticas de empacotamento no `package.json` sem alinhamento prévio.

---

## Implementação Planejada

### 1. Guia PUBLISHING.md na Raiz do Repositório

O novo arquivo de referência será criado na raiz do projeto (`PUBLISHING.md`) estruturado da seguinte forma:

- Seção 1: Arquitetura de Multi-Pipelines (diagrama Mermaid e triggers manuais com inputs SemVer)
- Seção 2: Preparação de Builds para Publicação (ESM/CJS e `.d.ts`)
- Seção 3: Autenticação e comandos de deploy NPM
- Seção 4: Configuração e deploy nativo de Storybook no GitHub Pages
- Seção 5: Notificações Slack/Teams/Discord via curl

### 2. Arquivo de Apontamento em references/PUBLISHING.md

Criaremos um arquivo simples em `references/PUBLISHING.md` contendo um apontamento em markdown para o arquivo principal da raiz `../PUBLISHING.md` ou sua URL no GitHub. Isso garante compatibilidade com ferramentas de análise que buscam arquivos de regra no diretório de referências.

### 3. Alterações nos Arquivos Existentes

- **`README.md` / `README_PT-BR.md`**: Adição de uma seção curta direcionando para o `PUBLISHING.md` usando a URL do GitHub na branch main.
- **`CONTRIBUTING.md` / `CONTRIBUTING_PT-BR.md`**: Inclusão de um novo tópico curto (passo 7) na seção de guias para orientar o fluxo de CI/CD, apontando para o `PUBLISHING.md` via URL no GitHub.
- **`AGENTS.md`**: Registro do link do guia sob "Onde encontrar as regras" e novas diretrizes de restrição sob "Não faça sem perguntar".

---

## Decisões Técnicas

- **Decisão: Centralizar detalhes no guia principal na raiz (PUBLISHING.md)**
  _Justificativa:_ Manter as regras operacionais de CI/CD visíveis logo no primeiro nível do repositório, facilitando o acesso direto por desenvolvedores e mantendo a leveza do README.
- **Decisão: Criar um ponteiro em references/PUBLISHING.md**
  _Justificativa:_ Mantém o padrão estrutural do diretório `references/` sem duplicar conteúdos.

---

## Checklist de Implementação

- [x] Criar o arquivo de documentação técnica principal `PUBLISHING.md` na raiz do repositório.
- [x] Documentar o fluxo de multi-pipelines com diagrama Mermaid e gatilhos de inputs SemVer no `PUBLISHING.md`.
- [x] Documentar as propriedades necessárias no `package.json` e script de compilação dos pacotes para NPM no `PUBLISHING.md`.
- [x] Documentar a autenticação com tokens NPM no `PUBLISHING.md`.
- [x] Documentar o fluxo de deploy nativo do Storybook no GitHub Pages no `PUBLISHING.md`.
- [x] Documentar a chamada HTTP POST via curl com payloads estruturados de notificações (Slack/Teams/Discord) no `PUBLISHING.md`.
- [x] Criar o arquivo de apontamento `references/PUBLISHING.md` direcionando para o arquivo principal da raiz.
- [x] Modificar `AGENTS.md` para linkar o novo guia no escopo de regras usando a URL do GitHub na branch main.
- [x] Inserir diretrizes restritivas de edição de pipelines e bundles no `AGENTS.md`.
- [x] Modificar `README.md` adicionando a seção **🚀 CI/CD & Publishing** e link correspondente (usando URL do GitHub).
- [x] Modificar `README_PT-BR.md` adicionando a seção **🚀 CI/CD & Publicação** e link correspondente (usando URL do GitHub).
- [x] Modificar `CONTRIBUTING.md` adicionando a subseção de integração contínua (com link do GitHub para o `PUBLISHING.md`).
- [x] Modificar `CONTRIBUTING_PT-BR.md` adicionando a subseção de integração contínua em português (com link do GitHub para o `PUBLISHING.md`).
- [x] Validar que todos os links externos do repositório no GitHub utilizam o prefixo `https://github.com/rafacdomin/design-system/blob/main/`.
- [x] Rodar o formatador geral `pnpm format` em toda a base de código.
- [x] Verificar a integridade do workspace com `git status`.
