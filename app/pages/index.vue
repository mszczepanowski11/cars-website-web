<template>
    <div class="home">

        <section class="hero">
            <div class="hero-bg" />
            <div class="container hero-inner">
                <span class="hero-badge">Premium Marketplace</span>
                <h1 class="hero-title">
                    Motoryzacja<br>
                    <span>Zasługuje</span><br>
                    Na Więcej.
                </h1>
                <p class="hero-sub">Tysiące sprawdzonych ogłoszeń od osób prywatnych i dealerów w jednym miejscu.</p>
                <div class="hero-ctas">
                    <NuxtLink to="/adverts" class="cta-primary">
                        Odkryj auta
                        <v-icon size="18" class="ml-1">mdi-arrow-right</v-icon>
                    </NuxtLink>
                    <button class="cta-ghost">
                        <span class="play-btn"><v-icon size="14">mdi-play</v-icon></span>
                        Jak to działa?
                    </button>
                </div>
            </div>
            <div class="hero-strip">
                <div class="container strip-inner">
                    <div v-for="f in heroFeats" :key="f.title" class="strip-item">
                        <v-icon :icon="f.icon" size="20" class="strip-icon" />
                        <div>
                            <div class="strip-title">{{ f.title }}</div>
                            <div class="strip-desc">{{ f.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="search-section">
            <div class="container">
                <div class="search-box">
                    <div class="search-field">
                        <div class="field-label">Marka</div>
                        <v-select v-model="search.brandId" :items="brands" item-title="name" item-value="id"
                            hide-details clearable placeholder="Wszystkie" variant="plain" density="compact"
                            @update:model-value="onBrandChange" />
                    </div>
                    <div class="search-divider" />
                    <div class="search-field">
                        <div class="field-label">Model</div>
                        <v-select v-model="search.modelId" :items="models" item-title="name" item-value="id"
                            hide-details clearable placeholder="Wszystkie" variant="plain" density="compact"
                            :disabled="!search.brandId" />
                    </div>
                    <div class="search-divider" />
                    <div class="search-field">
                        <div class="field-label">Cena</div>
                        <div class="price-range">
                            <v-text-field v-model.number="search.priceFrom" hide-details type="number"
                                placeholder="Od" variant="plain" density="compact" />
                            <span class="price-dash">–</span>
                            <v-text-field v-model.number="search.priceTo" hide-details type="number"
                                placeholder="Do" variant="plain" density="compact" />
                        </div>
                    </div>
                    <div class="search-divider" />
                    <div class="search-field">
                        <div class="field-label">Typ nadwozia</div>
                        <v-select v-model="search.bodyTypeId" :items="bodyTypes" item-title="name" item-value="id"
                            hide-details clearable placeholder="Wszystkie" variant="plain" density="compact" />
                    </div>
                    <button class="search-btn" @click="doSearch">Szukaj</button>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Promowane ogłoszenia</h2>
                    <NuxtLink to="/adverts" class="see-all">
                        Zobacz wszystkie
                        <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                    </NuxtLink>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in featured" :key="a.id" :advert="a" />
                </div>
            </div>
        </section>

        <BudgetSection />

        <section class="section">
            <div class="container">
                <h2 class="why-title">Dlaczego CAR<span>IZO</span>?</h2>
                <div class="why-grid">
                    <div v-for="f in feats" :key="f.title" class="why-card">
                        <div class="why-icon">
                            <v-icon :icon="f.icon" size="22" />
                        </div>
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
                        <v-text-field v-model="email" label="Twój adres email" hide-details variant="outlined" />
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

const heroFeats = [
    { icon: 'mdi-shield-check-outline', title: 'Sprawdzone ogłoszenia', desc: 'Weryfikujemy każdego sprzedawcę' },
    { icon: 'mdi-lock-outline', title: 'Bezpieczne transakcje', desc: 'Twoje bezpieczeństwo to nasz priorytet' },
    { icon: 'mdi-headset', title: 'Wsparcie 24/7', desc: 'Zawsze jesteśmy online' },
    { icon: 'mdi-tag-off-outline', title: 'Bez ukrytych kosztów', desc: '0% prowizji dla kupujących' },
]

const feats = [
    { icon: 'mdi-star-outline', title: 'Premium jakość', desc: 'Tylko starannie wybrane ogłoszenia od najlepszych ludzi i dealerów.' },
    { icon: 'mdi-block-helper', title: 'Zero spamów', desc: 'Dbamy o porządek dzięki wyspecjalizowanym filtrom i szybkiej weryfikacji.' },
    { icon: 'mdi-lightning-bolt-outline', title: 'Nowoczesna platforma', desc: 'Intuicyjna obsługa, szybkie wyszukiwanie i najlepiej działające filtry.' },
    { icon: 'mdi-heart-outline', title: 'Stworzona z pasji', desc: 'CARIZO to nie tylko platforma. To społeczność ludzi, którzy kochają motoryzację.' },
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

// ── Hero ──────────────────────────────────────────────────────────────────────
.hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to right, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.4)),
        linear-gradient(to bottom, rgba(0,0,0,0.3), $bg),
        url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop') center / cover;
    opacity: 0.6;
}

