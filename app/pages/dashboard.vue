<template>
    <div class="dash-page">

        <!-- Left sidebar -->
        <aside class="dash-sidebar">
            <nav class="dash-nav">
                <NuxtLink to="/dashboard" class="nav-item" :class="{ active: route.path === '/dashboard' }">
                    <v-icon icon="mdi-view-dashboard-outline" size="19" />
                    <span>Podsumowanie</span>
                </NuxtLink>
                <NuxtLink to="/my-adverts" class="nav-item">
                    <v-icon icon="mdi-card-text-outline" size="19" />
                    <span>Moje ogłoszenia</span>
                </NuxtLink>
                <NuxtLink to="/favorites" class="nav-item">
                    <v-icon icon="mdi-heart-outline" size="19" />
                    <span>Ulubione</span>
                </NuxtLink>
                <div class="nav-item">
                    <v-icon icon="mdi-magnify" size="19" />
                    <span>Wyszukiwania</span>
                </div>
                <div class="nav-item">
                    <v-icon icon="mdi-email-outline" size="19" />
                    <span>Wiadomości</span>
                    <span v-if="stats?.unreadMessages" class="nav-badge">{{ stats.unreadMessages }}</span>
                </div>
                <div class="nav-item">
                    <v-icon icon="mdi-bell-outline" size="19" />
                    <span>Powiadomienia</span>
                </div>
                <div class="nav-item">
                    <v-icon icon="mdi-star-outline" size="19" />
                    <span>Opinie i oceny</span>
                </div>
                <div class="nav-divider" />
                <div class="nav-item">
                    <v-icon icon="mdi-account-outline" size="19" />
                    <span>Dane osobowe</span>
                </div>
                <div class="nav-item">
                    <v-icon icon="mdi-cog-outline" size="19" />
                    <span>Ustawienia konta</span>
                </div>
                <div class="nav-divider" />
                <div class="nav-item nav-danger" @click="authLogout">
                    <v-icon icon="mdi-logout" size="19" />
                    <span>Wyloguj się</span>
                </div>
            </nav>

            <div class="dash-promo">
                <div class="promo-text">
                    <div class="promo-title">Zwiększ zasięg<br>swoich ogłoszeń</div>
                    <p class="promo-sub">Wyróżnij swoje ogłoszenia i sprzedawaj szybciej.</p>
                    <button class="promo-btn">Dowiedz się więcej</button>
                </div>
                <img
                    src="https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=400&auto=format&fit=crop"
                    alt=""
                    class="promo-img"
                />
            </div>
        </aside>

        <!-- Center -->
        <main class="dash-main">

            <!-- Profile banner -->
            <div class="profile-banner">
                <img
                    src="https://images.unsplash.com/photo-1617886322168-72b886573c35?q=80&w=1400&auto=format&fit=crop"
                    alt=""
                    class="banner-bg"
                />
                <div class="banner-overlay" />
                <div class="banner-content">
                    <div class="avatar-wrap">
                        <div class="avatar">{{ initials }}</div>
                        <div class="avatar-online" />
                    </div>
                    <div class="profile-info">
                        <div class="profile-name-row">
                            <h1 class="profile-name">{{ profile?.name }} {{ profile?.surname }}</h1>
                            <v-icon icon="mdi-check-decagram" size="18" class="verified-badge" />
                        </div>
                        <div class="profile-role">Dealer samochodów premium</div>
                        <div class="profile-since">Członek od {{ memberSince }}</div>
                    </div>
                </div>
                <div class="banner-tags">
                    <span class="btag btag-dealer">
                        <v-icon icon="mdi-shield-check" size="13" />
                        DEALER VERYFIKOWANY
                    </span>
                    <span v-if="profile?.email" class="btag">
                        <v-icon icon="mdi-email-outline" size="13" />
                        {{ profile.email }}
                    </span>
                    <span v-if="profile?.phoneNumber" class="btag">
                        <v-icon icon="mdi-phone-outline" size="13" />
                        {{ profile.phoneNumber }}
                    </span>
                </div>
                <button class="edit-profile-btn">
                    <v-icon icon="mdi-pencil-outline" size="15" />
                    Edytuj profil
                </button>
            </div>

            <!-- Stats row -->
            <div class="stats-row">
                <div class="stat-card">
                    <v-icon icon="mdi-car-outline" size="22" class="stat-icon" />
                    <div class="stat-num">{{ stats?.totalAdverts ?? 28 }}</div>
                    <div class="stat-label">Moje ogłoszenia</div>
                    <div class="stat-sub green">{{ stats?.activeAdverts ?? 18 }} aktywnych</div>
                </div>
                <div class="stat-card">
                    <v-icon icon="mdi-eye-outline" size="22" class="stat-icon" />
                    <div class="stat-num">{{ stats?.totalViews ? formatViews(stats.totalViews) : '128K' }}</div>
                    <div class="stat-label">Wyświetlenia ogłoszeń</div>
                    <div class="stat-sub">w ostatnich 30 dniach</div>
                </div>
                <div class="stat-card">
                    <v-icon icon="mdi-heart-outline" size="22" class="stat-icon" />
                    <div class="stat-num">{{ stats?.favoritesCount ?? 420 }}</div>
                    <div class="stat-label">Ulubione ogłoszenia</div>
                </div>
                <div class="stat-card">
                    <v-icon icon="mdi-star-outline" size="22" class="stat-icon" />
                    <div class="stat-num">4.9</div>
                    <div class="stat-label">Ocena sprzedawcy</div>
                    <div class="stat-stars">
                        <v-icon v-for="n in 5" :key="n" icon="mdi-star" size="12" />
                    </div>
                    <div class="stat-sub green">Świetna</div>
                </div>
                <div class="stat-card">
                    <v-icon icon="mdi-message-fast-outline" size="22" class="stat-icon" />
                    <div class="stat-num">98%</div>
                    <div class="stat-label">Szybkość odpowiedzi</div>
                    <div class="stat-sub green">Świetna</div>
                </div>
                <div class="stat-card">
                    <v-icon icon="mdi-clock-fast" size="22" class="stat-icon" />
                    <div class="stat-num">15 min</div>
                    <div class="stat-label">Średni czas odpowiedzi</div>
                    <div class="stat-sub green">Błyskawiczny</div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="tabs-bar">
                <button v-for="tab in tabs" :key="tab.key"
                    class="tab-btn"
                    :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key">
                    {{ tab.label }}
                </button>
            </div>

            <!-- Tab: Moje ogłoszenia -->
            <div v-if="activeTab === 'adverts'" class="tab-body">
                <div class="tab-toolbar">
                    <div class="tab-search">
                        <v-icon icon="mdi-magnify" size="18" class="ts-icon" />
                        <input v-model="advertSearch" class="ts-input" placeholder="Szukaj w moich ogłoszeniach..." />
                        <button class="ts-search-btn"><v-icon icon="mdi-magnify" size="16" /></button>
                    </div>
                    <button class="filter-btn">
                        <v-icon icon="mdi-tune" size="16" />
                        Filtry
                    </button>
                </div>

                <div class="adverts-grid">
                    <div v-for="(a, i) in myAdverts" :key="a.id" class="advert-card">
                        <div class="adcard-img-wrap">
                            <span class="adcard-badge" :class="badgeClass(i)">{{ badgeLabel(i) }}</span>
                            <img :src="a.images?.find(img => img.isMain)?.url ?? placeholder" :alt="a.title" />
                            <button class="adcard-fav">
                                <v-icon icon="mdi-heart-outline" size="16" />
                            </button>
                        </div>
                        <div class="adcard-body">
                            <NuxtLink :to="`/advert/${a.id}`" class="adcard-title">
                                {{ a.brand?.name }} {{ a.model?.name }}
                            </NuxtLink>
                            <div class="adcard-meta">
                                {{ a.year }}&nbsp;•&nbsp;{{ a.fuelType?.name ?? '—' }}&nbsp;•&nbsp;{{ Number(a.mileage).toLocaleString('pl') }} km
                            </div>
                            <div class="adcard-price">{{ Number(a.price).toLocaleString('pl') }} zł</div>
                            <div class="adcard-stats">
                                <span><v-icon icon="mdi-eye-outline" size="13" /> {{ (1000 + a.id * 137) % 9999 }}</span>
                                <span><v-icon icon="mdi-heart-outline" size="13" /> {{ (20 + a.id * 13) % 200 }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!myAdverts.length && !loading" class="empty-ads">
                    <v-icon icon="mdi-car-outline" size="36" class="empty-icon" />
                    <p>Nie masz jeszcze żadnych ogłoszeń.</p>
                    <NuxtLink to="/add-advert" class="add-ad-btn">+ Dodaj ogłoszenie</NuxtLink>
                </div>

                <button v-if="myAdverts.length" class="show-more-btn">
                    Pokaż więcej
                    <v-icon icon="mdi-chevron-down" size="18" />
                </button>
            </div>

            <!-- Tab: Opinie -->
            <div v-else-if="activeTab === 'reviews'" class="tab-body">
                <p class="tab-empty">Brak opinii.</p>
            </div>

            <!-- Tab: Obserwujący -->
            <div v-else-if="activeTab === 'followers'" class="tab-body">
                <p class="tab-empty">Brak obserwujących.</p>
            </div>

            <!-- Tab: Obserwowane -->
            <div v-else-if="activeTab === 'following'" class="tab-body">
                <p class="tab-empty">Nie obserwujesz nikogo.</p>
            </div>

        </main>

        <!-- Right sidebar -->
        <aside class="right-sidebar">

            <div class="rs-card">
                <div class="rs-title">O mnie</div>
                <p class="rs-about">{{ aboutText }}</p>
                <button class="rs-edit-link">
                    <v-icon icon="mdi-check" size="13" />
                    Edytuj opis
                </button>
            </div>

            <div class="rs-card">
                <div class="rs-title">Lokalizacja</div>
                <div class="rs-location">
                    <v-icon icon="mdi-map-marker-outline" size="15" class="loc-icon" />
                    Warszawa, mazowieckie
                </div>
                <div class="rs-map">
                    <v-icon icon="mdi-map-marker" size="28" class="map-pin" />
                </div>
                <button class="rs-outline-btn">Zobacz na mapie</button>
            </div>

            <div class="rs-card">
                <div class="rs-title">Weryfikacje</div>
                <div class="rs-verif-list">
                    <div class="verif-row">
                        <div class="verif-left">
                            <v-icon icon="mdi-phone-outline" size="15" class="verif-icon" />
                            Numer telefonu
                        </div>
                        <span class="verif-ok">Zweryfikowany</span>
                    </div>
                    <div class="verif-row">
                        <div class="verif-left">
                            <v-icon icon="mdi-email-outline" size="15" class="verif-icon" />
                            Adres e-mail
                        </div>
                        <span class="verif-ok">Zweryfikowany</span>
                    </div>
                    <div class="verif-row">
                        <div class="verif-left">
                            <v-icon icon="mdi-shield-check-outline" size="15" class="verif-icon" />
                            Dealer
                        </div>
                        <span class="verif-ok">Zweryfikowany</span>
                    </div>
                </div>
            </div>

        </aside>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, UserProfile, UserStats } from '~/types'

