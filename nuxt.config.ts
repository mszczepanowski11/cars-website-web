export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'nuxt-auth-utils'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig:{
    public:{
      apiBase:process.env.NUXT_PUBLIC_API_BASE
    }
  }
})