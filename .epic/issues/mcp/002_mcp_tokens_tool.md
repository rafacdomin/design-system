# 002 — Ferramenta: get_design_tokens

## Status

[ ] Planejada [ ] Em desenvolvimento [x] Concluída

## Objetivo

Implementar a ferramenta MCP `get_design_tokens` no servidor, permitindo que agentes externos de IA consultem as especificações de tipografia, cores, espaçamento, bordas, sombras e breakpoints descritas no design tokens do projeto.

## Critérios de Aceite

- [x] Definição do schema da ferramenta `get_design_tokens` exposto de acordo com a especificação do MCP.
- [x] Implementação de parser ou mapeamento estruturado em TypeScript que lê as especificações de [DESIGN_TOKENS.md](file:///home/rafacdomin/projetos/design-system/references/DESIGN_TOKENS.md) ou expõe os tokens como JSON estruturado.
- [x] Separação das cores do tema claro e escuro e cores de foco.
- [x] Retorno da ferramenta formatado em JSON estruturado legível para facilitar a interpretação por modelos de IA.
- [x] Zero uso de tipos `any` nas estruturas internas de dados e tipagens de retornos.
- [x] Testes unitários para validar a exatidão das custom properties retornadas e se a formatação JSON está correta.

---

## Pesquisa

### Model Context Protocol (MCP) e Design Tokens

A especificação oficial do MCP permite que servidores disponibilizem "Tools" e "Resources".

- **Tools (Ferramentas)**: Ações que a IA pode executar, descritas com um nome, descrição textual e um schema JSON para os argumentos (geralmente usando a biblioteca `zod` no SDK TypeScript). Os retornos devem ser estruturados e fáceis de digerir.
- **Resources (Recursos)**: Dados estáticos expostos por URIs que a IA pode ler.

Ao integrar ferramentas de design system para IAs, expor os design tokens como JSON estruturado traz diversas vantagens em relação a markdown cru ou CSS puro:

1. **Facilidade de Consumo**: Modelos de linguagem processam melhor chaves e valores estruturados, diminuindo alucinações e erros de digitação ao injetar variáveis em componentes.
2. **Filtrabilidade**: Permitir parâmetros opcionais de filtros de categoria (ex: obter apenas `colors`) evita sobrecarregar o contexto da IA (redução de tokens).
3. **Mapeamento de Temas Dinâmico**: Permite obter os valores resolvidos diretamente para o tema solicitado (`light` ou `dark`), ou o mapa de temas completo.

Referência técnica de formato estruturado de design tokens do W3C Design Tokens Community Group:

- Tokens de design devem descrever o nome, o valor bruto, o tipo de token e metadados como a correspondência visual ou unidade física de pixel correspondente.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta

```text
packages/mcp-server/
├── src/
│   ├── tools/
│   │   ├── tokens.ts       # Parser e lógica de negócio dos design tokens
│   │   ├── index.ts        # Registro central de ferramentas
│   │   └── ...
│   ├── __tests__/
│   │   └── tokens.test.ts  # Testes unitários do parser de tokens
│   └── index.ts            # Inicialização do servidor MCP
```

### JSON Schema do Input (Zod Definition)

A ferramenta aceitará os seguintes parâmetros opcionais:

- `category` (enum): Filtro por categoria específica de design token.
- `theme` (enum): Filtro por tema (`light` ou `dark`), resolvendo valores específicos.

```typescript
import { z } from 'zod'

export const GetDesignTokensSchema = z.object({
  category: z
    .enum([
      'typography',
      'colors',
      'spacing',
      'borders',
      'shadows',
      'breakpoints',
    ])
    .optional()
    .describe('Categoria específica dos design tokens a serem retornados.'),
  theme: z
    .enum(['light', 'dark'])
    .optional()
    .describe(
      'Filtro de tema. Se informado, simplifica o retorno das cores para os valores correspondentes apenas a este tema.'
    ),
})

export type GetDesignTokensInput = z.infer<typeof GetDesignTokensSchema>
```

### Payload de Retorno Ideal (JSON)

Se nenhum filtro for informado, o payload retornado no conteúdo de texto deve seguir este formato:

```json
{
  "typography": {
    "fontFamilies": {
      "sans": {
        "token": "--ds-font-family-sans",
        "value": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        "description": "Sans-serif / Interface (Padrão)"
      },
      "heading": {
        "token": "--ds-font-family-heading",
        "value": "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        "description": "Heading / Headings (Destaque)"
      }
    },
    "fontSizes": {
      "xs": {
        "token": "--ds-font-size-xs",
        "value": "0.75rem",
        "pixelEquivalent": "12px"
      },
      "sm": {
        "token": "--ds-font-size-sm",
        "value": "0.875rem",
        "pixelEquivalent": "14px"
      }
    },
    "fontWeights": {
      "regular": { "token": "--ds-font-weight-regular", "value": "400" }
    },
    "lineHeights": {
      "none": { "token": "--ds-line-height-none", "value": "1" }
    }
  },
  "colors": {
    "neutral": {
      "0": {
        "token": "--ds-color-neutral-0",
        "light": "#ffffff",
        "dark": "#0a0a0a",
        "suggestedUse": "Fundo principal da página"
      }
    },
    "accent": {
      "focus-ring": {
        "token": "--ds-color-focus-ring",
        "light": "hsl(0, 0%, 0%)",
        "dark": "hsl(0, 0%, 100%)"
      }
    }
  },
  "spacing": {
    "1": {
      "token": "--ds-spacing-1",
      "value": "0.25rem",
      "pixelEquivalent": "4px"
    }
  },
  "borders": {
    "radius": {
      "sm": {
        "token": "--ds-border-radius-sm",
        "value": "2px",
        "description": "estética mais angular e moderna"
      }
    },
    "width": {
      "sm": { "token": "--ds-border-width-sm", "value": "1px" }
    }
  },
  "shadows": {
    "sm": {
      "token": "--ds-shadow-sm",
      "value": "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    }
  },
  "breakpoints": {
    "sm": { "token": "--ds-breakpoint-sm", "value": "640px" }
  }
}
```

### Pseudocódigo do Parser e Handler da Tool

Abaixo está o pseudocódigo completo e tipado em TypeScript, garantindo **zero uso de `any`**, em conformidade com as regras do `AGENTS.md`.

```typescript
import fs from 'fs/promises'
import path from 'path'

export interface DesignTokens {
  typography: {
    fontFamilies: Record<
      string,
      { token: string; value: string; description?: string }
    >
    fontSizes: Record<
      string,
      { token: string; value: string; pixelEquivalent?: string }
    >
    fontWeights: Record<string, { token: string; value: string }>
    lineHeights: Record<string, { token: string; value: string }>
  }
  colors: {
    neutral: Record<
      string,
      { token: string; light: string; dark: string; suggestedUse?: string }
    >
    accent: Record<
      string,
      { token: string; light: string; dark: string; description?: string }
    >
  }
  spacing: Record<
    string,
    { token: string; value: string; pixelEquivalent?: string }
  >
  borders: {
    radius: Record<
      string,
      { token: string; value: string; description?: string }
    >
    width: Record<
      string,
      { token: string; value: string; description?: string }
    >
  }
  shadows: Record<string, { token: string; value: string }>
  breakpoints: Record<string, { token: string; value: string }>
}

/**
 * Localiza dinamicamente o arquivo DESIGN_TOKENS.md no monorepo
 */
export async function locateDesignTokensPath(): Promise<string> {
  const directPath = path.resolve(process.cwd(), 'references/DESIGN_TOKENS.md')
  try {
    await fs.access(directPath)
    return directPath
  } catch {
    const parentPath = path.resolve(
      __dirname,
      '../../../references/DESIGN_TOKENS.md'
    )
    try {
      await fs.access(parentPath)
      return parentPath
    } catch {
      throw new Error(
        'Não foi possível localizar o arquivo references/DESIGN_TOKENS.md'
      )
    }
  }
}

/**
 * Lê e analisa o arquivo references/DESIGN_TOKENS.md retornando a estrutura JSON de tokens
 */
export async function parseDesignTokens(
  filePath: string
): Promise<DesignTokens> {
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const lines = fileContent.split('\n')

  const tokens: DesignTokens = {
    typography: {
      fontFamilies: {},
      fontSizes: {},
      fontWeights: {},
      lineHeights: {},
    },
    colors: { neutral: {}, accent: {} },
    spacing: {},
    borders: { radius: {}, width: {} },
    shadows: {},
    breakpoints: {},
  }

  let currentSection = ''
  let currentSubSection = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Detectar Seção Principal
    if (line.startsWith('## ')) {
      const heading = line.replace('## ', '').toLowerCase()
      if (heading.includes('typography') || heading.includes('tipografia')) {
        currentSection = 'typography'
      } else if (heading.includes('colors') || heading.includes('cores')) {
        currentSection = 'colors'
      } else if (
        heading.includes('spacing') ||
        heading.includes('espaçamento')
      ) {
        currentSection = 'spacing'
      } else if (heading.includes('borders') || heading.includes('bordas')) {
        currentSection = 'borders'
      } else if (heading.includes('shadows') || heading.includes('sombras')) {
        currentSection = 'shadows'
      } else if (heading.includes('breakpoints')) {
        currentSection = 'breakpoints'
      } else {
        currentSection = ''
      }
      currentSubSection = ''
      continue
    }

    // Detectar Subseção
    if (line.startsWith('### ')) {
      const heading = line.replace('### ', '').toLowerCase()
      if (currentSection === 'typography') {
        if (heading.includes('famílias') || heading.includes('families')) {
          currentSubSection = 'fontFamilies'
        } else if (heading.includes('tamanhos') || heading.includes('sizes')) {
          currentSubSection = 'fontSizes'
        } else if (heading.includes('pesos') || heading.includes('weights')) {
          currentSubSection = 'fontWeights'
        } else if (heading.includes('altura') || heading.includes('heights')) {
          currentSubSection = 'lineHeights'
        }
      } else if (currentSection === 'colors') {
        if (heading.includes('neutra') || heading.includes('neutral')) {
          currentSubSection = 'neutral'
        } else if (
          heading.includes('acento') ||
          heading.includes('accent') ||
          heading.includes('focus')
        ) {
          currentSubSection = 'accent'
        }
      } else if (currentSection === 'borders') {
        if (heading.includes('raio') || heading.includes('radius')) {
          currentSubSection = 'radius'
        } else if (heading.includes('espessura') || heading.includes('width')) {
          currentSubSection = 'width'
        }
      }
      continue
    }

    // Processar linhas com base na seção corrente
    if (currentSection === 'typography') {
      if (currentSubSection === 'fontFamilies') {
        if (line.startsWith('- **')) {
          const match = line.match(/-\s+\*\*(.*?)\*\*:\s+`(.*?)`/)
          if (match) {
            const desc = match[1]
            let token = ''
            let value = ''
            let nextIndex = i + 1
            while (
              nextIndex < lines.length &&
              (lines[nextIndex].startsWith(' ') ||
                lines[nextIndex].startsWith('\t') ||
                lines[nextIndex].startsWith('-'))
            ) {
              const nextLine = lines[nextIndex].trim()
              if (nextLine.toLowerCase().includes('token:')) {
                const tokenMatch = nextLine.match(/token:\s+`(.*?)`/i)
                if (tokenMatch) token = tokenMatch[1]
              } else if (nextLine.toLowerCase().includes('valor:')) {
                const valMatch = nextLine.match(/valor:\s+`(.*?)`/i)
                if (valMatch) value = valMatch[1]
              }
              nextIndex++
            }
            if (token) {
              const key = token.replace('--ds-font-family-', '')
              tokens.typography.fontFamilies[key] = {
                token,
                value,
                description: desc,
              }
            }
          }
        }
      } else if (currentSubSection === 'fontSizes') {
        const match = line.match(
          /-\s+`(--ds-font-size-([a-z0-9]+))`:\s+`(.*?)`\s*(?:\((.*?)\))?/
        )
        if (match) {
          const [_, token, key, value, pixel] = match
          tokens.typography.fontSizes[key] = {
            token,
            value,
            pixelEquivalent: pixel,
          }
        }
      } else if (currentSubSection === 'fontWeights') {
        const match = line.match(
          /-\s+`(--ds-font-weight-([a-z0-9]+))`:\s+`(.*?)`/
        )
        if (match) {
          const [_, token, key, value] = match
          tokens.typography.fontWeights[key] = { token, value }
        }
      } else if (currentSubSection === 'lineHeights') {
        const match = line.match(
          /-\s+`(--ds-line-height-([a-z0-9]+))`:\s+`(.*?)`/
        )
        if (match) {
          const [_, token, key, value] = match
          tokens.typography.lineHeights[key] = { token, value }
        }
      }
    } else if (currentSection === 'colors') {
      if (currentSubSection === 'neutral') {
        // Tabela Markdown
        if (
          line.startsWith('|') &&
          !line.includes('Token') &&
          !line.includes('---') &&
          !line.includes(':---')
        ) {
          const parts = line.split('|').map((p) => p.trim())
          if (parts.length >= 5) {
            const token = parts[1].replace(/`/g, '')
            const light = parts[2].replace(/`/g, '')
            const dark = parts[3].replace(/`/g, '')
            const use = parts[4]
            if (token.startsWith('--ds-')) {
              const key = token.replace('--ds-color-neutral-', '')
              tokens.colors.neutral[key] = {
                token,
                light,
                dark,
                suggestedUse: use,
              }
            }
          }
        }
      } else if (currentSubSection === 'accent') {
        const match = line.match(
          /-\s+`(--ds-color-([a-z0-9-]+))`:\s+`(.*?)`\s*no Light\s*e\s*`(.*?)`\s*no Dark/i
        )
        if (match) {
          const [_, token, key, light, dark] = match
          tokens.colors.accent[key] = { token, light, dark }
        }
      }
    } else if (currentSection === 'spacing') {
      const match = line.match(
        /-\s+`(--ds-spacing-([0-9]+))`:\s+`(.*?)`\s*(?:\((.*?)\))?/
      )
      if (match) {
        const [_, token, key, value, pixel] = match
        tokens.spacing[key] = { token, value, pixelEquivalent: pixel }
      }
    } else if (currentSection === 'borders') {
      if (currentSubSection === 'radius') {
        const match = line.match(
          /-\s+`(--ds-border-radius-([a-z0-9]+))`:\s+`(.*?)`\s*(?:\((.*?)\))?/
        )
        if (match) {
          const [_, token, key, value, desc] = match
          tokens.borders.radius[key] = { token, value, description: desc }
        }
      } else if (currentSubSection === 'width') {
        const match = line.match(
          /-\s+`(--ds-border-width-([a-z0-9]+))`:\s+`(.*?)`\s*(?:\((.*?)\))?/
        )
        if (match) {
          const [_, token, key, value, desc] = match
          tokens.borders.width[key] = { token, value, description: desc }
        }
      }
    } else if (currentSection === 'shadows') {
      const match = line.match(/-\s+`(--ds-shadow-([a-z0-9]+))`:\s+`(.*?)`/)
      if (match) {
        const [_, token, key, value] = match
        tokens.shadows[key] = { token, value }
      }
    } else if (currentSection === 'breakpoints') {
      const match = line.match(/-\s+`(--ds-breakpoint-([a-z0-9]+))`:\s+`(.*?)`/)
      if (match) {
        const [_, token, key, value] = match
        tokens.breakpoints[key] = { token, value }
      }
    }
  }

  return tokens
}

