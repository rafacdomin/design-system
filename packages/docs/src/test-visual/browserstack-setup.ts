import { FullConfig } from '@playwright/test'
import { Local } from 'browserstack-local'

export default async function globalSetup(_config: FullConfig): Promise<void> {
  if (!process.env.BROWSERSTACK_ACCESS_KEY) return

  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY
  if (!accessKey) {
    throw new Error(
      'BROWSERSTACK_ACCESS_KEY is required to run BrowserStack Local.'
    )
  }

  console.log('Starting BrowserStack Local Tunnel...')
  const bsLocal = new Local()

  await new Promise<void>((resolve, reject) => {
    bsLocal.start({ key: accessKey }, (error) => {
      if (error) {
        console.error('Error starting BrowserStack Local:', error)
        return reject(error)
      }
      console.log('BrowserStack Local Tunnel established successfully!')
      resolve()
    })
  })

  // Expose bsLocal globally so that teardown can access it securely without using 'any'
  ;(globalThis as unknown as { __bsLocal__: Local }).__bsLocal__ = bsLocal
}
