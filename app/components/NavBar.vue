<script setup lang="ts">
const authStatus = useCookie('auth_status')
const isLoggedIn = computed(() => !!authStatus.value)
const { logout } = useAuth()
const { unreadCount, fetchUnreadCount } = useMessages()
onMounted(() => fetchUnreadCount())

const categoriesOpen = ref(false)
const categories = [
    { label: 'Osobowe', icon: 'mdi-car-outline' },
    { label: 'SUV / Crossover', icon: 'mdi-car-estate' },
    { label: 'Elektryczne', icon: 'mdi-ev-station' },
    { label: 'Motocykle', icon: 'mdi-motorbike' },
    { label: 'Dostawcze', icon: 'mdi-truck-outline' },
    { label: 'Części', icon: 'mdi-car-cog' },
]
</script>

<template>
    <header class="carizo-nav">
        <div class="nav-inner">
            <NuxtLink to="/" class="logo">CARI<span>ZO</span></NuxtLink>

            <nav class="nav-links">
                <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
                <div
                    class="nav-dropdown"
                    @mouseenter="categoriesOpen = true"
                    @mouseleave="categoriesOpen = false"
                >
                    <button class="nav-dropdown-trigger">
                        Kategorie
                        <v-icon icon="mdi-chevron-down" size="16" :class="{ rotated: categoriesOpen }" />
                    </button>
                    <div v-show="categoriesOpen" class="nav-dropdown-menu">
                        <NuxtLink
                            v-for="c in categories"
                            :key="c.label"
                            :to="`/categories?type=${encodeURIComponent(c.label)}`"
                            class="dropdown-item"
                        >
                            <v-icon :icon="c.icon" size="16" />
                            {{ c.label }}
                        </NuxtLink>
                        <NuxtLink to="/categories" class="dropdown-item dropdown-all">
                            Wszystkie kategorie
                            <v-icon icon="mdi-arrow-right" size="14" />
                        </NuxtLink>
                    </div>
                </div>
                <NuxtLink to="/#about">O nas</NuxtLink>
                <NuxtLink to="/#contact">Kontakt</NuxtLink>
            </nav>

            <div class="nav-btns">
                <NuxtLink v-if="isLoggedIn" to="/favorites" class="nav-icon-btn" title="Ulubione">
                    <v-icon icon="mdi-heart-outline" size="20" />
                    <span class="nav-icon-label">Ulubione</span>
                </NuxtLink>
                <NuxtLink v-if="isLoggedIn" to="/messages" class="nav-icon-btn" title="Wiadomości">
                    <v-badge v-if="unreadCount > 0" :content="String(unreadCount)" color="primary" floating>
                        <v-icon icon="mdi-message-outline" size="20" />
                    </v-badge>
                    <v-icon v-else icon="mdi-message-outline" size="20" />
                    <span class="nav-icon-label">Wiadomości</span>
                </NuxtLink>
                <template v-if="!isLoggedIn">
                    <NuxtLink to="/login" class="btn-login">
                        <v-icon icon="mdi-account-outline" size="18" class="mr-1" />
                        Zaloguj się
                    </NuxtLink>
                </template>
                <template v-else>
                    <NuxtLink to="/dashboard" class="btn-login">
                        <v-icon icon="mdi-account-circle-outline" size="18" class="mr-1" />
                        Konto
                    </NuxtLink>
                    <button class="btn-login btn-logout" @click="logout">Wyloguj</button>
                </template>
                <NuxtLink to="/add-advert" class="btn-add">
                    <v-icon icon="mdi-plus" size="18" class="mr-1" />
                    Dodaj ogłoszenie
                </NuxtLink>
            </div>
        </div>
    </header>
</template>

<style lang="scss" scoped>
.carizo-nav {
    position: fixed;
    top: $ann-height;
    width: 100%;
    z-index: 998;
    background: rgba(4, 4, 4, 0.95);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;
    text-decoration: none;
    flex-shrink: 0;
    span { color: $red; }
}
.nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    > a {
        color: $text-link;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.2s;
        &:hover, &.router-link-active { color: $text; }
    }
    @include respond-to(sm) { display: none; }
}
.nav-dropdown { position: relative; }
.nav-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: $text-link;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    padding: 0;
    transition: color 0.2s;
    &:hover { color: $text; }
    .v-icon { transition: transform 0.2s; &.rotated { transform: rotate(180deg); } }
}
.nav-dropdown-menu {
    position: absolute;
    top: calc(100% + 18px);
    left: 50%;
    transform: translateX(-50%);
    background: #0e0e0e;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 8px;
    min-width: 210px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8);
}
.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    .v-icon { color: $text-dim; transition: color 0.15s; }
    &:hover { background: rgba($red, 0.08); color: $text; .v-icon { color: $red; } }
}
.dropdown-all {
    margin-top: 4px;
    border-top: 1px solid $border;
    padding-top: 12px;
    color: $red;
    justify-content: space-between;
    &:hover { color: $red; }
}
.nav-btns { display: flex; gap: 8px; align-items: center; }
.nav-icon-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    color: $text-muted;
    font-size: 13px;
    text-decoration: none;
    padding: 7px 12px;
    border-radius: $r-sm;
    transition: color 0.2s, background 0.2s;
    &:hover { color: $text; background: rgba(255,255,255,0.04); }
}
.nav-icon-label { @include respond-to(md) { display: none; } }
.btn-login {
    @include btn(transparent, $text-muted);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    font-size: 13px;
    padding: 9px 16px;
    background: transparent;
    &:hover { background: rgba(255,255,255,0.05); color: $text; border-color: rgba(255,255,255,0.18); }
}
.btn-logout { cursor: pointer; font-family: 'Inter', sans-serif; }
.btn-add {
    @include btn($red);
    font-size: 13px;
    display: flex;
    align-items: center;
    padding: 9px 18px;
    border-radius: $r-md;
}
</style>