// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  site: {
    url: 'https://playground-sunshine.dev',
    name: 'Playground Sunshine',
  },

  modules: ['@nuxtjs/tailwindcss', '@vercel/analytics', '@nuxtjs/sitemap'],

  sitemap: {
    // All pages/ routes are auto-discovered; nothing extra needed for a static site
    strictNuxtContentPaths: false,
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Playground Sunshine' },
        { name: 'twitter:card', content: 'summary' },
      ],
    },
  },
})
