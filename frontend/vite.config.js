import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/start_pose_detection': 'http://localhost:5000',
      '/start_yoga_pose_detection': 'http://localhost:5000',
      '/stop_pose_detection': 'http://localhost:5000',
      '/stop_yoga_pose_detection': 'http://localhost:5000',
      '/feedback': 'http://localhost:5000',
    }
  }
})
