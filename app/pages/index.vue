<template>
    <div class="home">

        <!-- ─── Hero ─────────────────────────────────────────────────── -->
        <section class="hero-fs">
            <!-- Full-bleed background image -->
            <img src="/hero-car.jpg" alt="CARIZO – motoryzacja online" class="hfs-img" fetchpriority="high" />
            <!-- Gradient overlay: dark from left, bottom vignette -->
            <div class="hfs-fade" />

            <!-- Text content -->
            <div class="hfs-left">
                <div class="hfs-left-inner">
                    <div class="hfs-eyebrow">
                        <span class="eyebrow-dot" />
                        Platforma motoryzacyjna premium
                    </div>
                    <h1 class="hfs-title">
                        Kupuj pewniej.<br>
                        <span class="title-accent">Sprzedaj&nbsp;szybciej.</span>
                    </h1>
                    <ul class="hfs-features">
                        <li><v-icon icon="mdi-shield-check-outline" size="16" class="hfs-feat-icon" />Zweryfikowane ogłoszenia</li>
                        <li><v-icon icon="mdi-file-document-outline" size="16" class="hfs-feat-icon" />Historia pojazdu</li>
                        <li><v-icon icon="mdi-cpu-64-bit" size="16" class="hfs-feat-icon" />Inteligentna wycena AI</li>
                        <li><v-icon icon="mdi-account-tie-outline" size="16" class="hfs-feat-icon" />Profesjonalni sprzedawcy w jednym miejscu</li>
                    </ul>
                    <div class="hfs-links">
                        <NuxtLink to="/adverts" class="hfs-link hfs-link--primary">
                            <v-icon icon="mdi-magnify" size="16" />
                            Znajdź samochód
                        </NuxtLink>
                        <NuxtLink to="/add-advert" class="hfs-link hfs-link--secondary">
                            <v-icon icon="mdi-plus-circle-outline" size="16" />
                            Dodaj ogłoszenie
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- scroll indicator -->
            <div class="hfs-scroll">
                <v-icon icon="mdi-chevron-down" size="26" />
            </div>
        </section>

        <!-- Search section -->
        <section class="search-section">
            <div class="container">

                <!-- Category tabs -->
                <div class="cat-tabs">
                    <button
                        v-for="cat in SEARCH_CATEGORIES"
                        :key="cat.slug"
                        class="cat-tab"
                        :class="{ 'cat-tab--active': searchCat === cat.slug }"
                        @click="selectSearchCat(cat.slug)"
                    >
                        <v-icon :icon="cat.icon" size="14" />
                        {{ cat.label }}
                    </button>
                </div>

                <!-- Form panel -->
                <div class="hs-panel">

                <!-- Level 1: Primary row -->
                <div class="hs-primary">
                    <div v-if="currentSearchConfig.hasBrand" class="hsp-field">
                        <label class="hsp-label">{{ currentSearchConfig.brandLabel ?? 'Marka' }}</label>
                        <select v-model="searchBrandId" class="hsp-select" @change="onBrandChange">
                            <option :value="null">Wszystkie marki</option>
                            <option v-for="b in filterBrands.filter(b => b.name && !/^\d+$/.test(b.name))" :key="b.id" :value="b.id">{{ b.name }}</option>
                        </select>
                    </div>
                    <div v-if="currentSearchConfig.hasBrand && currentSearchConfig.hasModel" class="hsp-field">
                        <label class="hsp-label">Model</label>
                        <select v-model="searchModelId" class="hsp-select" :disabled="!searchBrandId" @change="onModelChange">
                            <option :value="null">{{ searchBrandId ? 'Wszystkie modele' : 'Wybierz markę' }}</option>
                            <option v-for="m in searchModels" :key="m.id" :value="m.id">{{ m.name }}</option>
                        </select>
                    </div>
                    <div v-if="currentSearchConfig.subtypes?.length" class="hsp-field">
                        <label class="hsp-label">{{ currentSearchConfig.subtypeLabel ?? 'Typ' }}</label>
                        <select v-model="searchSubtype" class="hsp-select">
                            <option value="">Wszystkie</option>
                            <option v-for="s in currentSearchConfig.subtypes" :key="s" :value="s">{{ s }}</option>
                        </select>
                    </div>
                    <div v-if="currentSearchConfig.hasPartCategory" class="hsp-field">
                        <label class="hsp-label">Kategoria części</label>
                        <select v-model="searchPartCategory" class="hsp-select">
                            <option value="">Wszystkie kategorie</option>
                            <option v-for="pc in PART_CATEGORIES" :key="pc.value" :value="pc.value">{{ pc.label }}</option>
                        </select>
                    </div>
                    <div class="hsp-field hsp-range">
                        <label class="hsp-label">Cena (PLN)</label>
                        <div class="hsp-range-row">
                            <input v-model="searchPriceFrom" type="number" class="hsp-input" placeholder="Od" min="0" />
                            <span class="hsp-sep">—</span>
                            <input v-model="searchPriceTo" type="number" class="hsp-input" placeholder="Do" min="0" />
                        </div>
                    </div>
                    <button class="hsp-search-btn" @click="doSearch">
                        <v-icon icon="mdi-magnify" size="18" />
                        Szukaj
                    </button>
                </div>

                <!-- Więcej filtrów toggle -->
                <div class="hs-more-row">
                    <button class="hs-more-btn" @click="showMoreFilters = !showMoreFilters">
                        <v-icon icon="mdi-tune-variant" size="15" />
                        Więcej filtrów
                        <span v-if="homeAdvancedCount" class="hs-more-badge">{{ homeAdvancedCount }}</span>
                        <v-icon :icon="showMoreFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="15" />
                    </button>
                </div>

                <!-- Level 2: Advanced filters (expandable) -->
                <Transition name="hs-expand">
                    <div v-if="showMoreFilters" class="hs-expanded">
                        <div class="hse-grid">

                            <div v-if="currentSearchConfig.hasBodyType && bodyTypes.length" class="hse-field">
                                <label class="hse-label">Nadwozie</label>
                                <select v-model="searchBodyTypeId" class="hse-select">
                                    <option :value="null">Wszystkie</option>
                                    <option v-for="bt in bodyTypes" :key="bt.id" :value="bt.id">{{ bt.name }}</option>
                                </select>
                            </div>

                            <div v-if="currentSearchConfig.hasEngineSize" class="hse-field hse-range">
                                <label class="hse-label">Pojemność (cm³)</label>
                                <div class="hse-range-row">
                                    <input v-model="searchEngineSizeFrom" type="number" class="hse-input" placeholder="Od" min="0" />
                                    <span class="hse-sep">—</span>
                                    <input v-model="searchEngineSizeTo" type="number" class="hse-input" placeholder="Do" min="0" />
                                </div>
                            </div>

                            <div v-if="currentSearchConfig.hasFuel && fuelTypes.length" class="hse-field">
                                <label class="hse-label">Paliwo</label>
                                <select v-model="searchFuelId" class="hse-select">
                                    <option :value="null">Wszystkie</option>
                                    <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
                                </select>
                            </div>

                            <div v-if="currentSearchConfig.hasFuel && gearboxes.length" class="hse-field">
                                <label class="hse-label">Skrzynia biegów</label>
                                <select v-model="searchGearboxId" class="hse-select">
                                    <option :value="null">Wszystkie</option>
                                    <option v-for="g in gearboxes" :key="g.id" :value="g.id">{{ g.name }}</option>
                                </select>
                            </div>

                            <div v-if="currentSearchConfig.hasFuel" class="hse-field">
                                <label class="hse-label">Napęd</label>
                                <select v-model="searchDriveType" class="hse-select">
                                    <option value="">Wszystkie</option>
                                    <option value="FWD">Przedni (FWD)</option>
                                    <option value="RWD">Tylny (RWD)</option>
                                    <option value="AWD">4x4 / AWD</option>
                                </select>
                            </div>

                            <div v-if="currentSearchConfig.hasMileage" class="hse-field hse-range">
                                <label class="hse-label">Przebieg (km)</label>
                                <div class="hse-range-row">
                                    <input v-model="searchMileageFrom" type="number" class="hse-input" placeholder="Od" min="0" />
                                    <span class="hse-sep">—</span>
                                    <input v-model="searchMileageTo" type="number" class="hse-input" placeholder="Do" min="0" />
                                </div>
                            </div>

                            <div v-if="currentSearchConfig.hasHours" class="hse-field hse-range">
                                <label class="hse-label">Motogodziny (mth)</label>
                                <div class="hse-range-row">
                                    <input v-model="searchHoursFrom" type="number" class="hse-input" placeholder="Od" min="0" />
                                    <span class="hse-sep">—</span>
                                    <input v-model="searchHoursTo" type="number" class="hse-input" placeholder="Do" min="0" />
                                </div>
                            </div>

                            <div v-if="currentSearchConfig.hasPower" class="hse-field hse-range">
                                <label class="hse-label">Moc (KM)</label>
                                <div class="hse-range-row">
                                    <input v-model="searchPowerFrom" type="number" class="hse-input" placeholder="Od" min="0" />
                                    <span class="hse-sep">—</span>
                                    <input v-model="searchPowerTo" type="number" class="hse-input" placeholder="Do" min="0" />
                                </div>
                            </div>

                            <div v-if="currentSearchConfig.hasPayload" class="hse-field hse-range">
                                <label class="hse-label">Ładowność (kg)</label>
                                <div class="hse-range-row">
                                    <input v-model="searchPayloadFrom" type="number" class="hse-input" placeholder="Od" min="0" />
                                    <span class="hse-sep">—</span>
                                    <input v-model="searchPayloadTo" type="number" class="hse-input" placeholder="Do" min="0" />
                                </div>
                            </div>

                            <div class="hse-field hse-range">
                                <label class="hse-label">Rok produkcji</label>
                                <div class="hse-range-row">
                                    <input v-model="searchYearFrom" type="number" class="hse-input" placeholder="Od" min="1900" :max="currentYear" />
                                    <span class="hse-sep">—</span>
                                    <input v-model="searchYearTo" type="number" class="hse-input" placeholder="Do" min="1900" :max="currentYear" />
                                </div>
                            </div>

                            <div v-if="currentSearchConfig.hasFuel" class="hse-field">
                                <label class="hse-label">Wyposażenie</label>
                                <input v-model="searchEquipment" type="text" class="hse-input hse-input--full" placeholder="np. klimatyzacja, nawigacja..." />
                            </div>

                            <div v-if="currentSearchConfig.hasCondition" class="hse-field">
                                <label class="hse-label">Stan pojazdu</label>
                                <select v-model="searchCondition" class="hse-select">
                                    <option value="">Wszystkie</option>
                                    <option value="Nowe">Nowe</option>
                                    <option value="Używane">Używane</option>
                                    <option value="Uszkodzone">Uszkodzone</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </Transition>

                </div><!-- /hs-panel -->
            </div>
        </section>

        <!-- ─── Stats strip ──────────────────────────────────────────── -->
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

        <!-- ─── Car of week ──────────────────────────────────────────────── -->
        <section v-if="carOfWeek" class="section cow-section">
            <div class="container">
                <div class="cow-header">
                    <div class="cow-eyebrow"><v-icon icon="mdi-trophy-outline" size="16" />SAMOCHÓD TYGODNIA</div>
                </div>
                <AdvertCard :advert="carOfWeek" class="cow-card" />
            </div>
        </section>

        <!-- ─── Premium Collection ───────────────────────────────────────── -->
        <section v-if="clientDataLoading || premiumCollection.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <div class="sec-top-left">
                        <div class="sec-eyebrow">PREMIUM COLLECTION</div>
                        <h2>Pojazdy premium</h2>
                    </div>
                    <NuxtLink to="/adverts" class="see-all">Wszystkie <v-icon icon="mdi-arrow-right" size="16" /></NuxtLink>
                </div>
                <div class="cars-grid">
                    <template v-if="clientDataLoading">
                        <AdvertCardSkeleton v-for="n in 4" :key="n" />
                    </template>
                    <template v-else>
                        <AdvertCard v-for="a in premiumCollection" :key="a.id" :advert="a" />
                    </template>
                </div>
            </div>
        </section>

        <!-- ─── Premium showcase ─────────────────────────────────────── -->
        <section class="section premium-showcase-section">
            <div class="container">
                <div class="psc-header">
                    <div class="psc-header-text">
                        <div class="psc-eyebrow">PREMIUM</div>
                        <h2 class="psc-title">Marki premium</h2>
                        <p class="psc-sub">Odkryj ogłoszenia od topowych producentów motoryzacji</p>
                    </div>
                    <NuxtLink to="/adverts" class="see-all">
                        Przeglądaj wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="psc-grid">
                    <NuxtLink
                        v-for="car in premiumShowcase"
                        :key="car.brand"
                        :to="`/adverts?textSearch=${encodeURIComponent(car.brand)}`"
                        class="psc-card"
                    >
                        <div class="psc-top-row">
                            <span class="psc-badge">Premium</span>
                        </div>
                        <div class="psc-car-name">
                            <div class="psc-brand">{{ car.brand }}</div>
                        </div>
                        <div class="psc-spec">{{ car.tagline }}</div>
                        <div class="psc-cta">
                            Szukaj ofert <v-icon icon="mdi-arrow-right" size="14" />
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- ─── Top adverts ──────────────────────────────────────────── -->
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

        <!-- ─── Most viewed ─────────────────────────────────────────────── -->
        <section v-if="clientDataLoading || mostViewed.length" class="section">
            <div class="container">
                <div class="sec-top">
                    <div class="sec-top-left">
                        <div class="sec-eyebrow">NAJCZĘŚCIEJ OGLĄDANE</div>
                        <h2>Popularne ogłoszenia</h2>
                    </div>
                    <NuxtLink to="/adverts" class="see-all">Wszystkie <v-icon icon="mdi-arrow-right" size="16" /></NuxtLink>
                </div>
                <div class="cars-grid cars-grid--small">
                    <template v-if="clientDataLoading">
                        <AdvertCardSkeleton v-for="n in 4" :key="n" />
                    </template>
                    <template v-else>
                        <AdvertCard v-for="a in mostViewed.slice(0, 4)" :key="a.id" :advert="a" />
                    </template>
                </div>
            </div>
        </section>

        <!-- ─── Why CARIZO ───────────────────────────────────────────── -->
        <section class="section why-section">
            <div class="container">
                <div class="why-header">
                    <div class="why-eyebrow">DLACZEGO</div>
                    <img src="/carizo-logo.svg" alt="CARIZO" class="why-logo" loading="lazy" />
                    <p class="why-sub">Łączymy najlepszą technologię z pasją do motoryzacji</p>
                </div>
                <div class="why-grid">
                    <div v-for="f in feats" :key="f.title" class="why-card">
                        <div class="why-card-icon">
                            <v-icon :icon="f.icon" size="32" />
                        </div>
                        <h3 class="why-card-title">{{ f.title }}</h3>
                        <p class="why-card-desc">{{ f.desc }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ─── ING Finansowanie ──────────────────────────────────────── -->
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
<a href="https://www.inglesing.pl" target="_blank" rel="noopener noreferrer" class="ing-cta">Sprawdź ofertę <v-icon icon="mdi-arrow-right" size="13" /></a>
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
                                <span><v-icon icon="mdi-check" size="13" />RRSO od 7,99%*</span>
                            </div>
<a href="https://www.ing.pl/dla-klientow-indywidualnych/pozyczki-i-kredyty" target="_blank" rel="noopener noreferrer" class="ing-cta">Oblicz ratę <v-icon icon="mdi-arrow-right" size="13" /></a>
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
                            <a href="https://www.ing.pl/dla-firm" target="_blank" rel="noopener noreferrer" class="ing-cta">Skontaktuj się <v-icon icon="mdi-arrow-right" size="13" /></a>
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
<a href="https://www.ing.pl/dla-klientow-indywidualnych/pozyczki-i-kredyty" target="_blank" rel="noopener noreferrer" class="ing-cta">Złóż wniosek <v-icon icon="mdi-arrow-right" size="13" /></a>
                        </div>
                    </div>
                    <div class="ing-disclaimer">* Wyniki kalkulatora są orientacyjne. Rzeczywiste warunki zależą od oceny kredytowej. RRSO od 7,99% dotyczy oferty przykładowej zgodnie z Ustawą o kredycie konsumenckim; aktualna stawka może się różnić.</div>
                </div>
            </div>
        </section>

        <!-- ─── Events ───────────────────────────────────────────────── -->
        <section v-if="events.length" class="section events-section">
            <div class="container">
                <div class="sec-top">
                    <h2>Nadchodzące <span>wydarzenia</span></h2>
                    <NuxtLink to="/wydarzenia" class="see-all">
                        Zobacz wszystkie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>

                <div v-if="featuredEvent" class="featured-banner" @click="navigateTo(`/wydarzenie/${featuredEvent.id}`)">
                    <div class="fb-img-wrap">
                        <img :src="getEventImageUrl(featuredEvent)" :alt="featuredEvent.name" loading="lazy" />
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
                            <img :src="getEventImageUrl(ev)" :alt="ev.name" loading="lazy" />
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
                                <a v-if="ev.ticketsUrl" :href="ev.ticketsUrl" target="_blank" rel="noopener noreferrer" class="event-link-btn" @click.stop>
                                    Kup bilety <v-icon icon="mdi-arrow-right" size="14" />
                                </a>
                                <a v-else-if="ev.websiteUrl" :href="ev.websiteUrl" target="_blank" rel="noopener noreferrer" class="event-link-btn" @click.stop>
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

        <!-- ─── Recently added ───────────────────────────────────────── -->
        <section v-if="recentlyAdded.length || featured.length" class="section recently-added-section">
            <div class="container">
                <div class="sec-top">
                    <div class="sec-top-left">
                        <div class="sec-eyebrow">NOWE OGŁOSZENIA</div>
                        <h2>Ostatnio dodane</h2>
                    </div>
                    <NuxtLink to="/adverts" class="see-all">
                        Wszystkie ogłoszenia
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>
                <div class="cars-grid cars-grid--small">
                    <AdvertCard
                        v-for="a in (recentlyAdded.length ? recentlyAdded : featured).slice(0, 4)"
                        :key="a.id"
                        :advert="a"
                    />
                </div>
            </div>
        </section>

        <!-- ─── O nas ──────────────────────────────────────────────── -->
        <section id="about" class="section about-section">
            <div class="container">
                <div class="about-header">
                    <div class="about-eyebrow">O NAS</div>
                    <h2>Stworzyliśmy CARIZO,<br><span>bo rynek zasługuje na więcej</span></h2>
                    <p class="about-lead">Jesteśmy zespołem pasjonatów motoryzacji i technologii, którzy postanowili zmienić sposób, w jaki Polacy kupują i sprzedają samochody.</p>
                </div>

                <div class="about-body">
                    <div class="about-story">
                        <p>CARIZO powstało z jednego przekonania — transakcja samochodowa powinna być prosta, przejrzysta i bezpieczna dla obu stron. Stare portale ogłoszeniowe oferowały skany wyblakłych ogłoszeń z lat 90. My chcieliśmy czegoś więcej.</p>
                        <p>Budujemy narzędzia, które realnie pomagają: inteligentne wyszukiwanie, wyceny oparte na danych rynkowych, weryfikowane konta dealerów i bezpośredni kontakt bez pośredników. Każda funkcja jest przemyślana — od zdjęcia głównego po kalkulator raty ING.</p>
                        <p>Dzisiaj CARIZO to tysiące aktywnych ogłoszeń, sieć zweryfikowanych dealerów i rosnąca społeczność ludzi, dla których samochód to więcej niż środek transportu.</p>
                        <a href="mailto:kontakt@carizo.eu" class="about-cta">
                            <v-icon icon="mdi-email-outline" size="16" />
                            Napisz do nas
                        </a>
                    </div>

                    <div class="about-stats">
                        <div class="about-stat">
                            <div class="about-stat-val">10k+</div>
                            <div class="about-stat-label">Ogłoszeń</div>
                        </div>
                        <div class="about-stat">
                            <div class="about-stat-val">500+</div>
                            <div class="about-stat-label">Dealerów</div>
                        </div>
                        <div class="about-stat">
                            <div class="about-stat-val">98%</div>
                            <div class="about-stat-label">Zadowolonych użytkowników</div>
                        </div>
                        <div class="about-stat">
                            <div class="about-stat-val">24/7</div>
                            <div class="about-stat-label">Wsparcie</div>
                        </div>
                    </div>
                </div>

                <div class="about-values">
                    <div class="about-value">
                        <div class="about-value-icon"><v-icon icon="mdi-shield-check-outline" size="26" /></div>
                        <div class="about-value-title">Bezpieczeństwo</div>
                        <div class="about-value-desc">Weryfikujemy konta dealerów i monitorujemy ogłoszenia, żeby Twoja transakcja była bezpieczna.</div>
                    </div>
                    <div class="about-value">
                        <div class="about-value-icon"><v-icon icon="mdi-lightbulb-outline" size="26" /></div>
                        <div class="about-value-title">Technologia</div>
                        <div class="about-value-desc">Budujemy nowoczesne narzędzia, które oszczędzają czas i dają przewagę zarówno kupującym, jak i sprzedającym.</div>
                    </div>
                    <div class="about-value">
                        <div class="about-value-icon"><v-icon icon="mdi-handshake-outline" size="26" /></div>
                        <div class="about-value-title">Transparentność</div>
                        <div class="about-value-desc">Bez ukrytych opłat i sztuczek. Jasne ceny, uczciwe zasady i pełna historia ogłoszenia w jednym miejscu.</div>
                    </div>
                    <div class="about-value">
                        <div class="about-value-icon"><v-icon icon="mdi-car-heart" size="26" /></div>
                        <div class="about-value-title">Pasja</div>
                        <div class="about-value-desc">Sami jesteśmy fanami motoryzacji. CARIZO robimy tak, jak sami chcielibyśmy używać takiej platformy.</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ─── Newsletter ───────────────────────────────────────────── -->
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
                        <button
                            class="btn-subscribe"
                            :disabled="subscribeLoading || !newsletterConsent"
                            :title="!newsletterConsent ? 'Zaznacz zgodę na newsletter poniżej' : undefined"
                            @click="subscribeNewsletter"
                        >
                            {{ subscribeLoading ? 'Zapisywanie...' : 'Zapisz się' }}
                        </button>
                    </div>
                    <label class="news-consent">
                        <input v-model="newsletterConsent" type="checkbox" class="news-consent-input" />
                        <span class="news-consent-box" :class="{ 'news-consent-box--checked': newsletterConsent }">
                            <v-icon v-if="newsletterConsent" icon="mdi-check" size="11" />
                        </span>
                        <span class="news-consent-text">Wyrażam zgodę na otrzymywanie newslettera CARIZO z ofertami i nowościami motoryzacyjnymi. Możesz zrezygnować w każdej chwili klikając link w e-mailu. <NuxtLink to="/polityka-prywatnosci" class="news-pp-link">Polityka prywatności</NuxtLink></span>
                    </label>
                    <p v-if="subscribeSuccess" class="subscribe-feedback subscribe-ok">{{ subscribeMessage }}</p>
                    <p v-if="subscribeError" class="subscribe-feedback subscribe-err">{{ subscribeError }}</p>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, CarEvent, PagedResult, TaxonomyItem } from '~/types'

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string
useHead({
    title: 'CARIZO — Nowoczesna platforma motoryzacyjna',
    meta: [
        { name: 'description', content: 'Kupuj i sprzedawaj auta na CARIZO — zweryfikowane ogłoszenia, inteligentne narzędzia, zaufani sprzedawcy.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteUrl },
        { property: 'og:title', content: 'CARIZO — Nowoczesna platforma motoryzacyjna' },
        { property: 'og:description', content: 'Kupuj i sprzedawaj auta na CARIZO — zweryfikowane ogłoszenia, inteligentne narzędzia, zaufani sprzedawcy.' },
        { property: 'og:image', content: `${siteUrl}/hero-car.jpg` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'CARIZO' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'CARIZO — Nowoczesna platforma motoryzacyjna' },
        { name: 'twitter:description', content: 'Kupuj i sprzedawaj auta na CARIZO.' },
        { name: 'twitter:image', content: `${siteUrl}/hero-car.jpg` },
    ],
    link: [
        { rel: 'canonical', href: siteUrl },
        { rel: 'preload', as: 'image', href: '/hero-car.jpg', fetchpriority: 'high' },
    ],
    script: [
        {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'Organization',
                        '@id': `${siteUrl}/#organization`,
                        name: 'CARIZO',
                        url: siteUrl,
                        logo: {
                            '@type': 'ImageObject',
                            url: `${siteUrl}/carizo-logo.svg`,
                        },
                        sameAs: [
                            config.public.socialFacebook,
                            config.public.socialInstagram,
                        ].filter(Boolean),
                    },
                    {
                        '@type': 'WebSite',
                        '@id': `${siteUrl}/#website`,
                        url: siteUrl,
                        name: 'CARIZO',
                        publisher: { '@id': `${siteUrl}/#organization` },
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: {
                                '@type': 'EntryPoint',
                                urlTemplate: `${siteUrl}/adverts?search={search_term_string}`,
                            },
                            'query-input': 'required name=search_term_string',
                        },
                    },
                ],
            }),
        },
    ],
})

