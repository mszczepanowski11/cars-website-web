<template>
    <div class="promote-page">

        <div class="promo-topbar">
            <div class="tl-logo">CARI<span>ZO</span></div>
            <div class="promo-steps">
                <span class="ps done"><v-icon icon="mdi-check" size="14" />Ogłoszenie</span>
                <span class="ps-sep" />
                <span class="ps" :class="{ done: step > 1, active: step === 1 }">
                    <v-icon :icon="step > 1 ? 'mdi-check' : 'mdi-star-outline'" size="14" />Promocja
                </span>
                <span class="ps-sep" />
                <span class="ps" :class="{ done: step > 2, active: step === 2 }">
                    <v-icon :icon="step > 2 ? 'mdi-check' : 'mdi-receipt-outline'" size="14" />Faktura
                </span>
                <span class="ps-sep" />
                <span class="ps" :class="{ active: step === 3 }">
                    <v-icon icon="mdi-check-circle-outline" size="14" />Płatność
                </span>
            </div>
            <button class="skip-link" :disabled="publishing" @click="publishFree">
                <v-icon v-if="publishing" icon="mdi-loading" size="14" class="spin" />
                Pomiń i opublikuj bez promocji
                <v-icon v-if="!publishing" icon="mdi-arrow-right" size="15" />
            </button>
        </div>

        <div class="promo-body">
            <div class="promo-hero">
                <h1>Wyróżnij swoje ogłoszenie</h1>
                <p>Wybierz pakiet promocji i sprzedaj szybciej. Możesz też opublikować bez promocji za darmo.</p>
            </div>

            <div class="plans-grid">
                <!-- Free option -->
                <div class="plan-card plan-free" :class="{ selected: selected === 'free' }" @click="selected = 'free'">
                    <div class="plan-header">
                        <div class="plan-icon"><v-icon icon="mdi-car-outline" size="26" /></div>
                        <div class="plan-name">Podstawowe</div>
                        <div class="plan-badge plan-badge-free">DARMOWE</div>
                    </div>
                    <div class="plan-price">0 zł</div>
                    <div class="plan-desc">Standardowe ogłoszenie w wynikach wyszukiwania.</div>
                    <ul class="plan-features">
                        <li><v-icon icon="mdi-check" size="14" />Widoczne w wynikach</li>
                        <li><v-icon icon="mdi-check" size="14" />30 dni aktywności</li>
                        <li class="disabled"><v-icon icon="mdi-close" size="14" />Brak wyróżnienia</li>
                    </ul>
                    <div class="plan-sel-indicator" />
                </div>

                <!-- TOP -->
                <div v-for="plan in plans" :key="plan.key"
                    class="plan-card"
                    :class="[`plan-${plan.key}`, { selected: selected === plan.key, 'plan-popular': plan.popular }]"
                    @click="selected = plan.key; selectedDays = plan.defaultDays">
                    <div v-if="plan.popular" class="popular-badge">NAJPOPULARNIEJSZY</div>
                    <div class="plan-header">
                        <div class="plan-icon"><v-icon :icon="plan.icon" size="26" /></div>
                        <div class="plan-name">{{ plan.name }}</div>
                    </div>
                    <div class="plan-price">
                        od <strong>{{ getPriceFrom(plan.key, plan.priceFrom).toFixed(2) }} zł</strong>
                    </div>
                    <div class="plan-desc">{{ plan.desc }}</div>
                    <ul class="plan-features">
                        <li v-for="f in plan.feats" :key="f"><v-icon icon="mdi-check" size="14" />{{ f }}</li>
                    </ul>
                    <div v-if="selected === plan.key" class="days-select">
                        <button v-for="d in plan.days" :key="d"
                            class="day-btn" :class="{ active: selectedDays === d }"
                            @click.stop="selectedDays = d">
                            {{ d }} dni · {{ getDisplayPrice(plan.key, d).toFixed(2) }} zł
                        </button>
                    </div>
                    <div class="plan-sel-indicator" />
                </div>
            </div>

            <!-- STEP 1: Selected summary + CTA -->
            <div v-if="step === 1" class="promo-footer">
                <div v-if="selected === 'free'" class="summary-free">
                    <v-icon icon="mdi-check-circle-outline" size="20" class="sf-icon" />
                    Opublikujesz ogłoszenie bez promocji (darmowe)
                </div>
                <div v-else class="summary-paid">
                    <div class="summary-name">{{ selectedPlan?.name }} – {{ selectedDays }} dni</div>
                    <div class="summary-price">
                        <span v-if="couponResult?.isValid" class="price-original">{{ selectedPrice?.toFixed(2) }} zł</span>
                        <span>{{ finalPrice.toFixed(2) }} zł</span>
                    </div>
                    <div v-if="couponResult?.isValid" class="coupon-applied">
                        <v-icon icon="mdi-tag-outline" size="14" />
                        Rabat zastosowany
                    </div>
                </div>
                <div v-if="selected !== 'free'" class="coupon-row">
                    <div class="coupon-input-wrap">
                        <input v-model="couponCode" class="coupon-input" placeholder="Kod rabatowy (opcjonalnie)" :disabled="couponLoading" @keyup.enter="applyCoupon" />
                        <button class="coupon-btn" :disabled="!couponCode || couponLoading" @click="applyCoupon">
                            <v-icon v-if="couponLoading" icon="mdi-loading" size="14" class="spin" />
                            <span v-else>Zastosuj</span>
                        </button>
                    </div>
                    <div v-if="couponError" class="coupon-error">{{ couponError }}</div>
                </div>
                <div class="footer-actions">
                    <button class="btn-skip" @click="skipPromotion"><v-icon icon="mdi-arrow-left" size="15" />Wróć</button>
                    <button v-if="selected === 'free'" class="btn-publish" :disabled="publishing" @click="publishFree">
                        <v-icon v-if="publishing" icon="mdi-loading" size="16" class="spin" />
                        <v-icon v-else icon="mdi-check" size="16" />
                        Opublikuj ogłoszenie
                    </button>
                    <button v-else class="btn-pay" @click="goToBilling">
                        <v-icon icon="mdi-receipt-outline" size="16" />
                        Dane do faktury
                        <v-icon icon="mdi-arrow-right" size="15" />
                    </button>
                </div>
                <div v-if="actionError" class="action-error"><v-icon icon="mdi-alert-circle-outline" size="15" />{{ actionError }}</div>
            </div>

            <!-- STEP 2: Billing data -->
            <div v-else-if="step === 2" class="billing-step">
                <h2 class="billing-step-title">
                    <v-icon icon="mdi-receipt-outline" size="20" />
                    Dane do faktury
                </h2>
                <p class="billing-step-sub">Faktura zostanie automatycznie wygenerowana i wysłana na podany e-mail po potwierdzeniu płatności.</p>

                <BillingDataForm
                    v-model="billingData"
                    :user-profile="userProfile"
                    ref="billingFormRef"
                    @valid="billingValid = $event"
                />

                <div class="billing-order-summary">
                    <div class="bos-row">
                        <span>Promocja</span>
                        <span>{{ selectedPlan?.name }} – {{ selectedDays }} dni</span>
                    </div>
                    <div v-if="couponResult?.isValid" class="bos-row bos-discount">
                        <span>Rabat</span>
                        <span>-{{ (selectedPrice! - finalPrice).toFixed(2) }} zł</span>
                    </div>
                    <div class="bos-row bos-net">
                        <span>Kwota netto</span>
                        <span>{{ (finalPrice / 1.23).toFixed(2) }} zł</span>
                    </div>
                    <div class="bos-row bos-vat">
                        <span>VAT (23%)</span>
                        <span>{{ (finalPrice - finalPrice / 1.23).toFixed(2) }} zł</span>
                    </div>
                    <div class="bos-row bos-total">
                        <span>Do zapłaty</span>
                        <strong>{{ finalPrice.toFixed(2) }} zł</strong>
                    </div>
                </div>

                <div class="footer-actions">
                    <button class="btn-skip" @click="step = 1"><v-icon icon="mdi-arrow-left" size="15" />Wróć</button>
                    <button class="btn-pay" :disabled="paying" @click="initiatePayment">
                        <v-icon v-if="paying" icon="mdi-loading" size="16" class="spin" />
                        <v-icon v-else icon="mdi-credit-card-outline" size="16" />
                        Zapłać {{ finalPrice.toFixed(2) }} zł przez ING
                    </button>
                </div>
                <div v-if="actionError" class="action-error"><v-icon icon="mdi-alert-circle-outline" size="15" />{{ actionError }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CouponValidation, BillingData, UserProfile } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const advertId = computed(() => Number(route.params.id))

