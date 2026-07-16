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
                <NuxtLink to="/admin/vehicle-data" class="nav-item active"><v-icon icon="mdi-car-cog" size="17" />Marki i modele</NuxtLink>
                <NuxtLink to="/admin/attributes" class="nav-item"><v-icon icon="mdi-form-select" size="17" />Pola kategorii</NuxtLink>
                <NuxtLink to="/admin/partners" class="nav-item"><v-icon icon="mdi-handshake-outline" size="17" />Partnerzy API</NuxtLink>
                <NuxtLink to="/admin/quality-report" class="nav-item"><v-icon icon="mdi-database-check-outline" size="17" />Jakość danych</NuxtLink>
                <div class="nav-divider" />
                <NuxtLink to="/dashboard" class="nav-item"><v-icon icon="mdi-arrow-left" size="17" />Wróć do panelu</NuxtLink>
            </nav>
        </aside>

        <main class="admin-main">
            <div class="admin-topbar">
                <h1 class="page-title">Marki, modele, generacje i silniki</h1>
                <div class="topbar-tabs">
                    <button :class="['ttab', { active: tab === 'brands' }]" @click="tab = 'brands'">Marki</button>
                    <button :class="['ttab', { active: tab === 'models' }]" @click="tab = 'models'">Modele</button>
                    <button :class="['ttab', { active: tab === 'generations' }]" @click="tab = 'generations'">Generacje</button>
                    <button :class="['ttab', { active: tab === 'engines' }]" @click="tab = 'engines'">Silniki</button>
                </div>
            </div>

            <!-- BRANDS -->
            <div v-if="tab === 'brands'">
                <div class="toolbar">
                    <div class="search-bar">
                        <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                        <input v-model="brandSearch" class="sb-input" placeholder="Szukaj marki..." @input="debounced(loadBrands)" />
                    </div>
                    <button class="btn-add" @click="showAddBrand = true">
                        <v-icon icon="mdi-plus" size="15" /> Dodaj markę
                    </button>
                </div>

                <div v-if="showAddBrand" class="add-form-card">
                    <div class="afc-title">Nowa marka</div>
                    <div class="afc-fields">
                        <input v-model="newBrand.name" class="afc-input" placeholder="Nazwa marki (np. Toyota)" />
                        <input v-model="newBrand.slug" class="afc-input" placeholder="Slug (opcjonalnie, wygeneruje się automatycznie)" />
                        <select v-model="newBrand.originCountry" class="afc-input">
                            <option value="">Kraj pochodzenia (opcjonalnie)</option>
                            <option v-for="o in ORIGIN_COUNTRIES" :key="o" :value="o">{{ o }}</option>
                        </select>
                        <label class="afc-check">
                            <input type="checkbox" v-model="newBrand.isLuxury" />
                            Marka luksusowa
                        </label>
                    </div>
                    <div class="afc-cats">
                        <label v-for="c in vehicleCategories" :key="c.id" class="afc-check">
                            <input type="checkbox" :value="c.id" v-model="newBrand.categoryIds" />
                            {{ c.name }}
                        </label>
                    </div>
                    <div class="afc-actions">
                        <button class="btn-confirm" :disabled="!newBrand.name || savingBrand" @click="addBrand">
                            <v-icon v-if="savingBrand" icon="mdi-loading" size="13" class="spin" />
                            Dodaj
                        </button>
                        <button class="btn-cancel" @click="showAddBrand = false; resetNewBrand()">Anuluj</button>
                    </div>
                </div>

                <div v-if="brandsLoading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
                <div v-else-if="brands.length" class="feat-table">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Nazwa</th><th>Slug</th><th>Kategorie</th><th>Modele</th><th>Pochodzenie</th><th>Luksusowa</th><th>Akcje</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="b in brands" :key="b.id">
                                <td class="td-id">#{{ b.id }}</td>
                                <td class="td-name">{{ b.name }}</td>
                                <td class="td-dim">{{ b.slug }}</td>
                                <td><span v-for="c in b.categories" :key="c.id" class="cat-badge">{{ c.name }}</span></td>
                                <td class="td-dim">{{ b.modelCount }}</td>
                                <td>
                                    <select :value="b.originCountry ?? ''" class="afc-input afc-input--sm" @change="onOriginCountryChange(b, $event)">
                                        <option value="">—</option>
                                        <option v-for="o in ORIGIN_COUNTRIES" :key="o" :value="o">{{ o }}</option>
                                    </select>
                                </td>
                                <td>
                                    <input type="checkbox" :checked="b.isLuxury" @change="onIsLuxuryChange(b, $event)" />
                                </td>
                                <td>
                                    <button class="btn-action btn-delete" @click="deleteBrand(b.id, b.name, b.modelCount)">
                                        <v-icon icon="mdi-delete-outline" size="13" />Usuń
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state"><v-icon icon="mdi-car-off" size="36" class="empty-icon" />Brak marek.</div>
            </div>

            <!-- MODELS -->
            <div v-if="tab === 'models'">
                <div class="toolbar">
                    <select v-model="modelBrandFilter" class="cat-select" @change="loadModels">
                        <option value="">Wszystkie marki</option>
                        <option v-for="b in allBrandsLite" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                    <div class="search-bar">
                        <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                        <input v-model="modelSearch" class="sb-input" placeholder="Szukaj modelu..." @input="debounced(loadModels)" />
                    </div>
                    <button class="btn-add" @click="showAddModel = true">
                        <v-icon icon="mdi-plus" size="15" /> Dodaj model
                    </button>
                </div>

                <div v-if="showAddModel" class="add-form-card">
                    <div class="afc-title">Nowy model</div>
                    <div class="afc-fields">
                        <select v-model="newModel.brandId" class="afc-select">
                            <option value="">Wybierz markę</option>
                            <option v-for="b in allBrandsLite" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                        <input v-model="newModel.name" class="afc-input" placeholder="Nazwa modelu (np. Corolla)" />
                        <input v-model="newModel.slug" class="afc-input" placeholder="Slug (opcjonalnie)" />
                        <button class="btn-confirm" :disabled="!newModel.name || !newModel.brandId || savingModel" @click="addModel">
                            <v-icon v-if="savingModel" icon="mdi-loading" size="13" class="spin" />
                            Dodaj
                        </button>
                        <button class="btn-cancel" @click="showAddModel = false; resetNewModel()">Anuluj</button>
                    </div>
                </div>

                <div v-if="modelsLoading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
                <div v-else-if="models.length" class="feat-table">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Nazwa</th><th>Marka</th><th>Generacje</th><th>Akcje</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="m in models" :key="m.id">
                                <td class="td-id">#{{ m.id }}</td>
                                <td class="td-name">{{ m.name }}</td>
                                <td class="td-dim">{{ m.brandName }}</td>
                                <td class="td-dim">{{ m.generationCount }}</td>
                                <td>
                                    <button class="btn-action btn-delete" @click="deleteModel(m.id, m.name, m.generationCount)">
                                        <v-icon icon="mdi-delete-outline" size="13" />Usuń
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state"><v-icon icon="mdi-car-off" size="36" class="empty-icon" />Brak modeli.</div>
            </div>

            <!-- GENERATIONS -->
            <div v-if="tab === 'generations'">
                <div class="toolbar">
                    <select v-model="genModelFilter" class="cat-select" @change="loadGenerations">
                        <option value="">Wszystkie modele</option>
                        <option v-for="m in allModelsLite" :key="m.id" :value="m.id">{{ m.brandName }} {{ m.name }}</option>
                    </select>
                    <div class="search-bar">
                        <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                        <input v-model="genSearch" class="sb-input" placeholder="Szukaj generacji..." @input="debounced(loadGenerations)" />
                    </div>
                    <button class="btn-add" @click="showAddGen = true">
                        <v-icon icon="mdi-plus" size="15" /> Dodaj generację
                    </button>
                </div>

                <div v-if="showAddGen" class="add-form-card">
                    <div class="afc-title">Nowa generacja</div>
                    <div class="afc-fields">
                        <select v-model="newGen.modelId" class="afc-select">
                            <option value="">Wybierz model</option>
                            <option v-for="m in allModelsLite" :key="m.id" :value="m.id">{{ m.brandName }} {{ m.name }}</option>
                        </select>
                        <input v-model="newGen.name" class="afc-input" placeholder="Kod generacji (np. E90, W204, Mk7)" />
                        <input v-model.number="newGen.yearFrom" type="number" class="afc-input afc-small" placeholder="Rok od" />
                        <input v-model.number="newGen.yearTo" type="number" class="afc-input afc-small" placeholder="Rok do (opcjonalnie)" />
                        <button class="btn-confirm" :disabled="!newGen.name || !newGen.modelId || !newGen.yearFrom || savingGen" @click="addGeneration">
                            <v-icon v-if="savingGen" icon="mdi-loading" size="13" class="spin" />
                            Dodaj
                        </button>
                        <button class="btn-cancel" @click="showAddGen = false; resetNewGen()">Anuluj</button>
                    </div>
                </div>

                <div v-if="generationsLoading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
                <div v-else-if="generations.length" class="feat-table">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Generacja</th><th>Model</th><th>Marka</th><th>Lata</th><th>Silniki</th><th>Akcje</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="g in generations" :key="g.id">
                                <td class="td-id">#{{ g.id }}</td>
                                <td class="td-name">{{ g.name }}</td>
                                <td class="td-dim">{{ g.modelName }}</td>
                                <td class="td-dim">{{ g.brandName }}</td>
                                <td class="td-dim">{{ g.yearFrom }}–{{ g.yearTo ?? 'obecnie' }}</td>
                                <td class="td-dim">{{ g.engineCount }}</td>
                                <td>
                                    <button class="btn-action btn-delete" @click="deleteGeneration(g.id, g.name, g.engineCount)">
                                        <v-icon icon="mdi-delete-outline" size="13" />Usuń
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state"><v-icon icon="mdi-car-off" size="36" class="empty-icon" />Brak generacji.</div>
            </div>

            <!-- ENGINES -->
            <div v-if="tab === 'engines'">
                <div class="toolbar">
                    <select v-model="engineGenFilter" class="cat-select" @change="loadEngines">
                        <option value="">Wszystkie generacje</option>
                        <option v-for="g in allGenerationsLite" :key="g.id" :value="g.id">{{ g.brandName }} {{ g.modelName }} {{ g.name }}</option>
                    </select>
                    <div class="search-bar">
                        <v-icon icon="mdi-magnify" size="18" class="sb-icon" />
                        <input v-model="engineSearch" class="sb-input" placeholder="Szukaj silnika..." @input="debounced(loadEngines)" />
                    </div>
                    <button class="btn-add" @click="showAddEngine = true">
                        <v-icon icon="mdi-plus" size="15" /> Dodaj silnik
                    </button>
                </div>

                <div v-if="showAddEngine" class="add-form-card">
                    <div class="afc-title">Nowa wersja silnika</div>
                    <div class="afc-fields">
                        <select v-model="newEngine.generationId" class="afc-select">
                            <option value="">Wybierz generację</option>
                            <option v-for="g in allGenerationsLite" :key="g.id" :value="g.id">{{ g.brandName }} {{ g.modelName }} {{ g.name }}</option>
                        </select>
                        <input v-model="newEngine.engineName" class="afc-input" placeholder="Nazwa silnika (np. 2.0 TDI 150KM)" />
                        <select v-model="newEngine.fuelTypeId" class="afc-select">
                            <option value="">Rodzaj paliwa</option>
                            <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
                        </select>
                        <input v-model.number="newEngine.powerHP" type="number" class="afc-input afc-small" placeholder="Moc (KM)" />
                        <input v-model.number="newEngine.displacement" type="number" class="afc-input afc-small" placeholder="Pojemność (cm³)" />
                        <button class="btn-confirm" :disabled="!newEngine.engineName || !newEngine.generationId || !newEngine.fuelTypeId || savingEngine" @click="addEngine">
                            <v-icon v-if="savingEngine" icon="mdi-loading" size="13" class="spin" />
                            Dodaj
                        </button>
                        <button class="btn-cancel" @click="showAddEngine = false; resetNewEngine()">Anuluj</button>
                    </div>
                </div>

                <div v-if="enginesLoading" class="loading-state"><v-icon icon="mdi-loading" size="28" class="spin" />Ładowanie...</div>
                <div v-else-if="engines.length" class="feat-table">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Silnik</th><th>Generacja</th><th>Paliwo</th><th>Moc</th><th>Pojemność</th><th>Akcje</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in engines" :key="e.id">
                                <td class="td-id">#{{ e.id }}</td>
                                <td class="td-name">{{ e.engineName }}</td>
                                <td class="td-dim">{{ e.brandName }} {{ e.modelName }} {{ e.generationName }}</td>
                                <td class="td-dim">{{ e.fuelTypeName }}</td>
                                <td class="td-dim">{{ e.powerHP ? `${e.powerHP} KM` : '—' }}</td>
                                <td class="td-dim">{{ e.displacement ? `${e.displacement} cm³` : '—' }}</td>
                                <td>
                                    <button class="btn-action btn-delete" @click="deleteEngine(e.id, e.engineName)">
                                        <v-icon icon="mdi-delete-outline" size="13" />Usuń
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="empty-state"><v-icon icon="mdi-car-off" size="36" class="empty-icon" />Brak silników.</div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { error: toastError, success: toastSuccess } = useToast()

