<template>
    <div class="events-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">{{ $t('events.hero.eyebrow') }}</div>
                <h1 class="hero-title">{{ $t('events.hero.titleLead') }} <span>{{ $t('events.hero.titleAccent') }}</span></h1>
                <p class="hero-sub">{{ $t('events.hero.sub') }}</p>
            </div>
        </div>

        <div class="container page-body">

            <!-- Filter tabs -->
            <div class="filter-tabs">
                <button v-for="tab in filterTabs" :key="tab.key"
                    class="ftab"
                    :class="{ active: activeFilter === tab.key }"
                    @click="setFilter(tab.key)">
                    <v-icon v-if="tab.icon" :icon="tab.icon" size="14" />
                    {{ tab.label }}
                </button>
            </div>

            <!-- Toolbar -->
            <div class="search-row">
                <div class="search-box">
                    <v-icon icon="mdi-magnify" size="20" class="s-icon" />
                    <input v-model="search" class="s-input" :placeholder="$t('events.searchPlaceholder')" @input="onSearch" />
                </div>
                <NuxtLink to="/dodaj-wydarzenie" class="btn-add-event">
                    <v-icon icon="mdi-plus" size="18" />
                    {{ $t('events.addEvent') }}
                </NuxtLink>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-row">
                <v-icon icon="mdi-loading" size="28" class="spin" />
            </div>

            <!-- Error -->
            <div v-else-if="fetchError" class="empty-state">
                <v-icon icon="mdi-alert-circle-outline" size="52" class="empty-icon" color="#c0392b" />
                <div class="empty-title">{{ $t('events.error.title') }}</div>
                <div class="empty-sub">{{ $t('events.error.desc') }}</div>
                <button class="btn-retry" @click="fetchEvents">
                    <v-icon icon="mdi-refresh" size="16" />
                    {{ $t('events.error.refresh') }}
                </button>
            </div>

            <!-- Empty -->
            <div v-else-if="!events.length" class="empty-state">
                <v-icon icon="mdi-calendar-remove-outline" size="52" class="empty-icon" />
                <div class="empty-title">{{ $t('events.empty.title') }}</div>
                <div class="empty-sub">{{ $t('events.empty.desc') }}</div>
            </div>

            <!-- Grid -->
            <div v-else class="events-grid">
                <div v-for="ev in events" :key="ev.id" class="event-card" @click="navigateTo(`/wydarzenie/${ev.id}`)">
                    <div class="card-img-wrap">
                        <img :src="getEventImageUrl(ev)" :alt="ev.name" />
                        <span v-if="ev.isFeatured" class="event-badge event-badge--featured">
                            <v-icon icon="mdi-crown" size="10" /> {{ $t('events.card.featured') }}
                        </span>
                        <span v-else class="event-badge">{{ $t('events.card.event') }}</span>
                        <div class="date-chip">
                            <v-icon icon="mdi-calendar" size="12" />
                            {{ formatDate(ev.startDate) }}
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="event-name">{{ ev.name }}</div>
                        <div class="event-meta">
                            <span>
                                <v-icon icon="mdi-map-marker-outline" size="14" class="meta-icon" />
                                {{ ev.city }}
                            </span>
                            <span v-if="ev.endDate && ev.endDate !== ev.startDate">
                                <v-icon icon="mdi-calendar-end" size="14" class="meta-icon" />
                                {{ $t('events.card.until', { date: formatDate(ev.endDate) }) }}
                            </span>
                        </div>
                        <p class="event-desc">{{ ev.description?.slice(0, 120) }}{{ (ev.description?.length ?? 0) > 120 ? '...' : '' }}</p>
                        <div class="card-footer">
                            <div class="organizer" v-if="ev.organizerName">
                                <v-icon icon="mdi-account-outline" size="13" />
                                {{ ev.organizerName }}
                            </div>
                            <div class="footer-actions">
                                <!-- Interested count -->
                                <div v-if="interestCounts.get(ev.id)" class="interest-count">
                                    <v-icon icon="mdi-account-check-outline" size="14" />
                                    {{ interestCounts.get(ev.id) }}
                                </div>
                                <!-- Attend -->
                                <button
                                    class="btn-attend"
                                    :class="{ active: attendedIds.has(ev.id) }"
                                    @click.stop="toggleAttend(ev)"
                                    :title="attendedIds.has(ev.id) ? $t('events.card.cancelAttend') : $t('events.card.willAttend')"
                                >
                                    <v-icon :icon="attendedIds.has(ev.id) ? 'mdi-account-check' : 'mdi-account-plus-outline'" size="15" />
                                </button>
                                <!-- Share -->
                                <div class="share-wrap">
                                    <button class="btn-share" @click.stop="toggleShare(ev.id)" :title="$t('events.card.share')">
                                        <v-icon icon="mdi-share-variant-outline" size="15" />
                                    </button>
                                    <div v-if="sharePopupId === ev.id" class="share-popup" @click.stop>
                                        <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(ev.id))}`" target="_blank" rel="noopener noreferrer" class="share-item">
                                            <v-icon icon="mdi-facebook" size="16" />Facebook
                                        </a>
                                        <a :href="`https://wa.me/?text=${encodeURIComponent(ev.name + ' ' + getShareUrl(ev.id))}`" target="_blank" rel="noopener noreferrer" class="share-item">
                                            <v-icon icon="mdi-whatsapp" size="16" />WhatsApp
                                        </a>
                                        <a :href="`fb-messenger://share/?link=${encodeURIComponent(getShareUrl(ev.id))}`" class="share-item">
                                            <v-icon icon="mdi-facebook-messenger" size="16" />Messenger
                                        </a>
                                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="share-item">
                                            <v-icon icon="mdi-instagram" size="16" />Instagram
                                        </a>
                                        <button class="share-item" @click="copyLink(ev.id)">
                                            <v-icon :icon="copiedId === ev.id ? 'mdi-check' : 'mdi-link-variant'" size="16" />
                                            {{ copiedId === ev.id ? $t('events.card.copied') : $t('events.card.copyLink') }}
                                        </button>
                                    </div>
                                </div>
                                <!-- External links -->
                                <a v-if="ev.ticketsUrl" :href="ev.ticketsUrl" target="_blank" rel="noopener noreferrer" class="btn-ticket" @click.stop>
                                    <v-icon icon="mdi-ticket-outline" size="14" />
                                    {{ $t('events.card.tickets') }}
                                </a>
                                <a v-if="ev.websiteUrl" :href="ev.websiteUrl" target="_blank" rel="noopener noreferrer" class="btn-web" @click.stop>
                                    <v-icon icon="mdi-web" size="14" />
                                    {{ $t('events.card.website') }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalCount > pageSize" class="pagination">
                <button class="page-btn" :disabled="page === 1" :aria-label="$t('events.pagination.prev')" @click="changePage(page - 1)">
                    <v-icon icon="mdi-chevron-left" size="18" />
                </button>
                <span class="page-info">{{ page }} / {{ totalPages }}</span>
                <button class="page-btn" :disabled="page >= totalPages" :aria-label="$t('events.pagination.next')" @click="changePage(page + 1)">
                    <v-icon icon="mdi-chevron-right" size="18" />
                </button>
            </div>

        </div>

        <!-- Share popup close overlay -->
        <div v-if="sharePopupId !== null" class="share-overlay" @click="sharePopupId = null" />
    </div>
</template>

<script setup lang="ts">
import type { CarEvent, PagedResult } from '~/types'

const { t } = useI18n()
const wydarzeniaConfig = useRuntimeConfig()
useSeoMeta({
    title: () => t('events.seo.title'),
    description: () => t('events.seo.description'),
    ogType: 'website',
    ogUrl: `${wydarzeniaConfig.public.siteUrl}/wydarzenia`,
    ogTitle: () => t('events.seo.title'),
    ogDescription: () => t('events.seo.ogDescription'),
    ogImage: `${wydarzeniaConfig.public.siteUrl}/og-image.jpg`,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogSiteName: 'CARIZO',
    twitterCard: 'summary_large_image',
    twitterTitle: () => t('events.seo.title'),
    twitterDescription: () => t('events.seo.twitterDescription'),
    twitterImage: `${wydarzeniaConfig.public.siteUrl}/og-image.jpg`,
})
useHead({ link: [{ rel: 'canonical', href: `${wydarzeniaConfig.public.siteUrl}/wydarzenia` }] })

const { getEvents, attendEvent, unattendEvent } = useEvents()
const { getImageUrl } = useImageUrl()
const { isLoggedIn } = useAuth()


const events = ref<CarEvent[]>([])
const loading = ref(true)
const fetchError = ref(false)
const search = ref('')
const page = ref(1)
const pageSize = 12
const totalCount = ref(0)
const activeFilter = ref<'all' | 'week' | 'month' | 'featured'>('all')

const filterTabs = computed(() => [
    { key: 'all',      label: t('events.filters.all'),      icon: null },
    { key: 'week',     label: t('events.filters.week'),     icon: 'mdi-calendar-week' },
    { key: 'month',    label: t('events.filters.month'),    icon: 'mdi-calendar-month' },
    { key: 'featured', label: t('events.filters.featured'), icon: 'mdi-crown' },
])

const attendedIds = ref(new Set<number>())
const interestCounts = ref(new Map<number, number>())
const sharePopupId = ref<number | null>(null)
const copiedId = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const placeholder = '/car-placeholder.svg'

function getEventImageUrl(ev: CarEvent): string {
    const main = ev.images?.find(i => i.isMain) ?? ev.images?.[0]
    return getImageUrl(main?.url, placeholder)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getShareUrl(id: number): string {
    if (import.meta.client) return `${window.location.origin}/wydarzenie/${id}`
    return `/wydarzenie/${id}`
}

function toggleShare(id: number) {
    sharePopupId.value = sharePopupId.value === id ? null : id
}

async function copyLink(id: number) {
    await navigator.clipboard.writeText(getShareUrl(id))
    copiedId.value = id
    setTimeout(() => { if (copiedId.value === id) copiedId.value = null }, 2000)
}

async function toggleAttend(ev: CarEvent) {
    if (!isLoggedIn.value) { await navigateTo('/login'); return }
    const id = ev.id
    const was = attendedIds.value.has(id)
    const current = interestCounts.value.get(id) ?? 0
    if (was) {
        attendedIds.value.delete(id)
        interestCounts.value.set(id, Math.max(0, current - 1))
    } else {
        attendedIds.value.add(id)
        interestCounts.value.set(id, current + 1)
    }
    try {
        if (was) await unattendEvent(id)
        else await attendEvent(id)
    } catch {
        if (was) { attendedIds.value.add(id); interestCounts.value.set(id, current) }
        else { attendedIds.value.delete(id); interestCounts.value.set(id, current) }
    }
}

function setFilter(key: string) {
    activeFilter.value = key as typeof activeFilter.value
    page.value = 1
    fetchEvents()
}

let searchTimeout: ReturnType<typeof setTimeout>
function onSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { page.value = 1; fetchEvents() }, 400)
}

