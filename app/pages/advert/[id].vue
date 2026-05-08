<template>
  <div class="page-bg">
    <div class="container" style="padding-top: 120px; padding-bottom: 80px;">

      <div v-if="loading" class="d-flex justify-center mt-16">
        <v-progress-circular indeterminate color="primary" size="60" />
      </div>
      <div v-else-if="!advert" class="no-data">Ogłoszenie nie zostało znalezione.</div>

      <template v-else>
        <img :src="mainImg" :alt="advert.title" class="main-img" />

        <div v-if="(advert.images?.length ?? 0) > 1" class="thumbs">
          <img
            v-for="img in advert.images"
            :key="img.id"
            :src="img.url"
            :alt="advert.title"
            class="thumb"
            :class="{ active: img.url === mainImg }"
            @click="mainImg = img.url"
          />
        </div>

        <div class="detail-grid">
          <!-- LEFT -->
          <div>
            <h1 class="ad-title">{{ advert.title }}</h1>
            <div class="ad-price">{{ advert.price.toLocaleString('pl') }} zł</div>
            <div class="ad-tags">
              <span>{{ advert.year }}</span>
              <span>{{ advert.mileage.toLocaleString('pl') }} km</span>
              <span v-if="advert.fuelType">{{ advert.fuelType.name }}</span>
              <span v-if="advert.gearbox">{{ advert.gearbox.name }}</span>
            </div>

            <div class="info-box">
              <h3>Opis</h3>
              <p>{{ advert.description }}</p>
            </div>

            <div v-if="advert.features?.length" class="info-box">
              <h3>Wyposażenie</h3>
              <div class="chips">
                <span v-for="feat in advert.features" :key="feat.id" class="chip">{{ feat.name }}</span>
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div>
            <div class="specs-card">
              <h3>Dane techniczne</h3>
              <div v-if="advert.brand"       class="spec"><span>Marka</span><span>{{ advert.brand.name }}</span></div>
              <div v-if="advert.model"       class="spec"><span>Model</span><span>{{ advert.model.name }}</span></div>
              <div v-if="advert.generation"  class="spec"><span>Generacja</span><span>{{ advert.generation.name }}</span></div>
              <div v-if="advert.engineVersion" class="spec">
                <span>Silnik</span>
                <span>{{ advert.engineVersion.name }} ({{ advert.engineVersion.horsepower }} KM)</span>
              </div>
              <div v-if="advert.bodyType"    class="spec"><span>Nadwozie</span><span>{{ advert.bodyType.name }}</span></div>
              <div v-if="advert.gearbox"     class="spec"><span>Skrzynia</span><span>{{ advert.gearbox.name }}</span></div>
              <div class="spec"><span>Rok produkcji</span><span>{{ advert.year }}</span></div>
              <div class="spec"><span>Przebieg</span><span>{{ advert.mileage.toLocaleString('pl') }} km</span></div>
            </div>

            <div v-if="isOwner">
              <v-btn color="primary" block class="mb-3" :to="`/add-advert?edit=${advert.id}`">
                Edytuj ogłoszenie
              </v-btn>
              <v-btn color="error" variant="outlined" block @click="del">
                Usuń ogłoszenie
              </v-btn>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CarAdvert } from '~/types'

const route  = useRoute()
const config = useRuntimeConfig()
const base   = config.public.apiBase
const token  = useCookie('auth_token')

const advert  = ref<CarAdvert | null>(null)
const loading = ref(true)
const mainImg = ref('')

const currentUserId = computed(() => {
  if (!token.value) return null
  try {
    const payload = JSON.parse(atob(token.value.split('.')[1]))
    return Number(
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? payload.sub
    )
  } catch { return null }
})

const isOwner = computed(() => advert.value && currentUserId.value === advert.value.userId)

async function del() {
  if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return
  await $fetch(`${base}api/Advert/${advert.value!.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token.value}` },
  })
  navigateTo('/my-adverts')
}

onMounted(async () => {
  try {
    advert.value = await $fetch<CarAdvert>(`${base}api/Advert/${route.params.id}`)
    const m = advert.value.images?.find(i => i.isMain) ?? advert.value.images?.[0]
    mainImg.value = m?.url ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.page-bg {
  background: $bg;
  min-height: 100vh;
  color: $text;
}

.container { @include container; }

.no-data {
  text-align: center;
  color: $text-faint;
  font-size: 20px;
  margin-top: 80px;
}

.main-img {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: $r-lg;
  display: block;
}

.thumbs {
  display: flex;
  gap: 12px;
  margin: 12px 0 40px;
  flex-wrap: wrap;
}

.thumb {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: $r-sm;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &.active { border-color: $red; }
  &:hover  { border-color: rgba($red, 0.6); }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
  align-items: start;

  @include respond-to(md) { grid-template-columns: 1fr; }
}

.ad-title {
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 14px;

  @include respond-to(sm) { font-size: 26px; }
}

.ad-price {
  font-size: 38px;
  font-weight: 800;
  color: $red;
  margin-bottom: 20px;
}

.ad-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;

  span {
    @include card($r-sm);
    padding: 6px 16px;
    color: #ccc;
    font-size: 14px;
  }
}

.info-box {
  @include card($r-md);
  padding: 28px;
  margin-bottom: 22px;

  h3 { font-size: 18px; font-weight: 700; margin-bottom: 14px; }
  p  { color: $text-muted; line-height: 1.8; }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  background: #111;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  color: #ccc;
}

.specs-card {
  @include card($r-md);
  padding: 28px;
  margin-bottom: 20px;

  h3 { font-size: 18px; font-weight: 700; margin-bottom: 18px; }
}

.spec {
  display: flex;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid $border;
  font-size: 14px;

  &:last-child { border-bottom: none; }

  span:first-child { color: $text-dim; }
  span:last-child  { font-weight: 500; }
}
</style>