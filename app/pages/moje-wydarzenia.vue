<template>
    <div class="my-events-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">Twoje konto</div>
                <h1>Moje <span>wydarzenia</span></h1>
                <p>Zarządzaj wydarzeniami, które dodałeś do CARIZO.</p>
            </div>
        </div>

        <div class="container page-body">

            <div class="top-bar">
                <div class="top-bar-left">
                    <span class="events-count">{{ totalCount }} {{ totalCount === 1 ? 'wydarzenie' : totalCount < 5 ? 'wydarzenia' : 'wydarzeń' }}</span>
                </div>
                <NuxtLink to="/dodaj-wydarzenie" class="btn-add">
                    <v-icon icon="mdi-plus" size="18" />
                    Dodaj wydarzenie
                </NuxtLink>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-row">
                <v-icon icon="mdi-loading" size="28" class="spin" />
            </div>

            <!-- Empty -->
            <div v-else-if="!events.length" class="empty-state">
                <v-icon icon="mdi-calendar-plus-outline" size="56" class="empty-icon" />
                <div class="empty-title">Brak wydarzeń</div>
                <div class="empty-sub">Nie dodałeś jeszcze żadnych wydarzeń.</div>
                <NuxtLink to="/dodaj-wydarzenie" class="btn-add-first">
                    <v-icon icon="mdi-plus" size="16" />
                    Dodaj pierwsze wydarzenie
                </NuxtLink>
            </div>

            <!-- Events list -->
            <div v-else class="events-list">
                <div v-for="ev in events" :key="ev.id" class="event-row">
                    <div class="ev-thumb-wrap">
                        <img :src="getEventImageUrl(ev)" :alt="ev.name" class="ev-thumb" />
                        <span v-if="ev.isFeatured" class="thumb-crown" title="Wyróżnione">
                            <v-icon icon="mdi-crown" size="13" />
                        </span>
                    </div>
                    <div class="ev-info">
                        <div class="ev-name">{{ ev.name }}</div>
                        <div class="ev-meta">
                            <span><v-icon icon="mdi-calendar" size="13" />{{ formatDate(ev.startDate) }}</span>
                            <span><v-icon icon="mdi-map-marker-outline" size="13" />{{ ev.city }}</span>
                            <span v-if="ev.interestedCount">
                                <v-icon icon="mdi-account-check-outline" size="13" />{{ ev.interestedCount }} zainteresowanych
                            </span>
                        </div>
                    </div>
                    <span class="ev-status" :class="`status-${ev.status?.toLowerCase()}`">{{ statusLabel(ev.status) }}</span>
                    <div class="ev-actions">
                        <NuxtLink :to="`/wydarzenie/${ev.id}`" class="btn-view" title="Podgląd">
                            <v-icon icon="mdi-eye-outline" size="16" />
                        </NuxtLink>
                        <NuxtLink :to="`/dodaj-wydarzenie?id=${ev.id}`" class="btn-edit" title="Edytuj">
                            <v-icon icon="mdi-pencil-outline" size="16" />
                        </NuxtLink>
                        <button @click="confirmDelete(ev.id)" class="btn-delete" title="Usuń">
                            <v-icon icon="mdi-delete-outline" size="16" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalCount > pageSize" class="pagination">
                <button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)">
                    <v-icon icon="mdi-chevron-left" size="18" />
                </button>
                <span class="page-info">{{ page }} / {{ totalPages }}</span>
                <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
                    <v-icon icon="mdi-chevron-right" size="18" />
                </button>
            </div>

        </div>

        <!-- Delete confirmation modal -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="deleteId !== null" class="modal-backdrop" @click.self="deleteId = null">
                    <div class="confirm-modal">
                        <v-icon icon="mdi-calendar-remove" size="36" class="del-icon" />
                        <h3>Usuń wydarzenie</h3>
                        <p>Tej operacji nie można cofnąć.</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel-modal" @click="deleteId = null">Anuluj</button>
                            <button class="btn-delete-confirm" :disabled="deleting" @click="doDelete">
                                <v-icon v-if="deleting" icon="mdi-loading" size="14" class="spin" />
                                Usuń
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { CarEvent, PagedResult } from '~/types'

definePageMeta({ middleware: 'auth' })

const { getMyEvents, deleteMyEvent } = useEvents()
const { getImageUrl } = useImageUrl()

const events = ref<CarEvent[]>([])
const loading = ref(true)
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const deleteId = ref<number | null>(null)
const deleting = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