const featured = ref<CarAdvert[]>([])
const topAdverts = ref<CarAdvert[]>([])
const recentlyAdded = ref<CarAdvert[]>([])
const mostViewed = ref<CarAdvert[]>([])
const carOfWeek = ref<CarAdvert | null>(null)
const premiumCollection = ref<CarAdvert[]>([])
const events = ref<CarEvent[]>([])
const filterBrands = ref<TaxonomyItem[]>([])
const homeStats = ref({ activeAdverts: 0, totalUsers: 0, soldVehicles: 0, events: 0 })
const clientDataLoading = ref(false)
const statsLoading = ref(true)

// ─── Hero search state ────────────────────────────────────────────────────────

const heroMarka   = ref<number | null>(null)
const heroModel   = ref<number | null>(null)
const heroPrice   = ref('')
const heroModels  = ref<TaxonomyItem[]>([])
const heroCategory = ref('samochody')
const heroCatType  = ref<string | null>(null)
const heroFuel     = ref<string | null>(null)
const heroYearFrom = ref<number | null>(null)
const heroYearTo   = ref<number | null>(null)

const FUEL_OPTIONS  = ['Benzyna', 'Diesel', 'Elektryczny', 'Hybryda', 'Hybryda plug-in', 'LPG', 'CNG', 'Wodór']
const CURRENT_YEAR  = new Date().getFullYear()
const years         = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => CURRENT_YEAR - i)
const yearsReverse  = [...years]

