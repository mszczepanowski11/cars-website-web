<template>
    <div class="page-bg">

        <!-- Category hero (always shown when category selected) -->
        <div v-if="activeCategory" class="cat-hero">
            <img src="/hero-car.jpg" class="cat-hero-img" alt="" />
            <div class="cat-hero-overlay" />
            <div class="container cat-hero-inner">
                <nav class="breadcrumb">
                    <NuxtLink to="/">Strona główna</NuxtLink>
                    <span> › </span>
                    <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
                    <span> › </span>
                    <span>{{ activeCategory.name }}</span>
                </nav>
                <h1 class="cat-hero-title">{{ activeCategory.name }}</h1>
                <p class="cat-hero-sub">{{ total.toLocaleString('pl') }} ogłoszeń w tej kategorii</p>
            </div>
        </div>

        <!-- Page title when no category -->
        <div v-else class="page-header">
            <div class="container">
                <h1 class="page-title">Wszystkie ogłoszenia</h1>
                <p class="page-sub">{{ total.toLocaleString('pl') }} ogłoszeń czeka na Ciebie</p>
            </div>
        </div>

        <!-- NEW Search bar -->
        <div class="search-section">
            <div class="container">
                <div class="search-card" :class="{ 'search-card--focused': searchFocused }">
                    <div class="sc-main">
                        <div class="sc-input-wrap">
                            <v-icon icon="mdi-magnify" size="20" class="sc-icon" />
                            <input
                                v-model="f.textSearch"
                                class="sc-input"
                                placeholder="Wyszukaj markę, model, słowo kluczowe..."
                                @keyup.enter="load(1)"
                                @focus="searchFocused = true"
                                @blur="searchFocused = false"
                            />
                            <button v-if="f.textSearch" class="sc-clear" @click="f.textSearch = ''">
                                <v-icon icon="mdi-close" size="16" />
                            </button>
                        </div>
                        <template v-if="filterConfig.showBrandModel">
                        <div class="sc-divider" />
                        <div class="sc-select-wrap">
                            <v-icon icon="mdi-car-outline" size="16" class="sc-sel-icon" />
                            <select v-model="f.brandId" class="sc-select" @change="onBrandChange">
                                <option :value="null">Wszystkie marki</option>
                                <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                            </select>
                        </div>
                        <div class="sc-divider" />
                        <div class="sc-select-wrap">
                            <v-icon icon="mdi-car-settings" size="16" class="sc-sel-icon" />
                            <select v-model="f.modelId" class="sc-select" :disabled="!f.brandId">
                                <option :value="null">Wszystkie modele</option>
                                <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
                            </select>
                        </div>
                        </template>
                        <button class="sc-btn" @click="load(1)">
                            <v-icon icon="mdi-magnify" size="18" />
                            Szukaj
                            <span v-if="total > 0" class="sc-count">{{ total.toLocaleString('pl') }}</span>
                        </button>
                    </div>

                    <!-- Quick filter chips -->
                    <div v-if="hasActiveFilters" class="sc-chips">
                        <div v-if="activeCategory" class="sc-chip" @click="f.categoryId = null; load(1)">
                            <v-icon icon="mdi-tag-outline" size="12" />
                            {{ activeCategory.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="activeBrand" class="sc-chip" @click="f.brandId = null; f.modelId = null; models = []; load(1)">
                            <v-icon icon="mdi-car-outline" size="12" />
                            {{ activeBrand.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.modelId && activeModel" class="sc-chip" @click="f.modelId = null; load(1)">
                            {{ activeModel.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.fuelTypeId" class="sc-chip" @click="f.fuelTypeId = null; load(1)">
                            <v-icon icon="mdi-gas-station-outline" size="12" />
                            {{ fuelTypes.find(ft => ft.id === f.fuelTypeId)?.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.bodyTypeId" class="sc-chip" @click="f.bodyTypeId = null; load(1)">
                            {{ bodyTypes.find(bt => bt.id === f.bodyTypeId)?.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.priceFrom || f.priceTo" class="sc-chip" @click="f.priceFrom = null; f.priceTo = null; load(1)">
                            Cena: {{ f.priceFrom ? f.priceFrom.toLocaleString('pl') : '0' }} – {{ f.priceTo ? f.priceTo.toLocaleString('pl') : '∞' }} zł
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.yearFrom || f.yearTo" class="sc-chip" @click="f.yearFrom = null; f.yearTo = null; load(1)">
                            Rok: {{ f.yearFrom ?? '?' }} – {{ f.yearTo ?? '?' }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.mileageFrom || f.mileageTo" class="sc-chip" @click="f.mileageFrom = null; f.mileageTo = null; load(1)">
                            Przebieg: {{ f.mileageFrom ? f.mileageFrom.toLocaleString('pl') : '0' }} – {{ f.mileageTo ? f.mileageTo.toLocaleString('pl') : '∞' }} km
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <button class="sc-chip sc-chip--clear" @click="clearFilters">
                            <v-icon icon="mdi-close-circle" size="12" />
                            Wyczyść wszystko
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="mobileFiltersOpen" class="sidebar-backdrop" @click="mobileFiltersOpen = false" />

        <div class="container main-layout">

            <!-- ── Sidebar ── -->
            <aside class="sidebar" :class="{ 'sidebar--open': mobileFiltersOpen }">
                <div class="sidebar-mobile-hd">
                    <span class="sidebar-mobile-title">Filtry i kategorie</span>
                    <button class="sidebar-mobile-close" @click="mobileFiltersOpen = false">
                        <v-icon icon="mdi-close" size="18" />
                    </button>
                </div>

                <!-- Categories -->
                <div class="sidebar-block">
                    <h3 class="sidebar-title">
                        <v-icon icon="mdi-tag-multiple-outline" size="16" class="stitle-icon" />
                        Kategorie
                    </h3>
                    <div
                        v-for="cat in categories"
                        :key="cat.id"
                        class="cat-item"
                        :class="{ active: f.categoryId === cat.id }"
                        @click="selectCategory(cat)"
                    >
                        <div class="cat-item-icon">
                            <v-icon :icon="cat.iconName || 'mdi-car-outline'" size="15" />
                        </div>
                        <span class="cat-item-name">{{ cat.name }}</span>
                        <span class="cat-item-count">{{ cat.advertCount }}</span>
                    </div>
                </div>

                <!-- Filters -->
                <div class="sidebar-block">
                    <div class="filter-hd">
                        <h3 class="sidebar-title">
                            <v-icon icon="mdi-tune" size="16" class="stitle-icon" />
                            Filtry
                        </h3>
                        <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">Wyczyść</button>
                    </div>

                    <div v-if="activeCategory" class="filter-cat-badge">
                        <v-icon :icon="activeCategory.iconName || 'mdi-tag-outline'" size="14"/>
                        {{ activeCategory.name }}
                        <button class="fcb-clear" @click="f.categoryId = null; load(1)"><v-icon icon="mdi-close" size="12"/></button>
                    </div>

                    <!-- Parts category filter -->
                    <div v-if="categorySlug === 'czesci'" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-cog-outline" size="14" />
                            Kategoria części
                        </div>
                        <select v-model="f.bodySubtype" class="filter-select" @change="load(1)">
                            <option value="">Wszystkie</option>
                            <option value="silnik">Silnik i osprzęt</option>
                            <option value="skrzynia">Skrzynia biegów / napęd</option>
                            <option value="zawieszenie">Zawieszenie i układ kierowniczy</option>
                            <option value="hamulce">Hamulce</option>
                            <option value="elektryka">Elektryka i elektronika</option>
                            <option value="nadwozie-zewn">Nadwozie zewnętrzne</option>
                            <option value="nadwozie-wewn">Wnętrze / tapicerka</option>
                            <option value="oswietlenie">Oświetlenie</option>
                            <option value="chlodnica">Układ chłodzenia</option>
                            <option value="wydech">Układ wydechowy</option>
                            <option value="paliwo">Układ paliwowy</option>
                            <option value="klimatyzacja">Klimatyzacja / ogrzewanie</option>
                            <option value="kola">Koła, felgi i opony</option>
                            <option value="akcesoria">Akcesoria i tuning</option>
                            <option value="narzedzia">Narzędzia i wyposażenie warsztatu</option>
                            <option value="inne">Inne</option>
                        </select>
                    </div>

                    <!-- Price -->
                    <div class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-currency-usd" size="14" />
                            Cena (zł)
                        </div>
                        <div class="range-row">
                            <input v-model.number="f.priceFrom" type="number" class="range-input" placeholder="Od" min="0" />
                            <span class="range-sep">–</span>
                            <input v-model.number="f.priceTo" type="number" class="range-input" placeholder="Do" min="0" />
                        </div>
                    </div>

                    <!-- Year -->
                    <div class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-calendar-outline" size="14" />
                            Rok produkcji
                        </div>
                        <div class="range-row">
                            <input v-model.number="f.yearFrom" type="number" class="range-input" placeholder="Od" min="1900" max="2099" />
                            <span class="range-sep">–</span>
                            <input v-model.number="f.yearTo" type="number" class="range-input" placeholder="Do" min="1900" max="2099" />
                        </div>
                    </div>

                    <!-- Mileage -->
                    <div v-if="filterConfig.showMileage" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-speedometer" size="14" />
                            {{ filterConfig.mileageLabel }}
                        </div>
                        <div class="range-row">
                            <input v-model.number="f.mileageFrom" type="number" class="range-input" placeholder="Od" min="0" />
                            <span class="range-sep">–</span>
                            <input v-model.number="f.mileageTo" type="number" class="range-input" placeholder="Do" min="0" />
                        </div>
                    </div>

                    <!-- Power -->
                    <div v-if="filterConfig.showPower" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-engine-outline" size="14" />
                            Moc (KM)
                        </div>
                        <div class="range-row">
                            <input v-model.number="f.powerFrom" type="number" class="range-input" placeholder="Od" min="0" />
                            <span class="range-sep">–</span>
                            <input v-model.number="f.powerTo" type="number" class="range-input" placeholder="Do" min="0" />
                        </div>
                    </div>

                    <!-- Fuel type -->
                    <div v-if="filterConfig.showFuelType" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-gas-station-outline" size="14" />
                            Rodzaj paliwa
                        </div>
                        <div class="filter-options">
                            <button
                                v-for="ft in fuelTypes" :key="ft.id"
                                class="fopt-btn"
                                :class="{ active: f.fuelTypeId === ft.id }"
                                @click="f.fuelTypeId = f.fuelTypeId === ft.id ? null : ft.id"
                            >{{ ft.name }}</button>
                        </div>
                    </div>

                    <!-- Body type -->
                    <div v-if="filterConfig.showBodyType" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-car-estate" size="14" />
                            Typ nadwozia
                        </div>
                        <div class="filter-select-wrap">
                            <select v-model="f.bodyTypeId" class="filter-select">
                                <option :value="null">Wszystkie</option>
                                <option v-for="bt in bodyTypes" :key="bt.id" :value="bt.id">{{ bt.name }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Gearbox -->
                    <div v-if="filterConfig.showGearbox" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-car-shift-pattern" size="14" />
                            Skrzynia biegów
                        </div>
                        <div class="filter-options">
                            <button
                                v-for="gb in gearboxes" :key="gb.id"
                                class="fopt-btn"
                                :class="{ active: f.gearboxId === gb.id }"
                                @click="f.gearboxId = f.gearboxId === gb.id ? null : gb.id"
                            >{{ gb.name }}</button>
                        </div>
                    </div>

                    <!-- Seller type -->
                    <div class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-account-outline" size="14" />
                            Sprzedawca
                        </div>
                        <div class="filter-options">
                            <button class="fopt-btn" :class="{ active: f.sellerType === 'private' }" @click="f.sellerType = f.sellerType === 'private' ? '' : 'private'">Prywatny</button>
                            <button class="fopt-btn" :class="{ active: f.sellerType === 'dealer' }" @click="f.sellerType = f.sellerType === 'dealer' ? '' : 'dealer'">Dealer</button>
                        </div>
                    </div>

                    <!-- Condition -->
                    <div class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-car-wrench" size="14" />
                            Stan pojazdu
                        </div>
                        <div class="filter-options">
                            <button class="fopt-btn" :class="{ active: f.condition === 'new' }" @click="f.condition = f.condition === 'new' ? '' : 'new'">Nowy</button>
                            <button class="fopt-btn" :class="{ active: f.condition === 'used' }" @click="f.condition = f.condition === 'used' ? '' : 'used'">Używany</button>
                        </div>
                    </div>

                    <!-- Drive type -->
                    <div v-if="filterConfig.showDriveType && driveTypes.length" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-car-traction-control" size="14" />
                            Napęd
                        </div>
                        <div class="filter-select-wrap">
                            <select v-model="f.driveTypeId" class="filter-select">
                                <option :value="null">Wszystkie</option>
                                <option v-for="dt in driveTypes" :key="dt.id" :value="dt.id">{{ dt.name }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Color -->
                    <div v-if="filterConfig.showColor && colors.length" class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-palette-outline" size="14" />
                            Kolor
                            <span v-if="f.colorId" class="color-sel-name">{{ colors.find(c => c.id === f.colorId)?.name }}</span>
                        </div>
                        <div class="color-swatches">
                            <button
                                class="color-swatch color-swatch--all"
                                :class="{ active: !f.colorId }"
                                title="Wszystkie kolory"
                                @click="f.colorId = null"
                            >
                                <v-icon icon="mdi-close" size="10" />
                            </button>
                            <button
                                v-for="col in colors"
                                :key="col.id"
                                class="color-swatch"
                                :class="{ active: f.colorId === col.id }"
                                :style="{ background: col.hexCode || '#888' }"
                                :title="col.name"
                                @click="f.colorId = f.colorId === col.id ? null : col.id"
                            />
                        </div>
                    </div>

                    <!-- Boolean flags -->
                    <div class="filter-section">
                        <div class="filter-section-label">
                            <v-icon icon="mdi-information-outline" size="14" />
                            Dodatkowe
                        </div>
                        <div class="filter-checks">
                            <label class="fcheck">
                                <input type="checkbox" :checked="f.hasDamage === false" @change="f.hasDamage = f.hasDamage === false ? null : false" />
                                Bezwypadkowy
                            </label>
                            <label class="fcheck">
                                <input type="checkbox" :checked="f.hasWarranty === true" @change="f.hasWarranty = f.hasWarranty === true ? null : true" />
                                Gwarancja
                            </label>
                            <label class="fcheck">
                                <input type="checkbox" :checked="f.hasServiceBook === true" @change="f.hasServiceBook = f.hasServiceBook === true ? null : true" />
                                Książka serwisowa
                            </label>
                            <label class="fcheck">
                                <input type="checkbox" :checked="f.isImported === true" @change="f.isImported = f.isImported === true ? null : true" />
                                Import
                            </label>
                        </div>
                    </div>

                    <button class="apply-btn" @click="load(1); mobileFiltersOpen = false">
                        <v-icon icon="mdi-magnify" size="16" />
                        Zastosuj filtry
                    </button>
                </div>
            </aside>

            <!-- ── Content ── -->
            <div class="content">
                <div class="results-hd">
                    <p class="result-count">
                        Znaleziono <strong>{{ total.toLocaleString('pl') }}</strong> ogłoszeń
                    </p>
                    <div class="results-hd-right">
                        <button class="mobile-filter-toggle" @click="mobileFiltersOpen = true">
                            <v-icon icon="mdi-tune-variant" size="15" />
                            Filtry
                            <span v-if="activeFiltersCount" class="mft-count">{{ activeFiltersCount }}</span>
                        </button>
                        <div class="sort-wrap">
                        <v-icon icon="mdi-sort" size="16" class="sort-icon" />
                        <select v-model="f.sortBy" class="sort-select" @change="load(1)">
                            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                        </select>
                    </div>
                    </div>
                </div>

                <!-- Skeleton loading state -->
                <div v-if="loading && !adverts.length" class="cars-grid">
                    <AdvertCardSkeleton v-for="n in 12" :key="n" />
                </div>

                <template v-else>
                    <div class="cars-grid">
                        <AdvertCard
                            v-for="a in adverts"
                            :key="a.id"
                            :advert="a"
                            @quick-view="openQuickView"
                        />
                    </div>
                    <div v-if="!adverts.length" class="no-results">
                        <v-icon icon="mdi-magnify-remove-outline" size="64" class="no-results-icon" />
                        <p>Brak ogłoszeń</p>
                        <span>Spróbuj innych kryteriów wyszukiwania lub usuń część filtrów</span>
                        <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">
                            <v-icon icon="mdi-filter-remove-outline" size="15" />
                            Wyczyść filtry
                        </button>
                    </div>
                    <div v-if="page < totalPages" class="load-more-wrap">
                        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
                            <v-icon v-if="loadingMore" icon="mdi-loading" size="17" class="spin" />
                            <v-icon v-else icon="mdi-chevron-down" size="17" />
                            {{ loadingMore ? 'Ładowanie…' : `Załaduj więcej (${total - adverts.length} pozostałych)` }}
                        </button>
                    </div>
                    <div v-if="totalPages > 1" class="pagination">
                        <button class="page-btn" :disabled="page === 1" @click="load(page - 1)">
                            <v-icon icon="mdi-chevron-left" size="18" />
                        </button>
                        <button
                            v-for="p in paginationPages"
                            :key="p"
                            class="page-btn"
                            :class="{ 'page-btn--active': p === page, 'page-btn--dot': p === '...' }"
                            :disabled="p === '...'"
                            @click="p !== '...' && load(Number(p))"
                        >{{ p }}</button>
                        <button class="page-btn" :disabled="page >= totalPages" @click="load(page + 1)">
                            <v-icon icon="mdi-chevron-right" size="18" />
                        </button>
                    </div>
                </template>
            </div>

        </div>
    </div>

    <QuickViewModal v-model="quickViewOpen" :advert-id="quickViewId" />
    <ComparePanel />
</template>

<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import type { TaxonomyItem, DriveType, CarColor, CarAdvert, PagedResult, CategoryWithCount } from '~/types'

useSeoMeta({
    title: 'Ogłoszenia samochodowe — CARIZO',
    description: 'Przeglądaj tysiące ofert sprzedaży samochodów w Polsce. Filtruj po marce, modelu, cenie i przebiegu.',
    ogTitle: 'Ogłoszenia samochodowe — CARIZO',
    ogDescription: 'Najlepsza platforma motoryzacyjna w Polsce — tysiące ogłoszeń.',
    robots: 'index, follow',
})

const route = useRoute()
const router = useRouter()
const { fetchBrands, fetchBrandsByCategory, fetchModels, fetchFuelTypes, fetchBodyTypes, fetchGearboxes, fetchDriveTypes, fetchColors } = useTaxonomy()
const { fetchCategories } = useCategories()
const { fetchFavoriteIds } = useFavorites()

// Initialize filter state from URL query params at setup time (SSR-safe — no onMounted)
const f = reactive({
    categoryId:  route.query.categoryId  ? Number(route.query.categoryId)  : null as number | null,
    textSearch:  route.query.textSearch  ? String(route.query.textSearch)  : '',
    brandId:     route.query.brandId     ? Number(route.query.brandId)     : null as number | null,
    modelId:     route.query.modelId     ? Number(route.query.modelId)     : null as number | null,
    fuelTypeId:  route.query.fuelTypeId  ? Number(route.query.fuelTypeId)  : null as number | null,
    bodyTypeId:  route.query.bodyTypeId  ? Number(route.query.bodyTypeId)  : null as number | null,
    gearboxId:   route.query.gearboxId   ? Number(route.query.gearboxId)   : null as number | null,
    priceFrom:   route.query.priceFrom   ? Number(route.query.priceFrom)   : null as number | null,
    priceTo:     route.query.priceTo     ? Number(route.query.priceTo)     : null as number | null,
    yearFrom:    route.query.yearFrom    ? Number(route.query.yearFrom)    : null as number | null,
    yearTo:      route.query.yearTo      ? Number(route.query.yearTo)      : null as number | null,
    mileageFrom: route.query.mileageFrom ? Number(route.query.mileageFrom) : null as number | null,
    mileageTo:   route.query.mileageTo   ? Number(route.query.mileageTo)   : null as number | null,
    powerFrom:   route.query.powerFrom   ? Number(route.query.powerFrom)   : null as number | null,
    powerTo:     route.query.powerTo     ? Number(route.query.powerTo)     : null as number | null,
    driveTypeId: route.query.driveTypeId ? Number(route.query.driveTypeId) : null as number | null,
    colorId:     route.query.colorId     ? Number(route.query.colorId)     : null as number | null,
    sellerType:  (route.query.sellerType ?? '') as '' | 'private' | 'dealer',
    condition:   (route.query.condition  ?? '') as '' | 'new' | 'used',
    hasDamage:   route.query.hasDamage   !== undefined ? route.query.hasDamage   === 'true' : null as boolean | null,
    hasWarranty: route.query.hasWarranty !== undefined ? route.query.hasWarranty === 'true' : null as boolean | null,
    hasServiceBook: route.query.hasServiceBook !== undefined ? route.query.hasServiceBook === 'true' : null as boolean | null,
    isImported:  route.query.isImported  !== undefined ? route.query.isImported  === 'true' : null as boolean | null,
    axleCount:   null as number | null,
    payloadFrom: null as number | null,
    payloadTo:   null as number | null,
    grossWeightFrom: null as number | null,
    grossWeightTo:   null as number | null,
    bodySubtype: route.query.bodySubtype ? String(route.query.bodySubtype) : '' as string,
    hasRetarder: null as boolean | null,
    hasTachograph: null as boolean | null,
    sortBy:      route.query.sortBy ? String(route.query.sortBy) : '',
})

const models       = ref<TaxonomyItem[]>([])
const adverts      = ref<CarAdvert[]>([])
const total        = ref(0)
const page         = ref(route.query.page ? Number(route.query.page) : 1)
const loading      = ref(false)
const loadingMore  = ref(false)
const pageSize     = 12
const searchFocused = ref(false)
const mobileFiltersOpen = ref(false)

const activeFiltersCount = computed(() => {
    let n = 0
    if (f.categoryId) n++
    if (f.brandId) n++
    if (f.fuelTypeId) n++
    if (f.bodyTypeId) n++
    if (f.gearboxId) n++
    if (f.priceFrom || f.priceTo) n++
    if (f.yearFrom || f.yearTo) n++
    if (f.mileageFrom || f.mileageTo) n++
    if (f.driveTypeId) n++
    if (f.colorId) n++
    if (f.sellerType) n++
    if (f.condition) n++
    if (f.hasDamage !== null) n++
    if (f.hasWarranty !== null) n++
    if (f.hasServiceBook !== null) n++
    if (f.isImported !== null) n++
    return n
})

// Quick view
const quickViewOpen = ref(false)
const quickViewId   = ref<number | null>(null)
function openQuickView(id: number) { quickViewId.value = id; quickViewOpen.value = true }

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const sortOptions = [
    { label: 'Najnowsze',       value: '' },
    { label: 'Polecane',        value: 'featured' },
    { label: 'Cena: rosnąco',   value: 'price_asc' },
    { label: 'Cena: malejąco',  value: 'price_desc' },
    { label: 'Rok: najnowszy',  value: 'year_desc' },
    { label: 'Przebieg: mniej', value: 'mileage_asc' },
    { label: 'Moc: malejąco',  value: 'power_desc' },
]

const activeCategory = computed(() =>
    f.categoryId ? (categories.value.find(c => c.id === f.categoryId) ?? null) : null
)
const categorySlug = computed(() => activeCategory.value?.slug ?? null)

const filterConfig = computed(() => {
    const slug = categorySlug.value
    const isMoto = slug === 'motocykle' || slug?.includes('moto')
    const isParts = slug === 'czesci' || slug?.includes('czesc') || slug?.includes('part')
    const isTrailer = slug === 'przyczepy' || slug?.includes('przyczepa') || slug?.includes('naczepa')
    const isMachinery = slug === 'maszyny' || slug?.includes('maszyn') || slug?.includes('rolnicze')
    const isTruck = slug === 'dostawcze' || slug?.includes('dostawcze') || slug?.includes('ciezarowe') || slug?.includes('ciężar')

    return {
        showBrandModel: !isParts,
        showFuelType: !isParts && !isTrailer,
        showGearbox: !isParts && !isTrailer && !isMoto,
        showBodyType: !isParts && !isMoto && !isTrailer && !isMachinery,
        showPower: !isParts,
        showMileage: !isParts,
        showDriveType: !isParts && !isMoto && !isTrailer,
        showColor: !isParts && !isTrailer && !isMachinery,
        showYear: true,
        showPrice: true,
        mileageLabel: isMachinery ? 'Motogodziny (mth)' : 'Przebieg (km)',
        mileageFromKey: isMachinery ? 'mileageFrom' : 'mileageFrom',
        brandLabel: isMoto ? 'Marka motocykla' : isParts ? 'Producent' : isTruck ? 'Marka pojazdu' : 'Marka',
        modelLabel: isMoto ? 'Model' : isParts ? 'Nr katalogowy' : 'Model',
    }
})

const activeBrand = computed(() =>
    f.brandId ? (brands.value.find(b => b.id === f.brandId) ?? null) : null
)
const activeModel = computed(() =>
    f.modelId ? (models.value.find(m => m.id === f.modelId) ?? null) : null
)

const hasActiveFilters = computed(() =>
    !!(f.categoryId || f.textSearch || f.brandId || f.modelId || f.fuelTypeId || f.bodyTypeId ||
       f.gearboxId || f.driveTypeId || f.colorId ||
       f.priceFrom || f.priceTo || f.yearFrom || f.yearTo ||
       f.mileageFrom || f.mileageTo || f.powerFrom || f.powerTo ||
       f.sellerType || f.condition ||
       f.hasDamage !== null || f.hasWarranty !== null || f.hasServiceBook !== null || f.isImported !== null)
)

const paginationPages = computed(() => {
    const tot = totalPages.value
    const cur = page.value
    if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1)
    const pages: (number | string)[] = [1]
    if (cur > 3) pages.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(tot - 1, cur + 1); i++) pages.push(i)
    if (cur < tot - 2) pages.push('...')
    pages.push(tot)
    return pages
})

async function selectCategory(cat: CategoryWithCount) {
    const newId = f.categoryId === cat.id ? null : cat.id
    if (newId !== f.categoryId) {
        f.brandId = null
        f.modelId = null
        models.value = []
    }
    f.categoryId = newId
    mobileFiltersOpen.value = false
    if (f.categoryId) {
        fetchBrandsByCategory(f.categoryId).then(b => { dynamicBrands.value = b }).catch(() => { dynamicBrands.value = null })
    } else {
        dynamicBrands.value = null
    }
    load(1)
}

function clearFilters() {
    f.categoryId = null; f.textSearch = ''; f.brandId = null; f.modelId = null
    f.fuelTypeId = null; f.bodyTypeId = null; f.gearboxId = null
    f.driveTypeId = null; f.colorId = null
    f.priceFrom = null; f.priceTo = null
    f.yearFrom = null; f.yearTo = null
    f.mileageFrom = null; f.mileageTo = null
    f.powerFrom = null; f.powerTo = null
    f.sellerType = ''; f.condition = ''
    f.hasDamage = null; f.hasWarranty = null; f.hasServiceBook = null; f.isImported = null
    f.axleCount = null; f.payloadFrom = null; f.payloadTo = null
    f.grossWeightFrom = null; f.grossWeightTo = null; f.bodySubtype = ''
    f.hasRetarder = null; f.hasTachograph = null
    f.sortBy = ''
    models.value = []
    load(1)
}

async function onBrandChange() {
    f.modelId = null
    models.value = []
    if (f.brandId) models.value = await fetchModels(f.brandId)
}

function buildSearchBody(p: number): Record<string, unknown> {
    const body: Record<string, unknown> = { page: p, pageSize, sortBy: f.sortBy || undefined }
    if (f.categoryId)   body.categoryId   = f.categoryId
    if (f.textSearch)   body.textSearch   = f.textSearch
    if (f.brandId)      body.brandId      = f.brandId
    if (f.modelId)      body.modelId      = f.modelId
    if (f.fuelTypeId)   body.fuelTypeId   = f.fuelTypeId
    if (f.bodyTypeId)   body.bodyTypeId   = f.bodyTypeId
    if (f.gearboxId)    body.gearboxId    = f.gearboxId
    if (f.driveTypeId)  body.driveTypeId  = f.driveTypeId
    if (f.colorId)      body.colorId      = f.colorId
    if (f.priceFrom)    body.priceFrom    = f.priceFrom
    if (f.priceTo)      body.priceTo      = f.priceTo
    if (f.yearFrom)     body.yearFrom     = f.yearFrom
    if (f.yearTo)       body.yearTo       = f.yearTo
    if (f.mileageFrom)  body.mileageFrom  = f.mileageFrom
    if (f.mileageTo)    body.mileageTo    = f.mileageTo
    if (f.powerFrom)    body.powerFrom    = f.powerFrom
    if (f.powerTo)      body.powerTo      = f.powerTo
    if (f.sellerType)   body.sellerType   = f.sellerType
    if (f.condition)    body.condition    = f.condition
    if (f.hasDamage !== null)      body.hasDamage      = f.hasDamage
    if (f.hasWarranty !== null)    body.hasWarranty    = f.hasWarranty
    if (f.hasServiceBook !== null) body.hasServiceBook = f.hasServiceBook
    if (f.isImported !== null)     body.isImported     = f.isImported
    if (f.axleCount)               body.axleCount      = f.axleCount
    if (f.payloadFrom)             body.payloadFrom    = f.payloadFrom
    if (f.payloadTo)               body.payloadTo      = f.payloadTo
    if (f.grossWeightFrom)         body.grossWeightFrom = f.grossWeightFrom
    if (f.grossWeightTo)           body.grossWeightTo   = f.grossWeightTo
    if (f.bodySubtype)             body.bodySubtype    = f.bodySubtype
    if (f.hasRetarder !== null)    body.hasRetarder    = f.hasRetarder
    if (f.hasTachograph !== null)  body.hasTachograph  = f.hasTachograph
    return body
}

// ── SSR-safe taxonomy fetch ─────────────────────────────────────────────────────
const { data: taxoData } = await useAsyncData('taxonomy', async () => {
    const [b, ft, bt, gb, dt, c, cats, m] = await Promise.all([
        fetchBrands().catch(() => [] as TaxonomyItem[]),
        fetchFuelTypes().catch(() => [] as TaxonomyItem[]),
        fetchBodyTypes().catch(() => [] as TaxonomyItem[]),
        fetchGearboxes().catch(() => [] as TaxonomyItem[]),
        fetchDriveTypes().catch(() => [] as DriveType[]),
        fetchColors().catch(() => [] as CarColor[]),
        fetchCategories().catch(() => [] as CategoryWithCount[]),
        f.brandId ? fetchModels(f.brandId).catch(() => [] as TaxonomyItem[]) : Promise.resolve([] as TaxonomyItem[]),
    ])
    return { brands: b, fuelTypes: ft, bodyTypes: bt, gearboxes: gb, driveTypes: dt, colors: c, categories: cats, initialModels: m }
})

const allBrands  = computed(() => taxoData.value?.brands     ?? [])
const dynamicBrands = ref<{ id: number; name: string }[] | null>(null)
const brands     = computed(() => dynamicBrands.value ?? allBrands.value)
const fuelTypes  = computed(() => taxoData.value?.fuelTypes  ?? [])
const bodyTypes  = computed(() => taxoData.value?.bodyTypes  ?? [])
const gearboxes  = computed(() => taxoData.value?.gearboxes  ?? [])
const driveTypes = computed(() => taxoData.value?.driveTypes ?? [])
const colors     = computed(() => taxoData.value?.colors     ?? [])
const categories = computed(() => taxoData.value?.categories ?? [])

if (taxoData.value?.initialModels?.length) {
    models.value = taxoData.value.initialModels
}

// ── SSR-safe initial advert search ────────────────────────────────────────────────
const { data: searchData } = await useAsyncData('adverts-search', () =>
    $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert/search', {
        method: 'POST',
        body: buildSearchBody(page.value),
    }).catch(() => ({ items: [] as CarAdvert[], totalCount: 0 }))
)

adverts.value = searchData.value?.items ?? []
total.value   = searchData.value?.totalCount ?? 0

// ── Interactive load (client-side filtering) ────────────────────────────────────────────
async function load(p: number = page.value) {
    page.value = p
    loading.value = true

    const query: Record<string, string> = {}
    if (f.categoryId)  query.categoryId  = String(f.categoryId)
    if (f.textSearch)  query.textSearch  = f.textSearch
    if (f.brandId)     query.brandId     = String(f.brandId)
    if (f.modelId)     query.modelId     = String(f.modelId)
    if (f.fuelTypeId)  query.fuelTypeId  = String(f.fuelTypeId)
    if (f.bodyTypeId)  query.bodyTypeId  = String(f.bodyTypeId)
    if (f.gearboxId)   query.gearboxId   = String(f.gearboxId)
    if (f.priceFrom)   query.priceFrom   = String(f.priceFrom)
    if (f.priceTo)     query.priceTo     = String(f.priceTo)
    if (f.yearFrom)    query.yearFrom    = String(f.yearFrom)
    if (f.yearTo)      query.yearTo      = String(f.yearTo)
    if (f.mileageFrom) query.mileageFrom = String(f.mileageFrom)
    if (f.mileageTo)   query.mileageTo   = String(f.mileageTo)
    if (f.powerFrom)   query.powerFrom   = String(f.powerFrom)
    if (f.powerTo)     query.powerTo     = String(f.powerTo)
    if (f.driveTypeId) query.driveTypeId = String(f.driveTypeId)
    if (f.colorId)     query.colorId     = String(f.colorId)
    if (f.sellerType)  query.sellerType  = f.sellerType
    if (f.condition)   query.condition   = f.condition
    if (f.hasDamage !== null)      query.hasDamage      = String(f.hasDamage)
    if (f.hasWarranty !== null)    query.hasWarranty    = String(f.hasWarranty)
    if (f.hasServiceBook !== null) query.hasServiceBook = String(f.hasServiceBook)
    if (f.isImported !== null)     query.isImported     = String(f.isImported)
    if (f.bodySubtype)  query.bodySubtype = f.bodySubtype
    if (f.sortBy)      query.sortBy      = f.sortBy
    if (p > 1)         query.page        = String(p)
    router.replace({ query })

    try {
        const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert/search', {
            method: 'POST',
            body: buildSearchBody(p),
        })
        adverts.value = r?.items ?? []
        total.value   = r?.totalCount ?? 0
    } catch {
        adverts.value = []
    } finally {
        loading.value = false
    }
}

async function loadMore() {
    if (loadingMore.value || page.value >= totalPages.value) return
    loadingMore.value = true
    const nextPage = page.value + 1
    try {
        const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Advert/search', {
            method: 'POST',
            body: buildSearchBody(nextPage),
        })
        adverts.value = [...adverts.value, ...(r?.items ?? [])]
        total.value   = r?.totalCount ?? 0
        page.value    = nextPage
    } catch {
    } finally {
        loadingMore.value = false
    }
}

// Fetch favorites client-side only; also load category-specific brands if URL has categoryId
onMounted(async () => {
    fetchFavoriteIds()
    if (f.categoryId) {
        try { dynamicBrands.value = await fetchBrandsByCategory(f.categoryId) } catch { dynamicBrands.value = null }
    }
})
</script>

<style lang="scss" scoped>
.page-bg { background: $bg; min-height: 100vh; padding-top: $nav-height; }
.container { @include container; }

// ── Category hero ──────────────────────────────────────────────────────────────────────────────
.cat-hero {
    position: relative;
    height: 260px;
    overflow: hidden;
}

.cat-hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 40%;
    filter: brightness(0.45);
}

.cat-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, $bg 100%);
}

.cat-hero-inner {
    position: relative;
    z-index: 2;
    padding-top: 80px;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    margin-bottom: 12px;

    a { color: rgba(255,255,255,0.6); text-decoration: none; &:hover { color: white; } }
    span { color: rgba(255,255,255,0.4); }
}

.cat-hero-title {
    font-size: 44px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
}

.cat-hero-sub {
    color: $text-muted;
    font-size: 15px;
    margin-top: 8px;
}

// ── Page header (no category) ───────────────────────────────────────────────────────
.page-header {
    padding: 48px 0 0;
}

.page-title {
    font-size: 38px;
    font-weight: 900;
    color: $text;
}

.page-sub {
    color: $text-muted;
    font-size: 15px;
    margin-top: 6px;
}

// ── Search section ───────────────────────────────────────────────────────────────────────
.search-section {
    padding: 24px 0 0;
}

.search-card {
    @include card($r-xl);
    padding: 0;
    overflow: hidden;
    border-color: $border;
    transition: border-color 0.2s;

    &--focused {
        border-color: rgba($red, 0.4);
        box-shadow: 0 0 0 3px rgba($red, 0.06);
    }
}

.sc-main {
    display: flex;
    align-items: center;
    height: 58px;
}

.sc-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px;
    height: 100%;
}

.sc-icon { color: $text-dim; flex-shrink: 0; }

.sc-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 15px;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-faint; }
}