const tab = ref<'brands' | 'models' | 'generations' | 'engines'>('brands')

let debounceT: ReturnType<typeof setTimeout> | null = null
function debounced(fn: () => void) {
    if (debounceT) clearTimeout(debounceT)
    debounceT = setTimeout(fn, 350)
}

// ── Lookup lists used across tabs for cascading pickers ──
const vehicleCategories = ref<{ id: number; name: string }[]>([])
const allBrandsLite = ref<{ id: number; name: string }[]>([])
const allModelsLite = ref<{ id: number; name: string; brandName: string }[]>([])
const allGenerationsLite = ref<{ id: number; name: string; modelName: string; brandName: string }[]>([])
const fuelTypes = ref<{ id: number; name: string }[]>([])

async function loadLookups() {
    vehicleCategories.value = await $fetch('/api/proxy/api/Taxonomy/categories').catch(() => [])
    fuelTypes.value = await $fetch('/api/proxy/api/Taxonomy/fueltypes').catch(() => [])
    const brandsResp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/brands', { query: { pageSize: 200 } }).catch(() => ({ items: [] }))
    allBrandsLite.value = brandsResp.items.map(b => ({ id: b.id, name: b.name }))
    const modelsResp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/models', { query: { pageSize: 500 } }).catch(() => ({ items: [] }))
    allModelsLite.value = modelsResp.items.map(m => ({ id: m.id, name: m.name, brandName: m.brandName }))
    const gensResp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/generations', { query: { pageSize: 1000 } }).catch(() => ({ items: [] }))
    allGenerationsLite.value = gensResp.items.map(g => ({ id: g.id, name: g.name, modelName: g.modelName, brandName: g.brandName }))
}

