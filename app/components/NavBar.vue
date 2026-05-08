<script setup lang="ts">

const token = useCookie('auth_token')
const isLoggedIn = computed(() => !!token.value)
function logout() { token.value = null; navigateTo('/') }

</script>


<template>
    <header class="carizo-nav">
        <div class="nav-inner">
            <NuxtLink to="/" class="logo">CARI<span>ZO</span></NuxtLink>

            <nav class="nav-links">
                <NuxtLink to="/">Strona główna</NuxtLink>
                <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
                <NuxtLink v-if="isLoggedIn" to="/my-adverts">Moje ogłoszenia</NuxtLink>
            </nav>

            <div class="nav-btns">
                <NuxtLink v-if="!isLoggedIn" to="/login" class="btn-login">Zaloguj się</NuxtLink>
                <button v-else class="btn-login" @click="logout">Wyloguj</button>
                <NuxtLink to="/add-advert" class="btn-add">Dodaj ogłoszenie</NuxtLink>
            </div>
        </div>
    </header>
</template>

<style lang="scss" scoped>
.carizo-nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-inner {
  @include container;
  height: $nav-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 6px;
  color: $text;

  span { color: $red; }
}

.nav-links {
  display: flex;
  gap: 35px;

  a {
    color: $text-link;
    font-size: 15px;
    transition: color 0.2s;
    &:hover { color: $text; }
  }

  @include respond-to(sm) { display: none; }
}

.nav-btns {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-login {
  @include btn(#111, $text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  &:hover { background: #1a1a1a; }
}

.btn-add { @include btn($red); }
</style>