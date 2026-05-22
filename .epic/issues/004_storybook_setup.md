# #004 — Configuração do Storybook 8

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Configurar e inicializar o Storybook 8 no pacote `@ds/docs` para servir como ambiente isolado de visualização, documentação interativa e sandbox dos componentes de `@ds/core`.

## Critérios de Aceite

- [x] Inicializar o Storybook 8 no diretório `packages/docs` (usando Vite como bundler interno para velocidade).
- [x] Configurar `.storybook/main.ts` para carregar histórias (`.stories.tsx`) localizadas no pacote `@ds/core` (`../core/src/**/*.stories.tsx`) e do `@ds/carousel` (`../carousel/src/**/*.stories.tsx`).
- [x] Configurar `.storybook/preview.tsx` para importar os estilos globais de tokens do `@ds/core`.
- [x] Adicionar no `.storybook/preview.tsx` um decorator/addon global para alternar o tema do Storybook (Light/Dark) injetando o atributo `data-theme` na div wrapper das stories.
- [x] Carregar as fontes `Inter` e `Poppins` globalmente na pré-visualização (pode ser feito injetando tags `<link>` no arquivo `.storybook/preview-head.html`).
- [x] Adicionar scripts `"storybook"` e `"build-storybook"` no `packages/docs/package.json`.
- [x] Configurar o pipeline `turbo.json` na raiz para cachear o build do Storybook e entender a dependência persistente ao rodar desenvolvimento.

## Cenários de Validação

- [x] Executar `pnpm --filter docs run build-storybook` e validar que o Storybook é construído com sucesso para produção sem erros de TypeScript ou bundling.
- [x] Executar o Storybook localmente e verificar que a fonte e o tema monocromático (com base nas Custom Properties dos tokens) são carregados de forma idêntica à especificação.

## Arquivos a Criar/Modificar

- `packages/docs/package.json` (Modificar)
- `packages/docs/.storybook/main.ts` (Criar)
- `packages/docs/.storybook/preview.ts` (Criar)
- `packages/docs/.storybook/preview-head.html` (Criar)
- `packages/docs/tsconfig.json` (Criar se necessário/herdar da raiz)

## Dependências Externas

- `storybook`, `@storybook/react-vite`, `vite`

## Dependências de Issues

#001 (Monorepo), #002 (Tokens)

## Estimativa

M

## Pesquisa

### Referências e Melhores Práticas do Storybook 8

- O Storybook 8 recomenda o uso do Vite (`@storybook/react-vite`) por ser incrivelmente rápido e dispensar configurações complexas de loaders de CSS.
- O addon `@storybook/addon-a11y` renderiza uma aba no painel lateral do Storybook que executa auditorias baseadas no `axe-core` em tempo real para cada componente/story renderizado.
- Estilos SCSS em componentes do monorepo exigem o compilador `sass` instalado nas devDependencies do pacote docs, pois o Vite resolverá as dependências do core importadas no CSS.

## Implementação Planejada

### Estrutura de Arquivos

```
packages/docs/
├── .storybook/
│   ├── main.ts
│   ├── preview.tsx
│   └── preview-head.html
├── package.json
└── tsconfig.json
```

### Detalhes das Configurações

**main.ts**:

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../../core/src/**/*.stories.tsx',
    '../../carousel/src/**/*.stories.tsx',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}
export default config
```

**preview.tsx**:

```typescript
import type { Preview } from '@storybook/react';
import React from 'react';
import '@ds/core/src/tokens/index.scss';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'circlehollow' },
          { value: 'dark', title: 'Dark', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      return (
        <div
          data-theme={theme}
          style={{
            padding: '2rem',
            minHeight: '100vh',
            background: 'var(--ds-color-neutral-0)',
            color: 'var(--ds-color-neutral-1000)'
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
```

**preview-head.html**:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

## Decisões Técnicas

1. **Uso de `@storybook/react-vite` como Framework:**
   Optar por Vite em detrimento de Webpack devido ao tempo de inicialização quase instantâneo e facilidade de integração em monorepos sem necessidade de reconfiguração de aliases ou resolvers.
2. **Decorator Global com data-theme:**
   Em vez de forçar o tema programaticamente via hooks complexos, o decorator simplesmente envolve a story em uma div container com o atributo `data-theme`, acionando as CSS custom properties que definimos no core de forma totalmente limpa e isolada.
3. **Importação Direta de Fontes via preview-head:**
   Garante que o sandbox exiba tipografias com as famílias e pesos idênticos ao ambiente produtivo, prevenindo fallbacks genéricos de navegadores.

## Checklist de Implementação

- [x] Instalar devDependencies do Storybook no pacote `@ds/docs` (`storybook`, `@storybook/react`, `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/addon-a11y`, `@storybook/blocks`, `vite`, `@vitejs/plugin-react`, `sass`).
- [x] Adicionar os scripts do Storybook no `package.json` de `@ds/docs` (`storybook`, `build-storybook`, `build`).
- [x] Atualizar o include do `packages/docs/tsconfig.json` para suportar `.storybook/**/*`.
- [x] Criar a pasta `packages/docs/.storybook/`.
- [x] Criar o arquivo `packages/docs/.storybook/main.ts` configurando o path de stories do core e carousel e os addons.
- [x] Criar o arquivo `packages/docs/.storybook/preview.tsx` com o import do SCSS global e o decorator de alternância do `data-theme`.
- [x] Criar o arquivo `packages/docs/.storybook/preview-head.html` com os links de fontes do Google Fonts.
- [x] Validar o build de produção do Storybook via `npx pnpm --filter @ds/docs build-storybook` e garantir que termina sem erros de compilação.
- [x] Rodar o linter (`npx pnpm lint`) e formatar os arquivos (`npx pnpm format`).
- [x] Atualizar status nos arquivos de acompanhamento do epic e issue.
