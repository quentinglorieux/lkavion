import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: 'app/',

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@nuxt/ui'
  ],

  runtimeConfig: {
    directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
    directusApiToken: process.env.DIRECTUS_API_TOKEN,
    public: {
      directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055'
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  }
})