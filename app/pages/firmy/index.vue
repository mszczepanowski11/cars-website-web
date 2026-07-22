<template>
  <div class="dir-page">
    <section class="dir-hero">
      <div class="dir-hero-inner">
        <div class="dir-eyebrow">{{ $t('firmy.eyebrow') }}</div>
        <h1 class="dir-title">{{ $t('firmy.title') }}</h1>
        <p class="dir-sub">{{ $t('firmy.sub') }}</p>

        <form class="dir-search" @submit.prevent="applySearch">
          <v-icon icon="mdi-magnify" size="20" class="dir-search-icon" />
          <input v-model="qInput" type="text" :placeholder="$t('firmy.searchPlaceholder')" class="dir-search-input" />
          <button type="submit" class="dir-search-btn">{{ $t('firmy.searchBtn') }}</button>
        </form>
      </div>
    </section>

    <section class="dir-body">
      <div class="dir-grid">
        <!-- Filters -->
        <aside class="dir-filters">
          <div v-if="countryFacets.length > 1" class="dir-filter-block">
            <h3 class="dir-filter-h">{{ $t('firmy.country') }}</h3>
            <button class="dir-facet" :class="{ active: !activeCountry }" @click="setCountry(null)">
              <span>{{ $t('firmy.allCountries') }}</span>
            </button>
            <button
              v-for="c in countryFacets" :key="c.value"
              class="dir-facet" :class="{ active: activeCountry === c.value }"
              @click="setCountry(c.value)">
              <span>{{ countryName(c.value) }}</span>
              <span class="dir-facet-count">{{ c.count }}</span>
            </button>
          </div>

          <div class="dir-filter-block">
            <h3 class="dir-filter-h">{{ $t('firmy.category') }}</h3>
            <button
              class="dir-facet" :class="{ active: !activeCategory }"
              @click="setCategory(null)">
              <span>{{ $t('firmy.all') }}</span>
              <span class="dir-facet-count">{{ totalAll }}</span>
            </button>
            <button
              v-for="c in categoryFacets" :key="c.value"
              class="dir-facet" :class="{ active: activeCategory === c.value }"
              @click="setCategory(c.value)">
              <span>{{ categoryLabel(c.value) }}</span>
              <span class="dir-facet-count">{{ c.count }}</span>
            </button>
          </div>
        </aside>

        <!-- Results -->
        <div class="dir-results">
          <div class="dir-results-head">
            <span v-if="!pending">{{ $t('firmy.found') }} <strong>{{ total.toLocaleString('pl') }}</strong> {{ pluralFirm(total) }}</span>
            <span v-else>{{ $t('firmy.loading') }}</span>
            <div class="dir-viewtoggle">
              <button :class="{ active: view === 'list' }" @click="view = 'list'"><v-icon icon="mdi-format-list-bulleted" size="16" /> {{ $t('firmy.list') }}</button>
              <button :class="{ active: view === 'map' }" @click="view = 'map'"><v-icon icon="mdi-map-outline" size="16" /> {{ $t('firmy.map') }}</button>
            </div>
          </div>

          <ClientOnly v-if="view === 'map'">
            <CompanyMap :category="activeCategory" :country="activeCountry" />
            <template #fallback><div class="dir-loading"><v-icon icon="mdi-loading" size="34" class="spin" /></div></template>
          </ClientOnly>

          <template v-else>
          <div v-if="pending" class="dir-loading">
            <v-icon icon="mdi-loading" size="34" class="spin" />
          </div>

          <div v-else-if="items.length === 0" class="dir-empty">
            <v-icon icon="mdi-office-building-outline" size="44" />
            <p>{{ $t('firmy.empty') }}</p>
            <button v-if="activeCategory || activeCountry || q" class="dir-reset" @click="resetAll">{{ $t('firmy.clearFilters') }}</button>
          </div>

          <ul v-else class="dir-list">
            <li v-for="co in items" :key="co.publicId">
              <NuxtLink :to="`/firmy/${co.slug}`" class="dir-card">
                <div class="dir-card-icon">
                  <v-icon :icon="categoryIcon(co.category)" size="22" />
                </div>
                <div class="dir-card-body">
                  <div class="dir-card-name">
                    {{ co.name }}
                    <span v-if="co.status === 'unverified'" class="dir-badge">{{ $t('firmy.unverified') }}</span>
                  </div>
                  <div class="dir-card-meta">
                    <span class="dir-card-cat">{{ categoryLabel(co.category) }}</span>
                    <span v-if="co.city" class="dir-card-city"><v-icon icon="mdi-map-marker-outline" size="13" />{{ co.city }}</span>
                    <span v-if="co.countryCode" class="dir-card-country" :title="countryName(co.countryCode)">{{ co.countryCode }}</span>
                  </div>
                </div>
                <v-icon icon="mdi-chevron-right" size="18" class="dir-card-arrow" />
              </NuxtLink>
            </li>
          </ul>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="dir-pager">
            <button class="dir-pager-btn" :disabled="page <= 1" @click="goPage(page - 1)">
              <v-icon icon="mdi-chevron-left" size="18" /> {{ $t('firmy.prev') }}
            </button>
            <span class="dir-pager-info">{{ $t('firmy.pageOf', { page, total: totalPages }) }}</span>
            <button class="dir-pager-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
              {{ $t('firmy.next') }} <v-icon icon="mdi-chevron-right" size="18" />
            </button>
          </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface DirCompany {
  publicId: string; slug: string; name: string; category: string;
  countryCode?: string | null; city?: string | null; website?: string | null; status: string;
}
interface Facet { value: string; count: number }

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// EU + UK + Norway + Switzerland (blueprint: docelowy zasięg geograficzny).
const COUNTRY_NAMES: Record<string, string> = {
  PL: 'Polska', DE: 'Niemcy', FR: 'Francja', IT: 'Włochy', ES: 'Hiszpania', NL: 'Holandia',
  BE: 'Belgia', AT: 'Austria', CZ: 'Czechy', SK: 'Słowacja', SE: 'Szwecja', DK: 'Dania',
  FI: 'Finlandia', NO: 'Norwegia', CH: 'Szwajcaria', GB: 'Wielka Brytania', IE: 'Irlandia',
  PT: 'Portugalia', GR: 'Grecja', HU: 'Węgry', RO: 'Rumunia', BG: 'Bułgaria', HR: 'Chorwacja',
  SI: 'Słowenia', LT: 'Litwa', LV: 'Łotwa', EE: 'Estonia', LU: 'Luksemburg', CY: 'Cypr',
  MT: 'Malta',
}
function countryName(code: string) { return COUNTRY_NAMES[code] ?? code }

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  'komisy':      { label: 'Komisy samochodowe',      icon: 'mdi-car-multiple' },
  'dealerzy':    { label: 'Dealerzy',                icon: 'mdi-car-estate' },
  'warsztaty':   { label: 'Warsztaty',               icon: 'mdi-wrench' },
  'wulkanizacje':{ label: 'Wulkanizacje',            icon: 'mdi-tire' },
  'detailing':   { label: 'Detailing',               icon: 'mdi-spray' },
  'transport':   { label: 'Transport i spedycja',    icon: 'mdi-truck' },
  'leasing':     { label: 'Leasing',                 icon: 'mdi-cash-multiple' },
  'ubezpieczenia':{ label: 'Ubezpieczenia',          icon: 'mdi-shield-car' },
  'skp':         { label: 'Stacje kontroli',         icon: 'mdi-clipboard-check-outline' },
  'myjnie':      { label: 'Myjnie',                  icon: 'mdi-car-wash' },
  'czesci':      { label: 'Części',                  icon: 'mdi-cog' },
  'maszyny':     { label: 'Maszyny',                 icon: 'mdi-excavator' },
  'jachty':      { label: 'Jachty i łodzie',         icon: 'mdi-sail-boat' },
  'firmy':       { label: 'Pozostałe firmy',         icon: 'mdi-domain' },
}
function categoryLabel(v: string) { return CATEGORY_META[v]?.label ?? v }
function categoryIcon(v: string) { return CATEGORY_META[v]?.icon ?? 'mdi-domain' }

