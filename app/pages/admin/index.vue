<template>
    <div class="admin-page">
        <aside class="admin-sidebar">
            <div class="sidebar-brand">
                <v-icon icon="mdi-shield-crown" size="20" class="brand-icon" />
                Panel Administratora
            </div>
            <nav class="sidebar-nav">
                <NuxtLink to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
                    <v-icon icon="mdi-view-dashboard-outline" size="17" />
                    Podsumowanie
                </NuxtLink>
                <NuxtLink to="/admin/reports" class="nav-item" :class="{ active: route.path === '/admin/reports' }">
                    <v-icon icon="mdi-flag-outline" size="17" />
                    Zgłoszenia
                    <span v-if="stats?.pendingReports" class="nav-badge">{{ stats.pendingReports }}</span>
                </NuxtLink>
                <NuxtLink to="/admin/users" class="nav-item" :class="{ active: route.path === '/admin/users' }">
                    <v-icon icon="mdi-account-group-outline" size="17" />
                    Użytkownicy
                </NuxtLink>
                <NuxtLink to="/admin/adverts" class="nav-item" :class="{ active: route.path === '/admin/adverts' }">
                    <v-icon icon="mdi-car-outline" size="17" />
                    Ogłoszenia
                </NuxtLink>
                <NuxtLink to="/admin/events" class="nav-item" :class="{ active: route.path === '/admin/events' }">
                    <v-icon icon="mdi-calendar-star" size="17" />
                    Wydarzenia
                </NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item">
                    <v-icon icon="mdi-arrow-left" size="17" />
                    Wróć do panelu
                </NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Podsumowanie</h1>
            </div>

            <div v-if="loading" class="loading-state">
                <v-icon icon="mdi-loading" size="32" class="spin" />
                Ładowanie danych...
            </div>

            <template v-else>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-top">
                            <div class="stat-icon-wrap green">
                                <v-icon icon="mdi-car-outline" size="20" />
                            </div>
                            <span class="stat-label">Aktywne ogłoszenia</span>
                        </div>
                        <div class="stat-num">{{ stats?.totalActiveAdverts ?? 0 }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-top">
                            <div class="stat-icon-wrap blue">
                                <v-icon icon="mdi-account-group-outline" size="20" />
                            </div>
                            <span class="stat-label">Użytkownicy</span>
                        </div>
                        <div class="stat-num">{{ stats?.totalUsers ?? 0 }}</div>
                        <div class="stat-sub">{{ stats?.blockedUsers ?? 0 }} zablokowanych</div>
                    </div>
                    <div class="stat-card alert">
                        <div class="stat-top">
                            <div class="stat-icon-wrap red">
                                <v-icon icon="mdi-flag-outline" size="20" />
                            </div>
                            <span class="stat-label">Zgłoszenia</span>
                        </div>
                        <div class="stat-num">{{ stats?.totalReports ?? 0 }}</div>
                        <div class="stat-sub red">{{ stats?.pendingReports ?? 0 }} oczekujących</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-top">
                            <div class="stat-icon-wrap orange">
                                <v-icon icon="mdi-account-plus-outline" size="20" />
                            </div>
                            <span class="stat-label">Nowe rejestracje</span>
                        </div>
                        <div class="stat-num">{{ stats?.newRegistrationsThisMonth ?? 0 }}</div>
                        <div class="stat-sub">w tym miesiącu</div>
                    </div>
                </div>

                <div class="section-header">
                    <h2 class="section-title">Historia działań administratora</h2>
                </div>

                <div class="logs-table-wrap">
                    <table class="logs-table" v-if="logs.length">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Administrator</th>
                                <th>Akcja</th>
                                <th>Cel</th>
                                <th>Notatka</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="log in logs" :key="log.id">
                                <td class="log-date">{{ formatDate(log.performedAt) }}</td>
                                <td class="log-admin">{{ log.adminName }}</td>
                                <td><span class="action-chip" :class="actionClass(log.actionType)">{{ actionLabel(log.actionType) }}</span></td>
                                <td class="log-target">
                                    <NuxtLink v-if="log.targetAdvertId" :to="`/advert/${log.targetAdvertId}`" class="target-link">
                                        Ogłoszenie #{{ log.targetAdvertId }}
                                    </NuxtLink>
                                    <span v-else-if="log.targetUserId">Użytkownik #{{ log.targetUserId }}</span>
                                    <span v-else-if="log.reportId">Zgłoszenie #{{ log.reportId }}</span>
                                    <span v-else class="text-dim">—</span>
                                </td>
                                <td class="log-note">{{ log.note || '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="empty-state">
                        <v-icon icon="mdi-history" size="32" class="empty-icon" />
                        <p>Brak historii działań.</p>
                    </div>
                </div>
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
import type { AdminStats, AdminActionLog } from '~/types'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { getStats, getLogs } = useAdmin()

const stats = ref<AdminStats | null>(null)
const logs = ref<AdminActionLog[]>([])
const loading = ref(true)

onMounted(async () => {
    try {
        ;[stats.value, logs.value] = await Promise.all([
            getStats(),
            getLogs({ page: 1, pageSize: 30 })
        ])
    } catch {}
    finally { loading.value = false }
})

function formatDate(d: string) {
    return new Date(d).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })
}

function actionLabel(type: string) {
    const map: Record<string, string> = {
        HideAdvert: 'Ukryto ogłoszenie',
        UnhideAdvert: 'Odkryto ogłoszenie',
        DeleteAdvert: 'Usunięto ogłoszenie',
        BlockUser: 'Zablokowano użytkownika',
        UnblockUser: 'Odblokowano użytkownika',
        ResolveReport: 'Rozpatrzono zgłoszenie',
        RejectReport: 'Odrzucono zgłoszenie',
        EditAdvert: 'Edytowano ogłoszenie',
        ActivateAdvert: 'Aktywowano ogłoszenie',
        DeactivateAdvert: 'Dezaktywowano ogłoszenie',
    }
    return map[type] ?? type
}

function actionClass(type: string) {
    if (['DeleteAdvert', 'BlockUser'].includes(type)) return 'chip-danger'
    if (['HideAdvert', 'DeactivateAdvert'].includes(type)) return 'chip-warning'
    if (['ResolveReport', 'UnblockUser', 'ActivateAdvert', 'UnhideAdvert'].includes(type)) return 'chip-success'
    return 'chip-neutral'
}
</script>

<style lang="scss" scoped>
.admin-page {
    display: flex;
    min-height: 100vh;
    background: $bg;
    padding-top: $nav-height;
}

.admin-sidebar {
    width: 220px;
    min-width: 220px;
    background: #070707;
    border-right: 1px solid $border;
    position: sticky;
    top: $nav-height;
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 18px 12px;
    font-size: 13px;
    font-weight: 800;
    color: $text;
    border-bottom: 1px solid $border;
}

.brand-icon { color: $red; }

.sidebar-nav { flex: 1; padding: 12px 0; }

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    position: relative;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }
    &.active {
        background: rgba($red, 0.1);
        color: $text;
        border-left: 2px solid $red;
        padding-left: 16px;
    }
}

