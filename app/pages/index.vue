<template>
    <div class="home">

        <!-- Hero fullscreen -->
        <section class="hero-fs">
            <div class="hfs-bg">
                <img src="/hero-car.jpg" alt="" class="hfs-img" />
                <div class="hfs-overlay" />
            </div>
            <div class="container hfs-content">
                <h1 class="hfs-title">
                    Motoryzacja.<br>
                    <span>W&nbsp;lepszym</span> wydaniu.
                </h1>
                <p class="hfs-sub">
                    Tysiące zweryfikowanych ogłoszeń. Znajdź swoje wymarzone auto.
                </p>
                <div class="hfs-searchbar">
                    <div class="hfs-field">
                        <label class="hfs-field-label">Marka</label>
                        <select v-model="heroMarka" class="hfs-select" @change="heroModel = null; loadHeroModels()">
                            <option :value="null">Wszystkie</option>
                            <option v-for="b in filterBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                    </div>
                    <div class="hfs-vsep" />
                    <div class="hfs-field">
                        <label class="hfs-field-label">Model</label>
                        <select v-model="heroModel" class="hfs-select" :disabled="!heroMarka">
                            <option :value="null">Wszystkie</option>
                            <option v-for="m in heroModels" :key="m.id" :value="m.id">{{ m.name }}</option>
                        </select>
                    </div>
                    <div class="hfs-vsep" />
                    <div class="hfs-field">
                        <label class="hfs-field-label">Cena max</label>
                        <input v-model="heroPrice" type="number" class="hfs-price-input" placeholder="np. 50 000" min="0" @keyup.enter="doHeroSearch" />
                    </div>
                    <button class="hfs-search-btn" @click="doHeroSearch">
                        <v-icon icon="mdi-magnify" size="20" />
                        <span>Szukaj</span>
                    </button>
                </div>
                <div class="hfs-links">
                    <NuxtLink to="/add-advert" class="hfs-link">
                        Dodaj ogłoszenie <v-icon icon="mdi-arrow-right" size="13" />
                    </NuxtLink>
                    <NuxtLink to="/categories" class="hfs-link">
                        Wszystkie kategorie <v-icon icon="mdi-arrow-right" size="13" />
                    </NuxtLink>
                </div>
            </div>
            <div class="hfs-scroll">
                <v-icon icon="mdi-chevron-down" size="24" />
            </div>
        </section>

        <!-- Stats strip -->
        <div class="stats-strip">
            <div class="container">
                <div class="sstrip-inner">
                    <template v-for="(stat, i) in visibleStats" :key="stat.key">
                        <div v-if="i > 0" class="sstrip-sep" />
                        <div class="sstrip-item">
                            <div class="sstrip-icon-badge">
                                <v-icon :icon="stat.icon" size="22" />
                            </div>
                            <div class="sstrip-text">
                                <div v-if="statsLoading" class="sstrip-skeleton" />
                                <strong v-else :ref="el => { if (el) countUpRefs[stat.key] = el as Element }" class="sstrip-num">{{ formatStat(stat.value) }}</strong>
                                <span class="sstrip-label">{{ stat.label }}</span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Search section -->
        <section class="search-section">
            <div class="container">
                <div class="cat-tabs">
                    <button
                        v-for="cat in SEARCH_CATEGORIES"
                        :key="cat.slug"
                        class="cat-tab"
                        :class="{ 'cat-tab--active': searchCat === cat.slug }"
                        @click="selectSearchCat(cat.slug)"
                    >
                        <v-icon :icon="cat.icon" size="15" />
                        <span>{{ cat.label }}</span>
                    </button>
                </div>
                <div class="search-bar">
                    <div class="sb-input-wrap">
                        <v-icon icon="mdi-magnify" size="20" class="sb-search-icon" />
                        <input
                            v-model="searchText"
                            type="text"
                            class="sb-input"
                            placeholder="Szukaj: marka, model, rocznik..."
                            @keyup.enter="doSearch"
                        />
                    </div>
                    <button class="sb-btn" @click="doSearch">
                        <v-icon icon="mdi-magnify" size="18" />
                        <span>Szukaj</span>
                    </button>
                </div>
                <div class="filter-grid">
                    <template v-if="currentSearchConfig.hasBrand">
                        <div class="fg-field">
                            <label class="fg-label">Marka</label>
                            <select v-model="searchBrandId" class="fg-select" @change="searchModelId = null; loadSearchModels()">
                                <option :value="null">Wszystkie marki</option>
                                <option v-for="b in filterBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
                            </select>
                        </div>
                        <div v-if="currentSearchConfig.hasModel" class="fg-field">
                            <label class="fg-label">Model</label>
                            <select v-model="searchModelId" class="fg-select" :disabled="!searchBrandId">
                                <option :value="null">Wszystkie modele</option>
                                <option v-for="m in searchModels" :key="m.id" :value="m.id">{{ m.name }}</option>
                            </select>
                        </div>
                    </template>
                    <div v-if="currentSearchConfig.subtypes?.length" class="fg-field">
                        <label class="fg-label">{{ currentSearchConfig.subtypeLabel }}</label>
                        <select v-model="searchSubtype" class="fg-select">
                            <option value="">Wszystkie</option>
                            <option v-for="t in currentSearchConfig.subtypes" :key="t" :value="t">{{ t }}</option>
                        </select>
                    </div>
                    <div v-if="currentSearchConfig.hasPartCategory" class="fg-field">
                        <label class="fg-label">Kategoria części</label>
                        <select v-model="searchSubtype" class="fg-select">
                            <option value="">Wszystkie</option>
                            <option v-for="t in PART_CATEGORIES" :key="t" :value="t">{{ t }}</option>
                        </select>
                    </div>
                    <div v-if="currentSearchConfig.hasFuel" class="fg-field">
                        <label class="fg-label">Paliwo</label>
                        <select v-model="searchFuelId" class="fg-select">
                            <option :value="null">Wszystkie</option>
                            <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
                        </select>
                    </div>
                    <div v-if="currentSearchConfig.hasBodyType" class="fg-field">
                        <label class="fg-label">Nadwozie</label>
                        <select v-model="searchBodyTypeId" class="fg-select">
                            <option :value="null">Wszystkie</option>
                            <option v-for="b in bodyTypes" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                    </div>
                    <div class="fg-field fg-range">
                        <label class="fg-label">Cena (PLN)</label>
                        <div class="fg-range-inputs">
                            <input v-model="searchPriceFrom" type="number" class="fg-input" placeholder="Od" min="0" />
                            <span class="fg-range-sep">—</span>
                            <input v-model="searchPriceTo" type="number" class="fg-input" placeholder="Do" min="0" />
                        </div>
                    </div>
                    <div class="fg-field fg-range">
                        <label class="fg-label">Rok produkcji</label>
                        <div class="fg-range-inputs">
                            <input v-model="searchYearFrom" type="number" class="fg-input" placeholder="Od" min="1900" :max="currentYear" />
                            <span class="fg-range-sep">—</span>
                            <input v-model="searchYearTo" type="number" class="fg-input" placeholder="Do" min="1900" :max="currentYear" />
                        </div>
                    </div>
                    <div v-if="currentSearchConfig.hasHours" class="fg-field fg-range">
                        <label class="fg-label">Motogodziny</label>
                        <div class="fg-range-inputs">
                            <input v-model="searchHoursFrom" type="number" class="fg-input" placeholder="Od" min="0" />
                            <span class="fg-range-sep">—</span>
                            <input v-model="searchHoursTo" type="number" class="fg-input" placeholder="Do" min="0" />
                        </div>
                    </div>
                    <div v-else-if="currentSearchConfig.hasMileage" class="fg-field fg-range">
                        <label class="fg-label">Przebieg (km)</label>
                        <div class="fg-range-inputs">
                            <input v-model="searchMileageFrom" type="number" class="fg-input" placeholder="Od" min="0" />
                            <span class="fg-range-sep">—</span>
                            <input v-model="searchMileageTo" type="number" class="fg-input" placeholder="Do" min="0" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Ostatnio dodane -->
        <section v-if="recentlyAdded.length || featured.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <h2>Ostatnio dodane</h2>
                    <NuxtLink to="/adverts" class="see-all">
                        Wszystkie ogłoszenia
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="cars-grid">
                    <AdvertCard v-for="a in (recentlyAdded.length ? recentlyAdded : featured)" :key="a.id" :advert="a" />
                </div>
            </div>
        </section>

        <!-- Samochody premium (showcase) -->
        <section class="section premium-showcase-section">
            <div class="container">
                <div class="psc-header">
                    <div class="psc-header-text">
                        <div class="psc-eyebrow">PREMIUM</div>
                        <h2 class="psc-title">Samochody premium</h2>
                        <p class="psc-sub">Odkryj wyjątkowe oferty z najwyższej półki motoryzacji</p>
                    </div>
                    <NuxtLink to="/adverts" class="see-all">
                        Przeglądaj wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="psc-grid">
                    <NuxtLink
                        v-for="car in premiumShowcase"
                        :key="car.model"
                        :to="`/adverts?textSearch=${encodeURIComponent(car.brand)}`"
                        class="psc-card"
                    >
                        <div class="psc-top-row">
                            <span class="psc-badge">Premium</span>
                        </div>
                        <div class="psc-car-name">
                            <div class="psc-brand">{{ car.brand }}</div>
                            <div class="psc-model">{{ car.model }}</div>
                        </div>
                        <div class="psc-spec">{{ car.spec }}</div>
                        <div class="psc-cta">
                            Szukaj ofert <v-icon icon="mdi-arrow-right" size="14" />
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- Polecane / TOP listings -->
        <section v-if="topAdverts.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <div class="sec-top-left">
                        <span class="premium-label">
                            <v-icon icon="mdi-crown" size="14" />
                            WYRÓŻNIONE
                        </span>
                        <h2>Polecane oferty</h2>
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

        <!-- ING Finansowanie -->
        <section class="section ing-section">
            <div class="container">
                <div class="ing-wrapper">
                    <div class="ing-header">
                        <div class="ing-logo-area">
                            <div class="ing-logo-badge">
                                <span class="ing-logo-text">ING</span>
                            </div>
                            <div>
                                <div class="ing-pretitle">Partner finansowy CARIZO</div>
                                <h2 class="ing-title">Finansowanie pojazdu<br><span>szybko i bezpiecznie</span></h2>
                            </div>
                        </div>
                    </div>
                    <div class="ing-cards">
                        <div class="ing-card">
                            <div class="ing-card-icon">
                                <v-icon icon="mdi-car-key" size="26" />
                            </div>
                            <div class="ing-card-title">Leasing ING</div>
                            <div class="ing-card-desc">Leasing operacyjny lub finansowy dla firm. Korzyści podatkowe i elastyczne warunki.</div>
                            <div class="ing-card-feat">
                                <span><v-icon icon="mdi-check" size="13" />od 10% wpłaty własnej</span>
                                <span><v-icon icon="mdi-check" size="13" />do 84 miesięcy</span>
                                <span><v-icon icon="mdi-check" size="13" />bez ukrytych kosztów</span>
                            </div>
                        </div>
                        <div class="ing-card">
                            <div class="ing-card-icon">
                                <v-icon icon="mdi-bank-outline" size="26" />
                            </div>
                            <div class="ing-card-title">Kredyt ING</div>
                            <div class="ing-card-desc">Kredyt samochodowy dla osób prywatnych. Szybka decyzja kredytowa online.</div>
                            <div class="ing-card-feat">
                                <span><v-icon icon="mdi-check" size="13" />decyzja w 15 minut</span>
                                <span><v-icon icon="mdi-check" size="13" />brak prowizji</span>
                                <span><v-icon icon="mdi-check" size="13" />RRSO od 7,99%</span>
                            </div>
                        </div>
                        <div class="ing-card">
                            <div class="ing-card-icon">
                                <v-icon icon="mdi-domain" size="26" />
                            </div>
                            <div class="ing-card-title">Finansowanie firmowe</div>
                            <div class="ing-card-desc">Kompleksowe rozwiązania flotowe i finansowanie pojazdów użytkowych dla firm.</div>
                            <div class="ing-card-feat">
                                <span><v-icon icon="mdi-check" size="13" />flota od 2 aut</span>
                                <span><v-icon icon="mdi-check" size="13" />zarządzanie online</span>
                                <span><v-icon icon="mdi-check" size="13" />dedykowany opiekun</span>
                            </div>
                        </div>
                        <div class="ing-card ing-card--calc">
                            <div class="ing-card-icon">
                                <v-icon icon="mdi-calculator-variant-outline" size="26" />
                            </div>
                            <div class="ing-card-title">Kalkulator rat</div>
                            <div class="ing-calc-mini">
                                <div class="icm-row">
                                    <label>Kwota</label>
                                    <div class="icm-val">{{ ingCalcAmount.toLocaleString('pl') }} zł</div>
                                </div>
                                <input v-model.number="ingCalcAmount" type="range" min="10000" max="500000" step="5000" class="icm-range" />
                                <div class="icm-row">
                                    <label>Okres</label>
                                    <div class="icm-val">{{ ingCalcMonths }} mies.</div>
                                </div>
                                <input v-model.number="ingCalcMonths" type="range" min="12" max="84" step="12" class="icm-range" />
                                <div class="icm-result">
                                    od <strong>{{ ingMonthlyRate.toLocaleString('pl', { maximumFractionDigits: 0 }) }} zł</strong> / miesiąc
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ing-disclaimer">* Wyniki kalkulatora są orientacyjne. Rzeczywiste warunki zależą od oceny kredytowej.</div>
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
const recentlyAdded = ref<CarAdvert[]>([])
const events = ref<CarEvent[]>([])
const homeCategories = ref<import('~/types').CategoryWithCount[]>([])
const searchCategories = computed(() => homeCategories.value)

