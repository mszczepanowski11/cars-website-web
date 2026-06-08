<template>
    <div class="promote-page">
        <div class="container">

            <!-- ── Premiere hero (active or upcoming) ──────────────────────── -->
            <div
                v-if="isPremiereActive || isPremiereUpcoming"
                class="promo-hero"
                :class="{ 'promo-hero--upcoming': isPremiereUpcoming }"
            >
                <div class="promo-hero-left">
                    <div class="promo-badge">
                        <v-icon icon="mdi-rocket-launch-outline" size="15" />
                        {{ isPremiereUpcoming ? 'NADCHODZI PREMIERA' : 'PREMIERA CARIZO' }}
                    </div>
                    <h1 class="promo-title">
                        Promowanie ofert<br>
                        <span class="promo-free">za darmo</span>
                    </h1>
                    <p class="promo-desc">
                        <template v-if="isPremiereUpcoming">
                            Od 12 do 14 czerwca wszystkie opcje promowania są bezpłatne.<br>
                            Przygotuj swoje ogłoszenia już teraz!
                        </template>
                        <template v-else>
                            W czasie trwania premiery (12–14 czerwca) wszystkie opcje<br>
                            promowania są dostępne bezpłatnie.
                        </template>
                    </p>
                    <NuxtLink to="/add-advert" class="promo-cta">
                        Dodaj ogłoszenie
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </NuxtLink>
                </div>

                <div class="promo-hero-right">
                    <div class="countdown-label">
                        {{ isPremiereUpcoming ? 'Premiera za:' : 'Oferta kończy się za:' }}
                    </div>
                    <div class="countdown-row">
                        <template v-for="(unit, i) in countdownUnits" :key="unit.label">
                            <div class="countdown-box">
                                <span class="cd-num">{{ pad(unit.value) }}</span>
                                <span class="cd-label">{{ unit.label }}</span>
                            </div>
                            <span v-if="i < countdownUnits.length - 1" class="cd-sep">:</span>
                        </template>
                    </div>
                </div>

                <img src="/car-placeholder.svg" alt="" class="promo-car-img" />
            </div>

            <!-- ── Standard header (after premiere) ───────────────────────── -->
            <div v-else class="page-header">
                <h1 class="page-title">Wyróżnij swoje ogłoszenie</h1>
                <p class="page-sub">Większa widoczność = większe szanse na sprzedaż</p>
            </div>

            <!-- ── Advert picker ────────────────────────────────────────────── -->
            <div class="advert-picker-section">
                <h2 class="picker-title">1. Wybierz ogłoszenie</h2>
                <div v-if="advertsLoading" class="picker-loading">
                    <v-icon icon="mdi-loading" size="22" class="spin" />Ładowanie ogłoszeń...
                </div>
                <div v-else-if="myAdverts.length" class="picker-grid">
                    <div
                        v-for="a in myAdverts"
                        :key="a.id"
                        class="picker-card"
                        :class="{ selected: selectedAdvertId === a.id }"
                        @click="selectedAdvertId = a.id"
                    >
                        <img :src="getPickerImage(a)" class="picker-img" :alt="a.title" />
                        <div class="picker-info">
                            <div class="picker-name">{{ a.brand?.name }} {{ a.model?.name }}</div>
                            <div class="picker-meta">{{ a.year }} • {{ Number(a.price).toLocaleString('pl') }} zł</div>
                        </div>
                        <div v-if="selectedAdvertId === a.id" class="picker-check">
                            <v-icon icon="mdi-check-circle" size="20" />
                        </div>
                    </div>
                </div>
                <p v-else class="picker-empty">
                    Nie masz aktywnych ogłoszeń. <NuxtLink to="/add-advert" class="picker-link">Dodaj ogłoszenie</NuxtLink>
                </p>
            </div>

            <!-- ── Pricing section ─────────────────────────────────────────── -->
            <div class="pricing-section">
                <h2 class="picker-title">2. Wybierz opcję promowania</h2>
                <div v-if="isPremiereActive || isPremiereUpcoming" class="pricing-head">
                    <p class="pricing-sub">Większa widoczność = większe szanse na sprzedaż</p>
                </div>

                <div class="pricing-grid">
                    <div
                        v-for="plan in plans"
                        :key="plan.key"
                        class="plan-card"
                        :class="[`plan-card--${plan.key}`, { 'plan-selected': selectedPlan === plan.key }]"
                        @click="selectedPlan = plan.key"
                    >
                        <!-- Icon + badge preview -->
                        <div class="plan-top-row">
                            <div class="plan-icon-wrap">
                                <v-icon :icon="plan.icon" size="26" />
                            </div>
                            <div v-if="plan.badgeLabel" class="plan-badge-preview" :class="`preview--${plan.key}`">
                                <v-icon v-if="plan.key === 'top'" icon="mdi-crown" size="11" />
                                {{ plan.badgeLabel }}
                            </div>
                        </div>

                        <h3 class="plan-name">{{ plan.name }}</h3>
                        <p class="plan-desc">{{ plan.desc }}</p>

                        <!-- Duration toggle (Wyróżnij & TOP only) -->
                        <div v-if="plan.durations" class="duration-tabs">
                            <button
                                v-for="d in plan.durations"
                                :key="d.days"
                                class="dur-tab"
                                :class="{ active: selectedDays[plan.key as MultiPlanKey] === d.days }"
                                @click.stop="selectedDays[plan.key as MultiPlanKey] = d.days"
                            >
                                {{ d.days }} dni
                                <span v-if="!isPremiereActive" class="dur-price">{{ d.price }}</span>
                            </button>
                        </div>

                        <!-- Price display -->
                        <div class="plan-price-row">
                            <template v-if="isPremiereActive">
                                <span class="plan-old-price">{{ getPrice(plan) }}</span>
                                <span class="plan-new-price">0 zł</span>
                            </template>
                            <template v-else>
                                <span class="plan-new-price">{{ getPrice(plan) }}</span>
                                <span v-if="plan.durations" class="plan-period">
                                    / {{ selectedDays[plan.key as MultiPlanKey] }} dni
                                </span>
                            </template>
                        </div>

                        <!-- Active premiere: countdown tag -->
                        <div v-if="isPremiereActive" class="plan-promo-row">
                            <v-icon icon="mdi-fire" size="14" class="fire-icon" />
                            <span class="plan-promo-label">Oferta premierowa</span>
                            <span class="plan-promo-time">
                                {{ pad(remainingToEnd.h) }}h&nbsp;{{ pad(remainingToEnd.m) }}m
                            </span>
                        </div>

                        <!-- Upcoming premiere: teaser tag -->
                        <div v-else-if="isPremiereUpcoming" class="plan-upcoming-row">
                            <v-icon icon="mdi-gift-outline" size="14" class="gift-icon" />
                            <span>Bezpłatnie od 12 do 14 czerwca</span>
                        </div>

                        <button class="plan-btn" @click.stop="selectAndPurchase(plan.key)">
                            {{ plan.cta }}
                            <v-icon icon="mdi-arrow-right" size="15" />
                        </button>
                    </div>
                </div>

                <!-- Coupon + order summary -->
                <div v-if="selectedPlan && selectedAdvertId" class="order-panel">
                    <h2 class="picker-title" style="margin-bottom:20px">3. Podsumowanie zamówienia</h2>
                    <div class="order-row">
                        <span class="order-label">Plan</span>
                        <span class="order-val">{{ plans.find(p => p.key === selectedPlan)?.name }}</span>
                    </div>
                    <div v-if="selectedPlan !== 'refresh'" class="order-row">
                        <span class="order-label">Czas trwania</span>
                        <span class="order-val">{{ selectedDays[selectedPlan as MultiPlanKey] }} dni</span>
                    </div>
                    <div class="order-row">
                        <span class="order-label">Cena bazowa</span>
                        <span class="order-val">{{ isPremiereActive ? '0,00 zł' : getPrice(plans.find(p => p.key === selectedPlan)!) }}</span>
                    </div>

                    <!-- Coupon -->
                    <div v-if="!isPremiereActive" class="coupon-row">
                        <div class="coupon-input-wrap" :class="{ 'coupon-valid': couponValid, 'coupon-invalid': couponInvalid }">
                            <v-icon icon="mdi-ticket-percent-outline" size="17" class="coupon-icon" />
                            <input v-model="couponCode" class="coupon-input" placeholder="Kod promocyjny (opcjonalnie)" @keyup.enter="applyCoupon" />
                            <button v-if="couponCode && !couponValid" class="coupon-apply-btn" :disabled="couponLoading" @click="applyCoupon">
                                <v-icon v-if="couponLoading" icon="mdi-loading" size="14" class="spin" />
                                <span v-else>Zastosuj</span>
                            </button>
                            <button v-if="couponValid" class="coupon-clear-btn" @click="clearCoupon">
                                <v-icon icon="mdi-close" size="14" />
                            </button>
                        </div>
                        <div v-if="couponValid && couponData" class="coupon-ok">
                            <v-icon icon="mdi-check-circle-outline" size="14" />
                            Kupon zastosowany — oszczędzasz {{ couponData.discountAmount.toFixed(2) }} zł
                        </div>
                        <div v-if="couponInvalid" class="coupon-err">
                            <v-icon icon="mdi-alert-circle-outline" size="14" />
                            {{ couponError }}
                        </div>
                    </div>

                    <div v-if="!isPremiereActive && couponValid && couponData" class="order-row order-row-total">
                        <span class="order-label">Do zapłaty</span>
                        <span class="order-val-total">{{ couponData.finalPrice.toFixed(2) }} zł</span>
                    </div>

                    <button class="purchase-btn" :disabled="purchasing" @click="doPurchase">
                        <v-icon v-if="purchasing" icon="mdi-loading" size="17" class="spin" />
                        <v-icon v-else icon="mdi-rocket-launch-outline" size="17" />
                        {{ isPremiereActive ? 'Aktywuj bezpłatnie' : 'Kup i aktywuj' }}
                    </button>
                    <div v-if="purchaseSuccess" class="purchase-ok">
                        <v-icon icon="mdi-check-circle-outline" size="18" />
                        {{ purchaseSuccess }}
                    </div>
                    <div v-if="purchaseError" class="purchase-err">
                        <v-icon icon="mdi-alert-circle-outline" size="18" />
                        {{ purchaseError }}
                    </div>
                </div>
            </div>

            <!-- ── Benefits row ────────────────────────────────────────────── -->
            <div class="benefits-row">
                <div v-for="b in benefits" :key="b.title" class="benefit-item">
                    <v-icon :icon="b.icon" size="22" class="benefit-icon" />
                    <div>
                        <div class="benefit-title">{{ b.title }}</div>
                        <div class="benefit-sub">{{ b.sub }}</div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import type { CarAdvert, CouponValidation } from '~/types'

