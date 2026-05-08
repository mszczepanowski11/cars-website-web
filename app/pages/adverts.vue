<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <h1 class="page-title">Wszystkie ogłoszenia</h1>

            <div class="filters-bar">
                <v-select v-model="f.brandId" :items="brands" item-title="name" item-value="id" label="Marka"
                    hide-details clearable @update:model-value="onBrandChange" />
                <v-select v-model="f.modelId" :items="models" item-title="name" item-value="id" label="Model"
                    hide-details clearable :disabled="!f.brandId" />
                <v-select v-model="f.fuelTypeId" :items="fuelTypes" item-title="name" item-value="id" label="Paliwo"
                    hide-details clearable />
                <v-select v-model="f.bodyTypeId" :items="bodyTypes" item-title="name" item-value="id" label="Nadwozie"
                    hide-details clearable />
                <v-text-field v-model.number="f.priceFrom" label="Cena od" hide-details type="number" />
                <v-text-field v-model.number="f.priceTo" label="Cena do" hide-details type="number" />
                <v-text-field v-model.number="f.yearFrom" label="Rok od" hide-details type="number" />
                <v-btn color="primary" height="58" @click="load(1)">Szukaj</v-btn>
            </div>

            <div v-if="loading" class="d-flex justify-center mt-16">
                <v-progress-circular indeterminate color="primary" size="60" />
            </div>
            <template v-else>
                <p class="result-count">Znaleziono: {{ total }} ogłoszeń</p>
                <div class="cars-grid">
                    <AdvertCard v-for="a in adverts" :key="a.id" :advert="a" />
                </div>
                <div v-if="!adverts.length" class="no-results">
                    Brak wyników. Zmień kryteria wyszukiwania.
                </div>
                <div class="d-flex justify-center mt-8">
                    <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages" active-color="primary"
                        rounded="circle" @update:model-value="load" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TaxonomyItem, CarAdvert, PagedResult } from '~/types'

const config = useRuntimeConfig()
const base = config.public.apiBase
const { fetchBrands, fetchModels, fetchFuelTypes, fetchBodyTypes } = useTaxonomy()

const brands = ref<TaxonomyItem[]>([])
const models = ref<TaxonomyItem[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])
const adverts = ref<CarAdvert[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

const f = reactive({
    brandId: null as number | null,
    modelId: null as number | null,
    fuelTypeId: null as number | null,
    bodyTypeId: null as number | null,
    priceFrom: null as number | null,
    priceTo: null as number | null,
    yearFrom: null as number | null,
})

async function onBrandChange() {
    f.modelId = null
    models.value = []
    if (f.brandId) models.value = await fetchModels(f.brandId)
}

async function load(p: number = page.value) {
    page.value = p
    loading.value = true
    try {
        const body: Record<string, unknown> = { page: p, pageSize }
        if (f.brandId) body.brandId = f.brandId
        if (f.modelId) body.modelId = f.modelId
        if (f.fuelTypeId) body.fuelTypeId = f.fuelTypeId
        if (f.bodyTypeId) body.bodyTypeId = f.bodyTypeId
        if (f.priceFrom) body.priceFrom = f.priceFrom
        if (f.priceTo) body.priceTo = f.priceTo
        if (f.yearFrom) body.yearFrom = f.yearFrom
        const r = await $fetch<PagedResult<CarAdvert>>(`${base}api/Advert/search`, { method: 'POST', body })
        adverts.value = r.items
        total.value = r.totalCount
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    ;[brands.value, fuelTypes.value, bodyTypes.value] = await Promise.all([
        fetchBrands(), fetchFuelTypes(), fetchBodyTypes()
    ])
    await load(1)
})
</script>

<style lang="scss" scoped>
.page-bg {
    background: $bg;
    min-height: 100vh;
}

.container {
    @include container;
}

.page-title {
    font-size: 40px;
    font-weight: 900;
    color: $text;
    margin-bottom: 35px;
}

.filters-bar {
    @include card($r-xl);
    padding: 22px;
    display: grid;
    grid-template-columns: repeat(4, 1fr) repeat(3, 1fr) 130px;
    gap: 16px;
    margin-bottom: 40px;

    @include respond-to(md) {
        grid-template-columns: repeat(2, 1fr);
    }

    @include respond-to(xs) {
        grid-template-columns: 1fr;
    }
}

.result-count {
    color: $text-dim;
    margin-bottom: 24px;
}

.cars-grid {
    @include cars-grid;
}

.no-results {
    text-align: center;
    color: $text-faint;
    font-size: 18px;
    margin-top: 60px;
}
</style>