// Hero search
const heroMarka = ref<number | null>(null)
const heroModel = ref<number | null>(null)
const heroPrice = ref('')
const heroModels = ref<TaxonomyItem[]>([])

// Premium showcase (static)
const premiumShowcase = [
    { brand: 'BMW',      model: 'M5',       spec: 'V8 4.4 BiTurbo · 625 KM' },
    { brand: 'Porsche',  model: '911 GT3',  spec: 'Flat-6 4.0 · 510 KM' },
    { brand: 'Audi',     model: 'RS6 Avant',spec: 'V8 4.0 BiTurbo · 600 KM' },
    { brand: 'Mercedes', model: 'AMG GT63', spec: 'V8 4.0 BiTurbo · 630 KM' },
]

async function loadHeroModels() {
    if (!heroMarka.value) { heroModels.value = []; return }
    try { heroModels.value = await fetchModels(heroMarka.value) } catch { heroModels.value = [] }
}

function doHeroSearch() {
    const query: Record<string, string> = {}
    if (heroMarka.value) query.brandId = String(heroMarka.value)
    if (heroModel.value) query.modelId = String(heroModel.value)
    if (heroPrice.value) query.priceTo = heroPrice.value
    navigateTo({ path: '/adverts', query })
}

// Count-up
const countUpRefs = ref<Record<string, Element>>({})
const { observe: countUpObserve } = useCountUp()

