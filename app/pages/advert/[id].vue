<template>
    <div class="advert-page">

        <!-- Top bar -->
        <div class="advert-topbar">
            <div class="container topbar-inner">
                <NuxtLink to="/adverts" class="back-link">
                    <v-icon icon="mdi-chevron-left" size="18" />
                    Wróć do wyników
                </NuxtLink>
                <div class="topbar-actions">
                    <button class="icon-action" @click="toggleFav">
                        <v-icon :icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'" size="18" :class="{ 'heart-active': isFav }" />
                        Ulubione
                    </button>
                    <button class="icon-action">
                        <v-icon icon="mdi-share-variant-outline" size="18" />
                        Udostępnij
                    </button>
                    <button class="btn-contact-top">
                        <v-icon icon="mdi-phone-outline" size="16" />
                        Zadzwoń / Napisz
                    </button>
                </div>
            </div>
        </div>

        <div class="container advert-body">
            <div class="left-col">

                <!-- Hero image -->
                <div class="hero-img-wrap">
                    <div class="hero-badges-top">
                        <span class="badge-verified">
                            <v-icon icon="mdi-check-circle" size="13" />
                            VERIFIED
                        </span>
                        <span v-if="advert?.vin" class="badge-vin">
                            <v-icon icon="mdi-shield-check-outline" size="13" />
                            VIN zweryfikowany
                        </span>
                    </div>
                    <img :src="mainImg" :alt="advert?.title ?? ''" class="hero-img" />
                    <div class="img-counter">{{ activeImg + 1 }} / {{ allImages.length }}</div>
                    <button class="fav-hero-btn" :class="{ active: isFav }" @click="toggleFav">
                        <v-icon :icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
                    </button>
                </div>

                <!-- Advert title block -->
                <div class="title-block">
                    <div class="title-left">
                        <div class="car-brand">{{ advert?.brand?.name ?? '' }}</div>
                        <h1 class="car-name">{{ advert?.model?.name ?? advert?.title ?? '' }}</h1>
                        <div class="car-sub">
                            <span v-if="advert?.year">{{ advert.year }}</span>
                            <template v-if="advert?.fuelType">
                                <span class="dot">•</span>
                                <span>{{ advert.fuelType.name }}</span>
                            </template>
                            <template v-if="advert?.gearbox">
                                <span class="dot">•</span>
                                <span>{{ advert.gearbox.name }}</span>
                            </template>
                        </div>
                        <div class="tag-row">
                            <span class="tag-item">
                                <v-icon icon="mdi-shield-check-outline" size="14" />
                                Dealer zweryfikowany
                            </span>
                            <span class="tag-item">
                                <v-icon icon="mdi-car-emergency" size="14" />
                                Bezwypadkowy
                            </span>
                        </div>
                    </div>
                    <div class="title-right">
                        <div class="price">{{ advert?.price ? Number(advert.price).toLocaleString('pl') + ' zł' : '—' }}</div>
                        <div class="price-sub">Do negocjacji</div>
                        <div class="location" v-if="advert?.city">
                            <v-icon icon="mdi-map-marker-outline" size="14" />
                            {{ advert.city }}<template v-if="advert?.region">, {{ advert.region }}</template>
                        </div>
                    </div>
                </div>

                <!-- Stats bar -->
                <div class="stats-strip">
                    <div class="stat-cell">
                        <v-icon icon="mdi-speedometer" size="18" class="sc-icon" />
                        <div>
                            <div class="sc-label">Przebieg</div>
                            <div class="sc-val">{{ advert?.mileage ? Number(advert.mileage).toLocaleString('pl') + ' km' : '—' }}</div>
                        </div>
                    </div>
                    <div class="stat-cell">
                        <v-icon icon="mdi-lightning-bolt" size="18" class="sc-icon" />
                        <div>
                            <div class="sc-label">Moc</div>
                            <div class="sc-val">{{ advert?.engineVersion?.horsepower ? advert.engineVersion.horsepower + ' KM' : '—' }}</div>
                        </div>
                    </div>
                    <div class="stat-cell">
                        <v-icon icon="mdi-gas-station-outline" size="18" class="sc-icon" />
                        <div>
                            <div class="sc-label">Paliwo</div>
                            <div class="sc-val">{{ advert?.fuelType?.name ?? '—' }}</div>
                        </div>
                    </div>
                    <div class="stat-cell">
                        <v-icon icon="mdi-cog-outline" size="18" class="sc-icon" />
                        <div>
                            <div class="sc-label">Skrzynia</div>
                            <div class="sc-val">{{ advert?.gearbox?.name ?? '—' }}</div>
                        </div>
                    </div>
                    <div class="stat-cell">
                        <v-icon icon="mdi-calendar-outline" size="18" class="sc-icon" />
                        <div>
                            <div class="sc-label">Rok produkcji</div>
                            <div class="sc-val">{{ advert?.year ?? '—' }}</div>
                        </div>
                    </div>
                </div>

                <!-- Score + AI -->
                <div class="two-col-cards">

                    <!-- Score card -->
                    <div class="score-card">
                        <div class="card-title">Ocena ogłoszenia</div>
                        <div class="score-body">
                            <div class="score-circle-wrap">
                                <svg viewBox="0 0 120 120" width="110" height="110">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a1a" stroke-width="9" />
                                    <circle cx="60" cy="60" r="50" fill="none"
                                        stroke="#8B0D1D"
                                        stroke-width="9"
                                        stroke-linecap="round"
                                        :stroke-dasharray="`${(92 / 100) * 314.2} 314.2`"
                                        transform="rotate(-90 60 60)" />
                                </svg>
                                <div class="score-num-wrap">
                                    <span class="score-big">92</span>
                                    <span class="score-denom">/100</span>
                                </div>
                            </div>
                            <div class="score-checks">
                                <div class="sc-check" v-for="c in scoreChecks" :key="c">
                                    <v-icon icon="mdi-check-circle" size="15" class="check-icon" />
                                    {{ c }}
                                </div>
                            </div>
                        </div>
                        <button class="score-link-btn">Jak działa ocena? ›</button>
                    </div>

                    <!-- AI card -->
                    <div class="ai-card">
                        <div class="ai-header">
                            <span class="ai-logo">CARI<span>ZO</span></span>
                            <span class="ai-badge">Intelligence AI</span>
                        </div>
                        <div class="ai-verdict">
                            <v-icon icon="mdi-trending-down" size="18" class="ai-icon-good" />
                            Bardzo dobra cena
                        </div>
                        <p class="ai-desc">Cena tego auta jest o 6% niższa od średniej rynkowej dla podobnych modeli.</p>
                        <div class="price-bars">
                            <div class="price-bar-row">
                                <span class="pb-label">Średnia rynkowa</span>
                                <span class="pb-price">202 000 zł</span>
                            </div>
                            <div class="bar-track">
                                <div class="bar-fill bar-avg" style="width: 100%" />
                            </div>
                            <div class="price-bar-row" style="margin-top: 10px">
                                <span class="pb-label">Cena tego auta</span>
                                <span class="pb-price pb-this">{{ advert?.price ? Number(advert.price).toLocaleString('pl') + ' zł' : '—' }}</span>
                            </div>
                            <div class="bar-track">
                                <div class="bar-fill bar-this" style="width: 94%" />
                            </div>
                        </div>
                        <button class="ai-btn">Zobacz analizę rynku</button>
                    </div>
                </div>

                <!-- Photo gallery -->
                <div class="gallery-section">
                    <div class="section-head">
                        <h2 class="section-heading">Zdjęcia ({{ allImages.length }})</h2>
                        <button class="see-all-link">Zobacz wszystkie</button>
                    </div>
                    <div class="gallery-grid">
                        <div class="gallery-main" @click="activeImg = 0">
                            <img :src="allImages[0]?.url ?? placeholder" alt="" />
                            <button class="expand-btn">
                                <v-icon icon="mdi-arrow-expand" size="18" />
                            </button>
                        </div>
                        <div class="gallery-thumbs">
                            <div v-for="(img, i) in allImages.slice(1, 4)" :key="i"
                                class="gallery-thumb"
                                @click="activeImg = i + 1">
                                <img :src="img.url" alt="" />
                                <div v-if="i === 2 && allImages.length > 4" class="thumb-overlay">
                                    +{{ allImages.length - 4 }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-wrap">
                    <div class="tabs-nav">
                        <button v-for="tab in tabs" :key="tab"
                            class="tab-btn"
                            :class="{ 'tab-active': activeTab === tab }"
                            @click="activeTab = tab">
                            {{ tab }}
                        </button>
                    </div>

                    <!-- Opis -->
                    <div v-if="activeTab === 'Opis'" class="tab-content">
                        <h3 class="desc-title">{{ advert?.title }}</h3>
                        <p class="desc-text" :class="{ clamped: !showFullDesc }">
                            {{ advert?.description ?? 'Brak opisu.' }}
                        </p>
                        <div v-if="(advert?.description?.length ?? 0) > 300" class="desc-toggle">
                            <button @click="showFullDesc = !showFullDesc" class="read-more-btn">
                                {{ showFullDesc ? 'Zwiń opis' : 'Czytaj więcej' }}
                                <v-icon :icon="showFullDesc ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
                            </button>
                        </div>
                        <div v-if="advert?.features?.length" class="features-section">
                            <div class="feat-cols">
                                <div v-for="f in advert.features" :key="f.id" class="feat-row">
                                    <v-icon icon="mdi-check-circle-outline" size="15" class="feat-icon" />
                                    {{ f.name }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Wyposażenie -->
                    <div v-else-if="activeTab === 'Wyposażenie'" class="tab-content">
                        <div v-if="Object.keys(featureGroups).length">
                            <div v-for="(group, cat) in featureGroups" :key="cat" class="eq-group">
                                <div class="eq-group-title">{{ cat }}</div>
                                <div class="eq-grid">
                                    <div v-for="f in group" :key="f.id" class="eq-item">
                                        <v-icon icon="mdi-check-circle-outline" size="15" class="feat-icon" />
                                        {{ f.name }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p v-else class="empty-tab">Brak danych o wyposażeniu.</p>
                    </div>

                    <!-- Historia -->
                    <div v-else-if="activeTab === 'Historia pojazdu'" class="tab-content">
                        <div class="history-list">
                            <div class="history-item hi-good">
                                <div class="hi-icon"><v-icon icon="mdi-shield-check" size="18" /></div>
                                <div><div class="hi-title">VIN zweryfikowany</div><div class="hi-sub">Wszystko się zgadza</div></div>
                            </div>
                            <div class="history-item hi-good">
                                <div class="hi-icon"><v-icon icon="mdi-car-emergency" size="18" /></div>
                                <div><div class="hi-title">Bezwypadkowy</div><div class="hi-sub">Brak szkód w bazach</div></div>
                            </div>
                            <div class="history-item hi-good">
                                <div class="hi-icon"><v-icon icon="mdi-wrench-outline" size="18" /></div>
                                <div><div class="hi-title">Serwisowany w ASO</div><div class="hi-sub">Pełna historia serwisowa</div></div>
                            </div>
                            <div class="history-item hi-neutral">
                                <div class="hi-icon"><v-icon icon="mdi-account-outline" size="18" /></div>
                                <div><div class="hi-title">Liczba właścicieli</div><div class="hi-sub">2 właścicieli</div></div>
                            </div>
                        </div>
                        <button class="outline-btn" style="margin-top: 18px">Zobacz pełną historię</button>
                    </div>

                    <!-- Finansowanie -->
                    <div v-else-if="activeTab === 'Finansowanie'" class="tab-content">
                        <div class="finance-box">
                            <div class="finance-label">Rata już od</div>
                            <div class="finance-price">2 399 zł <span class="finance-mo">/ mies.</span></div>
                            <button class="btn-red">Sprawdź ofertę finansowania</button>
                        </div>
                    </div>

                    <!-- Podobne -->
                    <div v-else-if="activeTab === 'Podobne oferty'" class="tab-content">
                        <p class="empty-tab">Ładowanie podobnych ofert...</p>
                    </div>
                </div>

                <!-- Similar listings -->
                <div class="similar-section">
                    <div class="section-head">
                        <h2 class="section-heading">Podobne ogłoszenia</h2>
                        <NuxtLink to="/adverts" class="see-all-link-nuxt">Zobacz wszystkie</NuxtLink>
                    </div>
                    <div class="similar-grid">
                        <NuxtLink v-for="a in similar" :key="a.id" :to="`/advert/${a.id}`" class="sim-card">
                            <div class="sim-img-wrap">
                                <span class="sim-verified">VERIFIED</span>
                                <img :src="a.images?.find(i => i.isMain)?.url ?? placeholder" :alt="a.title" />
                                <button class="sim-fav" @click.prevent="toggleFavorite(a.id)">
                                    <v-icon :icon="isFavorite(a.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="17" />
                                </button>
                            </div>
                            <div class="sim-body">
                                <div class="sim-title">{{ a.brand?.name }} {{ a.model?.name }}</div>
                                <div class="sim-meta">{{ a.year }} • {{ Number(a.mileage).toLocaleString('pl') }} km</div>
                                <div class="sim-price">{{ Number(a.price).toLocaleString('pl') }} zł</div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

            </div>

            <!-- Right sidebar -->
            <aside class="right-sidebar">

                <!-- Seller -->
                <div class="sidebar-card seller-card">
                    <div class="card-title">Sprzedający</div>
                    <div class="seller-info">
                        <div class="seller-avatar">
                            <v-icon icon="mdi-account-circle" size="42" />
                        </div>
                        <div class="seller-details">
                            <div class="seller-name">
                                Premium Motors
                                <v-icon icon="mdi-check-decagram" size="14" class="dealer-badge" />
                            </div>
                            <div class="seller-role">Dealer zweryfikowany</div>
                            <div class="seller-stars">
                                <v-icon v-for="n in 5" :key="n" icon="mdi-star" size="13" class="star" />
                                <span class="seller-rating">4.9</span>
                                <span class="seller-reviews">(128 opinii)</span>
                            </div>
                        </div>
                    </div>
                    <div class="seller-stats">
                        <div class="ss-item">
                            <div class="ss-val">128</div>
                            <div class="ss-label">Sprzedanych aut</div>
                        </div>
                        <div class="ss-item">
                            <div class="ss-val">98%</div>
                            <div class="ss-label">Szybkość odpowiedzi</div>
                        </div>
                        <div class="ss-item">
                            <div class="ss-val">15 min</div>
                            <div class="ss-label">Średni czas odp.</div>
                        </div>
                    </div>
                    <button class="outline-btn w-full">Zobacz profil sprzedawcy</button>
                </div>

                <!-- Contact -->
                <div class="sidebar-card contact-card">
                    <div class="card-title">Skontaktuj się ze sprzedającym</div>
                    <button class="btn-red w-full">
                        <v-icon icon="mdi-phone-outline" size="17" />
                        Zadzwoń
                    </button>
                    <button class="outline-btn w-full">
                        <v-icon icon="mdi-message-outline" size="17" />
                        Napisz wiadomość
                    </button>
                    <button class="outline-btn w-full">
                        <v-icon icon="mdi-calendar-outline" size="17" />
                        Umów oględziny
                    </button>
                    <button class="outline-btn w-full">
                        <v-icon icon="mdi-bookmark-outline" size="17" />
                        Zarezerwuj auto
                    </button>
                    <div class="secure-note">
                        <v-icon icon="mdi-shield-outline" size="16" class="secure-icon" />
                        <span>Bezpieczna transakcja z CARI<span class="red-text">ZO</span><br><small>Twoje dane są chronione.</small></span>
                    </div>
                </div>

                <!-- History sidebar -->
                <div class="sidebar-card">
                    <div class="card-title">Historia pojazdu</div>
                    <div class="history-list">
                        <div class="history-item hi-good">
                            <div class="hi-icon"><v-icon icon="mdi-shield-check" size="16" /></div>
                            <div><div class="hi-title">VIN zweryfikowany</div><div class="hi-sub">Wszystko się zgadza</div></div>
                        </div>
                        <div class="history-item hi-good">
                            <div class="hi-icon"><v-icon icon="mdi-car-emergency" size="16" /></div>
                            <div><div class="hi-title">Bezwypadkowy</div><div class="hi-sub">Brak szkód w bazach</div></div>
                        </div>
                        <div class="history-item hi-good">
                            <div class="hi-icon"><v-icon icon="mdi-wrench-outline" size="16" /></div>
                            <div><div class="hi-title">Serwisowany w ASO</div><div class="hi-sub">Pełna historia serwisowa</div></div>
                        </div>
                        <div class="history-item hi-neutral">
                            <div class="hi-icon"><v-icon icon="mdi-account-outline" size="16" /></div>
                            <div><div class="hi-title">Liczba właścicieli</div><div class="hi-sub">2 właścicieli</div></div>
                        </div>
                    </div>
                    <button class="outline-btn w-full">Zobacz pełną historię</button>
                </div>

                <!-- Location -->
                <div class="sidebar-card">
                    <div class="card-title">Lokalizacja pojazdu</div>
                    <div v-if="advert?.city" class="location-addr">
                        <div class="loc-street">ul. Puławska 123</div>
                        <div class="loc-city">02-707 {{ advert.city }}</div>
                    </div>
                    <div class="map-placeholder">
                        <v-icon icon="mdi-map-marker" size="28" class="map-pin" />
                    </div>
                    <button class="outline-btn w-full">Zobacz na mapie</button>
                </div>

                <!-- Financing -->
                <div class="sidebar-card finance-sidebar">
                    <div class="card-title">Finansowanie</div>
                    <div class="finance-row">
                        <div>
                            <div class="finance-label-sm">Rata już od</div>
                            <div class="finance-price-sm">2 399 zł <span class="mo">/mies.</span></div>
                        </div>
                        <button class="btn-red-sm">Sprawdź ofertę</button>
                    </div>
                </div>

            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, Feature, PagedResult } from '~/types'

const route = useRoute()
const id = Number(route.params.id)
const config = useRuntimeConfig()
const base = config.public.apiBase

const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites()

const advert = ref<CarAdvert | null>(null)
const similar = ref<CarAdvert[]>([])
const activeImg = ref(0)
const activeTab = ref('Opis')
const showFullDesc = ref(false)
const isFav = ref(false)

const placeholder = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'

const tabs = ['Opis', 'Wyposażenie', 'Historia pojazdu', 'Finansowanie', 'Podobne oferty']

const scoreChecks = [
    'Zweryfikowany VIN',
    'Pełna historia pojazdu',
    'Wysokiej jakości zdjęcia',
    'Szybki czas odpowiedzi',
]

const allImages = computed(() => {
    if (!advert.value?.images?.length) return [{ id: 0, url: placeholder, isMain: true }]
    return advert.value.images
})

const mainImg = computed(() => allImages.value[activeImg.value]?.url ?? placeholder)

const featureGroups = computed(() => {
    if (!advert.value?.features?.length) return {}
    const g: Record<string, Feature[]> = {}
    for (const f of advert.value.features) {
        const cat = f.category?.name ?? 'Inne';
        (g[cat] ??= []).push(f)
    }
    return g
})

function toggleFav() {
    if (!isLoggedIn.value) return
    isFav.value = !isFav.value
    toggleFavorite(id)
}

onMounted(async () => {
    try {
        advert.value = await $fetch<CarAdvert>(`${base}api/Advert/${id}`)
        isFav.value = isFavorite(id)
    } catch {}
    try {
        const r = await $fetch<PagedResult<CarAdvert>>(`${base}api/Advert?page=1&pageSize=5`)
        similar.value = r.items.filter(a => a.id !== id).slice(0, 4)
    } catch {}
})
</script>

<style lang="scss" scoped>
.advert-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }

// ── Top bar ───────────────────────────────────────────────────────────────────
.advert-topbar {
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid $border;
    position: sticky;
    top: $nav-height;
    z-index: 50;
}

.topbar-inner {
    @include container;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.back-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.topbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.icon-action {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: $r-sm;
    transition: color 0.2s;
    &:hover { color: $text; }
    .heart-active { color: $red; }
}

.btn-contact-top {
    display: flex;
    align-items: center;
    gap: 6px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 18px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

// ── Layout ────────────────────────────────────────────────────────────────────
.container { @include container; }

.advert-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 28px;
    padding-top: 24px;
    padding-bottom: 60px;
    align-items: start;

    @include respond-to(md) { grid-template-columns: 1fr; }
}

.left-col { min-width: 0; }

// ── Hero image ────────────────────────────────────────────────────────────────
.hero-img-wrap {
    position: relative;
    border-radius: $r-lg;
    overflow: hidden;
    background: #0a0a0a;
}

.hero-badges-top {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 5;
    display: flex;
    gap: 8px;
}

.badge-verified {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #2d7a3a;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.5px;
}

.badge-vin {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    color: $text-muted;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid $border;
}

.hero-img {
    width: 100%;
    height: 460px;
    object-fit: cover;
    display: block;

    @include respond-to(md) { height: 300px; }
}

.img-counter {
    position: absolute;
    bottom: 14px;
    right: 56px;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    color: $text-muted;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
}

.fav-hero-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    &:hover { background: rgba(0,0,0,0.9); }
    &.active { color: $red; }
}

// ── Title block ───────────────────────────────────────────────────────────────
.title-block {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 0 16px;
    border-bottom: 1px solid $border;

    @include respond-to(sm) { flex-direction: column; }
}

.car-brand {
    font-size: 13px;
    font-weight: 600;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
}

.car-name {
    font-size: 34px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
    margin-bottom: 8px;

    @include respond-to(sm) { font-size: 26px; }
}

.car-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    color: $text-dim;
    font-size: 14px;
    margin-bottom: 14px;
    .dot { color: $border; }
}

