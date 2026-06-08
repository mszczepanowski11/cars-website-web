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
                            <span v-if="f.count" class="filter-count">{{ f.count }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />
                Ładowanie zgłoszeń...
            </div>

            <template v-else>
                <div class="search-bar">
                    <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                    <input v-model="search" class="sb-input" placeholder="Szukaj zgłoszeń..." />
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
                                        <button class="btn-action btn-resolve" :disabled="actionLoading === r.id" @click="resolveReport(r.id, 'Resolved')">
                                            <v-icon icon="mdi-check" size="14" />Rozwiąż
                                        </button>
                                        <button class="btn-action btn-dismiss" :disabled="actionLoading === r.id" @click="resolveReport(r.id, 'Dismissed')">
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
definePageMeta({ middleware: 'auth' })

import type { AdminReport } from '~/types'
type Report = AdminReport & { targetId?: number | null }

const reports = ref<AdminReport[]>([])
const loading = ref(true)
const search = ref('')
const activeFilter = ref('Pending')
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const actionLoading = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

const filters = computed(() => [
    { key: 'Pending', label: 'Oczekujące', count: reports.value.filter(r => r.status === 'Pending').length },
    { key: 'Resolved', label: 'Rozwiązane', count: 0 },
    { key: 'Dismissed', label: 'Odrzucone', count: 0 },
    { key: 'all', label: 'Wszystkie', count: 0 },
])

const filteredReports = computed(() => {
    let list = reports.value
    if (activeFilter.value !== 'all') list = list.filter(r => r.status === activeFilter.value)
    if (search.value) {
        const q = search.value.toLowerCase()
        list = list.filter(r => r.reason?.toLowerCase().includes(q) || r.reportedByName?.toLowerCase().includes(q) || String(r.id).includes(q))
    }
    return list
})

function statusLabel(s: string) {
    const map: Record<string, string> = { Pending: 'Oczekujące', Resolved: 'Rozwiązane', Dismissed: 'Odrzucone' }
    return map[s] ?? s
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function fetchReports() {
    loading.value = true
    try {
        const r = await $fetch<{ items: AdminReport[]; totalCount: number }>('/api/proxy/api/Admin/Report', {
            query: { page: page.value, pageSize, status: activeFilter.value === 'all' ? undefined : activeFilter.value }
        })
        reports.value = r.items
        totalCount.value = r.totalCount
    } catch { reports.value = [] } finally { loading.value = false }
}

async function resolveReport(id: number, status: 'Resolved' | 'Dismissed') {
    actionLoading.value = id
    try {
        await $fetch(`/api/proxy/api/Admin/Report/${id}`, { method: 'PUT', body: { status } })
        const r = reports.value.find(x => x.id === id)
        if (r) r.status = status as any
    } catch {} finally { actionLoading.value = null }
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
</style>
