<template>
    <div class="seller-page">

        <div v-if="pageLoading" class="page-loading">
            <v-icon icon="mdi-loading" size="40" class="spin" />
        </div>

        <template v-else-if="seller">
            <div class="seller-hero">
                <div class="container">
                    <div class="hero-inner">
                        <div class="seller-avatar">
                            <v-icon icon="mdi-account-circle" size="72" />
                        </div>
                        <div class="seller-identity">
                            <div class="seller-badges">
                                <span v-if="seller.accountType === 'Business'" class="badge-business">
                                    <v-icon icon="mdi-domain" size="12" /> Dealer
                                </span>
                                <span v-if="seller.isAdmin" class="badge-verified">
                                    <v-icon icon="mdi-check-decagram" size="12" /> Verified
                                </span>
                            </div>
                            <h1 class="seller-name">
                                {{ sellerDisplayName }}
                            </h1>
                            <div class="seller-meta">
                                <span v-if="seller.city || seller.region" class="meta-item">
                                    <v-icon icon="mdi-map-marker-outline" size="14" />
                                    {{ [seller.city, seller.region].filter(Boolean).join(', ') }}
                                </span>
                                <span class="meta-item">
                                    <v-icon icon="mdi-calendar-outline" size="14" />
                                    Na CARIZO od {{ joinedYear }}
                                </span>
                            </div>
                            <div v-if="seller.about" class="seller-about">{{ seller.about }}</div>
                        </div>
                        <div class="seller-actions">
                            <button v-if="!isSelf" class="btn-follow" :class="{ following: isFollowing }" :disabled="followLoading" @click="toggleFollow">
                                <v-icon :icon="isFollowing ? 'mdi-account-check' : 'mdi-account-plus-outline'" size="16" />
                                {{ isFollowing ? 'Obserwujesz' : 'Obserwuj' }}
                            </button>
                            <button v-if="!isSelf" class="btn-message" :title="!isLoggedIn ? 'Zaloguj się, aby pisać wiadomości' : 'Otwórz ogłoszenie sprzedawcy, by napisać wiadomość'" @click="handleMessage">
                                <v-icon icon="mdi-message-outline" size="16" />
                                Napisz
                            </button>
                        </div>
                    </div>

                    <div v-if="stats" class="seller-stats-row">
                        <div class="stat-pill">
                            <div class="stat-val">{{ stats.activeAdverts }}</div>
                            <div class="stat-lbl">aktywnych ogłoszeń</div>
                        </div>
                        <div class="stat-pill">
                            <div class="stat-val">{{ stats.totalSold }}</div>
                            <div class="stat-lbl">sprzedanych</div>
                        </div>
                        <div class="stat-pill">
                            <div class="stat-val">{{ stats.reviewCount }}</div>
                            <div class="stat-lbl">opinii</div>
                        </div>
                        <div class="stat-pill highlight">
                            <div class="stat-val">
                                <v-icon icon="mdi-star" size="14" class="star-ic" />
                                {{ stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—' }}
                            </div>
                            <div class="stat-lbl">średnia ocena</div>
                        </div>
                        <div class="stat-pill">
                            <div class="stat-val">{{ stats.responseRate > 0 ? `${Math.round(stats.responseRate)}%` : '—' }}</div>
                            <div class="stat-lbl">odpowiedzi</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container page-body">
                <div class="tabs-row">
                    <button
                        v-for="tab in tabs"
                        :key="tab.key"
                        class="tab-btn"
                        :class="{ active: activeTab === tab.key }"
                        @click="activeTab = tab.key"
                    >
                        {{ tab.label }}
                        <span v-if="tab.count != null" class="tab-count">{{ tab.count }}</span>
                    </button>
                </div>

                <div v-if="activeTab === 'adverts'">
                    <div v-if="advertsLoading" class="section-loading">
                        <v-icon icon="mdi-loading" size="32" class="spin" />
                    </div>
                    <div v-else-if="!adverts.length" class="empty-state">
                        <v-icon icon="mdi-car-off" size="40" />
                        <p>Brak aktywnych ogłoszeń</p>
                    </div>
                    <div v-else class="adverts-grid">
                        <AdvertCard
                            v-for="ad in adverts"
                            :key="ad.id"
                            :advert="ad"
                        />
                    </div>
                    <div v-if="advertsTotalCount > adverts.length" class="load-more-row">
                        <button class="btn-load-more" :disabled="advertsLoading" @click="loadMoreAdverts">
                            Załaduj więcej
                        </button>
                    </div>
                </div>

                <div v-if="activeTab === 'reviews'">
                    <div v-if="reviewsLoading" class="section-loading">
                        <v-icon icon="mdi-loading" size="32" class="spin" />
                    </div>
                    <div v-else-if="!reviews.length" class="empty-state">
                        <v-icon icon="mdi-star-off-outline" size="40" />
                        <p>Brak opinii</p>
                    </div>
                    <div v-else class="reviews-list">
                        <div v-for="rev in reviews" :key="rev.id" class="review-card">
                            <div class="rev-header">
                                <div class="rev-author">
                                    <v-icon icon="mdi-account-circle" size="32" class="rev-avatar" />
                                    <div>
                                        <div class="rev-name">{{ rev.buyerName }}</div>
                                        <div class="rev-date">{{ formatDate(rev.createdAt) }}</div>
                                    </div>
                                </div>
                                <div class="rev-stars">
                                    <v-icon
                                        v-for="n in 5"
                                        :key="n"
                                        :icon="n <= rev.rating ? 'mdi-star' : 'mdi-star-outline'"
                                        size="16"
                                        :class="n <= rev.rating ? 'star-filled' : 'star-empty'"
                                    />
                                </div>
                            </div>
                            <p v-if="rev.content" class="rev-content">{{ rev.content }}</p>
                            <div v-if="rev.isVerifiedPurchase" class="rev-verified">
                                <v-icon icon="mdi-check-circle-outline" size="13" /> Potwierdzona transakcja
                            </div>
                        </div>
                    </div>
                    <div v-if="reviewsTotalCount > reviews.length" class="load-more-row">
                        <button class="btn-load-more" :disabled="reviewsLoading" @click="loadMoreReviews">
                            Załaduj więcej opinii
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="not-found">
            <v-icon icon="mdi-account-off-outline" size="64" />
            <h2>Nie znaleziono sprzedawcy</h2>
            <NuxtLink to="/adverts" class="btn-back">Przeglądaj ogłoszenia</NuxtLink>
        </div>

    </div>
</template>

<script setup lang="ts">
import type { UserProfile, UserStats, CarAdvert, Review, ReviewsResult, PagedResult } from '~/types'

const route = useRoute()
const sellerId = Number(route.params.id)

const { getSellerReviews } = useReviews()
const { isFollowingSeller, followSeller, unfollowSeller } = useFollow()
const { error: toastError } = useToast()

const authCookie = useCookie('auth_status')
const isLoggedIn = computed(() => authCookie.value === '1')

const pageLoading = ref(true)
const seller = ref<UserProfile | null>(null)
const stats = ref<UserStats | null>(null)
const currentUserId = ref<number | null>(null)

// SSR-compatible fetch so crawlers receive SEO meta tags in the initial HTML
const { data: ssrSellerData } = await useAsyncData(`seller-${sellerId}`, () =>
    Promise.allSettled([
        $fetch<UserProfile>(`/api/proxy/api/User/${sellerId}/public`),
        $fetch<UserStats>(`/api/proxy/api/User/${sellerId}/stats`),
    ])
)
if (ssrSellerData.value) {
    const [profileRes, statsRes] = ssrSellerData.value
    if (profileRes.status === 'fulfilled') seller.value = profileRes.value
    if (statsRes.status === 'fulfilled') stats.value = statsRes.value
    pageLoading.value = !seller.value
}

const sellerConfig = useRuntimeConfig()
useHead(computed(() => {
    const s = seller.value
    if (!s) return { title: 'Sprzedawca — CARIZO' }
    const displayName = s.accountType === 'Business' && s.companyName
        ? s.companyName
        : [s.name, s.surname].filter(Boolean).join(' ') || 'Sprzedawca'
    const desc = `Sprawdź ogłoszenia sprzedawcy ${displayName} na CARIZO — największej platformie motoryzacyjnej w Polsce.`
    const pageUrl = `${sellerConfig.public.siteUrl}/seller/${sellerId}`
    const ogImage = s.avatarUrl ?? `${sellerConfig.public.siteUrl}/og-image.jpg`
    return {
        title: `${displayName} — CARIZO`,
        meta: [
            { name: 'description', content: desc },
            { property: 'og:type', content: 'profile' },
            { property: 'og:url', content: pageUrl },
            { property: 'og:title', content: `${displayName} — CARIZO` },
            { property: 'og:description', content: desc },
            { property: 'og:image', content: ogImage },
            { property: 'og:site_name', content: 'CARIZO' },
            { name: 'twitter:card', content: 'summary' },
            { name: 'twitter:title', content: `${displayName} — CARIZO` },
            { name: 'twitter:description', content: desc },
            { name: 'twitter:image', content: ogImage },
        ],
        link: [{ rel: 'canonical', href: pageUrl }]
    }
}))

const adverts = ref<CarAdvert[]>([])
const advertsTotalCount = ref(0)
const advertsPage = ref(1)
const advertsLoading = ref(false)

const reviews = ref<Review[]>([])
const reviewsTotalCount = ref(0)
const reviewsPage = ref(1)
const reviewsLoading = ref(false)
const reviewsAvg = ref(0)

const isFollowing = ref(false)
const followLoading = ref(false)

const activeTab = ref<'adverts' | 'reviews'>('adverts')

const isSelf = computed(() => isLoggedIn.value && currentUserId.value === sellerId)

const sellerDisplayName = computed(() => {
    if (!seller.value) return 'Sprzedawca'
    if (seller.value.accountType === 'Business' && seller.value.companyName) return seller.value.companyName
    const parts = [seller.value.name, seller.value.surname].filter(Boolean)
    return parts.length ? parts.join(' ') : 'Sprzedawca'
})

const joinedYear = computed(() => {
    if (!seller.value?.createdAt) return '?'
    return new Date(seller.value.createdAt).getFullYear()
})

const tabs = computed(() => [
    { key: 'adverts', label: 'Ogłoszenia', count: advertsTotalCount.value || null },
    { key: 'reviews', label: 'Opinie', count: reviewsTotalCount.value || null },
])

async function loadAdverts(reset = false) {
    advertsLoading.value = true
    if (reset) { adverts.value = []; advertsPage.value = 1 }
    try {
        const res = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/listings/search', {
            method: 'POST',
            body: { userId: sellerId, page: advertsPage.value, pageSize: 12 } as any
        })
        adverts.value.push(...res.items)
        advertsTotalCount.value = res.totalCount
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować ogłoszeń sprzedawcy.')
    } finally { advertsLoading.value = false }
}