const step = ref(1)
const selected = ref<string>('free')
const selectedDays = ref(7)
const publishing = ref(false)
const paying = ref(false)
const actionError = ref('')

const couponCode = ref('')
const couponLoading = ref(false)
const couponError = ref('')
const couponResult = ref<CouponValidation | null>(null)

const billingFormRef = ref<{ validateAll: () => boolean } | null>(null)
const billingValid = ref(false)
const billingData = ref<BillingData>({
    type: 'personal',
    email: '',
})
const userProfile = ref<UserProfile | null>(null)

const { validateCoupon } = useCoupons()
const { getPrice } = usePayment()

const plans = [
    {
        key: 'Featured', name: 'Wyróżnienie', icon: 'mdi-star-outline',
        priceFrom: 14.99, popular: false, defaultDays: 7, days: [7, 14, 30],
        desc: 'Ogłoszenie wyróżnione w wynikach wyszukiwania.',
        feats: ['Wyróżniony kolor ramki', 'Oznaczenie WYRÓŻNIONE', '2× więcej wyświetleń'],
        prices: { 7: 14.99, 14: 24.99, 30: 39.99 } as Record<number, number>,
    },
    {
        key: 'Top', name: 'TOP', icon: 'mdi-crown-outline',
        priceFrom: 19.99, popular: true, defaultDays: 7, days: [7, 14, 30],
        desc: 'Ogłoszenie na szczycie wyników wyszukiwania.',
        feats: ['Pozycja TOP w wynikach', 'Baner reklamowy', '5× więcej wyświetleń'],
        prices: { 7: 19.99, 14: 29.99, 30: 49.99 } as Record<number, number>,
    },
    {
        key: 'Premium', name: 'Premium', icon: 'mdi-diamond-outline',
        priceFrom: 29.99, popular: false, defaultDays: 7, days: [7, 14, 30],
        desc: 'Maksymalna widoczność i priorytetowe pozycjonowanie.',
        feats: ['Wszystko z TOP', 'Sekcja polecane ogłoszenia', 'Priorytetowe wsparcie'],
        prices: { 7: 29.99, 14: 44.99, 30: 79.99 } as Record<number, number>,
    },
    {
        key: 'Refresh', name: 'Odświeżenie', icon: 'mdi-refresh',
        priceFrom: 4.99, popular: false, defaultDays: 1, days: [1],
        desc: 'Przesuń ogłoszenie na górę listy – jednorazowo.',
        feats: ['Awans na szczyt listy', 'Nowa data publikacji'],
        prices: { 1: 4.99 } as Record<number, number>,
    },
]