const email = ref('')
const subscribeLoading = ref(false)
const subscribeSuccess = ref(false)
const subscribeError = ref('')
const filterBrands = ref<TaxonomyItem[]>([])
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
const { fetchBrands, fetchModels, fetchFuelTypes, fetchBodyTypes } = useTaxonomy()

const currentYear = new Date().getFullYear()

const SEARCH_CATEGORIES = [
    { slug: 'auta-osobowe', label: 'Auta osobowe', icon: 'mdi-car' },
    { slug: 'dostawcze',    label: 'Dostawcze',    icon: 'mdi-truck-delivery' },
    { slug: 'ciezarowe',    label: 'Ciężarowe',    icon: 'mdi-truck' },
    { slug: 'motocykle',    label: 'Motocykle',    icon: 'mdi-motorbike' },
    { slug: 'czesci',       label: 'Części',       icon: 'mdi-cog' },
    { slug: 'budowlane',    label: 'Budowlane',    icon: 'mdi-excavator' },
    { slug: 'rolnicze',     label: 'Rolnicze',     icon: 'mdi-tractor' },
    { slug: 'maszyny',      label: 'Maszyny',      icon: 'mdi-forklift' },
    { slug: 'przyczepy',    label: 'Przyczepy',    icon: 'mdi-rv-truck' },
    { slug: 'inne',         label: 'Inne',         icon: 'mdi-dots-horizontal-circle' },
] as const

