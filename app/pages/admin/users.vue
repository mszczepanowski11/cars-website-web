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
                <NuxtLink to="/admin/users" class="nav-item active"><v-icon icon="mdi-account-group-outline" size="17" />Użytkownicy</NuxtLink>
                <NuxtLink to="/admin/adverts" class="nav-item"><v-icon icon="mdi-car-outline" size="17" />Ogłoszenia</NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <NuxtLink to="/admin/taxonomy" class="nav-item"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Użytkownicy</h1>
                <span class="topbar-count">{{ totalCount.toLocaleString('pl') }} kont</span>
            </div>

            <!-- Search + filter -->
            <div class="toolbar">
                <div class="search-bar">
                    <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                    <input v-model="search" class="sb-input" placeholder="Szukaj użytkownika..." @input="debouncedFetch" />
                </div>
                <div class="filter-tabs">
                    <button v-for="f in userFilters" :key="f.key" class="filter-tab" :class="{ active: typeFilter === f.key }" @click="setTypeFilter(f.key)">
                        {{ f.label }}
                    </button>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />
                Ładowanie użytkowników...
            </div>

            <template v-else>
                <div v-if="users.length" class="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Użytkownik</th>
                                <th>E-mail</th>
                                <th>Typ konta</th>
                                <th>Ogłoszenia</th>
                                <th>Dołączył</th>
                                <th>Status</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id">
                                <td class="td-id">#{{ u.id }}</td>
                                <td>
                                    <div class="user-cell">
                                        <div class="user-avatar">{{ u.name?.[0] ?? '?' }}</div>
                                        <div>
                                            <div class="user-name">{{ u.name }} {{ u.surname }}</div>
                                            <div v-if="u.companyName" class="user-company">{{ u.companyName }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="td-email">{{ u.email }}</td>
                                <td>
                                    <span class="type-badge" :class="u.accountType === 'Business' ? 'type-dealer' : 'type-personal'">
                                        {{ u.accountType === 'Business' ? 'Dealer' : 'Prywatny' }}
                                    </span>
                                </td>
                                <td class="td-center">{{ u.advertCount ?? 0 }}</td>
                                <td class="td-date">{{ u.createdAt ? formatDate(u.createdAt) : '—' }}</td>
                                <td>
                                    <span class="status-badge" :class="u.isBlocked ? 'status-blocked' : 'status-active'">
                                        {{ u.isBlocked ? 'Zablokowany' : 'Aktywny' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-row">
                                        <button class="btn-action" :class="u.isBlocked ? 'btn-unblock' : 'btn-block'"
                                            :disabled="actionLoading === u.id"
                                            @click="toggleBlock(u)">
                                            <v-icon v-if="actionLoading === u.id" icon="mdi-loading" size="13" class="spin" />
                                            <v-icon v-else :icon="u.isBlocked ? 'mdi-lock-open-outline' : 'mdi-lock-outline'" size="13" />
                                            {{ u.isBlocked ? 'Odblokuj' : 'Zablokuj' }}
                                        </button>
                                        <button v-if="!u.isAdmin" class="btn-action btn-delete"
                                            :disabled="actionLoading === u.id"
                                            @click="deleteUser(u)">
                                            <v-icon icon="mdi-delete-outline" size="13" />
                                            Usuń
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state">
                    <v-icon icon="mdi-account-off-outline" size="40" class="empty-icon" />
                    <p>Brak użytkowników spełniających kryteria.</p>
                </div>

                <div v-if="totalCount > pageSize" class="pagination">
                    <button class="page-btn" :disabled="page === 1" @click="goPage(page - 1)"><v-icon icon="mdi-chevron-left" size="18" /></button>
                    <span class="page-info">{{ page }} / {{ totalPages }}</span>
                    <button class="page-btn" :disabled="page === totalPages" @click="goPage(page + 1)"><v-icon icon="mdi-chevron-right" size="18" /></button>
                </div>
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/types'

definePageMeta({ middleware: 'admin' })

const users = ref<AdminUser[]>([])
const loading = ref(true)
const search = ref('')
const typeFilter = ref('all')
const page = ref(1)
const pageSize = 25
const totalCount = ref(0)
const actionLoading = ref<number | null>(null)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize) || 1)

const userFilters = [
    { key: 'all', label: 'Wszyscy' },
    { key: 'Personal', label: 'Prywatni' },
    { key: 'Business', label: 'Dealerzy' },
    { key: 'blocked', label: 'Zablokowani' },
]

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedFetch() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { page.value = 1; fetchUsers() }, 400)
}

