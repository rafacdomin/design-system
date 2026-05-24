import { describe, it, expect, vi, beforeEach } from 'vitest'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as fs from 'fs'
import path from 'path'
import {
  getSafeDocPath,
  getReferencesDir,
  registerResources,
  DOCS_MAP,
} from './index.js'

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  const mockExistsSync = vi.fn()
  const mockReadFile = vi.fn()

  const actualObj = actual as unknown as Record<string, unknown>
  const actualDefault = (actualObj.default || {}) as Record<string, unknown>
  const actualDefaultPromises = (actualDefault.promises || {}) as Record<
    string,
    unknown
  >

  return {
    ...actual,
    existsSync: mockExistsSync,
    promises: {
      ...actual.promises,
      readFile: mockReadFile,
    },
    default: {
      ...actualDefault,
      existsSync: mockExistsSync,
      promises: {
        ...actualDefaultPromises,
        readFile: mockReadFile,
      },
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
      expect(() =>
        getSafeDocPath('../../etc/passwd', mockReferencesDir)
      ).toThrow('Recurso de documentação não encontrado')
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
