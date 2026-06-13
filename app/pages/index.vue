<template>
    <div class="home">

        <!-- Hero -->
        <section class="hero">
            <div class="hero-car-bg">
                <img src="/hero-car.jpg" alt="" />
            </div>
            <div class="container hero-inner">
                <div class="hero-content">
                    <div class="hero-eyebrow">Nowa era motoryzacji</div>
                    <h1 class="hero-title">
                        Motoryzacja.<br>
                        <span>W lepszym</span> wydaniu.
                    </h1>
                    <p class="hero-sub">
                        CARIZO to więcej niż portal ogłoszeniowy.<br>
                        To miejsce, gdzie technologia spotyka pasję do motoryzacji.
                    </p>
                    <div class="hero-badges">
                        <div class="hero-badge">
                            <v-icon icon="mdi-shield-check-outline" size="20" />
                            <span>Zweryfikowane ogłoszenia</span>
                        </div>
                        <div class="hero-badge">
                            <v-icon icon="mdi-account-group-outline" size="20" />
                            <span>Zaufani sprzedawcy</span>
                        </div>
                        <div class="hero-badge">
                            <v-icon icon="mdi-chart-line" size="20" />
                            <span>Inteligentne narzędzia</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Search & Filters -->
        <div class="search-section">
            <div class="container">

                <!-- Category tabs -->
                <div class="cat-tabs-wrap">
                    <div class="cat-tabs">
                        <button
                            class="cat-tab"
                            :class="{ 'cat-tab--active': selectedCategoryId === null }"
                            @click="selectCategory(null)"
                        >
                            <v-icon icon="mdi-view-grid-outline" size="15" />
                            Wszystkie
                        </button>
                        <button
                            v-for="cat in searchCategories"
                            :key="cat.id"
                            class="cat-tab"
                            :class="{ 'cat-tab--active': selectedCategoryId === cat.id }"
                            @click="selectCategory(cat)"
                        >
                            <v-icon :icon="cat.iconName ?? 'mdi-car'" size="15" />
                            {{ cat.name }}
                        </button>
                    </div>
                </div>

                <!-- Search bar -->
                <div class="search-bar" :class="{ 'search-bar--focus': searchFocused }">
                    <v-icon icon="mdi-magnify" size="20" class="sbar-icon" />
                    <input
                        v-model="searchText"
                        class="sbar-input"
                        :placeholder="searchPlaceholder"
                        @keyup.enter="doSearch"
                        @focus="searchFocused = true"
                        @blur="searchFocused = false"
                    />
                    <button v-if="hasActiveFilters" class="sbar-clear" @click="clearFilters" title="Wyczyść filtry">
                        <v-icon icon="mdi-close-circle" size="16" />
                        Wyczyść
                    </button>
                    <button class="sbar-btn" @click="doSearch">
                        <v-icon icon="mdi-magnify" size="16" />
                        Szukaj
                    </button>
                </div>

                <!-- Filter grid -->
                <div class="filter-grid">
                    <!-- Marka -->
                    <div v-if="show('brand')" class="fg-field">
                        <div class="fg-label">
                            <v-icon icon="mdi-car-outline" size="13" />
                            Marka
                        </div>
                        <select v-model="fBrand" class="fg-select" :disabled="brandsLoading" @change="fModel = null">
                            <option :value="null">{{ brandsLoading ? 'Ładowanie...' : 'Wszystkie marki' }}</option>
                            <option v-for="b in filterBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                    </div>

                    <!-- Paliwo -->
                    <div v-if="show('fuel')" class="fg-field">
                        <div class="fg-label">
                            <v-icon icon="mdi-gas-station-outline" size="13" />
                            Paliwo
                        </div>
                        <select v-model="fFuelType" class="fg-select">
                            <option :value="null">Każde paliwo</option>
                            <option v-for="ft in filterFuelTypes" :key="ft.id" :value="ft.id">{{ ft.name }}</option>
                        </select>
                    </div>

                    <!-- Nadwozie -->
                    <div v-if="show('body')" class="fg-field">
                        <div class="fg-label">
                            <v-icon icon="mdi-car-estate" size="13" />
                            Nadwozie
                        </div>
                        <select v-model="fBodyType" class="fg-select">
                            <option :value="null">Każde nadwozie</option>
                            <option v-for="bt in filterBodyTypes" :key="bt.id" :value="bt.id">{{ bt.name }}</option>
                        </select>
                    </div>

                    <!-- Pojemność silnika (motocykle) -->
                    <div v-if="show('engineCC')" class="fg-field fg-field--range">
                        <div class="fg-label">
                            <v-icon icon="mdi-engine-outline" size="13" />
                            Pojemność (cm³)
                        </div>
                        <div class="fg-range">
                            <input v-model="fEngineCCFrom" type="number" class="fg-input" placeholder="od" min="0" @keyup.enter="doSearch" />
                            <span class="fg-dash">—</span>
                            <input v-model="fEngineCCTo" type="number" class="fg-input" placeholder="do" min="0" @keyup.enter="doSearch" />
                        </div>
                    </div>

                    <!-- Moc (maszyny/rolnicze/budowlane) -->
                    <div v-if="show('power')" class="fg-field fg-field--range">
                        <div class="fg-label">
                            <v-icon icon="mdi-lightning-bolt" size="13" />
                            Moc (KM)
                        </div>
                        <div class="fg-range">
                            <input v-model="fPowerFrom" type="number" class="fg-input" placeholder="od" min="0" @keyup.enter="doSearch" />
                            <span class="fg-dash">—</span>
                            <input v-model="fPowerTo" type="number" class="fg-input" placeholder="do" min="0" @keyup.enter="doSearch" />
                        </div>
                    </div>

                    <!-- Ładowność (przyczepy) -->
                    <div v-if="show('payload')" class="fg-field fg-field--range">
                        <div class="fg-label">
                            <v-icon icon="mdi-weight" size="13" />
                            Ładowność (kg)
                        </div>
                        <div class="fg-range">
                            <input v-model="fPayloadFrom" type="number" class="fg-input" placeholder="od" min="0" @keyup.enter="doSearch" />
                            <span class="fg-dash">—</span>
                            <input v-model="fPayloadTo" type="number" class="fg-input" placeholder="do" min="0" @keyup.enter="doSearch" />
                        </div>
                    </div>

                    <!-- Cena -->
                    <div class="fg-field fg-field--range">
                        <div class="fg-label">
                            <v-icon icon="mdi-currency-usd" size="13" />
                            Cena (zł)
                        </div>
                        <div class="fg-range">
                            <input v-model="fPriceFrom" type="number" class="fg-input" placeholder="od" min="0" @keyup.enter="doSearch" />
                            <span class="fg-dash">—</span>
                            <input v-model="fPriceTo" type="number" class="fg-input" placeholder="do" min="0" @keyup.enter="doSearch" />
                        </div>
                    </div>

                    <!-- Rok -->
                    <div class="fg-field fg-field--range">
                        <div class="fg-label">
                            <v-icon icon="mdi-calendar-outline" size="13" />
                            Rok produkcji
                        </div>
                        <div class="fg-range">
                            <input v-model="fYearFrom" type="number" class="fg-input" placeholder="od" min="1900" @keyup.enter="doSearch" />
                            <span class="fg-dash">—</span>
                            <input v-model="fYearTo" type="number" class="fg-input" placeholder="do" min="1900" @keyup.enter="doSearch" />
                        </div>
                    </div>

                    <!-- Przebieg -->
                    <div v-if="show('mileage')" class="fg-field fg-field--range">
                        <div class="fg-label">
                            <v-icon icon="mdi-speedometer" size="13" />
                            Przebieg (km)
                        </div>
                        <div class="fg-range">
                            <input v-model="fMileageFrom" type="number" class="fg-input" placeholder="od" min="0" @keyup.enter="doSearch" />
                            <span class="fg-dash">—</span>
                            <input v-model="fMileageTo" type="number" class="fg-input" placeholder="do" min="0" @keyup.enter="doSearch" />
                        </div>
                    </div>
                </div>

                <!-- Active filter chips -->
                <div v-if="hasActiveFilters" class="filter-chips">
                    <div v-if="selectedCategoryId" class="filter-chip filter-chip--cat" @click="selectCategory(null)">
                        <v-icon :icon="searchCategories.find(c => c.id === selectedCategoryId)?.iconName ?? 'mdi-car'" size="11" />
                        {{ searchCategories.find(c => c.id === selectedCategoryId)?.name }}
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fBrand" class="filter-chip" @click="fBrand = null">
                        {{ filterBrands.find(b => b.id === fBrand)?.name }}
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fFuelType" class="filter-chip" @click="fFuelType = null">
                        {{ filterFuelTypes.find(f => f.id === fFuelType)?.name }}
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fBodyType" class="filter-chip" @click="fBodyType = null">
                        {{ filterBodyTypes.find(b => b.id === fBodyType)?.name }}
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fEngineCCFrom || fEngineCCTo" class="filter-chip" @click="fEngineCCFrom = ''; fEngineCCTo = ''">
                        Poj.: {{ fEngineCCFrom || '0' }} – {{ fEngineCCTo || '∞' }} cm³
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fPowerFrom || fPowerTo" class="filter-chip" @click="fPowerFrom = ''; fPowerTo = ''">
                        Moc: {{ fPowerFrom || '0' }} – {{ fPowerTo || '∞' }} KM
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fPayloadFrom || fPayloadTo" class="filter-chip" @click="fPayloadFrom = ''; fPayloadTo = ''">
                        Ład.: {{ fPayloadFrom || '0' }} – {{ fPayloadTo || '∞' }} kg
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fPriceFrom || fPriceTo" class="filter-chip" @click="fPriceFrom = ''; fPriceTo = ''">
                        Cena: {{ fPriceFrom || '0' }} – {{ fPriceTo || '∞' }} zł
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fYearFrom || fYearTo" class="filter-chip" @click="fYearFrom = ''; fYearTo = ''">
                        Rok: {{ fYearFrom || '?' }} – {{ fYearTo || '?' }}
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                    <div v-if="fMileageFrom || fMileageTo" class="filter-chip" @click="fMileageFrom = ''; fMileageTo = ''">
                        Przebieg: {{ fMileageFrom || '0' }} – {{ fMileageTo || '∞' }} km
                        <v-icon icon="mdi-close" size="11" />
                    </div>
                </div>

            </div>
        </div>

        <!-- Stats -->
        <div class="stats-bar">
            <div class="container">
                <div class="stats-inner">
                    <template v-for="(stat, i) in visibleStats" :key="stat.key">
                        <div class="stat-sep" v-if="i > 0" />
                        <div class="stat-item">
                            <div class="stat-icon-wrap">
                                <v-icon :icon="stat.icon" size="20" />
                            </div>
                            <div class="stat-body">
                                <div v-if="statsLoading" class="stat-skeleton" />
                                <div v-else :ref="el => { if (el) countUpRefs[stat.key] = el as Element }" class="stat-num">{{ formatStat(stat.value) }}</div>
                                <div class="stat-label">{{ stat.label }}</div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Categories strip -->
        <section v-if="homeCategories.length" class="section cats-strip-section">
            <div class="container">
                <div class="sec-top">
                    <h2>Przeglądaj <span>kategorie</span></h2>
                    <NuxtLink to="/categories" class="see-all">
                        Wszystkie kategorie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="cats-strip">
                    <NuxtLink
                        v-for="cat in homeCategories"
                        :key="cat.id"
                        :to="`/adverts?categoryId=${cat.id}`"
                        class="cstrip-item"
                    >
                        <div class="cstrip-icon">
                            <v-icon :icon="cat.iconName ?? 'mdi-car-outline'" size="22" />
                        </div>
                        <div class="cstrip-name">{{ cat.name }}</div>
                        <div v-if="cat.advertCount" class="cstrip-count">{{ cat.advertCount.toLocaleString('pl') }}</div>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- Featured listings -->
        <section v-if="featured.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Polecane ogłoszenia</h2>
                    <NuxtLink to="/adverts" class="see-all">
                        Zobacz wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in featured" :key="a.id" :advert="a" />
                </div>
            </div>
        </section>

        <!-- Recently viewed -->
        <section v-if="recentAdverts.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Ostatnio oglądane</h2>
                    <button class="see-all see-all--btn" @click="clearRecent">
                        <v-icon icon="mdi-trash-can-outline" size="14" />
                        Wyczyść
                    </button>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in recentAdverts" :key="a.id" :advert="a" hide-compare />
                </div>
            </div>
        </section>

        <!-- TOP / PREMIUM listings -->
        <section v-if="topAdverts.length" class="section premium-section">
            <div class="container">
                <div class="sec-top">
                    <div class="sec-top-left">
                        <span class="premium-label">
                            <v-icon icon="mdi-crown" size="14" />
                            TOP OGŁOSZENIA
                        </span>
                        <h2>Wyróżnione oferty</h2>
                    </div>
                    <NuxtLink to="/adverts" class="see-all">
                        Zobacz wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in topAdverts" :key="a.id" :advert="a" />
                </div>
            </div>
        </section>

        <!-- Events -->
        <section v-if="events.length" class="section events-section">
            <div class="container">
                <div class="sec-top">
                    <h2>Nadchodzące <span>wydarzenia</span></h2>
                    <NuxtLink to="/wydarzenia" class="see-all">
                        Zobacz wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>

                <!-- Featured event banner -->
                <div v-if="featuredEvent" class="featured-banner" @click="navigateTo(`/wydarzenie/${featuredEvent.id}`)">
                    <div class="fb-img-wrap">
                        <img :src="getEventImageUrl(featuredEvent)" :alt="featuredEvent.name" />
                    </div>
                    <div class="fb-body">
                        <div class="fb-label">
                            <v-icon icon="mdi-crown" size="13" class="crown-icon" />
                            Wyróżnione wydarzenie
                        </div>
                        <div class="fb-name">{{ featuredEvent.name }}</div>
                        <div class="fb-meta">
                            <span><v-icon icon="mdi-calendar" size="13" />{{ formatEventDate(featuredEvent.startDate) }}</span>
                            <span><v-icon icon="mdi-map-marker-outline" size="13" />{{ featuredEvent.city }}</span>
                            <span v-if="featuredEvent.organizerName"><v-icon icon="mdi-account-outline" size="13" />{{ featuredEvent.organizerName }}</span>
                        </div>
                        <p class="fb-desc">{{ featuredEvent.description?.slice(0, 200) }}{{ (featuredEvent.description?.length ?? 0) > 200 ? '...' : '' }}</p>
                        <div class="fb-cta">Dowiedz się więcej <v-icon icon="mdi-arrow-right" size="14" /></div>
                    </div>
                </div>

                <div class="events-grid">
                    <div v-for="ev in events" :key="ev.id" class="event-card" @click="navigateTo(`/wydarzenie/${ev.id}`)">
                        <div class="event-img-wrap">
                            <img :src="getEventImageUrl(ev)" :alt="ev.name" />
                            <span v-if="ev.isFeatured" class="event-badge event-badge--featured">
                                <v-icon icon="mdi-crown" size="10" /> WYRÓŻNIONE
                            </span>
                            <span v-else class="event-badge">WYDARZENIE</span>
                            <div class="event-date-chip">
                                <v-icon icon="mdi-calendar" size="13" />
                                {{ formatEventDate(ev.startDate) }}
                            </div>
                        </div>
                        <div class="event-body">
                            <div class="event-name">{{ ev.name }}</div>
                            <div class="event-loc">
                                <v-icon icon="mdi-map-marker-outline" size="14" class="event-loc-icon" />
                                {{ ev.city }}
                            </div>
                            <div v-if="ev.organizerName" class="event-organizer">
                                <v-icon icon="mdi-account-outline" size="13" />
                                {{ ev.organizerName }}
                            </div>
                            <div class="event-desc">{{ ev.description?.slice(0, 80) }}{{ (ev.description?.length ?? 0) > 80 ? '...' : '' }}</div>
                            <div class="event-card-footer">
                                <div v-if="ev.interestedCount" class="event-interested">
                                    <v-icon icon="mdi-account-check-outline" size="13" />
                                    {{ ev.interestedCount }}
                                </div>
                                <a v-if="ev.ticketsUrl" :href="ev.ticketsUrl" target="_blank" rel="noopener" class="event-link-btn" @click.stop>
                                    Kup bilety <v-icon icon="mdi-arrow-right" size="14" />
                                </a>
                                <a v-else-if="ev.websiteUrl" :href="ev.websiteUrl" target="_blank" rel="noopener" class="event-link-btn" @click.stop>
                                    Więcej <v-icon icon="mdi-arrow-right" size="14" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="events-see-all-row">
                    <NuxtLink to="/wydarzenia" class="btn-see-all-events">
                        <v-icon icon="mdi-calendar-multiple" size="18" />
                        Zobacz wszystkie wydarzenia
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- Why CARIZO -->
        <section id="about" class="section">
            <div class="container">
                <h2 class="section-title">Dlaczego CARI<span>ZO</span>?</h2>
                <div class="feat-grid">
                    <div v-for="f in feats" :key="f.title" class="feat-card">
                        <div class="feat-icon">
                            <v-icon :icon="f.icon" size="28" />
                        </div>
                        <h3>{{ f.title }}</h3>
                        <p>{{ f.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Newsletter -->
        <section id="contact" class="section">
            <div class="container">
                <div class="newsletter">
                    <div class="news-icon">
                        <v-icon icon="mdi-email-outline" size="36" />
                    </div>
                    <div class="news-text">
                        <h2>Bądź na bieżąco</h2>
                        <p>Zapisz się do newslettera i otrzymuj najlepsze oferty.</p>
                    </div>
                    <div class="news-form">
                        <input v-model="email" class="news-input" placeholder="Twój adres email" @keyup.enter="subscribeNewsletter" />
                        <button class="btn-subscribe" :disabled="subscribeLoading" @click="subscribeNewsletter">
                            {{ subscribeLoading ? 'Zapisywanie...' : 'Zapisz się' }}
                        </button>
                    </div>
                    <p v-if="subscribeSuccess" class="subscribe-feedback subscribe-ok">Dziękujemy! Zostałeś zapisany do newslettera.</p>
                    <p v-if="subscribeError" class="subscribe-feedback subscribe-err">{{ subscribeError }}</p>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, CarEvent, PagedResult, TaxonomyItem } from '~/types'

const config = useRuntimeConfig()
useHead({
    title: 'CARIZO — Nowoczesna platforma motoryzacyjna',
    meta: [
        { name: 'description', content: 'Kupuj i sprzedawaj auta na CARIZO — zweryfikowane ogłoszenia, inteligentne narzędzia, zaufani sprzedawcy.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: config.public.siteUrl as string },
        { property: 'og:title', content: 'CARIZO — Nowoczesna platforma motoryzacyjna' },
        { property: 'og:description', content: 'Kupuj i sprzedawaj auta na CARIZO — zweryfikowane ogłoszenia, inteligentne narzędzia, zaufani sprzedawcy.' },
        { property: 'og:image', content: `${config.public.siteUrl}/hero-car.jpg` },
        { property: 'og:site_name', content: 'CARIZO' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'CARIZO — Nowoczesna platforma motoryzacyjna' },
        { name: 'twitter:description', content: 'Kupuj i sprzedawaj auta na CARIZO.' },
        { name: 'twitter:image', content: `${config.public.siteUrl}/hero-car.jpg` },
    ],
    link: [{ rel: 'canonical', href: config.public.siteUrl as string }]
})

const featured = ref<CarAdvert[]>([])
const topAdverts = ref<CarAdvert[]>([])
const recentAdverts = ref<CarAdvert[]>([])
const events = ref<CarEvent[]>([])
const homeCategories = ref<import('~/types').CategoryWithCount[]>([])
const { fetchCategories, STATIC_CATEGORIES } = useCategories()

// Category-aware search
const selectedCategoryId = ref<number | null>(null)
const selectedCategorySlug = ref<string | null>(null)
const searchCategories = computed(() => homeCategories.value.length ? homeCategories.value : STATIC_CATEGORIES)

const CATEGORY_FILTER_FIELDS: Record<string, string[]> = {
    'auta-osobowe': ['brand', 'fuel', 'body', 'mileage'],
    'dostawcze':    ['brand', 'fuel', 'body', 'mileage'],
    'ciezarowe':    ['brand', 'fuel', 'mileage'],
    'motocykle':    ['brand', 'engineCC', 'mileage'],
    'przyczepy':    ['brand', 'payload'],
    'maszyny':      ['brand', 'power'],
    'budowlane':    ['brand', 'power'],
    'rolnicze':     ['brand', 'power'],
    'czesci':       ['brand'],
    'inne':         ['brand'],
}
const DEFAULT_FIELDS = ['brand', 'fuel', 'body', 'mileage']

const activeFields = computed(() => {
    if (!selectedCategorySlug.value) return DEFAULT_FIELDS
    return CATEGORY_FILTER_FIELDS[selectedCategorySlug.value] ?? DEFAULT_FIELDS
})

function show(field: string): boolean {
    return activeFields.value.includes(field)
}

const searchPlaceholder = computed(() => {
    const slug = selectedCategorySlug.value
    if (slug === 'motocykle') return 'Szukaj: marka, model, pojemność...'
    if (slug === 'czesci') return 'Szukaj: nazwa części, numer katalogowy...'
    if (slug === 'maszyny' || slug === 'budowlane' || slug === 'rolnicze') return 'Szukaj: marka, model, typ maszyny...'
    if (slug === 'przyczepy') return 'Szukaj: marka, typ przyczepy...'
    if (slug === 'ciezarowe') return 'Szukaj: marka, model, typ nadwozia...'
    return 'Szukaj: marka, model, rocznik, słowo kluczowe...'
})

async function selectCategory(cat: import('~/types').CategoryWithCount | null) {
    selectedCategoryId.value = cat?.id ?? null
    selectedCategorySlug.value = cat?.slug ?? null
    fBrand.value = null; fModel.value = null
    fFuelType.value = null; fBodyType.value = null
    fEngineCCFrom.value = ''; fEngineCCTo.value = ''
    fPowerFrom.value = ''; fPowerTo.value = ''
    fPayloadFrom.value = ''; fPayloadTo.value = ''
    brandsLoading.value = true
    try {
        filterBrands.value = cat
            ? await fetchBrandsByCategory(cat.id)
            : await fetchBrands()
    } catch { /* keep current list */ }
    finally { brandsLoading.value = false }
}

// Count-up
const countUpRefs = ref<Record<string, Element>>({})
const { observe: countUpObserve } = useCountUp()

// Recently viewed
const { getIds: getRecentIds, clear: clearRecentStorage } = useRecentlyViewed()
function clearRecent() { clearRecentStorage(); recentAdverts.value = [] }
const email = ref('')
const searchText = ref('')
const subscribeLoading = ref(false)
const subscribeSuccess = ref(false)
const subscribeError = ref('')

const searchFocused = ref(false)
const filterBrands = ref<TaxonomyItem[]>([])
const filterFuelTypes = ref<TaxonomyItem[]>([])
const filterBodyTypes = ref<TaxonomyItem[]>([])
const fBrand = ref<number | null>(null)
const fModel = ref<number | null>(null)
const fFuelType = ref<number | null>(null)
const fBodyType = ref<number | null>(null)
const fPriceFrom = ref('')
const fPriceTo = ref('')
const fYearFrom = ref('')
const fYearTo = ref('')
const fMileageFrom = ref('')
const fMileageTo = ref('')
const fEngineCCFrom = ref('')
const fEngineCCTo = ref('')
const fPowerFrom = ref('')
const fPowerTo = ref('')
const fPayloadFrom = ref('')
const fPayloadTo = ref('')

const hasActiveFilters = computed(() =>
    !!(selectedCategoryId.value ||
       fBrand.value || fFuelType.value || fBodyType.value ||
       fPriceFrom.value || fPriceTo.value ||
       fYearFrom.value || fYearTo.value ||
       fMileageFrom.value || fMileageTo.value ||
       fEngineCCFrom.value || fEngineCCTo.value ||
       fPowerFrom.value || fPowerTo.value ||
       fPayloadFrom.value || fPayloadTo.value)
)

function clearFilters() {
    selectedCategoryId.value = null; selectedCategorySlug.value = null
    fBrand.value = null; fModel.value = null; fFuelType.value = null; fBodyType.value = null
    fPriceFrom.value = ''; fPriceTo.value = ''
    fYearFrom.value = ''; fYearTo.value = ''
    fMileageFrom.value = ''; fMileageTo.value = ''
    fEngineCCFrom.value = ''; fEngineCCTo.value = ''
    fPowerFrom.value = ''; fPowerTo.value = ''
    fPayloadFrom.value = ''; fPayloadTo.value = ''
    searchText.value = ''
}
const homeStats = ref({ activeAdverts: 0, totalUsers: 0, soldVehicles: 0, events: 0 })
const statsLoading = ref(true)

const visibleStats = computed(() => [
    { key: 'activeAdverts', icon: 'mdi-car-outline',           label: 'Aktywnych ogłoszeń', value: homeStats.value.activeAdverts },
    { key: 'soldVehicles',  icon: 'mdi-handshake-outline',     label: 'Sprzedanych aut',    value: homeStats.value.soldVehicles  },
    { key: 'events',        icon: 'mdi-calendar-star-outline', label: 'Wydarzeń',            value: homeStats.value.events        },
    { key: 'totalUsers',    icon: 'mdi-account-group-outline', label: 'Użytkowników',        value: homeStats.value.totalUsers    },
])

const { getUpcoming } = useEvents()
const { getImageUrl } = useImageUrl()
const { fetchBrands, fetchBrandsByCategory, fetchFuelTypes, fetchBodyTypes } = useTaxonomy()
const brandsLoading = ref(false)

const featuredEvent = computed(() => events.value.find(e => e.isFeatured) ?? null)

function formatStat(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
    return n.toLocaleString('pl')
}

const eventPlaceholder = '/car-placeholder.svg'

function getEventImageUrl(ev: CarEvent): string {
    const main = ev.images?.find(i => i.isMain) ?? ev.images?.[0]
    return getImageUrl(main?.url, eventPlaceholder)
}

function formatEventDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

const feats = [
    { title: 'Bezpieczeństwo', desc: 'Weryfikujemy ogłoszenia i dbamy o Twoje bezpieczeństwo.', icon: 'mdi-shield-check-outline' },
    { title: 'Inteligentne narzędzia', desc: 'AI pomaga w wycenie, opisie i analizie rynku.', icon: 'mdi-cpu-64-bit' },
    { title: 'Zaufani sprzedawcy', desc: 'Współpracujemy tylko ze sprawdzonymi użytkownikami.', icon: 'mdi-account-star-outline' },
    { title: 'Najlepsze oferty', desc: 'Codziennie tysiące nowych, atrakcyjnych ofert w jednym miejscu.', icon: 'mdi-tag-outline' },
]

function doSearch() {
    const query: Record<string, string> = {}
    if (selectedCategoryId.value) query.categoryId = String(selectedCategoryId.value)
    if (searchText.value.trim()) query.textSearch = searchText.value
    if (fBrand.value) query.brandId = String(fBrand.value)
    if (fFuelType.value) query.fuelTypeId = String(fFuelType.value)
    if (fBodyType.value) query.bodyTypeId = String(fBodyType.value)
    if (fPriceFrom.value) query.priceFrom = fPriceFrom.value
    if (fPriceTo.value) query.priceTo = fPriceTo.value
    if (fYearFrom.value) query.yearFrom = fYearFrom.value
    if (fYearTo.value) query.yearTo = fYearTo.value
    if (fMileageFrom.value) query.mileageFrom = fMileageFrom.value
    if (fMileageTo.value) query.mileageTo = fMileageTo.value
    if (fEngineCCFrom.value) query.engineCCFrom = fEngineCCFrom.value
    if (fEngineCCTo.value) query.engineCCTo = fEngineCCTo.value
    if (fPowerFrom.value) query.powerFrom = fPowerFrom.value
    if (fPowerTo.value) query.powerTo = fPowerTo.value
    if (fPayloadFrom.value) query.payloadFrom = fPayloadFrom.value
    if (fPayloadTo.value) query.payloadTo = fPayloadTo.value
    navigateTo({ path: '/adverts', query })
}

async function subscribeNewsletter() {
    if (!email.value.trim()) return
    subscribeLoading.value = true
    subscribeError.value = ''
    subscribeSuccess.value = false
    try {
        await $fetch('/api/proxy/api/Newsletter/subscribe', { method: 'POST', body: { email: email.value } })
        subscribeSuccess.value = true
        email.value = ''
    } catch (e: any) {
        subscribeError.value = e?.data?.message ?? 'Wystąpił błąd. Spróbuj ponownie.'
    } finally {
        subscribeLoading.value = false
    }
}

onMounted(async () => {
    await Promise.allSettled([
        // Fetch a generous pool so promoted ads (badge != null) are captured even when rare
        $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert/search', {
            method: 'POST',
            body: { page: 1, pageSize: 50, sortBy: 'featured' }
        }).then(r => {
            const promoted = r.items.filter(a => a.badge === 'FEATURED' || a.badge === 'TOP' || a.badge === 'PREMIUM')
            featured.value = promoted.filter(a => a.badge === 'FEATURED').slice(0, 4)
            topAdverts.value = promoted.filter(a => a.badge === 'TOP' || a.badge === 'PREMIUM').slice(0, 6)
        }).catch(() => {}),
        // Fetch upcoming published events
        getUpcoming(6).then(e => { events.value = e }),
        $fetch<typeof homeStats.value>('/api/stats/home')
            .then(s => { Object.assign(homeStats.value, s) })
            .catch(() => {}),
        // Recently viewed
        Promise.resolve(getRecentIds()).then(async ids => {
            if (!ids.length) return
            const results = await Promise.all(
                ids.slice(0, 4).map(id => $fetch<CarAdvert>(`/api/proxy/api/Advert/${id}`).catch(() => null))
            )
            recentAdverts.value = results.filter(Boolean) as CarAdvert[]
        }),
        Promise.all([fetchBrands(), fetchFuelTypes(), fetchBodyTypes()])
            .then(([b, f, bt]) => { filterBrands.value = b; filterFuelTypes.value = f; filterBodyTypes.value = bt })
            .catch(() => {}),
        fetchCategories()
            .then(cats => { homeCategories.value = cats.slice(0, 8) })
            .catch(() => { homeCategories.value = STATIC_CATEGORIES.slice(0, 8) }),
    ])
    statsLoading.value = false
    // Trigger count-up after DOM update
    await nextTick()
    visibleStats.value.forEach(stat => {
        const el = countUpRefs.value[stat.key]
        if (el) countUpObserve(el, stat.value)
    })
})
</script>