// ─── Category configs ─────────────────────────────────────────────────────────

const heroCats = [
    { key: 'samochody',  label: 'Samochody',  icon: 'mdi-car',              categoryId: null },
    { key: 'motocykle',  label: 'Motocykle',   icon: 'mdi-motorbike',        categoryId: 6    },
    { key: 'dostawcze',  label: 'Dostawcze',   icon: 'mdi-van-utility',      categoryId: 2    },
    { key: 'ciezarowe',  label: 'Ciężarowe',   icon: 'mdi-truck',            categoryId: 3    },
    { key: 'rolnicze',   label: 'Rolnicze',    icon: 'mdi-tractor',          categoryId: 8    },
    { key: 'budowlane',  label: 'Budowlane',   icon: 'mdi-excavator',        categoryId: 9    },
    { key: 'kampery',    label: 'Kampery',     icon: 'mdi-rv-truck',         categoryId: 7    },
    { key: 'czesci',     label: 'Części',      icon: 'mdi-cog-outline',      categoryId: 5    },
] as const

const CATEGORY_CONFIGS: Record<string, {
    showBrand: boolean
    showModel: boolean
    showFuel: boolean
    showYear: boolean
    typeLabel: string
    typeOptions: string[] | null
    categoryId: number | null
}> = {
    samochody: {
        showBrand: true, showModel: true, showFuel: true, showYear: true,
        typeLabel: '', typeOptions: null, categoryId: null,
    },
    motocykle: {
        showBrand: true, showModel: true, showFuel: false, showYear: true,
        typeLabel: 'Typ', typeOptions: ['Naked', 'Sport', 'Turystyczny', 'Enduro', 'Crossowy', 'Scooter', 'Chopper', 'Elektryczny'],
        categoryId: 6,
    },
    dostawcze: {
        showBrand: true, showModel: true, showFuel: false, showYear: false,
        typeLabel: 'Zabudowa', typeOptions: ['Skrzyniowy', 'Furgon', 'Chłodnia', 'Izoterma', 'Wywrotka', 'Kontener'],
        categoryId: 2,
    },
    ciezarowe: {
        showBrand: true, showModel: false, showFuel: false, showYear: false,
        typeLabel: 'Typ pojazdu', typeOptions: ['Ciągnik siodłowy', 'Wywrotka', 'Kontenerowiec', 'Chłodnia', 'Cysterna', 'Furgon', 'Żuraw'],
        categoryId: 3,
    },
    rolnicze: {
        showBrand: true, showModel: false, showFuel: false, showYear: true,
        typeLabel: 'Typ maszyny', typeOptions: ['Traktor', 'Kombajn', 'Siewnik', 'Pług', 'Opryskiwacz', 'Prasa', 'Rozsiewacz', 'Przyczepa rolnicza'],
        categoryId: 8,
    },
    budowlane: {
        showBrand: true, showModel: false, showFuel: false, showYear: false,
        typeLabel: 'Typ maszyny', typeOptions: ['Koparka', 'Koparko-ładowarka', 'Ładowarka', 'Dźwig', 'Walec', 'Spycharka', 'Wywrotka', 'Żuraw'],
        categoryId: 9,
    },
    kampery: {
        showBrand: true, showModel: false, showFuel: false, showYear: true,
        typeLabel: 'Typ', typeOptions: ['Kamper', 'Przyczepa kempingowa', 'Przyczepa kempingowa składana', 'Bus kempingowy'],
        categoryId: 7,
    },
    czesci: {
        showBrand: true, showModel: false, showFuel: false, showYear: false,
        typeLabel: 'Kategoria', typeOptions: ['Silnik', 'Skrzynia biegów', 'Zawieszenie', 'Układ hamulcowy', 'Elektryka', 'Karoseria', 'Wnętrze', 'Opony / Felgi', 'Szyby', 'Chłodnica', 'Wydech'],
        categoryId: 5,
    },
}

