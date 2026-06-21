<script setup lang="ts">
import type { UserProfile } from '~/types'

const authStatus = useCookie('auth_status')
const isLoggedIn = computed(() => !!authStatus.value)
const { logout } = useAuth()
const { unreadCount, fetchUnreadCount } = useMessages()
const { fetchUnreadCount: fetchNotifCount, startPolling, stopPolling } = useNotifications()
const { isPremiereActive, isPremiereUpcoming } = usePromotion()
const annBarDismissed = ref(true)

const showAnnBar = computed(() =>
    !annBarDismissed.value && (isPremiereActive.value || isPremiereUpcoming.value)
)

const isAdmin = ref(false)
onMounted(async () => {
    annBarDismissed.value = localStorage.getItem('annBarDismissed') === '1'
    fetchUnreadCount()
    if (isLoggedIn.value) {
        fetchNotifCount()
        startPolling(30_000)
        try {
            const me = await $fetch<UserProfile>('/api/proxy/api/User/me')
            isAdmin.value = !!me.isAdmin
        } catch {}
    }
})

onUnmounted(() => stopPolling())

const categoriesOpen = ref(false)
const mobileOpen = ref(false)
const mobileCatsOpen = ref(false)

function toggleCategories() {
    categoriesOpen.value = !categoriesOpen.value
}

function closeCategories() {
    categoriesOpen.value = false
}

const categories = [
    { id: 1, label: 'Auta osobowe', icon: 'mdi-car-outline' },
    { id: 6, label: 'Motocykle', icon: 'mdi-motorbike' },
    { id: 2, label: 'Dostawcze', icon: 'mdi-truck-outline' },
    { id: 3, label: 'Ciężarowe', icon: 'mdi-truck' },
    { id: 5, label: 'Części', icon: 'mdi-car-cog' },
    { id: 4, label: 'Maszyny', icon: 'mdi-excavator' },
]

function closeMobile() {
    mobileOpen.value = false
    mobileCatsOpen.value = false
}

function handleLogout() {
    closeMobile()
    logout()
}

const route = useRoute()
watch(() => route.path, () => { closeMobile(); closeCategories() })

let _clickOutsideHandler: ((e: MouseEvent) => void) | null = null
onMounted(() => {
    _clickOutsideHandler = (e: MouseEvent) => {
        const dropdown = document.querySelector('.nav-dropdown')
        if (dropdown && !dropdown.contains(e.target as Node)) {
            closeCategories()
        }
    }
    document.addEventListener('click', _clickOutsideHandler)
})
onUnmounted(() => {
    if (_clickOutsideHandler) {
        document.removeEventListener('click', _clickOutsideHandler)
        _clickOutsideHandler = null
    }
})
</script>

