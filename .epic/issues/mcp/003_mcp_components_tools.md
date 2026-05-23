# 003 — Ferramentas: list_components, get_component_api & get_component_spec

## Status

[x] Planejada [ ] Em desenvolvimento [ ] Concluída

## Objetivo

Implementar as ferramentas MCP responsáveis por mapear os componentes do design system (`list_components`), expor suas APIs TypeScript (`get_component_api`) e retornar suas especificações e regras de acessibilidade e estados (`get_component_spec`).

## Critérios de Aceite

- [ ] Registro das ferramentas MCP no servidor principal.
- [ ] Lógica para varrer dinamicamente ou mapear estaticamente a pasta `packages/core/src/components` e `packages/carousel/src/components` no `list_components` para identificar componentes disponíveis.
- [ ] Implementação de parser (usando regex seguro, parser de TS ou mapeamento robusto) no `get_component_api` que lê as assinaturas e interfaces de props (`ButtonProps`, `InputProps`, etc.) do código fonte e extrai as descrições JSDoc.
- [ ] Implementação no `get_component_spec` de um parser markdown que extrai as seções de especificações de comportamento, estados e acessibilidade correspondentes a cada componente a partir do arquivo [COMPONENT_SPEC.md](file:///home/rafacdomin/projetos/design-system/references/COMPONENT_SPEC.md).
- [ ] Tratamento amigável de erro se for solicitado um componente inexistente.
- [ ] Garante que subcomponentes de Compound Components (como `Dropdown.Item` ou `Input.StartIcon`) sejam identificados e documentados na API do componente pai.
- [ ] Zero tipos `any` nas funções de varredura e parse.

## Arquivos a Criar/Modificar

- `packages/mcp-server/src/tools/components.ts` — implementação das ferramentas de componentes
- `packages/mcp-server/src/tools/index.ts` — registro das novas ferramentas
- `packages/mcp-server/src/index.ts` — inicialização das ferramentas no servidor

## Dependências Externas

- `typescript` — para análise estática da AST dos componentes (já presente como devDependency na raiz)

## Depende de

#001 (Setup do Pacote MCP Server)

## Estimativa

M

## Pesquisa

### 1. Protocolo MCP e Integração de Ferramentas

O Model Context Protocol (MCP) define um formato baseado em JSON-RPC 2.0 para comunicação bidirecional de ferramentas. O SDK oficial `@modelcontextprotocol/sdk` permite definir ferramentas através de schemas de validação estruturados (como Zod ou Schemas JSON puros).
As três ferramentas a serem expostas são:

- `list_components`: Permite descobrir quais componentes estão disponíveis para o agente IA consumir.
- `get_component_api`: Fornece a interface exata em TypeScript e a documentação JSDoc dos parâmetros para geração de código.
- `get_component_spec`: Permite à IA compreender o comportamento exigido e as regras WCAG 2.1 AA/WAI-ARIA associadas àquele componente.

### 2. Análise Estática de Código React

Para garantir que as propriedades reais do componente sejam retornadas, utilizaremos o TypeScript Compiler API (`typescript`) para inspecionar os arquivos de código-fonte (`.tsx`) em vez de regex ingênuas ou execução em tempo de execução. Isso é crucial para extrair com precisão interfaces de propriedades que estendem outras interfaces (como `React.ButtonHTMLAttributes`), capturar comentários JSDoc anexados a cada propriedade e identificar subcomponentes de Compound Components a partir de atribuições como `Component.displayName = 'Parent.Child'`.

### 3. Parsing do COMPONENT_SPEC.md

O arquivo [COMPONENT_SPEC.md](file:///home/rafacdomin/projetos/design-system/references/COMPONENT_SPEC.md) serve como única fonte de verdade para a documentação e regras dos componentes. Ao dividirmos o arquivo com base nos títulos principais (`## [0-9]+\. [A-Za-z]+`) e subtítulos (`###`), podemos extrair dinamicamente a especificação funcional de qualquer componente.

---

## Implementação Planejada

### Estrutura de Arquivos

```text
packages/mcp-server/src/tools/
├── index.ts          # Registro central e mapeamento dos schemas das ferramentas
└── components.ts     # Implementação dos parsers de código e markdown
```

### Schemas das Ferramentas (Validação)

As ferramentas serão declaradas e validadas usando Zod:

```typescript
import { z } from 'zod'

export const ListComponentsSchema = z.object({
  package: z.enum(['core', 'carousel', 'all']).optional().default('all'),
})

export const GetComponentApiSchema = z.object({
  componentName: z.string().min(1),
})

export const GetComponentSpecSchema = z.object({
  componentName: z.string().min(1),
})
```

### Pseudocódigo dos Parsers

#### 1. Varredura e Identificação de Componentes (`list_components`)

```typescript
import * as fs from 'fs'
import * as path from 'path'

interface ComponentMetadata {
  name: string
  package: 'core' | 'carousel'
  path: string
  subcomponents: string[]
}

export async function scanComponents(
  packageFilter: 'core' | 'carousel' | 'all' = 'all'
): Promise<ComponentMetadata[]> {
  const rootDir = process.cwd()
  const packages = [
    {
      name: 'core' as const,
      dir: path.join(rootDir, 'packages/core/src/components'),
    },
    {
      name: 'carousel' as const,
      dir: path.join(rootDir, 'packages/carousel/src/components'),
    },
  ]

  const results: ComponentMetadata[] = []

  for (const pkg of packages) {
    if (packageFilter !== 'all' && packageFilter !== pkg.name) continue
    if (!fs.existsSync(pkg.dir)) continue

    const dirs = await fs.promises.readdir(pkg.dir, { withFileTypes: true })
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue

      const compName = dir.name
      const compPath = path.join(pkg.dir, compName)
      const tsxPath = path.join(compPath, `${compName}.tsx`)

      if (fs.existsSync(tsxPath)) {
        const subcomponents = await findSubcomponents(compName, tsxPath)
        results.push({
          name: compName,
          package: pkg.name,
          path: path.relative(rootDir, compPath),
          subcomponents,
        })
      }
    }
  }

  return results
}

async function findSubcomponents(
  parentName: string,
  tsxPath: string
): Promise<string[]> {
  const content = await fs.promises.readFile(tsxPath, 'utf-8')
  // Encontrar subcomponentes declarados no displayName do Compound Pattern
  const matches = content.matchAll(
    new RegExp(`${parentName}\\.([A-Za-z0-9_]+)`, 'g')
  )
  const subs = new Set<string>()
  for (const match of matches) {
    if (match[1] && match[1] !== 'displayName') {
      subs.add(match[1])
    }
  }
  return Array.from(subs)
}
```

#### 2. Análise Estática de Props via AST (`get_component_api`)

```typescript
import * as ts from 'typescript'

interface PropMetadata {
  name: string
  type: string
  isOptional: boolean
  description: string
}

interface InterfaceMetadata {
  name: string
  props: PropMetadata[]
}

export function parseComponentApi(tsxPath: string): InterfaceMetadata[] {
  const content = fs.readFileSync(tsxPath, 'utf-8')
  const sourceFile = ts.createSourceFile(
    tsxPath,
    content,
    ts.ScriptTarget.Latest,
    true
  )

  const interfaces: InterfaceMetadata[] = []

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name.text
      // Selecionar interfaces que definem Props
      if (interfaceName.endsWith('Props')) {
        const props: PropMetadata[] = []

        for (const member of node.members) {
          if (ts.isPropertySignature(member)) {
            const propName = member.name.getText(sourceFile)
            const propType = member.type
              ? member.type.getText(sourceFile)
              : 'unknown'
            const isOptional = !!member.questionToken

            // Extração de comentários JSDoc
            let description = ''
            const jsDocTags = (member as any).jsDoc
            if (jsDocTags && jsDocTags.length > 0) {
              description = jsDocTags[0].comment || ''
            } else {
              const commentRanges = ts.getLeadingCommentRanges(
                content,
                member.pos
              )
              if (commentRanges && commentRanges.length > 0) {
                const rawComment = content.substring(
                  commentRanges[0].pos,
                  commentRanges[0].end
                )
                description = cleanComment(rawComment)
              }
            }

            props.push({
              name: propName,
              type: propType,
              isOptional,
              description: description.trim(),
            })
          }
        }

        interfaces.push({
          name: interfaceName,
          props,
        })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return interfaces
}

function cleanComment(comment: string): string {
  return comment
    .replace(/\/\*\*|\*\/|\*\s?/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
}
```

#### 3. Leitura e Divisão das Especificações de Markdown (`get_component_spec`)

```typescript
interface ComponentSpecMetadata {
  name: string
  description: string
  sections: Record<string, string>
}

export function parseComponentSpec(
  componentName: string
): ComponentSpecMetadata | null {
  const rootDir = process.cwd()
  const specPath = path.join(rootDir, 'references/COMPONENT_SPEC.md')
  if (!fs.existsSync(specPath)) {
    throw new Error('COMPONENT_SPEC.md não encontrado em references/')
  }

  const content = fs.readFileSync(specPath, 'utf-8')
  // Dividir pelas seções ## [0-9]+\. Componente
  const sections = content.split(/(?=^## \d+\.)/m)

  for (const section of sections) {
    const lines = section.split('\n')
    const heading = lines[0].trim()

    // Match "## 1. Button" ou "## 4. Dropdown (Select)"
    const match = heading.match(/^## \d+\.\s+([A-Za-z]+)/)
    if (!match) continue

    const parsedName = match[1]
    if (parsedName.toLowerCase() !== componentName.toLowerCase()) continue

    // Dividir subseções por ### X.Y
    const subSections = section.split(/(?=^### \d+\.\d+)/m)

    // A primeira seção contém a descrição curta
    const headerLines = subSections[0].split('\n').slice(1)
    const description = headerLines
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('---'))
      .join(' ')

    const sectionsMap: Record<string, string> = {}

    for (let i = 1; i < subSections.length; i++) {
      const subSec = subSections[i]
      const subLines = subSec.split('\n')
      const subHeading = subLines[0].trim()

      const titleMatch = subHeading.match(/^### \d+\.\d+\s+(.+)$/)
      if (titleMatch) {
        const title = titleMatch[1].trim()
        const body = subLines.slice(1).join('\n').trim()
        sectionsMap[title] = body
      }
    }

    return {
      name: parsedName,
      description,
      sections: sectionsMap,
    }
  }

  return null
}
```

---

## Decisões Técnicas

1. **Uso da API do TypeScript Compiler (`typescript`) para parsing de código**:
   - _Justificativa_: A alternativa seria usar expressões regulares para extrair interfaces de propriedades. No entanto, o código TypeScript de produção pode conter espaçamentos inconsistentes, comentários complexos, tipos em uniões com múltiplos caracteres e interfaces que estendem tipos genéricos. A API nativa do compilador TypeScript fornece uma árvore de sintaxe abstrata (AST) totalmente robusta, mantendo a consistência do design system sem adicionar dependências externas pesadas (como `ts-morph` ou `react-docgen`).
2. **Parser Customizado sem Dependências de Terceiros para Markdown (`references/COMPONENT_SPEC.md`)**:
   - _Justificativa_: A especificação possui um formato muito consistente (`## [Número]. [NomeComponente]`). Em vez de instalar pacotes como `marked` ou `unified` com vários plugins, um analisador baseado em expressões regulares e divisão de strings (`split`) é mais que suficiente, rápido e garante zero peso extra no pacote compilado do servidor MCP.
3. **In-Memory Caching de Metadados**:
   - _Justificativa_: Como os componentes do design system e as especificações markdown mudam apenas durante o desenvolvimento e não no uso regular do servidor MCP, podemos cachear em memória as análises de AST e parsing do markdown durante a execução da ferramenta. Isso reduz o tempo de resposta a milissegundos nas consultas subsequentes das IAs.
4. **Resolução Tolerante de Nomes de Componentes**:
   - _Justificativa_: Os usuários ou agentes de IA podem enviar nomes de componentes com casing incorreto (ex: `button`, `INPUT`) ou com termos descritivos extras. Os parsers normalizarão os nomes para caixa baixa (`toLowerCase()`) antes da comparação, e mapearão chaves comuns (ex: `Select` redireciona para `Dropdown`) garantindo robustez de pesquisa.

---

## Checklist de Implementação

- [ ] 1. Configurar dependências e typings necessários no `packages/mcp-server/package.json` (incluindo `typescript` como devDependency e peer dependency se necessário).
- [ ] 2. Criar o arquivo `packages/mcp-server/src/tools/components.ts` para agrupar as implementações lógicas das ferramentas.
- [ ] 3. Implementar a lógica de varredura `scanComponents` para ler dinamicamente as pastas `packages/core/src/components` e `packages/carousel/src/components`.
- [ ] 4. Adicionar lógica em `scanComponents` para ignorar diretórios que não possuem arquivos `.tsx`.
- [ ] 5. Implementar função `findSubcomponents` para inspecionar os arquivos `.tsx` em busca de atribuições de subcomponentes Compound (ex: `Dropdown.Item`).
- [ ] 6. Escrever testes unitários em Vitest para cobrir os retornos corretos de `list_components`, validando pacotes individuais e filtros.
- [ ] 7. Implementar o parser TypeScript AST `parseComponentApi` usando `ts.createSourceFile`.
- [ ] 8. Configurar o parser AST para identificar todas as interfaces terminadas em `Props` que estão declaradas no arquivo do componente.
- [ ] 9. Adicionar tratamento robusto de comentários JSDoc de propriedades usando a API de AST ou `ts.getLeadingCommentRanges` caso os nós nativos do compilador não preencham.
- [ ] 10. Implementar tratamento de props de subcomponentes de Compound no mesmo retorno (ex: as props de `DropdownItemProps` agregadas em `Dropdown`).
- [ ] 11. Escrever testes unitários em Vitest para `get_component_api` utilizando o código fonte do componente `Button` e do componente `Input`.
- [ ] 12. Implementar a função `parseComponentSpec` para fatiar o arquivo [COMPONENT_SPEC.md](file:///home/rafacdomin/projetos/design-system/references/COMPONENT_SPEC.md) com base em expressões regulares estruturadas.
- [ ] 13. Garantir que o parser do markdown capture corretamente a descrição do componente e todas as seções (Ex: Props, Comportamentos, Acessibilidade).
- [ ] 14. Escrever testes unitários em Vitest para `get_component_spec` certificando que a especificação de um componente é retornada por completo.
- [ ] 15. Definir schemas de validação Zod estruturados para os argumentos de entrada das três ferramentas em `packages/mcp-server/src/tools/index.ts`.
- [ ] 16. Mapear e registrar as ferramentas no MCP Server atendendo ao request handler de `ListToolsRequestSchema`.
- [ ] 17. Implementar roteamento das requisições JSON-RPC em `packages/mcp-server/src/index.ts` sob o handler de `CallToolRequestSchema`.
- [ ] 18. Adicionar tratamento amigável de erro para componentes inexistentes ou falhas ao ler diretórios (evitando derrubar o processo principal stdio).
- [ ] 19. Escrever testes de integração do ciclo JSON-RPC do MCP Server mockando `stdin`/`stdout` para as três ferramentas de componentes.
- [ ] 20. Rodar suite de lint, formatação e verificação de tipos estritos (sem uso de `any`) para garantir conformidade com o projeto.
