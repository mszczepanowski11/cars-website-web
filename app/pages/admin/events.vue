<template>
    <div class="admin-page">
        <aside class="admin-sidebar">
            <div class="sidebar-brand">
                <v-icon icon="mdi-shield-crown" size="20" class="brand-icon" />
                Panel Administratora
            </div>
            <nav class="sidebar-nav">
                <NuxtLink to="/admin" class="nav-item"><v-icon icon="mdi-view-dashboard-outline" size="17" />Podsumowanie</NuxtLink>
                <NuxtLink to="/admin/reports" class="nav-item"><v-icon icon="mdi-flag-outline" size="17" />Zgłoszenia</NuxtLink>
                <NuxtLink to="/admin/users" class="nav-item"><v-icon icon="mdi-account-group-outline" size="17" />Użytkownicy</NuxtLink>
                <NuxtLink to="/admin/adverts" class="nav-item"><v-icon icon="mdi-car-outline" size="17" />Ogłoszenia</NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item active"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Wydarzenia</h1>
                <span class="topbar-count">{{ totalCount.toLocaleString('pl') }} wydarzeń</span>
            </div>

            <div class="toolbar">
                <div class="search-bar">
                    <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                    <input v-model="search" class="sb-input" placeholder="Szukaj wydarzeń..." @input="debouncedFetch" />
                </div>
                <div class="filter-tabs">
                    <button v-for="f in eventFilters" :key="f.key" class="filter-tab" :class="{ active: statusFilter === f.key }" @click="setFilter(f.key)">{{ f.label }}</button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />Ładowanie wydarzeń...
            </div>

            <template v-else>
                <div v-if="events.length" class="events-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Wydarzenie</th>
                                <th>Organizator</th>
                                <th>Data</th>
                                <th>Miasto</th>
                                <th>Status</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in events" :key="e.id">
                                <td class="td-id">#{{ e.id }}</td>
                                <td>
                                    <div class="event-cell">
                                        <img :src="getImageUrl(e.mainImageUrl)" class="event-thumb" :alt="e.name" />
                                        <div>
                                            <div class="event-name">{{ e.name }}</div>
                                            <div class="event-short">{{ e.reportCount ? `${e.reportCount} zgłoszeń` : 'Brak zgłoszeń' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="td-org">{{ e.createdByName ?? '—' }}</td>
                                <td class="td-date">{{ formatDate(e.startDate) }}</td>
                                <td class="td-city">{{ e.city ?? '—' }}</td>
                                <td>
                                    <span class="status-badge" :class="`status-${e.status?.toLowerCase()}`">
                                        {{ statusLabel(e.status) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-row">
                                        <button v-if="e.status === 'Pending'" class="btn-action btn-approve" :disabled="actionLoading === e.id" @click="changeStatus(e, 'Published')">
                                            <v-icon v-if="actionLoading === e.id" icon="mdi-loading" size="13" class="spin" />
                                            <v-icon v-else icon="mdi-check" size="13" />
                                            Zatwierdź
                                        </button>
                                        <button v-if="e.status === 'Pending'" class="btn-action btn-reject" :disabled="actionLoading === e.id" @click="changeStatus(e, 'Rejected')">
                                            <v-icon icon="mdi-close" size="13" />Odrzuć
                                        </button>
                                        <button v-if="e.status === 'Published'" class="btn-action btn-archive" :disabled="actionLoading === e.id" @click="changeStatus(e, 'Archived')">
                                            <v-icon icon="mdi-archive-outline" size="13" />Archiwizuj
                                        </button>
                                        <button class="btn-action btn-delete" :disabled="actionLoading === e.id" @click="confirmDelete(e.id)">
                                            <v-icon icon="mdi-delete-outline" size="13" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state">
                    <v-icon icon="mdi-calendar-off-outline" size="40" class="empty-icon" />
                    <p>Brak wydarzeń spełniających kryteria.</p>
                </div>

                <div v-if="totalCount > pageSize" class="pagination">
                    <button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)"><v-icon icon="mdi-chevron-left" size="18" /></button>
                    <span class="page-info">{{ page }} / {{ totalPages }}</span>
                    <button class="page-btn" :disabled="page === totalPages" @click="goPage(page + 1)"><v-icon icon="mdi-chevron-right" size="18" /></button>
                </div>
            </template>
        </main>

        <Teleport to="body">
            <transition name="fade">
                <div v-if="deleteId !== null" class="modal-backdrop" @click.self="deleteId = null">
                    <div class="confirm-modal">
                        <v-icon icon="mdi-calendar-remove" size="36" class="del-icon" />
                        <h3>Usuń wydarzenie</h3>
                        <p>Tej operacji nie można cofnąć.</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel" @click="deleteId = null">Anuluj</button>
                            <button class="btn-delete-confirm" :disabled="actionLoading !== null" @click="doDelete">
                                <v-icon v-if="actionLoading !== null" icon="mdi-loading" size="14" class="spin" />Usuń
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { AdminEvent } from '~/types'

definePageMeta({ middleware: 'auth' })

const { getImageUrl, placeholder } = useImageUrl()
const { adminGetEvents, publishEvent, rejectEvent, archiveEvent, deleteEvent } = useEvents()

const events = ref<AdminEvent[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const pageSize = 25
const totalCount = ref(0)
const actionLoading = ref<number | null>(null)
const deleteId = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

const eventFilters = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'Pending', label: 'Oczekujące' },
    { key: 'Published', label: 'Opublikowane' },
    { key: 'Rejected', label: 'Odrzucone' },
    { key: 'Archived', label: 'Zarchiwizowane' },
]

function statusLabel(s: string) {
    const map: Record<string, string> = { Pending: 'Oczekujące', Published: 'Opublikowane', Rejected: 'Odrzucone', Archived: 'Zarchiwizowane' }
    return map[s] ?? s
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedFetch() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { page.value = 1; fetchEvents() }, 400)
}

async function setFilter(f: string) {
    statusFilter.value = f
    page.value = 1
    await fetchEvents()
}

async function goPage(p: number) {
    page.value = p
    await fetchEvents()
}

async function fetchEvents() {
    loading.value = true
    try {
        const params: Record<string, any> = { page: page.value, pageSize }
        if (search.value) params.search = search.value
        if (statusFilter.value !== 'all') params.status = statusFilter.value
        const r = await adminGetEvents(params)
        events.value = r.items
        totalCount.value = r.totalCount
    } catch { events.value = [] } finally { loading.value = false }
}

async function changeStatus(e: AdminEvent, status: string) {
    actionLoading.value = e.id
    try {
        if (status === 'Published') await publishEvent(e.id)
        else if (status === 'Rejected') await rejectEvent(e.id)
        else if (status === 'Archived') await archiveEvent(e.id)
        e.status = status
    } catch {} finally { actionLoading.value = null }
}

function confirmDelete(id: number) { deleteId.value = id }

async function doDelete() {
    if (deleteId.value === null) return
    actionLoading.value = deleteId.value
    try {
        await deleteEvent(deleteId.value)
        events.value = events.value.filter(e => e.id !== deleteId.value)
        totalCount.value--
        deleteId.value = null
    } catch {} finally { actionLoading.value = null }
}

onMounted(fetchEvents)
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }

.events-table {
    overflow-x: auto;
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid $border; white-space: nowrap; }
    td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13px; color: $text-muted; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-id { color: $text-dim; font-size: 12px; }
.td-org { font-size: 12px; }
.td-city { font-size: 12px; color: $text-dim; }
.td-date { font-size: 12px; color: $text-dim; white-space: nowrap; }

.event-cell { display: flex; align-items: center; gap: 10px; }
.event-thumb { width: 60px; height: 40px; object-fit: cover; border-radius: $r-sm; flex-shrink: 0; }
.event-name { font-size: 13px; font-weight: 600; color: $text; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-short { font-size: 11px; color: $text-dim; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.status-badge {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
    &.status-pending { background: rgba(255,152,0,0.1); color: #ff9800; border: 1px solid rgba(255,152,0,0.2); }
    &.status-published { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
    &.status-rejected { background: rgba(220,50,50,0.1); color: #e55; border: 1px solid rgba(220,50,50,0.2); }
    &.status-archived { background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border; }
}

.action-row { display: flex; gap: 5px; }

.btn-action {
    display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600;
    padding: 5px 9px; border-radius: $r-sm; cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid transparent; transition: opacity 0.2s;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.btn-approve { background: rgba(76,175,80,0.1); color: #4caf50; border-color: rgba(76,175,80,0.2); &:hover:not(:disabled) { background: rgba(76,175,80,0.18); } }
.btn-reject  { background: rgba(220,50,50,0.09); color: #e55; border-color: rgba(220,50,50,0.2); &:hover:not(:disabled) { background: rgba(220,50,50,0.18); } }
.btn-archive { background: rgba(255,255,255,0.05); color: $text-muted; border-color: $border; &:hover:not(:disabled) { background: rgba(255,255,255,0.09); } }
.btn-delete  { background: rgba(220,50,50,0.09); color: #e55; border-color: rgba(220,50,50,0.2); &:hover:not(:disabled) { background: rgba(220,50,50,0.18); } }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.confirm-modal { background: #0e0e0e; border: 1px solid $border; border-radius: $r-lg; padding: 32px 28px; width: 100%; max-width: 360px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.del-icon { color: rgba(#e55, 0.7); }
.confirm-modal h3 { font-size: 18px; font-weight: 800; color: $text; margin: 0; }
.confirm-modal p { font-size: 13px; color: $text-dim; margin: 0; }
.confirm-actions { display: flex; gap: 10px; width: 100%; margin-top: 4px; }
.btn-cancel { flex: 1; background: transparent; border: 1px solid $border; border-radius: $r-sm; color: $text-muted; font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif; padding: 10px; cursor: pointer; &:hover { border-color: $text-dim; color: $text; } }
.btn-delete-confirm { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(220,50,50,0.15); border: 1px solid rgba(#e55,0.35); border-radius: $r-sm; color: #e55; font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif; padding: 10px; cursor: pointer; &:hover:not(:disabled) { background: rgba(220,50,50,0.25); } &:disabled { opacity: 0.45; cursor: not-allowed; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
