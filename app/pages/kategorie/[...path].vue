<script setup lang="ts">
/**
 * Strony pośrednie: kategoria → marka → model.
 *
 *   /kategorie/osobowe            wszystkie auta osobowe
 *   /kategorie/osobowe/audi       wszystkie Audi
 *   /kategorie/osobowe/audi/q5    wszystkie Audi Q5
 *
 * DLACZEGO OSOBNA GAŁĄŹ ADRESÓW, A NIE /ogloszenia/...
 * Adres ogłoszenia ma teraz postać /ogloszenia/kategoria/marka/model/opis-ID123.
 * Gdyby strony pośrednie leżały pod tym samym prefiksem, adres o dwóch segmentach
 * („/ogloszenia/czesci/bosch") byłby jednocześnie poprawnym adresem listy marki
 * i poprawnym adresem ogłoszenia części bez modelu. Rozstrzyganie takiej
 * dwuznaczności to źródło błędów, które ujawniają się dopiero na produkcji.
 * Osobny prefiks usuwa problem u źródła: pod /ogloszenia/ są ogłoszenia,
 * pod /kategorie/ są listy.
 *
 * PO CO TE STRONY
 * To one, a nie strona główna, zbierają w tej branży ruch z wyszukiwarki.
 * Człowiek wpisuje „audi q5 używane", nie „portal z ogłoszeniami". Każda z nich
 * ma własny tytuł, opis, adres kanoniczny i dane strukturalne, a przez linki do
 * poziomu niżej buduje wyszukiwarce mapę tego, co serwis w ogóle ma.
 */
import type { CarAdvert, PagedResult, TaxonomyItem } from '~/types'

interface Category { id: number; name: string; slug?: string | null; iconName?: string | null }

const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { fetchCategories, fetchBrandsByCategory, fetchModels } = useTaxonomy()

const segments = computed(() => {
    const p = route.params.path
    return (Array.isArray(p) ? p : [p]).filter(Boolean).map(String)
})

// Więcej niż trzy poziomy nie istnieją — lepiej powiedzieć to wprost niż
// renderować pustą listę pod adresem, który wygląda na poprawny.
if (segments.value.length === 0 || segments.value.length > 3) {
    throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono takiej listy' })
}

const [categorySlug, brandSlug, modelSlug] = segments.value

/** Porównanie odporne na wielkość liter i polskie znaki — slug w adresie bywa uproszczony. */
const matches = (name: string | null | undefined, wanted: string) => slugifyPart(name) === slugifyPart(wanted)

const { data } = await useAsyncData(`kategorie-${segments.value.join('-')}`, async () => {
    const categories = await fetchCategories().catch(() => [] as Category[])
    const category = (categories as Category[]).find(
        c => matches(c.slug ?? null, categorySlug!) || matches(c.name, categorySlug!)
    )
    if (!category) return { notFound: true as const }

    let brand: TaxonomyItem | null = null
    let model: TaxonomyItem | null = null
    let childBrands: TaxonomyItem[] = []
    let childModels: TaxonomyItem[] = []

    const brands = await fetchBrandsByCategory(category.id).catch(() => [] as TaxonomyItem[])

    if (brandSlug) {
        brand = (brands ?? []).find(b => matches(b.name, brandSlug)) ?? null
        if (!brand) return { notFound: true as const }

        const models = await fetchModels(brand.id, category.id).catch(() => [] as TaxonomyItem[])
        if (modelSlug) {
            model = (models ?? []).find(m => matches(m.name, modelSlug)) ?? null
            if (!model) return { notFound: true as const }
        } else {
            childModels = models ?? []
        }
    } else {
        childBrands = brands ?? []
    }

    const results = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
        method: 'POST',
        body: {
            page: 1,
            pageSize: 24,
            sortBy: '',
            categoryId: category.id,
            brandId: brand?.id ?? undefined,
            modelId: model?.id ?? undefined,
        },
    }).catch(() => ({ items: [] as CarAdvert[], totalCount: 0 }))

    return {
        category,
        brand,
        model,
        childBrands,
        childModels,
        items: results?.items ?? [],
        total: results?.totalCount ?? 0,
    }
})

if (!data.value || 'notFound' in data.value) {
    // Prawdziwe 404, a nie pusta lista pod kodem 200 — inaczej wyszukiwarka
    // indeksuje i w kółko odwiedza adresy, które nic nie znaczą.
    throw createError({ statusCode: 404, statusMessage: 'Nie znaleziono takiej listy', fatal: true })
}