// ── Brands ──
const ORIGIN_COUNTRIES = ['Niemcy', 'Japonia', 'Chiny', 'USA', 'Korea', 'Włochy', 'Francja',
    'Wielka Brytania', 'Szwecja', 'Czechy', 'Rosja', 'Polska', 'Kanada', 'Tajwan', 'Austria',
    'Rumunia', 'Białoruś', 'Indie', 'Turcja', 'Węgry', 'Inne']
const brands = ref<any[]>([])
const brandsLoading = ref(true)
const brandSearch = ref('')
const showAddBrand = ref(false)
const savingBrand = ref(false)
const newBrand = reactive({ name: '', slug: '', categoryIds: [] as number[], originCountry: '', isLuxury: false })
function resetNewBrand() { newBrand.name = ''; newBrand.slug = ''; newBrand.categoryIds = []; newBrand.originCountry = ''; newBrand.isLuxury = false }

// Inline-editable Pochodzenie/Luksusowa cells save immediately on change (same PUT endpoint the
// full edit form would use) - a brand flagged unmatched by BrandMetadataSeeder gets fixed here.
async function updateBrandMeta(b: any, patch: { originCountry?: string | null; isLuxury?: boolean }) {
    const body = {
        name: b.name, slug: b.slug, categoryIds: b.categories.map((c: any) => c.id),
        originCountry: patch.originCountry !== undefined ? patch.originCountry : (b.originCountry ?? null),
        isLuxury: patch.isLuxury !== undefined ? patch.isLuxury : !!b.isLuxury,
    }
    try {
        await $fetch(`/api/proxy/api/Admin/brands/${b.id}`, { method: 'PUT', body })
        Object.assign(b, { originCountry: body.originCountry, isLuxury: body.isLuxury })
        toastSuccess(`Zapisano metadane marki "${b.name}".`)
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się zapisać zmiany.')
    }
}
function onOriginCountryChange(b: any, event: Event) {
    const value = (event.target as HTMLSelectElement).value
    updateBrandMeta(b, { originCountry: value || null })
}
function onIsLuxuryChange(b: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked
    updateBrandMeta(b, { isLuxury: checked })
}

