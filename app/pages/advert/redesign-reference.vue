<template>
  <div class="min-h-screen bg-[#050505]">

    <!-- SECTION 1: HERO GALLERY -->
    <div class="relative overflow-hidden" style="height:70vh; min-height:300px">
      <img
        :src="allImages[photoIndex]?.url ?? '/placeholder.jpg'"
        alt="Zdjęcie samochodu"
        class="w-full h-full object-cover"
      />

      <!-- Bottom gradient overlay -->
      <div class="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />

      <!-- Photo counter bottom-left -->
      <div class="absolute bottom-4 left-4 text-white text-[12px] bg-black/40 rounded-full px-2 py-1 leading-none">
        {{ photoIndex + 1 }} / {{ allImages.length }}
      </div>

      <!-- Top-left: back button -->
      <button
        class="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white text-lg"
        @click="$router.back()"
      >
        ←
      </button>

      <!-- Top-right: heart + share -->
      <div class="absolute top-4 right-4 flex gap-2">
        <button class="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white text-base">
          ♡
        </button>
        <button class="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white text-base">
          ↑
        </button>
      </div>

      <!-- Left tap zone -->
      <div
        class="absolute left-0 top-0 w-1/4 h-full"
        @click="prevPhoto"
        @touchstart="touchStartX = $event.touches[0].clientX"
        @touchend="onSwipe($event)"
      />

      <!-- Right tap zone -->
      <div
        class="absolute right-0 top-0 w-1/4 h-full"
        @click="nextPhoto"
        @touchstart="touchStartX = $event.touches[0].clientX"
        @touchend="onSwipe($event)"
      />
    </div>

    <!-- SECTION 2: TITLE + PRICE + MAIN CTA -->
    <div class="px-4 pt-5 pb-4 bg-[#050505]">

      <!-- Breadcrumb -->
      <p class="text-[#666] text-xs mb-3">Ogłoszenia › {{ advert.brand?.name ?? 'Marka' }} › {{ advert.model?.name ?? 'Model' }}</p>

      <!-- Car title -->
      <h1 class="text-[#fff] text-[22px] font-bold leading-tight mb-1">
        {{ advert.year }} {{ advert.brand?.name }} {{ advert.model?.name }}
      </h1>

      <!-- Meta row -->
      <div class="flex items-center gap-1 text-[#888] text-xs mb-4">
        <span>📍</span>
        <span>{{ advert.city }}<template v-if="advert.city && advert.region">, </template>{{ advert.region }}</span>
        <span v-if="advertAge">· {{ advertAge }}</span>
      </div>

      <!-- Price -->
      <p class="text-[#CC1020] text-[34px] font-black leading-none mb-1">
        {{ Number(advert.price).toLocaleString('pl') }} zł
      </p>

      <!-- Sub-price row -->
      <div class="flex items-center gap-2 text-[#888] text-sm mb-5">
        <span>od {{ calcMonthlyPayment }} zł/mies.</span>
        <span
          v-if="advert.isNegotiable"
          class="text-[11px] px-2 py-0.5 rounded-full border border-[#2a3a1a] bg-[rgba(34,197,94,0.08)] text-[#4ade80]"
        >
          Do negocjacji
        </span>
      </div>

      <!-- Phone button -->
      <button
        class="w-full bg-[#CC1020] text-white font-bold text-[15px] h-[52px] rounded-xl flex items-center justify-center gap-2 mb-2.5"
        @click="showPhone = !showPhone"
      >
        <span>📞</span>
        <span>{{ showPhone ? seller?.phoneNumber ?? 'Brak numeru' : 'Pokaż numer telefonu' }}</span>
      </button>

      <!-- Message button -->
      <button
        class="w-full border border-[#2d2d2d] bg-[rgba(255,255,255,0.04)] text-[#ddd] font-semibold text-[15px] h-[48px] rounded-xl flex items-center justify-center gap-2"
      >
        <span>✉</span>
        <span>Napisz wiadomość</span>
      </button>
    </div>

    <!-- SECTION 3: KEY SPECS GRID -->
    <div class="mx-4 mb-3 rounded-2xl bg-[#0d0d0d] border border-[#252525] overflow-hidden">
      <div class="grid grid-cols-3">
        <div
          v-for="(spec, i) in keySpecs"
          :key="i"
          class="flex flex-col items-center py-3"
          :class="{
            'border-r border-[#1a1a1a]': (i % 3) !== 2,
            'border-b border-[#1a1a1a]': i < 3
          }"
        >
          <span class="text-[#fff] text-[17px] font-bold">{{ spec.value }}</span>
          <span class="text-[#666] text-[10px] uppercase tracking-wide mt-1">{{ spec.label }}</span>
        </div>
      </div>
    </div>

    <!-- SECTION 4: TRUST BADGES -->
    <div class="px-4 mb-3">
      <p class="text-[#888] text-[11px] uppercase tracking-widest mb-2">Weryfikacja</p>
      <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div
          v-for="badge in trustBadges"
          :key="badge.label"
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium"
          :class="badge.ok
            ? 'border-[#1a3d1f] bg-[rgba(34,197,94,0.08)] text-[#4ade80]'
            : 'border-[#2a2a1a] bg-[rgba(251,191,36,0.08)] text-[#fbbf24]'"
        >
          <span>{{ badge.ok ? '✓' : '⏳' }}</span>
          <span>{{ badge.label }}</span>
        </div>
      </div>
    </div>

    <!-- SECTION 5: SELLER CARD -->
    <div class="mx-4 mb-3 rounded-2xl bg-[#0d0d0d] border border-[#252525] p-4">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="w-11 h-11 rounded-full bg-[#CC1020] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
          {{ sellerInitials || '?' }}
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-[#fff] text-[14px] font-bold truncate">
            {{ seller?.name }} {{ seller?.surname }}
          </p>
          <span
            class="inline text-[11px] px-2 py-0.5 rounded border"
            :class="seller?.accountType === 'Business'
              ? 'border-[#1a3050] bg-[rgba(59,130,246,0.1)] text-[#60a5fa]'
              : 'border-[#252525] text-[#888]'"
          >
            {{ seller?.accountType === 'Business' ? 'Firma' : 'Prywatny' }}
          </span>
          <div v-if="sellerStats?.averageRating" class="flex items-center gap-1 mt-1">
            <span
              v-for="s in 5"
              :key="s"
              class="text-[12px]"
              :class="s <= Math.round(sellerStats.averageRating ?? 0) ? 'text-yellow-400' : 'text-[#444]'"
            >★</span>
            <span class="text-[#aaa] text-[12px] ml-1">{{ sellerStats.averageRating?.toFixed(1) }}</span>
            <span class="text-[#666] text-[12px]">({{ sellerStats.reviewCount }} opinii)</span>
          </div>
          <p v-if="sellerJoinYear" class="text-[#666] text-[11px] mt-0.5">
            na CARIZO od {{ sellerJoinYear }} r.
          </p>
        </div>
      </div>
      <div class="border-t border-[#1a1a1a] my-3" />
      <div class="flex gap-2">
        <button class="flex-1 border border-[#252525] bg-transparent text-[#aaa] text-[12px] font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5">
          <span>+</span> Obserwuj
        </button>
        <a href="#" class="text-[#CC1020] text-[12px] font-semibold flex items-center gap-1 px-3">
          Profil →
        </a>
      </div>
    </div>

    <!-- SECTION 6: OPIS -->
    <div class="mx-4 mb-3 rounded-2xl bg-[#0d0d0d] border border-[#252525] p-4">
      <p class="text-[11px] uppercase tracking-widest text-[#888] mb-3">Opis ogłoszenia</p>
      <div
        class="text-[#ccc] text-[14px] leading-relaxed"
        :style="descExpanded
          ? {}
          : { overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '5' }"
      >
        {{ advert.description ?? 'Brak opisu.' }}
      </div>
      <button
        v-if="(advert.description?.length ?? 0) > 300"
        class="text-[#CC1020] text-[13px] font-semibold mt-2"
        @click="descExpanded = !descExpanded"
      >
        {{ descExpanded ? 'Zwiń ↑' : 'Pokaż więcej ↓' }}
      </button>
    </div>

    <!-- SECTION 7: WYPOSAŻENIE -->
    <div class="mx-4 mb-3 rounded-2xl bg-[#0d0d0d] border border-[#252525] p-4">
      <p class="text-[11px] uppercase tracking-widest text-[#888] mb-3">Wyposażenie</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(feat, i) in advert.features"
          v-show="i < 8 || featExpanded"
          :key="i"
          class="text-[12px] text-[#ccc] bg-[#111] border border-[#252525] rounded-lg px-2.5 py-1.5"
        >
          {{ feat.name }}
        </span>
      </div>
      <button
        v-if="(advert.features?.length ?? 0) > 8"
        class="text-[#CC1020] text-[13px] font-semibold mt-3"
        @click="featExpanded = !featExpanded"
      >
        {{ featExpanded ? 'Zwiń ↑' : `Pokaż wszystkie (${advert.features?.length}) ↓` }}
      </button>
    </div>

    <!-- SECTION 8: FINANSOWANIE WIDGET -->
    <div class="mx-4 mb-3 rounded-2xl bg-[#0d0d0d] border border-[rgba(204,16,32,0.2)] p-4">
      <!-- Title -->
      <div class="flex items-center gap-2 mb-4">
        <span class="text-[18px]">🧮</span>
        <span class="text-[#fff] text-[14px] font-bold">Kalkulator finansowania</span>
      </div>

      <!-- Mode toggle -->
      <div class="flex rounded-xl bg-[#111] p-1 mb-4">
        <button
          class="flex-1 text-[13px] font-semibold h-8 rounded-lg transition-colors"
          :class="calcMode === 'leasing' ? 'bg-[#CC1020] text-white' : 'text-[#888]'"
          @click="calcMode = 'leasing'"
        >
          Leasing
        </button>
        <button
          class="flex-1 text-[13px] font-semibold h-8 rounded-lg transition-colors"
          :class="calcMode === 'kredyt' ? 'bg-[#CC1020] text-white' : 'text-[#888]'"
          @click="calcMode = 'kredyt'"
        >
          Kredyt
        </button>
      </div>

      <!-- Wpłata własna slider -->
      <div class="mb-3">
        <div class="flex justify-between text-[12px] text-[#888] mb-1">
          <span>Wpłata własna</span>
          <span>{{ calcDownPct }}%</span>
        </div>
        <input
          v-model.number="calcDownPct"
          type="range"
          min="5"
          max="50"
          step="5"
          class="w-full accent-[#CC1020] cursor-pointer"
        />
      </div>

      <!-- Okres slider -->
      <div class="mb-0">
        <div class="flex justify-between text-[12px] text-[#888] mb-1">
          <span>Okres</span>
          <span>{{ calcMonths }} mies.</span>
        </div>
        <input
          v-model.number="calcMonths"
          type="range"
          min="12"
          max="84"
          step="12"
          class="w-full accent-[#CC1020] cursor-pointer"
        />
      </div>

      <!-- Result box -->
      <div class="mt-4 rounded-xl bg-[rgba(204,16,32,0.08)] border border-[rgba(204,16,32,0.2)] p-3 flex justify-between items-center">
        <div>
          <p class="text-[#888] text-[12px]">Szacunkowa rata</p>
          <p class="text-[#CC1020] text-[22px] font-black leading-tight">{{ calcMonthlyPayment }} zł/mies.</p>
        </div>
        <div class="text-right">
          <p class="text-[#888] text-[11px]">Wpłata własna</p>
          <p class="text-[#ccc] font-bold text-[15px]">{{ downPayment }} zł</p>
        </div>
      </div>

      <!-- CTA -->
      <button class="mt-3 w-full bg-[#CC1020] text-white font-bold text-[14px] h-[48px] rounded-xl">
        Sprawdź warunki finansowania
      </button>

      <!-- Disclaimer -->
      <p class="mt-2 text-[11px] text-[#555]">
        Wynik orientacyjny. Rzeczywiste warunki mogą się różnić.
      </p>
    </div>

    <!-- SECTION 9: LOKALIZACJA -->
    <div class="mx-4 mb-3 rounded-2xl bg-[#0d0d0d] border border-[#252525] overflow-hidden">
      <div class="flex items-center gap-2 p-4 pb-3">
        <span class="text-base">📍</span>
        <span class="text-[#fff] font-bold text-[14px]">{{ advert.city }}</span>
        <span class="text-[#666] text-[13px]">{{ advert.region }}</span>
      </div>

      <!-- Map iframe -->
      <iframe
        v-if="mapSrc"
        :src="mapSrc"
        class="w-full h-[150px] border-0 block"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Mapa lokalizacji"
      />

      <!-- Map fallback -->
      <div v-else class="h-[110px] flex flex-col items-center justify-center bg-[#0d0d0d] gap-1">
        <span class="text-[#CC1020] text-[22px]">📍</span>
        <p class="text-[#fff] font-bold text-[13px]">{{ advert.city }}</p>
        <p class="text-[#666] text-[11px]">Lokalizacja przybliżona</p>
      </div>

      <!-- Open Maps button -->
      <a
        :href="`https://www.google.com/maps/search/${encodeURIComponent((advert.city ?? '') + ' ' + (advert.region ?? ''))}`"
        target="_blank"
        rel="noopener"
        class="m-3 mt-0 border border-[#252525] rounded-xl h-10 flex items-center justify-center gap-2 text-[13px] text-[#aaa]"
      >
        <span>🗺</span>
        <span>Otwórz w Mapach</span>
      </a>
    </div>

    <!-- SECTION 10: PODOBNE OGŁOSZENIA -->
    <div class="px-0 mb-6">
      <div class="px-4 flex justify-between items-center mb-3">
        <p class="text-[#fff] font-bold text-[15px]">Podobne ogłoszenia</p>
        <a href="#" class="text-[#CC1020] text-[13px]">Zobacz wszystkie →</a>
      </div>
      <div class="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        <div
          v-for="car in similar"
          :key="car.id"
          class="flex-shrink-0 w-44 rounded-xl bg-[#0d0d0d] border border-[#252525] overflow-hidden"
        >
          <img
            :src="car.images?.[0]?.url ?? '/placeholder.jpg'"
            :alt="car.title"
            class="h-28 object-cover w-full"
          />
          <div class="p-2">
            <p class="text-[#ccc] text-[12px] font-semibold truncate">{{ car.title }}</p>
            <p class="text-[#CC1020] text-[14px] font-black">{{ Number(car.price).toLocaleString('pl') }} zł</p>
            <p class="text-[#666] text-[10px]">{{ car.year }} · {{ car.mileage?.toLocaleString('pl') }} km</p>
          </div>
        </div>
        <div v-if="!similar.length" class="text-[#555] text-[13px] flex items-center py-4">
          Brak podobnych ogłoszeń
        </div>
      </div>
    </div>

    <!-- SPACER for sticky bar -->
    <div class="h-24" />

    <!-- STICKY BOTTOM BAR -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 bg-[rgba(5,5,5,0.95)] backdrop-blur-lg border-t border-[#1e1e1e] px-4 pt-3 flex gap-3 md:hidden"
      style="padding-bottom: max(12px, env(safe-area-inset-bottom))"
    >
      <button
        class="flex-[3] bg-[#CC1020] text-white font-bold text-[15px] h-[50px] rounded-xl flex items-center justify-center gap-2"
        @click="showPhone = !showPhone"
      >
        <span>📞</span>
        <span>{{ showPhone ? seller?.phoneNumber ?? 'Brak numeru' : 'Zadzwoń' }}</span>
      </button>
      <button
        class="flex-[2] border border-[#2d2d2d] bg-[rgba(255,255,255,0.05)] text-[#ddd] font-semibold text-[14px] h-[50px] rounded-xl flex items-center justify-center gap-2"
      >
        <span>✉</span>
        <span>Napisz</span>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ middleware: 'admin' })

