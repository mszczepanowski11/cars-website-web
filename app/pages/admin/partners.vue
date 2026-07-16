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
                <NuxtLink to="/admin/events" class="nav-item"><v-icon icon="mdi-calendar-star" size="17" />Wydarzenia</NuxtLink>
                <NuxtLink to="/admin/taxonomy" class="nav-item"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <NuxtLink to="/admin/vehicle-data" class="nav-item"><v-icon icon="mdi-car-cog" size="17" />Marki i modele</NuxtLink>
                <NuxtLink to="/admin/attributes" class="nav-item"><v-icon icon="mdi-form-select" size="17" />Pola kategorii</NuxtLink>
                <NuxtLink to="/admin/partners" class="nav-item active"><v-icon icon="mdi-handshake-outline" size="17" />Partnerzy API</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Partnerzy API (import XML/CSV)</h1>
                <p class="page-sub">Firmy z własnym oprogramowaniem dealerskim mogą wysyłać swoje ogłoszenia bezpośrednio na CARIZO. Każdy partner dostaje klucz API i wysyła feed na <code>POST /api/partner/adverts/import?format=xml|csv</code> z nagłówkiem <code>X-Api-Key</code>.</p>
            </div>

            <div class="toolbar">
                <button class="btn-add" @click="openCreateForm">
                    <v-icon icon="mdi-plus" size="15" /> Dodaj partnera
                </button>
            </div>

            <div v-if="newApiKey" class="key-banner">
                <v-icon icon="mdi-key-alert-outline" size="20" />
                <div class="key-banner-body">
                    <div class="key-banner-title">Klucz API — zapisz go teraz, nie zostanie pokazany ponownie</div>
                    <code class="key-value">{{ newApiKey }}</code>
                </div>
                <button class="btn-cancel" @click="copyKey">Kopiuj</button>
                <button class="btn-cancel" @click="newApiKey = ''">Zamknij</button>
            </div>

            <div v-if="showForm" class="add-form-card">
                <div class="afc-title">Nowy partner</div>
                <div class="afc-fields">
                    <input v-model="form.companyName" class="afc-input" placeholder="Nazwa firmy" />
                    <input v-model="form.contactEmail" class="afc-input" placeholder="E-mail kontaktowy" />
                </div>
                <div class="afc-fields">
                    <input v-model="userSearch" class="afc-input afc-input--wide" placeholder="Szukaj konta firmowego po e-mailu..." @input="debouncedUserSearch" />
                </div>
                <div v-if="userResults.length" class="user-results">
                    <div v-for="u in userResults" :key="u.id" class="user-result"
                         :class="{ selected: form.linkedUserId === u.id }" @click="selectUser(u)">
                        {{ u.email }} <span class="td-dim">#{{ u.id }}</span>
                    </div>
                </div>
                <div v-if="form.linkedUserId" class="selected-user">
                    Powiązane konto: <strong>{{ selectedUserEmail }}</strong> (#{{ form.linkedUserId }})
                </div>
                <div class="afc-actions">
                    <button class="btn-confirm" :disabled="!canSave || saving" @click="saveForm">
                        <v-icon v-if="saving" icon="mdi-loading" size="13" class="spin" />
                        Utwórz partnera
                    </button>
                    <button class="btn-cancel" @click="closeForm">Anuluj</button>
                </div>
            </div>

            <div v-if="loading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
            <div v-else-if="partners.length" class="feat-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Firma</th><th>Kontakt</th><th>Konto</th><th>Ostatni import</th><th>Aktywny</th><th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="p in partners" :key="p.id">
                            <tr>
                                <td class="td-id">#{{ p.id }}</td>
                                <td class="td-name">{{ p.companyName }}</td>
                                <td class="td-dim">{{ p.contactEmail }}</td>
                                <td class="td-dim">{{ p.linkedUserEmail }}</td>
                                <td class="td-dim">{{ p.lastImportAt ? formatDate(p.lastImportAt) : '—' }}</td>
                                <td><input type="checkbox" :checked="p.isActive" @change="toggleActive(p, $event)" /></td>
                                <td>
                                    <button class="btn-action" @click="regenerateKey(p)"><v-icon icon="mdi-key-outline" size="13" />Nowy klucz</button>
                                    <button class="btn-action" @click="toggleLogs(p)"><v-icon icon="mdi-history" size="13" />Historia</button>
                                    <button class="btn-action btn-delete" @click="deletePartner(p)"><v-icon icon="mdi-delete-outline" size="13" />Usuń</button>
                                </td>
                            </tr>
                            <tr v-if="expandedLogs === p.id">
                                <td colspan="7" class="logs-cell">
                                    <div v-if="!logsByPartner[p.id]" class="td-dim">Ładowanie historii...</div>
                                    <div v-else-if="!logsByPartner[p.id].length" class="td-dim">Brak importów.</div>
                                    <table v-else class="logs-table">
                                        <thead>
                                            <tr><th>Data</th><th>Format</th><th>Łącznie</th><th>Utworzone</th><th>Zaktualizowane</th><th>Błędy</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="l in logsByPartner[p.id]" :key="l.id">
                                                <td class="td-dim">{{ formatDate(l.startedAt) }}</td>
                                                <td class="td-dim">{{ l.format }}</td>
                                                <td class="td-dim">{{ l.itemsTotal }}</td>
                                                <td class="td-dim">{{ l.itemsCreated }}</td>
                                                <td class="td-dim">{{ l.itemsUpdated }}</td>
                                                <td class="td-dim">{{ l.itemsFailed }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
            <div v-else class="empty-state"><v-icon icon="mdi-handshake-outline" size="36" class="empty-icon" />Brak partnerów.</div>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { error: toastError, success: toastSuccess } = useToast()

interface Partner {
    id: number
    companyName: string
    contactEmail: string
    linkedUserId: number
    linkedUserEmail: string
    isActive: boolean
    createdAt: string
    lastImportAt: string | null
}
interface ImportLog {
    id: number
    format: string
    startedAt: string
    itemsTotal: number
    itemsCreated: number
    itemsUpdated: number
    itemsFailed: number
}

const partners = ref<Partner[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const newApiKey = ref('')
const userSearch = ref('')
const userResults = ref<{ id: number; email: string }[]>([])
const selectedUserEmail = ref('')
const expandedLogs = ref<number | null>(null)
const logsByPartner = reactive<Record<number, ImportLog[]>>({})

const form = reactive({ companyName: '', contactEmail: '', linkedUserId: null as number | null })
const canSave = computed(() => !!form.companyName && !!form.contactEmail && !!form.linkedUserId)

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function loadPartners() {
    loading.value = true
    try {
        partners.value = await $fetch<Partner[]>('/api/proxy/api/admin/partners')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować partnerów.')
        partners.value = []
    } finally { loading.value = false }
}

function openCreateForm() {
    form.companyName = ''
    form.contactEmail = ''
    form.linkedUserId = null
    userSearch.value = ''
    userResults.value = []
    selectedUserEmail.value = ''
    showForm.value = true
}
function closeForm() { showForm.value = false }

let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedUserSearch() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(searchUsers, 350)
}

async function searchUsers() {
    if (!userSearch.value.trim()) { userResults.value = []; return }
    try {
        const r = await $fetch<{ items: { id: number; email: string }[] }>('/api/proxy/api/Admin/users', {
            query: { search: userSearch.value, accountType: 'Business', pageSize: 10 },
        })
        userResults.value = r.items
    } catch { userResults.value = [] }
}

function selectUser(u: { id: number; email: string }) {
    form.linkedUserId = u.id
    selectedUserEmail.value = u.email
    userResults.value = []
    userSearch.value = ''
}

async function saveForm() {
    if (!canSave.value) return
    saving.value = true
    try {
        const resp = await $fetch<{ partnerId: number; apiKey: string }>('/api/proxy/api/admin/partners', {
            method: 'POST',
            body: { companyName: form.companyName, contactEmail: form.contactEmail, linkedUserId: form.linkedUserId },
        })
        newApiKey.value = resp.apiKey
        await loadPartners()
        closeForm()
        toastSuccess('Partner został utworzony.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się utworzyć partnera.')
    } finally { saving.value = false }
}

async function toggleActive(p: Partner, event: Event) {
    const checked = (event.target as HTMLInputElement).checked
    try {
        await $fetch(`/api/proxy/api/admin/partners/${p.id}`, {
            method: 'PUT',
            body: { companyName: p.companyName, contactEmail: p.contactEmail, isActive: checked },
        })
        p.isActive = checked
        toastSuccess(`Partner "${p.companyName}" ${checked ? 'aktywowany' : 'dezaktywowany'}.`)
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zmienić statusu.')
    }
}

async function regenerateKey(p: Partner) {
    if (!confirm(`Wygenerować nowy klucz API dla "${p.companyName}"? Stary klucz przestanie działać natychmiast.`)) return
    try {
        const resp = await $fetch<{ apiKey: string }>(`/api/proxy/api/admin/partners/${p.id}/regenerate-key`, { method: 'POST' })
        newApiKey.value = resp.apiKey
        toastSuccess('Nowy klucz API wygenerowany.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się wygenerować klucza.')
    }
}

async function deletePartner(p: Partner) {
    if (!confirm(`Usunąć partnera "${p.companyName}"? Jego ogłoszenia pozostaną, ale integracja przestanie działać.`)) return
    try {
        await $fetch(`/api/proxy/api/admin/partners/${p.id}`, { method: 'DELETE' })
        partners.value = partners.value.filter(x => x.id !== p.id)
        toastSuccess('Partner został usunięty.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się usunąć partnera.')
    }
}

async function toggleLogs(p: Partner) {
    if (expandedLogs.value === p.id) { expandedLogs.value = null; return }
    expandedLogs.value = p.id
    if (!logsByPartner[p.id]) {
        try {
            logsByPartner[p.id] = await $fetch<ImportLog[]>(`/api/proxy/api/admin/partners/${p.id}/import-logs`)
        } catch {
            logsByPartner[p.id] = []
        }
    }
}

async function copyKey() {
    try {
        await navigator.clipboard.writeText(newApiKey.value)
        toastSuccess('Skopiowano do schowka.')
    } catch { /* clipboard API unavailable — user can still select/copy the text manually */ }
}

onMounted(loadPartners)
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.page-sub { font-size: 13px; color: $text-dim; margin: 4px 0 0; max-width: 720px; line-height: 1.6; }
.page-sub code { background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; font-size: 12px; }

.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }

.btn-add {
    display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: $r-sm;
    background: rgba($red, 0.12); border: 1px solid rgba($red, 0.25); color: $red;
    font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;
    &:hover { background: rgba($red, 0.2); }
}

.key-banner {
    display: flex; align-items: center; gap: 14px; background: rgba(230, 180, 30, 0.08);
    border: 1px solid rgba(230, 180, 30, 0.3); border-radius: $r-md; padding: 14px 18px; margin-bottom: 18px;
    color: #e6b41e;
}
.key-banner-body { flex: 1; }
.key-banner-title { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
.key-value { font-size: 13px; background: #0d0d0d; padding: 6px 10px; border-radius: 5px; display: inline-block; color: $text; word-break: break-all; }

.add-form-card {
    background: #0d0d0d; border: 1px solid rgba($red, 0.2); border-radius: $r-md;
    padding: 16px 20px; margin-bottom: 18px;
}
.afc-title { font-size: 13px; font-weight: 700; color: $text; margin-bottom: 12px; }
.afc-fields { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
.afc-input {
    flex: 1; min-width: 180px; background: #080808; border: 1px solid $border; border-radius: $r-sm;
    color: $text; font-size: 13px; padding: 8px 12px; outline: none; font-family: 'Inter', sans-serif;
    &:focus { border-color: rgba($red, 0.4); }
    &--wide { min-width: 100%; }
}
.user-results { margin-bottom: 10px; border: 1px solid $border; border-radius: $r-sm; overflow: hidden; }
.user-result {
    padding: 8px 12px; font-size: 13px; color: $text-muted; cursor: pointer;
    &:hover { background: rgba(255,255,255,0.04); }
    &.selected { background: rgba($red, 0.12); color: $text; }
}
.selected-user { font-size: 12px; color: $text-dim; margin-bottom: 10px; }
.afc-actions { display: flex; gap: 10px; }
.btn-confirm {
    display: flex; align-items: center; gap: 5px; padding: 8px 16px;
    background: $red; border: none; border-radius: $r-sm; color: white;
    font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { opacity: 0.88; }
}
.btn-cancel {
    padding: 8px 14px; background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-dim; font-size: 12px; cursor: pointer; font-family: 'Inter', sans-serif;
    &:hover { border-color: rgba(255,255,255,0.2); color: $text-muted; }
}

.feat-table {
    overflow-x: auto;
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid $border; white-space: nowrap; }
    td { padding: 11px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13px; color: $text-muted; white-space: nowrap; }
    tr:hover td { background: rgba(255,255,255,0.02); }
}

.td-id { color: $text-dim; font-size: 12px; }
.td-name { color: $text; font-weight: 500; }
.td-dim { font-size: 12px; color: $text-dim; }

.logs-cell { background: #0a0a0a; white-space: normal; }
.logs-table {
    width: 100%; border-collapse: collapse;
    th { font-size: 10px; padding: 6px 10px; color: $text-dim; text-transform: uppercase; }
    td { font-size: 12px; padding: 6px 10px; }
}

.btn-action {
    display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    padding: 5px 10px; border-radius: $r-sm; cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid $border; background: transparent; color: $text-dim; margin-right: 6px;
    transition: opacity 0.2s;
    &:hover { border-color: rgba(255,255,255,0.2); color: $text-muted; }
}
.btn-delete {
    background: rgba(220,50,50,0.06); color: rgba(229,85,85,0.7); border-color: rgba(220,50,50,0.15);
    &:hover { background: rgba(220,50,50,0.18); color: #e55; border-color: rgba(220,50,50,0.35); }
}
</style>