async function loadBrands() {
    brandsLoading.value = true
    try {
        const q: Record<string, any> = { pageSize: 200 }
        if (brandSearch.value) q.search = brandSearch.value
        const resp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/brands', { query: q })
        brands.value = resp.items
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować marek.')
        brands.value = []
    } finally { brandsLoading.value = false }
}

async function addBrand() {
    if (!newBrand.name) return
    savingBrand.value = true
    try {
        await $fetch('/api/proxy/api/Admin/brands', {
            method: 'POST',
            body: {
                name: newBrand.name, slug: newBrand.slug || undefined, categoryIds: newBrand.categoryIds,
                originCountry: newBrand.originCountry || null, isLuxury: newBrand.isLuxury,
            },
        })
        await Promise.all([loadBrands(), loadLookups()])
        showAddBrand.value = false
        resetNewBrand()
        toastSuccess('Marka została dodana.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się dodać marki.')
    } finally { savingBrand.value = false }
}

async function deleteBrand(id: number, name: string, modelCount: number) {
    if (modelCount > 0) { toastError('Nie można usunąć marki posiadającej modele. Najpierw usuń modele.'); return }
    if (!confirm(`Usuń markę "${name}"?`)) return
    try {
        await $fetch(`/api/proxy/api/Admin/brands/${id}`, { method: 'DELETE' })
        brands.value = brands.value.filter(b => b.id !== id)
        await loadLookups()
        toastSuccess('Marka została usunięta.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się usunąć marki.')
    }
}

