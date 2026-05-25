import * as fs from 'fs'
import * as path from 'path'

/**
 * Encontra a raiz do projeto monorepo de forma resiliente
 */
export function findProjectRoot(): string {
  let current = process.cwd()
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current
    }
    current = path.dirname(current)
  }
  return process.cwd()
}
