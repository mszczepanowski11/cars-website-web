<template>
    <div class="compare-page">
        <div class="container">
            <div class="page-header">
                <NuxtLink to="/adverts" class="back-link">
                    <v-icon icon="mdi-chevron-left" size="18" />Wróć do ogłoszeń
                </NuxtLink>
                <h1 class="page-title">Porównywarka ogłoszeń</h1>
            </div>

            <div v-if="!compared.length" class="empty-compare">
                <v-icon icon="mdi-compare-remove" size="64" class="empty-icon" />
                <h2>Brak ogłoszeń do porównania</h2>
                <p>Przejdź do listy ogłoszeń i dodaj do porównywarki klikając ikonę <v-icon icon="mdi-compare" size="16" /></p>
                <NuxtLink to="/adverts" class="btn-red">
                    <v-icon icon="mdi-car-multiple" size="16" />Przeglądaj ogłoszenia
                </NuxtLink>
            </div>

            <template v-else>
                <div class="compare-grid" :style="{ gridTemplateColumns: `200px repeat(${adverts.filter(Boolean).length}, 1fr)` }">
                    <!-- Header row -->
                    <div class="cmp-label-cell" />
                    <div v-for="a in loadedAdverts" :key="a.id" class="cmp-advert-header">
                        <div class="cmp-header-img-wrap">
                            <img :src="getMainImg(a)" :alt="a.title" class="cmp-header-img" loading="lazy" />
                            <button class="cmp-remove-btn" @click="toggle(a.id)" title="Usuń z porównania">
                                <v-icon icon="mdi-close" size="14" />
                            </button>
                            <span v-if="a.badge" :class="['cmp-advert-badge', `cmp-badge--${a.badge.toLowerCase()}`]">{{ a.badge }}</span>
                        </div>
                        <NuxtLink :to="`/advert/${a.id}`" class="cmp-advert-title">{{ a.title }}</NuxtLink>
                        <div class="cmp-advert-price">
                            {{ Number(a.price).toLocaleString('pl') }} zł
                            <span v-if="a.color?.hexCode" class="cmp-color-dot"
                                :style="{ background: a.color.hexCode }"
                                :title="a.color.name" />
                        </div>
                    </div>

                    <!-- Spec rows -->
                    <template v-for="row in specRows" :key="row.key">
                        <div class="cmp-label-cell">{{ row.label }}</div>
                        <div v-for="a in loadedAdverts" :key="a.id + row.key" class="cmp-val-cell" :class="{ 'cmp-val--best': isBest(row, a) }">
                            {{ row.get(a) ?? '—' }}
                        </div>
                    </template>

                    <!-- Actions row -->
                    <div class="cmp-label-cell" />
                    <div v-for="a in loadedAdverts" :key="a.id + 'action'" class="cmp-val-cell cmp-action-cell">
                        <NuxtLink :to="`/advert/${a.id}`" class="cmp-see-btn">
                            <v-icon icon="mdi-arrow-right-circle-outline" size="15" />
                            Szczegóły
                        </NuxtLink>
                        <button v-if="isLoggedIn" class="cmp-fav-btn" :class="{ active: isFavorite(a.id) }" @click.prevent="toggleFavorite(a.id)" :title="isFavorite(a.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'">
                            <v-icon :icon="isFavorite(a.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="15" />
                        </button>
                    </div>
                </div>

                <div v-if="loading" class="cmp-loading">
                    <v-icon icon="mdi-loading" size="30" class="spin" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert } from '~/types'

