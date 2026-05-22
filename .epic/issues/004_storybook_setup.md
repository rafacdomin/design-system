# #004 — Configuração do Storybook 8

## Status
`[ ] A Fazer`  `[ ] Em progresso`  `[ ] Concluído`

## Objetivo
Configurar e inicializar o Storybook 8 no pacote `@ds/docs` para servir como ambiente isolado de visualização, documentação interativa e sandbox dos componentes de `@ds/core`.

## Critérios de Aceite
- [ ] Inicializar o Storybook 8 no diretório `packages/docs` (usando Vite como bundler interno para velocidade).
- [ ] Configurar `.storybook/main.ts` para carregar histórias (`.stories.tsx`) localizadas no pacote `@ds/core` (`../core/src/**/*.stories.tsx`) e do `@ds/carousel` (`../carousel/src/**/*.stories.tsx`).
- [ ] Configurar `.storybook/preview.tsx` para importar os estilos globais de tokens do `@ds/core`.
- [ ] Adicionar no `.storybook/preview.tsx` um decorator/addon global para alternar o tema do Storybook (Light/Dark) injetando o atributo `data-theme` na div wrapper das stories.
- [ ] Carregar as fontes `Inter` e `Poppins` globalmente na pré-visualização (pode ser feito injetando tags `<link>` no arquivo `.storybook/preview-head.html`).
- [ ] Adicionar scripts `"storybook"` e `"build-storybook"` no `packages/docs/package.json`.
- [ ] Configurar o pipeline `turbo.json` na raiz para cachear o build do Storybook e entender a dependência persistente ao rodar desenvolvimento.

## Cenários de Validação
- [ ] Executar `pnpm --filter docs run build-storybook` e validar que o Storybook é construído com sucesso para produção sem erros de TypeScript ou bundling.
- [ ] Executar o Storybook localmente e verificar que a fonte e o tema monocromático (com base nas Custom Properties dos tokens) são carregados de forma idêntica à especificação.

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
