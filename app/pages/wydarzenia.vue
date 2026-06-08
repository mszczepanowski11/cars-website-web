<template>
    <div class="events-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">Motoryzacja na żywo</div>
                <h1 class="hero-title">Nadchodzące <span>wydarzenia</span></h1>
                <p class="hero-sub">Targi, zloty, wystawy i imprezy motoryzacyjne w całej Polsce.</p>
            </div>
        </div>

        <div class="container page-body">

            <!-- Search bar -->
            <div class="search-row">
                <div class="search-box">
                    <v-icon icon="mdi-magnify" size="20" class="s-icon" />
                    <input v-model="search" class="s-input" placeholder="Szukaj wydarzeń..." @input="onSearch" />
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-row">
                <v-icon icon="mdi-loading" size="28" class="spin" />
            </div>

            <!-- Empty -->
            <div v-else-if="!events.length" class="empty-state">
                <v-icon icon="mdi-calendar-remove-outline" size="52" class="empty-icon" />
                <div class="empty-title">Brak wydarzeń</div>
                <div class="empty-sub">Nie znaleziono żadnych nadchodzących wydarzeń.</div>
            </div>

            <!-- Grid -->
            <div v-else class="events-grid">
                <div v-for="ev in events" :key="ev.id" class="event-card">
                    <div class="card-img-wrap">
                        <img :src="getEventImageUrl(ev)" :alt="ev.name" />
                        <span class="event-badge">WYDARZENIE</span>
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
                                do {{ formatDate(ev.endDate) }}
                            </span>
                        </div>
                        <p class="event-desc">{{ ev.description?.slice(0, 120) }}{{ (ev.description?.length ?? 0) > 120 ? '...' : '' }}</p>
                        <div class="card-footer">
                            <div class="organizer" v-if="ev.organizerName">
                                <v-icon icon="mdi-account-outline" size="13" />
                                {{ ev.organizerName }}
                            </div>
                            <div class="card-actions">
                                <a v-if="ev.ticketsUrl" :href="ev.ticketsUrl" target="_blank" rel="noopener" class="btn-ticket">
                                    <v-icon icon="mdi-ticket-outline" size="14" />
                                    Bilety
                                </a>
                                <a v-if="ev.websiteUrl" :href="ev.websiteUrl" target="_blank" rel="noopener" class="btn-web">
                                    <v-icon icon="mdi-web" size="14" />
                                    Strona
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalCount > pageSize" class="pagination">
                <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">
                    <v-icon icon="mdi-chevron-left" size="18" />
                </button>
                <span class="page-info">{{ page }} / {{ totalPages }}</span>
                <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">
                    <v-icon icon="mdi-chevron-right" size="18" />
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import type { CarEvent, PagedResult } from '~/types'

const { getEvents } = useEvents()
const { getImageUrl } = useImageUrl()

const events = ref<CarEvent[]>([])
const loading = ref(true)
const search = ref('')
const page = ref(1)
const pageSize = 12
const totalCount = ref(0)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const placeholder = '/car-placeholder.svg'

function getEventImageUrl(ev: CarEvent): string {
    const main = ev.images?.find(i => i.isMain) ?? ev.images?.[0]
    return getImageUrl(main?.url, placeholder)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

let searchTimeout: ReturnType<typeof setTimeout>
function onSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { page.value = 1; fetchEvents() }, 400)
}

async function fetchEvents() {
    loading.value = true
    try {
        const r = await getEvents({ search: search.value || undefined, page: page.value, pageSize })
        events.value = r.items
        totalCount.value = r.totalCount
    } catch {
        events.value = []
        totalCount.value = 0
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

.search-row {
    margin-bottom: 32px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 12px 18px;
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
    background: rgba($red, 0.9);
    color: white;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 3px 9px;
    border-radius: 5px;
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
}

.organizer {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: $text-dim;
}

.card-actions {
    display: flex;
    gap: 8px;
}

.btn-ticket,
.btn-web {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: $r-sm;
    font-size: 12px;
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
