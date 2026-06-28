<template>
    <div class="admin-page">
        <aside class="admin-sidebar">
            <div class="sidebar-brand">
                <v-icon icon="mdi-shield-crown" size="20" class="brand-icon" />
                Panel Administratora
            </div>
            <nav class="sidebar-nav">
                <NuxtLink to="/admin" class="nav-item"><v-icon icon="mdi-view-dashboard-outline" size="17" />Podsumowanie</NuxtLink>
                <NuxtLink to="/admin/reports" class="nav-item active"><v-icon icon="mdi-flag-outline" size="17" />Zgłoszenia</NuxtLink>
                <NuxtLink to="/admin/users" class="nav-item"><v-icon icon="mdi-account-group-outline" size="17" />Użytkownicy</NuxtLink>
                <NuxtLink to="/admin/adverts" class="nav-item"><v-icon icon="mdi-car-outline" size="17" />Ogłoszenia</NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <NuxtLink to="/admin/taxonomy" class="nav-item"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Zgłoszenia</h1>
                <div class="topbar-actions">
                    <div class="filter-tabs">
                        <button v-for="f in filters" :key="f.key" class="filter-tab" :class="{ active: activeFilter === f.key }" @click="setFilter(f.key)">
                            {{ f.label }}
                            <span v-if="activeFilter === f.key && totalCount" class="filter-count">{{ totalCount }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />
                Ładowanie zgłoszeń...
            </div>

            <div v-else-if="error" class="error-state">
                <v-icon icon="mdi-alert-circle-outline" size="32" class="error-icon" />
                <p>{{ error }}</p>
            </div>

            <template v-else>
                <div class="search-bar">
                    <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                    <input v-model="search" class="sb-input" placeholder="Szukaj zgłoszeń..." @input="debouncedSearch" />
                </div>

                <div v-if="reports.length" class="reports-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Typ</th>
                                <th>Powód</th>
                                <th>Zgłoszone przez</th>
                                <th>Cel</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in filteredReports" :key="r.id">
                                <td class="td-id">#{{ r.id }}</td>
                                <td>
                                    <span class="type-badge" :class="`type-${r.targetType?.toLowerCase()}`">
                                        {{ r.targetType ?? '—' }}
                                    </span>
                                </td>
                                <td class="td-reason">{{ r.reason }}</td>
                                <td>{{ r.reportedByName ?? '—' }}</td>
                                <td>
                                    <NuxtLink v-if="r.targetAdvertId" :to="`/advert/${r.targetAdvertId}`" class="target-link">
                                        Ogłoszenie #{{ r.targetAdvertId }}
                                    </NuxtLink>
                                    <span v-else-if="r.targetUserId">Użytkownik #{{ r.targetUserId }}</span>
                                    <span v-else>—</span>
                                </td>
                                <td class="td-date">{{ formatDate(r.reportedAt) }}</td>
                                <td>
                                    <span class="status-badge" :class="`status-${r.status?.toLowerCase()}`">
                                        {{ statusLabel(r.status) }}
                                    </span>
                                </td>
                                <td>
                                    <div v-if="r.status === 'Pending'" class="action-row">
                                        <button class="btn-action btn-resolve" :disabled="actionLoading === r.id" @click="resolveReport(r.id)">
                                            <v-icon icon="mdi-check" size="14" />Rozwiąż
                                        </button>
                                        <button class="btn-action btn-dismiss" :disabled="actionLoading === r.id" @click="rejectReport(r.id)">
                                            <v-icon icon="mdi-close" size="14" />Odrzuć
                                        </button>
                                    </div>
                                    <span v-else class="resolved-text">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state">
                    <v-icon icon="mdi-flag-off-outline" size="40" class="empty-icon" />
                    <p>Brak zgłoszeń w tej kategorii.</p>
                </div>

                <div v-if="totalCount > pageSize" class="pagination">
                    <button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)">
                        <v-icon icon="mdi-chevron-left" size="18" />
                    </button>
                    <span class="page-info">{{ page }} / {{ totalPages }}</span>
                    <button class="page-btn" :disabled="page === totalPages" @click="goPage(page + 1)">
                        <v-icon icon="mdi-chevron-right" size="18" />
                    </button>
                </div>
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

import type { AdminReport } from '~/types'

const { getReports, resolveReport: resolveReportApi, rejectReport: rejectReportApi } = useAdmin()
const { error: toastError, success: toastSuccess } = useToast()

