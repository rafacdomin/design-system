# #015 — Teste de Varredura Dinâmica e Injeção de Temas

## Status

`[ ] A Fazer` `[ ] Em progresso` `[x] Concluído`

## Objetivo

Implementar a suíte de testes de regressão visual dinâmica que varre os stories do Storybook via `index.json`, injeta estilos globais para evitar instabilidades e captura imagens sob temas light/dark.

## Critérios de Aceite

- [x] Criar o arquivo `packages/docs/src/test-visual/visual.spec.ts`.
- [x] Implementar leitura e parseamento síncrono/dinâmico de `packages/docs/storybook-static/index.json`.
- [x] Filtrar entradas do tipo `story` (ignorando páginas MDX/docs).
- [x] Implementar suporte à tag `skip-visual` para pular testes visuais de stories específicos.
- [x] Garantir injeção de estilo CSS global antes de cada teste para desativar transições, animações de CSS, carets de texto e animações de SVG.
- [x] Iterar sobre cada viewport parametrizada (`mobile`, `tablet`, `desktop`) executando o teste:
  - Navegar até o iframe isolado do Storybook daquela história (`/iframe.html?id=[storyId]&viewMode=story`).
  - Aguardar estado de rede em repouso (`networkidle`).
  - Aplicar `data-theme="light"` na tag root (`html` ou `body`).
  - Tirar screenshot e comparar com o baseline local `light` (com tolerância de diferença de pixels ≤ `0.1%`).
  - Aplicar `data-theme="dark"` na tag root.
  - Tirar screenshot e comparar com o baseline local `dark` (com tolerância de diferença de pixels ≤ `0.1%`).
- [x] Executar o comando `pnpm test:visual:update` para gerar com sucesso as primeiras baselines locais de todos os componentes existentes (Button, Input, Textarea, Dropdown, Modal, Card, Tag, Avatar, Carousel).

## Cenários de Validação

- [x] Rodar `pnpm test:visual` após gerar as baselines e verificar se todos os testes passam (100% de sucesso).
- [x] Modificar temporariamente a cor de fundo de um componente no SCSS (ex: `Button.module.scss`) e rodar os testes visuais de regressão, garantindo que o Playwright reprove o teste apontando a diferença visual no diff de imagens.

## Arquivos a Criar/Modificar

- `packages/docs/src/test-visual/visual.spec.ts` (Criar)

## Dependências Externas

- Nenhuma dependência externa nova além do Playwright.

## Depende de

#014 (Setup do Playwright)

## Estimativa

G

---

## Pesquisa

### Varredura Dinâmica do Storybook 8

- **Formato do `index.json`:** O Storybook 8 exporta no diretório estático um arquivo chamado `index.json` contendo um objeto na propriedade `entries`. Cada registro possui propriedades como `type` (se for `'story'` ou `'docs'`), `id` (chave usada na URL) e `tags` (um array de tags que podem incluir customizações como `'skip-visual'`).
- **Navegação Isolada por Iframe:** Para realizar testes visuais eficientes, devemos carregar as stories de maneira limpa, sem a interface do console do Storybook (sidebar, toolbar, etc.). A rota `/iframe.html?id=[storyId]&viewMode=story` serve exatamente a esse propósito.
- **Prevenção de Falsos Positivos:** Transições CSS suaves, carets piscantes em campos de texto (`input`/`textarea`) e GIFs/SVGs animados provocam diferenças visuais que resultam em falhas nos testes. Injetar um bloco de estilo global no topo do DOM cancela esses comportamentos dinâmicos durante o teste.

---

## Implementação Planejada

### Estrutura do Teste (`packages/docs/src/test-visual/visual.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

interface StorybookEntry {
  id: string
  title: string
  name: string
  importPath: string
  type: 'story' | 'docs'
  tags?: string[]
  componentPath?: string
  storiesImports?: string[]
}

interface StorybookIndex {
  v: number
  entries: Record<string, StorybookEntry>
}

const storybookIndexPath = path.resolve(
  __dirname,
  '../../storybook-static/index.json'
)

let storybookIndex: StorybookIndex = { v: 5, entries: {} }
if (fs.existsSync(storybookIndexPath)) {
  try {
    const raw = fs.readFileSync(storybookIndexPath, 'utf-8')
    storybookIndex = JSON.parse(raw) as StorybookIndex
  } catch (err) {
    console.error('Failed to parse Storybook index.json:', err)
  }
} else {
  console.warn(
    'Storybook index.json not found. Run "pnpm build" to generate it.'
  )
}

const stories = Object.values(storybookIndex.entries).filter((entry) => {
  const isStory = entry.type === 'story'
  const hasSkipVisual = entry.tags?.includes('skip-visual')
  return isStory && !hasSkipVisual
})