.sc-clear {
    background: none;
    border: none;
    color: $text-dim;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: color 0.15s;

    &:hover { color: $text; }
}

.sc-divider {
    width: 1px;
    height: 28px;
    background: $border;
    flex-shrink: 0;
}

.sc-select-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    height: 100%;
}

.sc-sel-icon { color: $text-dim; flex-shrink: 0; }

.sc-select {
    background: transparent;
    border: none;
    outline: none;
    color: $text-muted;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    min-width: 130px;
    max-width: 160px;

    option { background: #111; color: $text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.sc-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    height: 100%;
    padding: 0 28px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s;
    white-space: nowrap;

    &:hover { opacity: 0.88; }
}

.sc-count {
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 1px 8px;
    font-size: 12px;
}

.sc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 16px;
    border-top: 1px solid $border;
    background: rgba(255,255,255,0.015);
}

.sc-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    color: $red;
    border-radius: 20px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    font-family: 'Inter', sans-serif;

    &:hover { background: rgba($red, 0.18); }

    &--clear {
        background: transparent;
        border-color: $border;
        color: $text-dim;
        &:hover { background: rgba(255,255,255,0.04); color: $text; }
    }
}

// ── Layout ──────────────────────────────────────────────────────────────────────────────
.main-layout {
    display: grid;
    grid-template-columns: 268px 1fr;
    gap: 24px;
    padding-top: 28px;
    padding-bottom: 80px;

    @include respond-to(md) { grid-template-columns: 1fr; }
}

