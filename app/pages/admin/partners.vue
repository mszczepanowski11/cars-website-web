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
                <NuxtLink to="/admin/directory" class="nav-item"><v-icon icon="mdi-domain" size="17" />Katalog firm</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Partnerzy API (import XML/CSV)</h1>
                <p class="page-sub">Firmy z własnym oprogramowaniem dealerskim mogą wysyłać swoje ogłoszenia bezpośrednio na CARIZO — nie tylko auta, ale dowolną kategorię (części, maszyny, przyczepy, opony...), każda pozycja w feedzie sama wskazuje kategorię. Każdy partner dostaje klucz API i wysyła feed na <code>POST /api/partner/adverts/import?format=xml|csv</code> z nagłówkiem <code>X-Api-Key</code>.</p>
            </div>

            <div class="signup-section">
                <div class="signup-header">
                    <h2 class="signup-title">Zgłoszenia z formularza "Dla firm"</h2>
                    <span v-if="pendingSignups.length" class="signup-count">{{ pendingSignups.length }}</span>
                </div>
                <div v-if="signupsLoading" class="loading-state"><v-icon icon="mdi-loading" size="22" class="spin" />Ładowanie...</div>
                <div v-else-if="!pendingSignups.length" class="td-dim">Brak oczekujących zgłoszeń.</div>
                <div v-else class="signup-list">
                    <div v-for="s in pendingSignups" :key="s.id" class="signup-card">
                        <div class="signup-card-main">
                            <div class="signup-card-name">{{ s.companyName }}</div>
                            <div class="td-dim">{{ s.email }} · {{ s.phone }}</div>
                            <div v-if="s.websiteUrl" class="td-dim">{{ s.websiteUrl }}</div>
                            <div v-if="s.feedUrl" class="signup-feed">
                                <v-icon icon="mdi-file-code-outline" size="13" />
                                {{ s.feedUrl }}
                                <span v-if="s.detectedItemCount != null" class="signup-count-inline">({{ s.detectedItemCount }} ogłoszeń, {{ s.format }})</span>
                            </div>
                            <div v-else class="td-dim">Brak podanego linku do feedu — kontakt manualny.</div>
                            <div class="td-dim">Zgłoszono: {{ formatDate(s.createdAt) }}</div>
                        </div>
                        <div class="signup-card-actions">
                            <button class="btn-confirm" :disabled="signupActionId === s.id" @click="approveSignup(s)">
                                <v-icon v-if="signupActionId === s.id" icon="mdi-loading" size="13" class="spin" />
                                Zatwierdź
                            </button>
                            <button class="btn-cancel" :disabled="signupActionId === s.id" @click="rejectSignup(s)">Odrzuć</button>
                        </div>
                    </div>
                </div>
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
                <div class="afc-title">{{ editingId ? `Edytuj partnera #${editingId}` : 'Nowy partner' }}</div>
                <div class="afc-fields">
                    <input v-model="form.companyName" class="afc-input" placeholder="Nazwa firmy" />
                    <input v-model="form.contactEmail" class="afc-input" placeholder="E-mail kontaktowy" />
                </div>
                <template v-if="!editingId">
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
                </template>
                <div class="afc-section-label">Pull-feed (opcjonalnie) — dla partnerów bez własnego oprogramowania wysyłającego, synchronizowany automatycznie co 6h</div>
                <div class="afc-fields">
                    <input v-model="form.feedUrl" class="afc-input afc-input--wide" placeholder="https://partner.pl/export/feed.xml" />
                </div>
                <div class="afc-fields">
                    <select v-model="form.feedFormat" class="afc-input afc-select">
                        <option :value="null">Format nieznany / brak feedu</option>
                        <option value="Xml">XML</option>
                        <option value="Csv">CSV</option>
                    </select>
                    <label class="afc-checkbox">
                        <input type="checkbox" v-model="form.autoSyncEnabled" />
                        Automatyczna synchronizacja co 6h
                    </label>
                </div>
                <div class="afc-actions">
                    <button class="btn-confirm" :disabled="!canSave || saving" @click="saveForm">
                        <v-icon v-if="saving" icon="mdi-loading" size="13" class="spin" />
                        {{ editingId ? 'Zapisz zmiany' : 'Utwórz partnera' }}
                    </button>
                    <button class="btn-cancel" @click="closeForm">Anuluj</button>
                </div>
            </div>

            <div v-if="loading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
            <div v-else-if="partners.length" class="feat-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Firma</th><th>Kontakt</th><th>Konto</th><th>Feed</th><th>Ostatni import</th><th>Aktywny</th><th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="p in partners" :key="p.id">
                            <tr>
                                <td class="td-id">#{{ p.id }}</td>
                                <td class="td-name">{{ p.companyName }}</td>
                                <td class="td-dim">{{ p.contactEmail }}</td>
                                <td class="td-dim">{{ p.linkedUserEmail }}</td>
                                <td class="td-dim">
                                    <span v-if="!p.feedUrl" class="td-dim">— (push-only)</span>
                                    <template v-else>
                                        <span class="feed-badge" :class="{ 'feed-badge--off': !p.autoSyncEnabled }" :title="p.feedUrl">
                                            <v-icon icon="mdi-sync" size="12" />{{ p.feedFormat }}{{ p.autoSyncEnabled ? '' : ' (wyłączony)' }}
                                        </span>
                                        <span v-if="p.consecutiveSyncFailures > 0" class="health-badge" :title="p.lastSyncError ?? ''">
                                            <v-icon icon="mdi-alert-circle-outline" size="12" />{{ p.consecutiveSyncFailures }}× nieudana synchronizacja
                                        </span>
                                    </template>
                                </td>
                                <td class="td-dim">{{ p.lastImportAt ? formatDate(p.lastImportAt) : '—' }}</td>
                                <td><input type="checkbox" :checked="p.isActive" @change="toggleActive(p, $event)" /></td>
                                <td>
                                    <button class="btn-action" @click="openEditForm(p)"><v-icon icon="mdi-pencil-outline" size="13" />Edytuj</button>
                                    <button v-if="p.feedUrl" class="btn-action" :disabled="syncingId === p.id" @click="syncNow(p)">
                                        <v-icon :icon="syncingId === p.id ? 'mdi-loading' : 'mdi-cloud-sync-outline'" size="13" :class="{ spin: syncingId === p.id }" />Synchronizuj teraz
                                    </button>
                                    <button class="btn-action" @click="regenerateKey(p)"><v-icon icon="mdi-key-outline" size="13" />Nowy klucz</button>
                                    <button class="btn-action" @click="toggleLogs(p)"><v-icon icon="mdi-history" size="13" />Historia</button>
                                    <button class="btn-action" @click="toggleMapping(p)"><v-icon icon="mdi-transit-connection-variant" size="13" />Mapowanie</button>
                                    <button class="btn-action btn-delete" @click="deletePartner(p)"><v-icon icon="mdi-delete-outline" size="13" />Usuń</button>
                                </td>
                            </tr>
                            <tr v-if="expandedLogs === p.id">
                                <td colspan="8" class="logs-cell">
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
                            <tr v-if="expandedMapping === p.id">
                                <td colspan="8" class="logs-cell">
                                    <div v-if="!mappingByPartner[p.id]" class="td-dim">Ładowanie mapowań...</div>
                                    <div v-else class="mapping-panel">
                                        <p class="mapping-hint">
                                            Jeśli feed partnera używa własnych nazw pól/kategorii (np. „CenaNetto" zamiast „Price",
                                            „Osobowe" zamiast „auta-osobowe"), zmapuj je tutaj zamiast pisać nowy kod importu.
                                            Puste pole = użyj domyślnej nazwy CARIZO.
                                        </p>

                                        <div class="mapping-section-title">Mapowanie pól (nazwa elementu XML / kolumny CSV)</div>
                                        <div class="mapping-rows">
                                            <div v-for="row in mappingByPartner[p.id].fields" :key="row.ourField" class="mapping-row">
                                                <span class="mapping-our-field">{{ row.ourField }}</span>
                                                <input v-model="row.sourcePath" class="afc-input" :placeholder="`domyślnie: ${row.ourField}`" />
                                            </div>
                                        </div>

                                        <div class="mapping-section-title">Mapowanie wartości (kategoria / marka / paliwo / skrzynia / stan)</div>
                                        <div class="mapping-rows">
                                            <div v-for="(row, idx) in mappingByPartner[p.id].values" :key="idx" class="mapping-row mapping-row--value">
                                                <select v-model="row.field" class="afc-input afc-select">
                                                    <option v-for="f in valueFieldOptions" :key="f" :value="f">{{ f }}</option>
                                                </select>
                                                <input v-model="row.externalValue" class="afc-input" placeholder="wartość partnera, np. Osobowe" />
                                                <v-icon icon="mdi-arrow-right" size="14" />
                                                <input v-model="row.internalValue" class="afc-input" placeholder="wartość CARIZO, np. auta-osobowe" />
                                                <button class="btn-action btn-delete" @click="mappingByPartner[p.id].values.splice(idx, 1)"><v-icon icon="mdi-close" size="13" /></button>
                                            </div>
                                            <button class="btn-action" @click="mappingByPartner[p.id].values.push({ field: 'Category', externalValue: '', internalValue: '' })">
                                                <v-icon icon="mdi-plus" size="13" />Dodaj mapowanie wartości
                                            </button>
                                        </div>

                                        <div class="afc-actions" style="margin-top: 14px;">
                                            <button class="btn-confirm" :disabled="savingMapping" @click="saveMapping(p)">
                                                <v-icon v-if="savingMapping" icon="mdi-loading" size="13" class="spin" />
                                                Zapisz mapowania
                                            </button>
                                        </div>
                                    </div>
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
    feedUrl: string | null
    feedFormat: string | null
    autoSyncEnabled: boolean
    consecutiveSyncFailures: number
    lastSyncError: string | null
    lastSyncAttemptAt: string | null
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