function pluralFirm(n: number) {
  const t = n % 10, h = n % 100
  if (n === 1) return 'firmę'
  if (t >= 2 && t <= 4 && !(h >= 12 && h <= 14)) return 'firmy'
  return 'firm'
}

// State from query
const q = computed(() => (route.query.q as string) || '')
const activeCategory = computed(() => (route.query.category as string) || null)
const activeCountry = computed(() => (route.query.country as string) || null)
const page = computed(() => Math.max(1, parseInt((route.query.page as string) || '1') || 1))
const qInput = ref(q.value)
watch(q, (v) => { qInput.value = v })

const view = ref<'list' | 'map'>('list')

const PAGE_SIZE = 24

const { data, pending } = await useAsyncData(
  'directory-list',
  () => $fetch<{ items: DirCompany[]; total: number }>('/api/proxy/api/directory', {
    query: {
      q: q.value || undefined,
      category: activeCategory.value || undefined,
      country: activeCountry.value || undefined,
      page: page.value,
      pageSize: PAGE_SIZE,
    },
  }),
  { watch: [q, activeCategory, activeCountry, page], default: () => ({ items: [], total: 0 }) },
)

// Category facets follow the selected country; country facets are global.
const { data: facetData } = await useAsyncData(
  'directory-facets',
  () => $fetch<{ categories: Facet[]; countries: Facet[] }>('/api/proxy/api/directory/facets', {
    query: { country: activeCountry.value || undefined },
  }),
  { watch: [activeCountry], default: () => ({ categories: [], countries: [] }) },
)