interface SearchConfig {
    hasBrand: boolean; hasModel: boolean; hasFuel: boolean; hasBodyType: boolean
    hasMileage: boolean; hasHours: boolean; hasPartCategory?: boolean
    subtypeLabel?: string; subtypes?: string[]
}

const SEARCH_CONFIGS: Record<string, SearchConfig> = {
    'auta-osobowe': { hasBrand: true,  hasModel: true,  hasFuel: true,  hasBodyType: true,  hasMileage: true,  hasHours: false },
    'motocykle':    { hasBrand: true,  hasModel: true,  hasFuel: true,  hasBodyType: false, hasMileage: true,  hasHours: false, subtypeLabel: 'Typ motocykla', subtypes: ['Naked', 'Sport', 'Turystyczny', 'Enduro', 'Skuter', 'Chopper', 'Cross'] },
    'dostawcze':    { hasBrand: true,  hasModel: true,  hasFuel: true,  hasBodyType: false, hasMileage: true,  hasHours: false, subtypeLabel: 'Zabudowa', subtypes: ['Furgon', 'Skrzyniowy', 'Wywrotka', 'Chłodnia', 'Platforma'] },
    'ciezarowe':    { hasBrand: true,  hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: true,  hasHours: false, subtypeLabel: 'Typ', subtypes: ['Ciągnik siodłowy', 'Skrzyniowy', 'Wywrotka', 'Chłodnia', 'Cysterna', 'Śmieciarka'] },
    'czesci':       { hasBrand: true,  hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: false, hasPartCategory: true },
    'budowlane':    { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: true,  subtypeLabel: 'Typ maszyny', subtypes: ['Koparka gąsienicowa', 'Koparko-ładowarka', 'Minieksawator', 'Ładowarka', 'Dźwig', 'Walec drogowy', 'Zagęszczarka'] },
    'rolnicze':     { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: true,  subtypeLabel: 'Typ maszyny', subtypes: ['Ciągnik', 'Kombajn', 'Siewnik', 'Pług', 'Prasa', 'Opryskiwacz', 'Rozsiewacz'] },
    'maszyny':      { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: true,  subtypeLabel: 'Typ', subtypes: ['Wózek widłowy', 'Dźwig/Żuraw', 'Platforma robocza', 'Agregat prądotwórczy', 'Sprężarka', 'Pompa'] },
    'przyczepy':    { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: false, subtypeLabel: 'Typ', subtypes: ['Naczepa plandeka', 'Laweta', 'Wywrotka', 'Kempingowa', 'Kontenerowa'] },
    'inne':         { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: false },
}