async function setTypeFilter(f: string) {
    typeFilter.value = f
    page.value = 1
    await fetchUsers()
}

async function goPage(p: number) {
    page.value = p
    await fetchUsers()
}

async function fetchUsers() {
    loading.value = true
    try {
        const query: Record<string, any> = { page: page.value, pageSize }
        if (search.value) query.search = search.value
        if (typeFilter.value === 'blocked') query.isBlocked = true
        else if (typeFilter.value !== 'all') query.accountType = typeFilter.value
        const r = await $fetch<{ items: AdminUser[]; totalCount: number }>('/api/proxy/api/Admin/users', { query })
        users.value = r.items
        totalCount.value = r.totalCount
    } catch { users.value = [] } finally { loading.value = false }
}

async function toggleBlock(u: AdminUser) {
    actionLoading.value = u.id
    try {
        if (u.isBlocked) {
            await $fetch(`/api/proxy/api/Admin/users/${u.id}/unblock`, { method: 'POST', body: {} })
            u.isBlocked = false
        } else {
            await $fetch(`/api/proxy/api/Admin/users/${u.id}/block`, { method: 'POST', body: {} })
            u.isBlocked = true
        }
    } catch {} finally { actionLoading.value = null }
}

async function deleteUser(u: AdminUser) {
    if (!confirm(`Czy na pewno chcesz usunąć konto ${u.name} ${u.surname} (${u.email})? Tej operacji nie można cofnąć.`)) return
    actionLoading.value = u.id
    try {
        await $fetch(`/api/proxy/api/Admin/users/${u.id}`, { method: 'DELETE', body: { note: 'Usunięte przez administratora' } })
        users.value = users.value.filter(x => x.id !== u.id)
        totalCount.value--
    } catch {} finally { actionLoading.value = null }
}

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.toolbar { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }

.users-table {
    overflow-x: auto;
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid $border; white-space: nowrap; }
    td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13px; color: $text-muted; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-id { color: $text-dim; font-size: 12px; }
.td-email { font-size: 12px; color: $text-dim; }
.td-date { font-size: 12px; color: $text-dim; white-space: nowrap; }
.td-center { text-align: center; }

.user-cell { display: flex; align-items: center; gap: 10px; }

.user-avatar {
    width: 32px; height: 32px; border-radius: 50%; background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.25); color: $red; font-weight: 700; font-size: 13px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.user-name { font-size: 13px; font-weight: 600; color: $text; }
.user-company { font-size: 11px; color: $text-dim; }

.type-badge {
    font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px;
    &.type-dealer { background: rgba($red, 0.12); color: $red; border: 1px solid rgba($red, 0.25); }
    &.type-personal { background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border; }
}

.status-badge {
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
    &.status-active { background: rgba(76,175,80,0.1); color: #4caf50; border: 1px solid rgba(76,175,80,0.2); }
    &.status-blocked { background: rgba(220,50,50,0.1); color: #e55; border: 1px solid rgba(220,50,50,0.2); }
}

.action-row { display: flex; gap: 6px; }

.btn-action {
    display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    padding: 5px 10px; border-radius: $r-sm; cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid transparent; transition: opacity 0.2s;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.btn-block { background: rgba(220,50,50,0.1); color: #e55; border-color: rgba(220,50,50,0.25); &:hover:not(:disabled) { background: rgba(220,50,50,0.2); } }
.btn-unblock { background: rgba(76,175,80,0.1); color: #4caf50; border-color: rgba(76,175,80,0.2); &:hover:not(:disabled) { background: rgba(76,175,80,0.18); } }
.btn-delete { background: rgba(220,50,50,0.06); color: rgba(229,85,85,0.7); border-color: rgba(220,50,50,0.15); &:hover:not(:disabled) { background: rgba(220,50,50,0.18); color: #e55; border-color: rgba(220,50,50,0.35); } }
</style>
