<template>
    <div class="page-bg">
        <div class="container" style="padding-top: 120px; padding-bottom: 80px;">
            <h1 class="page-title">Dodaj ogłoszenie</h1>

            <div class="form-card">
                <v-form @submit.prevent="submit" :disabled="loading">

                    <div class="fsec">
                        <h3>Podstawowe informacje</h3>
                        <v-text-field v-model="form.title" label="Tytuł ogłoszenia" required />
                        <v-textarea v-model="form.description" label="Opis" rows="4" />
                        <v-text-field v-model.number="form.price" label="Cena (zł)" type="number" required />
                    </div>

                    <div class="fsec">
                        <h3>Dane pojazdu</h3>
                        <div class="frow">
                            <v-select v-model="form.brandId" :items="brands" item-title="name" item-value="id"
                                label="Marka" required @update:model-value="onBrand" />
                            <v-select v-model="form.modelId" :items="models" item-title="name" item-value="id"
                                label="Model" :disabled="!form.brandId" required @update:model-value="onModel" />
                        </div>
                        <div class="frow">
                            <v-select v-model="form.generationId" :items="generations" item-title="name" item-value="id"
                                label="Generacja" :disabled="!form.modelId" @update:model-value="onGen" />
                            <v-select v-model="form.engineVersionId" :items="engines" item-title="name" item-value="id"
                                label="Wersja silnika" :disabled="!form.generationId" />
                        </div>
                        <div class="frow">
                            <v-select v-model="form.fuelTypeId" :items="fuelTypes" item-title="name" item-value="id"
                                label="Rodzaj paliwa" required />
                            <v-select v-model="form.gearboxId" :items="gearboxes" item-title="name" item-value="id"
                                label="Skrzynia biegów" required />
                        </div>
                        <div class="frow">
                            <v-select v-model="form.bodyTypeId" :items="bodyTypes" item-title="name" item-value="id"
                                label="Typ nadwozia" required />
                            <v-text-field v-model.number="form.year" label="Rok produkcji" type="number" required />
                        </div>
                        <v-text-field v-model.number="form.mileage" label="Przebieg (km)" type="number" required />
                    </div>

                    <div class="fsec">
                        <h3>Wyposażenie</h3>
                        <div v-for="(group, cat) in featureGroups" :key="cat" class="feat-group">
                            <h4>{{ cat }}</h4>
                            <div class="feat-checks">
                                <v-checkbox v-for="feat in group" :key="feat.id" v-model="form.featureIds"
                                    :value="feat.id" :label="feat.name" color="primary" hide-details />
                            </div>
                        </div>
                    </div>

                    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
                    <v-btn type="submit" color="primary" size="large" block :loading="loading">
                        Opublikuj ogłoszenie
                    </v-btn>

                </v-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TaxonomyItem, Generation, EngineVersion, Feature } from '~/types'

const config = useRuntimeConfig()
const base = config.public.apiBase
const token = useCookie('auth_token')
const { fetchBrands, fetchModels, fetchGenerations, fetchEngines, fetchFuelTypes, fetchGearboxes, fetchBodyTypes, fetchFeatures } = useTaxonomy()

const brands = ref<TaxonomyItem[]>([])
const models = ref<TaxonomyItem[]>([])
const generations = ref<Generation[]>([])
const engines = ref<EngineVersion[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const gearboxes = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])
const allFeatures = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')

const form = reactive({
    title: '', description: '',
    price: null as number | null,
    brandId: null as number | null, modelId: null as number | null,
    generationId: null as number | null, engineVersionId: null as number | null,
    fuelTypeId: null as number | null, gearboxId: null as number | null, bodyTypeId: null as number | null,
    year: null as number | null, mileage: null as number | null,
    featureIds: [] as number[],
})

const featureGroups = computed(() => {
    const g: Record<string, Feature[]> = {}
    for (const f of allFeatures.value) {
        const cat = f.category?.name ?? 'Inne'
            ; (g[cat] ??= []).push(f)
    }
    return g
})

async function onBrand() {
    form.modelId = null; form.generationId = null; form.engineVersionId = null
    models.value = []; generations.value = []; engines.value = []
    if (form.brandId) models.value = await fetchModels(form.brandId)
}
async function onModel() {
    form.generationId = null; form.engineVersionId = null
    generations.value = []; engines.value = []
    if (form.modelId) generations.value = await fetchGenerations(form.modelId)
}
async function onGen() {
    form.engineVersionId = null; engines.value = []
    if (form.generationId) engines.value = await fetchEngines(form.generationId)
}

async function submit() {
    error.value = ''
    if (!token.value) { navigateTo('/login'); return }
    loading.value = true
    try {
        await $fetch(`${base}api/Advert`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token.value}` },
            body: { ...form },
        })
        navigateTo('/my-adverts')
    } catch (e: any) {
        error.value = e?.data?.message ?? 'Błąd podczas zapisywania ogłoszenia.'
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    if (!token.value) { navigateTo('/login'); return }
    ;[brands.value, fuelTypes.value, gearboxes.value, bodyTypes.value, allFeatures.value] = await Promise.all([
        fetchBrands(), fetchFuelTypes(), fetchGearboxes(), fetchBodyTypes(), fetchFeatures()
    ])
})
</script>

<style lang="scss" scoped>
.page-bg {
    background: $bg;
    min-height: 100vh;
}

.container {
    @include container;
    max-width: 900px;
}

.page-title {
    font-size: 40px;
    font-weight: 900;
    color: $text;
    margin-bottom: 35px;
}

.form-card {
    @include card($r-xl);
    padding: 40px;
}

.fsec {
    margin-bottom: 36px;

    h3 {
        font-size: 20px;
        font-weight: 700;
        color: $text;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid $border;
    }
}

.frow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @include respond-to(xs) {
        grid-template-columns: 1fr;
    }
}

.feat-group {
    margin-bottom: 20px;

    h4 {
        color: $text-dim;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
    }
}

.feat-checks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 4px;
}
</style>