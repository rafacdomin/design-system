# #001 — Setup do Monorepo & Tooling

## Status

`[ ] Planejada` `[ ] Em desenvolvimento` `[x] Concluída`

## Objetivo

Configurar a fundação do monorepo utilizando Turborepo e pnpm workspaces, bem como configurar as ferramentas de qualidade globais: TypeScript, ESLint (flat config), Prettier e Husky com lint-staged na raiz do repositório.

## Critérios de Aceite

- [x] Inicializar `package.json` na raiz configurado para monorepo privado (`"private": true`) com workspaces definidos para `packages/*`.
- [x] Criar arquivo `pnpm-workspace.yaml` contendo a especificação dos workspaces (`packages/*`).
- [x] Configurar `tsconfig.json` na raiz com as regras estritas globais (TypeScript 5, strict mode, etc.) para que pacotes possam herdá-lo.
- [x] Configurar `eslint.config.js` (Flat Config) e `.prettierrc` globais na raiz, garantindo padrões uniformes de formatação e linting.
- [x] Inicializar o Husky (`.husky/pre-commit`) para executar o `lint-staged` antes de cada commit.
- [x] Configurar `.lintstagedrc.json` na raiz para rodar prettier e eslint apenas nos arquivos staged.
- [x] Configurar a base do `turbo.json` especificando as pipelines de build, test, lint e storybook.
- [x] Criar esqueleto inicial da pasta `packages/core` e `packages/docs` com seus respectivos arquivos `package.json` provisórios.

---

## Pesquisa

### Turborepo e pnpm

Turborepo fornece uma maneira rápida de executar scripts em monorepos através de caching inteligente de tarefas (outputs de build e logs de testes). pnpm workspaces cuida da resolução eficiente de dependências locais usando links simbólicos rígidos (hard links), evitando a duplicação no disco (diferente de npm e yarn clássicos).

### ESLint Flat Config (eslint.config.js)

No ESLint v9+, a configuração padrão passou a ser o Flat Config. Ela simplifica a resolução de plugins, que são importados diretamente como módulos JavaScript normais, em vez de serem strings resolvidas pelo linter. Exemplo de estrutura:

```javascript
import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default ts.config(js.configs.recommended, ...ts.configs.recommended, {
  plugins: { react },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
})
```

---

## Decisões Técnicas

1.  **Workspaces com pnpm:** Escolhido pela velocidade de instalação e pela estrutura estrita do `node_modules` que previne o uso de dependências fantasmas.
2.  **Configuração Estendida de TypeScript:** O arquivo raiz `tsconfig.json` conterá as opções de compilador estritas globais. Os subpacotes (`packages/core`, etc.) estenderão essa configuração base usando a propriedade `"extends": "../../tsconfig.json"`.
3.  **Flat Config para ESLint (`eslint.config.js`):** Adotado por ser o padrão de mercado atual e compatível com as versões mais recentes das ferramentas de linting de React e TypeScript.
4.  **Husky e lint-staged:** Configurado para rodar no gancho de `pre-commit` do git. Isso impede que códigos com erros de digitação, lint ou formatação cheguem ao repositório remoto.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta na Raiz

#### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
```

#### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "storybook-static/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "storybook": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### `tsconfig.json` (Raiz)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Checklist de Implementação

### 1. Inicialização da Raiz e Dependências

- [x] [x] 1.1 Criar ou atualizar o `package.json` na raiz declarando `"private": true` e definindo os scripts do Turborepo.
- [x] [x] 1.2 Criar o arquivo `pnpm-workspace.yaml` definindo os workspaces (`packages/*`).
- [x] [x] 1.3 Criar o `turbo.json` com os pipelines padrão.
- [x] [x] 1.4 Instalar dependências globais de desenvolvimento na raiz do repositório (`pnpm add -wD turbo typescript eslint prettier husky lint-staged @types/react @types/react-dom`).

### 2. Configurações de Qualidade e Compilador

- [x] [x] 2.1 Criar o `tsconfig.json` na raiz com as regras estritas globais do compilador.
- [x] [x] 2.2 Criar o arquivo de configuração do Prettier (`.prettierrc`) e seu correspondente `.prettierignore`.
- [x] [x] 2.3 Criar a configuração Flat Config do ESLint (`eslint.config.js`) na raiz, adicionando suporte a React 18 e TypeScript.
- [x] [x] 2.4 Criar arquivo `.eslintignore` ou regras de exclusão no próprio `eslint.config.js`.

### 3. Git Hooks (Husky & lint-staged)

- [x] [x] 3.1 Inicializar o Husky na raiz usando `pnpm exec husky init`.
- [x] [x] 3.2 Configurar o script de ciclo de vida `"prepare": "husky"` no `package.json` da raiz.
- [x] [x] 3.3 Configurar o hook `.husky/pre-commit` para chamar `pnpm exec lint-staged`.
- [x] [x] 3.4 Criar o arquivo `.lintstagedrc.json` na raiz configurando o lint e prettier para arquivos staged (`*.ts`, `*.tsx`, `*.scss`, `*.json`).

### 4. Esqueletos dos Pacotes do Monorepo

- [x] [x] 4.1 Criar pasta `packages/core` contendo `package.json` (declarando o nome `@rafacdomin/ds-core`), `tsconfig.json` (herdando da raiz) e estrutura básica `src/index.ts`.
- [x] [x] 4.2 Criar pasta `packages/docs` contendo `package.json` (declarando o nome `@rafacdomin/ds-docs`), `tsconfig.json` (herdando da raiz) e arquivo base.
- [x] [x] 4.3 Rodar `pnpm install` na raiz para sincronizar os workspaces e gerar os links locais.

### 5. Validação do Pipeline

- [x] [x] 5.1 Adicionar scripts de teste de lint e format no `package.json` raiz e nos pacotes locais para validar a orquestração via Turborepo.
- [x] [x] 5.2 Executar `pnpm run lint` e garantir saída limpa.
- [x] [x] 5.3 Executar `pnpm run format` e garantir formatação de arquivos.
- [x] [x] 5.4 Simular um commit local para garantir que o Husky intercepta o processo e executa o `lint-staged`.
