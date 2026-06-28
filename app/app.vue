<script setup lang="ts">
const { compared } = useCompare()

useHead({
  bodyAttrs: {
    class: computed(() => compared.value.length > 0 ? 'has-compare-panel' : ''),
  },
})
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
            <p style="margin-bottom: 16px;">Wystąpił błąd podczas ładowania strony.</p>
            <button style="background: #8B0D1D; color: white; border: none; border-radius: 8px; padding: 10px 22px; cursor: pointer; font-size: 14px;" @click="clearError({ redirect: '/' })">
              Odśwież stronę
            </button>
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
