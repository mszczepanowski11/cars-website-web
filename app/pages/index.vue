<template>
    <div class="home">

        <section class="hero">
            <div class="hero-bg" />
            <div class="container hero-inner">
                <div>
                    <h1 class="hero-title">Znajdź swoje <span>wymarzone auto</span></h1>
                    <p class="hero-sub">Tysiące sprawdzonych ogłoszeń od osób prywatnych i dealerów w jednym miejscu.
                    </p>

                    <div class="stats">
                        <div class="stat">
                            <div class="stat-num">{{ totalAdverts.toLocaleString('pl') }}</div>
                            <div class="stat-label">Ogłoszeń</div>
                        </div>
                        <div class="stat">
                            <div class="stat-num">12 450</div>
                            <div class="stat-label">Użytkowników</div>
                        </div>
                        <div class="stat">
                            <div class="stat-num">5 230</div>
                            <div class="stat-label">Sprzedanych aut</div>
                        </div>
                    </div>

                    <div class="search-box">
                        <v-select v-model="search.brandId" :items="brands" item-title="name" item-value="id"
                            label="Marka" hide-details clearable @update:model-value="onBrandChange" />
                        <v-select v-model="search.modelId" :items="models" item-title="name" item-value="id"
                            label="Model" hide-details clearable :disabled="!search.brandId" />
                        <v-text-field v-model.number="search.priceFrom" label="Cena od" hide-details type="number" />
                        <v-text-field v-model.number="search.priceTo" label="Cena do" hide-details type="number" />
                        <v-select v-model="search.bodyTypeId" :items="bodyTypes" item-title="name" item-value="id"
                            label="Typ nadwozia" hide-details clearable />
                        <v-btn color="primary" height="58" @click="doSearch">Szukaj</v-btn>
                    </div>
                </div>

            </div>
        </section>

      

        <BudgetSection />

        <section class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Promowane ogłoszenia</h2>
                    <NuxtLink to="/adverts" class="see-all">Zobacz wszystkie</NuxtLink>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in featured" :key="a.id" :advert="a" />
                </div>
            </div>
        </section>

        

        <section class="section">
            <div class="container">
                <div class="feat-grid">
                    <div v-for="f in feats" :key="f.title" class="feat-card">
                        <h3>{{ f.title }}</h3>
                        <p>{{ f.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container">
                <div class="newsletter">
                    <div>
                        <h2>Bądź na bieżąco</h2>
                        <p>Zapisz się do newslettera i otrzymuj najlepsze oferty.</p>
                    </div>
                    <div class="news-form">
                        <v-text-field v-model="email" label="Twój adres email" hide-details />
                        <v-btn color="primary" height="58" min-width="160">Zapisz się</v-btn>
                    </div>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import type { TaxonomyItem, CarAdvert, PagedResult } from '~/types'

const config = useRuntimeConfig()
const base = config.public.apiBase
const { fetchBrands, fetchModels, fetchBodyTypes } = useTaxonomy()
const { fetchFavoriteIds } = useFavorites()

const brands = ref<TaxonomyItem[]>([])
const models = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])
const featured = ref<CarAdvert[]>([])
const totalAdverts = ref(28540)
const email = ref('')

const search = reactive({
    brandId: null as number | null,
    modelId: null as number | null,
    priceFrom: null as number | null,
    priceTo: null as number | null,
    bodyTypeId: null as number | null,
})

