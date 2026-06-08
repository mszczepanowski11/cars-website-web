<template>
    <div class="add-page">

        <!-- Top bar -->
        <div class="top-bar">
            <div class="top-left">
                <div class="tl-logo">CARI<span>ZO</span></div>
                <button class="back-btn" @click="navigateTo('/dashboard')">
                    <v-icon icon="mdi-arrow-left" size="16" />
                    Wróć do panelu
                </button>
            </div>
            <div class="top-center">Dodaj ogłoszenie</div>
            <div class="top-right">
                <button class="btn-draft">
                    <v-icon icon="mdi-content-save-outline" size="16" />
                    Zapisz szkic
                </button>
                <button class="btn-close" @click="navigateTo('/my-adverts')">
                    <v-icon icon="mdi-close" size="18" />
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="page-body">

            <!-- Left sidebar -->
            <aside class="left-sidebar">
                <nav class="steps-nav">
                    <div v-for="(step, i) in steps" :key="i"
                        class="step-item"
                        :class="{ 'step-active': currentStep === i, 'step-done': currentStep > i }"
                        @click="currentStep > i && (currentStep = i)">
                        <div class="step-num">
                            <v-icon v-if="currentStep > i" icon="mdi-check" size="13" />
                            <span v-else>{{ i + 1 }}</span>
                        </div>
                        <div class="step-info">
                            <div class="step-name">{{ step.name }}</div>
                            <div class="step-desc">{{ step.desc }}</div>
                        </div>
                    </div>
                </nav>
                <div class="sidebar-help">
                    <v-icon icon="mdi-help-circle-outline" size="20" class="help-icon" />
                    <div>
                        <div class="help-title">Potrzebujesz pomocy?</div>
                        <p class="help-sub">Sprawdź poradnik jak dodać najlepsze ogłoszenie</p>
                        <a href="#" class="help-link">Zobacz poradnik →</a>
                    </div>
                </div>
            </aside>

            <!-- Center -->
            <main class="center-area">

                <!-- Hero -->
                <div class="form-hero">
                    <div class="form-hero-text">
                        <h1>Dodaj swoje auto.</h1>
                        <p>Stwórz premium ogłoszenie w kilka minut.</p>
                    </div>
                </div>

                <!-- Progress -->
                <div class="progress-track">
                    <div v-for="(ps, i) in progressSteps" :key="i"
                        class="progress-node"
                        :class="{ 'pn-active': currentStep === i, 'pn-done': currentStep > i }">
                        <div class="pn-icon">
                            <v-icon :icon="ps.icon" size="16" />
                        </div>
                        <span class="pn-label">{{ ps.label }}</span>
                        <div v-if="i < progressSteps.length - 1" class="pn-line" />
                    </div>
                </div>

                <!-- Step 0: Basic info -->
                <div v-if="currentStep === 0" class="form-content">
                    <div class="form-section-head">
                        <h2>Informacje podstawowe</h2>
                        <p>Podaj najważniejsze informacje o pojeździe.</p>
                    </div>

                    <div class="fields-grid">

                        <div class="field">
                            <label class="flabel">Marka <span class="req">*</span></label>
                            <div class="select-wrap">
                                <select v-model="form.brandId" class="fselect" @change="onBrand">
                                    <option :value="null" disabled>Wybierz markę</option>
                                    <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Model <span class="req">*</span></label>
                            <div class="select-wrap">
                                <select v-model="form.modelId" class="fselect" :disabled="!form.brandId" @change="onModel">
                                    <option :value="null" disabled>Wybierz model</option>
                                    <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Wersja / generacja</label>
                            <div class="select-wrap">
                                <select v-model="form.generationId" class="fselect" :disabled="!form.modelId" @change="onGen">
                                    <option :value="null" disabled>Wybierz generację</option>
                                    <option v-for="g in generations" :key="g.id" :value="g.id">{{ g.name }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Rok produkcji <span class="req">*</span></label>
                            <div class="input-icon-wrap">
                                <v-icon icon="mdi-calendar-outline" class="input-prefix" size="16" />
                                <input v-model.number="form.year" type="number" class="finput has-prefix"
                                    placeholder="np. 2020" min="1900" :max="new Date().getFullYear()" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Rodzaj paliwa <span class="req">*</span></label>
                            <div class="select-wrap">
                                <v-icon icon="mdi-gas-station-outline" class="input-prefix in-select" size="16" />
                                <select v-model="form.fuelTypeId" class="fselect has-prefix">
                                    <option :value="null" disabled>Wybierz</option>
                                    <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Pojemność silnika (cm³)</label>
                            <input v-model.number="form.engineCapacity" type="number" class="finput" placeholder="np. 1995" />
                        </div>

                        <div class="field">
                            <label class="flabel">Moc (KM)</label>
                            <input v-model.number="form.power" type="number" class="finput" placeholder="np. 150" />
                        </div>

                        <div class="field">
                            <label class="flabel">Skrzynia biegów</label>
                            <div class="select-wrap">
                                <select v-model="form.gearboxId" class="fselect">
                                    <option :value="null" disabled>Wybierz</option>
                                    <option v-for="g in gearboxes" :key="g.id" :value="g.id">{{ g.name }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Przebieg (km) <span class="req">*</span></label>
                            <div class="input-icon-wrap">
                                <v-icon icon="mdi-speedometer" class="input-prefix" size="16" />
                                <input v-model.number="form.mileage" type="number" class="finput has-prefix" placeholder="np. 100 000" />
                            </div>
                        </div>

                        <div class="field">
                            <label class="flabel">Cena (zł) <span class="req">*</span></label>
                            <input v-model.number="form.price" type="number" class="finput finput-price" placeholder="np. 50 000" />
                        </div>

                    </div>

                    <!-- Location fields -->
                    <div class="form-section-subhead">Lokalizacja</div>
                    <div class="fields-grid">
                        <div class="field">
                            <label class="flabel">Województwo <span class="req">*</span></label>
                            <div class="select-wrap">
                                <select v-model="form.region" class="fselect">
                                    <option :value="null" disabled>Wybierz województwo</option>
                                    <option v-for="v in voivodeships" :key="v" :value="v">{{ v }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>
                        <div class="field">
                            <label class="flabel">Miasto <span class="req">*</span></label>
                            <div class="input-icon-wrap">
                                <v-icon icon="mdi-map-marker-outline" class="input-prefix" size="16" />
                                <input v-model="form.city" type="text" class="finput has-prefix" placeholder="np. Warszawa" />
                            </div>
                        </div>
                    </div>

                    <!-- VIN bar -->
                    <div class="vin-bar">
                        <v-icon icon="mdi-file-document-outline" size="22" class="vin-doc-icon" />
                        <div class="vin-text">
                            <div class="vin-title">Posiadasz numer VIN?</div>
                            <div class="vin-sub">Wpisz VIN, a my uzupełnimy dane automatycznie.</div>
                        </div>
                        <input v-model="form.vin" class="vin-input" placeholder="Wpisz numer VIN" maxlength="17" />
                        <button class="vin-btn">Użyj VIN</button>
                    </div>
                </div>

                <!-- Step 1: Photos -->
                <div v-else-if="currentStep === 1" class="form-content">
                    <div class="form-section-head">
                        <h2>Zdjęcia</h2>
                        <p>Dodaj minimum <strong>3 zdjęcia</strong> pojazdu. Pierwsze zdjęcie będzie zdjęciem głównym.</p>
                    </div>
                    <div v-if="selectedFiles.length > 0" class="photo-count-bar" :class="{ 'pc-ok': selectedFiles.length >= 3, 'pc-warn': selectedFiles.length < 3 }">
                        <v-icon :icon="selectedFiles.length >= 3 ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" size="16" />
                        {{ selectedFiles.length }} / min. 3 zdjęcia
                    </div>
                    <div class="img-grid">
                        <div v-for="(preview, i) in previews" :key="i" class="img-thumb">
                            <img :src="preview" />
                            <button type="button" class="img-remove" @click="removeImage(i)">
                                <v-icon icon="mdi-close" size="14" />
                            </button>
                            <span v-if="i === 0" class="img-main-badge">Główne</span>
                        </div>
                        <label v-if="selectedFiles.length < 20" class="img-add">
                            <input type="file" multiple accept="image/jpeg,image/png,image/webp" @change="onFilesSelected" hidden />
                            <v-icon icon="mdi-plus" size="28" />
                            <span>Dodaj zdjęcia</span>
                        </label>
                    </div>
                </div>

                <!-- Step 2: Details -->
                <div v-else-if="currentStep === 2" class="form-content">
                    <div class="form-section-head">
                        <h2>Opis i szczegóły</h2>
                        <p>Opisz pojazd i zaznacz wyposażenie.</p>
                    </div>
                    <div class="field" style="margin-bottom: 24px;">
                        <label class="flabel">Opis ogłoszenia</label>
                        <textarea v-model="form.description" class="ftextarea" rows="6"
                            placeholder="Opisz stan pojazdu, historię serwisową, dodatkowe wyposażenie..." />
                    </div>
                    <div class="field">
                        <label class="flabel">Typ nadwozia</label>
                        <div class="select-wrap">
                            <select v-model="form.bodyTypeId" class="fselect">
                                <option :value="null" disabled>Wybierz</option>
                                <option v-for="b in bodyTypes" :key="b.id" :value="b.id">{{ b.name }}</option>
                            </select>
                            <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                        </div>
                    </div>
                    <div v-for="(group, cat) in featureGroups" :key="cat" class="feat-group">
                        <div class="feat-group-title">{{ cat }}</div>
                        <div class="feat-checks">
                            <label v-for="feat in group" :key="feat.id" class="feat-check">
                                <input type="checkbox" v-model="form.featureIds" :value="feat.id" />
                                <span>{{ feat.name }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Step 3: History -->
                <div v-else-if="currentStep === 3" class="form-content">
                    <div class="form-section-head">
                        <h2>Historia i stan</h2>
                        <p>Podaj historię pojazdu i informacje o stanie technicznym.</p>
                    </div>
                    <div class="field">
                        <label class="flabel">Numer VIN</label>
                        <input v-model="form.vin" class="finput" placeholder="Wpisz 17-znakowy numer VIN" maxlength="17" />
                    </div>
                </div>

                <!-- Step 4: Preview -->
                <div v-else-if="currentStep === 4" class="form-content">
                    <div class="form-section-head">
                        <h2>Podgląd ogłoszenia</h2>
                        <p>Sprawdź jak będzie wyglądać Twoje ogłoszenie.</p>
                    </div>
                    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
                </div>

                <!-- Form actions -->
                <div class="form-actions">
                    <div class="form-actions-left">
                        <button class="btn-cancel" @click="currentStep > 0 ? currentStep-- : navigateTo('/my-adverts')">
                            {{ currentStep > 0 ? 'Wstecz' : 'Anuluj' }}
                        </button>
                        <transition name="fade-err">
                            <span v-if="stepError" class="step-error">
                                <v-icon icon="mdi-alert-circle-outline" size="14" />{{ stepError }}
                            </span>
                        </transition>
                    </div>
                    <button v-if="currentStep < steps.length - 1" class="btn-next" @click="goNext">
                        Dalej: {{ steps[currentStep + 1]?.name }}
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </button>
                    <button v-else class="btn-next" :disabled="loading" @click="submit">
                        {{ loading ? 'Publikowanie...' : 'Opublikuj ogłoszenie' }}
                        <v-icon v-if="!loading" icon="mdi-check" size="16" />
                    </button>
                </div>

                <!-- Bottom strip -->
                <div class="bottom-strip">
                    <div v-for="f in stripFeats" :key="f.title" class="strip-feat">
                        <v-icon :icon="f.icon" size="20" class="strip-icon" />
                        <div>
                            <div class="strip-title">{{ f.title }}</div>
                            <div class="strip-desc">{{ f.desc }}</div>
                        </div>
                    </div>
                </div>

            </main>

            <!-- Right panel -->
            <aside class="right-panel">

                <div class="score-card">
                    <div class="score-card-title">Ocena ogłoszenia</div>
                    <div class="score-circle-area">
                        <svg viewBox="0 0 120 120" width="130" height="130">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#1a1a1a" stroke-width="8" />
                            <circle cx="60" cy="60" r="52" fill="none"
                                :stroke="adScore >= 60 ? '#2d7a3a' : '#8B0D1D'"
                                stroke-width="8"
                                stroke-linecap="round"
                                :stroke-dasharray="`${scoreArc} 326.7`"
                                transform="rotate(-90 60 60)" />
                        </svg>
                        <div class="score-num">
                            <span class="score-val">{{ adScore }}</span>
                            <span class="score-denom">/100</span>
                        </div>
                    </div>
                    <p class="score-desc">Twoje ogłoszenie jest w dobrym kierunku. Uzupełnij kolejne kroki, aby zwiększyć widoczność.</p>
                    <a href="#" class="score-link">Jak poprawić ocenę? →</a>

                    <div class="score-factors">
                        <div class="sf-heading">Co wpływa na ocenę?</div>
                        <div v-for="sf in scoreFactors" :key="sf.label" class="sf-row" :class="{ 'sf-done': sf.done }">
                            <div class="sf-check-box">
                                <v-icon v-if="sf.done" icon="mdi-check" size="11" />
                            </div>
                            <span>{{ sf.label }}</span>
                        </div>
                    </div>
                </div>

                <div class="preview-card">
                    <div class="preview-card-title">Podgląd ogłoszenia</div>
                    <div class="preview-img-wrap">
                        <img
                            :src="previews[0] ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop'"
                            alt=""
                        />
                    </div>
                    <div class="preview-details">
                        <div class="preview-car-name">{{ previewTitle }}</div>
                        <div class="preview-meta-row">
                            <span v-if="form.year">{{ form.year }}</span>
                            <template v-if="fuelTypeName"><span class="dot">•</span><span>{{ fuelTypeName }}</span></template>
                            <template v-if="form.mileage"><span class="dot">•</span><span>{{ Number(form.mileage).toLocaleString('pl') }} km</span></template>
                        </div>
                        <div class="preview-price">{{ form.price ? Number(form.price).toLocaleString('pl') + ' zł' : '— zł' }}</div>
                    </div>
                    <button class="preview-full-btn">
                        <v-icon icon="mdi-eye-outline" size="15" />
                        Zobacz pełny podgląd
                    </button>
                </div>

            </aside>

        </div>
    </div>
</template>

<script setup lang="ts">
import type { TaxonomyItem, Generation, EngineVersion, Feature } from '~/types'

definePageMeta({ middleware: 'auth' })

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
const stepError = ref('')
const selectedFiles = ref<File[]>([])
const previews = ref<string[]>([])
const currentStep = ref(0)

const voivodeships = [
    'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
    'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
    'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
    'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
]

const form = reactive({
    title: '',
    description: '',
    price: null as number | null,
    brandId: null as number | null,
    modelId: null as number | null,
    generationId: null as number | null,
    engineVersionId: null as number | null,
    fuelTypeId: null as number | null,
    gearboxId: null as number | null,
    bodyTypeId: null as number | null,
    year: null as number | null,
    mileage: null as number | null,
    featureIds: [] as number[],
    engineCapacity: null as number | null,
    power: null as number | null,
    vin: '',
    city: '',
    region: null as string | null,
})

const steps = [
    { name: 'Informacje podstawowe', desc: 'Marka, model, cena', icon: 'mdi-car-outline' },
    { name: 'Zdjęcia', desc: 'Dodaj zdjęcia auta', icon: 'mdi-image-outline' },
    { name: 'Opis i szczegóły', desc: 'Opis, wyposażenie', icon: 'mdi-text-box-outline' },
    { name: 'Historia i stan', desc: 'VIN, historia pojazdu', icon: 'mdi-shield-check-outline' },
    { name: 'Podgląd ogłoszenia', desc: 'Sprawdź jak wygląda', icon: 'mdi-eye-outline' },
]

const progressSteps = [
    { label: 'Informacje', icon: 'mdi-car-outline' },
    { label: 'Zdjęcia', icon: 'mdi-image-outline' },
    { label: 'Szczegóły', icon: 'mdi-text-box-outline' },
    { label: 'Publikacja', icon: 'mdi-check-circle-outline' },
]

const stripFeats = [
    { icon: 'mdi-lock-outline', title: 'Bezpieczne transakcje', desc: 'Weryfikujemy i dbamy o bezpieczeństwo' },
    { icon: 'mdi-tag-off-outline', title: 'Darmowe ogłoszenia', desc: 'Dodawaj auta bez ukrytych kosztów' },
    { icon: 'mdi-bullhorn-outline', title: 'Promowanie ofert', desc: 'Wyróżnij swoje auto i sprzedaj szybciej' },
    { icon: 'mdi-headset', title: 'Wsparcie 24/7', desc: 'Nasz zespół jest dostępny zawsze' },
]

const brandName = computed(() => brands.value.find(b => b.id === form.brandId)?.name ?? '')
const modelName = computed(() => models.value.find(m => m.id === form.modelId)?.name ?? '')
const fuelTypeName = computed(() => fuelTypes.value.find(f => f.id === form.fuelTypeId)?.name ?? '')

const previewTitle = computed(() => {
    const parts = [brandName.value, modelName.value].filter(Boolean)
    return parts.length ? parts.join(' ') : 'Twoje ogłoszenie'
})

const adScore = computed(() => {
    let s = 0
    if (form.brandId) s += 8
    if (form.modelId) s += 8
    if (form.year) s += 7
    if (form.fuelTypeId) s += 7
    if (form.mileage) s += 7
    if (form.price) s += 8
    if (form.gearboxId) s += 5
    if (form.generationId) s += 5
    if (selectedFiles.value.length >= 5) s += 15
    else if (selectedFiles.value.length > 0) s += selectedFiles.value.length * 2
    if (form.description) s += 15
    if (form.featureIds.length >= 3) s += 10
    else s += form.featureIds.length * 3
    if (form.vin) s += 5
    return Math.min(s, 100)
})

const scoreArc = computed(() => (adScore.value / 100) * 326.7)

const scoreFactors = computed(() => [
    { label: 'Podstawowe informacje', done: !!(form.brandId && form.modelId && form.year && form.fuelTypeId && form.mileage && form.price) },
    { label: `Zdjęcia (${selectedFiles.value.length}/10)`, done: selectedFiles.value.length >= 10 },
    { label: `Opis (${form.description ? 1 : 0}/1)`, done: !!form.description },
    { label: `Wyposażenie (${form.featureIds.length}/3)`, done: form.featureIds.length >= 3 },
    { label: `Historia pojazdu (${form.vin ? 1 : 0}/2)`, done: !!form.vin },
])

const featureGroups = computed(() => {
    const g: Record<string, Feature[]> = {}
    for (const f of allFeatures.value) {
        const cat = f.category?.name ?? 'Inne';
        (g[cat] ??= []).push(f)
    }
    return g
})

function validateStep(step: number): string | null {
    if (step === 0) {
        if (!form.brandId) return 'Wybierz markę pojazdu.'
        if (!form.modelId) return 'Wybierz model pojazdu.'
        if (!form.year) return 'Podaj rok produkcji.'
        if (!form.fuelTypeId) return 'Wybierz rodzaj paliwa.'
        if (!form.mileage) return 'Podaj przebieg.'
        if (!form.price) return 'Podaj cenę.'
        if (!form.region) return 'Wybierz województwo.'
        if (!form.city?.trim()) return 'Podaj miasto.'
    }
    if (step === 1) {
        if (selectedFiles.value.length < 3) return 'Dodaj minimum 3 zdjęcia.'
    }
    if (step === 2) {
        if (!form.description?.trim()) return 'Dodaj opis ogłoszenia.'
    }
    return null
}

function goNext() {
    const err = validateStep(currentStep.value)
    if (err) {
        stepError.value = err
        setTimeout(() => { stepError.value = '' }, 4000)
        return
    }
    stepError.value = ''
    currentStep.value++
}

function onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    const remaining = 20 - selectedFiles.value.length
    for (const file of files.slice(0, remaining)) {
        selectedFiles.value.push(file)
        previews.value.push(URL.createObjectURL(file))
    }
    input.value = ''
}

function removeImage(index: number) {
    const url = previews.value[index]
    if (url) URL.revokeObjectURL(url)
    selectedFiles.value.splice(index, 1)
    previews.value.splice(index, 1)
}

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
    const err = validateStep(2)
    if (err) {
        error.value = err
        return
    }
    error.value = ''
    loading.value = true
    form.title = previewTitle.value || 'Ogłoszenie'
    try {
        const { id } = await $fetch<{ id: number }>('/api/proxy/api/Advert', {
            method: 'POST',
            body: { ...form },
        })
        for (const file of selectedFiles.value) {
            const fd = new FormData()
            fd.append('file', file)
            await $fetch(`/api/advert/${id}/images`, { method: 'POST', body: fd })
        }
        await navigateTo(`/promote-advert/${id}?fromCreate=true`)
    } catch (e: any) {
        error.value = e?.data?.message ?? 'Błąd podczas zapisywania ogłoszenia.'
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    ;[brands.value, fuelTypes.value, gearboxes.value, bodyTypes.value, allFeatures.value] = await Promise.all([
        fetchBrands(), fetchFuelTypes(), fetchGearboxes(), fetchBodyTypes(), fetchFeatures()
    ])
})
</script>

<style lang="scss" scoped>
// ── Page shell ────────────────────────────────────────────────────────────────
.add-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $bg;
    color: $text;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
}

// ── Top bar ───────────────────────────────────────────────────────────────────
.top-bar {
    height: 56px;
    min-height: 56px;
    border-bottom: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: $bg;
    z-index: 10;
}

.top-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.tl-logo {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 4px;
    color: $text;
    span { color: $red; }
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.top-center {
    font-size: 14px;
    font-weight: 600;
    color: $text-muted;
}

.top-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-draft {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 14px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-close {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dim;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

// ── Page body ─────────────────────────────────────────────────────────────────
.page-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
.left-sidebar {
    width: 240px;
    min-width: 240px;
    border-right: 1px solid $border;
    background: #070707;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.steps-nav {
    flex: 1;
    padding: 20px 0;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 20px;
    cursor: default;
    transition: background 0.15s;

    &.step-active {
        background: rgba($red, 0.08);
        .step-num { background: $red; border-color: $red; color: white; }
        .step-name { color: $text; }
    }

    &.step-done {
        cursor: pointer;
        .step-num { background: rgba($red, 0.15); border-color: rgba($red, 0.3); color: $red; }
        &:hover { background: rgba(255,255,255,0.02); }
    }
}

.step-num {
    width: 28px;
    height: 28px;
    min-width: 28px;
    border-radius: 50%;
    border: 1.5px solid $border;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: $text-dark;
    margin-top: 1px;
}

.step-info { min-width: 0; }

.step-name {
    font-size: 13px;
    font-weight: 600;
    color: $text-muted;
    margin-bottom: 2px;
}

.step-desc {
    font-size: 11px;
    color: $text-dark;
}

.sidebar-help {
    margin: 16px;
    padding: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: $r-md;
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.help-icon { color: $text-dark; flex-shrink: 0; margin-top: 2px; }

.help-title {
    font-size: 12px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 4px;
}

.help-sub {
    font-size: 11px;
    color: $text-dark;
    line-height: 1.5;
    margin-bottom: 8px;
}

.help-link {
    font-size: 12px;
    font-weight: 600;
    color: $red;
    &:hover { opacity: 0.8; }
}

// ── Center area ───────────────────────────────────────────────────────────────
.center-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.form-hero {
    min-height: 160px;
    background:
        linear-gradient(to right, rgba(5,5,5,0.92) 40%, rgba(5,5,5,0.5)),
        url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200&auto=format&fit=crop') center / cover;
    display: flex;
    align-items: center;
    padding: 32px 40px;
    flex-shrink: 0;
}

.form-hero-text {
    h1 {
        font-size: 30px;
        font-weight: 900;
        color: $text;
        margin-bottom: 6px;
    }
    p {
        font-size: 14px;
        color: $text-muted;
    }
}

// ── Progress track ────────────────────────────────────────────────────────────
.progress-track {
    display: flex;
    align-items: center;
    padding: 20px 40px;
    border-bottom: 1px solid $border;
    background: #070707;
    flex-shrink: 0;
}

.progress-node {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;

    &.pn-done {
        .pn-icon { background: rgba($red, 0.15); border-color: rgba($red, 0.4); color: $red; }
        .pn-label { color: $text-muted; }
        .pn-line { background: rgba($red, 0.3); }
    }

    &.pn-active {
        .pn-icon { background: $red; border-color: $red; color: white; }
        .pn-label { color: $text; font-weight: 600; }
    }
}

.pn-icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    border-radius: 50%;
    border: 1.5px solid $border;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dark;
    transition: all 0.2s;
}

.pn-label {
    font-size: 13px;
    color: $text-dark;
    white-space: nowrap;
}

.pn-line {
    flex: 1;
    height: 1px;
    background: $border;
    margin: 0 14px 0 14px;
}

// ── Form content ──────────────────────────────────────────────────────────────
.form-content {
    padding: 32px 40px 24px;
    flex: 1;
}

.form-section-head {
    margin-bottom: 28px;

    h2 {
        font-size: 22px;
        font-weight: 800;
        color: $text;
        margin-bottom: 4px;
    }

    p {
        font-size: 13px;
        color: $text-dim;
    }
}

.fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.flabel {
    font-size: 12px;
    font-weight: 600;
    color: $text-dim;
    letter-spacing: 0.2px;
}

.req { color: $red; }

.fselect, .finput {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;

    &:focus { border-color: rgba($red, 0.5); }
    &::placeholder { color: $text-dark; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.fselect { cursor: pointer; padding-right: 36px; }

.finput-price {
    border-color: rgba($red, 0.4);
    &:focus { border-color: $red; }
}

.select-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.sel-arrow {
    position: absolute;
    right: 12px;
    color: $text-dim;
    pointer-events: none;
}

.input-icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.input-prefix {
    position: absolute;
    left: 12px;
    color: $text-dim;
    pointer-events: none;
    z-index: 1;

    &.in-select { z-index: 1; }
}

.finput.has-prefix,
.fselect.has-prefix {
    padding-left: 36px;
}

// ── VIN bar ───────────────────────────────────────────────────────────────────
.vin-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 16px 20px;
}

.vin-doc-icon { color: $text-dark; flex-shrink: 0; }

.vin-text { flex: 1; min-width: 0; }

.vin-title {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    margin-bottom: 2px;
}

.vin-sub {
    font-size: 12px;
    color: $text-dark;
}

.vin-input {
    width: 180px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 9px 12px;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    outline: none;
    letter-spacing: 1px;
    transition: border-color 0.2s;
    &::placeholder { color: $text-dark; letter-spacing: 0; }
    &:focus { border-color: rgba($red, 0.5); }
}

.vin-btn {
    background: transparent;
    border: 1px solid rgba($red, 0.5);
    border-radius: $r-sm;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 18px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    transition: background 0.2s;
    &:hover { background: rgba($red, 0.08); }
}

.form-section-subhead {
    font-size: 13px; font-weight: 700; color: $text-muted; text-transform: uppercase;
    letter-spacing: 0.5px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid $border;
}

.photo-count-bar {
    display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500;
    padding: 8px 14px; border-radius: $r-sm; margin-bottom: 16px;
    &.pc-ok { color: #4caf50; background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2); }
    &.pc-warn { color: #ff9800; background: rgba(255,152,0,0.08); border: 1px solid rgba(255,152,0,0.2); }
}

// ── Form actions ──────────────────────────────────────────────────────────────
.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-top: 1px solid $border;
    background: $bg;
    flex-shrink: 0;
}

.form-actions-left { display: flex; align-items: center; gap: 14px; }

.step-error {
    display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ff9800;
}

.fade-err-enter-active, .fade-err-leave-active { transition: opacity 0.3s; }
.fade-err-enter-from, .fade-err-leave-to { opacity: 0; }

.btn-cancel {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 14px;
    font-weight: 500;
    padding: 11px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-next {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 11px 28px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── Bottom strip ──────────────────────────────────────────────────────────────
.bottom-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border-top: 1px solid $border;
    flex-shrink: 0;
}

.strip-feat {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 18px 20px;
    border-right: 1px solid $border;

    &:last-child { border-right: none; }
}

.strip-icon { color: $red; flex-shrink: 0; margin-top: 2px; }

.strip-title {
    font-size: 12px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 3px;
}

.strip-desc {
    font-size: 11px;
    color: $text-dark;
    line-height: 1.4;
}

// ── Right panel ───────────────────────────────────────────────────────────────
.right-panel {
    width: 268px;
    min-width: 268px;
    border-left: 1px solid $border;
    background: #070707;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.score-card {
    padding: 22px 20px;
    border-bottom: 1px solid $border;
}

.score-card-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 16px;
}

.score-circle-area {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
}

.score-num {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    line-height: 1;
}

.score-val {
    display: block;
    font-size: 30px;
    font-weight: 900;
    color: $text;
}

.score-denom {
    display: block;
    font-size: 12px;
    color: $text-dim;
    margin-top: 2px;
}

.score-desc {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.6;
    margin-bottom: 10px;
}

.score-link {
    font-size: 12px;
    font-weight: 600;
    color: $red;
    display: block;
    margin-bottom: 16px;
    &:hover { opacity: 0.8; }
}

.score-factors { }

.sf-heading {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.sf-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
    font-size: 12px;
    color: $text-dark;

    &.sf-done {
        color: $text-muted;
        .sf-check-box { background: rgba(45, 122, 58, 0.2); border-color: rgba(45, 122, 58, 0.5); color: #4caf50; }
    }
}

.sf-check-box {
    width: 16px;
    height: 16px;
    min-width: 16px;
    border-radius: 50%;
    border: 1.5px solid $border;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
}

// ── Preview card ──────────────────────────────────────────────────────────────
.preview-card {
    padding: 20px;
}

.preview-card-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 14px;
}

.preview-img-wrap {
    border-radius: $r-md;
    overflow: hidden;
    margin-bottom: 12px;
    img {
        width: 100%;
        height: 130px;
        object-fit: cover;
        display: block;
    }
}

.preview-details { margin-bottom: 14px; }

.preview-car-name {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 4px;
}

.preview-meta-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-dim;
    margin-bottom: 6px;
    flex-wrap: wrap;
}

.dot { color: $text-dark; }

.preview-price {
    font-size: 18px;
    font-weight: 800;
    color: $red;
}

.preview-full-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 500;
    padding: 9px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

// ── Photos step ───────────────────────────────────────────────────────────────
.img-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
}

.img-thumb {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: $r-md;
    overflow: hidden;
    border: 1px solid $border;
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
}

.img-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: rgba(0,0,0,0.9); }
}

.img-main-badge {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
}

.img-add {
    aspect-ratio: 4/3;
    border-radius: $r-md;
    border: 2px dashed $border;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    color: $text-dark;
    font-size: 12px;
    font-weight: 500;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $red; color: $red; }
}

// ── Details step ──────────────────────────────────────────────────────────────
.ftextarea {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 14px;
    outline: none;
    resize: vertical;
    transition: border-color 0.2s;
    &:focus { border-color: rgba($red, 0.5); }
    &::placeholder { color: $text-dark; }
}

.feat-group { margin-bottom: 20px; }

.feat-group-title {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.feat-checks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 6px;
}

.feat-check {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: $text-muted;

    input[type='checkbox'] {
        accent-color: $red;
        width: 14px;
        height: 14px;
    }
}
</style>