.tag-row { display: flex; gap: 8px; flex-wrap: wrap; }

.tag-item {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
}

.title-right { text-align: right; flex-shrink: 0; }

.price {
    font-size: 36px;
    font-weight: 900;
    color: $red;
    line-height: 1.1;
}

.price-sub {
    font-size: 12px;
    color: $text-dim;
    margin-top: 2px;
    margin-bottom: 8px;
}

.location {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    color: $text-dim;
    font-size: 13px;
}

// ── Stats strip ───────────────────────────────────────────────────────────────
.stats-strip {
    display: flex;
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    margin: 18px 0;
    overflow: hidden;
    overflow-x: auto;
}

.stat-cell {
    flex: 1;
    min-width: 100px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px;
    border-right: 1px solid $border;
    &:last-child { border-right: none; }
}

.sc-icon { color: $red; flex-shrink: 0; }
.sc-label { font-size: 11px; color: $text-dim; margin-bottom: 3px; }
.sc-val { font-size: 14px; font-weight: 700; color: $text; }

// ── Score + AI ────────────────────────────────────────────────────────────────
.two-col-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 22px;

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.score-card, .ai-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 22px;
}

.card-title {
    font-size: 12px;
    font-weight: 700;
    color: $text;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.score-body { display: flex; align-items: center; gap: 18px; }

.score-circle-wrap {
    position: relative;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.score-num-wrap { position: absolute; text-align: center; }
.score-big { display: block; font-size: 28px; font-weight: 900; color: $text; line-height: 1; }
.score-denom { display: block; font-size: 11px; color: $text-dim; }

.score-checks { flex: 1; }

.sc-check {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 7px;
}

.check-icon { color: #2d7a3a; }

.score-link-btn {
    background: transparent;
    border: none;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    margin-top: 14px;
    &:hover { opacity: 0.8; }
}

.ai-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }

.ai-logo {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 3px;
    color: $text;
    span { color: $red; }
}

.ai-badge {
    font-size: 10px;
    font-weight: 700;
    color: $red;
    background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.25);
    border-radius: 6px;
    padding: 2px 8px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.ai-verdict {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 16px;
    font-weight: 800;
    color: $text;
    margin-bottom: 8px;
}

.ai-icon-good { color: #4caf50; }
.ai-desc { font-size: 12px; color: $text-dim; line-height: 1.6; margin-bottom: 14px; }

.price-bars { margin-bottom: 14px; }

.price-bar-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
}

.pb-label { font-size: 11px; color: $text-dim; }
.pb-price { font-size: 12px; font-weight: 700; color: $text-muted; }
.pb-this { color: $red; }

.bar-track { height: 5px; background: #1a1a1a; border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 3px; }
.bar-avg { background: $text-dark; }
.bar-this { background: $red; }

.ai-btn {
    width: 100%;
    background: transparent;
    border: 1px solid rgba($red, 0.4);
    border-radius: $r-sm;
    color: $red;
    font-size: 12px;
    font-weight: 600;
    padding: 9px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.2s;
    &:hover { background: rgba($red, 0.08); }
}

// ── Gallery ───────────────────────────────────────────────────────────────────
.gallery-section { margin-bottom: 22px; }

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.section-heading { font-size: 18px; font-weight: 700; color: $text; }

.see-all-link {
    background: transparent;
    border: none;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    &:hover { opacity: 0.8; }
}

.see-all-link-nuxt {
    color: $red;
    font-size: 13px;
    font-weight: 600;
    &:hover { opacity: 0.8; }
}

.gallery-grid {
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: 8px;
    border-radius: $r-lg;
    overflow: hidden;
}

.gallery-main {
    position: relative;
    cursor: pointer;
    img { width: 100%; height: 320px; object-fit: cover; display: block; }
}

.expand-btn {
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(0,0,0,0.7);
    border: none;
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.gallery-thumbs {
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    gap: 8px;
}

.gallery-thumb {
    position: relative;
    cursor: pointer;
    img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 100px; }
}

.thumb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    color: $text;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
.tabs-wrap {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    margin-bottom: 22px;
}

.tabs-nav {
    display: flex;
    border-bottom: 1px solid $border;
    overflow-x: auto;
}

.tab-btn {
    flex-shrink: 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    padding: 14px 20px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: -1px;

    &:hover { color: $text-muted; }
    &.tab-active { color: $text; border-bottom-color: $red; font-weight: 600; }
}

.tab-content { padding: 24px; }

.desc-title { font-size: 18px; font-weight: 800; color: $text; margin-bottom: 12px; }

.desc-text {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.8;
    white-space: pre-line;
    &.clamped {
        display: -webkit-box;
        -webkit-line-clamp: 5;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}

.desc-toggle { margin-top: 12px; }

.read-more-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
}

.features-section { margin-top: 22px; }

.feat-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.feat-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: $text-muted; }
.feat-icon { color: $red; flex-shrink: 0; }

.eq-group { margin-bottom: 22px; }

.eq-group-title {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.eq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 7px;
}

.eq-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: $text-muted; }

.history-list { display: flex; flex-direction: column; gap: 12px; }

.history-item { display: flex; align-items: flex-start; gap: 12px; }

.hi-icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hi-good .hi-icon { background: rgba(45,122,58,0.15); border: 1px solid rgba(45,122,58,0.3); color: #4caf50; }
.hi-neutral .hi-icon { background: rgba(255,255,255,0.04); border: 1px solid $border; color: $text-dim; }

.hi-title { font-size: 13px; font-weight: 600; color: $text; margin-bottom: 2px; }
.hi-sub { font-size: 12px; color: $text-dim; }

.finance-box {
    background: rgba($red, 0.06);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    padding: 24px;
    text-align: center;
}

.finance-label { font-size: 13px; color: $text-dim; margin-bottom: 6px; }

.finance-price {
    font-size: 36px;
    font-weight: 900;
    color: $red;
    margin-bottom: 18px;
    .finance-mo { font-size: 16px; font-weight: 500; color: $text-dim; }
}

.empty-tab { color: $text-dim; font-size: 14px; }

// ── Shared buttons ────────────────────────────────────────────────────────────
.btn-red {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 13px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &.w-full { width: 100%; }
}

.outline-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    padding: 11px 18px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
    &.w-full { width: 100%; }
}

// ── Similar ───────────────────────────────────────────────────────────────────
.similar-section { margin-top: 8px; }

.similar-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
}