<template>
    <header class="carizo-nav" :style="{ top: showAnnBar ? '38px' : '0' }">
        <div class="nav-inner">
            <NuxtLink to="/" class="logo" @click="closeMobile">
                <img src="/carizo-logo.svg" alt="CARIZO" class="logo-img" />
            </NuxtLink>

            <nav class="nav-links">
                <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
                <div class="nav-dropdown">
                    <button class="nav-dropdown-trigger" @click="toggleCategories">
                        Kategorie
                        <v-icon icon="mdi-chevron-down" size="16" :class="{ rotated: categoriesOpen }" />
                    </button>
                    <div v-show="categoriesOpen" class="nav-dropdown-menu">
                        <NuxtLink v-for="c in categories" :key="c.id"
                            :to="`/adverts?categoryId=${c.id}`" class="dropdown-item"
                            @click="closeCategories">
                            <v-icon :icon="c.icon" size="16" />
                            {{ c.label }}
                        </NuxtLink>
                        <NuxtLink to="/adverts" class="dropdown-item dropdown-all" @click="closeCategories">
                            Wszystkie kategorie
                            <v-icon icon="mdi-arrow-right" size="14" />
                        </NuxtLink>
                    </div>
                </div>
                <NuxtLink to="/wydarzenia">Wydarzenia</NuxtLink>
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
                    <NuxtLink to="/login" class="btn-login desktop-only">
                        <v-icon icon="mdi-account-outline" size="18" class="mr-1" />
                        Zaloguj się
                    </NuxtLink>
                </template>
                <template v-else>
                    <NuxtLink v-if="isAdmin" to="/admin" class="btn-login desktop-only nav-admin-btn">
                        <v-icon icon="mdi-shield-crown" size="18" class="mr-1" />
                        Admin
                    </NuxtLink>
                    <NuxtLink to="/dashboard" class="btn-login desktop-only">
                        <v-icon icon="mdi-account-circle-outline" size="18" class="mr-1" />
                        Konto
                    </NuxtLink>
                    <button class="btn-login btn-logout desktop-only" @click="logout">Wyloguj</button>
                </template>
                <NuxtLink to="/add-advert" class="btn-add desktop-only">
                    <v-icon icon="mdi-plus" size="18" class="mr-1" />
                    Dodaj ogłoszenie
                </NuxtLink>

                <button class="hamburger" :class="{ open: mobileOpen }"
                    :aria-label="mobileOpen ? 'Zamknij menu' : 'Otwórz menu'" :aria-expanded="mobileOpen"
                    @click="mobileOpen = !mobileOpen">
                    <span /><span /><span />
                </button>
            </div>
        </div>
    </header>

    <Teleport to="body">
        <transition name="fade">
            <div v-if="mobileOpen" class="mobile-overlay" @click="closeMobile" />
        </transition>
        <transition name="slide">
            <div v-if="mobileOpen" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu nawigacyjne">
                <div class="drawer-header">
                    <img src="/carizo-logo.svg" alt="CARIZO" class="drawer-logo" />
                    <button class="drawer-close" aria-label="Zamknij menu" @click="closeMobile">
                        <v-icon icon="mdi-close" size="22" />
                    </button>
                </div>

                <nav class="drawer-nav">
                    <NuxtLink to="/adverts" class="drawer-link" @click="closeMobile">
                        <v-icon icon="mdi-car-multiple" size="18" />
                        Ogłoszenia
                    </NuxtLink>

                    <button class="drawer-link drawer-expandable" @click="mobileCatsOpen = !mobileCatsOpen">
                        <v-icon icon="mdi-shape-outline" size="18" />
                        Kategorie
                        <v-icon :icon="mobileCatsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" class="ml-auto" />
                    </button>
                    <transition name="expand">
                        <div v-if="mobileCatsOpen" class="drawer-subcats">
                            <NuxtLink v-for="c in categories" :key="c.id"
                                :to="`/adverts?categoryId=${c.id}`" class="drawer-sublink"
                                @click="closeMobile">
                                <v-icon :icon="c.icon" size="15" />
                                {{ c.label }}
                            </NuxtLink>
                            <NuxtLink to="/adverts" class="drawer-sublink drawer-sublink--all" @click="closeMobile">
                                Wszystkie kategorie
                                <v-icon icon="mdi-arrow-right" size="14" class="ml-auto" />
                            </NuxtLink>
                        </div>
                    </transition>

                    <NuxtLink to="/wydarzenia" class="drawer-link" @click="closeMobile">
                        <v-icon icon="mdi-calendar-star" size="18" />
                        Wydarzenia
                    </NuxtLink>
                    <NuxtLink to="/#about" class="drawer-link" @click="closeMobile">
                        <v-icon icon="mdi-information-outline" size="18" />
                        O nas
                    </NuxtLink>
                    <NuxtLink to="/#contact" class="drawer-link" @click="closeMobile">
                        <v-icon icon="mdi-email-outline" size="18" />
                        Kontakt
                    </NuxtLink>

                    <template v-if="isLoggedIn">
                        <div class="drawer-divider" />
                        <NuxtLink v-if="isAdmin" to="/admin" class="drawer-link drawer-link--admin" @click="closeMobile">
                            <v-icon icon="mdi-shield-crown" size="18" />
                            Panel Administratora
                        </NuxtLink>
                        <NuxtLink to="/favorites" class="drawer-link" @click="closeMobile">
                            <v-icon icon="mdi-heart-outline" size="18" />
                            Ulubione
                        </NuxtLink>
                        <NuxtLink to="/messages" class="drawer-link" @click="closeMobile">
                            <v-icon icon="mdi-message-outline" size="18" />
                            Wiadomości
                            <span v-if="unreadCount > 0" class="drawer-badge">{{ unreadCount }}</span>
                        </NuxtLink>
                        <NuxtLink to="/dashboard" class="drawer-link" @click="closeMobile">
                            <v-icon icon="mdi-account-circle-outline" size="18" />
                            Konto
                        </NuxtLink>
                        <NuxtLink to="/faktury" class="drawer-link" @click="closeMobile">
                            <v-icon icon="mdi-receipt-outline" size="18" />
                            Faktury i płatności
                        </NuxtLink>
                    </template>
                </nav>

                <div class="drawer-footer">
                    <NuxtLink to="/add-advert" class="drawer-btn-add" @click="closeMobile">
                        <v-icon icon="mdi-plus" size="18" />
                        Dodaj ogłoszenie
                    </NuxtLink>
                    <template v-if="!isLoggedIn">
                        <NuxtLink to="/login" class="drawer-btn-secondary" @click="closeMobile">Zaloguj się</NuxtLink>
                        <NuxtLink to="/register" class="drawer-btn-secondary" @click="closeMobile">Zarejestruj się</NuxtLink>
                    </template>
                    <button v-else class="drawer-btn-secondary drawer-btn-logout" @click="handleLogout">Wyloguj się</button>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style lang="scss" scoped>
