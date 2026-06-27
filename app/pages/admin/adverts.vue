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
                <NuxtLink to="/admin/adverts" class="nav-item active"><v-icon icon="mdi-car-outline" size="17" />Ogłoszenia</NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <NuxtLink to="/admin/taxonomy" class="nav-item"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Ogłoszenia</h1>
                <span class="topbar-count">{{ totalCount.toLocaleString('pl') }} ogłoszeń</span>
            </div>

            <div class="toolbar">
                <div class="search-bar">
                    <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                    <input v-model="search" class="sb-input" placeholder="Szukaj ogłoszeń..." @input="debouncedFetch" />
                </div>
                <div class="filter-tabs">
                    <button v-for="f in advertFilters" :key="f.key" class="filter-tab" :class="{ active: statusFilter === f.key }" @click="setFilter(f.key)">{{ f.label }}</button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />Ładowanie ogłoszeń...
            </div>

            <template v-else>
                <div v-if="adverts.length" class="adverts-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ogłoszenie</th>
                                <th>Cena</th>
                                <th>Sprzedawca</th>
                                <th>Wyświetlenia</th>
                                <th>Dodano</th>
                                <th>Status</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in adverts" :key="a.id">
                                <td class="td-id">#{{ a.id }}</td>
                                <td>
                                    <div class="advert-cell">
                                        <img :src="getImageUrl(a.mainImageUrl)" class="advert-thumb" :alt="a.title" loading="lazy" />
                                        <div>
                                            <div class="advert-title">{{ a.title }}</div>
                                            <div class="advert-meta">{{ a.brand ?? '' }} {{ a.model ?? '' }} {{ a.year ?? '' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="td-price">{{ Number(a.price).toLocaleString('pl') }} zł</td>
                                <td class="td-seller">{{ a.ownerName ?? a.sellerName ?? '—' }}</td>
                                <td class="td-center">{{ a.viewCount ?? 0 }}</td>
                                <td class="td-date">{{ formatDate(a.createdAt) }}</td>
                                <td>
                                    <span v-if="a.badge" class="badge-tag badge-promo">{{ a.badge }}</span>
                                    <span class="status-badge" :class="a.isHidden ? 'status-hidden' : (a.isActive ? 'status-active' : 'status-inactive')">
                                        {{ a.isHidden ? 'Ukryte' : (a.isActive ? 'Aktywne' : 'Wygasłe') }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-row">
                                        <NuxtLink :to="`/advert/${a.id}`" class="btn-action btn-view" target="_blank">
                                            <v-icon icon="mdi-eye-outline" size="13" />
                                        </NuxtLink>
                                        <button class="btn-action" :class="a.isHidden ? 'btn-show' : 'btn-hide'"
                                            :disabled="actionLoading === a.id"
                                            @click="toggleHide(a)">
                                            <v-icon v-if="actionLoading === a.id" icon="mdi-loading" size="12" class="spin" />
                                            <v-icon v-else :icon="a.isHidden ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" size="12" />
                                            {{ a.isHidden ? 'Pokaż' : 'Ukryj' }}
                                        </button>
                                        <button class="btn-action btn-delete" :disabled="actionLoading === a.id" @click="confirmDelete(a.id)">
                                            <v-icon icon="mdi-delete-outline" size="12" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state">
                    <v-icon icon="mdi-car-off" size="40" class="empty-icon" />
                    <p>Brak ogłoszeń spełniających kryteria.</p>
                </div>

                <div v-if="totalCount > pageSize" class="pagination">
                    <button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)"><v-icon icon="mdi-chevron-left" size="18" /></button>
                    <span class="page-info">{{ page }} / {{ totalPages }}</span>
                    <button class="page-btn" :disabled="page === totalPages" @click="goPage(page + 1)"><v-icon icon="mdi-chevron-right" size="18" /></button>
                </div>
            </template>
        </main>

        <!-- Delete confirm -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="deleteId !== null" class="modal-backdrop" @click.self="deleteId = null">
                    <div class="confirm-modal">
                        <v-icon icon="mdi-delete-alert-outline" size="36" class="del-icon" />
                        <h3>Usuń ogłoszenie</h3>
                        <p>Tej operacji nie można cofnąć.</p>
                        <div class="confirm-actions">
                            <button class="btn-cancel" @click="deleteId = null">Anuluj</button>
                            <button class="btn-delete-confirm" :disabled="actionLoading !== null" @click="doDelete">
                                <v-icon v-if="actionLoading !== null" icon="mdi-loading" size="14" class="spin" />
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
import type { AdminAdvert } from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { getImageUrl, placeholder } = useImageUrl()

const adverts = ref<AdminAdvert[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const pageSize = 25
const totalCount = ref(0)
const actionLoading = ref<number | null>(null)
const deleteId = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

const advertFilters = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'active', label: 'Aktywne' },
    { key: 'hidden', label: 'Ukryte' },
    { key: 'expired', label: 'Wygasłe' },
]

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedFetch() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { page.value = 1; fetchAdverts() }, 400)
}

