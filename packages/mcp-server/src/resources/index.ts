import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  spec: {
    filename: 'COMPONENT_SPEC.md',
    title: 'Especificações dos Componentes',
    description:
      'Catálogo de especificações funcionais e requisitos de comportamento/estados para cada componente do design system.',
  },
  testing: {
    filename: 'TESTING_STRATEGY.md',
    title: 'Estratégia de Testes do Design System',
    description:
      'Práticas de TDD, testes unitários com Vitest/RTL e testes visuais/regressão de componentes.',
  },
  inspirations: {
    filename: 'INSPIRATIONS.md',
    title: 'Referências e Inspirações',
    description:
      'Catálogo de APIs e referências externas que guiaram as decisões de design e nomenclatura do design system.',
  },
  publishing: {
    filename: 'PUBLISHING.md',
    title: 'Publicação e CI/CD',
    description:
      'Guias e especificações sobre publicação de pacotes npm, versionamento semântico e pipelines CI/CD.',
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
        } catch (error: unknown) {
          const errorMsg =
            error instanceof Error ? error.message : String(error)
          console.error(`Erro ao ler recurso ${resourceUri}: ${errorMsg}`)
          throw new Error(`Falha ao ler recurso do MCP: ${errorMsg}`)
        }
      }
    )
  })
}