function getEventImageUrl(ev: CarEvent): string {
    const main = ev.images?.find(i => i.isMain) ?? ev.images?.[0]
    return getImageUrl(main?.url, '/car-placeholder.svg')
}

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(s: string): string {
    const map: Record<string, string> = {
        Pending: 'Oczekuje',
        Published: 'Opublikowane',
        Rejected: 'Odrzucone',
        Archived: 'Archiwum',
    }
    return map[s] ?? s
}

async function fetchEvents() {
    loading.value = true
    try {
        const r = await getMyEvents(page.value, pageSize)
        events.value = r.items
        totalCount.value = r.totalCount
    } catch {
        events.value = []
        totalCount.value = 0
    } finally {
        loading.value = false
    }
}

async function goPage(p: number) {
    page.value = p
    await fetchEvents()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function confirmDelete(id: number) {
    deleteId.value = id
}

async function doDelete() {
    if (deleteId.value === null) return
    deleting.value = true
    try {
        await deleteMyEvent(deleteId.value)
        events.value = events.value.filter(e => e.id !== deleteId.value)
        totalCount.value = Math.max(0, totalCount.value - 1)
        deleteId.value = null
    } catch {} finally {
        deleting.value = false
    }
}

onMounted(fetchEvents)
</script>

<style lang="scss" scoped>
.my-events-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
}

.container { @include container; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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

.page-hero h1 {
    font-size: 48px;
    font-weight: 900;
    color: $text;
    margin-bottom: 14px;

    span { color: $red; }

    @include respond-to(sm) { font-size: 34px; }
}

.page-hero p { font-size: 15px; color: $text-muted; }

// Body
.page-body {
    padding-top: 36px;
    padding-bottom: 80px;
}

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 12px;
}

.events-count {
    font-size: 14px;
    color: $text-dim;
}

.btn-add {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border-radius: $r-sm;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

// Loading / Empty
.loading-row {
    display: flex;
    justify-content: center;
    padding: 80px 0;
    color: $text-dim;
}

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

.btn-add-first {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-top: 8px;
    background: $red;
    color: white;
    border-radius: $r-sm;
    padding: 11px 20px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

// List
.events-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
}

.event-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;

    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,0.02); }

    @include respond-to(sm) { flex-wrap: wrap; gap: 10px; }
}

.ev-thumb-wrap {
    position: relative;
    flex-shrink: 0;
}

.ev-thumb {
    width: 72px;
    height: 48px;
    object-fit: cover;
    border-radius: $r-sm;
    display: block;
}

.thumb-crown {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #ffd700;
    color: #1a1200;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ev-info {
    flex: 1;
    min-width: 0;
}

.ev-name {
    font-size: 14px;
    font-weight: 600;
    color: $text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ev-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
    color: $text-dim;
    font-size: 11px;

    span {
        display: flex;
        align-items: center;
        gap: 4px;

        .v-icon { color: $text-dark; }
    }
}

.ev-status {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;

    &.status-pending    { background: rgba(255,152,0,0.1); color: #ff9800; border: 1px solid rgba(255,152,0,0.2); }
    &.status-published  { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
    &.status-rejected   { background: rgba(220,50,50,0.09); color: #e55; border: 1px solid rgba(220,50,50,0.2); }
    &.status-archived   { background: rgba(255,255,255,0.05); color: $text-dim; border: 1px solid $border; }
}

.ev-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

.btn-view,
.btn-edit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $r-sm;
    background: transparent;
    border: 1px solid $border;
    color: $text-dim;
    text-decoration: none;
    transition: all 0.2s;

    &:hover { border-color: rgba($red, 0.4); color: $text-muted; }
}

.btn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $r-sm;
    background: transparent;
    border: 1px solid rgba(220,50,50,0.2);
    color: #e55;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;

    &:hover { background: rgba(220,50,50,0.1); }
}

// Pagination
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
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

// Delete modal
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.confirm-modal {
    background: #0e0e0e;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 32px 28px;
    width: 100%;
    max-width: 360px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.del-icon { color: rgba(#e55, 0.7); }
.confirm-modal h3 { font-size: 18px; font-weight: 800; color: $text; margin: 0; }
.confirm-modal p { font-size: 13px; color: $text-dim; margin: 0; }

.confirm-actions {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
}

.btn-cancel-modal {
    flex: 1;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;

    &:hover { border-color: $text-dim; color: $text; }
}

.btn-delete-confirm {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(220,50,50,0.15);
    border: 1px solid rgba(#e55, 0.35);
    border-radius: $r-sm;
    color: #e55;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 10px;
    cursor: pointer;

    &:hover:not(:disabled) { background: rgba(220,50,50,0.25); }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