const { isPremiereActive, isPremiereUpcoming, remainingToEnd, remainingToStart, pad } = usePromotion()
const { purchasePromotion } = usePromotions()
const { validateCoupon } = useCoupons()
const { getImageUrl, placeholder } = useImageUrl()

type MultiPlanKey = 'highlight' | 'top'

interface PlanDuration { days: number; price: string; priceNum: number }
interface Plan {
    key: string; icon: string; name: string; desc: string
    singlePrice: string | null; singlePriceNum: number
    durations: PlanDuration[] | null; cta: string; badgeLabel: string | null
    promotionType: string
}

const plans: Plan[] = [
    {
        key: 'refresh', icon: 'mdi-refresh', name: 'Odśwież ofertę',
        desc: 'Twoje ogłoszenie wróci na początek wyników wyszukiwania i listy w kategorii.',
        singlePrice: '3,99 zł', singlePriceNum: 3.99, durations: null,
        cta: 'Odśwież teraz', badgeLabel: null, promotionType: 'Refresh',
    },
    {
        key: 'highlight', icon: 'mdi-star', name: 'Wyróżnij ofertę',
        desc: 'Ogłoszenie otrzymuje oznaczenie „WYRÓŻNIONE", czerwone obramowanie i jest wyświetlane wyżej od zwykłych ofert.',
        singlePrice: null, singlePriceNum: 0,
        durations: [{ days: 7, price: '7,99 zł', priceNum: 7.99 }, { days: 30, price: '19,99 zł', priceNum: 19.99 }],
        cta: 'Wyróżnij teraz', badgeLabel: 'WYRÓŻNIONE', promotionType: 'Featured',
    },
    {
        key: 'top', icon: 'mdi-crown', name: 'Oferta TOP',
        desc: 'Ogłoszenie pojawia się na stronie głównej, na początku kategorii i wyników wyszukiwania.',
        singlePrice: null, singlePriceNum: 0,
        durations: [{ days: 7, price: '14,99 zł', priceNum: 14.99 }, { days: 30, price: '39,99 zł', priceNum: 39.99 }],
        cta: 'Dodaj do TOP', badgeLabel: 'TOP', promotionType: 'Top',
    },
]