const PART_CATEGORIES = ['Silnik', 'Zawieszenie', 'Hamulce', 'Elektryka', 'Karoseria', 'Wnętrze', 'Skrzynia biegów', 'Układ kierowniczy', 'Opony i felgi', 'Oświetlenie', 'Tuning', 'Inne']

const searchCat = ref('auta-osobowe')
const searchText = ref('')
const searchBrandId = ref<number | null>(null)
const searchModelId = ref<number | null>(null)
const searchFuelId = ref<number | null>(null)
const searchBodyTypeId = ref<number | null>(null)
const searchSubtype = ref('')
const searchPriceFrom = ref('')
const searchPriceTo = ref('')
const searchYearFrom = ref('')
const searchYearTo = ref('')
const searchMileageFrom = ref('')
const searchMileageTo = ref('')
const searchHoursFrom = ref('')
const searchHoursTo = ref('')
const searchModels = ref<TaxonomyItem[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])

const currentSearchConfig = computed(() => SEARCH_CONFIGS[searchCat.value] ?? SEARCH_CONFIGS['auta-osobowe'])

function selectSearchCat(slug: string) {
    searchCat.value = slug
    searchBrandId.value = null
    searchModelId.value = null
    searchFuelId.value = null
    searchBodyTypeId.value = null
    searchSubtype.value = ''
    searchModels.value = []
}

async function loadSearchModels() {
    if (!searchBrandId.value) { searchModels.value = []; return }
    try { searchModels.value = await fetchModels(searchBrandId.value) } catch { searchModels.value = [] }
}

