# Especificação Geral — Design System MCP Server (SPEC.md)

Este documento especifica a arquitetura, as ferramentas, a stack técnica e a estratégia de implementação do servidor MCP (Model Context Protocol) para o design system.

O objetivo do servidor MCP é fornecer a agentes de IA integrados em IDEs de desenvolvimento acesso a metadados em tempo real do design system, viabilizando a geração de código front-end consistente com os padrões e tokens do projeto.

---

## 1. Visão Geral

Ao desenvolver interfaces de usuário, assistentes de IA frequentemente alucinam nomes de componentes, APIs de propriedades (props), classes de utilidade CSS ou ignoram tokens de marca específicos.
O **Design System MCP Server** resolve isso expondo os componentes disponíveis, suas diretrizes de acessibilidade, estruturas de props e design tokens através de um protocolo padronizado.

### Objetivos Principais:

- Permitir a descoberta de componentes disponíveis (`@ds/core`, `@ds/carousel`).
- Fornecer a documentação de acessibilidade de cada componente em formato estruturado.
- Entregar valores exatos de design tokens (cores, fontes, espaçamento).
- Fornecer snippets de código de uso correto e integração com o sistema de temas (`withTheme`).

---

## 2. Stack Técnica

- **Protocolo:** Model Context Protocol (MCP).
- **SDK do Servidor:** `@modelcontextprotocol/sdk` (v1.0.1+).
- **Ambiente de Execução:** Node.js v20.19.0+ e TypeScript.
- **Bundler:** `tsup` para compilar o servidor em um pacote ESM executável autônomo com declaração de tipos.
- **Transporte padrão:** `StdioServerTransport` (comunicação JSON-RPC bidirecional via entrada e saída padrão `stdin`/`stdout`).
- **Gerenciador de Pacotes:** `pnpm` workspaces.
- **Framework de Testes:** Vitest.

---

## 3. Estrutura no Monorepo

O servidor MCP será implementado como um novo workspace dentro da pasta `packages/mcp-server`:

```text
packages/mcp-server/
├── src/
│   ├── __tests__/        # Testes unitários e de integração JSON-RPC
│   │   └── server.test.ts
│   ├── tools/            # Implementação de ferramentas MCP individuais
│   │   ├── components.ts
│   │   ├── tokens.ts
│   │   └── index.ts
│   ├── resources/        # Definição e carregamento de recursos estáticos/documentações
│   │   └── index.ts
│   └── index.ts          # Inicialização e loop do servidor MCP
├── tsconfig.json         # Configurações estritas do TypeScript
├── tsup.config.ts        # Script de build de produção do servidor
└── package.json          # Manifesto do pacote
```

Ele será adicionado à lista de workspaces no `pnpm-workspace.yaml`.

---

## 4. Design Tokens Expostos (Design Tokens Tool)

O servidor MCP lerá as especificações de design tokens de `references/DESIGN_TOKENS.md` ou de definições internas estruturadas e os fornecerá via ferramenta.

### Ferramenta: `get_design_tokens`

- **Descrição:** Retorna a lista completa de custom properties de CSS do Design System categorizadas.
- **Retorno:** Estrutura JSON contendo:
  - `typography`: Famílias, tamanhos, pesos e line-heights.
  - `colors`: Escala neutra de HSL/HEX por tema (Light/Dark) e cores de acento (`--ds-color-danger`, `--ds-color-focus-ring`).
  - `spacing`: Escala linear de espaçamentos (de `--ds-spacing-1` a `--ds-spacing-16`).
  - `borders`: Border radius e border width.
  - `shadows`: Sombras do sistema (`--ds-shadow-sm` a `--ds-shadow-lg`).
  - `breakpoints`: Pontos de quebra de responsividade.

---

## 5. Ferramentas do Componente (Component Tools)

O servidor disponibilizará ferramentas para expor detalhes dos componentes do design system.

### Ferramenta: `list_components`

- **Descrição:** Lista o nome de todos os componentes disponíveis no design system baseando-se no que está exportado pelos pacotes `@ds/core` e `@ds/carousel`.
- **Retorno:** `string[]` (ex: `["Button", "Input", "Textarea", "Dropdown", "Modal", "Carousel"]`).

### Ferramenta: `get_component_api`

- **Parâmetros:**
  - `componentName` (string): O nome do componente a inspecionar.
- **Descrição:** Extrai a assinatura do componente e a interface de Props com comentários JSDoc associados.
- **Retorno:** Estrutura JSON com a lista de propriedades, tipo, valor padrão, obrigatoriedade e descrição de uso.

### Ferramenta: `get_component_spec`

- **Parâmetros:**
  - `componentName` (string): O nome do componente a inspecionar.
- **Descrição:** Retorna os requisitos de acessibilidade (regras WCAG 2.1 AA, navegação via teclado, atributos ARIA necessários) e estados visuais exigidos descritos em `references/COMPONENT_SPEC.md`.

### Ferramenta: `get_component_examples`

- **Parâmetros:**
  - `componentName` (string): O nome do componente a inspecionar.
- **Descrição:** Retorna trechos práticos de uso em React (JSX/TSX) e integração com o sistema de temas (`withTheme`).

---

## 6. Recursos do MCP (Resources)

Recursos expõem arquivos estáticos legíveis por agentes de IA utilizando esquemas de URI.

O servidor registrará as seguintes URIs de Recursos:

- `design-system://docs/accessibility` -> Conteúdo integral de `references/ACCESSIBILITY.md`.
- `design-system://docs/theming` -> Conteúdo integral de `references/THEMING.md`.
- `design-system://docs/architecture` -> Conteúdo integral de `references/ARCHITECTURE.md`.
- `design-system://docs/workflow` -> Conteúdo integral de `references/WORKFLOW.md`.

---

## 7. Estratégia de Testes

Seguindo a política rígida de TDD do projeto:

- **Testes Unitários:** Testar os parsers de documentação e as resoluções de caminho.
- **Testes de Integração:** Simular o ciclo de vida do servidor MCP rodando `Vitest`. Enviamos requisições mockadas no padrão JSON-RPC (ex: `initialize`, `tools/list`, `tools/call`) para a stream stdin e lemos a stream stdout correspondente para verificar se os retornos estão de acordo com o protocolo MCP.
- **Acessibilidade:** N/A para o servidor de terminal, mas as regras de acessibilidade descritas em ferramentas do MCP devem bater com as especificações WCAG 2.1 AA.
- **Zero any:** Regra rígida aplicada. Todo payload JSON-RPC deve ser tipado utilizando as interfaces do próprio SDK do MCP ou tipos estritos.

---

## 8. Critérios de Done (Definição de Pronto)

1. Novo workspace `packages/mcp-server` criado e integrado ao `pnpm-workspace.yaml`.
2. Servidor MCP implementado e compilado com sucesso via `pnpm build`.
3. Ferramentas `list_components`, `get_component_api`, `get_component_spec`, `get_design_tokens` e `get_component_examples` implementadas e retornando payloads válidos.
4. Recursos `design-system://docs/*` registrados e carregando a documentação markdown correspondente.
5. 100% dos testes unitários e de integração passando.
6. Zero tipos `any` ou asserções inseguras no TypeScript.
7. Script de inicialização configurado (`pnpm mcp` ou `pnpm --filter @ds/mcp-server start`).
