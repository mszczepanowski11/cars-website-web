<script setup lang="ts">
    import type { CarAdvert } from '~/types'
    const props = defineProps<{ advert: CarAdvert }>()
    const mainImage = computed(() => props.advert.images?.find(i => i.isMain) ?? props.advert.images?.[0])
</script>

<template>
    <NuxtLink :to="`/advert/${advert.id}`" class="car-card">
        <img :src="mainImage?.url ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'"
            :alt="advert.title" />
        <div class="car-body">
            <h3 class="car-title">{{ advert.title }}</h3>
            <div class="car-info">{{ advert.year }} • {{ advert.mileage.toLocaleString('pl') }} km • {{
                advert.fuelType?.name ?? '' }}</div>
            <div class="car-price">{{ advert.price.toLocaleString('pl') }} zł</div>
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

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    display: block;
  }
}

.car-body { padding: 22px; }

.car-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.car-info {
  color: $text-dim;
  font-size: 14px;
  margin-bottom: 16px;
}

.car-price {
  color: $red;
  font-size: 26px;
  font-weight: 800;
}
</style>