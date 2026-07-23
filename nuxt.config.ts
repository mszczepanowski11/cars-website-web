import { fileURLToPath } from 'node:url'

const scss = (file: string) =>
  fileURLToPath(new URL(`./app/assets/scss/${file}`, import.meta.url)).replace(/\\/g, '/')

export default defineNuxtConfig({
  modules: ['vuetify-nuxt-module', '@nuxt/image', '@nuxtjs/i18n'],
  compatibilityDate: '2025-07-15',

  // Multilingual + global SEO. Polish stays unprefixed (carizo.eu/...) so every existing URL keeps
  // working; other languages get a prefix (carizo.eu/en/..., carizo.eu/de/...). baseUrl makes the
  // module emit hreflang alternate links automatically for every localized route.
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'pl',
    lazy: true,
    langDir: 'locales',
    locales: [
      // Multi-file per locale: base chrome (nav/footer/home/adverts/firmy) plus one fragment per
      // page-group. The module deep-merges them into a single message tree at build time.
      { code: 'pl', language: 'pl-PL', name: 'Polski', files: ['pl.json', 'auth.pl.json', 'info.pl.json', 'commerce.pl.json', 'account.pl.json', 'detail.pl.json', 'legal.pl.json', 'components.pl.json', 'addadvert.pl.json'] },
      { code: 'en', language: 'en-US', name: 'English', files: ['en.json', 'auth.en.json', 'info.en.json', 'commerce.en.json', 'account.en.json', 'detail.en.json', 'legal.en.json', 'components.en.json', 'addadvert.en.json'] },
      { code: 'de', language: 'de-DE', name: 'Deutsch', files: ['de.json', 'auth.de.json', 'info.de.json', 'commerce.de.json', 'account.de.json', 'detail.de.json', 'legal.de.json', 'components.de.json', 'addadvert.de.json'] },
    ],
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://carizo.eu',
    // Auto-detection OFF: the unprefixed URL (carizo.eu/) is always Polish, /en and /de are the
    // other languages. Predictable canonical URLs, no surprise redirect that would flip the
    // default page to the visitor's browser language. Manual switch via the navbar; can be
    // enabled later once per-language content is complete.
    detectBrowserLanguage: false,
    bundle: { optimizeTranslationDirective: false },
    // strictMessage defaults to true and hard-fails the build on any HTML tag in a translation
    // string (its heuristic against accidental XSS via v-html'd messages) - several legal/detail/
    // info strings intentionally use <strong> for emphasis and are rendered through v-html at the
    // call site, so this needs to be a non-fatal warning instead of a build breaker.
    compilation: { strictMessage: false },
  },

  image: {
    // Our own image proxy (server/routes/img/) already resolves local uploads and Cloudinary
    // assets through ad-blocker-safe paths; this provider just adds width/quality/format query
    // params on top so <NuxtImg> gets real resizing/format-negotiation instead of full-size passthrough.
    provider: 'carizo',
    providers: {
      carizo: {
        name: 'carizo',
        provider: '~/providers/carizo.ts',
      },
    },
  },

  app: {
    head: {
      meta: [
        // maximum-scale=1 + user-scalable=no stop iOS Safari's automatic zoom-in when a form
        // field is focused (its default behavior for any input with font-size below 16px) —
        // without this, tapping a field on add-advert visibly zooms/shifts the page instead of
        // staying full-screen and centered.
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'google-site-verification', content: 'M-Xj_zIclGdrERVKvxc9I_1Zlp7Wb93dgzUL-N7x0ks' },
        { name: 'theme-color', content: '#050505' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://res.cloudinary.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        // Google's own favicon crawler (and older browsers) don't reliably resolve an
        // SVG-only favicon - it needs a real .ico/.png fallback to actually show up next
        // to search results, so the SVG is an enhancement on top of a full raster set,
        // not a replacement for one.
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512x512.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      script: [
        {
          // Cookie Consent Mode v2 — must run BEFORE GTM/GA4 loads
          children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'denied',personalization_storage:'denied'});`,
          tagPriority: 'critical',
        },
      ],
    },
  },

  typescript: {
    typeCheck: false, // TODO: enable once all type errors are resolved
  },

  nitro: {
    preset: 'node_server',
    // sharp's native bindings (used by server/routes/og/advert/[id].ts) can't be bundled -
    // keep it fully external. Nitro's own output-copy step still misses the libvips shared
    // library its .node binary dlopen's at the OS level (invisible to static analysis), so
    // the gap is closed by a "postbuild" script (see package.json / scripts/postbuild-sharp.mjs)
    // that copies it in directly rather than fighting the tracer's config for this.
    externals: {
      external: ['sharp']
    },
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://connect.facebook.net https://www.googletagmanager.com https://static.clarity.ms https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-src https://www.openstreetmap.org https://accounts.google.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self' https://paywall.imoje.pl https://sandbox.paywall.imoje.pl;",
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
    // Maintenance mode — set NUXT_SITE_PASSWORD to a non-empty value to enable
    sitePassword: process.env.NUXT_SITE_PASSWORD ?? '',
    // Same Cloudinary account/env var names as cars-website-api (Program.cs) — used to persist
    // generated advert ad-card (OG/social) images so crawlers never wait on a live render.
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    public: {
      maintenanceMode: process.env.NUXT_PUBLIC_MAINTENANCE_MODE ?? '',
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:5105/',
      premiereStart: process.env.NUXT_PUBLIC_PREMIERE_START ?? '2026-07-04T00:00:00+02:00',
      premiereEnd: process.env.NUXT_PUBLIC_PREMIERE_END ?? '2026-07-13T00:00:00+02:00',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://carizo.eu',
      // Analytics — set in .env to activate
      gtmId:       process.env.NUXT_PUBLIC_GTM_ID       ?? '',
      ga4Id:       process.env.NUXT_PUBLIC_GA4_ID       ?? '',
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID ?? '',
      clarityId:   process.env.NUXT_PUBLIC_CLARITY_ID   ?? '',
      googleAdsId: process.env.NUXT_PUBLIC_GOOGLE_ADS_ID ?? '',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
      googleClientId:   process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID   ?? '',
      facebookAppId:    process.env.NUXT_PUBLIC_FACEBOOK_APP_ID    ?? '',
      // Social media links — set in .env
      socialFacebook:  process.env.NUXT_PUBLIC_SOCIAL_FACEBOOK  ?? 'https://www.facebook.com/profile.php?id=61589324586693&locale=pl_PL',
      socialInstagram: process.env.NUXT_PUBLIC_SOCIAL_INSTAGRAM ?? 'https://www.instagram.com/carizo.eu/',
      socialTiktok:    process.env.NUXT_PUBLIC_SOCIAL_TIKTOK    ?? 'https://www.tiktok.com/@carizo.eu',
      socialYoutube:   process.env.NUXT_PUBLIC_SOCIAL_YOUTUBE   ?? '',
      devAccessKey:    process.env.DEV_ACCESS_KEY ?? '',
    }
  }
})