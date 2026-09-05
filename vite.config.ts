import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { authorStudioPlugin } from './authorServer'
import { staticLibraryRoutesPlugin } from './staticLibraryRoutes'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), authorStudioPlugin(), staticLibraryRoutesPlugin(env.VITE_SITE_URL)],
  }
})
