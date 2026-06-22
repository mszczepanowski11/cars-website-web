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
                <NuxtLink to="/admin/taxonomy" class="nav-item active"><v-icon icon="mdi-tag-multiple-outline" size="17" />Wyposażenie</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Zarządzanie wyposażeniem</h1>
                <div class="topbar-tabs">
                    <button :class="['ttab', { active: view === 'features' }]" @click="view = 'features'">Cechy / Wyposażenie</button>
                    <button :class="['ttab', { active: view === 'categories' }]" @click="view = 'categories'">Kategorie cech</button>
                </div>
            </div>

            <!-- FEATURES VIEW -->
            <div v-if="view === 'features'">
                <div class="toolbar">
                    <div class="search-bar">
                        <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                        <input v-model="featureSearch" class="sb-input" placeholder="Szukaj cechy..." @input="debouncedLoad" />
                    </div>
                    <select v-model="featureCatFilter" class="cat-select" @change="loadFeatures">
                        <option value="">Wszystkie kategorie</option>
                        <option v-for="c in featureCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <button class="btn-add" @click="showAddFeature = true">
                        <v-icon icon="mdi-plus" size="15" /> Dodaj cechę
                    </button>
                </div>

                <!-- Add feature form -->
                <div v-if="showAddFeature" class="add-form-card">
                    <div class="afc-title">Nowa cecha wyposażenia</div>
                    <div class="afc-fields">
                        <input v-model="newFeatureName" class="afc-input" placeholder="Nazwa cechy (np. Klimatyzacja automatyczna)" />
                        <select v-model="newFeatureCatId" class="afc-select">
                            <option value="">Wybierz kategorię</option>
                            <option v-for="c in featureCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
                        <button class="btn-confirm" :disabled="!newFeatureName || !newFeatureCatId || addingFeature" @click="addFeature">
                            <v-icon v-if="addingFeature" icon="mdi-loading" size="13" class="spin" />
                            Dodaj
                        </button>
                        <button class="btn-cancel" @click="showAddFeature = false; newFeatureName = ''; newFeatureCatId = ''">Anuluj</button>
                    </div>
                </div>

                <div v-if="featuresLoading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
                <div v-else-if="features.length" class="feat-table">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Nazwa</th><th>Kategoria</th><th>Typ pojazdu</th><th>Akcje</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="f in features" :key="f.id">
                                <td class="td-id">#{{ f.id }}</td>
                                <td class="td-name">{{ f.name }}</td>
                                <td><span class="cat-badge">{{ f.category?.name ?? '—' }}</span></td>
                                <td class="td-dim">{{ f.category?.vehicleCategoryId ? (vehicleCategories.find((vc: any) => vc.id === f.category.vehicleCategoryId)?.name ?? `ID ${f.category.vehicleCategoryId}`) : 'Wszystkie' }}</td>
                                <td>
                                    <button class="btn-action btn-delete" @click="deleteFeature(f.id, f.name)">
                                        <v-icon icon="mdi-delete-outline" size="13" />Usuń
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state"><v-icon icon="mdi-tag-off-outline" size="36" class="empty-icon" />Brak wyposażenia.</div>
            </div>

            <!-- CATEGORIES VIEW -->
            <div v-if="view === 'categories'">
                <div class="toolbar">
                    <span class="total-badge">{{ featureCategories.length }} kategorii</span>
                    <button class="btn-add" @click="showAddCat = true">
                        <v-icon icon="mdi-plus" size="15" /> Dodaj kategorię
                    </button>
                </div>

                <div v-if="showAddCat" class="add-form-card">
                    <div class="afc-title">Nowa kategoria cech</div>
                    <div class="afc-fields">
                        <input v-model="newCatName" class="afc-input" placeholder="Nazwa kategorii (np. Bezpieczeństwo)" />
                        <select v-model="newCatVehicleId" class="afc-select">
                            <option value="">Wszystkie pojazdy</option>
                            <option v-for="vc in vehicleCategories" :key="vc.id" :value="vc.id">{{ vc.name }}</option>
                        </select>
                        <select v-model="newCatBrandId" class="afc-select" @change="newCatModelId = ''; loadNewCatModels()">
                            <option value="">Wszystkie marki</option>
                            <option v-for="b in allBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                        <select v-model="newCatModelId" class="afc-select" :disabled="!newCatBrandId">
                            <option value="">Wszystkie modele</option>
                            <option v-for="m in newCatModels" :key="m.id" :value="m.id">{{ m.name }}</option>
                        </select>
                        <button class="btn-confirm" :disabled="!newCatName || addingCat" @click="addCategory">
                            <v-icon v-if="addingCat" icon="mdi-loading" size="13" class="spin" />
                            Dodaj
                        </button>
                        <button class="btn-cancel" @click="showAddCat = false; newCatName = ''; newCatBrandId = ''; newCatModelId = ''">Anuluj</button>
                    </div>
                </div>

                <div class="feat-table">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Nazwa kategorii</th><th>Typ pojazdu</th><th>Marka</th><th>Model</th><th>Akcje</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="c in featureCategories" :key="c.id">
                                <td class="td-id">#{{ c.id }}</td>
                                <td class="td-name">{{ c.name }}</td>
                                <td class="td-dim">{{ c.vehicleCategoryName ?? 'Wszystkie' }}</td>
                                <td class="td-dim">{{ c.brandName ?? '—' }}</td>
                                <td class="td-dim">{{ c.modelName ?? '—' }}</td>
                                <td>
                                    <button class="btn-action btn-delete" @click="deleteCategory(c.id, c.name)">
                                        <v-icon icon="mdi-delete-outline" size="13" />Usuń
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const view = ref<'features' | 'categories'>('features')
const featureSearch = ref('')
const featureCatFilter = ref<number | ''>('')
const features = ref<any[]>([])
const featureCategories = ref<any[]>([])
const vehicleCategories = ref<any[]>([])
const featuresLoading = ref(true)
const showAddFeature = ref(false)
const showAddCat = ref(false)
const newFeatureName = ref('')
const newFeatureCatId = ref<number | ''>('')
const newCatName = ref('')
const newCatVehicleId = ref<number | ''>('')
const newCatBrandId = ref<number | ''>('')
const newCatModelId = ref<number | ''>('')
const newCatModels = ref<{ id: number; name: string }[]>([])
const allBrands = ref<{ id: number; name: string }[]>([])
const addingFeature = ref(false)
const addingCat = ref(false)