test.describe('Visual Regression Tests', () => {
  for (const story of stories) {
    test(`Visual: ${story.title} - ${story.name}`, async ({ page }) => {
      // 1. Tema Light
      const storyUrlLight = `/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`
      await page.goto(storyUrlLight, { waitUntil: 'networkidle' })

      // Injeta CSS global para desativar transições/animações
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            transition-duration: 0s !important;
            animation-duration: 0s !important;
          }
          input, textarea {
            caret-color: transparent !important;
          }
        `,
      })

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light')
        document.body.setAttribute('data-theme', 'light')
      })
      await page.waitForTimeout(100)
      await expect(page).toHaveScreenshot(`${story.id}-light.png`, {
        maxDiffPixelRatio: 0.001,
      })

      // 2. Tema Dark
      const storyUrlDark = `/iframe.html?id=${story.id}&viewMode=story&globals=theme:dark`
      await page.goto(storyUrlDark, { waitUntil: 'networkidle' })

      // Injeta CSS global para desativar transições/animações no novo load
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            transition-duration: 0s !important;
            animation-duration: 0s !important;
          }
          input, textarea {
            caret-color: transparent !important;
          }
        `,
      })

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.body.setAttribute('data-theme', 'dark')
      })
      await page.waitForTimeout(100)
      await expect(page).toHaveScreenshot(`${story.id}-dark.png`, {
        maxDiffPixelRatio: 0.001,
      })
    })
  }
})
```

---

## Decisões Técnicas

- **Por que Ler o `index.json` Sincronamente?:** Como o Playwright precisa registrar os testes em tempo de importação de arquivo (fase de configuração estática dos testes), a leitura de `index.json` deve ocorrer de forma síncrona antes do bloco `test.describe`. Isso permite que o loop `for...of` instancie dinamicamente os casos de teste.
- **Estabilização de Redes e Renderização:** O uso de `{ waitUntil: 'networkidle' }` e `await page.waitForTimeout(100)` após modificar o tema é fundamental para garantir que qualquer recarregamento leve ou transição de layout termine completamente antes de capturar a imagem.
- **maxDiffPixelRatio: 0.001:** O limiar de 0.1% de pixels aceita pequenas diferenças de renderização de fontes causadas por anti-aliasing entre sistemas operacionais sem reprovar o teste.

---

## Checklist de Implementação

1. [x] Criar o diretório `packages/docs/src/test-visual/` se ele não existir.
2. [x] Criar o arquivo `packages/docs/src/test-visual/visual.spec.ts`.
3. [x] Importar módulos do Playwright (`test`, `expect`) e os módulos Node (`fs`, `path`).
4. [x] Mapear o caminho correto para `packages/docs/storybook-static/index.json`.
5. [x] Adicionar checagem de existência do arquivo e emitir um aviso estruturado se ele estiver ausente.
6. [x] Ler e decodificar o arquivo de metadados de forma síncrona.
7. [x] Filtrar o objeto `entries` coletando apenas elementos com `type === 'story'`.
8. [x] Filtrar registros que contenham a tag `'skip-visual'`.
9. [x] Criar o bloco agrupador `test.describe('Visual Regression Tests')`.
10. [x] Iterar sobre as histórias extraídas usando um loop `for...of`.
11. [x] Declarar o caso de teste dinâmico parametrizando o nome baseado em `story.title` e `story.name`.
12. [x] No teste, construir a URL do iframe do Storybook para carregar a história isoladamente com o tema claro via parâmetro `globals=theme:light`.
13. [x] Realizar a navegação via `page.goto` esperando pelo estado `networkidle`.
14. [x] Injetar o bloco de CSS para remover animações, transições e ocultar o cursor piscante (`caret-color: transparent`) usando `page.addStyleTag`.
15. [x] Garantir o fallback de atributos atualizando `data-theme` na tag `html` e `body` para `"light"` via `page.evaluate`.
16. [x] Aplicar um delay de 100ms para estabilização do layout.
17. [x] Executar o `expect(page).toHaveScreenshot` para o baseline de tema claro com tolerância de 0.1% de pixels (`maxDiffPixelRatio: 0.001`).
18. [x] Navegar para o iframe da mesma história com o tema escuro via parâmetro `globals=theme:dark`.
19. [x] Reinjetar o bloco de CSS para desativar transições/animações e garantir o fallback de atributos `data-theme="dark"` na tag `html` e `body`.
20. [x] Aplicar um delay de 100ms para estabilização do layout e executar `expect(page).toHaveScreenshot` para o baseline de tema escuro com tolerância de 0.1% de pixels.
21. [x] Rodar o comando `pnpm test:visual:update` na raiz e certificar que todos os baselines de imagem são gerados corretamente.