interface FieldMappingRow { ourField: string; sourcePath: string }
interface ValueMappingRow { field: string; externalValue: string; internalValue: string }
interface PartnerMappings { fields: FieldMappingRow[]; values: ValueMappingRow[] }

// Must match PartnerFieldMapping.FieldNames / PartnerValueMapping.FieldNames on the backend.
const MAPPABLE_FIELDS = [
    'ExternalId', 'Title', 'Description', 'Price', 'Category', 'VehicleSubtype',
    'Brand', 'Model', 'Year', 'Mileage', 'FuelType', 'Gearbox', 'PowerHP', 'Vin',
    'City', 'Region', 'Condition', 'PartCategory', 'PartSubcategory', 'CatalogNumber',
    'OemNumber', 'PartManufacturer', 'Compatibility', 'AxleCount', 'Payload',
    'CargoLength', 'CargoHeight', 'Volume', 'OperatingWeightKg', 'WorkingWidthCm',
    'MaxDiggingDepthM', 'BucketCapacityL', 'TankCapacityL',
]
const valueFieldOptions = ['Category', 'Brand', 'FuelType', 'Gearbox', 'Condition']

interface SignupRequest {
    id: number
    companyName: string
    email: string
    phone: string
    websiteUrl: string | null
    feedUrl: string | null
    format: string | null
    detectedItemCount: number | null
    status: string
    createdAt: string
}

