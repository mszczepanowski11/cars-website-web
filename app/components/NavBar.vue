<script setup lang="ts">
const authStatus = useCookie('auth_status')
const isLoggedIn = computed(() => !!authStatus.value)
const { logout } = useAuth()
const { unreadCount, fetchUnreadCount } = useMessages()
onMounted(() => fetchUnreadCount())

const categoriesOpen = ref(false)
const mobileOpen = ref(false)
const mobileCatsOpen = ref(false)

const categories = [
    { label: 'Osobowe', icon: 'mdi-car-outline' },
    { label: 'SUV / Crossover', icon: 'mdi-car-estate' },
    { label: 'Elektryczne', icon: 'mdi-ev-station' },
    { label: 'Motocykle', icon: 'mdi-motorbike' },
    { label: 'Dostawcze', icon: 'mdi-truck-outline' },
    { label: 'Części', icon: 'mdi-car-cog' },
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
watch(() => route.path, closeMobile)
</script>

<template>
    <header class="carizo-nav">
        <div class="nav-inner">
            <NuxtLink to="/" class="logo" @click="closeMobile">CARI<span>ZO</span></NuxtLink>

            <!-- Desktop nav -->
            <nav class="nav-links">
                <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
                <div class="nav-dropdown" @mouseenter="categoriesOpen = true" @mouseleave="categoriesOpen = false">
                    <button class="nav-dropdown-trigger">
                        Kategorie
                        <v-icon icon="mdi-chevron-down" size="16" :class="{ rotated: categoriesOpen }" />
                    </button>
                    <div v-show="categoriesOpen" class="nav-dropdown-menu">
                        <NuxtLink v-for="c in categories" :key="c.label"
                            :to="`/categories?type=${encodeURIComponent(c.label)}`" class="dropdown-item">
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

            <!-- Desktop + mobile buttons -->
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

                <!-- Hamburger -->
                <button class="hamburger" :class="{ open: mobileOpen }"
                    :aria-label="mobileOpen ? 'Zamknij menu' : 'Otwórz menu'" :aria-expanded="mobileOpen"
                    @click="mobileOpen = !mobileOpen">
                    <span /><span /><span />
                </button>
            </div>
        </div>
    </header>

    <!-- Mobile drawer -->
    <Teleport to="body">
        <transition name="fade">
            <div v-if="mobileOpen" class="mobile-overlay" @click="closeMobile" />
        </transition>
        <transition name="slide">
            <div v-if="mobileOpen" class="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu nawigacyjne">
                <div class="drawer-header">
                    <span class="drawer-logo">CARI<span>ZO</span></span>
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
                        <v-icon :icon="mobileCatsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16"
                            class="ml-auto" />
                    </button>
                    <transition name="expand">
                        <div v-if="mobileCatsOpen" class="drawer-subcats">
                            <NuxtLink v-for="c in categories" :key="c.label"
                                :to="`/categories?type=${encodeURIComponent(c.label)}`" class="drawer-sublink"
                                @click="closeMobile">
                                <v-icon :icon="c.icon" size="15" />
                                {{ c.label }}
                            </NuxtLink>
                            <NuxtLink to="/categories" class="drawer-sublink drawer-sublink--all" @click="closeMobile">
                                Wszystkie kategorie
                                <v-icon icon="mdi-arrow-right" size="14" class="ml-auto" />
                            </NuxtLink>
                        </div>
                    </transition>

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
                    </template>
                </nav>

                <div class="drawer-footer">
                    <NuxtLink to="/add-advert" class="drawer-btn-add" @click="closeMobile">
                        <v-icon icon="mdi-plus" size="18" />
                        Dodaj ogłoszenie
                    </NuxtLink>
                    <template v-if="!isLoggedIn">
                        <NuxtLink to="/login" class="drawer-btn-secondary" @click="closeMobile">Zaloguj się</NuxtLink>
                        <NuxtLink to="/register" class="drawer-btn-secondary" @click="closeMobile">Zarejestruj się
                        </NuxtLink>
                    </template>
                    <button v-else class="drawer-btn-secondary drawer-btn-logout" @click="handleLogout">Wyloguj
                        się</button>
                </div>
            </div>
        </transition>
    </Teleport>
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

    span {
        color: $red;
    }
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

        &:hover,
        &.router-link-active {
            color: $text;
        }
    }

    @include respond-to(sm) {
        display: none;
    }
}

.nav-dropdown {
    position: relative;
}

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

    &:hover {
        color: $text;
    }

    .v-icon {
        transition: transform 0.2s;

        &.rotated {
            transform: rotate(180deg);
        }
    }
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

    .v-icon {
        color: $text-dim;
        transition: color 0.15s;
    }

    &:hover {
        background: rgba($red, 0.08);
        color: $text;

        .v-icon {
            color: $red;
        }
    }
}

.dropdown-all {
    margin-top: 4px;
    border-top: 1px solid $border;
    padding-top: 12px;
    color: $red;
    justify-content: space-between;

    &:hover {
        color: $red;
    }
}

.nav-btns {
    display: flex;
    gap: 8px;
    align-items: center;
}

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

    &:hover {
        color: $text;
        background: rgba(255, 255, 255, 0.04);
    }

    @include respond-to(sm) {
        display: none;
    }
}

.nav-icon-label {
    @include respond-to(md) {
        display: none;
    }
}

.desktop-only {
    @include respond-to(sm) {
        display: none !important;
    }
}

.btn-login {
    @include btn(transparent, $text-muted);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    font-size: 13px;
    padding: 9px 16px;
    background: transparent;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: $text;
        border-color: rgba(255, 255, 255, 0.18);
    }
}

.btn-logout {
    cursor: pointer;
    font-family: 'Inter', sans-serif;
}

.btn-add {
    @include btn($red);
    font-size: 13px;
    display: flex;
    align-items: center;
    padding: 9px 18px;
    border-radius: $r-md;
}

// ── Hamburger ──────────────────────────────────────────────
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

    &:hover span {
        background: $text;
    }

    &.open {
        span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
        }

        span:nth-child(2) {
            opacity: 0;
            width: 0;
        }

        span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
        }
    }

    @include respond-to(sm) {
        display: flex;
    }
}

// ── Mobile overlay ─────────────────────────────────────────
.mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
    backdrop-filter: blur(2px);
}

// ── Mobile drawer ──────────────────────────────────────────
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
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;

    span {
        color: $red;
    }
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

    &:hover {
        color: $text;
        background: rgba(255, 255, 255, 0.08);
    }
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

    .v-icon {
        color: $text-dim;
        flex-shrink: 0;
    }

    &:hover,
    &.router-link-active {
        background: rgba(255, 255, 255, 0.04);
        color: $text;

        .v-icon {
            color: $red;
        }
    }
}

.drawer-expandable {
    user-select: none;
}

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

    &:hover {
        background: rgba($red, 0.08);
        color: $text;
    }

    &--all {
        margin-top: 4px;
        color: $red;
        border-top: 1px solid $border;
        padding-top: 12px;
        justify-content: space-between;
    }
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

.drawer-divider {
    height: 1px;
    background: $border;
    margin: 8px 0;
}

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

    &:hover {
        opacity: 0.88;
    }
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

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: $text;
        border-color: rgba(255, 255, 255, 0.18);
    }
}

.drawer-btn-logout {
    color: rgba($red, 0.9);
    border-color: rgba($red, 0.25);
}

// ── Transitions ────────────────────────────────────────────
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}

.expand-enter-active,
.expand-leave-active {
    transition: opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
}
</style>