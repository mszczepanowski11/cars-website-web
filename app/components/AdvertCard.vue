<script setup lang="ts">
import type { CarAdvert } from '~/types'
const props = defineProps<{ advert: CarAdvert }>()
const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites()

const mainImage = computed(() => props.advert.images?.find(i => i.isMain) ?? props.advert.images?.[0])

async function toggleFav(e: Event) {
    e.preventDefault()
    await toggleFavorite(props.advert.id)
}
</script>

<template>
    <NuxtLink :to="`/advert/${advert.id}`" class="car-card">
        <div class="card-img-wrap">
            <img
                :src="mainImage?.url ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'"
                :alt="advert.title"
            />
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
            <div v-if="advert.city" class="car-city">
                <v-icon icon="mdi-map-marker-outline" size="14" class="mr-1" />{{ advert.city }}
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
    transition: transform 0.3s ease;
    &:hover { transform: translateY(-6px); }
}

.card-img-wrap {
    position: relative;
    img { width: 100%; height: 220px; object-fit: cover; display: block; }
}

.fav-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $text-muted;
    transition: color 0.2s, background 0.2s;

    &:hover { background: rgba(0,0,0,0.85); color: $text; }
    &.active { color: $red; }
}

.car-body { padding: 18px; }

.car-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }

.car-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    color: $text-dim;
    font-size: 13px;
    margin-bottom: 14px;

    span { display: flex; align-items: center; }
}

.car-price { color: $red; font-size: 24px; font-weight: 800; margin-bottom: 8px; }

.car-city {
    display: flex;
    align-items: center;
    color: $text-dim;
    font-size: 13px;
}
</style>