// API prices: keyed as "ServiceType-days" → price
const apiPrices = ref<Record<string, number>>({})

function getDisplayPrice(planKey: string, days: number): number {
    const apiKey = `${planKey}-${days}`
    return apiPrices.value[apiKey] ?? plans.find(p => p.key === planKey)?.prices[days] ?? 0
}

function getPriceFrom(planKey: string, fallback: number): number {
    const plan = plans.find(p => p.key === planKey)
    if (!plan) return fallback
    const minDay = Math.min(...plan.days)
    return getDisplayPrice(planKey, minDay)
}

const selectedPlan = computed(() => plans.find(p => p.key === selected.value))
const selectedPrice = computed(() => {
    if (!selectedPlan.value) return null
    return getDisplayPrice(selectedPlan.value.key, selectedDays.value)
})
const finalPrice = computed(() => couponResult.value?.isValid ? couponResult.value.finalPrice : (selectedPrice.value ?? 0))

onMounted(async () => {
    const queries = plans.flatMap(p => p.days.map(d => ({ key: p.key, days: d })))
    await Promise.allSettled(queries.map(async ({ key, days }) => {
        try {
            const r = await getPrice(key, days)
            apiPrices.value[`${key}-${days}`] = r.price
        } catch {}
    }))
    // Pre-load user profile for billing form pre-fill
    try {
        userProfile.value = await $fetch<UserProfile>('/api/proxy/api/User/me')
        if (userProfile.value?.email) billingData.value.email = userProfile.value.email
        if (userProfile.value?.accountType === 'Business') {
            billingData.value.type = 'business'
            if (userProfile.value.companyName) billingData.value.companyName = userProfile.value.companyName
            if (userProfile.value.nip) billingData.value.nip = userProfile.value.nip
            if (userProfile.value.street) billingData.value.street = userProfile.value.street
            if (userProfile.value.postalCode) billingData.value.postalCode = userProfile.value.postalCode
            if (userProfile.value.city) billingData.value.city = userProfile.value.city
            if (userProfile.value.country) billingData.value.country = userProfile.value.country
        } else {
            billingData.value.type = 'personal'
            if (userProfile.value.name) billingData.value.firstName = userProfile.value.name
            if (userProfile.value.surname) billingData.value.lastName = userProfile.value.surname
        }
    } catch {}
})