<style lang="scss" scoped>
.home { background: $bg; }
.container { @include container; }

// Hero
.hero {
    padding-top: $nav-height;
    position: relative;
    overflow: hidden;
    min-height: 560px;
    background: $bg;
}

.hero-car-bg {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 62%;
    z-index: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        opacity: 0.55;
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
            linear-gradient(to right, $bg 0%, transparent 35%),
            linear-gradient(to bottom, transparent 55%, $bg 100%);
    }

    @include respond-to(md) { display: none; }
}

.hero-inner {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    min-height: 480px;
    padding: 60px 0 80px;
}

.hero-content { max-width: 580px; }

.hero-eyebrow {
    color: $red;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.hero-title {
    font-size: 68px;
    line-height: 1.05;
    font-weight: 900;
    color: $text;

    span { color: $red; }

    @include respond-to(md) { font-size: 52px; }
    @include respond-to(sm) { font-size: 38px; }
}

.hero-sub {
    margin-top: 22px;
    color: $text-muted;
    font-size: 15px;
    line-height: 1.8;
}

.hero-badges {
    display: flex;
    gap: 28px;
    margin-top: 36px;
    flex-wrap: wrap;
}

.hero-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-muted;
    font-size: 13px;

    .v-icon { color: $text-dim; }
}