definePageMeta({ middleware: 'auth' })

const { fetchProfile, fetchStats } = useUser()
const { logout: authLogout } = useAuth()
const route = useRoute()

const profile = ref<UserProfile | null>(null)
const stats = ref<UserStats | null>(null)
const myAdverts = ref<CarAdvert[]>([])
const loading = ref(true)
const activeTab = ref('adverts')
const advertSearch = ref('')

const placeholder = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'

const aboutText = 'Specjalizuję się w samochodach klasy premium. Każde auto przechodzi dokładną weryfikację techniczną. Gwarantuję profesjonalną obsługę i pełne wsparcie na każdym etapie zakupu.'

const tabs = [
    { key: 'adverts', label: 'Moje ogłoszenia' },
    { key: 'reviews', label: 'Opinie (128)' },
    { key: 'followers', label: 'Obserwujący (342)' },
    { key: 'following', label: 'Obserwowane (86)' },
]

const initials = computed(() => {
    if (!profile.value) return '??'
    return (profile.value.name?.[0] ?? '') + (profile.value.surname?.[0] ?? '')
})

const memberSince = computed(() => {
    if (!profile.value?.createdAt) return 'stycznia 2023'
    return new Date(profile.value.createdAt).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
})

function formatViews(n: number) {
    if (n >= 1000) return Math.round(n / 1000) + 'K'
    return n.toString()
}

