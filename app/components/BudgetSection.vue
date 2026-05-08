<template>
  <section class="section">
    <div class="container">
      <div class="sec-top">
        <h2>Szukaj według budżetu i typu</h2>
        <NuxtLink to="/adverts" class="see-all">Zobacz wszystkie</NuxtLink>
      </div>
      <div class="budget-grid">
        <NuxtLink
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          class="budget-card"
        >
          <div class="budget-icon">
            <v-icon size="24">mdi-car-outline</v-icon>
          </div>
          <div>
            <div class="budget-label">{{ item.label }}</div>
            <div class="budget-count">{{ item.count }} ogłoszeń</div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const items = [
  { label: 'Auta do 50 000 zł',         count: '5 230', to: '/adverts?priceTo=50000' },
  { label: 'Auta 50 000 – 100 000 zł',  count: '8 742', to: '/adverts?priceFrom=50000&priceTo=100000' },
  { label: 'Auta 100 000 – 150 000 zł', count: '6 125', to: '/adverts?priceFrom=100000&priceTo=150000' },
  { label: 'Auta powyżej 150 000 zł',   count: '4 230', to: '/adverts?priceFrom=150000' },
  { label: 'Auta rodzinne',             count: '7 647', to: '/adverts' },
  { label: 'Auta miejskie',             count: '8 191', to: '/adverts' },
  { label: 'Auta sportowe',             count: '3 421', to: '/adverts' },
  { label: 'Auta ekonomiczne',          count: '9 987', to: '/adverts' },
]
</script>

<style lang="scss" scoped>
.section { margin-top: 90px; }
.container { @include container; }

.sec-top {
  @include section-top;
  .see-all { color: $red; }
}

.budget-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(xs) { grid-template-columns: 1fr; }
}

.budget-card {
  @include card($r-md);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: $text;
  transition: border-color 0.25s ease, transform 0.25s ease;

  &:hover {
    border-color: $red;
    transform: translateY(-3px);
  }
}

.budget-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba($red, 0.1);
  border: 1px solid rgba($red, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $red;
}

.budget-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.budget-count {
  font-size: 12px;
  color: $text-dim;
}
</style>