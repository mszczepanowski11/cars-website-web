<template>
    <div class="page-bg">
        <div v-if="activeCategory" class="cat-hero" :style="{ backgroundImage: `url(${heroBg})` }">
            <div class="cat-hero-overlay" />
            <div class="container cat-hero-inner">
                <nav class="breadcrumb">
                    <NuxtLink to="/">Strona główna</NuxtLink>
                    <span> › </span>
                    <span>{{ activeCategory.name }}</span>
                </nav>
                <h1 class="cat-hero-title">{{ activeCategory.name }}</h1>
                <p class="cat-hero-sub">Znajdź idealne auto dopasowane do Twoich potrzeb</p>
            </div>
        </div>

        <div class="container main-layout">
            <aside class="sidebar">
                <div class="sidebar-block">
                    <h3 class="sidebar-title">Kategorie</h3>
                    <div
                        v-for="cat in categories"
                        :key="cat.id"
                        class="cat-item"
                        :class="{ active: f.categoryId === cat.id }"
                        @click="selectCategory(cat)"
                    >
                        <v-icon :icon="cat.iconName" size="18" class="cat-icon" />
                        <span class="cat-item-name">{{ cat.name }}</span>
                        <span class="cat-item-count">{{ cat.advertCount.toLocaleString('pl') }}</span>
                    </div>
                </div>

                <div class="sidebar-block">
                    <div class="filter-hd">
                        <h3 class="sidebar-title">Filtry</h3>
                        <button class="clear-btn" @click="clearFilters">Wyczyść</button>
                    </div>

                    <p class="filter-label">Cena (zł)</p>
                    <div class="range-row">
                        <v-text-field v-model.number="f.priceFrom" label="Od" hide-details density="compact" type="number" variant="outlined" />
                        <span class="range-sep">–</span>
                        <v-text-field v-model.number="f.priceTo" label="Do" hide-details density="compact" type="number" variant="outlined" />
                    </div>

                    <p class="filter-label mt-4">Rok produkcji</p>
                    <div class="range-row">
                        <v-text-field v-model.number="f.yearFrom" label="Od" hide-details density="compact" type="number" variant="outlined" />
                        <span class="range-sep">–</span>
                        <v-text-field v-model.number="f.yearTo" label="Do" hide-details density="compact" type="number" variant="outlined" />
                    </div>

                    <p class="filter-label mt-4">Paliwo</p>
                    <v-select v-model="f.fuelTypeId" :items="fuelTypes" item-title="name" item-value="id"
                        hide-details density="compact" clearable variant="outlined" />

                    <v-btn color="primary" class="mt-4" block @click="load(1)">Zastosuj filtry</v-btn>
                </div>
            </aside>

            <div class="content">
                <div class="search-bar">
                    <div class="search-input-wrap">
                        <v-icon icon="mdi-magnify" color="#666" />
                        <input
                            v-model="f.textSearch"
                            placeholder="Wyszukaj markę, model, słowa kluczowe..."
                            class="search-input"
                            @keyup.enter="load(1)"
                        />
                    </div>
                    <v-select v-model="f.brandId" :items="brands" item-title="name" item-value="id"
                        label="Marka" hide-details density="compact" clearable variant="outlined"
                        class="search-select" @update:model-value="onBrandChange" />
                    <v-select v-model="f.modelId" :items="models" item-title="name" item-value="id"
                        label="Model" hide-details density="compact" clearable variant="outlined"
                        :disabled="!f.brandId" class="search-select" />
                    <v-btn color="primary" height="44" @click="load(1)">
                        Szukaj ({{ total.toLocaleString('pl') }})
                    </v-btn>
                </div>

                <div class="results-hd">
                    <p class="result-count">Znaleziono <strong>{{ total.toLocaleString('pl') }}</strong> ogłoszeń</p>
                    <v-select v-model="f.sortBy" :items="sortOptions" item-title="label" item-value="value"
                        hide-details density="compact" variant="outlined" style="max-width:180px"
                        @update:model-value="load(1)" />
                </div>

                <div v-if="loading" class="d-flex justify-center mt-16">
                    <v-progress-circular indeterminate color="primary" size="60" />
                </div>
                <template v-else>
                    <div class="cars-grid">
                        <AdvertCard v-for="a in adverts" :key="a.id" :advert="a" />
                    </div>
                    <div v-if="!adverts.length" class="no-results">Brak wyników. Zmień kryteria wyszukiwania.</div>
                    <div class="d-flex justify-center mt-8">
                        <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages"
                            active-color="primary" rounded="circle" @update:model-value="load" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import type { TaxonomyItem, CarAdvert, PagedResult, CategoryWithCount } from '~/types'

const config = useRuntimeConfig()
const base = config.public.apiBase
const route = useRoute()
const { fetchBrands, fetchModels, fetchFuelTypes } = useTaxonomy()
const { fetchCategories, STATIC_CATEGORIES } = useCategories()

