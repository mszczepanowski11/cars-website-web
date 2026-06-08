<script setup lang="ts">
import type { CarAdvert } from '~/types'
const props = defineProps<{ advert: CarAdvert }>()
const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites()
const { getImageUrl, placeholder } = useImageUrl()

const mainImage = computed(() => props.advert.images?.find(i => i.isMain) ?? props.advert.images?.[0])
const mainImageUrl = computed(() => getImageUrl(mainImage.value?.url, placeholder))

async function toggleFav(e: Event) {
    e.preventDefault()
    await toggleFavorite(props.advert.id)
}

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
        FEATURED: 'WYRÓŻNIONE',
        TOP: 'TOP',
    }
    return resolvedBadge.value ? (map[resolvedBadge.value] ?? resolvedBadge.value) : null
})
</script>

<template>
    <NuxtLink
        :to="`/advert/${advert.id}`"
        class="car-card"
        :class="{
            'car-card--featured': resolvedBadge === 'FEATURED',
            'car-card--top': resolvedBadge === 'TOP',
        }"
    >
        <div class="card-img-wrap">
            <img
                :src="mainImageUrl"
                :alt="advert.title"
            />
            <span v-if="resolvedBadge" :class="['card-badge', `card-badge--${resolvedBadge.toLowerCase()}`]">
                <v-icon v-if="resolvedBadge === 'TOP'" icon="mdi-crown" size="10" class="badge-icon" />
                {{ badgeText }}
            </span>
            <button v-if="isLoggedIn" class="fav-btn" :class="{ active: isFavorite(advert.id) }" @click="toggleFav">
                <v-icon :icon="isFavorite(advert.id) ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
            </button>
        </div>
        <div class="car-body">
            <h3 class="car-title">{{ advert.title }}</h3>
            <div class="car-meta">
                <span><v-icon icon="mdi-calendar-outline" size="14" class="mr-1" />{{ advert.year }}</span>
                <span><v-icon icon="mdi-gas-station-outline" size="14" class="mr-1" />{{ advert.fuelType?.name ?? '–' }}</span>
                <span><v-icon icon="mdi-speedometer" size="14" class="mr-1" />{{ advert.mileage.toLocaleString('pl') }} km</span>
            </div>
            <div class="car-price">{{ advert.price.toLocaleString('pl') }} zł</div>
            <div v-if="advert.city" class="car-footer">
                <span class="car-city">
                    <v-icon icon="mdi-map-marker-outline" size="14" class="mr-1" />{{ advert.city }}
                </span>
                <span class="car-verified">
                    <v-icon icon="mdi-shield-check" size="16" />
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

        &:hover {
            border-color: rgba(#f5a623, 0.65);
            box-shadow: 0 4px 24px rgba(#f5a623, 0.14);
        }
    }
}

.card-img-wrap {
    position: relative;

    img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
    }
}

.fav-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 34px;
    height: 34px;
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

.car-price {
    color: $red;
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 10px;
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
</style>