function doSearch() {
    const query: Record<string, string> = {}
    if (searchText.value.trim()) query.textSearch = searchText.value.trim()
    if (searchBrandId.value) query.brandId = String(searchBrandId.value)
    if (searchModelId.value) query.modelId = String(searchModelId.value)
    if (searchFuelId.value) query.fuelTypeId = String(searchFuelId.value)
    if (searchBodyTypeId.value) query.bodyTypeId = String(searchBodyTypeId.value)
    if (searchSubtype.value) query.subtype = searchSubtype.value
    if (searchPriceFrom.value) query.priceFrom = searchPriceFrom.value
    if (searchPriceTo.value) query.priceTo = searchPriceTo.value
    if (searchYearFrom.value) query.yearFrom = searchYearFrom.value
    if (searchYearTo.value) query.yearTo = searchYearTo.value
    if (searchMileageFrom.value) query.mileageFrom = searchMileageFrom.value
    if (searchMileageTo.value) query.mileageTo = searchMileageTo.value
    if (searchHoursFrom.value) query.hoursFrom = searchHoursFrom.value
    if (searchHoursTo.value) query.hoursTo = searchHoursTo.value
    const cat = homeCategories.value.find(c => c.slug === searchCat.value)
    if (cat) query.categoryId = String(cat.id)
    navigateTo({ path: '/adverts', query })
}

// ING calculator
const ingCalcAmount = ref(80000)
const ingCalcMonths = ref(48)
const ingMonthlyRate = computed(() => {
    const rate = 0.0899 / 12
    const n = ingCalcMonths.value
    const pv = ingCalcAmount.value * 0.9
    return Math.round(pv * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1))
})

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
        $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert/search', {
            method: 'POST',
            body: { page: 1, pageSize: 50, sortBy: 'featured' }
        }).then(r => {
            const promoted = r.items.filter(a => a.badge === 'FEATURED' || a.badge === 'TOP' || a.badge === 'PREMIUM')
            featured.value = promoted.filter(a => a.badge === 'FEATURED').slice(0, 4)
            topAdverts.value = promoted.filter(a => a.badge === 'TOP' || a.badge === 'PREMIUM').slice(0, 6)
        }).catch(() => {}),
        $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert/search', {
            method: 'POST',
            body: { page: 1, pageSize: 8, sortBy: '' }
        }).then(r => { recentlyAdded.value = r.items }).catch(() => {}),
        getUpcoming(6).then(e => { events.value = e }),
        $fetch<typeof homeStats.value>('/api/stats/home')
            .then(s => { Object.assign(homeStats.value, s) })
            .catch(() => {}),
        fetchBrands().then(b => { filterBrands.value = b }).catch(() => {}),
        fetchFuelTypes().then(f => { fuelTypes.value = f }).catch(() => {}),
        fetchBodyTypes().then(b => { bodyTypes.value = b }).catch(() => {}),
    ])
    statsLoading.value = false
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

// ── Fullscreen Hero ──────────────────────────────────────────────────────────
.hero-fs {
    position: relative;
    height: 100vh;
    min-height: 680px;
    max-height: 1000px;
    display: flex;
    align-items: center;
    overflow: hidden;
}

.hfs-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
}

.hfs-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 35%;
}

.hfs-overlay {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%),
        linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);
}

.hfs-content {
    position: relative;
    z-index: 2;
    padding-top: calc(#{$nav-height} + 40px);
    padding-bottom: 80px;
    max-width: 640px;
}

.hfs-title {
    font-size: 80px;
    line-height: 1.04;
    font-weight: 900;
    color: $text;
    letter-spacing: -1.5px;
    margin-bottom: 20px;

    span { color: rgba(255,255,255,0.75); font-weight: 300; }

    @include respond-to(md) { font-size: 58px; }
    @include respond-to(sm) { font-size: 40px; letter-spacing: -0.5px; }
}

.hfs-sub {
    font-size: 16px;
    color: rgba(255,255,255,0.65);
    line-height: 1.7;
    margin-bottom: 36px;
    max-width: 480px;
    font-weight: 400;
}

// Hero search bar
.hfs-searchbar {
    display: flex;
    align-items: stretch;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 16px;
    overflow: hidden;
    max-width: 580px;
    height: 64px;
    margin-bottom: 24px;

    @include respond-to(sm) {
        flex-direction: column;
        height: auto;
        border-radius: 14px;
    }
}

.hfs-field {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 18px;
    flex: 1;
    min-width: 0;
    border-right: 1px solid rgba(255,255,255,0.12);

    @include respond-to(sm) {
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.12);
        padding: 10px 16px;
    }
}