const benefits = [
    { icon: 'mdi-trending-up', title: 'Więcej wyświetleń', sub: 'Twoja oferta na górze listy' },
    { icon: 'mdi-eye-outline', title: 'Lepsza widoczność', sub: 'Docieraj do większej liczby kupujących' },
    { icon: 'mdi-lightning-bolt', title: 'Szybsza sprzedaż', sub: 'Zwiększ szanse na udaną transakcję' },
    { icon: 'mdi-shield-check-outline', title: 'Bezpiecznie i skutecznie', sub: 'Sprawdzona platforma wymagających' },
]

const selectedDays = reactive<Record<MultiPlanKey, number>>({ highlight: 7, top: 7 })
const selectedPlan = ref<string | null>(null)
const selectedAdvertId = ref<number | null>(null)
const myAdverts = ref<CarAdvert[]>([])
const advertsLoading = ref(false)

// Coupon
const couponCode = ref('')
const couponLoading = ref(false)
const couponValid = ref(false)
const couponInvalid = ref(false)
const couponError = ref('')
const couponData = ref<CouponValidation | null>(null)

// Purchase
const purchasing = ref(false)
const purchaseSuccess = ref<string | null>(null)
const purchaseError = ref<string | null>(null)

function getPrice(plan: Plan): string {
    if (plan.singlePrice) return plan.singlePrice
    const days = selectedDays[plan.key as MultiPlanKey]
    return plan.durations!.find(d => d.days === days)!.price
}