useHead({ title: 'Porównywarka — CARIZO' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { compared, toggle } = useCompare()
const { getImageUrl, placeholder } = useImageUrl()
const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites()

const adverts = ref<(CarAdvert | null)[]>([])
const loading = ref(false)

const loadedAdverts = computed(() => adverts.value.filter(Boolean) as CarAdvert[])

function getMainImg(a: CarAdvert) {
    const img = a.images?.find(i => i.isMain) ?? a.images?.[0]
    return getImageUrl(img?.url, placeholder)
}

interface SpecRow {
    key: string
    label: string
    get: (a: CarAdvert) => string | number | undefined | null
    bestFn?: (vals: (string | number | undefined | null)[]) => string | number | null
}

const specRows: SpecRow[] = [
    { key: 'year',        label: 'Rok produkcji',   get: a => a.year,
                                                      bestFn: vals => Math.max(...(vals.filter(v => v != null) as number[])) },
    { key: 'mileage',     label: 'Przebieg',         get: a => a.mileage ? `${Number(a.mileage).toLocaleString('pl')} km` : null },
    { key: 'price',       label: 'Cena',             get: a => a.price ? `${Number(a.price).toLocaleString('pl')} zł` : null },
    { key: 'power',       label: 'Moc',              get: a => (a.powerHP ?? a.engineVersion?.horsepower ?? a.engineVersion?.powerHP) ? `${a.powerHP ?? a.engineVersion?.horsepower ?? a.engineVersion?.powerHP} KM` : null,
                                                      bestFn: vals => { const nums = vals.map(v => parseInt(String(v ?? '0'))).filter(n => !isNaN(n) && n > 0); return nums.length ? Math.max(...nums) : null } },
    { key: 'engine',      label: 'Pojemność',        get: a => (a.engineSize ?? a.engineVersion?.displacement) ? `${a.engineSize ?? a.engineVersion?.displacement} cm³` : null },
    { key: 'fuel',        label: 'Paliwo',           get: a => a.fuelType?.name },
    { key: 'gearbox',     label: 'Skrzynia',         get: a => a.gearbox?.name },
    { key: 'body',        label: 'Nadwozie',         get: a => a.bodyType?.name },
    { key: 'drive',       label: 'Napęd',            get: a => a.driveType?.name ?? null },
    { key: 'color',       label: 'Kolor',            get: a => a.color?.name ?? null },
    { key: 'doors',       label: 'Liczba drzwi',     get: a => a.doorCount ?? null },
    { key: 'seats',       label: 'Liczba miejsc',    get: a => a.seatsCount ?? null },
    { key: 'condition',   label: 'Stan',             get: a => a.condition === 'new' ? 'Nowe' : a.condition === 'used' ? 'Używane' : null },
    { key: 'damage',      label: 'Bezwypadkowy',     get: a => a.hasDamage === false ? '✓ Bezwypadkowy' : a.hasDamage === true ? '✗ Po wypadku' : null },
    { key: 'warranty',    label: 'Gwarancja',        get: a => a.hasWarranty ? '✓ Tak' : null },
    { key: 'servicebook', label: 'Książka serwis.',  get: a => a.hasServiceBook ? '✓ Tak' : null },
    { key: 'brand',       label: 'Marka',            get: a => a.brand?.name },
    { key: 'model',       label: 'Model',            get: a => a.model?.name },
    { key: 'city',        label: 'Lokalizacja',      get: a => a.city ?? null },
]

function isBest(row: SpecRow, a: CarAdvert): boolean {
    if (!row.bestFn) return false
    const vals = loadedAdverts.value.map(x => row.get(x))
    const best = row.bestFn(vals)
    if (best == null) return false
    const mine = row.get(a)
    return mine != null && String(mine).includes(String(best))
}

async function fetchAdverts() {
    if (!compared.value.length) return
    loading.value = true
    adverts.value = await Promise.all(
        compared.value.map(id =>
            $fetch<CarAdvert>(`/api/proxy/api/listings/${id}`).catch(() => null)
        )
    )
    loading.value = false
}

watch(compared, fetchAdverts, { deep: true })
onMounted(fetchAdverts)
</script>

<style lang="scss" scoped>
.compare-page {
    min-height: 100vh;
    background: $bg;
    padding-top: calc(#{$nav-height} + 40px);
    padding-bottom: 60px;
}

.container { @include container; }

.page-header {
    margin-bottom: 32px;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: $text-dark;
    font-size: 13px;
    text-decoration: none;
    margin-bottom: 12px;
    transition: color 0.2s;
    &:hover { color: $red; }
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: $text;
}

.empty-compare {
    text-align: center;
    padding: 80px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;

    h2 { font-size: 22px; color: $text; }
    p { color: $text-dim; font-size: 14px; }
    .v-icon { color: $text-dark; }
}

.empty-icon { color: #222 !important; margin-bottom: 8px; }

.btn-red {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: #fff;
    padding: 10px 22px;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    &:hover { opacity: 0.88; }
}

.compare-grid {
    display: grid;
    gap: 0;
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    overflow-x: auto;
}

.cmp-label-cell {
    background: #080808;
    border-right: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 14px 16px;
    font-size: 12px;
    font-weight: 600;
    color: $text-dark;
    display: flex;
    align-items: center;
    min-width: 160px;
}

.cmp-advert-header {
    background: #0a0a0a;
    border-right: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 200px;
}

.cmp-header-img-wrap {
    position: relative;
    border-radius: $r-md;
    overflow: hidden;
}

.cmp-header-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
}

.cmp-remove-btn {
    position: absolute;
    top: 8px; right: 8px;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    border: 1px solid $border;
    color: $text-muted;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: rgba($red,0.2); color: $red; }
}

.cmp-advert-title {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    text-decoration: none;
    line-height: 1.3;
    &:hover { color: $red; }
}

.cmp-advert-price {
    font-size: 18px;
    font-weight: 800;
    color: $red;
    display: flex;
    align-items: center;
}

.cmp-val-cell {
    background: #070707;
    border-right: 1px solid $border;
    border-bottom: 1px solid $border;
    padding: 12px 16px;
    font-size: 13px;
    color: $text-muted;
    display: flex;
    align-items: center;
    min-width: 200px;

    &.cmp-val--best {
        color: #4ade80;
        background: rgba(#14532d, 0.25);
        font-weight: 600;
    }
}

.cmp-action-cell {
    padding: 14px 16px;
    gap: 8px;
}

.cmp-see-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    padding: 7px 14px;
    text-decoration: none;
    transition: all 0.2s;
    &:hover { border-color: $red; color: $red; }
}

.cmp-fav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-dim;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover { border-color: rgba($red, 0.4); color: $red; }
    &.active { color: $red; border-color: rgba($red, 0.4); background: rgba($red, 0.06); }
}

.cmp-advert-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.6px;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;

    &.cmp-badge--top     { background: rgba(#f5a623, 0.18); color: #f5a623; border: 1px solid rgba(#f5a623, 0.4); }
    &.cmp-badge--premium { background: $red; color: white; }
    &.cmp-badge--featured { background: rgba($red, 0.18); color: #ff6b6b; border: 1px solid rgba($red, 0.4); }
}

.cmp-color-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.15);
    vertical-align: middle;
    margin-left: 6px;
    flex-shrink: 0;
}

.cmp-loading {
    display: flex;
    justify-content: center;
    padding: 40px;
    .v-icon { color: $red; }
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
