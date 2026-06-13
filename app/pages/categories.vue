<template>
    <div class="cats-page">

        <!-- Hero -->
        <section class="cats-hero">
            <div class="container hero-inner">
                <div class="hero-text">
                    <div class="hero-eyebrow">KATEGORIE</div>
                    <h1 class="hero-title">
                        Znajdź auto idealne<br>
                        <span>dla siebie</span>
                    </h1>
                    <p class="hero-sub">
                        Przeglądaj tysiące ogłoszeń w podziale na kategorie,<br>
                        które Cię interesują.
                    </p>
                </div>
                <div class="hero-img-wrap">
                    <img
                        src="/hero-car.jpg"
                        alt=""
                        class="hero-car-img"
                    />
                    <div class="hero-img-fade" />
                </div>
            </div>
        </section>

        <!-- Search + sort -->
        <div class="search-bar-wrap">
            <div class="container search-inner">
                <div class="search-box">
                    <v-icon icon="mdi-magnify" size="20" class="s-icon" />
                    <input
                        v-model="searchText"
                        class="s-input"
                        placeholder="Szukaj kategorii, np. SUV, BMW, Diesel..."
                    />
                    <button class="s-btn">
                        <v-icon icon="mdi-magnify" size="18" />
                    </button>
                </div>
                <div class="sort-wrap">
                    <span class="sort-label">Sortuj:</span>
                    <button class="sort-btn" @click="sortOpen = !sortOpen">
                        {{ sortLabel }}
                        <v-icon icon="mdi-chevron-down" size="16" />
                    </button>
                    <div v-if="sortOpen" class="sort-dropdown">
                        <button v-for="opt in sortOptions" :key="opt.value"
                            class="sort-opt"
                            :class="{ active: sortBy === opt.value }"
                            @click="sortBy = opt.value; sortOpen = false">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Grid -->
        <div class="grid-section">
            <div class="container">
                <div class="cats-grid">
                    <NuxtLink
                        v-for="cat in filtered"
                        :key="cat.slug"
                        :to="`/adverts?categoryId=${cat.id}`"
                        class="cat-card"
                    >
                        <img
                            :src="catImages[cat.slug] ?? fallbackImg"
                            :alt="cat.name"
                            class="cat-bg-img"
                        />
                        <div class="cat-gradient" />
                        <div class="cat-top">
                            <div class="cat-icon-wrap">
                                <v-icon :icon="cat.iconName ?? 'mdi-car-outline'" size="20" />
                            </div>
                        </div>
                        <div class="cat-bottom">
                            <div class="cat-bottom-left">
                                <div class="cat-name">{{ cat.name }}</div>
                                <div class="cat-count">{{ cat.advertCount.toLocaleString('pl') }} ogłoszeń</div>
                            </div>
                            <div class="cat-arrow">
                                <v-icon icon="mdi-arrow-right" size="16" />
                            </div>
                        </div>
                    </NuxtLink>
                </div>

                <div v-if="!filtered.length && !loading" class="empty-state">
                    <v-icon icon="mdi-magnify" size="40" class="empty-icon" />
                    <p>Nie znaleziono kategorii pasujących do "<strong>{{ searchText }}</strong>"</p>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import type { CategoryWithCount } from '~/types'

const config = useRuntimeConfig()
useHead({
    title: 'Kategorie — CARIZO',
    meta: [
        { name: 'description', content: 'Przeglądaj ogłoszenia motoryzacyjne na CARIZO według kategorii: auta osobowe, SUV, motocykle, ciężarowe, części i więcej.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${config.public.siteUrl}/categories` },
        { property: 'og:title', content: 'Kategorie — CARIZO' },
        { property: 'og:description', content: 'Przeglądaj ogłoszenia motoryzacyjne na CARIZO według kategorii.' },
        { property: 'og:image', content: `${config.public.siteUrl}/hero-car.jpg` },
        { property: 'og:site_name', content: 'CARIZO' },
        { name: 'twitter:card', content: 'summary_large_image' },
    ],
    link: [{ rel: 'canonical', href: `${config.public.siteUrl}/categories` }]
})

const { fetchCategories } = useCategories()
const categories = ref<CategoryWithCount[]>([])
const loading = ref(true)
const searchText = ref('')
const sortBy = ref('popular')
const sortOpen = ref(false)

const sortOptions = [
    { label: 'Popularne', value: 'popular' },
    { label: 'Najwięcej ogłoszeń', value: 'count_desc' },
    { label: 'Najmniej ogłoszeń', value: 'count_asc' },
    { label: 'Alfabetycznie', value: 'alpha' },
]

const sortLabel = computed(() => sortOptions.find(o => o.value === sortBy.value)?.label ?? 'Popularne')

const fallbackImg = '/categories/auta-osobowe.jpg'

const catImages: Record<string, string> = {
    'auta-osobowe':         '/categories/auta-osobowe.jpg',
    'suv-crossovery':       '/categories/auta-osobowe.jpg',
    'sportowe':             '/categories/auta-osobowe.jpg',
    'rodzinne':             '/categories/auta-osobowe.jpg',
    'miejskie':             '/categories/auta-osobowe.jpg',
    'dostawcze':            '/categories/dostawcze.jpg',
    'elektryczne':          '/categories/auta-osobowe.jpg',
    'hybrydowe':            '/categories/auta-osobowe.jpg',
    'zabytkowe':            '/categories/auta-osobowe.jpg',
    'motocykle':            '/categories/motocykle.jpg',
    'ciezarowe':            '/categories/ciezarowe.jpg',
    'przyczepy':            '/categories/przyczepy.jpg',
    'rolnicze':             '/categories/rolnicze.jpg',
    'budowlane':            '/categories/rolnicze.jpg',
    'czesci':               '/categories/czesci.jpg',
    'inne':                 '/categories/auta-osobowe.jpg',
}

const filtered = computed(() => {
    let list = [...categories.value]

    if (searchText.value.trim()) {
        const q = searchText.value.toLowerCase()
        list = list.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    }

    if (sortBy.value === 'count_desc') list.sort((a, b) => b.advertCount - a.advertCount)
    else if (sortBy.value === 'count_asc') list.sort((a, b) => a.advertCount - b.advertCount)
    else if (sortBy.value === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name, 'pl'))

    return list
})

