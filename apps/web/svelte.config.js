import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Vercel aplica patches de seguridad de 24.x automáticamente
      runtime: 'nodejs24.x'
    })
  }
};

export default config;