.sim-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
    color: $text;
    display: block;
    transition: transform 0.25s, border-color 0.25s;
    &:hover { transform: translateY(-4px); border-color: rgba($red, 0.3); }
}

.sim-img-wrap {
    position: relative;
    img { width: 100%; height: 130px; object-fit: cover; display: block; }
}

.sim-verified {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #2d7a3a;
    color: white;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.5px;
}

.sim-fav {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0,0,0,0.65);
    border: none;
    color: $text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: $red; }
}

.sim-body { padding: 12px; }
.sim-title { font-size: 14px; font-weight: 700; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sim-meta { font-size: 11px; color: $text-dim; margin-bottom: 6px; }
.sim-price { font-size: 16px; font-weight: 800; color: $red; }

// ── Right sidebar ─────────────────────────────────────────────────────────────
.right-sidebar {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: calc(#{$nav-height} + 52px + 20px);

    @include respond-to(md) { position: static; }
}

.sidebar-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.seller-info { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.seller-avatar { color: $text-dim; }

.seller-name {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 700;
    color: $text;
}

.dealer-badge { color: #4caf50; }
.seller-role { font-size: 11px; color: $text-dim; margin-top: 2px; }

.seller-stars { display: flex; align-items: center; gap: 2px; margin-top: 4px; }
.star { color: #f5a623; }
.seller-rating { font-size: 12px; font-weight: 700; color: $text; margin-left: 4px; }
.seller-reviews { font-size: 11px; color: $text-dim; margin-left: 2px; }

.seller-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 10px;
    margin: 2px 0;
}

.ss-item { text-align: center; }
.ss-val { font-size: 15px; font-weight: 800; color: $text; }
.ss-label { font-size: 10px; color: $text-dark; line-height: 1.3; margin-top: 2px; }

.contact-card { gap: 8px; }

.secure-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 10px 12px;
    font-size: 12px;
    color: $text-dim;
    margin-top: 4px;
    line-height: 1.5;
}

.secure-icon { color: $text-dark; flex-shrink: 0; margin-top: 1px; }
.red-text { color: $red; }

.location-addr {
    .loc-street { font-size: 13px; color: $text-muted; }
    .loc-city { font-size: 12px; color: $text-dim; margin-top: 2px; }
}

.map-placeholder {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.map-pin { color: $red; }

.finance-sidebar { }

.finance-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.finance-label-sm { font-size: 11px; color: $text-dim; margin-bottom: 3px; }

.finance-price-sm {
    font-size: 22px;
    font-weight: 900;
    color: $red;
    .mo { font-size: 12px; font-weight: 500; color: $text-dim; }
}

.btn-red-sm {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 10px 14px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}
</style>
