<template>
    <div class="page-bg">

        <!-- Category hero (always shown when category selected) -->
        <div v-if="activeCategory" class="cat-hero">
            <img src="/hero-car.jpg" class="cat-hero-img" alt="CARIZO – ogłoszenia motoryzacyjne" fetchpriority="high" />
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
                <h1 class="page-title">{{ $t('adverts.title') }}</h1>
                <p class="page-sub">{{ total.toLocaleString('pl') }} ogłoszeń czeka na Ciebie</p>
            </div>
        </div>

        <!-- ── Filter panel ── -->
        <div class="fp-wrap">
            <div class="container">
                <div class="fp-panel">

                    <!-- PRIMARY ROW -->
                    <div class="fp-primary">
                        <!-- Category -->
                        <div class="fp-field">
                            <label class="fp-label">{{ $t('adverts.category') }}</label>
                            <div class="fp-select-wrap">
                                <v-icon icon="mdi-tag-multiple-outline" size="14" class="fp-field-icon" />
                                <select v-model="f.categoryId" class="fp-select" @change="onCategoryChange">
                                    <option :value="null">Wszystkie</option>
                                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="fp-divider" />

                        <!-- Brand -->
                        <div class="fp-field">
                            <label class="fp-label">{{ $t('adverts.brand') }}</label>
                            <div class="fp-select-wrap">
                                <v-icon icon="mdi-car-outline" size="14" class="fp-field-icon" />
                                <select v-model="f.brandId" class="fp-select" @change="onBrandChange">
                                    <option :value="null">Wszystkie marki</option>
                                    <option v-for="b in brands.filter(b => b.name && !/^\d+$/.test(b.name))" :key="b.id" :value="b.id">{{ b.name }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="fp-divider" />

                        <!-- Model -->
                        <div class="fp-field">
                            <label class="fp-label">{{ $t('adverts.model') }}</label>
                            <div class="fp-select-wrap">
                                <v-icon icon="mdi-car-settings" size="14" class="fp-field-icon" />
                                <select v-model="f.modelId" class="fp-select" :disabled="!f.brandId">
                                    <option :value="null">{{ $t('adverts.allModels') }}</option>
                                    <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
                                </select>
                            </div>
                        </div>

                        <div class="fp-divider" />

                        <!-- Price range -->
                        <div class="fp-field fp-field--range">
                            <label class="fp-label">{{ $t('adverts.price') }}</label>
                            <div class="fp-range">
                                <input v-model.number="f.priceFrom" type="number" class="fp-range-input" placeholder="Od" min="0" />
                                <span class="fp-range-sep">–</span>
                                <input v-model.number="f.priceTo" type="number" class="fp-range-input" placeholder="Do" min="0" />
                            </div>
                        </div>

                        <div class="fp-divider" />

                        <!-- Location -->
                        <div class="fp-field">
                            <label class="fp-label">{{ $t('adverts.location') }}</label>
                            <div class="fp-input-wrap">
                                <v-icon icon="mdi-map-marker-outline" size="14" class="fp-field-icon" />
                                <input v-model="f.locationCity" type="text" class="fp-text-input" :placeholder="$t('adverts.locationPlaceholder')" />
                            </div>
                        </div>

                        <!-- Search button -->
                        <button class="fp-search-btn" @click="load(1)">
                            <v-icon icon="mdi-magnify" size="17" />
                            {{ $t('adverts.searchBtn') }}
                            <span v-if="total > 0" class="fp-btn-count">{{ total.toLocaleString('pl') }}</span>
                        </button>
                    </div>

                    <!-- SECONDARY ROW: keyword + more filters -->
                    <div class="fp-secondary">
                        <div class="fp-keyword-wrap" style="position:relative">
                            <v-icon icon="mdi-text-search" size="15" class="fp-kw-icon" />
                            <input
                                v-model="f.textSearch"
                                class="fp-keyword-input"
                                :placeholder="$t('adverts.keywordPlaceholder')"
                                autocomplete="off"
                                aria-label="Szukaj po słowie kluczowym"
                                role="combobox"
                                :aria-expanded="showSuggestions && autocompleteItems.length > 0"
                                aria-autocomplete="list"
                                @keyup.enter="load(1); showSuggestions = false"
                                @focus="showSuggestions = true"
                                @blur="setTimeout(() => { showSuggestions = false }, 150)"
                                @input="showSuggestions = true"
                            />
                            <button v-if="f.textSearch" class="fp-kw-clear" aria-label="Wyczyść wyszukiwanie" @click="f.textSearch = ''; showSuggestions = false">
                                <v-icon icon="mdi-close" size="13" />
                            </button>
                            <!-- Autocomplete dropdown -->
                            <div v-if="showSuggestions && autocompleteItems.length" class="ac-dropdown" role="listbox" aria-label="Podpowiedzi wyszukiwania">
                                <button
                                    v-for="item in autocompleteItems"
                                    :key="item.type + item.id"
                                    type="button"
                                    class="ac-item"
                                    role="option"
                                    @mousedown.prevent="applyAutocomplete(item)"
                                >
                                    <v-icon
                                        :icon="item.type === 'brand' ? 'mdi-car-outline' : item.type === 'feature' ? 'mdi-star-check-outline' : 'mdi-car-settings'"
                                        size="13" class="ac-icon"
                                    />
                                    <span class="ac-name">{{ item.name }}</span>
                                    <span class="ac-type">{{ item.type === 'brand' ? 'Marka' : item.type === 'feature' ? 'Wyposażenie' : 'Model' }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="fp-secondary-right">
                            <button
                                class="fp-more-btn"
                                :class="{ 'fp-more-btn--active': showMoreFilters }"
                                @click="showMoreFilters = !showMoreFilters"
                            >
                                <v-icon :icon="showMoreFilters ? 'mdi-chevron-up' : 'mdi-tune-variant'" size="15" />
                                {{ showMoreFilters ? $t('adverts.lessFilters') : $t('adverts.moreFilters') }}
                                <span v-if="advancedFiltersCount > 0" class="fp-more-count">{{ advancedFiltersCount }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- ACTIVE CHIPS -->
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
                        <div v-if="f.locationCity" class="sc-chip" @click="f.locationCity = ''; load(1)">
                            <v-icon icon="mdi-map-marker-outline" size="12" />
                            {{ f.locationCity }}
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
                        <div v-if="f.gearboxId" class="sc-chip" @click="f.gearboxId = null; load(1)">
                            {{ gearboxes.find(g => g.id === f.gearboxId)?.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.driveTypeId" class="sc-chip" @click="f.driveTypeId = null; load(1)">
                            {{ driveTypes.find(d => d.id === f.driveTypeId)?.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.colorId" class="sc-chip" @click="f.colorId = null; load(1)">
                            <v-icon icon="mdi-palette-outline" size="12" />
                            {{ colors.find(c => c.id === f.colorId)?.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.condition" class="sc-chip" @click="f.condition = ''; load(1)">
                            {{ f.condition === 'new' ? 'Nowy' : 'Używany' }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.euroNorm" class="sc-chip" @click="f.euroNorm = ''; load(1)">
                            {{ f.euroNorm }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.vin" class="sc-chip" @click="f.vin = ''; load(1)">
                            VIN: {{ f.vin }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-if="f.hasFinancing === true" class="sc-chip" @click="f.hasFinancing = null; load(1)">
                            Z finansowaniem
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <div v-for="fid in f.featureIds" :key="fid" class="sc-chip" @click="f.featureIds = f.featureIds.filter(x => x !== fid); load(1)">
                            <v-icon icon="mdi-star-check-outline" size="12" />
                            {{ allFeatures.find(feat => feat.id === fid)?.name }}
                            <v-icon icon="mdi-close" size="11" />
                        </div>
                        <button class="sc-chip sc-chip--clear" @click="clearFilters">
                            <v-icon icon="mdi-close-circle" size="12" />
                            Wyczyść wszystko
                        </button>
                    </div>

                    <!-- EXPANDED FILTERS PANEL -->
                    <transition name="fp-expand">
                        <div v-if="showMoreFilters" class="fp-expanded">
                            <div class="fp-grid">

                                <!-- Fuel type -->
                                <div v-if="filterConfig.showFuelType" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-gas-station-outline" size="13" />Rodzaj paliwa</div>
                                    <div class="filter-options">
                                        <button v-for="ft in fuelTypes" :key="ft.id" class="fopt-btn" :class="{ active: f.fuelTypeId === ft.id }" @click="f.fuelTypeId = f.fuelTypeId === ft.id ? null : ft.id">{{ ft.name }}</button>
                                    </div>
                                </div>

                                <!-- Gearbox -->
                                <div v-if="filterConfig.showGearbox" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-car-shift-pattern" size="13" />Skrzynia biegów</div>
                                    <div class="filter-options">
                                        <button v-for="gb in gearboxes" :key="gb.id" class="fopt-btn" :class="{ active: f.gearboxId === gb.id }" @click="f.gearboxId = f.gearboxId === gb.id ? null : gb.id">{{ gb.name }}</button>
                                    </div>
                                </div>

                                <!-- Drive type -->
                                <div v-if="filterConfig.showDriveType && driveTypes.length" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-car-traction-control" size="13" />Napęd</div>
                                    <div class="filter-options">
                                        <button v-for="dt in driveTypes" :key="dt.id" class="fopt-btn" :class="{ active: f.driveTypeId === dt.id }" @click="f.driveTypeId = f.driveTypeId === dt.id ? null : dt.id">{{ dt.name }}</button>
                                    </div>
                                </div>

                                <!-- Power -->
                                <div v-if="filterConfig.showPower" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-engine-outline" size="13" />Moc (KM)</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.powerFrom" type="number" class="fp-range-input" placeholder="Od" min="0" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.powerTo" type="number" class="fp-range-input" placeholder="Do" min="0" />
                                    </div>
                                </div>

                                <!-- Mileage -->
                                <div v-if="filterConfig.showMileage" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-speedometer" size="13" />{{ filterConfig.mileageLabel }}</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.mileageFrom" type="number" class="fp-range-input" placeholder="Od" min="0" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.mileageTo" type="number" class="fp-range-input" placeholder="Do" min="0" />
                                    </div>
                                </div>

                                <!-- Year -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-calendar-outline" size="13" />Rok produkcji</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.yearFrom" type="number" class="fp-range-input" placeholder="Od" min="1900" max="2099" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.yearTo" type="number" class="fp-range-input" placeholder="Do" min="1900" max="2099" />
                                    </div>
                                </div>

                                <!-- Condition -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-car-wrench" size="13" />Stan pojazdu</div>
                                    <div class="filter-options">
                                        <button class="fopt-btn" :class="{ active: f.condition === 'new' }" @click="f.condition = f.condition === 'new' ? '' : 'new'">Nowy</button>
                                        <button class="fopt-btn" :class="{ active: f.condition === 'used' }" @click="f.condition = f.condition === 'used' ? '' : 'used'">Używany</button>
                                    </div>
                                </div>

                                <!-- Color -->
                                <div v-if="filterConfig.showColor && colors.length" class="fp-group">
                                    <div class="fp-group-label">
                                        <v-icon icon="mdi-palette-outline" size="13" />Kolor
                                        <span v-if="f.colorId" class="color-sel-name">{{ colors.find(c => c.id === f.colorId)?.name }}</span>
                                    </div>
                                    <div class="color-swatches">
                                        <button class="color-swatch color-swatch--all" :class="{ active: !f.colorId }" title="Wszystkie" @click="f.colorId = null">
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

                                <!-- Doors -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-car-door" size="13" />Liczba drzwi</div>
                                    <div class="filter-options">
                                        <button
                                            v-for="d in [2, 3, 4, 5]" :key="d"
                                            class="fopt-btn"
                                            :class="{ active: f.doorsFrom === d && f.doorsTo === d }"
                                            @click="f.doorsFrom === d ? (f.doorsFrom = null, f.doorsTo = null) : (f.doorsFrom = d, f.doorsTo = d)"
                                        >{{ d }}</button>
                                    </div>
                                </div>

                                <!-- Seats -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-seat-passenger" size="13" />Liczba miejsc</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.seatsFrom" type="number" class="fp-range-input" placeholder="Od" min="1" max="50" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.seatsTo" type="number" class="fp-range-input" placeholder="Do" min="1" max="50" />
                                    </div>
                                </div>

                                <!-- Emission CO2 -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-molecule-co2" size="13" />Emisja CO₂ (g/km)</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.emissionFrom" type="number" class="fp-range-input" placeholder="Od" min="0" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.emissionTo" type="number" class="fp-range-input" placeholder="Do" min="0" />
                                    </div>
                                </div>

                                <!-- Euro norm -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-leaf" size="13" />Norma Euro</div>
                                    <div class="filter-options">
                                        <button
                                            v-for="norm in ['Euro 1','Euro 2','Euro 3','Euro 4','Euro 5','Euro 6','Euro 6d']"
                                            :key="norm"
                                            class="fopt-btn"
                                            :class="{ active: f.euroNorm === norm }"
                                            @click="f.euroNorm = f.euroNorm === norm ? '' : norm"
                                        >{{ norm }}</button>
                                    </div>
                                </div>

                                <!-- VIN -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-barcode-scan" size="13" />Numer VIN</div>
                                    <div class="fp-input-wrap">
                                        <input v-model="f.vin" type="text" class="fp-text-input" placeholder="Wyszukaj po VIN" maxlength="17" style="text-transform:uppercase" />
                                    </div>
                                </div>

                                <!-- Financing -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-credit-card-outline" size="13" />Finansowanie</div>
                                    <div class="filter-options">
                                        <button class="fopt-btn" :class="{ active: f.hasFinancing === true }" @click="f.hasFinancing = f.hasFinancing === true ? null : true">
                                            <v-icon icon="mdi-check" size="12" class="btn-check-icon" v-if="f.hasFinancing === true" />
                                            Z finansowaniem
                                        </button>
                                    </div>
                                </div>

                                <!-- Seller type -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-account-outline" size="13" />Sprzedawca</div>
                                    <div class="filter-options">
                                        <button class="fopt-btn" :class="{ active: f.sellerType === 'private' }" @click="f.sellerType = f.sellerType === 'private' ? '' : 'private'">Prywatny</button>
                                        <button class="fopt-btn" :class="{ active: f.sellerType === 'dealer' }" @click="f.sellerType = f.sellerType === 'dealer' ? '' : 'dealer'">Dealer</button>
                                    </div>
                                </div>

                                <!-- Additional flags -->
                                <div class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-information-outline" size="13" />Dodatkowe</div>
                                    <div class="filter-checks">
                                        <label class="fcheck"><input type="checkbox" :checked="f.hasDamage === false" @change="f.hasDamage = f.hasDamage === false ? null : false" />Bezwypadkowy</label>
                                        <label class="fcheck"><input type="checkbox" :checked="f.hasWarranty === true" @change="f.hasWarranty = f.hasWarranty === true ? null : true" />Gwarancja</label>
                                        <label class="fcheck"><input type="checkbox" :checked="f.hasServiceBook === true" @change="f.hasServiceBook = f.hasServiceBook === true ? null : true" />Książka serwisowa</label>
                                        <label class="fcheck"><input type="checkbox" :checked="f.isImported === true" @change="f.isImported = f.isImported === true ? null : true" />Import</label>
                                    </div>
                                </div>

                                <!-- Vehicle subtype (dynamic, scoped to selected category) -->
                                <div v-if="vehicleSubtypes.length" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-shape-outline" size="13" />Rodzaj pojazdu</div>
                                    <select v-model="f.vehicleSubtypeId" class="fp-select" @change="onSubtypeChange">
                                        <option :value="null">Wszystkie rodzaje</option>
                                        <option v-for="st in vehicleSubtypes" :key="st.id" :value="st.id">{{ st.namePl ?? st.name }}</option>
                                    </select>
                                </div>

                                <!-- Equipment / features -->
                                <div v-if="allFeatures.length" class="fp-group fp-group--wide">
                                    <div class="fp-group-label"><v-icon icon="mdi-star-check-outline" size="13" />Wyposażenie</div>
                                    <div class="filter-options">
                                        <button
                                            v-for="feat in allFeatures"
                                            :key="feat.id"
                                            class="fopt-btn"
                                            :class="{ active: f.featureIds.includes(feat.id) }"
                                            @click="toggleFeature(feat.id)"
                                        >{{ feat.name }}</button>
                                    </div>
                                </div>

                                <!-- Body type (if applicable) -->
                                <div v-if="filterConfig.showBodyType" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-car-estate" size="13" />Typ nadwozia</div>
                                    <div class="fp-select-wrap">
                                        <select v-model="f.bodyTypeId" class="fp-select">
                                            <option :value="null">Wszystkie</option>
                                            <option v-for="bt in bodyTypes" :key="bt.id" :value="bt.id">{{ bt.name }}</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Faza 7: calculated pill filters (origin/luxury/era/sport) plus
                                     one-click SUV/Crossover/Pickup/Van shortcuts for the BodyType
                                     dropdown above — Auta osobowe only. -->
                                <div v-if="categorySlug === 'auta-osobowe'" class="fp-group fp-group--wide">
                                    <div class="fp-group-label"><v-icon icon="mdi-tag-multiple-outline" size="13" />Szybkie filtry</div>
                                    <div class="filter-options">
                                        <button class="fopt-btn" :class="{ active: f.originCountry === 'USA' }" @click="toggleOriginCountry('USA')">Amerykańskie</button>
                                        <button class="fopt-btn" :class="{ active: f.originCountry === 'Japonia' }" @click="toggleOriginCountry('Japonia')">Japońskie</button>
                                        <button class="fopt-btn" :class="{ active: f.originCountry === 'Chiny' }" @click="toggleOriginCountry('Chiny')">Chińskie</button>
                                        <button class="fopt-btn" :class="{ active: f.isLuxuryBrand === true }" @click="toggleLuxury">Luksusowe</button>
                                        <button class="fopt-btn" :class="{ active: f.era === 'youngtimer' }" @click="toggleEra('youngtimer')">Youngtimery</button>
                                        <button class="fopt-btn" :class="{ active: f.era === 'classic' }" @click="toggleEra('classic')">Klasyczne i zabytkowe</button>
                                        <button class="fopt-btn" :class="{ active: f.isSporty === true }" @click="toggleSporty">Sportowe</button>
                                        <button class="fopt-btn" :class="{ active: isBodyTypeActive('SUV') }" @click="toggleBodyTypeByName('SUV')">SUV</button>
                                        <button class="fopt-btn" :class="{ active: isBodyTypeActive('Crossover') }" @click="toggleBodyTypeByName('Crossover')">Crossover</button>
                                        <button class="fopt-btn" :class="{ active: isBodyTypeActive('Pickup') }" @click="toggleBodyTypeByName('Pickup')">Pickup</button>
                                        <button class="fopt-btn" :class="{ active: isBodyTypeActive('Minivan / Van') }" @click="toggleBodyTypeByName('Minivan / Van')">Van</button>
                                    </div>
                                </div>

                                <!-- Engine size (motorcycles) -->
                                <div v-if="filterConfig.showEngineSize" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-engine-outline" size="13" />Pojemność (cm³)</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.engineSizeFrom" type="number" class="fp-range-input" placeholder="Od" min="0" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.engineSizeTo" type="number" class="fp-range-input" placeholder="Do" min="0" />
                                    </div>
                                </div>

                                <!-- Payload (trucks) -->
                                <div v-if="filterConfig.showPayload" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-weight" size="13" />Ładowność (kg)</div>
                                    <div class="fp-range">
                                        <input v-model.number="f.payloadFrom" type="number" class="fp-range-input" placeholder="Od" min="0" />
                                        <span class="fp-range-sep">–</span>
                                        <input v-model.number="f.payloadTo" type="number" class="fp-range-input" placeholder="Do" min="0" />
                                    </div>
                                </div>

                                <!-- Catalog number (parts) -->
                                <div v-if="filterConfig.showCatalogNumber" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-barcode-scan" size="13" />Nr katalogowy / OEM</div>
                                    <div class="fp-input-wrap">
                                        <input v-model="f.catalogNumber" type="text" class="fp-text-input" placeholder="np. 1K0615301L" />
                                    </div>
                                </div>

                                <!-- Part category -->
                                <div v-if="filterConfig.showPartCategory" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-cog" size="13" />Kategoria części</div>
                                    <select v-model="f.partCategoryId" class="fp-select">
                                        <option :value="null">Wszystkie kategorie</option>
                                        <option v-for="pc in partCategories" :key="pc.id" :value="pc.id">{{ pc.name }}</option>
                                    </select>
                                </div>

                                <!-- Side -->
                                <div v-if="filterConfig.showSide" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-swap-horizontal" size="13" />Strona montażu</div>
                                    <select v-model="f.side" class="fp-select">
                                        <option value="">Dowolna</option>
                                        <option value="Lewa">Lewa</option>
                                        <option value="Prawa">Prawa</option>
                                        <option value="Przód">Przód</option>
                                        <option value="Tył">Tył</option>
                                        <option value="Obie strony">Obie strony / uniwersalna</option>
                                    </select>
                                </div>

                                <!-- OEM number (parts) -->
                                <div v-if="filterConfig.showCatalogNumber" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-identifier" size="13" />Numer OEM</div>
                                    <div class="fp-input-wrap">
                                        <input v-model="f.oemNumber" type="text" class="fp-text-input" placeholder="np. 3C0853630A" />
                                    </div>
                                </div>

                                <!-- Manufacturer part number (parts) -->
                                <div v-if="filterConfig.showCatalogNumber" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-factory" size="13" />Numer katalogowy producenta</div>
                                    <div class="fp-input-wrap">
                                        <input v-model="f.manufacturerPartNumber" type="text" class="fp-text-input" placeholder="np. 0986490304" />
                                    </div>
                                </div>

                                <!-- Minimum available quantity (parts) -->
                                <div v-if="filterConfig.showCatalogNumber" class="fp-group">
                                    <div class="fp-group-label"><v-icon icon="mdi-numeric" size="13" />Min. dostępna ilość</div>
                                    <div class="fp-input-wrap">
                                        <input v-model.number="f.quantityFrom" type="number" min="1" class="fp-text-input" placeholder="np. 1" />
                                    </div>
                                </div>

                                <!-- AttributeDefinition-driven filters (Faza 5, category/subtype-scoped) -->
                                <DynamicAttributeFilter
                                    v-for="def in filterableAttributes"
                                    :key="def.id"
                                    :definition="def"
                                    :model-value="attrFilters[def.id] ?? null"
                                    @update:model-value="v => { if (v) attrFilters[def.id] = v; else delete attrFilters[def.id] }"
                                />

                            </div>

                            <!-- Expanded footer -->
                            <div class="fp-expanded-footer">
                                <button v-if="hasActiveFilters" class="fp-clear-btn" @click="clearFilters">
                                    <v-icon icon="mdi-close-circle-outline" size="14" />
                                    Wyczyść wszystko
                                </button>
                                <button class="fp-apply-btn" @click="load(1); showMoreFilters = false">
                                    <v-icon icon="mdi-magnify" size="15" />
                                    Pokaż {{ total.toLocaleString('pl') }} ogłoszeń
                                </button>
                            </div>
                        </div>
                    </transition>

                </div>
            </div>
        </div>

        <!-- ── Content ── -->
        <div class="container main-layout">
            <div class="content">
                <div class="results-hd">
                    <p class="result-count">
                        {{ $t('adverts.found') }} <strong>{{ total.toLocaleString(locale) }}</strong> {{ $t('adverts.foundSuffix') }}
                    </p>
                    <div class="sort-wrap">
                        <v-icon icon="mdi-sort" size="16" class="sort-icon" />
                        <select v-model="f.sortBy" class="sort-select" @change="load(1)">
                            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                        </select>
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
                        <v-icon icon="mdi-car-off" size="64" class="no-results-icon" />
                        <p>{{ $t('adverts.noResults') }}</p>
                        <span>{{ $t('adverts.noResultsHint') }}</span>
                        <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">
                            <v-icon icon="mdi-filter-remove-outline" size="15" />
                            {{ $t('adverts.clearFilters') }}
                        </button>
                    </div>
                    <div v-if="page < totalPages" class="load-more-wrap">
                        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
                            <v-icon v-if="loadingMore" icon="mdi-loading" size="17" class="spin" />
                            <v-icon v-else icon="mdi-chevron-down" size="17" />
                            {{ loadingMore ? $t('adverts.loading') : `${$t('adverts.loadMore')} (${total - adverts.length})` }}
                        </button>
                    </div>
                    <div v-if="totalPages > 1" class="pagination" role="navigation" aria-label="Paginacja wyników">
                        <button class="page-btn" aria-label="Poprzednia strona" :disabled="page === 1" @click="goToPage(page - 1)">
                            <v-icon icon="mdi-chevron-left" size="18" />
                        </button>
                        <button
                            v-for="p in paginationPages"
                            :key="p"
                            class="page-btn"
                            :class="{ 'page-btn--active': p === page, 'page-btn--dot': p === '...' }"
                            :disabled="p === '...'"
                            :aria-label="p !== '...' ? `Strona ${p}` : undefined"
                            :aria-current="p === page ? 'page' : undefined"
                            @click="p !== '...' && goToPage(Number(p))"
                        >{{ p }}</button>
                        <button class="page-btn" aria-label="Następna strona" :disabled="page >= totalPages" @click="goToPage(page + 1)">
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
import type { TaxonomyItem, DriveType, CarColor, CarAdvert, Feature, PagedResult, CategoryWithCount, PartCategory } from '~/types'

const advertsConfig = useRuntimeConfig()

const route = useRoute()
const router = useRouter()
const { fetchBrands, fetchBrandsByCategory, fetchModels, fetchFuelTypes, fetchBodyTypes, fetchGearboxes, fetchDriveTypes, fetchColors, fetchFeatures, fetchPartCategories, fetchFeatureCategoriesByVehicle, fetchVehicleSubtypes } = useTaxonomy()
const { fetchCategories } = useCategories()
const { fetchFavoriteIds } = useFavorites()
const { error: toastError } = useToast()

// Initialize filter state from URL query params at setup time (SSR-safe — no onMounted)
const f = reactive({
    categoryId:  route.query.categoryId  ? Number(route.query.categoryId)  : null as number | null,
    textSearch:  route.query.textSearch  ? String(route.query.textSearch)  : '',
    brandId:     route.query.brandId     ? Number(route.query.brandId)     : null as number | null,
    modelId:     route.query.modelId     ? Number(route.query.modelId)     : null as number | null,
    generationId: route.query.generationId ? Number(route.query.generationId) : null as number | null,
    fuelTypeId:  route.query.fuelTypeId  ? Number(route.query.fuelTypeId)  : null as number | null,
    bodyTypeId:  route.query.bodyTypeId  ? Number(route.query.bodyTypeId)  : null as number | null,
    gearboxId:   route.query.gearboxId   ? Number(route.query.gearboxId)   : null as number | null,
    priceFrom:   route.query.priceFrom   ? Number(route.query.priceFrom)   : null as number | null,
    priceTo:     route.query.priceTo     ? Number(route.query.priceTo)     : null as number | null,
    yearFrom:    route.query.yearFrom    ? Number(route.query.yearFrom)    : null as number | null,
    yearTo:      route.query.yearTo      ? Number(route.query.yearTo)      : null as number | null,
    mileageFrom: route.query.mileageFrom ? Number(route.query.mileageFrom) : null as number | null,
    mileageTo:   route.query.mileageTo   ? Number(route.query.mileageTo)   : null as number | null,
    powerFrom:        route.query.powerFrom        ? Number(route.query.powerFrom)        : null as number | null,
    powerTo:          route.query.powerTo          ? Number(route.query.powerTo)          : null as number | null,
    engineSizeFrom:   route.query.engineSizeFrom   ? Number(route.query.engineSizeFrom)   : null as number | null,
    engineSizeTo:     route.query.engineSizeTo     ? Number(route.query.engineSizeTo)     : null as number | null,
    driveTypeId: route.query.driveTypeId ? Number(route.query.driveTypeId) : null as number | null,
    colorId:     route.query.colorId     ? Number(route.query.colorId)     : null as number | null,
    sellerType:  (route.query.sellerType ?? '') as '' | 'private' | 'dealer',
    condition:   (route.query.condition  ?? '') as '' | 'new' | 'used',
    hasDamage:   route.query.hasDamage   !== undefined ? route.query.hasDamage   === 'true' : null as boolean | null,
    hasWarranty: route.query.hasWarranty !== undefined ? route.query.hasWarranty === 'true' : null as boolean | null,
    hasServiceBook: route.query.hasServiceBook !== undefined ? route.query.hasServiceBook === 'true' : null as boolean | null,
    isImported:  route.query.isImported  !== undefined ? route.query.isImported  === 'true' : null as boolean | null,
    axleCount:   null as number | null,
    payloadFrom: route.query.payloadFrom ? Number(route.query.payloadFrom) : null as number | null,
    payloadTo:   route.query.payloadTo   ? Number(route.query.payloadTo)   : null as number | null,
    grossWeightFrom: null as number | null,
    grossWeightTo:   null as number | null,
    bodySubtype: route.query.bodySubtype ? String(route.query.bodySubtype) : '' as string,
    catalogNumber: route.query.catalogNumber ? String(route.query.catalogNumber) : '' as string,
    partCategoryId: route.query.partCategoryId ? Number(route.query.partCategoryId) : null as number | null,
    partSubcategoryId: route.query.partSubcategoryId ? Number(route.query.partSubcategoryId) : null as number | null,
    side: route.query.side ? String(route.query.side) : '' as string,
    quantityFrom: route.query.quantityFrom ? Number(route.query.quantityFrom) : null as number | null,
    oemNumber: route.query.oemNumber ? String(route.query.oemNumber) : '' as string,
    manufacturerPartNumber: route.query.manufacturerPartNumber ? String(route.query.manufacturerPartNumber) : '' as string,
    vehicleSubtypeId: route.query.vehicleSubtypeId ? Number(route.query.vehicleSubtypeId) : null as number | null,
    hasRetarder: null as boolean | null,
    hasTachograph: null as boolean | null,
    featureIds:  route.query.featureIds ? String(route.query.featureIds).split(',').map(Number).filter(Boolean) : [] as number[],
    sortBy:      route.query.sortBy ? String(route.query.sortBy) : '',
    // New fields
    locationCity: route.query.locationCity ? String(route.query.locationCity) : '' as string,
    vin:          route.query.vin          ? String(route.query.vin)          : '' as string,
    doorsFrom:    route.query.doorsFrom    ? Number(route.query.doorsFrom)    : null as number | null,
    doorsTo:      route.query.doorsTo      ? Number(route.query.doorsTo)      : null as number | null,
    seatsFrom:    route.query.seatsFrom    ? Number(route.query.seatsFrom)    : null as number | null,
    seatsTo:      route.query.seatsTo      ? Number(route.query.seatsTo)      : null as number | null,
    emissionFrom: route.query.emissionFrom ? Number(route.query.emissionFrom) : null as number | null,
    emissionTo:   route.query.emissionTo   ? Number(route.query.emissionTo)   : null as number | null,
    euroNorm:     route.query.euroNorm     ? String(route.query.euroNorm)     : '' as string,
    hasFinancing: route.query.hasFinancing !== undefined ? route.query.hasFinancing === 'true' : null as boolean | null,
    // Faza 7 of the category/attribute restructure: calculated pill filters for Auta osobowe.
    originCountry: route.query.originCountry ? String(route.query.originCountry) : '' as string,
    isLuxuryBrand: route.query.isLuxuryBrand !== undefined ? route.query.isLuxuryBrand === 'true' : null as boolean | null,
    era:          route.query.era          ? String(route.query.era) as '' | 'youngtimer' | 'classic' : '' as '' | 'youngtimer' | 'classic',
    isSporty:     route.query.isSporty     !== undefined ? route.query.isSporty     === 'true' : null as boolean | null,
})

const models       = ref<TaxonomyItem[]>([])
const allFeatures  = ref<Feature[]>([])
const vehicleSubtypes = ref<{ id: number; name: string; namePl?: string }[]>([])

// Faza 5 of the category/attribute restructure: filterable AttributeDefinition rows for the
// active category (+subtype), and the current filter-panel value per definition id.
interface FilterableAttrDef {
    id: number; key: string; labelPl: string
    dataType: 'Text' | 'Number' | 'Decimal' | 'Boolean' | 'Select' | 'MultiSelect' | 'Date' | 'File'
    unit?: string | null; optionsJson?: string | null; isFilterable: boolean
}
interface AttrFilterValue { bool?: boolean | null; multi?: string[]; from?: number | null; to?: number | null }
const filterableAttributes = ref<FilterableAttrDef[]>([])
const attrFilters = reactive<Record<number, AttrFilterValue>>({})
function clearAttrFilters() {
    for (const k of Object.keys(attrFilters)) delete attrFilters[Number(k)]
}
const adverts      = ref<CarAdvert[]>([])
const total        = ref(0)
const frozenTotal  = ref(0) // snapshot of total at last fresh search; used for loadMore to avoid offset shifts
const page         = ref(route.query.page ? Number(route.query.page) : 1)
const loading      = ref(false)
const loadingMore  = ref(false)
const pageSize     = 12
const searchFocused = ref(false)
const showMoreFilters = ref(false)
const showSuggestions = ref(false)

// Auto-open expanded filters if advanced filters are active from URL
const advancedFiltersCount = computed(() => {
    let n = 0
    if (f.fuelTypeId) n++
    if (f.gearboxId) n++
    if (f.driveTypeId) n++
    if (f.powerFrom || f.powerTo) n++
    if (f.mileageFrom || f.mileageTo) n++
    if (f.yearFrom || f.yearTo) n++
    if (f.condition) n++
    if (f.colorId) n++
    if (f.doorsFrom || f.doorsTo) n++
    if (f.seatsFrom || f.seatsTo) n++
    if (f.emissionFrom || f.emissionTo) n++
    if (f.euroNorm) n++
    if (f.vin) n++
    if (f.hasFinancing !== null) n++
    if (f.originCountry) n++
    if (f.isLuxuryBrand !== null) n++
    if (f.era) n++
    if (f.isSporty !== null) n++
    if (f.featureIds.length) n++
    if (f.sellerType) n++
    if (f.hasDamage !== null || f.hasWarranty !== null || f.hasServiceBook !== null || f.isImported !== null) n++
    if (f.bodyTypeId) n++
    if (f.engineSizeFrom || f.engineSizeTo) n++
    if (f.payloadFrom || f.payloadTo) n++
    if (f.catalogNumber) n++
    if (f.partCategoryId) n++
    if (f.partSubcategoryId) n++
    if (f.side) n++
    if (f.quantityFrom) n++
    if (f.oemNumber) n++
    if (f.manufacturerPartNumber) n++
    if (f.vehicleSubtypeId) n++
    n += Object.values(attrFilters).length
    return n
})

// Open expanded panel if advanced filters active on page load
if (advancedFiltersCount.value > 0) showMoreFilters.value = true

const activeFiltersCount = computed(() => {
    let n = 0
    if (f.categoryId) n++
    if (f.brandId) n++
    if (f.locationCity) n++
    return n + advancedFiltersCount.value
})

// Quick view
const quickViewOpen = ref(false)
const quickViewId   = ref<number | null>(null)
function openQuickView(id: number) { quickViewId.value = id; quickViewOpen.value = true }

const totalPages = computed(() => Math.ceil(frozenTotal.value / pageSize))

const { t, locale } = useI18n()
const sortOptions = computed(() => [
    { label: t('adverts.sortNewest'),    value: '' },
    { label: t('adverts.sortFeatured'),  value: 'featured' },
    { label: t('adverts.sortPriceAsc'),  value: 'price_asc' },
    { label: t('adverts.sortPriceDesc'), value: 'price_desc' },
    { label: t('adverts.sortYearDesc'),  value: 'year_desc' },
    { label: t('adverts.sortMileageAsc'),value: 'mileage_asc' },
    { label: t('adverts.sortPowerDesc'), value: 'power_desc' },
])

const activeCategory = computed(() =>
    f.categoryId ? (categories.value.find(c => c.id === f.categoryId) ?? null) : null
)
const categorySlug = computed(() => activeCategory.value?.slug ?? null)

const filterConfig = computed(() => {
    const slug = categorySlug.value
    const isMoto = slug === 'motocykle' || slug?.includes('moto')
    const isParts = slug === 'czesci' || slug?.includes('czesc') || slug?.includes('part')
    const isTrailer = slug === 'przyczepy' || slug?.includes('przyczepa') || slug?.includes('naczepa')
    const isMachinery = slug === 'maszyny' || slug === 'budowlane' || slug?.includes('maszyn') || slug?.includes('rolnicze') || slug?.includes('budowlane')
    const isTruck = slug === 'dostawcze' || slug?.includes('dostawcze') || slug?.includes('ciezarowe') || slug?.includes('ciężar')

    return {
        showBrandModel: true,
        showFuelType: !isParts && !isTrailer,
        showGearbox: !isParts && !isTrailer && !isMoto,
        showBodyType: !isParts && !isMoto && !isTrailer && !isMachinery,
        showPower: !isParts,
        showEngineSize: isMoto,
        showMileage: !isParts,
        showDriveType: !isParts && !isMoto && !isTrailer,
        showColor: !isParts && !isTrailer && !isMachinery,
        showYear: true,
        showPrice: true,
        showPayload: isTruck || isMachinery,
        showCatalogNumber: isParts,
        showPartCategory: isParts,
        showSide: isParts,
        mileageLabel: isMachinery ? 'Motogodziny (mth)' : 'Przebieg (km)',
        mileageFromKey: isMachinery ? 'mileageFrom' : 'mileageFrom',
        brandLabel: isMoto ? 'Marka motocykla' : isParts ? 'Marka pojazdu' : isTruck ? 'Marka pojazdu' : 'Marka',
        modelLabel: isMoto ? 'Model' : isParts ? 'Model pojazdu' : 'Model',
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
       f.engineSizeFrom || f.engineSizeTo ||
       f.payloadFrom || f.payloadTo || f.catalogNumber || f.partCategoryId || f.partSubcategoryId ||
       f.side || f.quantityFrom || f.oemNumber || f.manufacturerPartNumber || f.vehicleSubtypeId ||
       f.featureIds.length > 0 ||
       f.sellerType || f.condition ||
       f.hasDamage !== null || f.hasWarranty !== null || f.hasServiceBook !== null || f.isImported !== null ||
       f.locationCity || f.vin || f.doorsFrom || f.doorsTo || f.seatsFrom || f.seatsTo ||
       f.emissionFrom || f.emissionTo || f.euroNorm || f.hasFinancing !== null ||
       f.originCountry || f.isLuxuryBrand !== null || f.era || f.isSporty !== null ||
       Object.keys(attrFilters).length > 0)
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

// Scopes the equipment/feature filter and the vehicle-subtype filter to the selected category,
// via the same taxonomy endpoints the add-advert form uses — instead of allFeatures being every
// feature across every category regardless of what's being searched (e.g. "Hydraulika" showing up
// as a filter option while browsing cars). categoryId === null falls back to the unscoped feature
// list (today's general-browse behavior) with no subtype filter.
async function loadCategoryScopedFilters(categoryId: number | null, subtypeId: number | null = null) {
    if (categoryId) {
        try {
            const cats = await fetchFeatureCategoriesByVehicle(categoryId) as any[]
            allFeatures.value = cats.flatMap(c => c.features ?? [])
        } catch { allFeatures.value = [] }
        try { vehicleSubtypes.value = await fetchVehicleSubtypes(categoryId) } catch { vehicleSubtypes.value = [] }
        try {
            const defs = await $fetch<FilterableAttrDef[]>('/api/proxy/api/Attributes', {
                query: { categoryId, subtypeId: subtypeId ?? undefined, activeOnly: true },
            })
            filterableAttributes.value = defs.filter(d => d.isFilterable)
        } catch { filterableAttributes.value = [] }
    } else {
        try { allFeatures.value = await fetchFeatures() } catch { allFeatures.value = [] }
        vehicleSubtypes.value = []
        filterableAttributes.value = []
    }
    clearAttrFilters()
}

function onCategoryChange() {
    // v-model already wrote the newly picked option into f.categoryId before this
    // handler runs, so just react to it here - do not re-derive/toggle it.
    f.brandId = null
    f.modelId = null
    f.generationId = null
    f.vehicleSubtypeId = null
    f.featureIds = []
    models.value = []
    if (f.categoryId) {
        fetchBrandsByCategory(f.categoryId).then(b => { dynamicBrands.value = b }).catch(() => { dynamicBrands.value = null })
    } else {
        dynamicBrands.value = null
    }
    loadCategoryScopedFilters(f.categoryId)
    load(1)
}

// AttributeDefinitions can be scoped to one VehicleSubtypeId, so picking a subtype needs to
// re-fetch the filterable-attributes list too (not just re-run the search).
function onSubtypeChange() {
    loadCategoryScopedFilters(f.categoryId, f.vehicleSubtypeId)
    load(1)
}

function toggleFeature(id: number) {
    const idx = f.featureIds.indexOf(id)
    if (idx === -1) f.featureIds.push(id)
    else f.featureIds.splice(idx, 1)
    load(1)
}

// Faza 7 of the category/attribute restructure: calculated pill filters for Auta osobowe.
function toggleOriginCountry(country: string) {
    f.originCountry = f.originCountry === country ? '' : country
    load(1)
}
function toggleLuxury() {
    f.isLuxuryBrand = f.isLuxuryBrand === true ? null : true
    load(1)
}
function toggleEra(era: 'youngtimer' | 'classic') {
    f.era = f.era === era ? '' : era
    load(1)
}
function toggleSporty() {
    f.isSporty = f.isSporty === true ? null : true
    load(1)
}
// SUV/Crossover/Pickup/Van one-click shortcuts reuse the existing f.bodyTypeId filter/dropdown
// (the data was already there via BodyType — this is purely a UI convenience, no new backend field).
function isBodyTypeActive(name: string): boolean {
    return bodyTypes.value.find(b => b.name === name)?.id === f.bodyTypeId
}
function toggleBodyTypeByName(name: string) {
    const bt = bodyTypes.value.find(b => b.name === name)
    if (!bt) return
    f.bodyTypeId = f.bodyTypeId === bt.id ? null : bt.id
    load(1)
}

function clearFilters() {
    f.categoryId = null; f.textSearch = ''; f.brandId = null; f.modelId = null; f.generationId = null
    f.fuelTypeId = null; f.bodyTypeId = null; f.gearboxId = null
    f.driveTypeId = null; f.colorId = null
    f.priceFrom = null; f.priceTo = null
    f.yearFrom = null; f.yearTo = null
    f.mileageFrom = null; f.mileageTo = null
    f.powerFrom = null; f.powerTo = null
    f.engineSizeFrom = null; f.engineSizeTo = null
    f.sellerType = ''; f.condition = ''
    f.hasDamage = null; f.hasWarranty = null; f.hasServiceBook = null; f.isImported = null
    f.axleCount = null; f.payloadFrom = null; f.payloadTo = null
    f.grossWeightFrom = null; f.grossWeightTo = null; f.bodySubtype = ''
    f.hasRetarder = null; f.hasTachograph = null; f.catalogNumber = ''
    f.partCategoryId = null; f.partSubcategoryId = null; f.side = ''
    f.quantityFrom = null; f.oemNumber = ''; f.manufacturerPartNumber = ''
    f.vehicleSubtypeId = null
    f.featureIds = []
    f.sortBy = ''
    f.locationCity = ''; f.vin = ''
    f.doorsFrom = null; f.doorsTo = null
    f.seatsFrom = null; f.seatsTo = null
    f.emissionFrom = null; f.emissionTo = null
    f.euroNorm = ''; f.hasFinancing = null
    f.originCountry = ''; f.isLuxuryBrand = null; f.era = ''; f.isSporty = null
    models.value = []
    loadCategoryScopedFilters(null) // also clears attrFilters
    load(1)
}

async function onBrandChange() {
    f.modelId = null
    f.generationId = null
    models.value = []
    if (f.brandId) models.value = await fetchModels(f.brandId)
    load(1)
}

function buildSearchBody(p: number): Record<string, unknown> {
    const body: Record<string, unknown> = { page: p, pageSize, sortBy: f.sortBy || undefined }
    if (f.categoryId)   body.categoryId   = f.categoryId
    if (f.textSearch)   body.textSearch   = f.textSearch
    if (f.brandId)      body.brandId      = f.brandId
    if (f.modelId)      body.modelId      = f.modelId
    if (f.generationId) body.generationId = f.generationId
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
    if (f.powerFrom)         body.powerFrom         = f.powerFrom
    if (f.powerTo)           body.powerTo           = f.powerTo
    if (f.engineSizeFrom)    body.engineSizeFrom    = f.engineSizeFrom
    if (f.engineSizeTo)      body.engineSizeTo      = f.engineSizeTo
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
    if (f.catalogNumber)           body.catalogNumber  = f.catalogNumber
    if (f.partCategoryId)          body.partCategoryId = f.partCategoryId
    if (f.partSubcategoryId)       body.partSubcategoryId = f.partSubcategoryId
    if (f.side)                    body.side           = f.side
    if (f.quantityFrom)            body.quantityFrom   = f.quantityFrom
    if (f.oemNumber)               body.oemNumber      = f.oemNumber
    if (f.manufacturerPartNumber)  body.manufacturerPartNumber = f.manufacturerPartNumber
    if (f.vehicleSubtypeId)        body.vehicleSubtypeId = f.vehicleSubtypeId
    if (f.featureIds.length)       body.featureIds     = f.featureIds
    // New fields (passed to API; API will ignore unknown fields gracefully)
    if (f.locationCity)            body.locationCity   = f.locationCity
    if (f.vin)                     body.vin            = f.vin.toUpperCase()
    if (f.doorsFrom)               body.doorsFrom      = f.doorsFrom
    if (f.doorsTo)                 body.doorsTo        = f.doorsTo
    if (f.seatsFrom)               body.seatsFrom      = f.seatsFrom
    if (f.seatsTo)                 body.seatsTo        = f.seatsTo
    if (f.emissionFrom)            body.emissionFrom   = f.emissionFrom
    if (f.emissionTo)              body.emissionTo     = f.emissionTo
    if (f.euroNorm)                body.euroNorm       = f.euroNorm
    if (f.hasFinancing !== null)   body.hasFinancing   = f.hasFinancing
    if (f.originCountry)           body.originCountry  = f.originCountry
    if (f.isLuxuryBrand !== null)  body.isLuxuryBrand  = f.isLuxuryBrand
    if (f.era)                     body.era            = f.era
    if (f.isSporty !== null)       body.isSporty       = f.isSporty
    const attributeFilters = Object.entries(attrFilters).map(([defId, v]) => {
        const attributeDefinitionId = Number(defId)
        if (v.bool != null) return { attributeDefinitionId, valueBool: v.bool }
        if (v.multi?.length) return { attributeDefinitionId, valueTextIn: v.multi }
        if (v.from != null || v.to != null) return { attributeDefinitionId, valueNumberFrom: v.from ?? undefined, valueNumberTo: v.to ?? undefined }
        return null
    }).filter(Boolean)
    if (attributeFilters.length) body.attributeFilters = attributeFilters
    return body
}

// ── SSR-safe taxonomy fetch ─────────────────────────────────────────────────────
const { data: taxoData } = await useAsyncData('taxonomy', async () => {
    const [b, ft, bt, gb, dt, c, cats, m, pc] = await Promise.all([
        fetchBrands().catch(() => [] as TaxonomyItem[]),
        fetchFuelTypes().catch(() => [] as TaxonomyItem[]),
        fetchBodyTypes().catch(() => [] as TaxonomyItem[]),
        fetchGearboxes().catch(() => [] as TaxonomyItem[]),
        fetchDriveTypes().catch(() => [] as DriveType[]),
        fetchColors().catch(() => [] as CarColor[]),
        fetchCategories().catch(() => [] as CategoryWithCount[]),
        f.brandId ? fetchModels(f.brandId).catch(() => [] as TaxonomyItem[]) : Promise.resolve([] as TaxonomyItem[]),
        fetchPartCategories().catch(() => [] as PartCategory[]),
    ])
    return { brands: b, fuelTypes: ft, bodyTypes: bt, gearboxes: gb, driveTypes: dt, colors: c, categories: cats, initialModels: m, partCategories: pc }
})

const allBrands  = computed(() => taxoData.value?.brands     ?? [])
const dynamicBrands = ref<{ id: number; name: string }[] | null>(null)
const brands     = computed(() => dynamicBrands.value ?? allBrands.value)
const fuelTypes  = computed(() => taxoData.value?.fuelTypes  ?? [])
const bodyTypes  = computed(() => taxoData.value?.bodyTypes  ?? [])
const gearboxes  = computed(() => taxoData.value?.gearboxes  ?? [])
const driveTypes = computed(() => taxoData.value?.driveTypes ?? [])
const colors     = computed(() => taxoData.value?.colors     ?? [])
const categories = computed(() => (taxoData.value?.categories ?? []).filter(c => c.slug !== 'inne'))
const partCategories = computed(() => taxoData.value?.partCategories ?? [])

// Category-aware SEO: a search filtered to one category is effectively a distinct landing
// page ("Auta osobowe — ogłoszenia") and should be indexable/rankable as such, instead of every
// filtered view sharing the same generic title Google would treat as one page.
const seoCategoryName = computed(() => f.categoryId ? categories.value.find(c => c.id === f.categoryId)?.name ?? null : null)
const seoTitle = computed(() => seoCategoryName.value
    ? `${seoCategoryName.value} — ogłoszenia | CARIZO`
    : 'Ogłoszenia samochodowe — CARIZO')
const seoDescription = computed(() => seoCategoryName.value
    ? `Przeglądaj ogłoszenia w kategorii ${seoCategoryName.value} na CARIZO. Filtruj po marce, modelu, cenie i przebiegu.`
    : 'Przeglądaj tysiące ofert sprzedaży samochodów w Polsce. Filtruj po marce, modelu, cenie i przebiegu.')

useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    ogType: 'website',
    ogUrl: `${advertsConfig.public.siteUrl}/adverts`,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogImage: `${advertsConfig.public.siteUrl}/og-image.jpg`,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogSiteName: 'CARIZO',
    twitterCard: 'summary_large_image',
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
    twitterImage: `${advertsConfig.public.siteUrl}/og-image.jpg`,
    robots: 'index, follow',
})
// Canonical must follow the category filter too - a hardcoded bare /adverts here would tell
// Google every category-filtered view ("Auta osobowe — ogłoszenia" etc, see seoTitle above)
// is a duplicate of the generic listing page, undoing the category-aware title/description
// and preventing these from ever being indexed as their own distinct landing pages.
const canonicalUrl = computed(() => f.categoryId
    ? `${advertsConfig.public.siteUrl}/adverts?categoryId=${f.categoryId}`
    : `${advertsConfig.public.siteUrl}/adverts`)
useHead({ link: [{ rel: 'canonical', href: canonicalUrl }] })

if (taxoData.value?.initialModels?.length) {
    models.value = taxoData.value.initialModels
}

// ── SSR-safe initial advert search ────────────────────────────────────────────────
const searchKey = computed(() => `adverts-search-${JSON.stringify(buildSearchBody(page.value))}`)
const { data: searchData } = await useAsyncData(searchKey, () =>
    $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
        method: 'POST',
        body: buildSearchBody(page.value),
    }).catch(() => ({ items: [] as CarAdvert[], totalCount: 0 }))
)

adverts.value = searchData.value?.items ?? []
total.value   = searchData.value?.totalCount ?? 0
// frozenTotal otherwise only gets set inside load() (an explicit filter/sort/page action) -
// without this, a page opened fresh (no prior interaction) always computes totalPages as 0
// and hides "Załaduj więcej"/pagination even when there are more results, regardless of device.
frozenTotal.value = total.value

// ── Interactive load (client-side filtering) ────────────────────────────────────────────
async function load(p: number = page.value) {
    page.value = p
    loading.value = true

    const query: Record<string, string> = {}
    if (f.categoryId)  query.categoryId  = String(f.categoryId)
    if (f.textSearch)  query.textSearch  = f.textSearch
    if (f.brandId)     query.brandId     = String(f.brandId)
    if (f.modelId)     query.modelId     = String(f.modelId)
    if (f.generationId) query.generationId = String(f.generationId)
    if (f.fuelTypeId)  query.fuelTypeId  = String(f.fuelTypeId)
    if (f.bodyTypeId)  query.bodyTypeId  = String(f.bodyTypeId)
    if (f.gearboxId)   query.gearboxId   = String(f.gearboxId)
    if (f.priceFrom)   query.priceFrom   = String(f.priceFrom)
    if (f.priceTo)     query.priceTo     = String(f.priceTo)
    if (f.yearFrom)    query.yearFrom    = String(f.yearFrom)
    if (f.yearTo)      query.yearTo      = String(f.yearTo)
    if (f.mileageFrom) query.mileageFrom = String(f.mileageFrom)
    if (f.mileageTo)   query.mileageTo   = String(f.mileageTo)
    if (f.powerFrom)       query.powerFrom       = String(f.powerFrom)
    if (f.powerTo)         query.powerTo         = String(f.powerTo)
    if (f.engineSizeFrom)  query.engineSizeFrom  = String(f.engineSizeFrom)
    if (f.engineSizeTo)    query.engineSizeTo    = String(f.engineSizeTo)
    if (f.driveTypeId) query.driveTypeId = String(f.driveTypeId)
    if (f.colorId)     query.colorId     = String(f.colorId)
    if (f.sellerType)  query.sellerType  = f.sellerType
    if (f.condition)   query.condition   = f.condition
    if (f.hasDamage !== null)      query.hasDamage      = String(f.hasDamage)
    if (f.hasWarranty !== null)    query.hasWarranty    = String(f.hasWarranty)
    if (f.hasServiceBook !== null) query.hasServiceBook = String(f.hasServiceBook)
    if (f.isImported !== null)     query.isImported     = String(f.isImported)
    if (f.bodySubtype)       query.bodySubtype  = f.bodySubtype
    if (f.payloadFrom)       query.payloadFrom  = String(f.payloadFrom)
    if (f.payloadTo)         query.payloadTo    = String(f.payloadTo)
    if (f.catalogNumber)     query.catalogNumber = f.catalogNumber
    if (f.partCategoryId)    query.partCategoryId = String(f.partCategoryId)
    if (f.partSubcategoryId) query.partSubcategoryId = String(f.partSubcategoryId)
    if (f.side)              query.side = f.side
    if (f.quantityFrom)      query.quantityFrom = String(f.quantityFrom)
    if (f.oemNumber)         query.oemNumber = f.oemNumber
    if (f.manufacturerPartNumber) query.manufacturerPartNumber = f.manufacturerPartNumber
    if (f.vehicleSubtypeId)  query.vehicleSubtypeId = String(f.vehicleSubtypeId)
    if (f.featureIds.length) query.featureIds   = f.featureIds.join(',')
    if (f.locationCity)  query.locationCity  = f.locationCity
    if (f.vin)           query.vin           = f.vin
    if (f.doorsFrom)     query.doorsFrom     = String(f.doorsFrom)
    if (f.doorsTo)       query.doorsTo       = String(f.doorsTo)
    if (f.seatsFrom)     query.seatsFrom     = String(f.seatsFrom)
    if (f.seatsTo)       query.seatsTo       = String(f.seatsTo)
    if (f.emissionFrom)  query.emissionFrom  = String(f.emissionFrom)
    if (f.emissionTo)    query.emissionTo    = String(f.emissionTo)
    if (f.euroNorm)      query.euroNorm      = f.euroNorm
    if (f.hasFinancing !== null) query.hasFinancing = String(f.hasFinancing)
    if (f.originCountry)         query.originCountry = f.originCountry
    if (f.isLuxuryBrand !== null) query.isLuxuryBrand = String(f.isLuxuryBrand)
    if (f.era)                   query.era = f.era
    if (f.isSporty !== null)     query.isSporty = String(f.isSporty)
    if (f.sortBy)      query.sortBy      = f.sortBy
    if (p > 1)         query.page        = String(p)
    router.replace({ query })

    try {
        const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
            method: 'POST',
            body: buildSearchBody(p),
        })
        adverts.value = r?.items ?? []
        total.value   = r?.totalCount ?? 0
        frozenTotal.value = r?.totalCount ?? 0 // freeze for stable loadMore pagination
    } catch {
        adverts.value = []
        toastError('Nie udało się załadować ogłoszeń. Sprawdź połączenie i spróbuj ponownie.')
    } finally {
        loading.value = false
    }
}

// Pagination page-change (as opposed to "Załaduj więcej", which appends to the
// current scroll position) jumps to a new result set, so scroll back to the top
// instead of leaving the user looking at the middle of the previous page's results.
function goToPage(p: number) {
    load(p)
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadMore() {
    if (loadingMore.value || page.value >= totalPages.value) return
    loadingMore.value = true
    const nextPage = page.value + 1
    try {
        const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
            method: 'POST',
            body: buildSearchBody(nextPage),
        })
        adverts.value = [...adverts.value, ...(r?.items ?? [])]
        total.value   = r?.totalCount ?? 0
        // frozenTotal intentionally NOT updated here to keep page count stable
        page.value    = nextPage
    } catch {
        toastError('Nie udało się załadować kolejnych ogłoszeń.')
    } finally {
        loadingMore.value = false
    }
}

// ── Autocomplete ──────────────────────────────────────────────────────────────
type AcType = 'brand' | 'model' | 'feature'
const autocompleteItems = computed(() => {
    const q = f.textSearch.trim().toLowerCase()
    if (q.length < 2) return []
    const brandMatches = brands.value
        .filter(b => b.name.toLowerCase().includes(q))
        .slice(0, 3)
        .map(b => ({ type: 'brand' as AcType, id: b.id, name: b.name, sub: '' }))
    const modelMatches = models.value
        .filter(m => m.name.toLowerCase().includes(q))
        .slice(0, 2)
        .map(m => ({ type: 'model' as AcType, id: m.id, name: m.name, sub: '' }))
    const featureMatches = allFeatures.value
        .filter(feat => feat.name.toLowerCase().includes(q) && !f.featureIds.includes(feat.id))
        .slice(0, 3)
        .map(feat => ({ type: 'feature' as AcType, id: feat.id, name: feat.name, sub: feat.category?.name ?? '' }))
    return [...brandMatches, ...modelMatches, ...featureMatches].slice(0, 7)
})

function applyAutocomplete(item: { type: AcType; id: number; name: string }) {
    showSuggestions.value = false
    if (item.type === 'brand') {
        f.textSearch = ''
        f.brandId = item.id
        onBrandChange()  // handles model fetch then load(1) internally
        return
    } else if (item.type === 'model') {
        f.textSearch = ''
        f.modelId = item.id
    } else if (item.type === 'feature') {
        f.textSearch = ''
        if (!f.featureIds.includes(item.id)) f.featureIds.push(item.id)
    }
    load(1)
}

// Fetch favorites client-side only; also load category-specific brands if URL has categoryId
onMounted(async () => {
    fetchFavoriteIds().catch(() => {})
    if (f.categoryId) {
        try { dynamicBrands.value = await fetchBrandsByCategory(f.categoryId) } catch { dynamicBrands.value = null }
    }
    await loadCategoryScopedFilters(f.categoryId)
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
.page-header { padding: 48px 0 0; }

.page-title { font-size: 38px; font-weight: 900; color: $text; }
.page-sub { color: $text-muted; font-size: 15px; margin-top: 6px; }

// ── Filter panel ─────────────────────────────────────────────────────────────────────
.fp-wrap {
    padding: 20px 0 0;
}

.fp-panel {
    @include card($r-xl);
    padding: 0;
    overflow: hidden;
    border-color: $border;
}

// PRIMARY ROW
.fp-primary {
    display: flex;
    align-items: stretch;
    min-height: 64px;
    overflow-x: auto;

    @include respond-to(md) {
        flex-wrap: wrap;
        min-height: auto;
        overflow-x: visible;
    }
}

.fp-divider {
    width: 1px;
    background: $border;
    flex-shrink: 0;
    margin: 12px 0;

    @include respond-to(md) { display: none; }
}

.fp-field {
    flex: 1;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px 16px;
    gap: 4px;

    @include respond-to(md) {
        min-width: calc(50% - 1px);
        flex: none;
        border-bottom: 1px solid $border;

        &:nth-child(odd) { border-right: 1px solid $border; }
    }

    @include respond-to(sm) {
        min-width: 100%;
        border-right: none !important;
    }

    &--range {
        min-width: 180px;
        @include respond-to(md) { min-width: calc(50% - 1px); }
        @include respond-to(sm) { min-width: 100%; }
    }
}

.fp-label {
    font-size: 10px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.fp-select-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
}

.fp-field-icon { color: $red; flex-shrink: 0; }

.fp-select {
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    flex: 1;
    min-width: 0;

    option { background: #111; color: $text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.fp-input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
}

.fp-text-input {
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    flex: 1;
    min-width: 0;

    &::placeholder { color: $text-faint; }
}

.fp-range {
    display: flex;
    align-items: center;
    gap: 6px;
}

.fp-range-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-faint; }
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
    -moz-appearance: textfield;
}

.fp-range-sep { color: $text-dim; font-size: 13px; flex-shrink: 0; }

.fp-search-btn {
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
    transition: opacity 0.2s;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover { opacity: 0.88; }

    @include respond-to(md) {
        width: 100%;
        justify-content: center;
        padding: 14px;
        font-size: 15px;
    }
}

.fp-btn-count {
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 1px 8px;
    font-size: 12px;
}

// SECONDARY ROW
.fp-secondary {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-top: 1px solid $border;
    background: rgba(255,255,255,0.015);

    @include respond-to(sm) { flex-wrap: wrap; }
}

.fp-keyword-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.fp-kw-icon { color: $text-dim; flex-shrink: 0; }

.fp-keyword-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;

    &::placeholder { color: $text-faint; }
}

.fp-kw-clear {
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

.fp-secondary-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    @include respond-to(sm) { width: 100%; justify-content: flex-end; }
}

.fp-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;

    &:hover { border-color: $text-dim; color: $text; }

    &--active {
        background: rgba($red, 0.08);
        border-color: rgba($red, 0.3);
        color: $red;
    }
}

.fp-more-count {
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

// CHIPS
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

// EXPANDED FILTERS
.fp-expanded {
    border-top: 1px solid $border;
    padding: 20px 20px 0;
}

.fp-expand-enter-active,
.fp-expand-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform-origin: top;
}
.fp-expand-enter-from,
.fp-expand-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.fp-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px 24px;

    @include respond-to(lg) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.fp-group {
    &--wide {
        grid-column: 1 / -1;
    }
}

.fp-group-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;

    .v-icon { color: $red; }
}

.fp-expanded-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 20px 0;
    border-top: 1px solid $border;
    margin-top: 20px;
}

.fp-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 9px 16px;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { border-color: $red; color: $red; }
}

.fp-apply-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-sm;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// Reused filter option styles
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
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover { border-color: rgba($red, 0.3); color: $text; }
    &.active { background: rgba($red, 0.12); border-color: rgba($red, 0.4); color: $red; font-weight: 700; }
}

.btn-check-icon { color: $red; }

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

    &::before {
        content: '';
        position: absolute;
        inset: -10px;
    }

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

// ── Autocomplete dropdown ─────────────────────────────────────────────────────────────────────
.ac-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-md;
    z-index: 200;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.ac-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s;
    font-family: 'Inter', sans-serif;

    &:hover { background: rgba(255,255,255,0.05); }
    &:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.04); }
}

.ac-icon { color: $red; flex-shrink: 0; }

.ac-name { flex: 1; font-size: 13px; color: $text; }

.ac-type {
    font-size: 11px;
    color: $text-dim;
    background: rgba(255,255,255,0.06);
    padding: 2px 7px;
    border-radius: 10px;
}

// ── Layout ──────────────────────────────────────────────────────────────────────────────
.main-layout {
    padding-top: 24px;
    padding-bottom: 80px;
}

.content { min-width: 0; }

.results-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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
</style>