let debounceT: ReturnType<typeof setTimeout> | null = null
function debouncedLoad() {
    if (debounceT) clearTimeout(debounceT)
    debounceT = setTimeout(loadFeatures, 350)
}

async function loadFeatures() {
    featuresLoading.value = true
    try {
        const q: Record<string, any> = {}
        if (featureSearch.value) q.search = featureSearch.value
        if (featureCatFilter.value) q.categoryId = featureCatFilter.value
        features.value = await $fetch('/api/proxy/api/Admin/features', { query: q })
    } catch { features.value = [] } finally { featuresLoading.value = false }
}

async function loadCategories() {
    featureCategories.value = await $fetch('/api/proxy/api/Admin/feature-categories').catch(() => [])
}

async function loadVehicleCategories() {
    vehicleCategories.value = await $fetch('/api/proxy/api/Taxonomy/categories').catch(() => [])
}

async function loadAllBrands() {
    allBrands.value = await $fetch<{ id: number; name: string }[]>('/api/proxy/api/Taxonomy/brands').catch(() => [])
}

async function loadNewCatModels() {
    if (!newCatBrandId.value) { newCatModels.value = []; return }
    newCatModels.value = await $fetch<{ id: number; name: string }[]>(`/api/proxy/api/Taxonomy/brands/${newCatBrandId.value}/models`).catch(() => [])
}