async function loadMoreAdverts() {
    advertsPage.value++
    await loadAdverts()
}

async function loadReviews(reset = false) {
    reviewsLoading.value = true
    if (reset) { reviews.value = []; reviewsPage.value = 1 }
    try {
        const res: ReviewsResult = await getSellerReviews(sellerId, reviewsPage.value, 10)
        reviews.value.push(...res.items)
        reviewsTotalCount.value = res.totalCount
        reviewsAvg.value = res.averageRating
    } catch (e: any) {
        toastError(e?.data?.message ?? 'Nie udało się załadować opinii.')
    } finally { reviewsLoading.value = false }
}

async function loadMoreReviews() {
    reviewsPage.value++
    await loadReviews()
}

async function toggleFollow() {
    if (!isLoggedIn.value) { navigateTo('/login'); return }
    followLoading.value = true
    try {
        if (isFollowing.value) {
            await unfollowSeller(sellerId)
            isFollowing.value = false
        } else {
            await followSeller(sellerId)
            isFollowing.value = true
        }
    } finally { followLoading.value = false }
}

function formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })
}

function handleMessage() {
    if (!isLoggedIn.value) { navigateTo('/login'); return }
    // Messaging requires an advert context — scroll to adverts tab or use first available advert
    const firstAdvert = adverts.value[0]
    if (firstAdvert) {
        navigateTo(`/advert/${firstAdvert.id}`)
    } else {
        navigateTo('/messages')
    }
}

