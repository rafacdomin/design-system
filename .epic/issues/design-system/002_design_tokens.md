# #002 — Configuração dos Design Tokens

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar a escala de design tokens monocromáticos e tipografia do sistema no pacote `@ds/core`. Os tokens serão expostos como variáveis CSS globais (`--ds-*`) associadas a arquivos CSS estruturados.

## Critérios de Aceite

- [x] Criar arquivo de variáveis CSS globais de tokens em `packages/core/src/tokens/globals.scss` contendo os tokens que são comuns a ambos os temas (fontes, espaçamento, breakpoints, border radii, border width).
- [x] Criar arquivos de tokens por tema `packages/core/src/tokens/theme-light.scss` e `packages/core/src/tokens/theme-dark.scss` mapeando as cores monocromáticas (tons neutros 0-1000 HSL), foco e erro nos escopos de atributos `[data-theme="light"]` e `[data-theme="dark"]`.
- [x] Criar arquivo agregador de tokens `packages/core/src/tokens/index.scss` que importa as globais e os temas de cores.
- [x] Garantir que o index do pacote core exporte e inclua esses arquivos CSS/SCSS para que outros pacotes possam importá-lo no monorepo.
- [x] Verificar que não há valores literais hardcoded nos estilos, com exceção da definição dos próprios tokens.

## Cenários de Validação

- [x] Importar os tokens em um arquivo SCSS de teste e compilar sem erros de caminhos.
- [x] Validar no HTML renderizado que as variáveis `--ds-*` estão presentes no DOM sob a tag HTML ou o elemento pai que possui o atributo `data-theme`.

## Arquivos a Criar/Modificar

- `packages/core/src/tokens/globals.scss` (Criar)
- `packages/core/src/tokens/theme-light.scss` (Criar)
- `packages/core/src/tokens/theme-dark.scss` (Criar)
- `packages/core/src/tokens/index.scss` (Criar)
- `packages/core/src/index.ts` (Modificar para expor estilos/tokens)

## Dependências Externas

Nenhuma (Apenas Sass/SCSS compilador no core)

## Dependências de Issues

#001 (Monorepo Setup)

## Estimativa

P