// ── Sidebar ────────────────────────────────────────────────────────────────────────────
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-self: start;
    position: sticky;
    top: calc($nav-height + 16px);

    @include respond-to(md) {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: min(360px, 92vw);
        z-index: 300;
        overflow-y: auto;
        padding: 0 16px 60px;
        background: $bg;
        box-shadow: 4px 0 32px rgba(0,0,0,0.6);
        transform: translateX(-105%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        gap: 12px;
        align-self: auto;

        &--open { transform: translateX(0); }
    }
}

.sidebar-backdrop {
    display: none;
    @include respond-to(md) {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        z-index: 299;
        backdrop-filter: blur(2px);
    }
}

.sidebar-mobile-hd {
    display: none;
    @include respond-to(md) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 4px 14px;
        border-bottom: 1px solid $border;
        margin-bottom: 4px;
        flex-shrink: 0;
    }
}

.sidebar-mobile-title {
    font-size: 15px;
    font-weight: 700;
    color: $text;
}

.sidebar-mobile-close {
    background: rgba(255,255,255,0.06);
    border: 1px solid $border;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-muted;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    &:hover { background: rgba(255,255,255,0.1); color: $text; }
}

.sidebar-block {
    @include card($r-xl);
    padding: 20px;
}

.sidebar-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 14px;
}

