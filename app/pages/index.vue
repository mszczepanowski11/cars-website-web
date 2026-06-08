<template>
    <div class="home">

        <!-- Hero -->
        <section class="hero">
            <div class="hero-car-bg">
                <img src="/car-placeholder.svg" alt="" />
            </div>
            <div class="container hero-inner">
                <div class="hero-content">
                    <div class="hero-eyebrow">Nowa era motoryzacji</div>
                    <h1 class="hero-title">
                        Motoryzacja.<br>
                        <span>W lepszym</span> wydaniu.
                    </h1>
                    <p class="hero-sub">
                        CARIZO to więcej niż portal ogłoszeniowy.<br>
                        To miejsce, gdzie technologia spotyka pasję do motoryzacji.
                    </p>
                    <div class="hero-badges">
                        <div class="hero-badge">
                            <v-icon icon="mdi-shield-check-outline" size="20" />
                            <span>Zweryfikowane ogłoszenia</span>
                        </div>
                        <div class="hero-badge">
                            <v-icon icon="mdi-account-group-outline" size="20" />
                            <span>Zaufani sprzedawcy</span>
                        </div>
                        <div class="hero-badge">
                            <v-icon icon="mdi-chart-line" size="20" />
                            <span>Inteligentne narzędzia</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Search -->
        <div class="search-wrap">
            <div class="container">
                <div class="search-box">
                    <v-icon icon="mdi-magnify" class="search-icon" size="22" />
                    <input v-model="searchText" class="search-input" placeholder="Marka, model, rocznik..." />
                    <button class="btn-filters">
                        <v-icon icon="mdi-tune" size="18" />
                        Więcej filtrów
                    </button>
                    <button class="btn-search" @click="doSearch">Szukaj</button>
                </div>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-bar">
            <div class="container stats-inner">
                <div class="stat-item">
                    <v-icon icon="mdi-car-outline" size="28" class="stat-icon" />
                    <div class="stat-num">{{ formatStat(homeStats.activeAdverts) }}</div>
                    <div class="stat-label">Aktywnych ogłoszeń</div>
                </div>
                <div class="stat-item">
                    <v-icon icon="mdi-account-group-outline" size="28" class="stat-icon" />
                    <div class="stat-num">{{ formatStat(homeStats.totalUsers) }}</div>
                    <div class="stat-label">Użytkowników</div>
                </div>
                <div class="stat-item">
                    <v-icon icon="mdi-check-circle-outline" size="28" class="stat-icon" />
                    <div class="stat-num">{{ formatStat(homeStats.soldVehicles) }}</div>
                    <div class="stat-label">Sprzedanych aut</div>
                </div>
                <div class="stat-item">
                    <v-icon icon="mdi-domain" size="28" class="stat-icon" />
                    <div class="stat-num">{{ formatStat(homeStats.companies) }}</div>
                    <div class="stat-label">Dealerów</div>
                </div>
                <div class="stat-item">
                    <v-icon icon="mdi-calendar-star-outline" size="28" class="stat-icon" />
                    <div class="stat-num">{{ formatStat(homeStats.events) }}</div>
                    <div class="stat-label">Wydarzeń</div>
                </div>
            </div>
        </div>

        <!-- Featured listings -->
        <section class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Polecane ogłoszenia</h2>
                    <NuxtLink to="/adverts" class="see-all">
                        Zobacz wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in featured" :key="a.id" :advert="a" />
                </div>
            </div>
        </section>

        <!-- Events -->
        <section v-if="events.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Nadchodzące wydarzenia</h2>
                    <NuxtLink to="/wydarzenia" class="see-all">
                        Zobacz wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="events-grid">
                    <div v-for="ev in events" :key="ev.id" class="event-card">
                        <div class="event-img-wrap">
                            <img
                                :src="getEventImageUrl(ev)"
                                :alt="ev.name"
                            />
                            <span class="event-badge">WYDARZENIE</span>
                            <div class="event-date-chip">
                                <v-icon icon="mdi-calendar" size="13" />
                                {{ formatEventDate(ev.startDate) }}
                            </div>
                        </div>
                        <div class="event-body">
                            <div class="event-name">{{ ev.name }}</div>
                            <div class="event-loc">
                                <v-icon icon="mdi-map-marker-outline" size="14" class="event-loc-icon" />
                                {{ ev.city }}
                            </div>
                            <div class="event-desc">{{ ev.description?.slice(0, 90) }}{{ ev.description?.length > 90 ? '...' : '' }}</div>
                            <a v-if="ev.ticketsUrl" :href="ev.ticketsUrl" target="_blank" rel="noopener" class="event-link-btn">
                                Kup bilety
                                <v-icon icon="mdi-arrow-right" size="14" />
                            </a>
                            <a v-else-if="ev.websiteUrl" :href="ev.websiteUrl" target="_blank" rel="noopener" class="event-link-btn">
                                Dowiedz się więcej
                                <v-icon icon="mdi-arrow-right" size="14" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why CARIZO -->
        <section class="section">
            <div class="container">
                <h2 class="section-title">Dlaczego CARI<span>ZO</span>?</h2>
                <div class="feat-grid">
                    <div v-for="f in feats" :key="f.title" class="feat-card">
                        <div class="feat-icon">
                            <v-icon :icon="f.icon" size="28" />
                        </div>
                        <h3>{{ f.title }}</h3>
                        <p>{{ f.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Newsletter -->
        <section class="section">
            <div class="container">
                <div class="newsletter">
                    <div class="news-icon">
                        <v-icon icon="mdi-email-outline" size="36" />
                    </div>
                    <div class="news-text">
                        <h2>Bądź na bieżąco</h2>
                        <p>Zapisz się do newslettera i otrzymuj najlepsze oferty.</p>
                    </div>
                    <div class="news-form">
                        <input v-model="email" class="news-input" placeholder="Twój adres email" />
                        <button class="btn-subscribe">Zapisz się</button>
                    </div>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, CarEvent, PagedResult } from '~/types'

const featured = ref<CarAdvert[]>([])
const events = ref<CarEvent[]>([])
const email = ref('')
const searchText = ref('')
const homeStats = ref({ activeAdverts: 0, totalUsers: 0, soldVehicles: 0, companies: 0, events: 0 })

const { getUpcoming } = useEvents()
const { getImageUrl } = useImageUrl()

function formatStat(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
    return n.toLocaleString('pl')
}

const eventPlaceholder = '/car-placeholder.svg'

function getEventImageUrl(ev: CarEvent): string {
    const main = ev.images?.find(i => i.isMain) ?? ev.images?.[0]
    return getImageUrl(main?.url, eventPlaceholder)
}

function formatEventDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

const feats = [
    { title: 'Bezpieczeństwo', desc: 'Weryfikujemy ogłoszenia i dbamy o Twoje bezpieczeństwo.', icon: 'mdi-shield-check-outline' },
    { title: 'Inteligentne narzędzia', desc: 'AI pomaga w wycenie, opisie i analizie rynku.', icon: 'mdi-cpu-64-bit' },
    { title: 'Zaufani sprzedawcy', desc: 'Współpracujemy tylko ze sprawdzonymi użytkownikami.', icon: 'mdi-account-star-outline' },
    { title: 'Najlepsze oferty', desc: 'Codziennie tysiące nowych, atrakcyjnych ofert w jednym miejscu.', icon: 'mdi-tag-outline' },
]

function doSearch() {
    if (searchText.value.trim()) {
        navigateTo({ path: '/adverts', query: { textSearch: searchText.value } })
    } else {
        navigateTo('/adverts')
    }
}

onMounted(async () => {
    await Promise.allSettled([
        $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert?page=1&pageSize=4')
            .then(r => { featured.value = r.items }),
        getUpcoming(4).then(e => { events.value = e }),
        $fetch<typeof homeStats.value>('/api/proxy/api/Stats/home')
            .then(s => { homeStats.value = s }),
    ])
})
</script>

<style lang="scss" scoped>
.home { background: $bg; }
.container { @include container; }

// Hero
.hero {
    padding-top: $nav-height;
    position: relative;
    overflow: hidden;
    min-height: 560px;
    background: $bg;
}

.hero-car-bg {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 62%;
    z-index: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        opacity: 0.55;
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
            linear-gradient(to right, $bg 0%, transparent 35%),
            linear-gradient(to bottom, transparent 55%, $bg 100%);
    }

    @include respond-to(md) { display: none; }
}

