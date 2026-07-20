<template>
  <div class="cp-page">
    <div v-if="pending" class="cp-loading"><v-icon icon="mdi-loading" size="34" class="spin" /></div>

    <div v-else-if="!company" class="cp-notfound">
      <v-icon icon="mdi-office-building-outline" size="52" />
      <h1>Nie znaleziono firmy</h1>
      <p>Ta firma nie istnieje lub została usunięta z katalogu.</p>
      <NuxtLink to="/firmy" class="cp-back-btn">Wróć do katalogu</NuxtLink>
    </div>

    <template v-else>
      <section class="cp-hero">
        <div class="cp-hero-inner">
          <NuxtLink to="/firmy" class="cp-crumb"><v-icon icon="mdi-chevron-left" size="16" /> Firmy</NuxtLink>
          <div class="cp-head">
            <div class="cp-icon"><v-icon :icon="categoryIcon(company.category)" size="30" /></div>
            <div>
              <h1 class="cp-name">{{ company.name }}</h1>
              <div class="cp-tags">
                <span class="cp-cat">{{ categoryLabel(company.category) }}</span>
                <span v-if="company.status === 'unverified'" class="cp-badge">niezweryfikowana</span>
                <span v-else-if="company.status === 'active'" class="cp-badge cp-badge--ok"><v-icon icon="mdi-check-decagram" size="13" /> zweryfikowana</span>
              </div>
              <div v-if="(company.availableLanguages?.length ?? 0) > 1" class="cp-langs">
                <v-icon icon="mdi-translate" size="14" />
                <button
                  v-for="l in company.availableLanguages" :key="l"
                  class="cp-lang" :class="{ active: currentLang === l }"
                  @click="setLang(l)">{{ l.toUpperCase() }}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cp-body">
        <div class="cp-grid">
          <div class="cp-main">
            <div v-if="company.description" class="cp-card">
              <h2 class="cp-card-h">O firmie</h2>
              <p class="cp-desc">{{ company.description }}</p>
            </div>

            <div class="cp-card">
              <h2 class="cp-card-h">Dane kontaktowe</h2>
              <dl class="cp-dl">
                <template v-if="fullAddress">
                  <dt><v-icon icon="mdi-map-marker-outline" size="16" /> Adres</dt>
                  <dd>{{ fullAddress }}</dd>
                </template>
                <template v-if="company.phone">
                  <dt><v-icon icon="mdi-phone-outline" size="16" /> Telefon</dt>
                  <dd><a :href="`tel:${company.phone}`">{{ company.phone }}</a></dd>
                </template>
                <template v-if="company.email">
                  <dt><v-icon icon="mdi-email-outline" size="16" /> E-mail</dt>
                  <dd><a :href="`mailto:${company.email}`">{{ company.email }}</a></dd>
                </template>
                <template v-if="company.website">
                  <dt><v-icon icon="mdi-web" size="16" /> Strona</dt>
                  <dd><a :href="normalizedWebsite" target="_blank" rel="noopener nofollow">{{ company.website }}</a></dd>
                </template>
                <template v-if="!hasContact">
                  <dd class="cp-nocontact">Brak danych kontaktowych w katalogu.</dd>
                </template>
              </dl>
            </div>

            <div v-if="listings.length" class="cp-card">
              <h2 class="cp-card-h">Ogłoszenia tej firmy <span class="cp-count">{{ listingsTotal }}</span></h2>
              <ul class="cp-listings">
                <li v-for="ad in listings" :key="ad.id">
                  <NuxtLink :to="`/advert/${ad.id}`" class="cp-listing">
                    <div class="cp-listing-img">
                      <img :src="getImageUrl(ad.imageUrl, undefined, { width: 160, height: 120 })" :alt="ad.title" loading="lazy" width="80" height="60" />
                      <span v-if="ad.badge" class="cp-listing-badge">{{ ad.badge }}</span>
                    </div>
                    <div class="cp-listing-body">
                      <div class="cp-listing-title">{{ ad.title }}</div>
                      <div class="cp-listing-meta">
                        <span v-if="ad.year">{{ ad.year }}</span>
                        <span v-if="ad.mileage != null">{{ ad.mileage.toLocaleString('pl') }} km</span>
                      </div>
                    </div>
                    <div class="cp-listing-price">{{ ad.price.toLocaleString('pl') }} {{ ad.currency === 'PLN' ? 'zł' : ad.currency }}</div>
                  </NuxtLink>
                </li>
              </ul>
              <p v-if="listingsTotal > listings.length" class="cp-listings-more">
                …oraz {{ listingsTotal - listings.length }} więcej ogłoszeń tej firmy.
              </p>
            </div>

            <div v-if="isOwnerClaimable" class="cp-claim">
              <v-icon icon="mdi-shield-account-outline" size="20" />
              <div>
                <strong>To Twoja firma?</strong>
                <p>Przejmij profil i zarządzaj danymi w panelu „Dla firm".</p>
              </div>
              <NuxtLink to="/dla-firm" class="cp-claim-btn">Przejmij profil</NuxtLink>
            </div>
          </div>

          <aside class="cp-side">
            <div class="cp-card">
              <h2 class="cp-card-h">Identyfikator</h2>
              <div class="cp-id">{{ company.publicId }}</div>
              <p class="cp-id-note">Globalny Carizo ID — stały identyfikator tej firmy w bazie.</p>
              <div class="cp-meta-row"><span>Dodano</span><span>{{ fmtDate(company.createdAt) }}</span></div>
              <div class="cp-meta-row"><span>Aktualizacja</span><span>{{ fmtDate(company.updatedAt) }}</span></div>
            </div>
          </aside>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
