<script setup lang="ts">
import type { CarAdvert } from '~/types'
const props = defineProps<{ advert: CarAdvert; hideCompare?: boolean }>()
const emit = defineEmits<{ quickView: [id: number] }>()
const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites()
const { getImageUrl, placeholder } = useImageUrl()
const { toggle: compareToggle, isCompared } = useCompare()
const { t } = useI18n()

const mainImage = computed(() => props.advert.images?.find(i => i.isMain) ?? props.advert.images?.[0])
const mainImageUrl = computed(() => getImageUrl(mainImage.value?.url, placeholder))

// Date.now() called directly here would return a different real-world instant during SSR
// vs. client hydration (a network round-trip apart) - for any advert whose createdAt sits
// near the 24h boundary, that's enough to flip this v-if's result and produce a hydration
// mismatch ("NOWE" badge present in the server HTML, absent after hydration, or vice versa).
// useState freezes one "now" per request and serializes it into the payload so the client
// reuses the exact same value instead of recomputing.
const nowMs = useState('advert-card-now-ms', () => Date.now())
const isNew = computed(() => {
    if (!props.advert.createdAt) return false
    return nowMs.value - new Date(props.advert.createdAt).getTime() < 24 * 60 * 60 * 1000
})

async function toggleFav(e: Event) {
    e.preventDefault()
    await toggleFavorite(props.advert.id)
}

function onCompare(e: Event) {
    e.preventDefault()
    compareToggle(props.advert.id)
}

function onQuickView(e: Event) {
    e.preventDefault()
    emit('quickView', props.advert.id)
}

const isParts = computed(() => props.advert.category?.slug === 'czesci' || !!props.advert.catalogNumber)

const compatibilityCount = computed(() => {
    const c = props.advert.compatibility
    if (!c) return 0
    return c.split(',').filter(s => s.trim().length > 0).length
})

const gearboxShort = computed(() => {
    const n = props.advert.gearbox?.name ?? ''
    if (!n) return null
    if (/automat/i.test(n)) return t('cAdvertCard.gearboxAutomatic')
    if (/manual|meczn|ręczn/i.test(n)) return t('cAdvertCard.gearboxManual')
    if (/półautomat|semi/i.test(n)) return t('cAdvertCard.gearboxSemiAuto')
    if (/cvt|variat/i.test(n)) return 'CVT'
    return n.length > 10 ? n.slice(0, 9) + '…' : n
})

const resolvedBadge = computed(() => {
    if (props.advert.badge) return props.advert.badge
    if (props.advert.sellerType === 'dealer') return 'DEALER'
    if (props.advert.isVerified) return 'VERIFIED'
    return null
})

const badgeText = computed(() => {
    const map: Record<string, string> = {
        PREMIUM: 'PREMIUM',
        VERIFIED: 'VERIFIED',
        DEALER: 'DEALER',
        FEATURED: t('cAdvertCard.badgeFeatured'),
        TOP: 'TOP',
    }
    return resolvedBadge.value ? (map[resolvedBadge.value] ?? resolvedBadge.value) : null
})

const monthlyRate = computed(() => {
    const price = props.advert.price
    if (!price || price < 10000) return null
    const r = 0.0899 / 12
    const n = 48
    const factor = r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    return Math.round(price * factor)
})
</script>