.hero-inner {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    min-height: 480px;
    padding: 60px 0 80px;
}

.hero-content { max-width: 580px; }

.hero-eyebrow {
    color: $red;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.hero-title {
    font-size: 68px;
    line-height: 1.05;
    font-weight: 900;
    color: $text;

    span { color: $red; }

    @include respond-to(md) { font-size: 52px; }
    @include respond-to(sm) { font-size: 38px; }
}

.hero-sub {
    margin-top: 22px;
    color: $text-muted;
    font-size: 15px;
    line-height: 1.8;
}

.hero-badges {
    display: flex;
    gap: 28px;
    margin-top: 36px;
    flex-wrap: wrap;
}

.hero-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-muted;
    font-size: 13px;

    .v-icon { color: $text-dim; }
}

// Search
.search-wrap {
    background: #070707;
    padding: 26px 0;
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 10px 16px;

    @include respond-to(sm) { flex-wrap: wrap; }
}

.search-icon { color: $text-dim; flex-shrink: 0; }

.search-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 15px;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-dim; }
}

.btn-filters {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 16px;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;

    &:hover { border-color: $text-dim; color: $text; }
}

.btn-search {
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 32px;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

// Stats
.stats-bar {
    background: #080808;
    padding: 36px 0;
    border-bottom: 1px solid $border;
}

.stats-inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    text-align: center;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.stat-icon { color: $red; }

.stat-num {
    font-size: 36px;
    font-weight: 800;
    color: $text;
    line-height: 1.1;
}

.stat-label {
    color: $text-dim;
    font-size: 13px;
}

// Sections
.section { margin-top: 90px; }

.section-title {
    font-size: 32px;
    font-weight: 700;
    color: $text;
    margin-bottom: 32px;

    span { color: $red; }
}

.sec-top {
    @include section-top;

    .see-all {
        display: flex;
        align-items: center;
        gap: 4px;
        color: $red;
        font-size: 14px;
        font-weight: 500;
    }
}

.cars-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.feat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.feat-card {
    @include card;
    padding: 32px 24px;

    h3 {
        color: $text;
        font-weight: 700;
        margin: 16px 0 10px;
        font-size: 15px;
    }

    p {
        color: $text-dim;
        line-height: 1.7;
        font-size: 13px;
    }
}

.feat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
}

