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
  const filterComponent =
    entry.title?.includes(process.env.COMPONENT || '') ?? true
  return isStory && !hasSkipVisual && filterComponent
})

test.describe('Visual Regression Tests', () => {
  for (const story of stories) {
    test(`Visual: ${story.title} - ${story.name}`, async ({ page }) => {
      // 1. Tema Light
      const storyUrlLight = `/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`
      await page.goto(storyUrlLight, { waitUntil: 'load' })
      await page.waitForTimeout(300)

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
      await page.goto(storyUrlDark, { waitUntil: 'load' })
      await page.waitForTimeout(300)

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