const reports = ref<AdminReport[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const activeFilter = ref('Pending')
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const actionLoading = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

const filters = [
    { key: 'Pending', label: 'Oczekujące' },
    { key: 'Resolved', label: 'Rozwiązane' },
    { key: 'Rejected', label: 'Odrzucone' },
    { key: 'all', label: 'Wszystkie' },
]

const filteredReports = computed(() => reports.value)

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedSearch() {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
    searchDebounceTimer = setTimeout(() => { page.value = 1; fetchReports() }, 400)
}

function statusLabel(s: string) {
    const map: Record<string, string> = { Pending: 'Oczekujące', Resolved: 'Rozwiązane', Rejected: 'Odrzucone' }
    return map[s] ?? s
}

function formatDate(d: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function fetchReports() {
    loading.value = true
    error.value = ''
    try {
        const raw = await $fetch<any>('/api/proxy/api/Admin/reports', {
            query: {
                page: page.value,
                pageSize,
                status: activeFilter.value === 'all' ? undefined : activeFilter.value,
                search: search.value || undefined
            }
        })
        let items: AdminReport[] = []
        let count = 0
        if (Array.isArray(raw)) {
            items = raw; count = raw.length
        } else if (Array.isArray(raw?.items)) {
            items = raw.items; count = raw.totalCount ?? raw.total ?? raw.items.length
        } else if (Array.isArray(raw?.data)) {
            items = raw.data; count = raw.totalCount ?? raw.total ?? raw.data.length
        } else if (Array.isArray(raw?.reports)) {
            items = raw.reports; count = raw.totalCount ?? raw.total ?? raw.reports.length
        } else if (raw && typeof raw === 'object') {
            const arrKey = Object.keys(raw).find(k => Array.isArray((raw as any)[k]))
            if (arrKey) {
                items = (raw as any)[arrKey]
                count = raw.totalCount ?? raw.total ?? raw.totalRecords ?? items.length
            }
        }
        reports.value = items
        totalCount.value = count
    } catch (e: any) {
        error.value = e?.data?.message ?? e?.data?.title ?? e?.message ?? 'Błąd podczas ładowania zgłoszeń.'
        reports.value = []
        totalCount.value = 0
    } finally { loading.value = false }
}

async function resolveReport(id: number) {
    actionLoading.value = id
    try {
        await resolveReportApi(id)
        const r = reports.value.find(x => x.id === id)
        if (r) r.status = 'Resolved'
        toastSuccess('Zgłoszenie zostało rozwiązane.')
    } catch (e: any) {
        toastError(e?.data?.message || 'Nie udało się rozwiązać zgłoszenia.')
    } finally { actionLoading.value = null }
}

async function rejectReport(id: number) {
    actionLoading.value = id
    try {
        await rejectReportApi(id)
        const r = reports.value.find(x => x.id === id)
        if (r) r.status = 'Rejected'
        toastSuccess('Zgłoszenie zostało odrzucone.')
    } catch (e: any) {
        toastError(e?.data?.message || 'Nie udało się odrzucić zgłoszenia.')
    } finally { actionLoading.value = null }
}

async function setFilter(f: string) {
    activeFilter.value = f
    page.value = 1
    await fetchReports()
}

async function goPage(p: number) {
    page.value = p
    await fetchReports()
}

onMounted(fetchReports)
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.reports-table {
    overflow-x: auto;
    table { width: 100%; border-collapse: collapse; }
    th {
        text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700;
        color: $text-dim; text-transform: uppercase; letter-spacing: 0.4px;
        border-bottom: 1px solid $border; white-space: nowrap;
    }
    td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13px; color: $text-muted; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-id { color: $text-dim; font-size: 12px; }
.td-reason { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-date { font-size: 12px; color: $text-dim; white-space: nowrap; }

.type-badge {
    font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px; letter-spacing: 0.3px;
    &.type-advert { background: rgba($red, 0.12); color: $red; border: 1px solid rgba($red, 0.25); }
    &.type-user { background: rgba(33,150,243,0.12); color: #2196f3; border: 1px solid rgba(33,150,243,0.25); }
    &.type-review { background: rgba(255,152,0,0.12); color: #ff9800; border: 1px solid rgba(255,152,0,0.25); }
}

.status-badge {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
    &.status-pending { background: rgba(255,152,0,0.1); color: #ff9800; border: 1px solid rgba(255,152,0,0.25); }
    &.status-resolved { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
    &.status-rejected { background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border; }
    &.status-dismissed { background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border; }
}

.target-link { color: $red; text-decoration: none; font-size: 12px; font-weight: 500; &:hover { opacity: 0.8; } }

.action-row { display: flex; gap: 6px; }

.btn-action {
    display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    padding: 5px 10px; border-radius: $r-sm; cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid transparent; transition: opacity 0.2s;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.btn-resolve { background: rgba(76,175,80,0.12); color: #4caf50; border-color: rgba(76,175,80,0.25); &:hover:not(:disabled) { background: rgba(76,175,80,0.2); } }
.btn-dismiss { background: rgba(255,255,255,0.05); color: $text-dim; border-color: $border; &:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: $text-muted; } }

.resolved-text { color: $text-dark; font-size: 12px; }

.error-state {
    text-align: center;
    padding: 60px 20px;
    color: $red;
    font-size: 14px;
}
.error-icon { color: $red; display: block; margin: 0 auto 12px; }
</style>
