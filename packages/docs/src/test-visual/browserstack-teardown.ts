import { FullConfig } from '@playwright/test'
import { Local } from 'browserstack-local'

export default async function globalTeardown(
  _config: FullConfig
): Promise<void> {
  const bsLocal = (globalThis as unknown as { __bsLocal__?: Local }).__bsLocal__

  if (bsLocal) {
    console.log('Stopping BrowserStack Local Tunnel...')
    await new Promise<void>((resolve) => {
      bsLocal.stop(() => {
        console.log('BrowserStack Local Tunnel stopped.')
        resolve()
      })
    })
  }
}