async function addFeature() {
    if (!newFeatureName.value || !newFeatureCatId.value) return
    addingFeature.value = true
    try {
        const f = await $fetch('/api/proxy/api/Admin/features', { method: 'POST', body: { name: newFeatureName.value, categoryId: newFeatureCatId.value } })
        await loadFeatures()
        showAddFeature.value = false
        newFeatureName.value = ''
        newFeatureCatId.value = ''
    } catch {} finally { addingFeature.value = false }
}

async function deleteFeature(id: number, name: string) {
    if (!confirm(`Usuń cechę "${name}"?`)) return
    await $fetch(`/api/proxy/api/Admin/features/${id}`, { method: 'DELETE' }).catch(() => {})
    features.value = features.value.filter(f => f.id !== id)
}

async function addCategory() {
    if (!newCatName.value) return
    addingCat.value = true
    try {
        await $fetch('/api/proxy/api/Admin/feature-categories', {
            method: 'POST',
            body: {
                name: newCatName.value,
                vehicleCategoryId: newCatVehicleId.value || null,
                brandId: newCatBrandId.value || null,
                modelId: newCatModelId.value || null,
            }
        })
        await loadCategories()
        showAddCat.value = false
        newCatName.value = ''
        newCatVehicleId.value = ''
        newCatBrandId.value = ''
        newCatModelId.value = ''
        newCatModels.value = []
    } catch {} finally { addingCat.value = false }
}

async function deleteCategory(id: number, name: string) {
    if (!confirm(`Usuń kategorię "${name}"? Wszystkie cechy tej kategorii też zostaną usunięte.`)) return
    await $fetch(`/api/proxy/api/Admin/feature-categories/${id}`, { method: 'DELETE' }).catch(() => {})
    featureCategories.value = featureCategories.value.filter(c => c.id !== id)
}

onMounted(async () => {
    await Promise.all([loadFeatures(), loadCategories(), loadVehicleCategories(), loadAllBrands()])
})
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.topbar-tabs { display: flex; gap: 8px; }
.ttab {
    font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: $r-sm; cursor: pointer;
    background: transparent; border: 1px solid $border; color: $text-dim; font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    &.active { background: rgba($red, 0.12); color: $red; border-color: rgba($red, 0.3); }
    &:hover:not(.active) { border-color: rgba(255,255,255,0.15); color: $text-muted; }
}

.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }

.cat-select {
    background: #0d0d0d; border: 1px solid $border; border-radius: $r-sm; color: $text-muted;
    font-size: 12px; padding: 7px 10px; cursor: pointer; font-family: 'Inter', sans-serif;
}

.total-badge { font-size: 12px; color: $text-dim; }

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
.afc-fields { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.afc-input {
    flex: 1; min-width: 200px; background: #080808; border: 1px solid $border; border-radius: $r-sm;
    color: $text; font-size: 13px; padding: 8px 12px; outline: none; font-family: 'Inter', sans-serif;
    &:focus { border-color: rgba($red, 0.4); }
}
.afc-select {
    background: #080808; border: 1px solid $border; border-radius: $r-sm; color: $text-muted;
    font-size: 13px; padding: 8px 12px; cursor: pointer; font-family: 'Inter', sans-serif;
}
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
    td { padding: 11px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; font-size: 13px; color: $text-muted; }
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
    display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    padding: 5px 10px; border-radius: $r-sm; cursor: pointer; font-family: 'Inter', sans-serif;
    border: 1px solid transparent; transition: opacity 0.2s;
}
.btn-delete {
    background: rgba(220,50,50,0.06); color: rgba(229,85,85,0.7); border-color: rgba(220,50,50,0.15);
    &:hover { background: rgba(220,50,50,0.18); color: #e55; border-color: rgba(220,50,50,0.35); }
}
</style>