const partners = ref<Partner[]>([])
const loading = ref(true)
const pendingSignups = ref<SignupRequest[]>([])
const signupsLoading = ref(true)
const signupActionId = ref<number | null>(null)
const showForm = ref(false)
const saving = ref(false)
const newApiKey = ref('')
const userSearch = ref('')
const userResults = ref<{ id: number; email: string }[]>([])
const selectedUserEmail = ref('')
const expandedLogs = ref<number | null>(null)
const logsByPartner = reactive<Record<number, ImportLog[]>>({})
const editingId = ref<number | null>(null)
const syncingId = ref<number | null>(null)
const expandedMapping = ref<number | null>(null)
const mappingByPartner = reactive<Record<number, PartnerMappings>>({})
const savingMapping = ref(false)

const form = reactive({
    companyName: '', contactEmail: '', linkedUserId: null as number | null,
    feedUrl: '', feedFormat: null as string | null, autoSyncEnabled: true,
})
const canSave = computed(() => !!form.companyName && !!form.contactEmail && (editingId.value !== null || !!form.linkedUserId))

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

async function loadSignupRequests() {
    signupsLoading.value = true
    try {
        pendingSignups.value = await $fetch<SignupRequest[]>('/api/proxy/api/admin/partners/signup-requests', {
            query: { status: 'Pending' },
        })
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować zgłoszeń.')
        pendingSignups.value = []
    } finally { signupsLoading.value = false }
}