.hfs-field-label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 3px;
    display: block;
}

.hfs-select,
.hfs-price-input {
    background: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    width: 100%;
    cursor: pointer;

    option { background: #111; color: #fff; }
    &::placeholder { color: rgba(255,255,255,0.4); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }
}

.hfs-vsep {
    width: 1px;
    background: rgba(255,255,255,0.12);
    flex-shrink: 0;
    align-self: stretch;
    display: none;
}

.hfs-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    padding: 0 26px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
    flex-shrink: 0;

    &:hover { background: lighten(#8B0D1D, 6%); }

    @include respond-to(sm) {
        width: 100%;
        padding: 14px;
        border-radius: 0 0 12px 12px;
    }
}

.hfs-links {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
}

.hfs-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;

    &:hover { color: rgba(255,255,255,0.9); }
}

.hfs-scroll {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    color: rgba(255,255,255,0.35);
    animation: bounce 2s ease infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
}

// ── Stats strip ───────────────────────────────────────────────────────────────
.stats-strip {
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 0;
    background: rgba(255,255,255,0.01);
}

.sstrip-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 86px;

    @include respond-to(sm) { flex-wrap: wrap; height: auto; padding: 10px 0; }
}

.sstrip-sep {
    width: 1px;
    height: 36px;
    background: $border;
    flex-shrink: 0;

    @include respond-to(sm) { display: none; }
}

.sstrip-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 0 36px;
    flex: 1;

    @include respond-to(md) { padding: 0 20px; gap: 12px; }
    @include respond-to(sm) { flex: 0 0 50%; padding: 12px 16px; }
}

.sstrip-icon-badge {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: $red;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;

    @include respond-to(sm) { width: 42px; height: 42px; }
}

.sstrip-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.sstrip-num {
    font-size: 22px;
    font-weight: 900;
    color: $text;
    line-height: 1;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
}

.sstrip-label {
    font-size: 11px;
    color: $text-dim;
    font-weight: 500;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.sstrip-skeleton {
    width: 64px;
    height: 24px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

// ── Search section ────────────────────────────────────────────────────────────
.search-section {
    padding: 40px 0 44px;
    background: rgba(255,255,255,0.01);
    border-bottom: 1px solid $border;
}

.cat-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 2px;

    &::-webkit-scrollbar { display: none; }
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.cat-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid $border;
    border-radius: 50px;
    background: transparent;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;

    &:hover { border-color: rgba($red, 0.45); color: $text; }

    &--active {
        background: $red;
        border-color: $red;
        color: white;
    }
}

.search-bar {
    display: flex;
    align-items: stretch;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 18px;
    height: 54px;

    &:focus-within { border-color: rgba($red, 0.4); }
}

.sb-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    min-width: 0;
}

.sb-search-icon { color: $text-dim; flex-shrink: 0; }

.sb-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 15px;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-dark; }
}

.sb-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    padding: 0 28px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
    flex-shrink: 0;

    &:hover { background: lighten(#8B0D1D, 6%); }

    @include respond-to(sm) { padding: 0 18px; }
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;

    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.fg-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.fg-label {
    font-size: 11px;
    font-weight: 600;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.6px;
}

.fg-select {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 8px;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 9px 12px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;

    option { background: #111; color: #fff; }
    &:focus { border-color: rgba($red, 0.5); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.fg-range {
    @include respond-to(sm) { grid-column: span 2; }
    @include respond-to(xs) { grid-column: span 1; }
}

.fg-range-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
}

.fg-range-sep {
    color: $text-dark;
    flex-shrink: 0;
    font-size: 13px;
}

.fg-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: 8px;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 9px 10px;
    outline: none;
    min-width: 0;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.5); }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }
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

// ── Premium Showcase ──────────────────────────────────────────────────────────
.premium-showcase-section {
    background: linear-gradient(180deg, rgba($red, 0.03) 0%, transparent 100%);
    border-top: 1px solid rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    padding-bottom: 20px;
}

.psc-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
}