<template>
    <NuxtLink
        :to="`/advert/${advert.id}`"
        class="car-card"
        :class="{
            'car-card--featured': resolvedBadge === 'FEATURED',
            'car-card--top': resolvedBadge === 'TOP',
            'car-card--premium': resolvedBadge === 'PREMIUM',
        }"
    >
        <div class="card-img-wrap">
            <NuxtImg
                provider="carizo"
                :src="mainImageUrl"
                :alt="advert.title"
                loading="lazy"
                width="420"
                height="200"
                format="auto"
                quality="75"
            />
            <span v-if="resolvedBadge" :class="['card-badge', `card-badge--${resolvedBadge.toLowerCase()}`]">
                <v-icon v-if="resolvedBadge === 'TOP'" icon="mdi-crown" size="10" class="badge-icon" />
                {{ badgeText }}
            </span>
            <span v-if="isNew && !resolvedBadge" class="card-badge card-badge--new">{{ $t('cAdvertCard.badgeNew') }}</span>
            <div class="card-hover-actions">
                <button class="card-action-btn" :aria-label="$t('cAdvertCard.quickView')" @click="onQuickView">
                    <v-icon icon="mdi-eye-outline" size="16" />
                </button>
                <button v-if="!hideCompare" class="card-action-btn" :class="{ active: isCompared(advert.id) }" :aria-label="isCompared(advert.id) ? $t('cAdvertCard.removeFromCompare') : $t('cAdvertCard.addToCompare')" @click="onCompare">
                    <v-icon icon="mdi-compare" size="16" />
                </button>
            </div>
            <button v-if="isLoggedIn" class="fav-btn" :class="{ active: isFavorite(advert.id) }" :aria-label="isFavorite(advert.id) ? $t('cAdvertCard.removeFromFavorites') : $t('cAdvertCard.addToFavorites')" @click="toggleFav">
                <v-icon :icon="isFavorite(advert.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
            </button>
        </div>
        <div class="car-body">
            <h3 class="car-title">{{ advert.title }}</h3>
            <!-- Parts-specific meta -->
            <div v-if="isParts" class="car-meta">
                <span v-if="advert.catalogNumber" class="meta-catalog">
                    <v-icon icon="mdi-barcode-scan" size="14" class="mr-1" />{{ advert.catalogNumber }}
                </span>
                <span v-if="advert.bodySubtype" class="meta-part-cat">
                    <v-icon icon="mdi-cog-outline" size="14" class="mr-1" />{{ advert.bodySubtype }}
                </span>
                <span v-if="compatibilityCount > 0" class="meta-compat">
                    <v-icon icon="mdi-car-multiple" size="14" class="mr-1" />{{ $t('cAdvertCard.compatFits') }} {{ compatibilityCount }} {{ compatibilityCount === 1 ? $t('cAdvertCard.compatModelSingular') : $t('cAdvertCard.compatModelPlural') }}
                </span>
            </div>
            <!-- Standard vehicle meta -->
            <div v-else class="car-meta">
                <span v-if="advert.year"><v-icon icon="mdi-calendar-outline" size="14" class="mr-1" />{{ advert.year }}</span>
                <span><v-icon icon="mdi-gas-station-outline" size="14" class="mr-1" />{{ advert.fuelType?.name ?? '–' }}</span>
                <span><v-icon icon="mdi-speedometer" size="14" class="mr-1" />{{ advert.mileage?.toLocaleString('pl-PL') ?? '—' }} km</span>
                <span v-if="gearboxShort"><v-icon icon="mdi-car-shift-pattern" size="14" class="mr-1" />{{ gearboxShort }}</span>
                <span v-if="advert.powerHP"><v-icon icon="mdi-engine-outline" size="14" class="mr-1" />{{ advert.powerHP }} {{ $t('cAdvertCard.powerUnit') }}</span>
            </div>
            <div class="car-price">
                {{ advert.price?.toLocaleString('pl-PL') ?? $t('cAdvertCard.priceNegotiable') }} {{ advert.price != null ? (advert.currency ?? 'zł') : '' }}
                <span v-if="advert.priceEur != null && advert.currency !== 'EUR'" class="car-price-eur">≈ {{ Math.round(advert.priceEur).toLocaleString('pl-PL') }} €</span>
            </div>
            <div v-if="monthlyRate" class="car-monthly">
                <v-icon icon="mdi-bank-outline" size="12" class="car-monthly-icon" />
                {{ $t('cAdvertCard.monthlyFrom', { rate: monthlyRate.toLocaleString('pl') }) }}
                <span class="car-monthly-label">ING leasing</span>
            </div>
            <div class="car-footer">
                <span v-if="advert.city" class="car-city">
                    <v-icon icon="mdi-map-marker-outline" size="14" class="mr-1" />{{ advert.city }}
                </span>
                <span v-if="advert.isVerified" class="car-verified">
                    <v-icon icon="mdi-shield-check" size="16" />
                </span>
                <span v-if="advert.color?.hexCode" class="car-color-dot"
                    :style="{ background: advert.color.hexCode }"
                    :title="advert.color.name" />
                <span v-if="advert.viewCount" class="car-views">
                    <v-icon icon="mdi-eye-outline" size="13" />{{ advert.viewCount.toLocaleString('pl') }}
                </span>
            </div>
        </div>
    </NuxtLink>
</template>

