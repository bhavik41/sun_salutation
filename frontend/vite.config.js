import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001',
      '/start_pose_detection': 'http://localhost:5001',
      '/start_yoga_pose_detection': 'http://localhost:5001',
      '/stop_pose_detection': 'http://localhost:5001',
      '/stop_yoga_pose_detection': 'http://localhost:5001',
      '/feedback': 'http://localhost:5001',
    }
  }
})