// Search
// ── Search & Filters ──────────────────────────────────────────────────────────
.search-section {
    background: #060606;
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 20px 0 20px;
}

// Category tabs
.cat-tabs-wrap {
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 14px;
    &::-webkit-scrollbar { display: none; }
}

.cat-tabs {
    display: flex;
    gap: 6px;
    min-width: max-content;
}

.cat-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 24px;
    color: $text-dim;
    font-size: 12.5px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;

    .v-icon { color: $text-dark; transition: color 0.15s; }

    &:hover {
        background: rgba(255,255,255,0.07);
        border-color: rgba($red, 0.3);
        color: $text;
        .v-icon { color: $red; }
    }

    &--active {
        background: rgba($red, 0.12);
        border-color: rgba($red, 0.5);
        color: $text;
        .v-icon { color: $red; }
    }
}

// Search bar
.search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 8px 8px 8px 16px;
    margin-bottom: 16px;
    transition: border-color 0.2s;

    &--focus { border-color: rgba($red, 0.45); }

    @include respond-to(sm) { flex-wrap: wrap; padding: 10px 12px; }
}

.sbar-icon { color: $text-dark; flex-shrink: 0; }

.sbar-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    &::placeholder { color: $text-dim; }
}

.sbar-clear {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid rgba($red, 0.3);
    border-radius: $r-sm;
    color: rgba($red, 0.7);
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    &:hover { background: rgba($red, 0.07); color: $red; border-color: $red; }
}