onMounted(async () => {
    if (isLoggedIn.value) {
        try {
            const me = await $fetch<UserProfile>('/api/proxy/api/User/me')
            currentUserId.value = me.id
        } catch {}
    }

    // Client-only secondary data loads (auth-dependent or pagination)
    if (seller.value) {
        await Promise.all([
            loadAdverts(true),
            loadReviews(true),
        ])
        if (isLoggedIn.value) {
            isFollowing.value = await isFollowingSeller(sellerId)
        }
    }
    pageLoading.value = false
})
</script>

<style lang="scss" scoped>
.seller-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }
.container { @include container; }

.page-loading, .not-found {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 20px; color: $text-dim;
    h2 { font-size: 22px; font-weight: 700; color: $text; }
}

.btn-back {
    background: $red; color: white; border-radius: $r-md;
    font-size: 14px; font-weight: 700; padding: 12px 28px; text-decoration: none;
    &:hover { opacity: 0.88; }
}

.seller-hero {
    border-bottom: 1px solid $border;
    background: linear-gradient(180deg, #0d0005 0%, $bg 100%);
    padding: 40px 0 0;
}

.hero-inner {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: wrap;
    padding-bottom: 32px;
}

.seller-avatar {
    color: $text-dim;
    flex-shrink: 0;
}

.seller-identity { flex: 1; min-width: 200px; }

.seller-badges {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
}

.badge-business, .badge-verified {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 999px;
}
.badge-business { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.25); }
.badge-verified { background: rgba(34, 197, 94, 0.12); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }

.seller-name { font-size: 28px; font-weight: 900; color: $text; margin-bottom: 10px; }

.seller-meta {
    display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px;
}
.meta-item {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 13px; color: $text-dim;
    .v-icon { color: $text-dim; }
}

.seller-about {
    font-size: 14px; color: $text-muted; line-height: 1.7;
    max-width: 560px;
}

.seller-actions {
    display: flex; flex-direction: column; gap: 10px; padding-top: 4px;
    flex-shrink: 0;
    @include respond-to(sm) { flex-direction: row; width: 100%; }
}

.btn-follow, .btn-message {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 14px; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 10px 20px; border-radius: $r-md; cursor: pointer;
    text-decoration: none; transition: opacity 0.2s;
    border: 1px solid $border;
    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: default; }
}

.btn-follow {
    background: transparent; color: $text;
    &.following { background: rgba($red, 0.1); border-color: rgba($red, 0.3); color: $text; }
}

.btn-message { background: $red; color: white; border-color: $red; }

.seller-stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    border-top: 1px solid $border;
}

.stat-pill {
    flex: 1;
    min-width: 100px;
    padding: 14px 20px;
    border-right: 1px solid $border;
    &:last-child { border-right: none; }
    &.highlight .stat-val { color: #facc15; }
}

.stat-val {
    font-size: 20px; font-weight: 900; color: $text;
    display: flex; align-items: center; gap: 4px;
    .star-ic { color: #facc15; }
}

.stat-lbl { font-size: 11px; color: $text-dim; margin-top: 2px; }

.page-body { padding: 28px 0 80px; }

.tabs-row {
    display: flex;
    gap: 0;
    border-bottom: 1px solid $border;
    margin-bottom: 28px;
}

.tab-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; border: none; border-bottom: 2px solid transparent;
    color: $text-dim; font-size: 14px; font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 20px; cursor: pointer; margin-bottom: -1px;
    transition: color 0.2s, border-color 0.2s;

    &:hover { color: $text; }
    &.active { color: $text; border-bottom-color: $red; }
}

.tab-count {
    background: rgba(255,255,255,0.1);
    border-radius: 999px;
    font-size: 11px; font-weight: 700;
    padding: 1px 7px;
    color: $text-muted;
}

.section-loading {
    display: flex; justify-content: center; padding: 60px;
}

.empty-state {
    text-align: center; padding: 80px 0; color: $text-dim;
    .v-icon { color: $text-dim; display: block; margin: 0 auto 16px; }
    p { font-size: 15px; }
}

.adverts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    @include respond-to(lg) { grid-template-columns: repeat(3, 1fr); }
    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}


.load-more-row { display: flex; justify-content: center; margin-top: 28px; }
.btn-load-more {
    background: transparent; border: 1px solid $border; color: $text-muted;
    font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 10px 28px; border-radius: $r-md; cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.5; cursor: default; }
}

.reviews-list { display: flex; flex-direction: column; gap: 12px; max-width: 760px; }

.review-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 18px 20px;
}

.rev-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 12px; flex-wrap: wrap;
}

.rev-author { display: flex; align-items: center; gap: 10px; }
.rev-avatar { color: $text-dim; }
.rev-name { font-size: 14px; font-weight: 700; color: $text; }
.rev-date { font-size: 12px; color: $text-dim; margin-top: 2px; }

.rev-stars { display: flex; gap: 2px; }
.star-filled { color: #facc15; }
.star-empty { color: rgba(255,255,255,0.15); }

.rev-content {
    font-size: 13px; color: $text-muted; line-height: 1.7; margin-bottom: 10px;
}

.rev-verified {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; color: #4ade80;
    .v-icon { color: #4ade80; }
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