.nav-badge {
    margin-left: auto;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 20px;
}

.nav-divider { height: 1px; background: $border; margin: 8px 0; }

.admin-main {
    flex: 1;
    min-width: 0;
    padding: 28px;
}

.admin-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.page-title {
    font-size: 22px;
    font-weight: 900;
    color: $text;
}

.loading-state {
    display: flex;
    align-items: center;
    gap: 12px;
    color: $text-dim;
    font-size: 14px;
    padding: 60px 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 32px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: border-color 0.2s;
    &:hover { border-color: rgba($red, 0.2); }
    &.alert { border-color: rgba($red, 0.15); }
}

.stat-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
}

.stat-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.green { background: rgba(76,175,80,0.12); color: #4caf50; }
    &.blue { background: rgba(33,150,243,0.12); color: #2196f3; }
    &.red { background: rgba($red, 0.12); color: $red; }
    &.orange { background: rgba(255,152,0,0.12); color: #ff9800; }
}

.stat-label { font-size: 12px; color: $text-dim; font-weight: 500; }

.stat-num {
    font-size: 32px;
    font-weight: 900;
    color: $text;
    line-height: 1;
}

.stat-sub {
    font-size: 11px;
    color: $text-dark;
    &.red { color: $red; }
}

.section-header { margin-bottom: 14px; }

.section-title {
    font-size: 15px;
    font-weight: 700;
    color: $text;
}

.logs-table-wrap {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
}

.logs-table {
    width: 100%;
    border-collapse: collapse;

    th {
        padding: 11px 14px;
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        color: $text-dim;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: rgba(255,255,255,0.02);
        border-bottom: 1px solid $border;
    }

    td {
        padding: 11px 14px;
        font-size: 13px;
        color: $text-muted;
        border-bottom: 1px solid rgba($border, 0.5);
        vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.log-date { color: $text-dim; font-size: 12px; white-space: nowrap; }
.log-admin { color: $text; font-weight: 500; }
.log-target { font-size: 12px; }
.log-note { color: $text-dim; font-size: 12px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.target-link {
    color: $red;
    text-decoration: none;
    &:hover { text-decoration: underline; }
}

.text-dim { color: $text-dark; }

.action-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;

    &.chip-danger { background: rgba(220,50,50,0.12); color: #e55; }
    &.chip-warning { background: rgba(255,152,0,0.12); color: #ff9800; }
    &.chip-success { background: rgba(76,175,80,0.12); color: #4caf50; }
    &.chip-neutral { background: rgba(255,255,255,0.06); color: $text-muted; }
}

.empty-state {
    text-align: center;
    padding: 50px 20px;
    color: $text-dim;
    font-size: 14px;
}

.empty-icon { color: $border; display: block; margin: 0 auto 12px; }

.spin { animation: spin 1s linear infinite; }

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>