.stitle-icon { color: $red; }

// Category list
.cat-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 9px;
    border-radius: $r-sm;
    cursor: pointer;
    transition: background 0.15s;
    color: $text-muted;
    font-size: 13px;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }

    &.active {
        background: rgba($red, 0.1);
        color: $text;
        border-left: 2px solid $red;
        padding-left: 7px;
    }
}

.cat-item-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgba($red, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    flex-shrink: 0;
}

.cat-item-name { flex: 1; }

.cat-item-count {
    font-size: 11px;
    color: $text-faint;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 1px 7px;
}

// Filter sections
.filter-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;

    .sidebar-title { margin-bottom: 0; }
}

.clear-btn {
    background: none;
    border: none;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;

    &:hover { opacity: 0.8; }
}

.filter-section {
    margin-bottom: 18px;

    &:last-of-type { margin-bottom: 14px; }
}

.filter-section-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;

    .v-icon { color: $red; }
}

.range-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.range-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 8px 10px;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    outline: none;
    min-width: 0;
    transition: border-color 0.2s;

    &::placeholder { color: $text-faint; }
    &:focus { border-color: rgba($red, 0.4); }

    // Hide number spinners
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; }
    -moz-appearance: textfield;
}

.range-sep { color: $text-dim; font-size: 13px; flex-shrink: 0; }

.filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.fopt-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 500;
    padding: 5px 10px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;

    &:hover { border-color: rgba($red, 0.3); color: $text; }
    &.active { background: rgba($red, 0.12); border-color: rgba($red, 0.4); color: $red; font-weight: 700; }
}

.filter-select-wrap {
    position: relative;
}

.filter-select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 8px 10px;
    color: $text-muted;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;

    option { background: #111; color: $text; }
    &:focus { border-color: rgba($red, 0.4); }
}

.color-sel-name {
    margin-left: auto;
    font-size: 10px;
    font-weight: 500;
    color: $red;
    text-transform: none;
    letter-spacing: 0;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: transform 0.12s, border-color 0.12s;
    outline: none;
    position: relative;

    &:hover { transform: scale(1.18); }

    &.active {
        border-color: $red;
        box-shadow: 0 0 0 2px rgba($red, 0.35);
        transform: scale(1.12);
    }

    &--all {
        background: rgba(255,255,255,0.06);
        border-color: $border;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-dim;
        font-size: 10px;

        &.active {
            border-color: $red;
            color: $red;
            box-shadow: 0 0 0 2px rgba($red, 0.35);
        }

        &:hover { transform: scale(1.1); color: $text; }
    }
}

.filter-checks {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.fcheck {
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-muted;
    font-size: 12px;
    cursor: pointer;
    user-select: none;

    input[type=checkbox] {
        accent-color: $red;
        width: 14px;
        height: 14px;
        cursor: pointer;
    }

    &:hover { color: $text; }
}

.apply-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    padding: 11px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

// ── Content area ────────────────────────────────────────────────────────────────────────────
.content { min-width: 0; }

.results-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.results-hd-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.mobile-filter-toggle {
    display: none;

    @include respond-to(md) {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.04);
        border: 1px solid $border;
        border-radius: $r-sm;
        color: $text-muted;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        padding: 7px 12px;
        cursor: pointer;
        white-space: nowrap;
        transition: border-color 0.2s, color 0.2s;

        &:hover { border-color: $text-dim; color: $text; }
    }
}

