<script setup lang="ts">
const authStatus = useCookie('auth_status')
const isLoggedIn = computed(() => !!authStatus.value)
const { logout } = useAuth()
const { unreadCount, fetchUnreadCount } = useMessages()
onMounted(() => fetchUnreadCount())
</script>

<template>
    <header class="carizo-nav">
        <div class="nav-inner">
            <NuxtLink to="/" class="logo">CARI<span>ZO</span></NuxtLink>

            <nav class="nav-links">
                <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
                <NuxtLink to="/categories">Kategorie</NuxtLink>
                <NuxtLink to="/#about">O nas</NuxtLink>
                <NuxtLink to="/#contact">Kontakt</NuxtLink>
            </nav>

            <div class="nav-btns">
                <NuxtLink v-if="isLoggedIn" to="/favorites" class="nav-icon-btn" title="Ulubione">
                    <v-icon icon="mdi-heart-outline" size="22" />
                    <span class="nav-icon-label">Ulubione</span>
                </NuxtLink>
                <NuxtLink v-if="isLoggedIn" to="/messages" class="nav-icon-btn" title="Wiadomości">
                    <v-badge v-if="unreadCount > 0" :content="String(unreadCount)" color="primary" floating>
                        <v-icon icon="mdi-message-outline" size="22" />
                    </v-badge>
                    <v-icon v-else icon="mdi-message-outline" size="22" />
                    <span class="nav-icon-label">Wiadomości</span>
                </NuxtLink>
                <template v-if="!isLoggedIn">
                    <NuxtLink to="/login" class="btn-login">Zaloguj się</NuxtLink>
                </template>
                <template v-else>
                    <NuxtLink to="/dashboard" class="btn-login">
                        <v-icon icon="mdi-account-circle-outline" size="20" class="mr-1" />
                        Konto
                    </NuxtLink>
                    <button class="btn-login" @click="logout">Wyloguj</button>
                </template>
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
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-inner {
    @include container;
    height: $nav-height;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.logo {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;
    text-decoration: none;

    span {
        color: $red;
    }
}

.nav-links {
    display: flex;
    gap: 30px;

    a {
        color: $text-link;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.2s;

        &:hover,
        &.router-link-active {
            color: $text;
        }
    }

    @include respond-to(sm) {
        display: none;
    }
}

.nav-btns {
    display: flex;
    gap: 10px;
    align-items: center;
}

.nav-icon-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    color: $text-muted;
    font-size: 13px;
    text-decoration: none;
    padding: 6px 10px;
    border-radius: $r-sm;
    transition: color 0.2s;

    &:hover {
        color: $text;
    }
}

.nav-icon-label {
    @include respond-to(md) {
        display: none;
    }
}

.btn-login {
    @include btn(transparent, $text-muted);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    font-size: 13px;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: $text;
    }
}

.btn-add {
    @include btn($red);
    font-size: 13px;
}
</style>