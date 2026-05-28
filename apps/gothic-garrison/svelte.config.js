import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
  },
  kit: {
    adapter: adapter(),
    serviceWorker: {
      // vite-plugin-pwa registers its own worker; tell SvelteKit not to.
      register: false,
    },
    alias: {
      '$db': '../../packages/db/src',
    },
  },
};

export default config;