function getPriceNum(plan: Plan): number {
    if (isPremiereActive.value) return 0
    if (plan.singlePriceNum) return plan.singlePriceNum
    const days = selectedDays[plan.key as MultiPlanKey]
    return plan.durations!.find(d => d.days === days)!.priceNum
}

function getPickerImage(a: CarAdvert): string {
    return getImageUrl(a.images?.find(i => i.isMain)?.url, placeholder)
}

function selectAndPurchase(key: string) {
    selectedPlan.value = key
}

async function applyCoupon() {
    if (!couponCode.value.trim()) return
    const plan = plans.find(p => p.key === selectedPlan.value)
    if (!plan) return
    couponLoading.value = true
    couponValid.value = false
    couponInvalid.value = false
    try {
        couponData.value = await validateCoupon(couponCode.value.trim(), getPriceNum(plan))
        couponValid.value = true
    } catch (e: any) {
        couponInvalid.value = true
        couponError.value = e?.data?.message ?? 'Nieprawidłowy kod kuponu.'
    } finally { couponLoading.value = false }
}

function clearCoupon() {
    couponCode.value = ''
    couponValid.value = false
    couponInvalid.value = false
    couponData.value = null
}

async function doPurchase() {
    if (!selectedAdvertId.value || !selectedPlan.value) return
    const plan = plans.find(p => p.key === selectedPlan.value)!
    const days = plan.durations ? selectedDays[selectedPlan.value as MultiPlanKey] : 1
    purchasing.value = true
    purchaseSuccess.value = null
    purchaseError.value = null
    try {
        await purchasePromotion({
            advertId: selectedAdvertId.value,
            type: plan.promotionType as any,
            durationDays: days,
            couponCode: couponValid.value ? couponCode.value : undefined,
        })
        purchaseSuccess.value = `${plan.name} została aktywowana! Twoje ogłoszenie jest teraz lepiej widoczne.`
        clearCoupon()
        selectedPlan.value = null
    } catch (e: any) {
        purchaseError.value = e?.data?.message ?? 'Nie udało się aktywować promocji.'
    } finally { purchasing.value = false }
}

