import { defineConfig } from 'tsup'
import { sassPlugin } from 'esbuild-sass-plugin'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  esbuildPlugins: [
    sassPlugin({
      type: 'local-css',
    }),
  ],
})