.sbar-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-md;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 28px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }

    @include respond-to(sm) { width: 100%; justify-content: center; }
}

// Filter grid
.filter-grid {
    display: flex;
    flex-wrap: nowrap;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;

    @include respond-to(lg) { flex-wrap: wrap; }
}

.fg-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 14px 16px;
    border-right: 1px solid $border;
    flex: 1;
    min-width: 120px;
    transition: background 0.15s;

    &:last-child { border-right: none; }
    &:hover { background: rgba(255,255,255,0.015); }

    @include respond-to(lg) {
        flex: 0 0 33.333%;
        border-bottom: 1px solid $border;
        &:nth-child(3n) { border-right: none; }
        &:last-child { border-right: none; }
    }

    @include respond-to(sm) {
        flex: 0 0 50%;
        &:nth-child(odd) { border-right: 1px solid $border; }
        &:nth-child(even) { border-right: none; }
    }

    @include respond-to(xs) {
        flex: 0 0 100%;
        border-right: none;
    }
}

.fg-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    .v-icon { color: $red; opacity: 0.7; }
}

.fg-select {
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    width: 100%;

    option { background: #111; color: $text; }
    &:focus { color: $text; }
}

.fg-range {
    display: flex;
    align-items: center;
    gap: 6px;
}

.fg-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    padding: 0;
    width: 100%;
    &::placeholder { color: $text-dim; }
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; }
}

