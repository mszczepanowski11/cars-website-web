<script setup lang="ts">
const { compared } = useCompare()

// Emits <html lang>, canonical and hreflang alternate links for every locale on every page -
// this is what makes the multilingual pages correctly discoverable worldwide in search engines.
const head = useLocaleHead()

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: head.value.link,
  meta: head.value.meta,
  bodyAttrs: {
    class: computed(() => compared.value.length > 0 ? 'has-compare-panel' : '').value,
  },
}))
</script>

<template>
  <v-app>
    <a href="#main-content" class="skip-to-main">Przejdź do treści</a>
    <AppAnnouncementBar />
    <NavBar />
    <v-main id="main-content">
      <NuxtErrorBoundary>
        <NuxtPage :transition="{ name: 'page-fade' }" />
        <template #error="{ error, clearError }">
          <div style="padding: 80px 24px; text-align: center; color: rgba(255,255,255,0.7); font-family: Inter, sans-serif;">
            <p v-if="(error as any)?.statusCode === 404" style="margin-bottom: 8px; font-size: 18px; font-weight: 600; color: #fff;">Nie znaleziono strony</p>
            <p v-else style="margin-bottom: 8px; font-size: 18px; font-weight: 600; color: #fff;">Wystąpił błąd</p>
            <p style="margin-bottom: 24px; font-size: 14px;">
              {{ (error as any)?.statusCode === 404 ? 'Strona, której szukasz, nie istnieje lub została przeniesiona.' : 'Coś poszło nie tak. Spróbuj odświeżyć stronę.' }}
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button style="background: #8B0D1D; color: white; border: none; border-radius: 8px; padding: 10px 22px; cursor: pointer; font-size: 14px;" @click="clearError({ redirect: '/' })">
                Strona główna
              </button>
              <button v-if="(error as any)?.statusCode !== 404" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 10px 22px; cursor: pointer; font-size: 14px;" @click="clearError()">
                Spróbuj ponownie
              </button>
            </div>
          </div>
        </template>
      </NuxtErrorBoundary>
    </v-main>
    <AppFooter />
    <ComparePanel />
    <CookieConsent />
    <AppToast />
  </v-app>
</template>