.mft-count {
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    border-radius: 10px;
    padding: 1px 6px;
    min-width: 16px;
    text-align: center;
    line-height: 1.4;
}

.result-count {
    color: $text-muted;
    font-size: 14px;

    strong { color: $red; }
}

.sort-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sort-icon { color: $text-dim; }

.sort-select {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 7px 12px;
    color: $text-muted;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;

    option { background: #111; color: $text; }
    &:focus { border-color: rgba($red, 0.4); }
}

.loading-state {
    display: flex;
    justify-content: center;
    padding: 80px 0;
    color: $text-dim;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.cars-grid { @include cars-grid; }

.no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 80px 0;
    text-align: center;

    .no-results-icon { color: #222; margin-bottom: 4px; }

    p { font-size: 22px; font-weight: 700; color: $text-muted; margin: 0; }
    span { font-size: 14px; color: $text-dim; }
}

.clear-filters-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid rgba($red, 0.4);
    background: rgba($red, 0.06);
    color: $red;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 8px 18px;
    border-radius: $r-sm;
    cursor: pointer;
    margin-top: 4px;
    transition: all 0.2s;
    &:hover { background: rgba($red, 0.14); }
}

.load-more-wrap {
    display: flex;
    justify-content: center;
    margin-top: 36px;
}

.load-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid $border;
    background: transparent;
    color: $text-muted;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 32px;
    border-radius: $r-sm;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) { border-color: $red; color: $red; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── Pagination ────────────────────────────────────────────────────────────────────────────────
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 48px;
}

.page-btn {
    min-width: 36px;
    height: 36px;
    border-radius: $r-sm;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0 6px;

    &:hover:not(:disabled) { border-color: rgba($red, 0.4); color: $text; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }

    &--active {
        background: $red;
        border-color: $red;
        color: white;
        font-weight: 700;
    }

    &--dot { cursor: default; border-color: transparent; background: transparent; }
}

.filter-cat-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.25);
    border-radius: $r-sm;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: $red;
    margin-bottom: 14px;
    .fcb-clear { margin-left: auto; background: transparent; border: none; color: $red; cursor: pointer; display: flex; align-items: center; padding: 0; }
}
</style>
