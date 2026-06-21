import { fileURLToPath } from 'node:url'

const scss = (file: string) =>
  fileURLToPath(new URL(`./app/assets/scss/${file}`, import.meta.url)).replace(/\\/g, '/')

export default defineNuxtConfig({
  modules: ['vuetify-nuxt-module'],
  compatibilityDate: '2025-07-15',

  typescript: {
    typeCheck: false, // TODO: enable once all type errors are resolved
  },

  nitro: {
    preset: 'node_server',
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        }
      }
    }
  },
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  css: ['~/assets/scss/main.scss', '@mdi/font/css/materialdesignicons.min.css'],

  vite: {
    build: {
      rollupOptions: {
        output: {
          // Rename chunks whose names contain 'adver' — ad blockers block them
          chunkFileNames: (chunk) => {
            const n = (chunk.name ?? '').toLowerCase()
            if (n.includes('adver')) return '_nuxt/listings.[hash].js'
            return '_nuxt/[name].[hash].js'
          },
          assetFileNames: (asset) => {
            const n = (asset.name ?? '').toLowerCase()
            if (n.includes('adver') && n.endsWith('.css')) return '_nuxt/listings.[hash].css'
            return '_nuxt/[name].[hash][extname]'
          },
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "${scss('_variables')}"; @import "${scss('_mixins')}";`,
          silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
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
    // Server-only secrets (never exposed to client)
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    imojeWebhookSecret: process.env.NUXT_IMOJE_WEBHOOK_SECRET ?? '',
    internalServiceSecret: process.env.NUXT_INTERNAL_SERVICE_SECRET ?? '',
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY ?? '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:5105/',
      premiereStart: process.env.NUXT_PUBLIC_PREMIERE_START ?? '2026-06-12T00:00:00+02:00',
      premiereEnd: process.env.NUXT_PUBLIC_PREMIERE_END ?? '2026-06-15T00:00:00+02:00',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://carizo.pl',
      // Analytics — set in .env to activate
      gtmId:       process.env.NUXT_PUBLIC_GTM_ID       ?? '',
      ga4Id:       process.env.NUXT_PUBLIC_GA4_ID       ?? '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID ?? '',
      clarityId:   process.env.NUXT_PUBLIC_CLARITY_ID   ?? '',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
      googleClientId:   process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID   ?? '',
      facebookAppId:    process.env.NUXT_PUBLIC_FACEBOOK_APP_ID    ?? '',
      // Social media links — set in .env
      socialFacebook:  process.env.NUXT_PUBLIC_SOCIAL_FACEBOOK  ?? '',
      socialInstagram: process.env.NUXT_PUBLIC_SOCIAL_INSTAGRAM ?? '',
      socialTiktok:    process.env.NUXT_PUBLIC_SOCIAL_TIKTOK    ?? '',
      socialYoutube:   process.env.NUXT_PUBLIC_SOCIAL_YOUTUBE   ?? '',
      devAccessKey:    process.env.DEV_ACCESS_KEY ?? '',
    }
  }
})