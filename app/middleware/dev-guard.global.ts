const ACCESS_KEY = 'carizo2026'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/api/')) return

  const cookie = useCookie('dev_access', { maxAge: 60 * 60 * 24 * 30 })

  if (to.query.dev_key === ACCESS_KEY) {
    cookie.value = ACCESS_KEY
    return navigateTo('/')
  }

  if (to.path === '/coming-soon') return

  if (cookie.value !== ACCESS_KEY) {
    return navigateTo('/coming-soon')
  }
})