// Events
.events-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.event-card {
    @include card;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, border-color 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba($red, 0.35);
    }
}

.event-img-wrap {
    position: relative;

    img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
    }
}

.event-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba($red, 0.9);
    color: white;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 3px 9px;
    border-radius: 5px;
}

.event-date-chip {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
}

.event-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.event-name {
    font-size: 15px;
    font-weight: 700;
    color: $text;
    line-height: 1.3;
}

.event-loc {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-dim;
    font-size: 12px;
}

.event-loc-icon { color: $red; }

.event-desc {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.6;
    flex: 1;
}

.event-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
    transition: opacity 0.2s;
    text-decoration: none;

    &:hover { opacity: 0.8; }
}

// Newsletter
.newsletter {
    background: linear-gradient(135deg, #1c0408 0%, #0d0105 100%);
    border: 1px solid rgba($red, 0.3);
    border-radius: $r-xl;
    padding: 45px;
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 30px;

    @include respond-to(md) { flex-wrap: wrap; }
    @include respond-to(sm) { flex-direction: column; align-items: flex-start; }
}

.news-icon {
    flex-shrink: 0;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba($red, 0.15);
    border: 1px solid rgba($red, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
}

.news-text {
    flex: 1;

    h2 {
        font-size: 26px;
        font-weight: 800;
        color: $text;
    }

    p {
        color: $text-muted;
        margin-top: 6px;
        font-size: 14px;
    }
}

.news-form {
    display: flex;
    gap: 12px;
    flex-shrink: 0;

    @include respond-to(sm) { flex-direction: column; width: 100%; }
}

.news-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $r-sm;
    padding: 12px 18px;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    width: 260px;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dim; }
    &:focus { border-color: rgba($red, 0.5); }

    @include respond-to(sm) { width: 100%; }
}

.btn-subscribe {
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 28px;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}
</style>