const heroCatConfig = computed(() => CATEGORY_CONFIGS[heroCategory.value] ?? CATEGORY_CONFIGS.samochody)

function selectHeroCategory(key: string) {
    heroCategory.value = key
    heroMarka.value = null
    heroModel.value = null
    heroCatType.value = null
    heroFuel.value = null
    heroYearFrom.value = null
    heroYearTo.value = null
    heroModels.value = []
}

async function loadHeroModels() {
    if (!heroMarka.value) { heroModels.value = []; return }
    try { heroModels.value = await fetchModels(heroMarka.value) } catch { heroModels.value = [] }
}

function doHeroSearch() {
    const query: Record<string, string> = {}
    const cfg = heroCatConfig.value
    if (cfg.categoryId) query.categoryId = String(cfg.categoryId)
    if (heroMarka.value) query.brandId = String(heroMarka.value)
    if (heroModel.value) query.modelId = String(heroModel.value)
    if (heroPrice.value) query.priceTo = heroPrice.value
    if (heroCatType.value) query.textSearch = heroCatType.value
    if (heroFuel.value) query.fuelType = heroFuel.value
    if (heroYearFrom.value) query.yearFrom = String(heroYearFrom.value)
    if (heroYearTo.value) query.yearTo = String(heroYearTo.value)
    navigateTo({ path: '/adverts', query })
}

// ─── Premium showcase ─────────────────────────────────────────────────────────

const premiumShowcase = [
    { brand: 'BMW',      tagline: 'Najwyższe osiągi i luksus' },
    { brand: 'Porsche',  tagline: 'Ikona sportowej motoryzacji' },
    { brand: 'Audi',     tagline: 'Technologia i elegancja' },
    { brand: 'Mercedes', tagline: 'Prestiż i komfort jazdy' },
]

// ─── Features / Why CARIZO ───────────────────────────────────────────────────

const feats = [
    { title: 'Bezpieczeństwo',          desc: 'Zweryfikowane ogłoszenia i sprzedawcy. Kupuj i sprzedawaj z pełnym zaufaniem.',             icon: 'mdi-shield-check-outline'   },
    { title: 'Zweryfikowane pojazdy',   desc: 'Pełna historia pojazdu. Więcej pewności przy każdym zakupie.',                              icon: 'mdi-car-info'               },
    { title: 'Inteligentne narzędzia',  desc: 'Nowoczesne wyszukiwanie, wycena AI i inteligentne filtry. Znajdź idealne auto szybciej.',   icon: 'mdi-cpu-64-bit'             },
    { title: 'Społeczność motoryzacyjna', desc: 'Dla ludzi kochających motoryzację. Wydarzenia, recenzje i aktywna społeczność.',          icon: 'mdi-account-group-outline'  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

const countUpRefs = ref<Record<string, Element>>({})
const { observe: countUpObserve } = useCountUp()

const visibleStats = computed(() => [
    { key: 'activeAdverts', icon: 'mdi-shield-check-outline',  label: 'Zweryfikowanych ogłoszeń', value: homeStats.value.activeAdverts },
    { key: 'soldVehicles',  icon: 'mdi-car-outline',           label: 'Sprzedanych pojazdów',     value: homeStats.value.soldVehicles  },
    { key: 'totalUsers',    icon: 'mdi-account-group-outline', label: 'Użytkowników w Polsce',    value: homeStats.value.totalUsers    },
    { key: 'events',        icon: 'mdi-calendar-star',         label: 'Wydarzeń motoryzacyjnych',  value: homeStats.value.events        },
])

// ─── Search section ──────────────────────────────────────────────────────────

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
    hasCondition?: boolean; hasEngineSize?: boolean; hasPower?: boolean
    hasPayload?: boolean; brandLabel?: string
    subtypeLabel?: string; subtypes?: string[]
}

const SEARCH_CONFIGS: Record<string, SearchConfig> = {
    'auta-osobowe': { hasBrand: true,  hasModel: true,  hasFuel: true,  hasBodyType: true,  hasMileage: true,  hasHours: false, hasCondition: true },
    'motocykle':    { hasBrand: true,  hasModel: true,  hasFuel: true,  hasBodyType: false, hasMileage: true,  hasHours: false, hasCondition: true, hasEngineSize: true, subtypeLabel: 'Typ motocykla', subtypes: ['Naked', 'Sport', 'Turystyczny', 'Enduro', 'Skuter', 'Chopper', 'Cross'] },
    'dostawcze':    { hasBrand: true,  hasModel: true,  hasFuel: true,  hasBodyType: false, hasMileage: true,  hasHours: false, hasCondition: true, subtypeLabel: 'Zabudowa', subtypes: ['Furgon', 'Skrzyniowy', 'Wywrotka', 'Chłodnia', 'Platforma'] },
    'ciezarowe':    { hasBrand: true,  hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: true,  hasHours: false, hasCondition: true, subtypeLabel: 'Typ', subtypes: ['Ciągnik siodłowy', 'Skrzyniowy', 'Wywrotka', 'Chłodnia', 'Cysterna', 'Śmieciarka'] },
    'czesci':       { hasBrand: true,  hasModel: true,  hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: false, hasPartCategory: true, brandLabel: 'Marka pojazdu' },
    'budowlane':    { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: true,  hasPower: true, hasPayload: true, subtypeLabel: 'Typ maszyny', subtypes: ['Koparka gąsienicowa', 'Koparko-ładowarka', 'Minieksawator', 'Ładowarka', 'Dźwig', 'Walec drogowy', 'Zagęszczarka'] },
    'rolnicze':     { hasBrand: true,  hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: true,  hasPower: true, subtypeLabel: 'Typ maszyny', subtypes: ['Ciągnik', 'Kombajn', 'Siewnik', 'Pług', 'Prasa', 'Opryskiwacz', 'Rozsiewacz'] },
    'maszyny':      { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: true,  hasPower: true, subtypeLabel: 'Typ', subtypes: ['Wózek widłowy', 'Dźwig/Żuraw', 'Platforma robocza', 'Agregat prądotwórczy', 'Sprężarka', 'Pompa'] },
    'przyczepy':    { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: false, subtypeLabel: 'Typ', subtypes: ['Naczepa plandeka', 'Laweta', 'Wywrotka', 'Kempingowa', 'Kontenerowa'] },
    'inne':         { hasBrand: false, hasModel: false, hasFuel: false, hasBodyType: false, hasMileage: false, hasHours: false },
}

const PART_CATEGORIES = [
    { value: 'silnik',        label: 'Silnik i osprzęt' },
    { value: 'skrzynia',      label: 'Skrzynia biegów / napęd' },
    { value: 'zawieszenie',   label: 'Zawieszenie i układ kierowniczy' },
    { value: 'hamulce',       label: 'Hamulce' },
    { value: 'elektryka',     label: 'Elektryka i elektronika' },
    { value: 'nadwozie-zewn', label: 'Nadwozie zewnętrzne' },
    { value: 'nadwozie-wewn', label: 'Wnętrze / tapicerka' },
    { value: 'oswietlenie',   label: 'Oświetlenie' },
    { value: 'chlodnica',     label: 'Układ chłodzenia' },
    { value: 'wydech',        label: 'Układ wydechowy' },
    { value: 'paliwo',        label: 'Układ paliwowy' },
    { value: 'klimatyzacja',  label: 'Klimatyzacja / ogrzewanie' },
    { value: 'kola',          label: 'Koła, felgi i opony' },
    { value: 'akcesoria',     label: 'Akcesoria i tuning' },
    { value: 'narzedzia',     label: 'Narzędzia i wyposażenie warsztatu' },
    { value: 'inne',          label: 'Inne' },
]

const searchCat = ref('auta-osobowe')
const searchText = ref('')
const searchBrandId = ref<number | null>(null)
const searchModelId = ref<number | null>(null)
const searchFuelId = ref<number | null>(null)
const searchBodyTypeId = ref<number | null>(null)
const searchPartCategory = ref('')
const searchSubtype = ref('')
const searchPriceFrom = ref('')
const searchPriceTo = ref('')
const searchYearFrom = ref('')
const searchYearTo = ref('')
const searchMileageFrom = ref('')
const searchMileageTo = ref('')
const searchHoursFrom = ref('')
const searchHoursTo = ref('')
const searchEngineSizeFrom = ref('')
const searchEngineSizeTo = ref('')
const searchPowerFrom = ref('')
const searchPowerTo = ref('')
const searchPayloadFrom = ref('')
const searchPayloadTo = ref('')
const searchCondition = ref('')
const searchLocation = ref('')
const searchDriveType = ref('')
const searchEquipment = ref('')
const showMoreFilters = ref(false)
const searchModels = ref<TaxonomyItem[]>([])
const searchGenerations = ref<any[]>([])
const searchGenerationId = ref<number | null>(null)
const searchGearboxId = ref<number | null>(null)
const gearboxes = ref<TaxonomyItem[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])