async function setFilter(f: string) {
    statusFilter.value = f
    page.value = 1
    await fetchAdverts()
}

async function goPage(p: number) {
    page.value = p
    await fetchAdverts()
}

async function fetchAdverts() {
    loading.value = true
    try {
        const query: Record<string, any> = { page: page.value, pageSize }
        if (search.value) query.search = search.value
        if (statusFilter.value === 'active') { query.isActive = true; query.isHidden = false }
        else if (statusFilter.value === 'hidden') { query.isHidden = true }
        else if (statusFilter.value === 'expired') { query.isActive = false; query.isHidden = false }
        const r = await $fetch<{ items: AdminAdvert[]; totalCount: number }>('/api/proxy/api/Admin/adverts', { query })
        adverts.value = r.items
        totalCount.value = r.totalCount
    } catch { adverts.value = [] } finally { loading.value = false }
}

async function toggleHide(a: AdminAdvert) {
    actionLoading.value = a.id
    try {
        const endpoint = a.isHidden ? 'unhide' : 'hide'
        await $fetch(`/api/proxy/api/Admin/adverts/${a.id}/${endpoint}`, { method: 'POST', body: {} })
        a.isHidden = !a.isHidden
    } catch {} finally { actionLoading.value = null }
}

function confirmDelete(id: number) { deleteId.value = id }

async function doDelete() {
    if (deleteId.value === null) return
    actionLoading.value = deleteId.value
    try {
        await $fetch(`/api/proxy/api/Admin/adverts/${deleteId.value}`, { method: 'DELETE' })
        adverts.value = adverts.value.filter(a => a.id !== deleteId.value)
        totalCount.value--
        deleteId.value = null
    } catch {} finally { actionLoading.value = null }
}

onMounted(fetchAdverts)
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }

.adverts-table {
    overflow-x: auto;
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid $border; white-space: nowrap; }
    td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13px; color: $text-muted; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-id { color: $text-dim; font-size: 12px; }
.td-price { font-weight: 700; color: $text; }
.td-seller { font-size: 12px; }
.td-center { text-align: center; }
.td-date { font-size: 12px; color: $text-dim; white-space: nowrap; }

.advert-cell { display: flex; align-items: center; gap: 10px; }
.advert-thumb { width: 60px; height: 40px; object-fit: cover; border-radius: $r-sm; flex-shrink: 0; }
.advert-title { font-size: 13px; font-weight: 600; color: $text; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.advert-meta { font-size: 11px; color: $text-dim; }

.badge-tag {
    font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-right: 4px; letter-spacing: 0.3px;
    &.badge-promo { background: rgba(245,166,35,0.12); color: #f5a623; border: 1px solid rgba(245,166,35,0.25); }
}

.status-badge {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
    &.status-active { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
    &.status-hidden { background: rgba(255,152,0,0.1); color: #ff9800; border: 1px solid rgba(255,152,0,0.2); }
    &.status-inactive { background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border; }
}

.action-row { display: flex; gap: 5px; }

.btn-action {
    display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600;
    padding: 5px 9px; border-radius: $r-sm; cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid transparent; transition: opacity 0.2s; text-decoration: none;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.btn-view { background: rgba(255,255,255,0.05); color: $text-muted; border-color: $border; &:hover { background: rgba(255,255,255,0.09); color: $text; } }
.btn-hide { background: rgba(255,152,0,0.09); color: #ff9800; border-color: rgba(255,152,0,0.2); &:hover:not(:disabled) { background: rgba(255,152,0,0.16); } }
.btn-show { background: rgba(76,175,80,0.09); color: #4caf50; border-color: rgba(76,175,80,0.2); &:hover:not(:disabled) { background: rgba(76,175,80,0.16); } }
.btn-delete { background: rgba(220,50,50,0.09); color: #e55; border-color: rgba(220,50,50,0.2); &:hover:not(:disabled) { background: rgba(220,50,50,0.18); } }

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