.carizo-nav {
    position: fixed;
    top: 0;
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
    text-decoration: none;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.logo-img {
    height: 36px;
    width: auto;
    display: block;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 28px;

    >a {
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
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
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
    &:hover { color: $text; background: rgba(255, 255, 255, 0.04); }
    @include respond-to(sm) { display: none; }
}

.nav-icon-label { @include respond-to(md) { display: none; } }

.desktop-only { @include respond-to(sm) { display: none !important; } }

.btn-login {
    @include btn(transparent, $text-muted);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    font-size: 13px;
    padding: 9px 16px;
    background: transparent;
    &:hover { background: rgba(255, 255, 255, 0.05); color: $text; border-color: rgba(255, 255, 255, 0.18); }
}

.btn-logout { cursor: pointer; font-family: 'Inter', sans-serif; }

.nav-admin-btn {
    border-color: rgba($red, 0.3);
    color: $red;
    &:hover { background: rgba($red, 0.08); border-color: rgba($red, 0.5); color: $red; }
}

.btn-add {
    @include btn($red);
    font-size: 13px;
    display: flex;
    align-items: center;
    padding: 9px 18px;
    border-radius: $r-md;
}

.hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $r-sm;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;

    span {
        display: block;
        width: 20px;
        height: 2px;
        background: $text-muted;
        border-radius: 2px;
        transition: transform 0.25s ease, opacity 0.25s ease, width 0.25s ease;
        transform-origin: center;
    }

    &:hover span { background: $text; }

    &.open {
        span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        span:nth-child(2) { opacity: 0; width: 0; }
        span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }

    @include respond-to(sm) { display: flex; }
}

.mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
    backdrop-filter: blur(2px);
}

.mobile-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(320px, 88vw);
    background: #080808;
    border-left: 1px solid $border;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 16px;
    border-bottom: 1px solid $border;
    flex-shrink: 0;
}

.drawer-logo {
    height: 32px;
    width: auto;
    display: block;
}

.drawer-close {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid $border;
    border-radius: $r-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $text-muted;
    transition: color 0.2s, background 0.2s;
    &:hover { color: $text; background: rgba(255, 255, 255, 0.08); }
}

.drawer-nav {
    flex: 1;
    padding: 12px 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.drawer-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    width: 100%;
    text-align: left;
    .v-icon { color: $text-dim; flex-shrink: 0; }
    &:hover, &.router-link-active {
        background: rgba(255, 255, 255, 0.04);
        color: $text;
        .v-icon { color: $red; }
    }
}

.drawer-expandable { user-select: none; }

.drawer-subcats {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 4px 0 4px 42px;
}

.drawer-sublink {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: $r-sm;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    &:hover { background: rgba($red, 0.08); color: $text; }
    &--all { margin-top: 4px; color: $red; border-top: 1px solid $border; padding-top: 12px; justify-content: space-between; }
}

.drawer-badge {
    margin-left: auto;
    background: $red;
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    padding: 0 4px;
}

.drawer-divider { height: 1px; background: $border; margin: 8px 0; }

.drawer-footer {
    padding: 16px 12px 28px;
    border-top: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
}

.drawer-btn-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: $red;
    color: white;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.drawer-btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 13px;
    background: transparent;
    color: $text-muted;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    &:hover { background: rgba(255, 255, 255, 0.05); color: $text; border-color: rgba(255, 255, 255, 0.18); }
}

.drawer-btn-logout { color: rgba($red, 0.9); border-color: rgba($red, 0.25); }

.drawer-link--admin {
    color: $red;
    .v-icon { color: $red; }
    &:hover { background: rgba($red, 0.08); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.expand-enter-active, .expand-leave-active { transition: opacity 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; }
</style>