// Smart search bar
const smartSearch = ref('')
const ssDropOpen = ref(false)
const ssResults = computed(() => {
    const q = smartSearch.value.trim().toLowerCase()
    if (!q || q.length < 2) return []
    return filterBrands.value.filter(b => b.name.toLowerCase().startsWith(q)).slice(0, 8)
})

const currentSearchConfig = computed(() => SEARCH_CONFIGS[searchCat.value] ?? SEARCH_CONFIGS['auta-osobowe'])

const homeAdvancedCount = computed(() => {
    let n = 0
    if (searchFuelId.value) n++
    if (searchGearboxId.value) n++
    if (searchDriveType.value) n++
    if (searchMileageFrom.value || searchMileageTo.value) n++
    if (searchYearFrom.value || searchYearTo.value) n++
    if (searchEquipment.value) n++
    if (searchCondition.value) n++
    return n
})

function selectSearchCat(slug: string) {
    searchCat.value = slug
    searchBrandId.value = null
    searchModelId.value = null
    searchGenerationId.value = null
    searchFuelId.value = null
    searchBodyTypeId.value = null
    searchGearboxId.value = null
    searchSubtype.value = ''
    searchPartCategory.value = ''
    searchCondition.value = ''
    searchEngineSizeFrom.value = ''
    searchEngineSizeTo.value = ''
    searchPowerFrom.value = ''
    searchPowerTo.value = ''
    searchPayloadFrom.value = ''
    searchPayloadTo.value = ''
    searchLocation.value = ''
    searchModels.value = []
    searchGenerations.value = []
    const cat = homeCategories.find((c: any) => c.slug === slug)
    if (cat?.id) {
        fetchBrandsByCategory(cat.id).then((b: any) => { filterBrands.value = b }).catch(() => {})
    } else {
        fetchBrands().then((b: any) => { filterBrands.value = b }).catch(() => {})
    }
}

async function loadSearchModels() {
    if (!searchBrandId.value) { searchModels.value = []; return }
    try { searchModels.value = await fetchModels(searchBrandId.value) } catch { searchModels.value = [] }
}

async function loadSearchGenerations() {
    if (!searchModelId.value) { searchGenerations.value = []; return }
    try { searchGenerations.value = await fetchGenerations(searchModelId.value) } catch { searchGenerations.value = [] }
}

async function onBrandChange() {
    searchModelId.value = null
    searchGenerationId.value = null
    searchModels.value = []
    searchGenerations.value = []
    if (searchBrandId.value) await loadSearchModels()
}

async function onModelChange() {
    searchGenerationId.value = null
    searchGenerations.value = []
    if (searchModelId.value) await loadSearchGenerations()
}

function selectSmartBrand(b: TaxonomyItem) {
    smartSearch.value = b.name
    searchBrandId.value = b.id
    searchModelId.value = null
    searchGenerationId.value = null
    searchModels.value = []
    searchGenerations.value = []
    ssDropOpen.value = false
    loadSearchModels()
}

function clearSmartSearch() {
    smartSearch.value = ''
    searchBrandId.value = null
    searchModelId.value = null
    searchGenerationId.value = null
    searchModels.value = []
    searchGenerations.value = []
}

function onSmartBlur() {
    setTimeout(() => { ssDropOpen.value = false }, 150)
}

function doSearch() {
    const query: Record<string, string> = {}
    if (smartSearch.value.trim() && !searchBrandId.value) query.textSearch = smartSearch.value.trim()
    if (searchBrandId.value) query.brandId = String(searchBrandId.value)
    if (searchModelId.value) query.modelId = String(searchModelId.value)
    if (searchGenerationId.value) query.generationId = String(searchGenerationId.value)
    if (searchFuelId.value) query.fuelTypeId = String(searchFuelId.value)
    if (searchGearboxId.value) query.gearboxId = String(searchGearboxId.value)
    if (searchBodyTypeId.value) query.bodyTypeId = String(searchBodyTypeId.value)
    if (searchSubtype.value) query.bodySubtype = searchSubtype.value
    if (searchPartCategory.value) query.partCategory = searchPartCategory.value
    if (searchPriceFrom.value) query.priceFrom = searchPriceFrom.value
    if (searchPriceTo.value) query.priceTo = searchPriceTo.value
    if (searchYearFrom.value) query.yearFrom = searchYearFrom.value
    if (searchYearTo.value) query.yearTo = searchYearTo.value
    if (searchMileageFrom.value) query.mileageFrom = searchMileageFrom.value
    if (searchMileageTo.value) query.mileageTo = searchMileageTo.value
    if (searchHoursFrom.value) query.hoursFrom = searchHoursFrom.value
    if (searchHoursTo.value) query.hoursTo = searchHoursTo.value
    if (searchPayloadFrom.value) query.payloadFrom = searchPayloadFrom.value
    if (searchPayloadTo.value) query.payloadTo = searchPayloadTo.value
    if (searchEngineSizeFrom.value) query.engineSizeFrom = searchEngineSizeFrom.value
    if (searchEngineSizeTo.value) query.engineSizeTo = searchEngineSizeTo.value
    if (searchPowerFrom.value) query.powerFrom = searchPowerFrom.value
    if (searchPowerTo.value) query.powerTo = searchPowerTo.value
    if (searchCondition.value) query.condition = searchCondition.value
    if (searchDriveType.value) query.driveType = searchDriveType.value
    if (searchEquipment.value.trim()) query.equipment = searchEquipment.value.trim()
    const cat = homeCategories.find(c => c.slug === searchCat.value)
    if (cat) query.categoryId = String(cat.id)
    navigateTo({ path: '/adverts', query })
}

function formatStat(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K'
    return n.toLocaleString('pl')
}

// ─── ING Calculator ───────────────────────────────────────────────────────────

const ingCalcAmount = ref(80000)
const ingCalcMonths = ref(48)
const ingMonthlyRate = computed(() => {
    const rate = 0.0899 / 12
    const n = ingCalcMonths.value
    const pv = ingCalcAmount.value * 0.9
    return Math.round(pv * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1))
})

// ─── Events ───────────────────────────────────────────────────────────────────

const { getUpcoming } = useEvents()
const { getImageUrl } = useImageUrl()
const { fetchBrands, fetchBrandsByCategory, fetchModels, fetchGenerations, fetchGearboxes, fetchFuelTypes, fetchBodyTypes } = useTaxonomy()
const { STATIC_CATEGORIES } = useCategories()
const homeCategories = STATIC_CATEGORIES

const featuredEvent = computed(() => events.value.find(e => e.isFeatured) ?? null)

const eventPlaceholder = '/car-placeholder.svg'
function getEventImageUrl(ev: CarEvent): string {
    const main = ev.images?.find(i => i.isMain) ?? ev.images?.[0]
    return getImageUrl(main?.url, eventPlaceholder)
}
function formatEventDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

const email = ref('')
const newsletterConsent = ref(false)
const subscribeLoading = ref(false)
const subscribeSuccess = ref(false)
const subscribeMessage = ref('')
const subscribeError = ref('')

async function subscribeNewsletter() {
    if (!email.value.trim()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        subscribeError.value = 'Podaj prawidłowy adres email.'
        return
    }
    if (!newsletterConsent.value) {
        subscribeError.value = 'Zaznacz zgodę na otrzymywanie newslettera.'
        return
    }
    subscribeLoading.value = true
    subscribeError.value = ''
    subscribeSuccess.value = false
    subscribeMessage.value = ''
    try {
        const res = await $fetch<{ message: string }>('/api/proxy/api/Newsletter/subscribe', { method: 'POST', body: { email: email.value } })
        subscribeMessage.value = res?.message ?? 'Sprawdź swoją skrzynkę email i kliknij link potwierdzający.'
        subscribeSuccess.value = true
        email.value = ''
        newsletterConsent.value = false
    } catch (e: any) {
        subscribeError.value = e?.data?.message ?? 'Wystąpił błąd. Spróbuj ponownie.'
    } finally {
        subscribeLoading.value = false
    }
}

// ─── SSR-safe data fetching ───────────────────────────────────────────────────

const { data: homeData } = await useAsyncData('home-data', async () => {
    const [featuredResult, recentResult, evts, stats, brands] = await Promise.allSettled([
        $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
            method: 'POST',
            body: { page: 1, pageSize: 50, sortBy: 'featured' }
        }),
        $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
            method: 'POST',
            body: { page: 1, pageSize: 8, sortBy: '' }
        }),
        getUpcoming(6).catch(() => []),
        $fetch<{ activeAdverts: number; totalUsers: number; soldVehicles: number; events: number }>('/api/stats/home').catch(() => null),
        fetchBrands().catch(() => []),
    ])
    return {
        featuredItems: featuredResult.status === 'fulfilled' ? featuredResult.value.items : [],
        recentItems:   recentResult.status   === 'fulfilled' ? recentResult.value.items   : [],
        events:        evts.status           === 'fulfilled' ? (evts.value ?? [])          : [],
        stats:         stats.status          === 'fulfilled' ? stats.value                 : null,
        brands:        brands.status         === 'fulfilled' ? brands.value                : [],
    }
})