async function approveSignup(s: SignupRequest) {
    if (!confirm(`Zatwierdzić zgłoszenie "${s.companyName}"? Utworzy to konto firmowe i uruchomi pierwszy import.`)) return
    signupActionId.value = s.id
    try {
        const result = await $fetch<{ apiKey: string; importedItemsCreated: number | null; importedItemsFailed: number | null }>(
            `/api/proxy/api/admin/partners/signup-requests/${s.id}/approve`,
            { method: 'POST' }
        )
        pendingSignups.value = pendingSignups.value.filter(x => x.id !== s.id)
        newApiKey.value = result.apiKey
        const importNote = result.importedItemsCreated != null
            ? ` Zaimportowano ${result.importedItemsCreated} ogłoszeń (błędy: ${result.importedItemsFailed ?? 0}).`
            : ''
        toastSuccess(`Partner "${s.companyName}" zatwierdzony.${importNote}`)
        await loadPartners()
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zatwierdzić zgłoszenia.')
    } finally { signupActionId.value = null }
}

async function rejectSignup(s: SignupRequest) {
    const reason = prompt(`Powód odrzucenia zgłoszenia "${s.companyName}" (opcjonalnie):`) ?? undefined
    signupActionId.value = s.id
    try {
        await $fetch(`/api/proxy/api/admin/partners/signup-requests/${s.id}/reject`, {
            method: 'POST',
            body: { reason },
        })
        pendingSignups.value = pendingSignups.value.filter(x => x.id !== s.id)
        toastSuccess(`Zgłoszenie "${s.companyName}" odrzucone.`)
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się odrzucić zgłoszenia.')
    } finally { signupActionId.value = null }
}