interface Advert {
  id: number
  title: string
  price: number | string
  brand?: { name: string }
  model?: { name: string }
  year?: number
  mileage?: number
  engineSize?: string
  transmission?: { name: string }
  fuelType?: { name: string }
  drivetrain?: string
  city?: string
  region?: string
  description?: string
  features?: Array<{ name: string }>
  images?: Array<{ url: string }>
  vin?: string
  hasFullServiceHistory?: boolean
  hasDamage?: boolean
  isNegotiable?: boolean
  userId?: number
  createdAt?: string
  viewCount?: number
}

interface Seller {
  name?: string
  surname?: string
  avatarUrl?: string
  accountType?: string
  createdAt?: string
  phoneNumber?: string
}

interface SellerStats {
  averageRating?: number
  reviewCount?: number
  activeAdverts?: number
}

interface CarAdvert {
  id: number
  title: string
  price: number | string
  year?: number
  mileage?: number
  images?: Array<{ url: string }>
}

const props = withDefaults(defineProps<{
  advert: Advert
  seller?: Seller
  sellerStats?: SellerStats
  mapSrc?: string
  similar?: CarAdvert[]
}>(), {
  similar: () => [],
})

// Refs
const showPhone = ref(false)
const photoIndex = ref(0)
const descExpanded = ref(false)
const featExpanded = ref(false)
const calcMode = ref<'leasing' | 'kredyt'>('leasing')
const calcDownPct = ref(20)
const calcMonths = ref(48)
const touchStartX = ref(0)