const brands = ref<TaxonomyItem[]>([])
const models = ref<TaxonomyItem[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const categories = ref<CategoryWithCount[]>([])
const adverts = ref<CarAdvert[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

const heroBgs: Record<string, string> = {
    'auta-osobowe': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop',
    'motocykle': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop',
    'ciezarowe': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop',
}

const sortOptions = [
    { label: 'Najnowsze', value: '' },
    { label: 'Cena: rosnąco', value: 'price_asc' },
    { label: 'Cena: malejąco', value: 'price_desc' },
    { label: 'Rok: najnowszy', value: 'year_desc' },
]

const f = reactive({
    categoryId: null as number | null,
    textSearch: '',
    brandId: null as number | null,
    modelId: null as number | null,
    fuelTypeId: null as number | null,
    priceFrom: null as number | null,
    priceTo: null as number | null,
    yearFrom: null as number | null,
    yearTo: null as number | null,
    sortBy: '',
})

const activeCategory = computed(() =>
    f.categoryId ? (categories.value.find(c => c.id === f.categoryId) ?? null) : null
)

const heroBg = computed(() => {
    const cat = activeCategory.value
    if (!cat) return ''
    return heroBgs[cat.slug] ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop'
})

function selectCategory(cat: CategoryWithCount) {
    f.categoryId = f.categoryId === cat.id ? null : cat.id
    load(1)
}

function clearFilters() {
    f.categoryId = null; f.textSearch = ''; f.brandId = null; f.modelId = null
    f.fuelTypeId = null; f.priceFrom = null; f.priceTo = null
    f.yearFrom = null; f.yearTo = null; f.sortBy = ''
    load(1)
}

async function onBrandChange() {
    f.modelId = null
    models.value = []
    if (f.brandId) models.value = await fetchModels(f.brandId)
}

async function load(p: number = page.value) {
    page.value = p
    loading.value = true
    try {
        const body: Record<string, unknown> = { page: p, pageSize, sortBy: f.sortBy || undefined }
        if (f.categoryId) body.categoryId = f.categoryId
        if (f.textSearch) body.textSearch = f.textSearch
        if (f.brandId) body.brandId = f.brandId
        if (f.modelId) body.modelId = f.modelId
        if (f.fuelTypeId) body.fuelTypeId = f.fuelTypeId
        if (f.priceFrom) body.priceFrom = f.priceFrom
        if (f.priceTo) body.priceTo = f.priceTo
        if (f.yearFrom) body.yearFrom = f.yearFrom
        if (f.yearTo) body.yearTo = f.yearTo
        const r = await $fetch<PagedResult<CarAdvert>>(`${base}api/Advert/search`, { method: 'POST', body })
        adverts.value = r.items
        total.value = r.totalCount
    } finally { loading.value = false }
}

onMounted(async () => {
    if (route.query.categoryId) f.categoryId = Number(route.query.categoryId)
    ;[brands.value, fuelTypes.value, categories.value] = await Promise.all([
        fetchBrands(), fetchFuelTypes(), fetchCategories()
    ])
    await load(1)
})
</script>

<style lang="scss" scoped>
.page-bg { background: $bg; min-height: 100vh; }
.container { @include container; }

.cat-hero {
    height: 240px;
    position: relative;
    background-size: cover;
    background-position: center;
}
.cat-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.4), $bg); }
.cat-hero-inner { position: relative; z-index: 2; padding-top: 100px; }
.breadcrumb { color: $text-dim; font-size: 13px; margin-bottom: 10px; a { color: $text-dim; text-decoration: none; } }
.cat-hero-title { font-size: 42px; font-weight: 900; color: $text; }
.cat-hero-sub { color: $text-muted; font-size: 15px; margin-top: 6px; }

.main-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 28px;
    padding-top: 32px;
    padding-bottom: 80px;

    @include respond-to(md) { grid-template-columns: 1fr; }
}

.sidebar { display: flex; flex-direction: column; gap: 16px; }

.sidebar-block { @include card($r-xl); padding: 22px; }

.sidebar-title { font-size: 16px; font-weight: 700; color: $text; margin-bottom: 16px; }

.cat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: $r-sm;
    cursor: pointer;
    transition: background 0.2s;
    color: $text-muted;
    font-size: 14px;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }
    &.active { background: rgba(139,13,29,0.12); color: $text; border-left: 3px solid $red; }
}

.cat-icon { color: $red !important; }
.cat-item-name { flex: 1; }
.cat-item-count { font-size: 12px; color: $text-faint; }

.filter-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.clear-btn { background: none; border: none; color: $red; font-size: 13px; font-weight: 600; cursor: pointer; }
.filter-label { font-size: 13px; color: $text-muted; margin-bottom: 8px; }
.range-row { display: flex; align-items: center; gap: 8px; }
.range-sep { color: $text-dim; }

.content { min-width: 0; }

.search-bar {
    @include card($r-xl);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.search-input-wrap {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 0 14px;
    height: 44px;
}

.search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    &::placeholder { color: $text-faint; }
}

.search-select { min-width: 130px; max-width: 150px; }

.results-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.result-count { color: $text-muted; strong { color: $red; } }

.cars-grid { @include cars-grid; }
.no-results { text-align: center; color: $text-faint; font-size: 18px; margin-top: 60px; }
</style>