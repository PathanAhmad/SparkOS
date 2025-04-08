import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // I'm trying to only load `VITE_` prefixed environment variables
  const env = loadEnv(mode, process.cwd(), 'VITE');

  return {
    server: { port: 3000 },
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  };
});
