import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Prioridad: apps/web/.env* → raíz del monorepo → default 3003 (este proyecto)
  const envWeb = loadEnv(mode, process.cwd(), '');
  const envRoot = loadEnv(mode, process.cwd() + '/../..', '');
  const apiUrl =
    envWeb.PUBLIC_API_URL ||
    envRoot.PUBLIC_API_URL ||
    'http://localhost:3003';
  const webPort = Number(envWeb.PORT || envWeb.WEB_PORT || 5173);

  return {
    plugins: [sveltekit()],
    server: {
      port: webPort,
      strictPort: false, // si 5173 está ocupado, Vite toma el siguiente libre
      proxy: {
        '/api': apiUrl,
        '/uploads': apiUrl
      }
    }
  };
});