const items = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))
const categoryFacets = computed(() => facetData.value?.categories ?? [])
const countryFacets = computed(() => facetData.value?.countries ?? [])
const totalAll = computed(() => categoryFacets.value.reduce((s, c) => s + c.count, 0))

function applySearch() {
  router.push({ query: { ...cleanQuery(), q: qInput.value || undefined, page: undefined } })
}
function setCategory(cat: string | null) {
  router.push({ query: { ...cleanQuery(), category: cat || undefined, page: undefined } })
}
function setCountry(country: string | null) {
  // Changing country resets the category too (facets are country-scoped).
  router.push({ query: { ...cleanQuery(), country: country || undefined, category: undefined, page: undefined } })
}
function goPage(p: number) {
  router.push({ query: { ...route.query, page: p > 1 ? p : undefined } })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
function resetAll() { router.push({ query: {} }) }
function cleanQuery() {
  const { ...rest } = route.query
  return rest
}

useHead({
  title: 'Firmy motoryzacyjne — CARIZO',
  meta: [{ name: 'description', content: 'Baza firm motoryzacyjnych i transportowych: komisy, dealerzy, warsztaty, transport i więcej.' }],
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/firmy` }],
})
</script>

<style lang="scss" scoped>
.dir-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }

.dir-hero {
  padding: 56px 0 40px; text-align: center; border-bottom: 1px solid $border;
  background: radial-gradient(ellipse at 50% 0%, rgba($red, 0.12) 0%, transparent 62%);
}
.dir-hero-inner { @include container; max-width: 720px; }
.dir-eyebrow {
  font-size: 10px; font-weight: 700; color: $red; letter-spacing: 4px; text-transform: uppercase;
  display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 14px;
  &::before, &::after { content: ''; display: block; width: 32px; height: 1px; background: $red; opacity: .6; }
}
.dir-title { font-size: clamp(28px, 5vw, 42px); font-weight: 800; color: $text; line-height: 1.12; margin: 0 0 10px; }
.dir-sub { color: $text-muted; font-size: 16px; margin: 0 0 28px; }

.dir-search {
  display: flex; align-items: center; gap: 8px; max-width: 560px; margin: 0 auto;
  background: $card; border: 1px solid $border; border-radius: 12px; padding: 6px 6px 6px 14px;
  &-icon { color: $text-muted; flex-shrink: 0; }
  &-input {
    flex: 1; background: transparent; border: none; outline: none; color: $text; font-size: 15px;
    &::placeholder { color: $text-muted; }
  }
  &-btn {
    background: $red; color: #fff; border: none; border-radius: 8px; padding: 10px 20px;
    font-weight: 600; font-size: 14px; cursor: pointer; flex-shrink: 0;
    &:hover { filter: brightness(1.08); }
  }
}

.dir-body { @include container; padding-top: 32px; padding-bottom: 80px; }
.dir-grid { display: grid; grid-template-columns: 260px 1fr; gap: 28px; align-items: start; }

.dir-filters {
  position: sticky; top: calc(#{$nav-height} + 16px);
  background: $card; border: 1px solid $border; border-radius: 12px; padding: 18px;
}
.dir-filter-h {
  font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: $text-muted;
  margin: 0 0 12px; font-weight: 700;
}
.dir-facet {
  display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px;
  background: transparent; border: none; color: $text; padding: 8px 10px; border-radius: 8px;
  cursor: pointer; font-size: 14px; text-align: left;
  &:hover { background: rgba($red, 0.08); }
  &.active { background: rgba($red, 0.14); color: $red; font-weight: 600; }
  &-count { font-size: 12px; color: $text-muted; font-variant-numeric: tabular-nums; }
  &.active &-count { color: $red; }
}

.dir-results-head { color: $text-muted; font-size: 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; strong { color: $text; } }
.dir-viewtoggle { display: flex; gap: 2px; background: $card; border: 1px solid $border; border-radius: 8px; padding: 2px;
  button { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: none; color: $text-muted; font-size: 13px; padding: 6px 12px; border-radius: 6px; cursor: pointer;
    &.active { background: rgba($red, .16); color: $red; } &:hover:not(.active) { color: $text; } } }
.dir-loading, .dir-empty { text-align: center; padding: 60px 20px; color: $text-muted; }
.dir-empty p { margin: 12px 0; }
.dir-reset { background: $red; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; cursor: pointer; font-weight: 600; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.dir-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.dir-card {
  display: flex; align-items: center; gap: 14px; text-decoration: none;
  background: $card; border: 1px solid $border; border-radius: 12px; padding: 14px 16px;
  transition: border-color .15s, transform .15s;
  &:hover { border-color: $red; transform: translateY(-1px); }
  &-icon {
    width: 44px; height: 44px; flex-shrink: 0; border-radius: 10px; display: grid; place-items: center;
    background: rgba($red, 0.12); color: $red;
  }
  &-body { min-width: 0; flex: 1; }
  &-name { color: $text; font-weight: 650; font-size: 15.5px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; color: $text-muted; font-size: 13px; flex-wrap: wrap; }
  &-city { display: inline-flex; align-items: center; gap: 3px; }
  &-country { font-family: monospace; font-size: 11px; border: 1px solid $border; border-radius: 4px; padding: 1px 5px; }
  &-arrow { color: $text-muted; flex-shrink: 0; }
  &:hover &-arrow { color: $red; }
}
.dir-badge {
  font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
  color: #b6791b; background: rgba(#b6791b, .14); padding: 2px 7px; border-radius: 20px;
}

.dir-pager { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 28px; }
.dir-pager-btn {
  display: inline-flex; align-items: center; gap: 4px; background: $card; border: 1px solid $border;
  color: $text; border-radius: 8px; padding: 9px 16px; cursor: pointer; font-size: 14px;
  &:hover:not(:disabled) { border-color: $red; color: $red; }
  &:disabled { opacity: .4; cursor: not-allowed; }
}
.dir-pager-info { color: $text-muted; font-size: 14px; font-variant-numeric: tabular-nums; }

@media (max-width: 860px) {
  .dir-grid { grid-template-columns: 1fr; }
  .dir-filters { position: static; }
}
</style>