.psc-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    color: $red;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.psc-title {
    font-size: 32px;
    font-weight: 800;
    color: $text;
    line-height: 1.1;
    margin: 0 0 8px;
}

.psc-sub {
    font-size: 14px;
    color: $text-dim;
    margin: 0;
}

.psc-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; gap: 12px; }
}

.psc-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 24px 22px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-xl;
    text-decoration: none;
    color: $text;
    min-height: 200px;
    transition: border-color 0.25s, background 0.25s, transform 0.25s;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(to right, $red, rgba($red, 0));
        opacity: 0;
        transition: opacity 0.3s;
    }

    &:hover {
        border-color: rgba($red, 0.3);
        background: rgba(255,255,255,0.04);
        transform: translateY(-4px);

        &::before { opacity: 1; }
        .psc-cta { color: $red; }
    }
}

.psc-top-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.psc-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba($red, 0.8);
    border: 1px solid rgba($red, 0.3);
    border-radius: 4px;
    padding: 3px 7px;
}

.psc-car-name { margin-top: auto; }

.psc-brand {
    font-size: 12px;
    font-weight: 600;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.psc-model {
    font-size: 26px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
    letter-spacing: -0.5px;
}

.psc-spec {
    font-size: 12px;
    color: $text-dark;
    font-weight: 500;
}

.psc-cta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
    color: $text-dim;
    margin-top: 8px;
    transition: color 0.2s;
}

// ING section
.ing-section {
    margin-top: 90px;
}

.ing-wrapper {
    background: linear-gradient(135deg, #0c0c10 0%, #08080c 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-xl;
    padding: 48px;
    overflow: hidden;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(255,100,0,0.06) 0%, transparent 70%);
        pointer-events: none;
    }

    @include respond-to(sm) { padding: 28px 20px; }
}

.ing-header {
    margin-bottom: 36px;
}

.ing-logo-area {
    display: flex;
    align-items: center;
    gap: 20px;
}

.ing-logo-badge {
    width: 60px;
    height: 60px;
    background: #FF6200;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ing-logo-text {
    color: white;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 1px;
}

.ing-pretitle {
    font-size: 11px;
    font-weight: 700;
    color: #FF6200;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.ing-title {
    font-size: 28px;
    font-weight: 800;
    color: $text;
    line-height: 1.2;
    span { color: #FF6200; }
    @include respond-to(sm) { font-size: 22px; }
}

.ing-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.ing-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-lg;
    padding: 22px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
        border-color: rgba(#FF6200, 0.3);
        background: rgba(255,255,255,0.05);
    }

    &--calc { border-color: rgba(#FF6200, 0.2); }
}

.ing-card-icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: rgba(#FF6200, 0.12);
    border: 1px solid rgba(#FF6200, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF6200;
}

.ing-card-title {
    font-size: 15px;
    font-weight: 700;
    color: $text;
}

.ing-card-desc {
    font-size: 12.5px;
    color: $text-dim;
    line-height: 1.6;
    flex: 1;
}

.ing-card-feat {
    display: flex;
    flex-direction: column;
    gap: 5px;

    span {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $text-muted;
        .v-icon { color: #FF6200; }
    }
}

.ing-calc-mini {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.icm-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: $text-dim;
}

.icm-val {
    font-weight: 700;
    color: $text;
    font-size: 13px;
}

.icm-range {
    width: 100%;
    accent-color: #FF6200;
    cursor: pointer;
    margin: 0;
}

.icm-result {
    background: rgba(#FF6200, 0.1);
    border: 1px solid rgba(#FF6200, 0.25);
    border-radius: $r-sm;
    padding: 10px 14px;
    font-size: 13px;
    color: $text-muted;
    text-align: center;
    margin-top: 4px;

    strong {
        color: #FF6200;
        font-size: 18px;
    }
}

.ing-disclaimer {
    margin-top: 20px;
    font-size: 11px;
    color: $text-dark;
}
</style>
