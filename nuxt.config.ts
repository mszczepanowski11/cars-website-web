import { fileURLToPath } from 'node:url'

const scss = (file: string) =>
  fileURLToPath(new URL(`./app/assets/scss/${file}`, import.meta.url)).replace(/\\/g, '/')

export default defineNuxtConfig({
  modules: ['vuetify-nuxt-module'],
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },

  css: ['~/assets/scss/main.scss', '@mdi/font/css/materialdesignicons.min.css'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "${scss('_variables')}"; @import "${scss('_mixins')}";`
        }
      }
    }
  },

  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'carizo',
        themes: {
          carizo: {
            dark: true,
            colors: {
              background: '#050505',
              surface: '#0d0d0d',
              primary: '#8B0D1D',
              secondary: '#888888',
            }
          }
        }
      },
      defaults: {
        VCard: { rounded: 'xl', color: 'surface' },
        VBtn: { rounded: 'lg' },
        VTextField: { variant: 'outlined', bgColor: '#090909' },
        VSelect: { variant: 'outlined', bgColor: '#090909' },
        VTextarea: { variant: 'outlined', bgColor: '#090909' },
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:5105/'
    }
  }
})