.fg-dash {
    color: $text-dark;
    font-size: 12px;
    flex-shrink: 0;
}

// Active filter chips
.filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.25);
    border-radius: 20px;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    &:hover { background: rgba($red, 0.18); border-color: rgba($red, 0.4); }
    .v-icon { opacity: 0.7; }

    &--cat {
        background: rgba($red, 0.18);
        border-color: rgba($red, 0.5);
        .v-icon { opacity: 1; }
    }
}

// legacy btn-search kept for any residual reference
.btn-search {
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 32px;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

// Stats
// ── Stats bar ─────────────────────────────────────────────────────────────────
.stats-bar {
    background: linear-gradient(180deg, #0a0a0a 0%, #070707 100%);
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 0;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba($red, 0.04) 0%, transparent 70%);
        pointer-events: none;
    }
}

.stats-inner {
    display: flex;
    align-items: stretch;
    justify-content: center;

    @include respond-to(md) {
        flex-wrap: wrap;
    }
}

.stat-sep {
    width: 1px;
    background: $border;
    flex-shrink: 0;
    align-self: stretch;
    margin: 20px 0;

    @include respond-to(md) { display: none; }
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 28px 36px;
    flex: 1;
    min-width: 160px;
    position: relative;
    transition: background 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.02);
    }

    @include respond-to(md) {
        flex: 0 0 50%;
        border-bottom: 1px solid $border;
        padding: 22px 24px;
        min-width: 0;
    }

    @include respond-to(sm) {
        flex: 0 0 100%;
    }
}