<style lang="scss" scoped>
.car-card {
    @include card;
    overflow: hidden;
    color: $text;
    display: block;
    position: relative;
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-6px);
        border-color: rgba($red, 0.3);
    }

    &--featured {
        border-color: rgba($red, 0.5);
        box-shadow: 0 0 18px rgba($red, 0.1);

        &:hover {
            border-color: rgba($red, 0.75);
            box-shadow: 0 4px 24px rgba($red, 0.18);
        }
    }

    &--top {
        border-color: rgba(#f5a623, 0.4);
        box-shadow: 0 0 18px rgba(#f5a623, 0.08);
        &::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 40%, rgba(#f5a623, 0.06) 50%, transparent 60%); animation: card-shimmer 3.5s ease-in-out infinite; pointer-events: none; }

        &:hover {
            border-color: rgba(#f5a623, 0.65);
            box-shadow: 0 4px 24px rgba(#f5a623, 0.14);
        }
    }

    &--premium {
        border-color: rgba(#b388ff, 0.45);
        box-shadow: 0 0 18px rgba(#b388ff, 0.1);
        &::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 40%, rgba(#b388ff, 0.06) 50%, transparent 60%); animation: card-shimmer 3.5s ease-in-out infinite; pointer-events: none; }

        &:hover {
            border-color: rgba(#b388ff, 0.7);
            box-shadow: 0 4px 24px rgba(#b388ff, 0.18);
        }
    }
}

.card-img-wrap {
    position: relative;
    overflow: hidden;

    img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
        transition: transform 0.4s ease;
    }

    &:hover img { transform: scale(1.03); }
}

.card-hover-actions {
    position: absolute;
    bottom: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.2s ease, transform 0.2s ease;

    .car-card:hover & {
        opacity: 1;
        transform: translateY(0);
    }

    @media (hover: none) {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-action-btn {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    color: $text-muted;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    .v-icon { color: $text-muted; transition: color 0.2s; }

    &:hover { background: rgba($red,0.2); border-color: rgba($red,0.5); .v-icon { color: $red; } }
    &.active { background: rgba($red,0.25); border-color: $red; .v-icon { color: $red; } }
}

.fav-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $text-muted;
    transition: color 0.2s, background 0.2s;

    &:hover { background: rgba(0, 0, 0, 0.85); color: $text; }
    &.active { color: $red; }
}

.car-body { padding: 16px; }

.car-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.3;
}

.car-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    color: $text-dim;
    font-size: 12px;
    margin-bottom: 12px;

    span { display: flex; align-items: center; }
}

.meta-catalog {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 1px 5px;
    color: $text-muted;
}

.meta-part-cat {
    text-transform: capitalize;
}

.meta-compat {
    color: rgb(34, 197, 94);
    font-weight: 600;
}

.car-price {
    color: $red;
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 4px;
}

.car-price-eur {
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    margin-left: 6px;
}

.car-monthly {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: $text-dim;
    margin-bottom: 10px;

    .car-monthly-icon { color: $text-dark; }
}

.car-monthly-label {
    font-size: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 1px 5px;
    color: $text-dark;
    font-weight: 600;
    letter-spacing: 0.3px;
}

.car-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.car-city {
    display: flex;
    align-items: center;
    color: $text-dim;
    font-size: 12px;
}

.car-verified {
    color: $text-dim;
    display: flex;
    align-items: center;
}

.car-color-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
    display: inline-block;
}

.car-views {
    display: flex;
    align-items: center;
    gap: 3px;
    color: $text-faint;
    font-size: 11px;
    margin-left: auto;
    .v-icon { color: $text-faint; }
}

// ── Badges ────────────────────────────────────────────────────────────────────
.card-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 4px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 4px;

    &--premium {
        background: $red;
        color: white;
    }

    &--verified {
        background: #14532d;
        color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.3);
    }

    &--dealer {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border: 1px solid rgba(96, 165, 250, 0.3);
    }

    &--featured {
        background: rgba($red, 0.18);
        color: #ff6b6b;
        border: 1px solid rgba($red, 0.45);
        backdrop-filter: blur(4px);
    }

    &--top {
        background: rgba(#f5a623, 0.18);
        color: #f5a623;
        border: 1px solid rgba(#f5a623, 0.45);
        backdrop-filter: blur(4px);
    }
}

.badge-icon { flex-shrink: 0; }

.card-badge--new {
    background: #14532d;
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.3);
}

@keyframes card-shimmer {
    0%   { transform: translateX(-100%); }
    60%  { transform: translateX(100%); }
    100% { transform: translateX(100%); }
}
</style>