const category = computed(() => data.value && 'category' in data.value ? data.value.category : null)
const brand = computed(() => data.value && 'brand' in data.value ? data.value.brand : null)
const model = computed(() => data.value && 'model' in data.value ? data.value.model : null)
const items = computed(() => data.value && 'items' in data.value ? data.value.items : [])
const total = computed(() => data.value && 'total' in data.value ? data.value.total : 0)
const childBrands = computed(() => data.value && 'childBrands' in data.value ? data.value.childBrands : [])
const childModels = computed(() => data.value && 'childModels' in data.value ? data.value.childModels : [])

/** Nazwa listy, np. „Audi Q5". Używana w nagłówku, tytule i danych strukturalnych. */
const heading = computed(() => {
    if (model.value) return `${brand.value?.name} ${model.value.name}`
    if (brand.value) return `${brand.value.name} — ${category.value?.name}`
    return category.value?.name ?? ''
})

const canonical = computed(() => `${config.public.siteUrl}${localePath('/kategorie/' + segments.value.join('/'))}`)

/** Ścieżka do poziomu niżej — jedno miejsce, żeby linki i okruszki nie rozjechały się. */
const childPath = (extra: string) => localePath(`/kategorie/${[...segments.value, slugifyPart(extra)].join('/')}`)

/** Adres pełnej wyszukiwarki z już ustawionymi filtrami — stąd użytkownik zawęża dalej. */
const refineHref = computed(() => {
    const q = new URLSearchParams()
    if (category.value) q.set('categoryId', String(category.value.id))
    if (brand.value) q.set('brandId', String(brand.value.id))
    if (model.value) q.set('modelId', String(model.value.id))
    return localePath(`/adverts?${q.toString()}`)
})

const breadcrumbs = computed(() => {
    const out = [{ label: 'Ogłoszenia', href: localePath('/adverts') }]
    let acc = '/kategorie'
    const labels = [category.value?.name, brand.value?.name, model.value?.name]
    segments.value.forEach((seg, i) => {
        acc += `/${seg}`
        out.push({ label: labels[i] ?? seg, href: localePath(acc) })
    })
    return out
})

const opis = computed(() => {
    const co = heading.value
    const ile = total.value
    if (ile === 0) return `${co} — aktualnie brak ogłoszeń w tej kategorii na CARIZO.`
    return `${co} — ${ile.toLocaleString('pl')} ${ile === 1 ? 'ogłoszenie' : 'ogłoszeń'} na CARIZO. Porównaj oferty, sprawdź historię pojazdu i skontaktuj się ze sprzedawcą.`
})

useSeoMeta({
    title: () => `${heading.value} — ogłoszenia | CARIZO`,
    description: () => opis.value,
    ogTitle: () => `${heading.value} — ogłoszenia`,
    ogDescription: () => opis.value,
    ogUrl: () => canonical.value,
})

useHead(() => ({
    link: [{ rel: 'canonical', href: canonical.value }],
    script: [{
        type: 'application/ld+json',
        // Okruszki mówią wyszukiwarce, gdzie ta strona leży w hierarchii serwisu —
        // to one pozwalają pokazać w wynikach ścieżkę zamiast samego adresu.
        innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.value.map((b, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: b.label,
                item: `${config.public.siteUrl}${b.href}`,
            })),
        }),
    }],
}))
</script>