const categories = [
    { label: 'Samochody', count: '28 540', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop' },
    { label: 'Motocykle', count: '1 230', img: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=800&auto=format&fit=crop' },
    { label: 'Dostawcze', count: '3 210', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop' },
    { label: 'Części', count: '5 430', img: 'https://motomarks.io/img/porsche?size=lg' },
]

const feats = [
    { title: 'Bezpieczne transakcje', desc: 'Weryfikujemy ogłoszenia i dbamy o bezpieczeństwo użytkowników.' },
    { title: 'Darmowe ogłoszenia', desc: 'Dodawaj auta bez ukrytych kosztów i docieraj do tysięcy osób.' },
    { title: 'Promowanie ofert', desc: 'Wyróżnij swoje auto i sprzedaj szybciej dzięki promocji.' },
    { title: 'Wsparcie 24/7', desc: 'Nasz zespół jest dostępny zawsze kiedy potrzebujesz pomocy.' },
]

async function onBrandChange() {
    search.modelId = null
    models.value = []
    if (search.brandId) models.value = await fetchModels(search.brandId)
}

function doSearch() {
    const q: Record<string, string> = {}
    if (search.brandId) q.brandId = String(search.brandId)
    if (search.modelId) q.modelId = String(search.modelId)
    if (search.priceFrom) q.priceFrom = String(search.priceFrom)
    if (search.priceTo) q.priceTo = String(search.priceTo)
    if (search.bodyTypeId) q.bodyTypeId = String(search.bodyTypeId)
    navigateTo({ path: '/adverts', query: q })
}

onMounted(async () => {
    ;[brands.value, bodyTypes.value] = await Promise.all([fetchBrands(), fetchBodyTypes()])
    try {
        const r = await $fetch<PagedResult<CarAdvert>>(`${base}api/Advert?page=1&pageSize=3`)
        featured.value = r.items
        totalAdverts.value = r.totalCount
    } catch { }
})
</script>

<style lang="scss" scoped>
.home {
    background: $bg;
}

.container {
    @include container;
}

// Hero
.hero {
    padding-top: 130px;
    position: relative;
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to bottom, rgba(0, 0, 0, 0.55), $bg),
        url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop') center / cover;
    opacity: 0.3;
}

.hero-inner {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 40px;
    padding-bottom: 80px;

    @include respond-to(md) {
        grid-template-columns: 1fr;
    }
}

.hero-title {
    font-size: 72px;
    line-height: 1.05;
    font-weight: 900;
    color: $text;

    span {
        color: $red;
    }

    @include respond-to(md) {
        font-size: 52px;
    }

    @include respond-to(sm) {
        font-size: 40px;
    }
}

.hero-sub {
    margin-top: 25px;
    color: $text-muted;
    font-size: 18px;
    line-height: 1.7;
}

.hero-car {
    img {
        width: 100%;
        filter: drop-shadow(0 0 70px $red-glow);
    }

    @include respond-to(md) {
        display: none;
    }
}

// Stats
.stats {
    display: flex;
    gap: 45px;
    margin-top: 40px;

    @include respond-to(sm) {
        flex-wrap: wrap;
        gap: 25px;
    }
}

.stat-num {
    font-size: 32px;
    font-weight: 800;
    color: $text;
}

.stat-label {
    color: $text-dim;
    font-size: 14px;
}

// Search bar
.search-box {
    margin-top: 45px;
    @include card($r-xl);
    padding: 22px;
    display: grid;
    grid-template-columns: repeat(5, 1fr) 160px;
    gap: 16px;

    @include respond-to(md) {
        grid-template-columns: 1fr 1fr;
    }

    @include respond-to(sm) {
        grid-template-columns: 1fr;
    }
}

// Sections
.section {
    margin-top: 90px;
}

.sec-top {
    @include section-top;

    .see-all {
        color: $red;
    }
}

// Categories
.cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 22px;
}

.cat-card {
    background: $card-alt;
    border: 1px solid $border-alt;
    border-radius: 22px;
    overflow: hidden;
    color: $text;
    display: block;
    transition: transform 0.3s ease, border-color 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: $red-fade;
    }

    img {
        width: 100%;
        height: 170px;
        object-fit: cover;
        display: block;
    }
}

.cat-body {
    padding: 20px;

    h3 {
        margin-bottom: 8px;
        font-weight: 600;
    }

    span {
        color: $text-dim;
        font-size: 14px;
    }
}

// Cars grid
.cars-grid {
    @include cars-grid;
}

// Feature cards
.feat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 22px;
}

.feat-card {
    @include card;
    padding: 30px;

    h3 {
        color: $text;
        font-weight: 700;
        margin-bottom: 12px;
    }

    p {
        color: $text-dim;
        line-height: 1.7;
    }
}

// Newsletter
.newsletter {
    background: linear-gradient(135deg, $card, #120306);
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 45px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;

    h2 {
        font-size: 36px;
        font-weight: 800;
        color: $text;
    }

    p {
        color: $text-dim;
        margin-top: 10px;
    }

    @include respond-to(sm) {
        flex-direction: column;
        align-items: flex-start;
    }
}

.news-form {
    display: flex;
    gap: 15px;
    width: 100%;
    max-width: 500px;
    align-items: flex-start;

    @include respond-to(sm) {
        flex-direction: column;
    }
}
</style>