interface DirCompanyDetail {
  publicId: string; slug: string; name: string; category: string;
  countryCode?: string | null; city?: string | null; address?: string | null;
  postalCode?: string | null; phone?: string | null; email?: string | null;
  website?: string | null; profileUrl?: string | null; language?: string | null;
  description?: string | null; linked?: boolean; availableLanguages?: string[];
  status: string; createdAt: string; updatedAt: string;
}

const route = useRoute()
const config = useRuntimeConfig()
const { getImageUrl } = useImageUrl()
const slug = computed(() => route.params.slug as string)

interface ListingCard {
  id: number; slug?: string | null; title: string; price: number; currency: string;
  year?: number | null; mileage?: number | null; brandName?: string | null;
  modelName?: string | null; imageUrl?: string | null; badge?: string | null;
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  'komisy': { label: 'Komis samochodowy', icon: 'mdi-car-multiple' },
  'dealerzy': { label: 'Dealer', icon: 'mdi-car-estate' },
  'warsztaty': { label: 'Warsztat', icon: 'mdi-wrench' },
  'wulkanizacje': { label: 'Wulkanizacja', icon: 'mdi-tire' },
  'detailing': { label: 'Detailing', icon: 'mdi-spray' },
  'transport': { label: 'Transport i spedycja', icon: 'mdi-truck' },
  'leasing': { label: 'Leasing', icon: 'mdi-cash-multiple' },
  'ubezpieczenia': { label: 'Ubezpieczenia', icon: 'mdi-shield-car' },
  'skp': { label: 'Stacja kontroli', icon: 'mdi-clipboard-check-outline' },
  'myjnie': { label: 'Myjnia', icon: 'mdi-car-wash' },
  'czesci': { label: 'Części', icon: 'mdi-cog' },
  'maszyny': { label: 'Maszyny', icon: 'mdi-excavator' },
  'jachty': { label: 'Jachty i łodzie', icon: 'mdi-sail-boat' },
  'firmy': { label: 'Firma', icon: 'mdi-domain' },
}
function categoryLabel(v: string) { return CATEGORY_META[v]?.label ?? v }
function categoryIcon(v: string) { return CATEGORY_META[v]?.icon ?? 'mdi-domain' }

// Viewer's chosen language for this company (base language by default; switched via the chips).
const currentLang = ref<string | null>(null)
function setLang(l: string) { currentLang.value = l }

const { data: company, pending } = await useAsyncData(
  () => `directory-${slug.value}`,
  () => $fetch<DirCompanyDetail>(`/api/proxy/api/directory/${slug.value}`, {
    query: { lang: currentLang.value || undefined },
  }).catch(() => null),
  { watch: [slug, currentLang] },
)

const fullAddress = computed(() => {
  if (!company.value) return ''
  return [company.value.address, [company.value.postalCode, company.value.city].filter(Boolean).join(' ')]
    .filter(Boolean).join(', ')
})
const hasContact = computed(() => !!company.value && !!(company.value.phone || company.value.email || company.value.website || fullAddress.value))
const normalizedWebsite = computed(() => {
  const w = company.value?.website
  if (!w) return '#'
  return w.startsWith('http') ? w : `https://${w}`
})
// Adverts published by this company (graph edge Firma -> Ogłoszenia). Only resolvable once the
// company is linked to a Carizo account, so this is empty for seeded/un-claimed rows.
const { data: listingsData } = await useAsyncData(
  () => `directory-listings-${slug.value}`,
  () => $fetch<{ items: ListingCard[]; total: number; linked: boolean }>(`/api/proxy/api/directory/${slug.value}/listings`)
    .catch(() => ({ items: [], total: 0, linked: false })),
  { watch: [slug] },
)
const listings = computed(() => listingsData.value?.items ?? [])
const listingsTotal = computed(() => listingsData.value?.total ?? 0)

// A seeded, un-claimed row (no linked partner) can be claimed by its owner.
const isOwnerClaimable = computed(() => !!company.value && !company.value.linked)

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return '—' }
}

