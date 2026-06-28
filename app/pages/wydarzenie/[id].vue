<template>
    <div class="event-detail-page">

        <div v-if="loading" class="loading-wrap">
            <v-icon icon="mdi-loading" size="40" class="spin" />
        </div>

        <template v-else-if="event">
            <!-- Hero -->
            <div class="event-hero">
                <div class="hero-img-wrap">
                    <img :src="mainImageUrl" :alt="event.name" class="hero-img" fetchpriority="high" />
                    <div class="hero-gradient" />
                </div>
                <div class="hero-content container">
                    <span v-if="event.isFeatured" class="featured-chip">
                        <v-icon icon="mdi-crown" size="13" /> Wyróżnione
                    </span>
                    <h1 class="hero-title">{{ event.name }}</h1>
                    <div class="hero-meta">
                        <span><v-icon icon="mdi-calendar" size="15" />{{ formatDate(event.startDate) }}</span>
                        <span><v-icon icon="mdi-map-marker-outline" size="15" />{{ event.city }}</span>
                        <span v-if="event.organizerName"><v-icon icon="mdi-account-outline" size="15" />{{ event.organizerName }}</span>
                    </div>
                </div>
            </div>

            <!-- Body -->
            <div class="container content-wrap">
                <div class="content-grid">

                    <!-- Main column -->
                    <div class="content-main">

                        <!-- Action bar -->
                        <div class="action-bar">
                            <button class="btn-attend" :class="{ active: isInterested }" @click="toggleAttend">
                                <v-icon :icon="isInterested ? 'mdi-account-check' : 'mdi-account-plus-outline'" size="17" />
                                {{ isInterested ? 'Biorę udział' : 'Wezmę udział' }}
                                <span v-if="localInterestedCount" class="attend-count">{{ localInterestedCount }}</span>
                            </button>
                            <button class="btn-fav" :class="{ active: isFavorite }" @click="toggleFavorite" title="Dodaj do ulubionych">
                                <v-icon :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" size="17" />
                            </button>
                            <a v-if="event.ticketsUrl" :href="event.ticketsUrl" target="_blank" rel="noopener noreferrer" class="btn-ticket">
                                <v-icon icon="mdi-ticket-outline" size="16" />Kup bilety
                            </a>
                            <a v-if="event.websiteUrl" :href="event.websiteUrl" target="_blank" rel="noopener noreferrer" class="btn-web">
                                <v-icon icon="mdi-web" size="16" />Strona
                            </a>
                        </div>

                        <!-- Description -->
                        <div class="section-block">
                            <h2 class="block-title">Opis</h2>
                            <p class="event-desc">{{ event.description }}</p>
                        </div>

                        <!-- Share -->
                        <div class="section-block">
                            <h2 class="block-title">Udostępnij</h2>
                            <div class="share-btns">
                                <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`" target="_blank" rel="noopener noreferrer" class="share-btn share-fb">
                                    <v-icon icon="mdi-facebook" size="18" />Facebook
                                </a>
                                <a :href="`https://wa.me/?text=${encodeURIComponent(event.name + ' ' + shareUrl)}`" target="_blank" rel="noopener noreferrer" class="share-btn share-wa">
                                    <v-icon icon="mdi-whatsapp" size="18" />WhatsApp
                                </a>
                                <a :href="`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`" class="share-btn share-ms">
                                    <v-icon icon="mdi-facebook-messenger" size="18" />Messenger
                                </a>
                                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="share-btn share-ig">
                                    <v-icon icon="mdi-instagram" size="18" />Instagram
                                </a>
                                <button class="share-btn share-copy" @click="copyLink">
                                    <v-icon :icon="copied ? 'mdi-check' : 'mdi-link-variant'" size="18" />
                                    {{ copied ? 'Skopiowano!' : 'Kopiuj link' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <aside class="content-sidebar">

                        <!-- Details card -->
                        <div class="sidebar-card">
                            <h3 class="card-title">Szczegóły</h3>
                            <div class="detail-item">
                                <v-icon icon="mdi-calendar-start" size="16" class="di-icon" />
                                <div>
                                    <div class="di-label">Początek</div>
                                    <div class="di-val">{{ formatDate(event.startDate) }}</div>
                                </div>
                            </div>
                            <div v-if="event.endDate && event.endDate !== event.startDate" class="detail-item">
                                <v-icon icon="mdi-calendar-end" size="16" class="di-icon" />
                                <div>
                                    <div class="di-label">Koniec</div>
                                    <div class="di-val">{{ formatDate(event.endDate) }}</div>
                                </div>
                            </div>
                            <div class="detail-item">
                                <v-icon icon="mdi-map-marker" size="16" class="di-icon" />
                                <div>
                                    <div class="di-label">Lokalizacja</div>
                                    <div class="di-val">{{ event.city }}</div>
                                    <div v-if="event.address" class="di-sub">{{ event.address }}</div>
                                </div>
                            </div>
                            <EventMap
                                v-if="event.city"
                                :city="event.city"
                                :address="event.address ?? ''"
                                class="mt-3"
                            />
                            <div v-if="event.organizerName" class="detail-item">
                                <v-icon icon="mdi-account-tie-outline" size="16" class="di-icon" />
                                <div>
                                    <div class="di-label">Organizator</div>
                                    <div class="di-val">{{ event.organizerName }}</div>
                                    <div v-if="event.organizerEmail" class="di-sub">{{ event.organizerEmail }}</div>
                                    <div v-if="event.organizerPhone" class="di-sub">{{ event.organizerPhone }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Stats card -->
                        <div class="sidebar-card">
                            <h3 class="card-title">Statystyki</h3>
                            <div class="stat-row">
                                <v-icon icon="mdi-eye-outline" size="15" class="stat-icon" />
                                <span>{{ (event.viewCount ?? 0).toLocaleString('pl') }} wyświetleń</span>
                            </div>
                            <div class="stat-row">
                                <v-icon icon="mdi-account-check-outline" size="15" class="stat-icon" />
                                <span>{{ localInterestedCount.toLocaleString('pl') }} zainteresowanych</span>
                            </div>
                            <div class="stat-row">
                                <v-icon icon="mdi-account-group-outline" size="15" class="stat-icon" />
                                <span>{{ (event.attendingCount ?? 0).toLocaleString('pl') }} uczestników</span>
                            </div>
                            <div class="stat-row">
                                <v-icon icon="mdi-share-variant-outline" size="15" class="stat-icon" />
                                <span>{{ (event.shareCount ?? 0).toLocaleString('pl') }} udostępnień</span>
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </template>

        <div v-else class="not-found">
            <v-icon icon="mdi-calendar-off-outline" size="52" class="nf-icon" />
            <p>Nie znaleziono wydarzenia.</p>
            <NuxtLink to="/wydarzenia" class="back-link">Wróć do wydarzeń</NuxtLink>
        </div>

    </div>
</template>

<script setup lang="ts">
import type { CarEvent } from '~/types'

const route = useRoute()
const eventId = Number(route.params.id)

const { getEvent, attendEvent, unattendEvent, addEventFavourite, removeEventFavourite } = useEvents()
const { getImageUrl } = useImageUrl()

const authStatus = useCookie('auth_status')
const isLoggedIn = computed(() => authStatus.value === '1')

const event = ref<CarEvent | null>(null)
const loading = ref(true)
const isInterested = ref(false)
const isFavorite = ref(false)
const copied = ref(false)
const localInterestedCount = ref(0)

const mainImageUrl = computed(() => {
    if (!event.value) return '/car-placeholder.svg'
    const main = event.value.images?.find(i => i.isMain) ?? event.value.images?.[0]
    return getImageUrl(main?.url, '/car-placeholder.svg')
})

const shareUrl = computed(() => {
    if (import.meta.client) return window.location.href
    return `/wydarzenie/${eventId}`
})

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function toggleAttend() {
    if (!isLoggedIn.value) { await navigateTo('/login'); return }
    const was = isInterested.value
    isInterested.value = !was
    localInterestedCount.value = was
        ? Math.max(0, localInterestedCount.value - 1)
        : localInterestedCount.value + 1
    try {
        if (was) await unattendEvent(eventId)
        else await attendEvent(eventId)
    } catch {
        isInterested.value = was
        localInterestedCount.value = was
            ? localInterestedCount.value + 1
            : Math.max(0, localInterestedCount.value - 1)
    }
}

async function toggleFavorite() {
    if (!isLoggedIn.value) { await navigateTo('/login'); return }
    const was = isFavorite.value
    isFavorite.value = !was
    try {
        if (was) await removeEventFavourite(eventId)
        else await addEventFavourite(eventId)
    } catch {
        isFavorite.value = was
    }
}

async function copyLink() {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
}

const eventConfig = useRuntimeConfig()
useHead(computed(() => {
    const e = event.value
    if (!e) return { title: 'Wydarzenie — CARIZO' }
    const desc = e.description?.slice(0, 160) ?? `Wydarzenie motoryzacyjne: ${e.name}`
    const img = mainImageUrl.value?.startsWith('http') ? mainImageUrl.value : `${eventConfig.public.siteUrl}${mainImageUrl.value}`
    const pageUrl = `${eventConfig.public.siteUrl}/wydarzenie/${eventId}`
    return {
        title: `${e.name} — CARIZO`,
        meta: [
            { name: 'description', content: desc },
            { property: 'og:type', content: 'event' },
            { property: 'og:url', content: pageUrl },
            { property: 'og:title', content: `${e.name} — CARIZO` },
            { property: 'og:description', content: desc },
            { property: 'og:image', content: img },
            { property: 'og:site_name', content: 'CARIZO' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: `${e.name} — CARIZO` },
            { name: 'twitter:description', content: desc },
            { name: 'twitter:image', content: img },
        ],
        link: [{ rel: 'canonical', href: pageUrl }]
    }
}))

onMounted(async () => {
    try {
        event.value = await getEvent(eventId)
        isInterested.value = event.value.isUserInterested ?? false
        isFavorite.value = event.value.isUserFavorite ?? false
        localInterestedCount.value = event.value.interestedCount ?? 0
    } catch {
        event.value = null
    } finally {
        loading.value = false
    }
})
</script>

<style lang="scss" scoped>
.event-detail-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
}

.container { @include container; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// Loading
.loading-wrap {
    display: flex;
    justify-content: center;
    padding: 120px 0;
    color: $text-dim;
}

// Hero
.event-hero {
    position: relative;
    height: 420px;
    overflow: hidden;

    @include respond-to(sm) { height: 300px; }
}

.hero-img-wrap {
    position: absolute;
    inset: 0;
}

.hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(#050505, 0.95) 0%, rgba(#050505, 0.4) 60%, transparent 100%);
}

.hero-content {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    padding-bottom: 36px;
}

.featured-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(#ffd700, 0.15);
    border: 1px solid rgba(#ffd700, 0.3);
    color: #ffd700;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 42px;
    font-weight: 900;
    color: $text;
    line-height: 1.15;
    margin-bottom: 14px;

    @include respond-to(sm) { font-size: 28px; }
}

.hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    color: $text-muted;
    font-size: 14px;

    span {
        display: flex;
        align-items: center;
        gap: 6px;

        .v-icon { color: $red; }
    }
}

// Content
.content-wrap {
    padding-top: 40px;
    padding-bottom: 80px;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 32px;
    align-items: start;

    @include respond-to(md) {
        grid-template-columns: 1fr;
    }
}

// Action bar
.action-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 36px;
}

.btn-attend {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.3);
    color: $text-muted;
    border-radius: $r-sm;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;

    &:hover { border-color: $red; color: $text; }
    &.active { background: $red; border-color: $red; color: white; }
}

.attend-count {
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 1px 7px;
    font-size: 12px;
}

.btn-fav {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: $r-sm;
    background: transparent;
    border: 1px solid $border;
    color: $text-dim;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;

    &:hover { border-color: rgba($red, 0.4); color: $red; }
    &.active { background: rgba($red, 0.1); border-color: rgba($red, 0.4); color: $red; .v-icon { color: $red; } }
}

.btn-ticket {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border-radius: $r-sm;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

.btn-web {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid $border;
    color: $text-muted;
    border-radius: $r-sm;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;

    &:hover { border-color: $text-dim; color: $text; }
}

// Sections
.section-block {
    margin-bottom: 40px;
}

.block-title {
    font-size: 18px;
    font-weight: 800;
    color: $text;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid $border;
}

.event-desc {
    color: $text-muted;
    font-size: 15px;
    line-height: 1.9;
    white-space: pre-wrap;
}

// Share
.share-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.share-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: $r-sm;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    border: 1px solid $border;
    background: transparent;
    color: $text-muted;
    transition: all 0.2s;

    &:hover { border-color: rgba($red, 0.3); color: $text; }
}

.share-fb  { &:hover { border-color: #1877f2; color: #1877f2; } }
.share-wa  { &:hover { border-color: #25d366; color: #25d366; } }
.share-ms  { &:hover { border-color: #006aff; color: #006aff; } }
.share-ig  { &:hover { border-color: #e1306c; color: #e1306c; } }
.share-copy { &.copied, &:hover { border-color: rgba($red, 0.4); color: $red; } }

// Sidebar
.content-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: sticky;
    top: calc(#{$nav-height} + 24px);
}

.sidebar-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-title {
    font-size: 14px;
    font-weight: 800;
    color: $text;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
}

.detail-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.di-icon { color: $red; flex-shrink: 0; margin-top: 2px; }
.di-label { font-size: 11px; color: $text-dim; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px; }
.di-val { font-size: 14px; color: $text-muted; font-weight: 500; }
.di-sub { font-size: 12px; color: $text-dim; margin-top: 2px; }

.stat-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: $text-muted;
}

.stat-icon { color: $red; flex-shrink: 0; }

// Not found
.not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 120px 20px;
    text-align: center;
    color: $text-muted;
}

.nf-icon { color: $text-dark; }

.back-link {
    color: $red;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;

    &:hover { opacity: 0.8; }
}
</style>