function openCreateForm() {
    editingId.value = null
    form.companyName = ''
    form.contactEmail = ''
    form.linkedUserId = null
    form.feedUrl = ''
    form.feedFormat = null
    form.autoSyncEnabled = true
    userSearch.value = ''
    userResults.value = []
    selectedUserEmail.value = ''
    showForm.value = true
}
function openEditForm(p: Partner) {
    editingId.value = p.id
    form.companyName = p.companyName
    form.contactEmail = p.contactEmail
    form.linkedUserId = p.linkedUserId
    form.feedUrl = p.feedUrl ?? ''
    form.feedFormat = p.feedFormat
    form.autoSyncEnabled = p.autoSyncEnabled
    showForm.value = true
}
function closeForm() { showForm.value = false; editingId.value = null }

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
        if (editingId.value !== null) {
            const current = partners.value.find(x => x.id === editingId.value)
            await $fetch(`/api/proxy/api/admin/partners/${editingId.value}`, {
                method: 'PUT',
                body: {
                    companyName: form.companyName, contactEmail: form.contactEmail,
                    isActive: current?.isActive ?? true,
                    feedUrl: form.feedUrl || null, feedFormat: form.feedUrl ? form.feedFormat : null,
                    autoSyncEnabled: form.autoSyncEnabled,
                },
            })
            await loadPartners()
            closeForm()
            toastSuccess('Zmiany zapisane.')
        } else {
            const resp = await $fetch<{ partnerId: number; apiKey: string }>('/api/proxy/api/admin/partners', {
                method: 'POST',
                body: {
                    companyName: form.companyName, contactEmail: form.contactEmail, linkedUserId: form.linkedUserId,
                    feedUrl: form.feedUrl || null, feedFormat: form.feedUrl ? form.feedFormat : null,
                    autoSyncEnabled: form.autoSyncEnabled,
                },
            })
            newApiKey.value = resp.apiKey
            await loadPartners()
            closeForm()
            toastSuccess('Partner został utworzony.')
        }
    } catch (e: any) {
        toastError(e?.data?.message ?? (editingId.value !== null ? 'Nie udało się zapisać zmian.' : 'Nie udało się utworzyć partnera.'))
    } finally { saving.value = false }
}

async function toggleActive(p: Partner, event: Event) {
    const checked = (event.target as HTMLInputElement).checked
    try {
        // Sends the partner's full current state, not just isActive - UpdatePartnerDto also
        // carries feedUrl/feedFormat/autoSyncEnabled, and a partial body would silently reset
        // those to their DTO defaults (null feed, autoSync on) on every activate/deactivate.
        await $fetch(`/api/proxy/api/admin/partners/${p.id}`, {
            method: 'PUT',
            body: {
                companyName: p.companyName, contactEmail: p.contactEmail, isActive: checked,
                feedUrl: p.feedUrl, feedFormat: p.feedFormat, autoSyncEnabled: p.autoSyncEnabled,
            },
        })
        p.isActive = checked
        toastSuccess(`Partner "${p.companyName}" ${checked ? 'aktywowany' : 'dezaktywowany'}.`)
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zmienić statusu.')
    }
}

