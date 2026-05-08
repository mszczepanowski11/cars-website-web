<script setup lang="ts">
import type { CarAdvert } from '~/types'
const props = defineProps<{ advert: CarAdvert; status?: string }>()
const mainImage = computed(() => props.advert.images?.find(i => i.isMain) ?? props.advert.images?.[0])
const statusColor = computed(() => {
    if (props.status === 'Aktywne') return '#4caf50'
    if (props.status === 'Wstrzymane') return '#ff9800'
    return '#666'
})
</script>

<template>
    <NuxtLink :to="`/advert/${advert.id}`" class="dash-card">
        <div class="dash-card-img-wrap">
            <img
                :src="mainImage?.url ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop'"
                :alt="advert.title"
            />
            <span v-if="status" class="status-badge" :style="{ background: statusColor }">{{ status }}</span>
        </div>
        <div class="dash-card-body">
            <p class="dash-card-title">{{ advert.title }}</p>
            <p class="dash-card-price">{{ advert.price.toLocaleString('pl') }} zł</p>
            <p class="dash-card-meta">
                {{ advert.mileage.toLocaleString('pl') }} km
                · {{ advert.year }}
                · {{ advert.fuelType?.name ?? '' }}
            </p>
        </div>
    </NuxtLink>
</template>

<style lang="scss" scoped>
.dash-card {
    display: block;
    @include card($r-md);
    overflow: hidden;
    color: $text;
    text-decoration: none;
    transition: transform 0.25s;
    &:hover { transform: translateY(-4px); }
}

.dash-card-img-wrap {
    position: relative;
    img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        display: block;
    }
}

.status-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    padding: 3px 10px;
    border-radius: 20px;
}

.dash-card-body { padding: 14px; }

.dash-card-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dash-card-price { color: $red; font-size: 18px; font-weight: 800; margin-bottom: 4px; }
.dash-card-meta { color: $text-dim; font-size: 12px; }
</style>