// Computed
const allImages = computed(() =>
  props.advert.images?.length ? props.advert.images : [{ url: '/placeholder.jpg' }]
)

const sellerInitials = computed(() =>
  (props.seller?.name?.[0] ?? '') + (props.seller?.surname?.[0] ?? '')
)

const sellerJoinYear = computed(() => {
  if (!props.seller?.createdAt) return null
  const y = new Date(props.seller.createdAt).getFullYear()
  return y >= 2020 ? y : null
})

const calcMonthlyPayment = computed(() => {
  const price = Number(props.advert.price) * (1 - calcDownPct.value / 100)
  const rate = calcMode.value === 'leasing' ? 0.065 : 0.089
  const r = rate / 12
  const n = calcMonths.value
  return Math.round(price * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)).toLocaleString('pl')
})

const downPayment = computed(() =>
  Math.round(Number(props.advert.price) * calcDownPct.value / 100).toLocaleString('pl')
)

const advertAge = computed(() => {
  if (!props.advert.createdAt) return ''
  const diff = Date.now() - new Date(props.advert.createdAt).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'dzisiaj'
  if (d === 1) return 'wczoraj'
  if (d < 7) return d + ' dni temu'
  if (d < 30) return Math.floor(d / 7) + ' tyg. temu'
  return Math.floor(d / 30) + ' mies. temu'
})