// ── Models ──
const models = ref<any[]>([])
const modelsLoading = ref(true)
const modelSearch = ref('')
const modelBrandFilter = ref<number | ''>('')
const showAddModel = ref(false)
const savingModel = ref(false)
const newModel = reactive({ name: '', slug: '', brandId: '' as number | '' })
function resetNewModel() { newModel.name = ''; newModel.slug = ''; newModel.brandId = '' }

async function loadModels() {
    modelsLoading.value = true
    try {
        const q: Record<string, any> = { pageSize: 200 }
        if (modelSearch.value) q.search = modelSearch.value
        if (modelBrandFilter.value) q.brandId = modelBrandFilter.value
        const resp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/models', { query: q })
        models.value = resp.items
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować modeli.')
        models.value = []
    } finally { modelsLoading.value = false }
}

async function addModel() {
    if (!newModel.name || !newModel.brandId) return
    savingModel.value = true
    try {
        await $fetch('/api/proxy/api/Admin/models', {
            method: 'POST',
            body: { name: newModel.name, slug: newModel.slug || undefined, brandId: newModel.brandId },
        })
        await Promise.all([loadModels(), loadLookups()])
        showAddModel.value = false
        resetNewModel()
        toastSuccess('Model został dodany.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się dodać modelu.')
    } finally { savingModel.value = false }
}

async function deleteModel(id: number, name: string, generationCount: number) {
    if (generationCount > 0) { toastError('Nie można usunąć modelu posiadającego generacje. Najpierw usuń generacje.'); return }
    if (!confirm(`Usuń model "${name}"?`)) return
    try {
        await $fetch(`/api/proxy/api/Admin/models/${id}`, { method: 'DELETE' })
        models.value = models.value.filter(m => m.id !== id)
        await loadLookups()
        toastSuccess('Model został usunięty.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się usunąć modelu.')
    }
}

// ── Generations ──
const generations = ref<any[]>([])
const generationsLoading = ref(true)
const genSearch = ref('')
const genModelFilter = ref<number | ''>('')
const showAddGen = ref(false)
const savingGen = ref(false)
const newGen = reactive({ name: '', modelId: '' as number | '', yearFrom: null as number | null, yearTo: null as number | null })
function resetNewGen() { newGen.name = ''; newGen.modelId = ''; newGen.yearFrom = null; newGen.yearTo = null }

async function loadGenerations() {
    generationsLoading.value = true
    try {
        const q: Record<string, any> = { pageSize: 200 }
        if (genSearch.value) q.search = genSearch.value
        if (genModelFilter.value) q.modelId = genModelFilter.value
        const resp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/generations', { query: q })
        generations.value = resp.items
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować generacji.')
        generations.value = []
    } finally { generationsLoading.value = false }
}

async function addGeneration() {
    if (!newGen.name || !newGen.modelId || !newGen.yearFrom) return
    savingGen.value = true
    try {
        await $fetch('/api/proxy/api/Admin/generations', {
            method: 'POST',
            body: { name: newGen.name, modelId: newGen.modelId, yearFrom: newGen.yearFrom, yearTo: newGen.yearTo || undefined },
        })
        await Promise.all([loadGenerations(), loadLookups()])
        showAddGen.value = false
        resetNewGen()
        toastSuccess('Generacja została dodana.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się dodać generacji.')
    } finally { savingGen.value = false }
}

