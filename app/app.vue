<script setup lang="ts">
</script>

<template>
  <v-app>
    <AppAnnouncementBar />
    <NavBar />
    <v-main>
      <NuxtPage :transition="{ name: 'page-fade', mode: 'out-in' }" />
    </v-main>
    <AppFooter />
    <ComparePanel />
    <CookieConsent />
    <AppToast />
  </v-app>
</template>
