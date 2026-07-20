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
                <NuxtLink to="/admin/attributes" class="nav-item active"><v-icon icon="mdi-form-select" size="17" />Pola kategorii</NuxtLink>
                <NuxtLink to="/admin/partners" class="nav-item"><v-icon icon="mdi-handshake-outline" size="17" />Partnerzy API</NuxtLink>
                <NuxtLink to="/admin/directory" class="nav-item"><v-icon icon="mdi-domain" size="17" />Katalog firm</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Pola dodatkowe per kategoria</h1>
                <p class="page-sub">Definiuje pola formularza specyficzne dla kategorii (np. szerokość opony) bez potrzeby wdrożenia - widoczne od razu w formularzu dodawania ogłoszenia i w filtrach wyszukiwania.</p>
            </div>

            <div class="toolbar">
                <select v-model="categoryFilter" class="cat-select" @change="loadDefinitions">
                    <option value="">Wszystkie kategorie</option>
                    <option v-for="c in vehicleCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <button class="btn-add" @click="openCreateForm">
                    <v-icon icon="mdi-plus" size="15" /> Dodaj pole
                </button>
            </div>

            <div v-if="showForm" class="add-form-card">
                <div class="afc-title">{{ form.id ? 'Edytuj pole' : 'Nowe pole' }}</div>
                <div class="afc-fields">
                    <select v-model="form.vehicleCategoryId" class="afc-select" @change="loadSubtypesForForm">
                        <option value="" disabled>Kategoria pojazdu *</option>
                        <option v-for="c in vehicleCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <select v-model="form.vehicleSubtypeId" class="afc-select" :disabled="!form.vehicleCategoryId">
                        <option value="">Cała kategoria (bez podtypu)</option>
                        <option v-for="s in formSubtypes" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                    <input v-model="form.key" class="afc-input" placeholder="Klucz (np. tire_width)" />
                    <input v-model="form.labelPl" class="afc-input" placeholder="Etykieta (np. Szerokość opony)" />
                    <select v-model="form.dataType" class="afc-select">
                        <option v-for="t in DATA_TYPES" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <input v-model="form.unit" class="afc-input" placeholder="Jednostka (opcjonalnie, np. mm)" />
                </div>
                <div v-if="form.dataType === 'Select' || form.dataType === 'MultiSelect'" class="afc-fields">
                    <input v-model="optionsRaw" class="afc-input afc-input--wide" placeholder="Opcje rozdzielone przecinkami (np. Lato, Zima, Całoroczne)" />
                </div>
                <div class="afc-cats">
                    <label class="afc-check"><input type="checkbox" v-model="form.isRequired" />Wymagane</label>
                    <label class="afc-check"><input type="checkbox" v-model="form.isFilterable" />Filtrowalne</label>
                    <label class="afc-check"><input type="checkbox" v-model="form.isSearchable" />Wyszukiwalne</label>
                    <label class="afc-check"><input type="checkbox" v-model="form.isActive" />Aktywne</label>
                </div>
                <div class="afc-actions">
                    <button class="btn-confirm" :disabled="!canSave || saving" @click="saveForm">
                        <v-icon v-if="saving" icon="mdi-loading" size="13" class="spin" />
                        {{ form.id ? 'Zapisz' : 'Dodaj' }}
                    </button>
                    <button class="btn-cancel" @click="closeForm">Anuluj</button>
                </div>
            </div>

            <div v-if="loading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
            <div v-else-if="definitions.length" class="feat-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Kategoria</th><th>Podtyp</th><th>Klucz</th><th>Etykieta</th>
                            <th>Typ</th><th>Jedn.</th><th>Wym.</th><th>Filtr.</th><th>Użycia</th><th>Aktywne</th><th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in definitions" :key="d.id">
                            <td class="td-id">#{{ d.id }}</td>
                            <td class="td-dim">{{ d.vehicleCategoryName }}</td>
                            <td class="td-dim">{{ d.vehicleSubtypeName ?? '—' }}</td>
                            <td class="td-name">{{ d.key }}</td>
                            <td class="td-dim">{{ d.labelPl }}</td>
                            <td><span class="cat-badge">{{ d.dataType }}</span></td>
                            <td class="td-dim">{{ d.unit ?? '—' }}</td>
                            <td class="td-dim">{{ d.isRequired ? 'Tak' : '—' }}</td>
                            <td class="td-dim">{{ d.isFilterable ? 'Tak' : '—' }}</td>
                            <td class="td-dim">{{ d.usageCount }}</td>
                            <td><input type="checkbox" :checked="d.isActive" @change="toggleActive(d, $event)" /></td>
                            <td>
                                <button class="btn-action" @click="openEditForm(d)"><v-icon icon="mdi-pencil-outline" size="13" />Edytuj</button>
                                <button class="btn-action btn-delete" @click="deleteDefinition(d)"><v-icon icon="mdi-delete-outline" size="13" />Usuń</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="empty-state"><v-icon icon="mdi-form-select" size="36" class="empty-icon" />Brak zdefiniowanych pól.</div>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { error: toastError, success: toastSuccess } = useToast()

const DATA_TYPES = ['Text', 'Number', 'Decimal', 'Boolean', 'Select', 'MultiSelect', 'Date', 'File']

const vehicleCategories = ref<any[]>([])
const definitions = ref<any[]>([])
const loading = ref(true)
const categoryFilter = ref<number | ''>('')
const showForm = ref(false)
const saving = ref(false)
const formSubtypes = ref<any[]>([])
const optionsRaw = ref('')