.hero-inner {
    position: relative;
    z-index: 2;
    padding-top: calc($nav-height + 90px);
    padding-bottom: 60px;
    max-width: 700px;
}

.hero-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: $red;
    border: 1px solid rgba($red, 0.4);
    border-radius: 4px;
    padding: 5px 12px;
    margin-bottom: 28px;
}

.hero-title {
    font-size: clamp(48px, 7vw, 88px);
    font-weight: 900;
    line-height: 1.0;
    color: $text;
    text-transform: uppercase;
    letter-spacing: -1px;

    span { color: $red; }
}

.hero-sub {
    margin-top: 24px;
    color: $text-muted;
    font-size: 17px;
    line-height: 1.7;
    max-width: 480px;
}

.hero-ctas {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 40px;

    @include respond-to(xs) { flex-direction: column; align-items: flex-start; }
}

.cta-primary {
    display: inline-flex;
    align-items: center;
    background: $red;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 28px;
    border-radius: $r-sm;
    text-decoration: none;
    transition: background 0.2s;

    &:hover { background: darken($red, 8%); }
}

.cta-ghost {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    color: $text-muted;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    border: none;
    padding: 0;
    transition: color 0.2s;

    &:hover { color: $text; }
}

.play-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text;
    flex-shrink: 0;
}

// Feature strip at bottom of hero
.hero-strip {
    position: relative;
    z-index: 2;
    border-top: 1px solid rgba(255,255,255,0.07);
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    padding: 28px 0;
}

.strip-inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.strip-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
}

.strip-icon {
    color: $red;
    flex-shrink: 0;
    margin-top: 2px;
}

.strip-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 3px;
}

.strip-desc {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.5;
}

// ── Search section ────────────────────────────────────────────────────────────
.search-section {
    padding: 40px 0;
    background: $bg;
}

.search-box {
    @include card($r-lg);
    padding: 0;
    display: flex;
    align-items: stretch;
    overflow: hidden;
}

.search-field {
    flex: 1;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;

    .v-input { flex: 1; }

    @include respond-to(md) {
        padding: 14px 16px;
    }
}

.field-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: $text-dim;
}

.price-range {
    display: flex;
    align-items: center;
    gap: 4px;
}

.price-dash {
    color: $text-faint;
    font-size: 14px;
    flex-shrink: 0;
}

.search-divider {
    width: 1px;
    background: $border;
    align-self: stretch;
    margin: 16px 0;

    @include respond-to(md) { display: none; }
}

.search-btn {
    flex-shrink: 0;
    padding: 0 40px;
    background: $red;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    letter-spacing: 0.5px;

    &:hover { background: darken($red, 8%); }

    @include respond-to(md) {
        width: 100%;
        padding: 16px;
        border-radius: 0 0 $r-lg $r-lg;
    }
}

@include respond-to(md) {
    .search-box {
        flex-direction: column;
    }
}

// ── Sections ──────────────────────────────────────────────────────────────────
.section {
    margin-top: 90px;
}

.sec-top {
    @include section-top;

    .see-all {
        display: inline-flex;
        align-items: center;
        color: $red;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        transition: opacity 0.2s;

        &:hover { opacity: 0.75; }
    }
}

.cars-grid {
    @include cars-grid;
}

// ── Why CARIZO ────────────────────────────────────────────────────────────────
.why-title {
    font-size: 36px;
    font-weight: 800;
    color: $text;
    margin-bottom: 40px;

    span { color: $red; }
}

.why-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.why-card {
    @include card;
    padding: 30px;
    transition: border-color 0.25s, transform 0.25s;

    &:hover {
        border-color: rgba($red, 0.4);
        transform: translateY(-4px);
    }

    h3 {
        color: $text;
        font-weight: 700;
        font-size: 16px;
        margin: 16px 0 10px;
    }

    p {
        color: $text-dim;
        font-size: 14px;
        line-height: 1.7;
    }
}

.why-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
}

// ── Newsletter ────────────────────────────────────────────────────────────────
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

    @include respond-to(sm) { flex-direction: column; }
}
</style>