const countdownUnits = computed(() => {
    const r = isPremiereUpcoming.value ? remainingToStart.value : remainingToEnd.value
    return [
        { value: r.d, label: 'DNI' },
        { value: r.h, label: 'GODZ.' },
        { value: r.m, label: 'MIN.' },
        { value: r.s, label: 'SEK.' },
    ]
})

onMounted(async () => {
    advertsLoading.value = true
    try {
        const r = await $fetch<{ items: CarAdvert[]; totalCount: number }>('/api/proxy/api/Advert/user?page=1&pageSize=20')
        myAdverts.value = r.items.filter(a => a.isActive !== false)
    } catch {} finally { advertsLoading.value = false }
})
</script>

<style lang="scss" scoped>
.promote-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
    padding-bottom: 80px;
}

.container { @include container; }

// ── Hero ──────────────────────────────────────────────────────────────────────
.promo-hero {
    position: relative;
    background: linear-gradient(135deg, #0d0001 0%, #07000a 100%);
    border: 1px solid rgba($red, 0.35);
    border-radius: $r-xl;
    padding: 52px 56px;
    display: flex;
    align-items: center;
    gap: 52px;
    overflow: hidden;
    margin-bottom: 56px;

    &--upcoming {
        background: linear-gradient(135deg, #0d0001 0%, #070007 100%);
        border-color: rgba($red, 0.35);
    }

    @include respond-to(md) { flex-direction: column; align-items: flex-start; gap: 36px; padding: 36px 28px; }
}

.promo-hero-left { flex: 1; position: relative; z-index: 2; }

.promo-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba($red, 0.15);
    border: 1px solid rgba($red, 0.35);
    color: $red;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 5px 14px;
    border-radius: 20px;
    margin-bottom: 22px;

    .promo-hero--upcoming & {
        background: rgba($red, 0.12);
        border-color: rgba($red, 0.3);
        color: $red;
    }
}

.promo-title {
    font-size: 50px;
    font-weight: 900;
    color: $text;
    line-height: 1.1;
    margin-bottom: 18px;

    @include respond-to(md) { font-size: 36px; }
    @include respond-to(sm) { font-size: 28px; }
}

.promo-free { color: $red; }

.promo-desc {
    color: $text-muted;
    font-size: 14px;
    line-height: 1.75;
    margin-bottom: 30px;
}

.promo-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: $red;
    color: white;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: $r-md;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover { opacity: 0.88; }
}

.promo-hero-right { flex-shrink: 0; position: relative; z-index: 2; }

.countdown-label {
    font-size: 13px;
    color: $text-dim;
    margin-bottom: 14px;
    text-align: center;
}

.countdown-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.countdown-box {
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $r-sm;
    width: 74px;
    padding: 14px 8px 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.cd-num {
    font-size: 34px;
    font-weight: 900;
    color: $text;
    line-height: 1;
}

.cd-label {
    font-size: 10px;
    font-weight: 700;
    color: $text-dim;
    letter-spacing: 0.5px;
}

.cd-sep {
    font-size: 28px;
    font-weight: 900;
    color: $text-dim;
    margin-bottom: 18px;
}

.promo-car-img {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 36%;
    height: 100%;
    object-fit: cover;
    object-position: center left;
    opacity: 0.15;
    mask-image: linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%);

    @include respond-to(md) { display: none; }
}

// ── Standard header ───────────────────────────────────────────────────────────
.page-header { margin-bottom: 48px; }