const trustBadges = computed(() => [
  { label: 'Bezwypadkowy', ok: !props.advert.hasDamage },
  { label: 'Numer VIN', ok: !!props.advert.vin },
  { label: 'Historia serwisowa', ok: !!props.advert.hasFullServiceHistory },
  { label: 'Zweryfikowany sprzedawca', ok: props.seller?.accountType === 'Business' },
])

const keySpecs = computed(() => [
  { value: props.advert.year?.toString() ?? '—', label: 'Rok' },
  { value: props.advert.mileage != null ? props.advert.mileage.toLocaleString('pl') + ' km' : '—', label: 'Przebieg' },
  { value: props.advert.engineSize ?? '—', label: 'Silnik' },
  { value: props.advert.transmission?.name ?? '—', label: 'Skrzynia' },
  { value: props.advert.fuelType?.name ?? '—', label: 'Paliwo' },
  { value: props.advert.drivetrain ?? '—', label: 'Napęd' },
])

// Functions
function prevPhoto() {
  if (photoIndex.value > 0) photoIndex.value--
}

function nextPhoto() {
  if (photoIndex.value < allImages.value.length - 1) photoIndex.value++
}

function onSwipe(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchEndX - touchStartX.value
  if (diff > 50) prevPhoto()
  else if (diff < -50) nextPhoto()
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