async function fetchEvents() {
    loading.value = true
    fetchError.value = false
    const filterQuery: Record<string, string | number | undefined> = {
        search: search.value || undefined,
        page: page.value,
        pageSize,
    }
    if (activeFilter.value === 'featured') filterQuery.isFeatured = 'true'
    if (activeFilter.value === 'week') filterQuery.dateRange = 'week'
    if (activeFilter.value === 'month') filterQuery.dateRange = 'month'
    try {
        const r = await getEvents(filterQuery)
        events.value = r.items
        totalCount.value = r.totalCount
        attendedIds.value = new Set(r.items.filter(e => e.isUserInterested).map(e => e.id))
        interestCounts.value = new Map(r.items.map(e => [e.id, e.interestedCount ?? 0]))
    } catch {
        events.value = []
        totalCount.value = 0
        fetchError.value = true
    } finally {
        loading.value = false
    }
}

function changePage(p: number) {
    page.value = p
    fetchEvents()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchEvents)
</script>

<style lang="scss" scoped>
.events-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
}

.container { @include container; }

// Hero
.page-hero {
    padding: 56px 0 48px;
    border-bottom: 1px solid $border;
    background: linear-gradient(180deg, #0d0005 0%, $bg 100%);
}

.hero-eyebrow {
    font-size: 11px;
    font-weight: 700;
    color: $red;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 52px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
    margin-bottom: 16px;

    span { color: $red; }

    @include respond-to(sm) { font-size: 36px; }
}

.hero-sub {
    font-size: 15px;
    color: $text-muted;
    line-height: 1.7;
}

// Body
.page-body {
    padding-top: 36px;
    padding-bottom: 80px;
}

// Filter tabs
.filter-tabs {
    display: flex;
    gap: 8px;
    padding: 24px 0 0;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.ftab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: $r-sm;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;

    &:hover { border-color: rgba($red, 0.3); color: $text; }
    &.active { background: rgba($red, 0.12); border-color: rgba($red, 0.4); color: $red; font-weight: 700; }
}

.search-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
    flex-wrap: wrap;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 12px 18px;
    flex: 1;
    max-width: 480px;
}