async function deleteGeneration(id: number, name: string, engineCount: number) {
    if (engineCount > 0) { toastError('Nie można usunąć generacji posiadającej wersje silników. Najpierw usuń silniki.'); return }
    if (!confirm(`Usuń generację "${name}"?`)) return
    try {
        await $fetch(`/api/proxy/api/Admin/generations/${id}`, { method: 'DELETE' })
        generations.value = generations.value.filter(g => g.id !== id)
        await loadLookups()
        toastSuccess('Generacja została usunięta.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się usunąć generacji.')
    }
}

// ── Engines ──
const engines = ref<any[]>([])
const enginesLoading = ref(true)
const engineSearch = ref('')
const engineGenFilter = ref<number | ''>('')
const showAddEngine = ref(false)
const savingEngine = ref(false)
const newEngine = reactive({
    engineName: '', generationId: '' as number | '', fuelTypeId: '' as number | '',
    powerHP: null as number | null, displacement: null as number | null,
})
function resetNewEngine() {
    newEngine.engineName = ''; newEngine.generationId = ''; newEngine.fuelTypeId = ''
    newEngine.powerHP = null; newEngine.displacement = null
}

async function loadEngines() {
    enginesLoading.value = true
    try {
        const q: Record<string, any> = { pageSize: 200 }
        if (engineSearch.value) q.search = engineSearch.value
        if (engineGenFilter.value) q.generationId = engineGenFilter.value
        const resp = await $fetch<{ items: any[] }>('/api/proxy/api/Admin/engines', { query: q })
        engines.value = resp.items
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować silników.')
        engines.value = []
    } finally { enginesLoading.value = false }
}

async function addEngine() {
    if (!newEngine.engineName || !newEngine.generationId || !newEngine.fuelTypeId) return
    savingEngine.value = true
    try {
        await $fetch('/api/proxy/api/Admin/engines', {
            method: 'POST',
            body: {
                engineName: newEngine.engineName, generationId: newEngine.generationId, fuelTypeId: newEngine.fuelTypeId,
                powerHP: newEngine.powerHP || undefined, displacement: newEngine.displacement || undefined,
            },
        })
        await loadEngines()
        showAddEngine.value = false
        resetNewEngine()
        toastSuccess('Silnik został dodany.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się dodać silnika.')
    } finally { savingEngine.value = false }
}

async function deleteEngine(id: number, name: string) {
    if (!confirm(`Usuń silnik "${name}"?`)) return
    try {
        await $fetch(`/api/proxy/api/Admin/engines/${id}`, { method: 'DELETE' })
        engines.value = engines.value.filter(e => e.id !== id)
        toastSuccess('Silnik został usunięty.')
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się usunąć silnika.')
    }
}

onMounted(async () => {
    await loadLookups()
    await loadBrands()
})

watch(tab, (t) => {
    if (t === 'models' && !models.value.length) loadModels()
    if (t === 'generations' && !generations.value.length) loadGenerations()
    if (t === 'engines' && !engines.value.length) loadEngines()
})
</script>

<style lang="scss" scoped>
@import './shared-admin.scss';

.topbar-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
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
    flex: 1; min-width: 180px; background: #080808; border: 1px solid $border; border-radius: $r-sm;
    color: $text; font-size: 13px; padding: 8px 12px; outline: none; font-family: 'Inter', sans-serif;
    &:focus { border-color: rgba($red, 0.4); }
}
.afc-small { flex: 0 0 120px; min-width: 100px; }
.afc-select {
    background: #080808; border: 1px solid $border; border-radius: $r-sm; color: $text-muted;
    font-size: 13px; padding: 8px 12px; cursor: pointer; font-family: 'Inter', sans-serif;
}
.afc-cats { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 12px; }
.afc-check {
    display: flex; align-items: center; gap: 6px; font-size: 12px; color: $text-muted; cursor: pointer;
}
.afc-actions { display: flex; gap: 10px; margin-top: 12px; }
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
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 5px; margin-right: 4px;
    background: rgba(255,255,255,0.06); color: $text-dim; border: 1px solid $border; display: inline-block;
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; color: $text-dim; font-size: 14px; padding: 60px 0; }
.empty-icon { opacity: 0.4; }

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