function badgeLabel(i: number) {
    const labels = ['AKTYWNE', 'AKTYWNE', 'WYRÓŻNIONE', 'WYGASŁO']
    return labels[i % labels.length]
}

function badgeClass(i: number) {
    const classes = ['badge-active', 'badge-active', 'badge-featured', 'badge-expired']
    return classes[i % classes.length]
}

onMounted(async () => {
    try {
        ;[profile.value, stats.value] = await Promise.all([fetchProfile(), fetchStats()])
        const r = await $fetch<{ items: CarAdvert[] }>('/api/proxy/api/Advert/user?page=1&pageSize=4')
        myAdverts.value = r.items
    } catch {}
    finally { loading.value = false }
})
</script>

<style lang="scss" scoped>
.dash-page {
    display: flex;
    min-height: 100vh;
    background: $bg;
    padding-top: $nav-height;
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
.dash-sidebar {
    width: 220px;
    min-width: 220px;
    background: #070707;
    border-right: 1px solid $border;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: $nav-height;
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;

    @include respond-to(md) { display: none; }
}

.dash-nav { flex: 1; padding: 16px 0; }

.nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 18px;
    color: $text-muted;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
    position: relative;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }
    &.active {
        background: rgba($red, 0.1);
        color: $text;
        border-left: 2px solid $red;
        padding-left: 16px;
    }
}