.s-icon { color: $text-dim; flex-shrink: 0; }

.s-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-dim; }
}

.btn-add-event {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border-radius: $r-sm;
    padding: 12px 20px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

// Loading
.loading-row {
    display: flex;
    justify-content: center;
    padding: 80px 0;
    color: $text-dim;
}

.spin { animation: spin 1s linear infinite; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

// Empty
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 80px 0;
    text-align: center;
}

.empty-icon { color: $text-dark; }
.empty-title { font-size: 20px; font-weight: 700; color: $text-muted; }
.empty-sub { font-size: 14px; color: $text-dim; }
.btn-retry {
    display: inline-flex; align-items: center; gap: 7px; margin-top: 4px;
    background: rgba($red, 0.1); border: 1px solid rgba($red, 0.3); border-radius: $r-sm;
    color: $red; font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 9px 20px; cursor: pointer; transition: opacity 0.2s;
    &:hover { opacity: 0.8; }
}

// Grid
.events-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.event-card {
    @include card;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.3s ease, border-color 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba($red, 0.35);
    }
}

.card-img-wrap {
    position: relative;

    img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
    }
}

.event-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba($red, 0.9);
    color: white;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 3px 9px;
    border-radius: 5px;

    &--featured { background: rgba(#ffd700, 0.9); color: #1a1200; }
}

.date-chip {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(6px);
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
}

.event-name {
    font-size: 16px;
    font-weight: 700;
    color: $text;
    line-height: 1.3;
}

.event-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    color: $text-dim;
    font-size: 12px;

    span {
        display: flex;
        align-items: center;
        gap: 4px;
    }
}