.stat-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    flex-shrink: 0;
}

.stat-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.stat-num {
    font-size: 30px;
    font-weight: 900;
    color: $text;
    line-height: 1;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
}

.stat-label {
    color: $text-dim;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

.stat-skeleton {
    width: 72px;
    height: 30px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    margin-bottom: 4px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

// Sections
.section { margin-top: 90px; }

.section-title {
    font-size: 32px;
    font-weight: 700;
    color: $text;
    margin-bottom: 32px;

    span { color: $red; }
}

.sec-top {
    @include section-top;

    .see-all {
        display: flex;
        align-items: center;
        gap: 4px;
        color: $red;
        font-size: 14px;
        font-weight: 500;
    }
}

// Categories strip
.cats-strip-section { margin-top: 60px; }

.cats-strip {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 12px;

    @include respond-to(md) { grid-template-columns: repeat(4, 1fr); }
    @include respond-to(sm) { grid-template-columns: repeat(4, 1fr); gap: 8px; }
}

.cstrip-item {
    @include card($r-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 18px 8px 16px;
    text-decoration: none;
    color: $text;
    text-align: center;
    transition: border-color 0.18s, transform 0.18s;

    &:hover {
        border-color: rgba($red, 0.4);
        transform: translateY(-4px);
    }
}

.cstrip-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba($red, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    transition: background 0.18s;
    flex-shrink: 0;

    .cstrip-item:hover & { background: rgba($red, 0.16); }
}

.cstrip-name {
    font-size: 12px;
    font-weight: 700;
    color: $text;
    line-height: 1.2;
}

.cstrip-count {
    font-size: 10px;
    color: $text-dim;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 1px 6px;
}

.cars-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.feat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.feat-card {
    @include card;
    padding: 32px 24px;

    h3 {
        color: $text;
        font-weight: 700;
        margin: 16px 0 10px;
        font-size: 15px;
    }

    p {
        color: $text-dim;
        line-height: 1.7;
        font-size: 13px;
    }
}

.feat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
}

// Events
.events-section h2 span { color: $red; }

.featured-banner {
    display: flex;
    align-items: stretch;
    border: 1px solid rgba($red, 0.3);
    border-radius: $r-xl;
    background: linear-gradient(135deg, rgba($red, 0.05) 0%, #0a0a0a 100%);
    overflow: hidden;
    margin-bottom: 28px;
    cursor: pointer;
    transition: border-color 0.3s, transform 0.3s;

    &:hover { border-color: rgba($red, 0.55); transform: translateY(-2px); }

    @include respond-to(sm) { flex-direction: column; }
}

.fb-img-wrap {
    width: 44%;
    flex-shrink: 0;

    img { width: 100%; height: 100%; min-height: 260px; object-fit: cover; display: block; }

    @include respond-to(sm) { width: 100%; img { min-height: 200px; } }
}

.fb-body {
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
}

.fb-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ffd700;
}

.crown-icon { color: #ffd700; }

.fb-name {
    font-size: 24px;
    font-weight: 900;
    color: $text;
    line-height: 1.2;

    @include respond-to(sm) { font-size: 20px; }
}

.fb-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    color: $text-dim;
    font-size: 13px;

    span { display: flex; align-items: center; gap: 5px; .v-icon { color: $red; } }
}

.fb-desc { font-size: 14px; color: $text-dim; line-height: 1.7; flex: 1; }

.fb-cta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: $red;
    font-size: 14px;
    font-weight: 600;
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.event-card {
    @include card;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.3s ease, border-color 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba($red, 0.35);
    }
}

.event-img-wrap {
    position: relative;

    img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
    }
}