const emptyForm = () => ({
    id: null as number | null,
    vehicleCategoryId: '' as number | '',
    vehicleSubtypeId: '' as number | '',
    key: '', labelPl: '', dataType: 'Text', unit: '',
    isRequired: false, isFilterable: false, isSearchable: false, isActive: true,
    sortOrder: 0,
})
const form = reactive(emptyForm())

const canSave = computed(() => !!form.vehicleCategoryId && !!form.key && !!form.labelPl)

async function loadVehicleCategories() {
    vehicleCategories.value = await $fetch('/api/proxy/api/Taxonomy/categories').catch(() => [])
}

async function loadDefinitions() {
    loading.value = true
    try {
        const q: Record<string, any> = {}
        if (categoryFilter.value) q.categoryId = categoryFilter.value
        const resp = await $fetch<{ items: any[] }>('/api/proxy/api/Attributes/all', { query: q })
        definitions.value = resp.items
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować pól.')
        definitions.value = []
    } finally { loading.value = false }
}

async function loadSubtypesForForm() {
    formSubtypes.value = []
    if (!form.vehicleCategoryId) return
    formSubtypes.value = await $fetch<any[]>(`/api/proxy/api/Taxonomy/vehicle-subtypes/category/${form.vehicleCategoryId}`).catch(() => [])
}

function openCreateForm() {
    Object.assign(form, emptyForm())
    optionsRaw.value = ''
    formSubtypes.value = []
    showForm.value = true
}

function openEditForm(d: any) {
    Object.assign(form, {
        id: d.id, vehicleCategoryId: d.vehicleCategoryId, vehicleSubtypeId: d.vehicleSubtypeId ?? '',
        key: d.key, labelPl: d.labelPl, dataType: d.dataType, unit: d.unit ?? '',
        isRequired: d.isRequired, isFilterable: d.isFilterable, isSearchable: d.isSearchable, isActive: d.isActive,
        sortOrder: d.sortOrder,
    })
    optionsRaw.value = d.optionsJson ? (JSON.parse(d.optionsJson) as string[]).join(', ') : ''
    loadSubtypesForForm()
    showForm.value = true
}

function closeForm() { showForm.value = false }

async function saveForm() {
    if (!canSave.value) return
    saving.value = true
    try {
        const options = optionsRaw.value.split(',').map(s => s.trim()).filter(Boolean)
        const body = {
            vehicleCategoryId: form.vehicleCategoryId, vehicleSubtypeId: form.vehicleSubtypeId || null,
            key: form.key, labelPl: form.labelPl, dataType: form.dataType, unit: form.unit || null,
            optionsJson: options.length ? JSON.stringify(options) : null,
            isRequired: form.isRequired, isFilterable: form.isFilterable, isSearchable: form.isSearchable,
            isActive: form.isActive, sortOrder: form.sortOrder,
        }
        if (form.id) {
            await $fetch(`/api/proxy/api/Attributes/${form.id}`, { method: 'PUT', body })
        } else {
            await $fetch('/api/proxy/api/Attributes', { method: 'POST', body })
        }
        await loadDefinitions()
        closeForm()
        toastSuccess(form.id ? 'Pole zostało zaktualizowane.' : 'Pole zostało dodane.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zapisać pola.')
    } finally { saving.value = false }
}

async function toggleActive(d: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked
    try {
        await $fetch(`/api/proxy/api/Attributes/${d.id}`, {
            method: 'PUT',
            body: {
                vehicleCategoryId: d.vehicleCategoryId, vehicleSubtypeId: d.vehicleSubtypeId,
                key: d.key, labelPl: d.labelPl, dataType: d.dataType, unit: d.unit,
                optionsJson: d.optionsJson, isRequired: d.isRequired, isFilterable: d.isFilterable,
                isSearchable: d.isSearchable, isActive: checked, sortOrder: d.sortOrder,
            },
        })
        d.isActive = checked
        toastSuccess(`Pole "${d.labelPl}" ${checked ? 'aktywowane' : 'dezaktywowane'}.`)
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zmienić statusu.')
    }
}

async function deleteDefinition(d: any) {
    if (d.usageCount > 0) {
        toastError(`To pole ma ${d.usageCount} zapisanych wartości - dezaktywuj je zamiast usuwać.`)
        return
    }
    if (!confirm(`Usuń pole "${d.labelPl}"?`)) return
    try {
        await $fetch(`/api/proxy/api/Attributes/${d.id}`, { method: 'DELETE' })
        definitions.value = definitions.value.filter(x => x.id !== d.id)
        toastSuccess('Pole zostało usunięte.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się usunąć pola.')
    }
}

onMounted(async () => {
    await Promise.all([loadVehicleCategories(), loadDefinitions()])
})
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.page-sub { font-size: 13px; color: $text-dim; margin: 4px 0 0; max-width: 640px; line-height: 1.5; }

.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }

.cat-select {
    background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text-muted;
    font-size: 12px; padding: 7px 10px; cursor: pointer; font-family: 'Inter', sans-serif;
}

.btn-add {
    display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: $r-sm;
    background: rgba($red, 0.12); border: 1px solid rgba($red, 0.25); color: $red;
    font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif;
    &:hover { background: rgba($red, 0.2); }
}

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
.afc-select {
    background: #080808; border: 1px solid $border; border-radius: $r-sm; color: $text-muted;
    font-size: 13px; padding: 8px 12px; cursor: pointer; font-family: 'Inter', sans-serif;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.afc-cats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.afc-check { display: flex; align-items: center; gap: 6px; font-size: 12px; color: $text-muted; cursor: pointer; }
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

.cat-badge {
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 5px;
    background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border;
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