watch(selected, () => { couponResult.value = null; couponError.value = '' })
watch(selectedDays, () => { couponResult.value = null; couponError.value = '' })

async function applyCoupon() {
    if (!couponCode.value.trim() || !selectedPrice.value) return
    couponLoading.value = true
    couponError.value = ''
    couponResult.value = null
    try {
        const r = await validateCoupon(couponCode.value.trim(), selectedPrice.value)
        couponResult.value = r
        if (!r.isValid) couponError.value = r.message ?? 'Nieprawidłowy kod rabatowy.'
    } catch (e: any) {
        couponError.value = e?.data?.message ?? 'Nie udało się zastosować kuponu.'
    } finally {
        couponLoading.value = false
    }
}

async function skipPromotion() {
    await navigateTo(`/add-advert?edit=${advertId.value}`)
}

async function publishFree() {
    publishing.value = true
    actionError.value = ''
    try {
        await $fetch(`/api/proxy/api/Advert/${advertId.value}/publish`, { method: 'POST', body: {} })
        await navigateTo('/my-adverts')
    } catch (e: any) {
        actionError.value = e?.data?.message ?? 'Nie udało się opublikować ogłoszenia.'
    } finally {
        publishing.value = false
    }
}

function goToBilling() {
    if (!selectedPlan.value) return
    step.value = 2
}

async function initiatePayment() {
    if (!selectedPlan.value || !selectedPrice.value) return
    // Validate billing form
    if (!billingFormRef.value?.validateAll()) {
        actionError.value = 'Uzupełnij dane do faktury.'
        return
    }
    paying.value = true
    actionError.value = ''
    try {
        // Publish the advert first
        await $fetch(`/api/proxy/api/Advert/${advertId.value}/publish`, { method: 'POST', body: {} })

        const body: Record<string, unknown> = {
            advertId: advertId.value,
            serviceType: selectedPlan.value.key,
            durationDays: selectedDays.value,
            billing: billingData.value,
            returnUrl: `${window.location.origin}/payment/return?status=success&advertId=${advertId.value}`,
            cancelUrl: `${window.location.origin}/payment/return?status=cancel&advertId=${advertId.value}`,
        }
        if (couponResult.value?.isValid && couponCode.value) body.couponCode = couponCode.value

        const result = await $fetch<{ paymentUrl: string }>('/api/proxy/api/Payment/initiate', { method: 'POST', body })
        if (result.paymentUrl) {
            window.location.href = result.paymentUrl
        }
    } catch (e: any) {
        actionError.value = e?.data?.message ?? 'Błąd podczas inicjowania płatności.'
    } finally {
        paying.value = false
    }
}
</script>

<style lang="scss" scoped>
.promote-page { min-height: 100vh; background: $bg; color: $text; font-family: 'Inter', sans-serif; }

.promo-topbar {
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; border-bottom: 1px solid $border; background: #070707; position: sticky; top: 0; z-index: 10;
}

.tl-logo { font-size: 20px; font-weight: 900; color: $text; letter-spacing: 4px; span { color: $red; } }

.promo-steps { display: flex; align-items: center; gap: 10px; font-size: 13px; }

.ps {
    display: flex; align-items: center; gap: 5px; color: $text-dark; font-weight: 500;
    &.done { color: #4caf50; }
    &.active { color: $text; font-weight: 700; }
}

.ps-sep { width: 24px; height: 1px; background: $border; }

.skip-link {
    display: flex; align-items: center; gap: 6px; background: transparent; border: none;
    color: $text-dim; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: color 0.2s; &:hover { color: $text; }
}

.promo-body { max-width: 1100px; margin: 0 auto; padding: 40px 24px 80px; }

.promo-hero { text-align: center; margin-bottom: 40px; h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; } p { font-size: 14px; color: $text-dim; } }

.plans-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 32px; @media (max-width: 900px) { grid-template-columns: 1fr 1fr; } @media (max-width: 600px) { grid-template-columns: 1fr; } }