.nav-danger:hover { color: #e55; }

.nav-badge {
    margin-left: auto;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 20px;
    min-width: 18px;
    text-align: center;
}

.nav-divider { height: 1px; background: $border; margin: 8px 0; }

.dash-promo {
    margin: 12px;
    background: linear-gradient(135deg, #110005, #0a0002);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    overflow: hidden;
    padding: 16px 14px 14px;
    position: relative;
}

.promo-img {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 120px;
    height: 80px;
    object-fit: cover;
    opacity: 0.3;
}

.promo-text { position: relative; z-index: 2; }

.promo-title {
    font-size: 13px;
    font-weight: 800;
    color: $text;
    line-height: 1.4;
    margin-bottom: 6px;
}

.promo-sub {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.5;
    margin-bottom: 12px;
}

.promo-btn {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 11px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 8px 14px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// ── Center main ───────────────────────────────────────────────────────────────
.dash-main {
    flex: 1;
    min-width: 0;
    padding-bottom: 60px;
}

// Profile banner
.profile-banner {
    position: relative;
    height: 210px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0 28px 16px;
}

.banner-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
    opacity: 0.55;
}

.banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.7) 60%, rgba(5,5,5,0.96) 100%);
}

.banner-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    gap: 18px;
    margin-bottom: 14px;
}

.avatar-wrap {
    position: relative;
    flex-shrink: 0;
}

.avatar {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: linear-gradient(135deg, $red, #3a0008);
    border: 3px solid rgba($red, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 900;
    color: white;
}

.avatar-online {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #4caf50;
    border: 2px solid $bg;
}

.profile-info { flex: 1; padding-bottom: 4px; }

.profile-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-name {
    font-size: 24px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
}

.verified-badge { color: $red; }

.profile-role { font-size: 13px; color: $text-muted; margin-top: 3px; }
.profile-since { font-size: 12px; color: $text-dim; margin-top: 2px; }

.banner-tags {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.btag {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: $text-muted;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 4px 10px;
}

.btag-dealer {
    background: rgba(45,122,58,0.15);
    border-color: rgba(45,122,58,0.3);
    color: #4caf50;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.3px;
}

.edit-profile-btn {
    position: absolute;
    top: 16px;
    right: 20px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 14px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: rgba(255,255,255,0.3); color: $text; }
}

// Stats row
.stats-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    border-bottom: 1px solid $border;

    @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
    padding: 18px 16px;
    border-right: 1px solid $border;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    &:last-child { border-right: none; }
}

.stat-icon { color: $red; margin-bottom: 6px; }

.stat-num {
    font-size: 26px;
    font-weight: 900;
    color: $text;
    line-height: 1;
}

.stat-label {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.4;
    margin-top: 2px;
}

.stat-sub {
    font-size: 11px;
    color: $text-dark;
    margin-top: 3px;
    font-weight: 500;
    &.green { color: #4caf50; }
}

.stat-stars {
    display: flex;
    gap: 1px;
    margin-top: 3px;
    color: #f5a623;
}

// Tabs
.tabs-bar {
    display: flex;
    border-bottom: 1px solid $border;
    padding: 0 24px;
    overflow-x: auto;
}

.tab-btn {
    flex-shrink: 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-dim;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 14px 16px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: -1px;

    &:hover { color: $text-muted; }
    &.active { color: $text; border-bottom-color: $red; font-weight: 600; }
}

// Tab content
.tab-body { padding: 20px 24px; }

// Toolbar
.tab-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
}

.tab-search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 9px 12px;
    transition: border-color 0.2s;
    &:focus-within { border-color: rgba($red, 0.4); }
}