/**
 * Filtra e resolve o payload dos tokens dependendo dos argumentos passados
 */
export function filterTokens(
  tokens: DesignTokens,
  category?: string,
  theme?: 'light' | 'dark'
): unknown {
  let result: Record<string, unknown> = { ...tokens }

  if (category) {
    if (category in tokens) {
      result = { [category]: tokens[category as keyof DesignTokens] }
    } else {
      throw new Error(`Categoria '${category}' não existe nos design tokens.`)
    }
  }

  if (theme) {
    if (result.colors) {
      const colors = result.colors as DesignTokens['colors']
      const filteredNeutral: Record<
        string,
        { token: string; value: string; suggestedUse?: string }
      > = {}
      const filteredAccent: Record<
        string,
        { token: string; value: string; description?: string }
      > = {}

      for (const [key, val] of Object.entries(colors.neutral)) {
        filteredNeutral[key] = {
          token: val.token,
          value: theme === 'light' ? val.light : val.dark,
          suggestedUse: val.suggestedUse,
        }
      }

      for (const [key, val] of Object.entries(colors.accent)) {
        filteredAccent[key] = {
          token: val.token,
          value: theme === 'light' ? val.light : val.dark,
          description: val.description,
        }
      }

      result.colors = {
        neutral: filteredNeutral,
        accent: filteredAccent,
      }
    }
  }

  return result
}
```

---

## Decisões Técnicas

1. **Parser Dinâmico vs. Configuração Estática**: Optamos por um parser dinâmico que lê diretamente `references/DESIGN_TOKENS.md` em runtime. Isso garante que a documentação continue sendo a **única fonte da verdade (SSOT)**. Caso ocorra alteração nos tokens pelo designer ou dev no arquivo markdown, o MCP Server reflete a mudança sem requerer reconstrução ou código extra.
2. **Abordagem por Expressões Regulares**: O arquivo `DESIGN_TOKENS.md` segue uma estrutura rígida e linear. Um parse estruturado utilizando Expressões Regulares (Regex) com filtros de estado de linha é ideal, rápido, e evita adicionar dependências pesadas de processamento AST ou parsers de markdown externos.
3. **Resolução de Caminhos Resiliente**: O servidor MCP pode ser iniciado de locais diferentes (raiz do monorepo via Turborepo, diretamente na pasta do pacote, ou via executável global). O helper `locateDesignTokensPath` tenta ler tanto de `process.cwd()` quanto com base no caminho relativo do arquivo compilado (`__dirname`), prevenindo falhas de arquivo não encontrado.
4. **Erros Amigáveis ao Agente de IA**: Caso o parser falhe (ex: se o arquivo markdown sumir ou mudar drasticamente), a chamada da ferramenta retornará um objeto `{ isError: true, content: [{ type: "text", text: "Erro ao carregar design tokens: ..." }] }`. Isso previne a quebra (crash) do processo stdout/stdin e sinaliza para o agente de IA que houve um problema operacional no ambiente.
5. **Tipagem Estrita (Zero any)**: Todas as estruturas retornadas e tipagens de parâmetros seguem tipagens explícitas do TypeScript (`DesignTokens`, schemas específicos de retorno), em conformidade com as diretrizes rígidas do projeto.

---

## Checklist de Implementação

### 1. Modelos, Interfaces e Tipagem

- [x] 1.1 Criar o arquivo de ferramenta `packages/mcp-server/src/tools/tokens.ts` no workspace do MCP.
- [x] 1.2 Definir a interface estrita `DesignTokens` mapeando todas as chaves e tokens suportados.
- [x] 1.3 Definir o tipo e a interface `GetDesignTokensInput` para representar o payload de entrada da ferramenta utilizando schema Zod.

### 2. Mecanismo de Parsing (DESIGN_TOKENS.md)

- [x] 2.1 Implementar a função assíncrona `locateDesignTokensPath` de forma resiliente usando `fs/promises.access`.
- [x] 2.2 Implementar a função `parseDesignTokens` que lê e converte as linhas do markdown em texto bruto.
- [x] 2.3 Adicionar lógica de parsing por regex para a categoria de Tipografia (fontFamilies, fontSizes, fontWeights, lineHeights).
- [x] 2.4 Desenvolver o parseador da tabela de Cores Neutras extraindo os valores HSL/HEX de light/dark e uso sugerido.
- [x] 2.5 Desenvolver o parser das Cores de Acento (focus-ring, danger), mapeando os valores de light e dark de forma distinta.
- [x] 2.6 Implementar o parseador da escala de Espaçamento, extraindo valor rem e o equivalente em pixels.
- [x] 2.7 Adicionar regexes de extração para Bordas (raio e espessura) e Sombras do sistema.
- [x] 2.8 Adicionar lógica para ler a seção de Breakpoints de responsividade.

### 3. Filtros e Regras de Negócio

- [x] 3.1 Implementar a função pura `filterTokens` para realizar a filtragem condicional baseada na categoria selecionada.
- [x] 3.2 Implementar a resolução dinâmica de temas em `filterTokens`, convertendo a estrutura de cores com propriedades `light` e `dark` para uma propriedade simples `value` baseada no tema selecionado.
- [x] 3.3 Adicionar tratamento de exceção (`try/catch`) na execução do parse e retornar mensagens de erro ricas para o agente de IA em vez de lançar erros não tratados.

### 4. Integração no Servidor MCP

- [x] 4.1 Exportar a ferramenta no arquivo de registro central `packages/mcp-server/src/tools/index.ts`.
- [x] 4.2 Registrar a ferramenta `get_design_tokens` usando o SDK no arquivo de boot `packages/mcp-server/src/index.ts`, definindo o nome da ferramenta e o schema do Zod.
- [x] 4.3 Mapear o retorno da ferramenta formatando o JSON resultante em string no array de conteúdo (`content`).

### 5. Cobertura de Testes (TDD)

- [x] 5.1 Criar o arquivo de testes unitários `packages/mcp-server/src/__tests__/tokens.test.ts`.
- [x] 5.2 Escrever testes para validar se a leitura e parser de um arquivo markdown mockado contendo a especificação dos tokens gera o JSON correspondente correto.
- [x] 5.3 Escrever testes unitários para a função `filterTokens` validando a separação por categorias.
- [x] 5.4 Validar o comportamento de filtragem de tema (Light vs Dark), garantindo a substituição correta de chaves.
- [x] 5.5 Desenvolver teste de integração simulando a chamada JSON-RPC da ferramenta através de streams StdInput e StdOutput.
- [x] 5.6 Executar os testes localmente com `pnpm test` e verificar se a cobertura da ferramenta está em 100%.
- [x] 5.7 Executar o linter e o formatador de código (`pnpm lint`, `pnpm format`) garantindo zero warnings ou erros de formatação.

---

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/tools/tokens.ts` — lógica de leitura e estruturação dos design tokens
- `packages/mcp-server/src/tools/index.ts` — exportação e registro das ferramentas
- `packages/mcp-server/src/index.ts` — integração da ferramenta no servidor principal

## Dependências Externas

Nenhuma

## Depende de

#001 (Setup do Pacote MCP Server)

## Estimativa

P
