# 005 — Recursos: design-system://docs/\*

## Status

[ ] Planejada [ ] Em desenvolvimento [x] Concluída

## Objetivo

Configurar a exposição de recursos estáticos no servidor MCP, disponibilizando os guias técnicos essenciais em `references/` via URIs personalizadas (`design-system://docs/*`) para permitir que agentes de IA carreguem documentações inteiras sobre a11y, temas, tokens e arquitetura.

## Critérios de Aceite

- [x] Registro dos recursos no MCP Server atendendo ao método `resources/list`.
- [x] Implementação de mapeamento de URIs de recurso:
  - `design-system://docs/accessibility` -> mapeia para [references/ACCESSIBILITY.md](file:///home/rafacdomin/projetos/design-system/references/ACCESSIBILITY.md)
  - `design-system://docs/theming` -> mapeia para [references/THEMING.md](file:///home/rafacdomin/projetos/design-system/references/THEMING.md)
  - `design-system://docs/tokens` -> mapeia para [references/DESIGN_TOKENS.md](file:///home/rafacdomin/projetos/design-system/references/DESIGN_TOKENS.md)
  - `design-system://docs/architecture` -> mapeia para [references/ARCHITECTURE.md](file:///home/rafacdomin/projetos/design-system/references/ARCHITECTURE.md)
  - `design-system://docs/workflow` -> mapeia para [references/WORKFLOW.md](file:///home/rafacdomin/projetos/design-system/references/WORKFLOW.md)
- [x] Lógica no método `resources/read` para ler os arquivos markdown em tempo real do sistema de arquivos e retornar o conteúdo como texto puro (`textDocuments`).
- [x] Testes unitários para validar a resolução correta de caminhos absolutos e se o conteúdo do recurso é retornado corretamente em formato UTF-8.
- [x] Proteção contra ataques de Directory Traversal no carregamento de arquivos a partir de URIs arbitrárias.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/resources/index.ts` — implementação e tratamento de recursos do servidor MCP
- `packages/mcp-server/src/index.ts` — registro dos recursos no ciclo de inicialização do servidor

## Dependências Externas

Nenhuma

## Depende de

#001 (Setup do Pacote MCP Server)

## Estimativa

P

## Pesquisa

- **Recursos no SDK do MCP (TypeScript)**:
  - O Model Context Protocol suporta a exposição de dados somente leitura (recursos) usando os métodos `resources/list` e `resources/read`.
  - No SDK de TypeScript, a classe `McpServer` gerencia o registro automático de recursos com o método `registerResource`.
  - O método `registerResource` recebe:
    1. `name`: Identificador único do recurso.
    2. `uri` ou `ResourceTemplate`: A URI de acesso do recurso (ex: `design-system://docs/accessibility`).
    3. `metadata`: Objeto contendo metadados (como `title`, `description`, `mimeType`).
    4. `handler`: Função callback assíncrona executada quando o cliente lê o recurso. Retorna um `ReadResourceResult` contendo o conteúdo do recurso.
- **Prevenção de Directory Traversal (CWE-22)**:
  - Ataques de Directory Traversal ocorrem quando um usuário ou agente manipula caminhos (ex: `../../etc/passwd`) para acessar arquivos fora da raiz pretendida.
  - **Mitigação Nível 1 (Whitelist)**: Limitar o acesso estritamente a chaves conhecidas mapeadas no código (`accessibility`, `theming`, `tokens`, `architecture`, `workflow`). Qualquer chave fora deste dicionário é rejeitada imediatamente antes de acessar o disco.
  - **Mitigação Nível 2 (Verificação de Caminho)**: Usar `path.resolve` para obter o caminho absoluto e canônico do arquivo e compará-lo com o caminho absoluto da pasta base de referências (`references/`).
  - **Mitigação Nível 3 (Contenção de Prefixo)**: Validar se o caminho absoluto do arquivo inicia com o prefixo da pasta base seguido do separador do sistema operacional (`referencesDir + path.sep`), evitando correspondências parciais de nome (ex: `/references-out/` correspondendo a `/references`).
  - **Mitigação Nível 4 (Prevenção de Escape com path.relative)**: Usar `path.relative(baseDir, targetPath)` e validar que o resultado não inicie com `..` e nem seja um caminho absoluto.

---

## Implementação Planejada

### Estrutura de Arquivos Proposta

```
packages/mcp-server/
├── src/
│   ├── index.ts                 # Registra e conecta o servidor MCP
│   └── resources/
│       ├── index.ts             # Lógica de mapeamento, proteção contra Traversal e registro
│       └── index.test.ts        # Testes unitários com Vitest
```

### Pseudocódigo e Implementação Proposta

#### 1. `packages/mcp-server/src/resources/index.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dicionário estrito de mapeamento para whitelisting absoluto (CWE-22)
export const DOCS_MAP: Record<
  string,
  { filename: string; title: string; description: string }
> = {
  accessibility: {
    filename: 'ACCESSIBILITY.md',
    title: 'Diretrizes de Acessibilidade (a11y)',
    description:
      'Manual de conformidade WCAG 2.1 AA, regras de contraste, estados interativos e semântica WAI-ARIA.',
  },
  theming: {
    filename: 'THEMING.md',
    title: 'Guia de Temas e Custom Properties',
    description:
      'Especificações sobre o HOC withTheme, carregamento dinâmico de tokens CSS e customização visual.',
  },
  tokens: {
    filename: 'DESIGN_TOKENS.md',
    title: 'Design Tokens do Design System',
    description:
      'Catálogo oficial de cores, espaçamentos, tipografia, z-index e motion tokens.',
  },
  architecture: {
    filename: 'ARCHITECTURE.md',
    title: 'Arquitetura e Padrões de Projeto',
    description:
      'Padrão Compound Component, regras de exportação de módulos (index.ts) e organização do monorepo.',
  },
  workflow: {
    filename: 'WORKFLOW.md',
    title: 'Workflow de Desenvolvimento',
    description:
      'Passo a passo do ciclo de desenvolvimento de componentes: Spec, Break, Plan e Execute.',
  },
}

/**
 * Retorna o caminho absoluto do diretório 'references/' de forma robusta.
 * Suporta execução em desenvolvimento (TS) e produção compilada (dist).
 */
export function getReferencesDir(): string {
  const pathsToTry = [
    path.resolve(__dirname, '../../../../references'), // executando de src/resources/index.ts
    path.resolve(__dirname, '../../../references'), // executando de dist/index.js
    path.resolve(process.cwd(), 'references'), // executando a partir da raiz
  ]

  for (const dir of pathsToTry) {
    if (fs.existsSync(dir)) {
      return dir
    }
  }

  throw new Error('Diretório de referências (references/) não foi encontrado.')
}

/**
 * Valida o parâmetro topic contra a whitelist e resolve o caminho de forma segura.
 * Aplica múltiplas camadas de proteção contra Directory Traversal.
 */
export function getSafeDocPath(topic: string, referencesDir: string): string {
  const cleanTopic = topic.toLowerCase().trim()
  const docConfig = DOCS_MAP[cleanTopic]

  if (!docConfig) {
    throw new Error(`Recurso de documentação não encontrado: ${topic}`)
  }

  const baseDir = path.resolve(referencesDir)
  const targetPath = path.resolve(baseDir, docConfig.filename)

  // Verificação 1: Proteção de prefixo contido com separador
  if (!targetPath.startsWith(baseDir + path.sep)) {
    throw new Error(
      `Violação de segurança: Tentativa de Directory Traversal detectada.`
    )
  }

  // Verificação 2: Proteção usando path.relative
  const relative = path.relative(baseDir, targetPath)
  const isSafe =
    relative && !relative.startsWith('..') && !path.isAbsolute(relative)

  if (!isSafe) {
    throw new Error(
      `Violação de segurança: Caminho de arquivo inválido resolvido.`
    )
  }

  return targetPath
}

/**
 * Registra os recursos de documentação técnica no servidor MCP.
 */
export function registerResources(server: McpServer): void {
  Object.entries(DOCS_MAP).forEach(([key, config]) => {
    const resourceUri = `design-system://docs/${key}`

    server.registerResource(
      key,
      resourceUri,
      {
        title: config.title,
        description: config.description,
        mimeType: 'text/markdown',
      },
      async (uri) => {
        try {
          const referencesDir = getReferencesDir()
          const safePath = getSafeDocPath(key, referencesDir)

          const content = await fs.promises.readFile(safePath, 'utf-8')

          return {
            contents: [
              {
                uri: uri.href,
                mimeType: 'text/markdown',
                text: content,
              },
            ],
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error)
          console.error(`Erro ao ler recurso ${resourceUri}: ${errorMsg}`)
          throw new Error(`Falha ao ler recurso do MCP: ${errorMsg}`)
        }
      }
    )
  })
}
```

#### 2. Modificação em `packages/mcp-server/src/index.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerResources } from './resources/index.js'

// Inicializa o servidor MCP do Design System
const server = new McpServer({
  name: 'design-system-mcp-server',
  version: '1.0.0',
})

// Registrar Recursos
registerResources(server)

// ... restante da inicialização e transporte Stdio
```

#### 3. Arquivo de Testes Unitários `packages/mcp-server/src/resources/index.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import fs from 'fs'
import path from 'path'
import {
  getSafeDocPath,
  getReferencesDir,
  registerResources,
  DOCS_MAP,
} from './index.js'

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn(),
    promises: {
      ...actual.promises,
      readFile: vi.fn(),
    },
  }
})

describe('MCP Resources System', () => {
  const mockReferencesDir = path.resolve(
    '/mock/projetos/design-system/references'
  )

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getReferencesDir', () => {
    it('deve retornar o primeiro caminho válido encontrado', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return typeof p === 'string' && p.includes('references')
      })
      const dir = getReferencesDir()
      expect(dir).toBeDefined()
      expect(dir).toContain('references')
    })

    it('deve lançar erro se o diretório não existir em nenhuma das opções', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      expect(() => getReferencesDir()).toThrow('Diretório de referências')
    })
  })

  describe('getSafeDocPath', () => {
    it('deve retornar o caminho absoluto correto para um tópico válido', () => {
      const targetPath = getSafeDocPath('accessibility', mockReferencesDir)
      expect(targetPath).toBe(
        path.resolve(mockReferencesDir, 'ACCESSIBILITY.md')
      )
    })

    it('deve lançar erro para tópicos inexistentes', () => {
      expect(() => getSafeDocPath('unknown_topic', mockReferencesDir)).toThrow(
        'Recurso de documentação não encontrado: unknown_topic'
      )
    })

    it('deve lidar de forma case-insensitive e aparar espaços em branco', () => {
      const targetPath = getSafeDocPath('  THEMING  ', mockReferencesDir)
      expect(targetPath).toBe(path.resolve(mockReferencesDir, 'THEMING.md'))
    })

    it('deve lançar erro em caso de tentativa de Directory Traversal', () => {
      // Como usamos DOCS_MAP para whitelisting, strings com Directory Traversal falham na whitelist
      expect(() =>
        getSafeDocPath('../../etc/passwd', mockReferencesDir)
      ).toThrow('não encontrado')
    })
  })

  describe('registerResources', () => {
    it('deve registrar todos os tópicos mapeados no servidor MCP', () => {
      const server = new McpServer({ name: 'test', version: '1.0.0' })
      const spyRegister = vi.spyOn(server, 'registerResource')

      registerResources(server)

      const expectedCount = Object.keys(DOCS_MAP).length
      expect(spyRegister).toHaveBeenCalledTimes(expectedCount)
    })
  })
})
```

---

## Decisões Técnicas

1. **Combinação de Whitelist + Validação de Caminho**: A decisão mais segura para evitar Directory Traversal (CWE-22) é não permitir caminhos dinâmicos diretos do cliente. Ao associar a URI estritamente a chaves conhecidas em `DOCS_MAP`, mitigamos o risco em nível de aplicação. A validação adicional com `path.resolve` e `path.relative` atua como defesa em profundidade caso o mapa de documentos seja estendido dinamicamente no futuro.
2. **Resolução de Caminho em Tempo Real (Leitura Sob Demanda)**: Em vez de carregar todos os documentos markdown em memória na inicialização do servidor MCP, lemos os arquivos em tempo real utilizando `fs.promises.readFile`. Isso garante que correções, novas diretrizes ou alterações nos documentos de referência sejam exibidas aos agentes clientes instantaneamente, sem necessidade de reinicialização do processo.
3. **Detecção Dinâmica do Diretório `references/`**: O compilador TypeScript gera o código compilado em `dist/index.js`. Devido a isso, a estrutura relativa de arquivos difere entre a execução em desenvolvimento (usando TS puro) e em produção (código JS compilado). A função `getReferencesDir` faz uma busca dinâmica nos possíveis caminhos baseados na localização atual do arquivo e no diretório de trabalho do processo (`process.cwd()`), provendo estabilidade e reduzindo falhas de runtime.
4. **Utilização da Extensão `.js` em Imports Locais**: Como o projeto utiliza Node.js com suporte a ES Modules nativo (`"type": "module"`), as importações TypeScript de arquivos locais devem explicitamente declarar a extensão `.js` no caminho relativo (ex: `import { ... } from './resources/index.js'`). Isso evita conflitos na fase de execução do Node.js após a compilação.
5. **Formato UTF-8 e Mime-Type text/markdown**: Como expomos guias e documentações técnicas em formato markdown, especificamos rigidamente o encoding `utf-8` na leitura do arquivo e informamos o mime-type correspondente ao protocolo MCP para permitir o parse visual otimizado por parte dos clientes.

---

## Checklist de Implementação

- [x] 1. Criar o subdiretório `packages/mcp-server/src/resources/` caso não exista.
- [x] 2. Criar o arquivo de implementação de recursos `packages/mcp-server/src/resources/index.ts`.
- [x] 3. Declarar e exportar o dicionário estrito `DOCS_MAP` mapeando cada chave do recurso ao respectivo arquivo em `references/` (ex: `accessibility` -> `ACCESSIBILITY.md`).
- [x] 4. Definir metadados claros (`title` e `description`) em português para cada entrada do `DOCS_MAP`.
- [x] 5. Implementar a função `getReferencesDir` para resolver de forma dinâmica a pasta `/references` suportando caminhos em `dist` e `src`.
- [x] 6. Implementar validações para levantar erro caso o diretório de referências não seja localizado pela função `getReferencesDir`.
- [x] 7. Implementar a função `getSafeDocPath` para validar o parâmetro `topic` de entrada.
- [x] 8. Aplicar normalização case-insensitive na pesquisa da whitelist em `getSafeDocPath`.
- [x] 9. Adicionar verificação de segurança em `getSafeDocPath` usando `path.resolve` para assegurar a canonicalização do caminho final.
- [x] 10. Implementar verificação de Directory Traversal com prefixo contido (`startsWith` contendo `path.sep` final) no caminho absoluto gerado.
- [x] 11. Implementar verificação secundária de segurança usando `path.relative()` garantindo que o caminho não saia da base.
- [x] 12. Implementar a função principal `registerResources(server: McpServer)` para gerenciar os registros.
- [x] 13. Iterar sobre as chaves de `DOCS_MAP` usando `server.registerResource` para publicar individualmente cada recurso.
- [x] 14. Configurar o mimeType do recurso registrado como `text/markdown`.
- [x] 15. Adicionar a leitura assíncrona do arquivo de documentação do disco com `fs.promises.readFile` no encoding `utf-8`.
- [x] 16. Estruturar a resposta do handler do recurso seguindo a interface do protocolo MCP (`contents: [{ uri, mimeType, text }]`).
- [x] 17. Adicionar bloco try-catch robusto e direcionar erros na leitura para o terminal stderr (`console.error`).
- [x] 18. Atualizar o arquivo principal `packages/mcp-server/src/index.ts` importando e registrando os recursos do módulo.
- [x] 19. Assegurar conformidade com a especificação ESM usando sufixos `.js` nos caminhos de importação relativos.
- [x] 20. Criar o arquivo de testes unitários `packages/mcp-server/src/resources/index.test.ts`.
- [x] 21. Adicionar testes unitários para a função `getReferencesDir` cobrindo cenários de sucesso e caminhos inexistentes.
- [x] 22. Adicionar testes unitários para `getSafeDocPath` validando sucesso, case-insensitivity, trim de espaços e falhas com tópicos inexistentes.
- [x] 23. Adicionar testes simulando tentativas de path traversal em `getSafeDocPath` para validar o bloqueio do ataque.
- [x] 24. Adicionar testes verificando se todos os recursos no `DOCS_MAP` foram corretamente registrados na inicialização do servidor.
- [x] 25. Executar a suíte de testes usando `pnpm test` e verificar se a cobertura de testes é atendida sem erros de TypeScript ou tempo de execução.