onMounted(async () => {
    try {
        categories.value = await fetchCategories()
    } finally {
        loading.value = false
    }
})
</script>

<style lang="scss" scoped>
.cats-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
}

.container { @include container; }

// ── Hero ──────────────────────────────────────────────────────────────────────
.cats-hero {
    background: $bg;
    border-bottom: 1px solid $border;
    overflow: hidden;
}

.hero-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 300px;
    position: relative;
    gap: 0;
    padding-top: 52px;
    padding-bottom: 52px;
}

.hero-text {
    position: relative;
    z-index: 2;
    max-width: 520px;
    flex-shrink: 0;
}

.hero-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 4px;
    color: $red;
    margin-bottom: 18px;
}

.hero-title {
    font-size: 52px;
    font-weight: 900;
    color: $text;
    line-height: 1.08;
    margin-bottom: 18px;

    span { color: $red; }

    @include respond-to(md) { font-size: 38px; }
    @include respond-to(sm) { font-size: 30px; }
}

.hero-sub {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.8;
}

.hero-img-wrap {
    position: absolute;
    right: -60px;
    top: 0;
    bottom: 0;
    width: 55%;
    z-index: 1;

    @include respond-to(md) { display: none; }
}

.hero-car-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0.6;
}

.hero-img-fade {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(to right, $bg 0%, transparent 30%),
        linear-gradient(to bottom, transparent 50%, $bg 100%);
}

// ── Search bar ────────────────────────────────────────────────────────────────
.search-bar-wrap {
    background: #070707;
    border-bottom: 1px solid $border;
    padding: 18px 0;
    position: sticky;
    top: $nav-height;
    z-index: 40;
}

.search-inner {
    display: flex;
    align-items: center;
    gap: 14px;
}

.search-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 10px 14px;
    transition: border-color 0.2s;

    &:focus-within { border-color: rgba($red, 0.4); }
}

.s-icon { color: $text-dim; flex-shrink: 0; }

.s-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    &::placeholder { color: $text-dark; }
}

.s-btn {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.sort-wrap {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.sort-label {
    font-size: 13px;
    color: $text-dim;
}

.sort-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 9px 14px;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.sort-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
    min-width: 180px;
    z-index: 100;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
}

.sort-opt {
    display: block;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    color: $text-muted;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 11px 16px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover { background: rgba(255,255,255,0.04); color: $text; }
    &.active { color: $red; font-weight: 600; }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
.grid-section { padding: 32px 0 80px; }

.cats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;

    @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
}

.cat-card {
    position: relative;
    border-radius: $r-lg;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    aspect-ratio: 3 / 2.8;
    border: 1px solid $border;
    cursor: pointer;
    transition: transform 0.3s, border-color 0.3s;
    text-decoration: none;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba($red, 0.4);

        .cat-bg-img { transform: scale(1.05); opacity: 0.75; }
        .cat-arrow { background: $red; border-color: $red; color: white; }
    }
}

.cat-bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.55;
    transition: transform 0.4s, opacity 0.3s;
}

.cat-gradient {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(180deg,
            rgba(0,0,0,0.1) 0%,
            rgba(0,0,0,0.5) 55%,
            rgba(0,0,0,0.92) 100%);
}

.cat-top {
    position: relative;
    z-index: 2;
    padding: 14px;
}

.cat-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba($red, 0.18);
    border: 1px solid rgba($red, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
}

.cat-bottom {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 14px;
    gap: 8px;
}

.cat-bottom-left { min-width: 0; }

.cat-name {
    font-size: 15px;
    font-weight: 800;
    color: $text;
    line-height: 1.2;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cat-count {
    font-size: 11px;
    color: $text-muted;
    font-weight: 500;
}

.cat-arrow {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-muted;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
}

// ── Empty state ───────────────────────────────────────────────────────────────
.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: $text-dim;
    font-size: 15px;
    strong { color: $text-muted; }
}

.empty-icon {
    color: $border;
    display: block;
    margin: 0 auto 16px;
}
</style>