<template>
    <div class="kat-page">
        <div class="container">

            <nav class="kat-crumbs" aria-label="Ścieżka nawigacji">
                <template v-for="(b, i) in breadcrumbs" :key="b.href">
                    <NuxtLink v-if="i < breadcrumbs.length - 1" :to="b.href" class="kat-crumb">{{ b.label }}</NuxtLink>
                    <span v-else class="kat-crumb kat-crumb--now" aria-current="page">{{ b.label }}</span>
                    <CzIcon v-if="i < breadcrumbs.length - 1" icon="mdi-chevron-right" size="13" class="kat-crumb-sep" />
                </template>
            </nav>

            <header class="kat-head">
                <h1 class="kat-title">{{ heading }}</h1>
                <p class="kat-sub">
                    <strong>{{ total.toLocaleString('pl') }}</strong>
                    {{ total === 1 ? 'ogłoszenie' : 'ogłoszeń' }}
                </p>
                <NuxtLink :to="refineHref" class="kat-refine">
                    <CzIcon icon="mdi-tune-variant" size="16" />
                    Zawęź wyniki
                </NuxtLink>
            </header>

            <!--
                Linki o poziom niżej. To one budują wyszukiwarce mapę serwisu -
                bez nich strona kategorii jest ślepym zaułkiem, z którego nie da się
                dojść do "Audi Q5" inaczej niż przez formularz.
            -->
            <section v-if="childBrands.length" class="kat-children" aria-labelledby="kat-brands-h">
                <h2 id="kat-brands-h" class="kat-children-title">Marki w tej kategorii</h2>
                <div class="kat-chips">
                    <NuxtLink v-for="b in childBrands" :key="b.id" :to="childPath(b.name)" class="kat-chip">{{ b.name }}</NuxtLink>
                </div>
            </section>

            <section v-else-if="childModels.length" class="kat-children" aria-labelledby="kat-models-h">
                <h2 id="kat-models-h" class="kat-children-title">Modele marki {{ brand?.name }}</h2>
                <div class="kat-chips">
                    <NuxtLink v-for="m in childModels" :key="m.id" :to="childPath(m.name)" class="kat-chip">{{ m.name }}</NuxtLink>
                </div>
            </section>

            <section aria-label="Ogłoszenia">
                <div v-if="items.length" class="cars-grid">
                    <AdvertCard v-for="a in items" :key="a.id" :advert="a" />
                </div>
                <div v-else class="kat-empty">
                    <CzIcon icon="mdi-car-off" size="48" />
                    <p>Nie ma jeszcze ogłoszeń w tej kategorii.</p>
                    <NuxtLink :to="localePath('/adverts')" class="kat-refine">Zobacz wszystkie ogłoszenia</NuxtLink>
                </div>
            </section>

            <div v-if="total > items.length" class="kat-more">
                <NuxtLink :to="refineHref" class="kat-more-btn">
                    Zobacz wszystkie {{ total.toLocaleString('pl') }} ogłoszeń
                    <CzIcon icon="mdi-arrow-right" size="17" />
                </NuxtLink>
            </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.kat-page {
    min-height: 100vh;
    padding-top: calc(#{$nav-height} + #{$s-6});
    padding-bottom: $s-16;
    background: $bg;
}

.kat-crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $s-1;
    margin-bottom: $s-4;
    font-size: $fs-sm;
}

.kat-crumb {
    color: $text-dim;
    text-decoration: none;
    &:hover { color: $text; }
    &--now { color: $text; font-weight: $fw-semibold; }
}

.kat-crumb-sep { color: $text-dark; }

.kat-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: $s-3 $s-5;
    margin-bottom: $s-7;
    padding-bottom: $s-4;
    border-bottom: 1px solid $border;
}

.kat-title {
    margin: 0;
    font-size: $fs-3xl;
    font-weight: $fw-black;
    letter-spacing: -1px;
    color: $text;
    text-wrap: balance;

    @media (max-width: $bp-mobile) { font-size: $fs-xl; letter-spacing: -0.5px; }
}

.kat-sub {
    margin: 0;
    color: $text-dim;
    font-size: $fs-base;
    strong { color: $text; font-variant-numeric: tabular-nums; }
}

.kat-refine {
    display: inline-flex;
    align-items: center;
    gap: $s-2;
    margin-left: auto;
    min-height: $touch-min;
    padding: 0 $s-4;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    text-decoration: none;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    transition: border-color $t-fast, color $t-fast;

    &:hover { border-color: rgba($red, 0.45); color: $text; }
    @media (max-width: $bp-mobile) { margin-left: 0; }
}

.kat-children { margin-bottom: $s-7; }

.kat-children-title {
    margin: 0 0 $s-3;
    font-size: $fs-xs;
    font-weight: $fw-bold;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $text-dark;
}

.kat-chips {
    display: flex;
    flex-wrap: wrap;
    gap: $s-2;
}

.kat-chip {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 $s-35;
    border: 1px solid $border;
    border-radius: $r-pill;
    background: rgba(255,255,255,0.02);
    color: $text-muted;
    text-decoration: none;
    font-size: $fs-sm;
    font-weight: $fw-medium;
    transition: border-color $t-fast, color $t-fast, background $t-fast;

    &:hover {
        border-color: rgba($red, 0.45);
        background: rgba($red, 0.06);
        color: $text;
    }
}

.cars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: $s-5;

    @media (max-width: $bp-mobile) {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: $s-3;
    }
}

.kat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $s-3;
    padding: $s-16 $s-4;
    color: $text-dim;
    text-align: center;

    .cz-icon { color: $text-dark; }
    p { margin: 0; }
}

.kat-more {
    display: flex;
    justify-content: center;
    margin-top: $s-8;
}

.kat-more-btn {
    display: inline-flex;
    align-items: center;
    gap: $s-2;
    min-height: $touch-min;
    padding: 0 $s-6;
    border-radius: $r-sm;
    background: $red;
    color: #fff;
    text-decoration: none;
    font-size: $fs-base;
    font-weight: $fw-bold;
    &:hover { background: $red-bright; }
}
</style>