.event-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba($red, 0.9);
    color: white;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 3px 9px;
    border-radius: 5px;

    &--featured { background: rgba(#ffd700, 0.9); color: #1a1200; }
}

.event-date-chip {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
}

.event-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
}

.event-name {
    font-size: 15px;
    font-weight: 700;
    color: $text;
    line-height: 1.3;
}

.event-loc {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-dim;
    font-size: 12px;
}

.event-loc-icon { color: $red; }

.event-desc {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.6;
    flex: 1;
}

.event-organizer {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-dim;
    font-size: 11px;

    .v-icon { color: $text-dark; }
}

.event-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 6px;
}

.event-interested {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-dim;
    font-size: 11px;

    .v-icon { color: $red; }
}

.event-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    margin-left: auto;
    transition: opacity 0.2s;
    text-decoration: none;

    &:hover { opacity: 0.8; }
}

.events-see-all-row {
    display: flex;
    justify-content: center;
    margin-top: 36px;
}

.btn-see-all-events {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba($red, 0.4);
    border-radius: $r-sm;
    color: $red;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 28px;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;

    &:hover { background: rgba($red, 0.07); border-color: $red; }
}

// Newsletter
.newsletter {
    background: linear-gradient(135deg, #1c0408 0%, #0d0105 100%);
    border: 1px solid rgba($red, 0.3);
    border-radius: $r-xl;
    padding: 45px;
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 30px;

    @include respond-to(md) { flex-wrap: wrap; }
    @include respond-to(sm) { flex-direction: column; align-items: flex-start; }
}

.news-icon {
    flex-shrink: 0;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba($red, 0.15);
    border: 1px solid rgba($red, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
}

.news-text {
    flex: 1;

    h2 {
        font-size: 26px;
        font-weight: 800;
        color: $text;
    }

    p {
        color: $text-muted;
        margin-top: 6px;
        font-size: 14px;
    }
}

.news-form {
    display: flex;
    gap: 12px;
    flex-shrink: 0;

    @include respond-to(sm) { flex-direction: column; width: 100%; }
}

.news-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $r-sm;
    padding: 12px 18px;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    width: 260px;
    outline: none;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dim; }
    &:focus { border-color: rgba($red, 0.5); }

    @include respond-to(sm) { width: 100%; }
}

.btn-subscribe {
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 28px;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.subscribe-feedback {
    font-size: 13px;
    margin-top: 10px;
    text-align: center;
}

.subscribe-ok { color: #4caf50; }
.subscribe-err { color: #e55; }

.see-all--btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: $text-dark;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 0;
    transition: color 0.2s;
    &:hover { color: $red; }
}

.premium-section {
    background: linear-gradient(180deg, rgba($red, 0.04) 0%, transparent 100%);
    border-top: 1px solid rgba($red, 0.15);
    border-bottom: 1px solid rgba($red, 0.15);
}

.sec-top-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
    h2 { margin: 0; }
}

.premium-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: $red;
    text-transform: uppercase;
    .v-icon { color: $red; }
}
</style>