if (homeData.value) {
    const promoted = (homeData.value.featuredItems ?? []).filter((a: CarAdvert) => a.badge === 'FEATURED' || a.badge === 'TOP' || a.badge === 'PREMIUM')
    featured.value      = promoted.filter((a: CarAdvert) => a.badge === 'FEATURED').slice(0, 4)
    topAdverts.value    = promoted.filter((a: CarAdvert) => a.badge === 'TOP' || a.badge === 'PREMIUM').slice(0, 6)
    recentlyAdded.value = homeData.value.recentItems ?? []
    events.value        = homeData.value.events ?? []
    filterBrands.value  = homeData.value.brands ?? []
    if (homeData.value.stats) Object.assign(homeStats.value, homeData.value.stats)
}
statsLoading.value = false

// most-viewed and premium-collection fetched client-side only to avoid SSR crashes
if (import.meta.client) {
    clientDataLoading.value = true
    Promise.allSettled([
        $fetch<CarAdvert[]>('/api/proxy/api/listings/most-viewed', { query: { count: 8 } }).catch(() => [] as CarAdvert[]),
        $fetch<CarAdvert[]>('/api/proxy/api/listings/premium-collection', { query: { count: 8 } }).catch(() => [] as CarAdvert[])
    ]).then(([mvRes, pcRes]) => {
        if (mvRes.status === 'fulfilled') {
            const mv = mvRes.value
            mostViewed.value = Array.isArray(mv) ? mv : (mv as any).items ?? []
        }
        if (pcRes.status === 'fulfilled') {
            const pc = pcRes.value
            premiumCollection.value = Array.isArray(pc) ? pc : (pc as any).items ?? []
        }
        if (mostViewed.value.length > 0) carOfWeek.value = mostViewed.value[0]
        clientDataLoading.value = false
    })
}

onMounted(async () => {
    await nextTick()
    visibleStats.value.forEach(stat => {
        const el = countUpRefs.value[stat.key]
        if (el) countUpObserve(el, stat.value)
    })
    try { fuelTypes.value = await fetchFuelTypes() } catch {}
    try { bodyTypes.value = await fetchBodyTypes() } catch {}
    try { gearboxes.value = await fetchGearboxes() } catch {}
    try {
        const brands = await fetchBrands()
        if (brands.length) filterBrands.value = brands
    } catch {}
})
</script>

<style lang="scss" scoped>
.home { background: $bg; }
.container { @include container; }

// ─── Hero split layout ────────────────────────────────────────────────────────

.hero-fs {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 660px;
    height: 82vh;
    max-height: 920px;
    overflow: hidden;
    background: $bg;
    padding-top: $nav-height;
}

.hfs-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 65% 35%;
}

.hfs-fade {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to right,
            #{$bg} 0%,
            #{$bg} 18%,
            rgba(5,5,5,0.96) 28%,
            rgba(5,5,5,0.78) 40%,
            rgba(5,5,5,0.48) 55%,
            rgba(5,5,5,0.18) 68%,
            transparent 82%
        ),
        linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.6) 100%);
}

.hfs-left {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    width: 54%;
    padding-left: #{max(4vw, calc((100vw - 1450px) / 2))};
    padding-right: 48px;
    padding-top: 48px;
    padding-bottom: 48px;

    @include respond-to(md) {
        width: 65%;
        padding-left: 32px;
        padding-right: 32px;
    }
    @include respond-to(sm) {
        width: 100%;
        padding: 40px 24px;
    }
    @include respond-to(xs) {
        padding: 32px 18px 28px;
    }
}

.hfs-left-inner {
    max-width: 540px;
    width: 100%;
}

// Eyebrow
.hfs-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
    margin-bottom: 22px;
}
.eyebrow-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $red;
    box-shadow: 0 0 8px rgba($red, 0.8);
    animation: pulse-dot 2s ease infinite;
}
@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.6; transform: scale(0.7); }
}

// Title
.hfs-title {
    font-size: 72px;
    line-height: 1.06;
    font-weight: 900;
    color: $text;
    letter-spacing: -2.5px;
    margin-bottom: 24px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.6);

    @include respond-to(md) { font-size: 52px; letter-spacing: -1.5px; }
    @include respond-to(sm) { font-size: 36px; letter-spacing: -1px; }
    @include respond-to(xs) { font-size: 28px; letter-spacing: -1px; line-height: 1.1; }
}

.title-accent {
    color: $red;
    -webkit-text-stroke: 0;
    display: block;
}

.hfs-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.55);
    line-height: 1.75;
    margin-bottom: 32px;
    max-width: 480px;
    font-weight: 400;

    strong { color: rgba(255,255,255,0.8); font-weight: 600; }

    @include respond-to(sm) { font-size: 14px; line-height: 1.7; margin-bottom: 28px; }
    @include respond-to(xs) { font-size: 13.5px; }
}

.hfs-features {
    list-style: none;
    padding: 0;
    margin: 0 0 36px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14.5px;
        color: rgba(255,255,255,0.72);
        font-weight: 400;
        letter-spacing: 0.1px;
        text-shadow: 0 1px 6px rgba(0,0,0,0.8);
    }

    @include respond-to(sm) { margin-bottom: 28px; gap: 7px; li { font-size: 13.5px; } }
}

.hfs-feat-icon {
    color: $red;
    flex-shrink: 0;
    filter: drop-shadow(0 0 4px rgba($red, 0.5));
}

// ─── Category tiles ───────────────────────────────────────────────────────────

.hfs-cats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.hfs-cat-tile {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 9px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
    backdrop-filter: blur(8px);

    &:hover {
        background: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.22);
        color: rgba(255,255,255,0.9);
        transform: translateY(-1px);
    }

    &.active {
        background: $red;
        border-color: $red;
        color: #fff;
        box-shadow: 0 4px 20px rgba($red, 0.4);
    }
}

.hfs-cat-icon { flex-shrink: 0; }

// ─── Search bar ───────────────────────────────────────────────────────────────

.hfs-searchbar {
    display: flex;
    align-items: stretch;
    background: rgba(10,10,10,0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 18px;
    overflow: hidden;
    height: 72px;
    margin-bottom: 22px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.4);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus-within {
        border-color: rgba(255,255,255,0.25);
        box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba($red, 0.2);
    }

    @include respond-to(md) {
        flex-wrap: wrap;
        height: auto;
        border-radius: 16px;
    }
}

.hfs-field {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 20px;
    flex: 1;
    min-width: 0;
    border-right: 1px solid rgba(255,255,255,0.08);
    transition: background 0.15s;

    &:hover { background: rgba(255,255,255,0.03); }
    &:focus-within { background: rgba(255,255,255,0.04); }

    &--narrow { flex: 0 0 90px; }

    @include respond-to(md) {
        border-right: none;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        padding: 12px 16px;
        flex: 0 0 50%;
    }

    @include respond-to(sm) {
        flex: 1 1 100%;
    }
}

.hfs-field-label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
    display: block;
    white-space: nowrap;
}

.hfs-select,
.hfs-price-input {
    background: transparent;
    border: none;
    outline: none;
    color: rgba(255,255,255,0.9);
    font-size: 14px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    width: 100%;
    cursor: pointer;

    option { background: #0d0d0d; color: #fff; }
    &::placeholder { color: rgba(255,255,255,0.3); }
    &:disabled { opacity: 0.35; cursor: not-allowed; }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }
}

.hfs-vsep {
    display: none;
}

.hfs-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    background: $red;
    color: white;
    border: none;
    padding: 0 32px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.15s;
    letter-spacing: 0.3px;

    &:hover { background: lighten(#8B0D1D, 8%); transform: none; }
    &:active { transform: scale(0.98); }

    @include respond-to(md) {
        width: 100%;
        padding: 16px;
        border-radius: 0 0 14px 14px;
    }
}

.hfs-feats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;
}

.hfs-feat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);

    .v-icon { color: $red; flex-shrink: 0; }
}

.hfs-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;

    @include respond-to(xs) {
        flex-direction: column;
        gap: 10px;
    }
}

.hfs-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 13px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
    min-height: 48px;

    @include respond-to(xs) {
        width: 100%;
        padding: 14px 20px;
    }

    &--primary {
        background: $red;
        color: #fff;
        border: 2px solid $red;
        box-shadow: 0 4px 20px rgba($red, 0.35);

        &:hover {
            opacity: 0.88;
            box-shadow: 0 6px 28px rgba($red, 0.45);
        }
    }

    &--secondary {
        background: rgba(255,255,255,0.07);
        color: rgba(255,255,255,0.88);
        border: 2px solid rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);

        &:hover {
            border-color: rgba(255,255,255,0.5);
            color: #fff;
            background: rgba(255,255,255,0.12);
        }
    }
}

.hfs-scroll {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    color: rgba(255,255,255,0.3);
    animation: bounce 2.4s ease infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

.stats-strip {
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 0;
    background: rgba(255,255,255,0.01);
}

.sstrip-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 90px;

    @include respond-to(sm) { flex-wrap: wrap; height: auto; padding: 10px 0; }
}

.sstrip-sep {
    width: 1px;
    height: 40px;
    background: $border;
    flex-shrink: 0;

    @include respond-to(sm) { display: none; }
}

.sstrip-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 0 32px;
    flex: 1;
    transition: background 0.2s;

    &:first-child { padding-left: 0; }
    &:last-child  { padding-right: 0; }
    &:hover { background: rgba(255,255,255,0.02); }

    @include respond-to(md) { padding: 0 18px; gap: 12px; &:first-child { padding-left: 0; } &:last-child { padding-right: 0; } }
    @include respond-to(sm) { flex: 0 0 50%; padding: 14px 16px; &:first-child { padding-left: 16px; } &:last-child { padding-right: 16px; } }
}

.sstrip-icon-badge {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: $red;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;

    @include respond-to(sm) { width: 42px; height: 42px; border-radius: 11px; }
}

.sstrip-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
}