.meta-icon { color: $red; }

.event-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.65;
    flex: 1;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 4px;
    padding-top: 10px;
    border-top: 1px solid $border;
    flex-wrap: wrap;
}

.organizer {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: $text-dim;
}

.footer-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
}

.interest-count {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: $text-dim;

    .v-icon { color: $red; }
}

.btn-attend {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: $r-sm;
    background: transparent;
    border: 1px solid $border;
    color: $text-dim;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;

    &:hover { border-color: $red; color: $red; }
    &.active { background: rgba($red, 0.1); border-color: rgba($red, 0.5); color: $red; }
}

.share-wrap { position: relative; }

.btn-share {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: $r-sm;
    background: transparent;
    border: 1px solid $border;
    color: $text-dim;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;

    &:hover { border-color: rgba($red, 0.4); color: $text-muted; }
}

.share-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 6px;
    z-index: 100;
    min-width: 160px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.share-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 12px;
    border-radius: $r-sm;
    font-size: 13px;
    color: $text-muted;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: none;
    font-family: 'Inter', sans-serif;
    width: 100%;
    text-align: left;
    transition: background 0.15s, color 0.15s;

    &:hover { background: rgba(255,255,255,0.05); color: $text; }

    .v-icon { flex-shrink: 0; }
}

.share-overlay {
    position: fixed;
    inset: 0;
    z-index: 99;
}

.btn-ticket,
.btn-web {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border-radius: $r-sm;
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.8; }
}

.btn-ticket {
    background: $red;
    color: white;
}

.btn-web {
    background: transparent;
    border: 1px solid $border;
    color: $text-muted;
}

// Pagination
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 48px;
}

.page-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #0d0d0d;
    border: 1px solid $border;
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
}

.page-info {
    font-size: 14px;
    font-weight: 600;
    color: $text-muted;
    min-width: 60px;
    text-align: center;
}
</style>