async function syncNow(p: Partner) {
    syncingId.value = p.id
    try {
        const log = await $fetch<ImportLog>(`/api/proxy/api/admin/partners/${p.id}/sync-now`, { method: 'POST' })
        toastSuccess(`Synchronizacja "${p.companyName}": ${log.itemsCreated} utworzonych, ${log.itemsUpdated} zaktualizowanych, ${log.itemsFailed} błędów.`)
        await loadPartners()
        if (expandedLogs.value === p.id) {
            logsByPartner[p.id] = await $fetch<ImportLog[]>(`/api/proxy/api/admin/partners/${p.id}/import-logs`)
        }
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Synchronizacja nie powiodła się.')
    } finally { syncingId.value = null }
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

async function toggleMapping(p: Partner) {
    if (expandedMapping.value === p.id) { expandedMapping.value = null; return }
    expandedMapping.value = p.id
    if (!mappingByPartner[p.id]) {
        try {
            const [fields, values] = await Promise.all([
                $fetch<{ ourField: string; sourcePath: string }[]>(`/api/proxy/api/admin/partners/${p.id}/field-mappings`),
                $fetch<{ field: string; externalValue: string; internalValue: string }[]>(`/api/proxy/api/admin/partners/${p.id}/value-mappings`),
            ])
            const bySource = new Map(fields.map(f => [f.ourField, f.sourcePath]))
            mappingByPartner[p.id] = {
                fields: MAPPABLE_FIELDS.map(ourField => ({ ourField, sourcePath: bySource.get(ourField) ?? '' })),
                values: values.map(v => ({ ...v })),
            }
        } catch (e: any) {
            toastError(e?.data?.message ?? 'Nie udało się załadować mapowań.')
            expandedMapping.value = null
        }
    }
}

async function saveMapping(p: Partner) {
    const m = mappingByPartner[p.id]
    if (!m) return
    savingMapping.value = true
    try {
        await $fetch(`/api/proxy/api/admin/partners/${p.id}/field-mappings`, {
            method: 'PUT',
            body: m.fields.filter(f => f.sourcePath.trim()).map(f => ({ ourField: f.ourField, sourcePath: f.sourcePath.trim() })),
        })
        await $fetch(`/api/proxy/api/admin/partners/${p.id}/value-mappings`, {
            method: 'PUT',
            body: m.values.filter(v => v.externalValue.trim() && v.internalValue.trim())
                .map(v => ({ field: v.field, externalValue: v.externalValue.trim(), internalValue: v.internalValue.trim() })),
        })
        toastSuccess('Mapowania zapisane.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zapisać mapowań.')
    } finally { savingMapping.value = false }
}

async function copyKey() {
    try {
        await navigator.clipboard.writeText(newApiKey.value)
        toastSuccess('Skopiowano do schowka.')
    } catch { /* clipboard API unavailable — user can still select/copy the text manually */ }
}

onMounted(() => {
    loadPartners()
    loadSignupRequests()
})
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.page-sub { font-size: 13px; color: $text-dim; margin: 4px 0 0; max-width: 720px; line-height: 1.6; }
.page-sub code { background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; font-size: 12px; }

.signup-section { margin-bottom: 24px; }
.signup-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.signup-title { font-size: 15px; font-weight: 700; color: $text; margin: 0; }
.signup-count {
    background: $red; color: white; font-size: 11px; font-weight: 700;
    border-radius: 10px; padding: 2px 8px; min-width: 18px; text-align: center;
}
.signup-list { display: flex; flex-direction: column; gap: 10px; }
.signup-card {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    background: #0d0d0d; border: 1px solid rgba($red, 0.2); border-radius: $r-md;
    padding: 14px 18px; flex-wrap: wrap;
}
.signup-card-main { flex: 1; min-width: 240px; }
.signup-card-name { font-size: 14px; font-weight: 700; color: $text; margin-bottom: 4px; }
.signup-feed {
    display: flex; align-items: center; gap: 6px; font-size: 12px; color: $text-muted;
    margin: 2px 0; word-break: break-all;
}
.signup-count-inline { color: $red; font-weight: 600; white-space: nowrap; }
.signup-card-actions { display: flex; gap: 8px; flex-shrink: 0; }

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
.afc-section-label { font-size: 11px; font-weight: 600; color: $text-dim; text-transform: uppercase; letter-spacing: 0.3px; margin: 14px 0 8px; }
.afc-select { flex: 0 0 auto; min-width: 220px; cursor: pointer; }
.afc-checkbox { display: flex; align-items: center; gap: 6px; font-size: 12px; color: $text-muted; cursor: pointer; }
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

.feed-badge {
    display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    color: #5bc07a; text-transform: uppercase; letter-spacing: 0.3px; cursor: help;
    &--off { color: $text-dim; }
}
.health-badge {
    display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    color: $red; margin-top: 3px; cursor: help;
}

.mapping-panel { padding: 4px 0; }
.mapping-hint { font-size: 12px; color: $text-dim; line-height: 1.6; margin: 0 0 16px; max-width: 720px; }
.mapping-section-title { font-size: 11px; font-weight: 700; color: $text-dim; text-transform: uppercase; letter-spacing: 0.3px; margin: 0 0 8px; }
.mapping-rows { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.mapping-row {
    display: grid; grid-template-columns: 140px 1fr; gap: 10px; align-items: center;
    &--value { display: flex; grid-template-columns: unset; }
}
.mapping-our-field { font-size: 12px; color: $text-muted; font-family: monospace; }
.mapping-row--value .afc-input { flex: 1; min-width: 140px; }
.mapping-row--value select.afc-select { flex: 0 0 130px; min-width: 130px; }

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
