import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
  },
  kit: {
    adapter: adapter(),
    env: {
      // The .env lives at the monorepo root, not in this app dir. This is what
      // $env/static|dynamic resolve against (Vite's envDir only affects
      // import.meta.env).
      dir: '../..',
    },
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