.page-title {
    font-size: 38px;
    font-weight: 900;
    color: $text;
    margin-bottom: 10px;
}

.page-sub { font-size: 15px; color: $text-dim; }

// ── Pricing ───────────────────────────────────────────────────────────────────
.pricing-head { margin-bottom: 32px; }

.pricing-title {
    font-size: 28px;
    font-weight: 900;
    color: $text;
    margin-bottom: 8px;
}

.pricing-sub { font-size: 14px; color: $text-dim; }

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @include respond-to(md) { grid-template-columns: 1fr; }
}

.plan-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s, transform 0.2s;

    &:hover { transform: translateY(-3px); }

    &--refresh:hover  { border-color: rgba($red, 0.3); }
    &--highlight:hover { border-color: rgba($red, 0.45); }
    &--top:hover       { border-color: rgba(#f5a623, 0.4); }
}

.plan-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
}

.plan-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    flex-shrink: 0;

    .plan-card--top & {
        background: rgba(#f5a623, 0.1);
        border-color: rgba(#f5a623, 0.25);
        color: #f5a623;
    }
}

.plan-badge-preview {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.6px;
    padding: 4px 10px;
    border-radius: 6px;
    margin-top: 6px;

    &.preview--highlight {
        background: rgba($red, 0.15);
        color: #ff6b6b;
        border: 1px solid rgba($red, 0.4);
    }

    &.preview--top {
        background: rgba(#f5a623, 0.15);
        color: #f5a623;
        border: 1px solid rgba(#f5a623, 0.4);
    }
}

.plan-name {
    font-size: 18px;
    font-weight: 800;
    color: $text;
    margin-bottom: 10px;
}

.plan-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.65;
    margin-bottom: 22px;
    flex: 1;
}

// Duration toggle
.duration-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
}

.dur-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-dim;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 10px 8px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;

    &:hover { border-color: $text-dark; color: $text-muted; }

    &.active {
        border-color: rgba($red, 0.55);
        background: rgba($red, 0.07);
        color: $text;

        .plan-card--top & {
            border-color: rgba(#f5a623, 0.5);
            background: rgba(#f5a623, 0.06);
        }
    }
}

.dur-price {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;

    .dur-tab.active & { color: $red; }
    .plan-card--top .dur-tab.active & { color: #f5a623; }
}

// Price
.plan-price-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 12px;
}

.plan-old-price {
    font-size: 15px;
    color: $text-dark;
    text-decoration: line-through;
}

.plan-new-price {
    font-size: 34px;
    font-weight: 900;
    color: $red;

    .plan-card--top & { color: #f5a623; }
}

.plan-period {
    font-size: 13px;
    color: $text-dim;
    font-weight: 500;
}

// Tags
.plan-promo-row,
.plan-upcoming-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    font-size: 12px;
}

.fire-icon  { color: $red; }
.gift-icon  { color: $red; }

.plan-promo-label { color: $text-dim; font-weight: 500; }
.plan-promo-time  { color: $red; font-weight: 700; margin-left: 2px; }

.plan-upcoming-row {
    color: $red;
    font-weight: 500;
    margin-bottom: 20px;
}

// CTA
.plan-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 14px;
    cursor: pointer;
    margin-top: auto;
    transition: background 0.2s, border-color 0.2s;

    .plan-card--refresh &:hover,
    .plan-card--highlight &:hover { background: rgba($red, 0.08); border-color: rgba($red, 0.4); }
    .plan-card--top &:hover       { background: rgba(#f5a623, 0.07); border-color: rgba(#f5a623, 0.4); }
}

// ── Advert picker ─────────────────────────────────────────────────────────────
.advert-picker-section { margin-bottom: 40px; }

.picker-title {
    font-size: 22px; font-weight: 900; color: $text; margin-bottom: 20px;
}

.picker-loading {
    display: flex; align-items: center; gap: 10px; color: $text-dim; font-size: 14px;
}

.picker-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;
}

.picker-card {
    display: flex; align-items: center; gap: 12px; background: #0a0a0a;
    border: 1px solid $border; border-radius: $r-md; padding: 12px; cursor: pointer;
    transition: border-color 0.2s, background 0.2s; position: relative;
    &:hover { border-color: rgba($red, 0.35); background: rgba($red, 0.03); }
    &.selected { border-color: $red; background: rgba($red, 0.06); }
}

.picker-img {
    width: 64px; height: 44px; object-fit: cover; border-radius: $r-sm; flex-shrink: 0;
}

.picker-info { flex: 1; min-width: 0; }
.picker-name { font-size: 13px; font-weight: 600; color: $text; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.picker-meta { font-size: 11px; color: $text-dim; margin-top: 2px; }

.picker-check { color: $red; flex-shrink: 0; }

.picker-empty { color: $text-dim; font-size: 14px; }
.picker-link { color: $red; font-weight: 600; text-decoration: none; &:hover { opacity: 0.8; } }

// ── Plan selection ────────────────────────────────────────────────────────────
.plan-selected { border-color: rgba($red, 0.5) !important; background: rgba($red, 0.04); }

.plan-card--top.plan-selected { border-color: rgba(#f5a623, 0.5) !important; }

// ── Order panel ───────────────────────────────────────────────────────────────
.order-panel {
    margin-top: 36px; background: #0a0a0a; border: 1px solid $border;
    border-radius: $r-lg; padding: 28px; max-width: 520px;
}

.order-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid $border;
    &:last-of-type { border-bottom: none; }
    &.order-row-total { padding-top: 14px; }
}

.order-label { font-size: 13px; color: $text-dim; }
.order-val { font-size: 13px; font-weight: 600; color: $text; }
.order-val-total { font-size: 22px; font-weight: 900; color: $red; }

// Coupon
.coupon-row { margin: 16px 0; display: flex; flex-direction: column; gap: 6px; }

.coupon-input-wrap {
    display: flex; align-items: center; gap: 8px; background: #0d0d0d;
    border: 1px solid $border; border-radius: $r-sm; padding: 9px 12px;
    transition: border-color 0.2s;
    &:focus-within { border-color: rgba($red, 0.4); }
    &.coupon-valid { border-color: rgba(76,175,80,0.5); }
    &.coupon-invalid { border-color: rgba(220,50,50,0.4); }
}

.coupon-icon { color: $text-dim; flex-shrink: 0; }

.coupon-input {
    flex: 1; background: transparent; border: none; outline: none;
    color: $text; font-size: 13px; font-family: 'Inter', sans-serif;
    &::placeholder { color: $text-dark; }
}

.coupon-apply-btn {
    background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 6px 12px; cursor: pointer; transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $red; color: $red; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.coupon-clear-btn {
    background: transparent; border: none; color: $text-dim; cursor: pointer;
    padding: 4px; transition: color 0.2s; &:hover { color: #e55; }
}

.coupon-ok { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4caf50; }
.coupon-err { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #e55; }

// Purchase
.purchase-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
    background: $red; border: none; border-radius: $r-md; color: white;
    font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif;
    padding: 14px; cursor: pointer; margin-top: 20px; transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.purchase-ok {
    display: flex; align-items: center; gap: 8px; margin-top: 14px;
    font-size: 13px; color: #4caf50; background: rgba(76,175,80,0.08);
    border: 1px solid rgba(76,175,80,0.2); border-radius: $r-sm; padding: 10px 14px;
}

.purchase-err {
    display: flex; align-items: center; gap: 8px; margin-top: 14px;
    font-size: 13px; color: #e55; background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.2); border-radius: $r-sm; padding: 10px 14px;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// ── Benefits ──────────────────────────────────────────────────────────────────
.benefits-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 28px 32px;
    margin-top: 48px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; padding: 20px; }
}

.benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
}

.benefit-icon { color: $red; flex-shrink: 0; margin-top: 2px; }

.benefit-title {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 4px;
}

.benefit-sub {
    font-size: 12px;
    color: $text-dim;
    line-height: 1.5;
}
</style>