useHead(() => ({
  title: company.value ? `${company.value.name} — CARIZO` : 'Firma — CARIZO',
  meta: [{
    name: 'description',
    content: company.value
      ? `${company.value.name} — ${categoryLabel(company.value.category)}${company.value.city ? ', ' + company.value.city : ''}. Dane kontaktowe w katalogu firm CARIZO.`
      : 'Katalog firm motoryzacyjnych CARIZO.',
  }],
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/firmy/${slug.value}` }],
}))
</script>

<style lang="scss" scoped>
.cp-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }
.cp-loading, .cp-notfound { text-align: center; padding: 90px 20px; color: $text-muted; }
.cp-notfound h1 { color: $text; margin: 16px 0 8px; font-size: 24px; }
.cp-back-btn, .cp-claim-btn { display: inline-block; margin-top: 16px; background: $red; color: #fff;
  text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.cp-hero { border-bottom: 1px solid $border; background: radial-gradient(ellipse at 30% 0%, rgba($red, .1) 0%, transparent 60%); }
.cp-hero-inner { @include container; padding-top: 24px; padding-bottom: 28px; }
.cp-crumb { display: inline-flex; align-items: center; gap: 2px; color: $text-muted; text-decoration: none; font-size: 14px; margin-bottom: 18px;
  &:hover { color: $red; } }
.cp-head { display: flex; align-items: center; gap: 18px; }
.cp-icon { width: 60px; height: 60px; flex-shrink: 0; border-radius: 14px; display: grid; place-items: center; background: rgba($red, .14); color: $red; }
.cp-name { font-size: clamp(22px, 4vw, 32px); font-weight: 800; color: $text; margin: 0 0 8px; line-height: 1.1; }
.cp-tags { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cp-cat { color: $text-muted; font-size: 14px; }
.cp-langs { display: flex; align-items: center; gap: 4px; margin-top: 10px; color: $text-muted;
  .cp-lang { background: transparent; border: 1px solid $border; color: $text-muted; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; cursor: pointer;
    &.active { background: rgba($red,.16); border-color: rgba($red,.4); color: $red; } &:hover:not(.active) { color: $text; } } }
.cp-badge { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: #b6791b; background: rgba(#b6791b, .14); padding: 3px 9px; border-radius: 20px; display: inline-flex; align-items: center; gap: 3px;
  &--ok { color: #2e9d5b; background: rgba(#2e9d5b, .14); } }

.cp-body { @include container; padding-top: 28px; padding-bottom: 80px; }
.cp-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
.cp-card { background: $card; border: 1px solid $border; border-radius: 12px; padding: 22px; margin-bottom: 16px; }
.cp-card-h { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: $text-muted; margin: 0 0 16px; font-weight: 700; }

.cp-count { font-size: 12px; color: $text-muted; font-weight: 600; background: rgba($red,.12); padding: 2px 9px; border-radius: 20px; margin-left: 6px; }
.cp-desc { color: $text-muted; font-size: 14.5px; line-height: 1.6; margin: 0; white-space: pre-line; }

.cp-listings { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.cp-listing { display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 8px; border-radius: 10px; transition: background .15s;
  &:hover { background: rgba($red,.06); } }
.cp-listing-img { position: relative; width: 80px; height: 60px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #111;
  img { width: 100%; height: 100%; object-fit: cover; } }
.cp-listing-badge { position: absolute; top: 3px; left: 3px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; background: $red; color: #fff; padding: 1px 5px; border-radius: 3px; }
.cp-listing-body { flex: 1; min-width: 0; }
.cp-listing-title { color: $text; font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-listing-meta { display: flex; gap: 10px; color: $text-muted; font-size: 12.5px; margin-top: 3px; }
.cp-listing-price { color: $red; font-weight: 700; font-size: 14.5px; white-space: nowrap; }
.cp-listings-more { color: $text-muted; font-size: 13px; margin: 10px 0 0; }

.cp-dl { display: grid; grid-template-columns: 130px 1fr; gap: 12px 16px; margin: 0; }
.cp-dl dt { color: $text-muted; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
.cp-dl dd { margin: 0; color: $text; font-size: 15px; a { color: $red; text-decoration: none; &:hover { text-decoration: underline; } } }
.cp-nocontact { grid-column: 1 / -1; color: $text-muted; font-style: italic; }

.cp-claim { display: flex; align-items: center; gap: 14px; background: rgba($red, .08); border: 1px solid rgba($red, .2); border-radius: 12px; padding: 16px 18px;
  strong { color: $text; } p { margin: 2px 0 0; color: $text-muted; font-size: 13.5px; }
  .cp-claim-btn { margin: 0 0 0 auto; flex-shrink: 0; } }
.cp-claim > .v-icon { color: $red; flex-shrink: 0; }

.cp-id { font-family: monospace; font-size: 13px; color: $red; word-break: break-all; background: rgba($red, .08); padding: 8px 10px; border-radius: 6px; }
.cp-id-note { font-size: 12px; color: $text-muted; margin: 8px 0 16px; }
.cp-meta-row { display: flex; justify-content: space-between; font-size: 13px; padding: 7px 0; border-top: 1px solid $border;
  span:first-child { color: $text-muted; } span:last-child { color: $text; font-variant-numeric: tabular-nums; } }

@media (max-width: 820px) { .cp-grid { grid-template-columns: 1fr; } }
</style>