.ts-icon { color: $text-dim; flex-shrink: 0; }

.ts-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    &::placeholder { color: $text-dark; }
}

.ts-search-btn {
    background: transparent;
    border: none;
    color: $text-dim;
    cursor: pointer;
    display: flex;
    align-items: center;
    &:hover { color: $text; }
}

.filter-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 9px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

// Adverts grid
.adverts-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.advert-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
    transition: border-color 0.25s, transform 0.25s;
    &:hover { border-color: rgba($red, 0.3); transform: translateY(-3px); }
}

.adcard-img-wrap {
    position: relative;
    img { width: 100%; height: 140px; object-fit: cover; display: block; }
}

.adcard-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 5px;
    letter-spacing: 0.4px;
}

.badge-active { background: #2d7a3a; color: white; }
.badge-featured { background: #8B6914; color: #f5d060; border: 1px solid #a07820; }
.badge-expired { background: rgba(255,255,255,0.1); color: $text-dim; }

.adcard-fav {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
    border: none;
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: $red; }
}

.adcard-body { padding: 12px; }

.adcard-title {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    &:hover { color: $red; }
}

.adcard-meta { font-size: 11px; color: $text-dim; margin-bottom: 6px; }

.adcard-price { font-size: 17px; font-weight: 900; color: $red; margin-bottom: 8px; }

.adcard-stats {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: $text-dark;

    span {
        display: flex;
        align-items: center;
        gap: 3px;
    }
}

.empty-ads {
    text-align: center;
    padding: 50px 20px;
    color: $text-dim;
    font-size: 14px;
}

.empty-icon { color: $border; display: block; margin: 0 auto 12px; }

.add-ad-btn {
    display: inline-block;
    margin-top: 12px;
    background: $red;
    color: white;
    border-radius: $r-sm;
    padding: 10px 22px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.show-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-md;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.tab-empty { color: $text-dim; font-size: 14px; padding: 40px 0; text-align: center; }

// ── Right sidebar ─────────────────────────────────────────────────────────────
.right-sidebar {
    width: 250px;
    min-width: 250px;
    border-left: 1px solid $border;
    background: #070707;
    display: flex;
    flex-direction: column;
    gap: 0;
    position: sticky;
    top: $nav-height;
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;

    @include respond-to(md) { display: none; }
}

.rs-card {
    padding: 20px;
    border-bottom: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.rs-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
}

.rs-about {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.7;
}

.rs-edit-link {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    &:hover { opacity: 0.8; }
}

.rs-location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $text-muted;
}

.loc-icon { color: $red; }

.rs-map {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.map-pin { color: $red; }

.rs-outline-btn {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 9px;
    cursor: pointer;
    width: 100%;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.rs-verif-list { display: flex; flex-direction: column; gap: 12px; }

.verif-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}

.verif-left {
    display: flex;
    align-items: center;
    gap: 7px;
    color: $text-muted;
}

.verif-icon { color: $text-dim; }

.verif-ok {
    color: #4caf50;
    font-size: 11px;
    font-weight: 600;
}
</style>