.sstrip-num {
    font-size: 22px;
    font-weight: 900;
    color: $text;
    line-height: 1;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;

    @include respond-to(md) { font-size: 21px; }
}

.sstrip-label {
    font-size: 11px;
    color: $text-dim;
    font-weight: 500;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.6px;
}

.sstrip-skeleton {
    width: 72px;
    height: 24px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

// ─── Search section ───────────────────────────────────────────────────────────

.search-section {
    padding: 40px 0 56px;
    border-bottom: 1px solid $border;
}

// Glass card wrapping the entire form
.hs-panel {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset;

    @include respond-to(sm) { padding: 18px 16px; border-radius: 16px; }
    @include respond-to(xs) { padding: 16px 14px; }
}

// ─── Shared field token (used by both hsp and hse) ───────────────────────────

// ─── Primary row ─────────────────────────────────────────────────────────────

.hs-primary {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
}

.hsp-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 130px;

    &.hsp-range { flex: 1.5; min-width: 200px; }

    @include respond-to(sm) { flex: 1 1 calc(50% - 5px); }
    @include respond-to(xs) { flex: 1 1 100%; }
}

.hsp-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-left: 2px;
    white-space: nowrap;
}

.hsp-select {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 14px;
    min-height: 48px;
    outline: none;
    width: 100%;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;

    option { background: #111; color: #fff; }
    &:focus   { border-color: rgba($red, 0.55); background: rgba(255,255,255,0.1); }
    &:hover   { border-color: rgba(255,255,255,0.2); }
    &:disabled { opacity: 0.35; cursor: not-allowed; }
}

// Range: Od/Do share one bordered container
.hsp-range-row {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    min-height: 48px;
    overflow: hidden;
    transition: border-color 0.18s, background 0.18s;
    &:focus-within { border-color: rgba($red, 0.55); background: rgba(255,255,255,0.1); }
}

.hsp-sep {
    width: 1px;
    min-height: 20px;
    background: rgba(255,255,255,0.12);
    flex-shrink: 0;
    align-self: center;
    font-size: 0;
}

.hsp-input {
    flex: 1;
    background: transparent;
    border: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 14px;
    outline: none;
    min-width: 0;

    &::placeholder { color: rgba(255,255,255,0.25); }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }

    &--full {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        width: 100%;
        padding: 12px 14px;
        min-height: 48px;
        transition: border-color 0.18s, background 0.18s;
        &:focus { border-color: rgba($red, 0.55); background: rgba(255,255,255,0.1); outline: none; }
    }
}

.hsp-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    padding: 0 32px;
    height: 48px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    box-shadow: 0 4px 18px rgba($red, 0.38);
    transition: opacity 0.18s, box-shadow 0.18s;

    &:hover  { opacity: 0.88; box-shadow: 0 6px 22px rgba($red, 0.5); }
    &:active { opacity: 0.75; }

    @include respond-to(sm) { width: 100%; height: 50px; font-size: 15px; }
}

// ─── Więcej filtrów ───────────────────────────────────────────────────────────

.hs-more-row {
    display: flex;
    align-items: center;
    margin-top: 4px;
}

.hs-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.5);
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 14px;
    cursor: pointer;
    transition: border-color 0.18s, color 0.18s, background 0.18s;

    &:hover { border-color: rgba(255,255,255,0.25); color: $text; background: rgba(255,255,255,0.04); }
}

.hs-more-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
}

// ─── Expanded advanced filters ────────────────────────────────────────────────

.hs-expand-enter-active,
.hs-expand-leave-active { transition: opacity 0.24s, transform 0.24s; }
.hs-expand-enter-from,
.hs-expand-leave-to     { opacity: 0; transform: translateY(-6px); }

.hs-expanded {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.07);
}

.hse-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;

    @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.hse-field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &.hse-range { @include respond-to(sm) { grid-column: span 2; } }
}

.hse-label {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-left: 2px;
    white-space: nowrap;
}

.hse-select {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 14px;
    min-height: 48px;
    outline: none;
    width: 100%;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;

    option { background: #111; color: #fff; }
    &:focus { border-color: rgba($red, 0.55); background: rgba(255,255,255,0.1); }
    &:hover { border-color: rgba(255,255,255,0.2); }
}

.hse-range-row {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    min-height: 48px;
    overflow: hidden;
    transition: border-color 0.18s, background 0.18s;
    &:focus-within { border-color: rgba($red, 0.55); background: rgba(255,255,255,0.1); }
}

.hse-sep {
    width: 1px;
    min-height: 20px;
    background: rgba(255,255,255,0.12);
    flex-shrink: 0;
    align-self: center;
    font-size: 0;
}

.hse-input {
    flex: 1;
    background: transparent;
    border: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 14px;
    outline: none;
    min-width: 0;

    &::placeholder { color: rgba(255,255,255,0.25); }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; }

    &--full {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        width: 100%;
        padding: 12px 14px;
        min-height: 48px;
        transition: border-color 0.18s, background 0.18s;
        &:focus { border-color: rgba($red, 0.55); background: rgba(255,255,255,0.1); outline: none; }
    }
}

// ─── Text search (meta row — kept for compatibility) ─────────────────────────

.hs-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    @include respond-to(sm) { flex-direction: column; align-items: stretch; }
}

.hs-text-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 0 14px;
    height: 48px;
    position: relative;
    transition: border-color 0.18s;
    &:focus-within { border-color: rgba($red, 0.5); background: rgba(255,255,255,0.1); }
}

.hs-text-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; }

.hs-text-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    &::placeholder { color: rgba(255,255,255,0.25); }
}

.hs-text-clear {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    &:hover { color: $text; }
}

.ss-suggestions {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #111;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    z-index: 200;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}

.ss-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    cursor: pointer;
    font-size: 14px;
    color: $text-muted;
    transition: background 0.12s, color 0.12s;
    &:hover { background: rgba($red, 0.1); color: $text; }
}

.ss-item-icon { color: $text-dim; flex-shrink: 0; }

// Category tabs
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

    @include respond-to(xs) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        overflow-x: unset;
    }
}

.cat-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border: 1px solid $border;
    border-radius: 50px;
    background: transparent;
    color: $text-dim;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
    transition: all 0.18s;

    @include respond-to(xs) {
        justify-content: center;
        white-space: normal;
        text-align: center;
    }

    &:hover { border-color: rgba($red, 0.4); color: $text; }

    &--active {
        background: $red;
        border-color: $red;
        color: white;
        box-shadow: 0 2px 14px rgba($red, 0.3);
    }
}


// ─── Section commons ──────────────────────────────────────────────────────────

.section { margin-top: 90px; }

.sec-top {
    @include section-top;

    .see-all {
        display: flex;
        align-items: center;
        gap: 4px;
        color: $red;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        white-space: nowrap;
        transition: opacity 0.2s;

        &:hover { opacity: 0.8; }
    }
}

.sec-top-left {
    display: flex;
    flex-direction: column;
    gap: 6px;

    h2 { margin: 0; }
}

.sec-eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: $red;
    letter-spacing: 2.5px;
    text-transform: uppercase;
}

// ─── Cars grid ────────────────────────────────────────────────────────────────

.cars-grid {
    @include cars-grid;

    &--small {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;

        @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
        @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
        @include respond-to(xs) { grid-template-columns: 1fr; }
    }
}

// ─── Premium showcase ─────────────────────────────────────────────────────────

.premium-showcase-section { }

.psc-header {
    @include section-top;
    margin-bottom: 28px;
}

.psc-header-text { display: flex; flex-direction: column; gap: 4px; }

.psc-eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: $red;
    letter-spacing: 2.5px;
    text-transform: uppercase;
}

.psc-title {
    font-size: 26px;
    font-weight: 800;
    color: $text;
    margin: 0;
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
    @include respond-to(sm) { grid-template-columns: 1fr 1fr; }
}

.psc-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 24px 20px 20px;
    text-decoration: none;
    transition: border-color 0.22s, transform 0.22s, background 0.22s;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba($red, 0.06) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.22s;
    }

    &:hover {
        border-color: rgba($red, 0.35);
        transform: translateY(-3px);
        background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);

        &::before { opacity: 1; }

        .psc-cta { color: $red; }
    }
}

.psc-top-row { display: flex; justify-content: flex-start; }

.psc-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.3);
    color: $red;
    padding: 3px 8px;
    border-radius: 4px;
}

.psc-brand {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.psc-model {
    font-size: 22px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
}

.psc-spec {
    font-size: 12px;
    color: $text-dark;
    font-weight: 500;
}

.psc-cta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: auto;
    transition: color 0.2s;
}

// ─── Premium label ────────────────────────────────────────────────────────────

.premium-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    color: #f39c12;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    background: rgba(243,156,18,0.1);
    border: 1px solid rgba(243,156,18,0.25);
    padding: 3px 10px;
    border-radius: 20px;
}

// ─── Why CARIZO ───────────────────────────────────────────────────────────────

.why-section {
    position: relative;
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba($red, 0.05) 0%, transparent 70%);
        pointer-events: none;
    }
}

.why-header {
    text-align: center;
    margin-bottom: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 20px;
}

.why-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-size: 10px;
    font-weight: 700;
    color: $red;
    letter-spacing: 4px;
    text-transform: uppercase;

    &::before,
    &::after {
        content: '';
        display: block;
        width: 36px;
        height: 1px;
        background: $red;
        opacity: 0.6;
    }
}

.why-logo {
    height: 72px;
    width: auto;
    display: block;
    filter: drop-shadow(0 0 32px rgba(139, 13, 29, 0.4));
}

.why-sub {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.38);
    margin: 0;
    letter-spacing: 0.4px;
    max-width: 440px;
    line-height: 1.6;
}