.plan-card {
    background: #0a0a0a; border: 1.5px solid $border; border-radius: 12px; padding: 22px 18px;
    cursor: pointer; position: relative; transition: border-color 0.2s, transform 0.2s;
    display: flex; flex-direction: column; gap: 10px;
    &:hover { border-color: rgba($red, 0.3); transform: translateY(-3px); }
    &.selected { border-color: $red; background: rgba($red, 0.04); }
    &.plan-popular { border-color: rgba($red, 0.4); }
}

.popular-badge {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    background: $red; color: white; font-size: 10px; font-weight: 800; padding: 3px 10px;
    border-radius: 20px; white-space: nowrap; letter-spacing: 0.5px;
}

.plan-header { display: flex; align-items: center; gap: 10px; }
.plan-icon { color: $red; }
.plan-name { font-size: 16px; font-weight: 800; color: $text; }
.plan-badge-free { font-size: 10px; font-weight: 800; color: #4caf50; background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.3); padding: 2px 8px; border-radius: 20px; margin-left: auto; }
.plan-price { font-size: 22px; font-weight: 900; color: $red; strong { font-size: 26px; } }
.plan-desc { font-size: 12px; color: $text-dim; line-height: 1.5; }

.plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; flex: 1;
    li { display: flex; align-items: center; gap: 7px; font-size: 12px; color: $text-muted;
        .v-icon { color: #4caf50; }
        &.disabled { color: $text-dark; .v-icon { color: $text-dark; } }
    }
}

.days-select { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }

.day-btn {
    background: transparent; border: 1px solid $border; border-radius: 6px; color: $text-dim;
    font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif; padding: 5px 12px; cursor: pointer;
    transition: all 0.15s;
    &.active { border-color: $red; background: rgba($red, 0.12); color: $text; }
    &:hover:not(.active) { border-color: $text-dim; color: $text; }
}

.plan-sel-indicator {
    height: 3px; border-radius: 3px; background: transparent; margin-top: auto;
    .selected & { background: $red; }
}

.promo-footer {
    background: #0a0a0a; border: 1px solid $border; border-radius: 12px; padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}

.summary-free { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4caf50; font-weight: 500; .sf-icon { flex-shrink: 0; } }
.summary-paid { display: flex; flex-direction: column; gap: 2px; }
.summary-name { font-size: 14px; font-weight: 700; color: $text; }
.summary-price { font-size: 22px; font-weight: 900; color: $red; }

.footer-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.btn-skip {
    display: flex; align-items: center; gap: 6px; background: transparent;
    border: 1px solid $border; border-radius: 8px; color: $text-muted; font-size: 13px;
    font-weight: 600; font-family: 'Inter', sans-serif; padding: 11px 20px; cursor: pointer;
    transition: border-color 0.2s, color 0.2s; &:hover { border-color: $text-dim; color: $text; }
}

.btn-publish {
    display: flex; align-items: center; gap: 7px; background: #2d7a3a;
    border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 11px 24px; cursor: pointer; transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-pay {
    display: flex; align-items: center; gap: 7px; background: $red;
    border: none; border-radius: 8px; color: white; font-size: 14px; font-weight: 700;
    font-family: 'Inter', sans-serif; padding: 11px 24px; cursor: pointer; transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.action-error { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #e55; margin-top: 8px; width: 100%; }

.price-original { text-decoration: line-through; color: $text-dim; font-size: 16px; font-weight: 400; margin-right: 6px; }
.coupon-applied { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #4caf50; margin-top: 2px; }

.coupon-row {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.coupon-input-wrap {
    display: flex;
    gap: 6px;
}

.coupon-input {
    flex: 1;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: 8px;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 9px 14px;
    outline: none;
    min-width: 0;
    transition: border-color 0.2s;
    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
    &:disabled { opacity: 0.5; }
}

.coupon-btn {
    background: transparent;
    border: 1px solid $border;
    border-radius: 8px;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 9px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $red; color: $text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.coupon-error { font-size: 12px; color: #e55; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// Billing step
.billing-step {
    max-width: 680px;
    margin: 0 auto;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.billing-step-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    color: $text;
    margin: 0;
    .v-icon { color: $red; }
}

.billing-step-sub {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.5;
    margin: 0;
}

.billing-order-summary {
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
}

.bos-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    font-size: 13px;
    color: $text-muted;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    &:last-child { border-bottom: none; }
}

.bos-discount { color: #4caf50; }
.bos-net, .bos-vat { color: $text-dim; font-size: 12px; }

.bos-total {
    background: rgba($red, 0.06);
    color: $text;
    font-weight: 700;
    strong { font-size: 18px; color: $red; }
}
</style>
