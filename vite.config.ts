import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { authorStudioPlugin } from './authorServer'

export default defineConfig({
  plugins: [react(), authorStudioPlugin()],
})