.why-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.why-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 28px 24px;
    transition: border-color 0.2s, background 0.2s, transform 0.22s;
    cursor: default;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, $red, rgba($red, 0.4));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s;
    }

    &:hover {
        border-color: rgba($red, 0.28);
        background: rgba(255,255,255,0.04);
        transform: translateY(-3px);

        &::after { transform: scaleX(1); }
        .why-card-icon { background: rgba($red, 0.15); border-color: rgba($red, 0.3); color: $red; }
    }
}

.why-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dim;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    flex-shrink: 0;
}

.why-card-title {
    font-size: 17px;
    font-weight: 700;
    color: $text;
    margin: 0;
    line-height: 1.3;
}

.why-card-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.7;
    margin: 0;
    flex: 1;
}

// ─── ING Section ──────────────────────────────────────────────────────────────

.ing-section { }

.ing-wrapper {
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 40px 36px;
    background: rgba(255,255,255,0.01);

    @include respond-to(sm) { padding: 28px 20px; }
}

.ing-header { margin-bottom: 28px; }

.ing-logo-area {
    display: flex;
    align-items: flex-start;
    gap: 20px;
}

.ing-logo-badge {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #FF6200;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ing-logo-text {
    font-size: 18px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 1px;
}

.ing-pretitle {
    font-size: 11px;
    font-weight: 700;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
}

.ing-title {
    font-size: 22px;
    font-weight: 800;
    color: $text;
    margin: 0;
    line-height: 1.3;

    span { color: #FF6200; }
}

.ing-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.ing-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.2s;

    &:hover { border-color: rgba(255,102,0,0.35); }
    &--calc { border-color: rgba(255,102,0,0.2); background: rgba(255,102,0,0.04); }
}

.ing-cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: #FF6200;
    text-decoration: none;
    margin-top: auto;
    padding-top: 6px;
    border-top: 1px solid rgba(255,102,0,0.15);
    transition: opacity 0.2s;

    &:hover { opacity: 0.75; }
}

.ing-card-icon {
    color: #FF6200;
    flex-shrink: 0;
}

.ing-card-title {
    font-size: 15px;
    font-weight: 700;
    color: $text;
}

.ing-card-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.6;
    flex: 1;
}

.ing-card-feat {
    display: flex;
    flex-direction: column;
    gap: 6px;

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

    label { font-size: 12px; color: $text-dark; }
}

.icm-val { font-size: 13px; font-weight: 700; color: $text; }

.icm-range {
    width: 100%;
    accent-color: #FF6200;
    cursor: pointer;
}

.icm-result {
    font-size: 13px;
    color: $text-dim;
    text-align: center;
    padding: 10px;
    background: rgba(255,102,0,0.08);
    border: 1px solid rgba(255,102,0,0.2);
    border-radius: $r-sm;

    strong { color: #FF6200; font-size: 20px; font-weight: 900; }
}

.ing-disclaimer {
    font-size: 11px;
    color: $text-dark;
    margin-top: 20px;
    line-height: 1.5;
}

// ─── Events ───────────────────────────────────────────────────────────────────

.events-section { }

.featured-banner {
    display: grid;
    grid-template-columns: 42% 1fr;
    border-radius: $r-xl;
    overflow: hidden;
    border: 1px solid $border;
    cursor: pointer;
    margin-bottom: 28px;
    transition: border-color 0.2s, transform 0.2s;

    &:hover { border-color: rgba($red, 0.4); transform: translateY(-2px); }

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.fb-img-wrap {
    img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 220px; }
}

.fb-body {
    padding: 28px;
    background: rgba(255,255,255,0.02);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.fb-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    color: #f39c12;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    .crown-icon { color: #f39c12; }
}

.fb-name {
    font-size: 22px;
    font-weight: 800;
    color: $text;
    line-height: 1.3;
}

.fb-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    span {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: $text-dim;
        .v-icon { color: $text-dark; }
    }
}

.fb-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.7;
    flex: 1;
    margin: 0;
}

.fb-cta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 700;
    color: $red;
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.event-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-xl;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;

    &:hover { border-color: rgba($red, 0.35); transform: translateY(-2px); }
}

.event-img-wrap {
    position: relative;

    img { width: 100%; height: 160px; object-fit: cover; display: block; }
}

.event-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(0,0,0,0.65);
    color: $text-muted;
    backdrop-filter: blur(4px);

    &--featured {
        background: rgba(243,156,18,0.2);
        color: #f39c12;
        border: 1px solid rgba(243,156,18,0.3);

        .v-icon { color: #f39c12; }
    }
}

.event-date-chip {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.1);
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    .v-icon { color: $text-dark; }
}

.event-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.event-name {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    line-height: 1.3;
}

.event-loc {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-dim;
}
.event-loc-icon { color: $red; }

.event-organizer {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-dark;
    .v-icon { color: $text-dark; }
}

.event-desc {
    font-size: 12px;
    color: $text-dark;
    line-height: 1.5;
}

.event-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
}

.event-interested {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-dark;
    .v-icon { color: $text-dark; }
}

.event-link-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: $red;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.8; }
}

.events-see-all-row {
    display: flex;
    justify-content: center;
    margin-top: 28px;
}

.btn-see-all-events {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-lg;
    color: $text-muted;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 28px;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, color 0.2s;

    &:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); color: $text; }
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

.newsletter {
    display: flex;
    align-items: center;
    gap: 28px;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 32px 36px;
    flex-wrap: wrap;

    @include respond-to(sm) { padding: 24px 20px; gap: 18px; }
}

.news-icon { color: $red; flex-shrink: 0; }

.news-text {
    flex: 1;
    min-width: 200px;

    h2 { font-size: 20px; font-weight: 700; color: $text; margin: 0 0 4px; }
    p { font-size: 14px; color: $text-dim; margin: 0; }
}

.news-form {
    display: flex;
    gap: 10px;
    flex-shrink: 0;

    @include respond-to(sm) { width: 100%; }
}

.news-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-md;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 11px 16px;
    outline: none;
    width: 240px;
    transition: border-color 0.2s;

    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba(255,255,255,0.2); }

    @include respond-to(sm) { width: 100%; flex: 1; }
}

.btn-subscribe {
    background: $red;
    border: none;
    border-radius: $r-md;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 11px 20px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;

    &:hover { background: lighten(#8B0D1D, 7%); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.subscribe-feedback {
    width: 100%;
    font-size: 13px;
    font-weight: 500;
    margin: 0;
    padding: 10px 14px;
    border-radius: $r-sm;
}
.subscribe-ok  { background: rgba(45,122,58,0.1); border: 1px solid rgba(45,122,58,0.3); color: #4caf50; }
.subscribe-err { background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.25); color: #e74c3c; }

.news-consent {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    margin-top: 4px;

    .news-consent-input { display: none; }

    .news-consent-box {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 3px;
        margin-top: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s;

        &--checked { background: $red; border-color: $red; }
    }

    .news-consent-text {
        font-size: 11px;
        color: rgba(255,255,255,0.5);
        line-height: 1.5;
        a { color: rgba(255,255,255,0.7); text-decoration: underline; }
    }
}

.news-pp-link {
    color: rgba(255,255,255,0.7);
    text-decoration: underline;
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

h2 {
    font-size: 28px;
    font-weight: 800;
    color: $text;
    margin: 0 0 8px;
    letter-spacing: -0.3px;

    span { color: $red; }
}

// ─── Car of week / Most viewed / Premium collection ───────────────────────────

.cow-section { background: linear-gradient(135deg, #0a0a0a 0%, #1a0505 100%); }
.cow-header { display: flex; align-items: center; margin-bottom: 24px; }
.cow-eyebrow { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: $red; text-transform: uppercase; }
.cow-card { max-width: 400px; }

// ─── About section ────────────────────────────────────────────────────────────

.about-section {
    position: relative;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 70% 50% at 100% 50%, rgba($red, 0.06) 0%, transparent 65%);
        pointer-events: none;
    }
}

.about-header {
    text-align: center;
    margin-bottom: 64px;
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
}

.about-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-size: 10px;
    font-weight: 700;
    color: $red;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 20px;

    &::before,
    &::after {
        content: '';
        display: block;
        width: 36px;
        height: 1px;
        background: $red;
        opacity: 0.6;
    }
}

.about-lead {
    font-size: 16px;
    color: $text-muted;
    line-height: 1.7;
    margin: 16px 0 0;
}

.about-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 56px;
    align-items: start;
    margin-bottom: 64px;

    @include respond-to(md) { grid-template-columns: 1fr; gap: 40px; }
}

.about-story {
    p {
        font-size: 15px;
        color: $text-muted;
        line-height: 1.8;
        margin: 0 0 20px;
        &:last-of-type { margin-bottom: 28px; }
    }
}

.about-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 20px;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: rgba($red, 0.5); color: $text; }
}

.about-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @include respond-to(md) {
        grid-template-columns: repeat(4, 1fr);
    }
    @include respond-to(xs) {
        grid-template-columns: repeat(2, 1fr);
    }
}

.about-stat {
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 24px 20px;
    text-align: center;
}

.about-stat-val {
    font-size: 32px;
    font-weight: 800;
    color: $red;
    line-height: 1;
    margin-bottom: 8px;
    letter-spacing: -0.03em;
}

.about-stat-label {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.4;
}

.about-values {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    border-top: 1px solid $border;
    padding-top: 48px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.about-value {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
    background: rgba(255,255,255,0.015);
    border: 1px solid $border;
    border-radius: $r-xl;
    transition: border-color 0.2s, background 0.2s;
    &:hover { border-color: rgba($red, 0.25); background: rgba(255,255,255,0.03); }
}

.about-value-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba($red, 0.08);
    border: 1px solid rgba($red, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    flex-shrink: 0;
}

.about-value-title {
    font-size: 16px;
    font-weight: 700;
    color: $text;
}

.about-value-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.65;
}
</style>
