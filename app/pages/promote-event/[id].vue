<template>
    <div class="promote-page">

        <div class="promo-topbar">
            <img src="/carizo-logo.svg" alt="CARIZO" class="tl-logo" />
            <div class="promo-steps">
                <span class="ps done"><v-icon icon="mdi-check" size="14" />Wydarzenie</span>
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
            <NuxtLink :to="`/wydarzenie/${eventId}`" class="skip-link">
                Pomiń wyróżnienie
                <v-icon icon="mdi-arrow-right" size="15" />
            </NuxtLink>
        </div>

        <div class="promo-body">
            <div class="promo-hero">
                <div class="hero-badge"><v-icon icon="mdi-calendar-star" size="18" />Wyróżnij wydarzenie</div>
                <h1>Dotrzyj do więcej uczestników</h1>
                <p>Wyróżnione wydarzenia pojawiają się na górze listy i stronie głównej CARIZO.</p>
            </div>

            <div v-if="event" class="event-preview">
                <div class="ep-info">
                    <div class="ep-name">{{ event.name }}</div>
                    <div class="ep-meta">
                        <v-icon icon="mdi-calendar" size="14" />
                        {{ formatDate(event.startDate) }}
                        <span class="ep-sep">·</span>
                        <v-icon icon="mdi-map-marker" size="14" />
                        {{ event.city }}
                    </div>
                </div>
                <div class="ep-badge" :class="{ active: event.isFeatured }">
                    <v-icon :icon="event.isFeatured ? 'mdi-star' : 'mdi-star-outline'" size="14" />
                    {{ event.isFeatured ? 'Wyróżnione' : 'Zwykłe' }}
                </div>
            </div>

            <div class="plans-grid">
                <!-- 7 days -->
                <div v-for="plan in plans" :key="plan.days"
                    class="plan-card"
                    :class="{ selected: selectedDays === plan.days, 'plan-popular': plan.popular }"
                    @click="selectedDays = plan.days">
                    <div v-if="plan.popular" class="popular-badge">NAJPOPULARNIEJSZE</div>
                    <div class="plan-header">
                        <div class="plan-icon"><v-icon :icon="plan.icon" size="26" /></div>
                        <div class="plan-name">{{ plan.days }} dni</div>
                    </div>
                    <div class="plan-price">
                        <strong>{{ getDisplayPrice(plan.days).toFixed(2) }} zł</strong>
                    </div>
                    <div class="plan-desc">{{ plan.desc }}</div>
                    <ul class="plan-features">
                        <li v-for="f in plan.feats" :key="f"><v-icon icon="mdi-check" size="14" />{{ f }}</li>
                    </ul>
                    <div class="plan-sel-indicator" />
                </div>
            </div>

            <!-- STEP 1: Summary + CTA -->
            <div v-if="step === 1" class="promo-footer">
                <div class="summary-paid">
                    <div class="summary-name">Wyróżnienie wydarzenia – {{ selectedDays }} dni</div>
                    <div class="summary-price">
                        <span v-if="couponResult?.isValid" class="price-original">{{ selectedPrice.toFixed(2) }} zł</span>
                        <span>{{ finalPrice.toFixed(2) }} zł</span>
                    </div>
                    <div v-if="couponResult?.isValid" class="coupon-applied">
                        <v-icon icon="mdi-tag-outline" size="14" />
                        Rabat zastosowany
                    </div>
                </div>
                <div class="coupon-row">
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
                    <NuxtLink :to="`/wydarzenie/${eventId}`" class="btn-skip">
                        <v-icon icon="mdi-arrow-left" size="15" />Wróć
                    </NuxtLink>
                    <button class="btn-pay" @click="goToBilling">
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
                        <span>Wyróżnienie wydarzenia – {{ selectedDays }} dni</span>
                    </div>
                    <div v-if="couponResult?.isValid" class="bos-row bos-discount">
                        <span>Rabat</span>
                        <span>-{{ (selectedPrice - finalPrice).toFixed(2) }} zł</span>
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
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const eventId = computed(() => Number(route.params.id))

const step = ref(1)
const selectedDays = ref(7)
const paying = ref(false)
const actionError = ref('')

const couponCode = ref('')
const couponLoading = ref(false)
const couponError = ref('')
const couponResult = ref<CouponValidation | null>(null)

const billingFormRef = ref<{ validateAll: () => boolean } | null>(null)
const billingValid = ref(false)
const billingData = ref<BillingData>({ type: 'personal', email: '' })
const userProfile = ref<UserProfile | null>(null)

const event = ref<{ id: number; name: string; startDate: string; city: string; isFeatured: boolean; featuredUntil?: string } | null>(null)

const { validateCoupon } = useCoupons()
const { getPrice } = usePayment()
const { error: toastError } = useToast()

// InitiatePaymentDto only has flat BillingName/BillingNip/BillingStreet/BillingPostalCode/
// BillingCity properties - a nested { billing: {...} } object is silently dropped by the
// JSON binder, so every BillingDataForm entry here was being lost before it ever reached
// the database (the invoice would then fall back to the user's profile, or nothing).
function mapBillingFields(bd: BillingData) {
    return {
        billingName: bd.type === 'business' ? bd.companyName : `${bd.firstName ?? ''} ${bd.lastName ?? ''}`.trim(),
        billingNip: bd.type === 'business' ? bd.nip : undefined,
        billingStreet: bd.street,
        billingPostalCode: bd.postalCode,
        billingCity: bd.city,
    }
}

function submitImojeForm(result: { paymentUrl: string, formFields?: Record<string, string>, adminActivated?: boolean }) {
    if (result.adminActivated) {
        navigateTo(`/payment/return?status=success&eventId=${eventId.value}`)
        return
    }
    if (result.formFields && Object.keys(result.formFields).length && result.paymentUrl) {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = result.paymentUrl
        for (const [key, value] of Object.entries(result.formFields)) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value
            form.appendChild(input)
        }
        document.body.appendChild(form)
        form.submit()
    } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl
    }
}

const plans = [
    {
        days: 7, popular: false, icon: 'mdi-star-outline',
        desc: 'Wydarzenie wyróżnione przez tydzień.',
        feats: ['Pozycja TOP w wynikach', 'Oznaczenie WYRÓŻNIONE', 'Więcej uczestników'],
    },
    {
        days: 14, popular: true, icon: 'mdi-star',
        desc: 'Dwa tygodnie maksymalnej widoczności.',
        feats: ['Pozycja TOP w wynikach', 'Sekcja polecane na stronie głównej', '3× więcej wyświetleń'],
    },
    {
        days: 30, popular: false, icon: 'mdi-crown-outline',
        desc: 'Miesiąc wyróżnienia – idealne dla dużych wydarzeń.',
        feats: ['Wszystko z 14 dni', 'Najlepsza cena na dzień', 'Priorytetowe wsparcie'],
    },
]

const apiPrices = ref<Record<number, number>>({})

function getDisplayPrice(days: number): number {
    return apiPrices.value[days] ?? (days === 7 ? 9.99 : days === 14 ? 17.99 : 29.99)
}

const selectedPrice = computed(() => getDisplayPrice(selectedDays.value))
const finalPrice = computed(() => couponResult.value?.isValid ? couponResult.value.finalPrice : selectedPrice.value)

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(async () => {
    await Promise.allSettled([
        // Fetch event data
        $fetch<any>(`/api/proxy/api/Event/${eventId.value}`)
            .then(e => { event.value = e })
            .catch(() => {}),
        // Fetch prices
        ...[7, 14, 30].map(days =>
            getPrice('EventFeatured', days)
                .then(r => { apiPrices.value[days] = r.price })
                .catch(() => {})
        ),
        // Pre-load user profile
        $fetch<UserProfile>('/api/proxy/api/User/me').then(profile => {
            userProfile.value = profile
            if (profile?.email) billingData.value.email = profile.email
            if (profile?.accountType === 'Business') {
                billingData.value.type = 'business'
                if (profile.companyName) billingData.value.companyName = profile.companyName
                if (profile.nip) billingData.value.nip = profile.nip
                if (profile.street) billingData.value.street = profile.street
                if (profile.postalCode) billingData.value.postalCode = profile.postalCode
                if (profile.city) billingData.value.city = profile.city
                if (profile.country) billingData.value.country = profile.country
            } else {
                billingData.value.type = 'personal'
                if (profile.name) billingData.value.firstName = profile.name
                if (profile.surname) billingData.value.lastName = profile.surname
            }
        }).catch(() => {}),
    ])
})

watch(selectedDays, () => { couponResult.value = null; couponError.value = '' })

async function applyCoupon() {
    if (!couponCode.value.trim()) return
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

function goToBilling() {
    step.value = 2
}

async function initiatePayment() {
    if (!billingFormRef.value?.validateAll()) {
        actionError.value = 'Uzupełnij dane do faktury.'
        return
    }
    paying.value = true
    actionError.value = ''
    try {
        const body: Record<string, unknown> = {
            eventId: eventId.value,
            serviceType: 'EventFeatured',
            durationDays: selectedDays.value,
            ...mapBillingFields(billingData.value),
            returnUrl: `${window.location.origin}/payment/return?status=success&eventId=${eventId.value}`,
            cancelUrl: `${window.location.origin}/payment/return?status=cancel&eventId=${eventId.value}`,
        }
        if (couponResult.value?.isValid && couponCode.value) body.couponCode = couponCode.value

        const result = await $fetch<{ paymentUrl: string, formFields?: Record<string, string>, adminActivated?: boolean }>('/api/proxy/api/Payment/initiate', { method: 'POST', body })
        submitImojeForm(result)
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
    display: flex; align-items: center; gap: 6px; color: $text-dim; font-size: 13px;
    text-decoration: none; transition: color 0.2s; &:hover { color: $text; }
}

.promo-body { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }

.promo-hero {
    text-align: center; margin-bottom: 32px;
    .hero-badge {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba($red, 0.1); border: 1px solid rgba($red, 0.25);
        color: $red; font-size: 13px; font-weight: 700; padding: 5px 14px;
        border-radius: 20px; margin-bottom: 14px;
    }
    h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
    p { font-size: 14px; color: $text-dim; }
}

.event-preview {
    display: flex; align-items: center; justify-content: space-between;
    background: #0a0a0a; border: 1px solid $border; border-radius: 10px;
    padding: 14px 18px; margin-bottom: 28px; gap: 12px;
}

.ep-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ep-name { font-size: 15px; font-weight: 700; color: $text; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: $text-dim; }
.ep-sep { color: $border; }
.ep-badge {
    display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700;
    padding: 4px 10px; border-radius: 20px; white-space: nowrap; flex-shrink: 0;
    background: rgba(255,255,255,0.05); border: 1px solid $border; color: $text-dark;
    &.active { background: rgba($red,0.1); border-color: rgba($red,0.3); color: $red; }
}

.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;
    @media (max-width: 700px) { grid-template-columns: 1fr; }
}

.plan-card {
    background: #0a0a0a; border: 1.5px solid $border; border-radius: 12px; padding: 24px 20px;
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
.plan-name { font-size: 18px; font-weight: 800; color: $text; }
.plan-price { font-size: 26px; font-weight: 900; color: $red; strong { font-size: 30px; } }
.plan-desc { font-size: 12px; color: $text-dim; line-height: 1.5; }

.plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; flex: 1;
    li { display: flex; align-items: center; gap: 7px; font-size: 12px; color: $text-muted;
        .v-icon { color: #4caf50; }
    }
}

.plan-sel-indicator {
    height: 3px; border-radius: 3px; background: transparent; margin-top: auto;
    .selected & { background: $red; }
}

.promo-footer {
    background: #0a0a0a; border: 1px solid $border; border-radius: 12px; padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}

.summary-paid { display: flex; flex-direction: column; gap: 2px; }
.summary-name { font-size: 14px; font-weight: 700; color: $text; }
.summary-price { font-size: 22px; font-weight: 900; color: $red; }

.footer-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.btn-skip {
    display: flex; align-items: center; gap: 6px; background: transparent;
    border: 1px solid $border; border-radius: 8px; color: $text-muted; font-size: 13px;
    font-weight: 600; font-family: 'Inter', sans-serif; padding: 11px 20px; cursor: pointer;
    text-decoration: none; transition: border-color 0.2s, color 0.2s; &:hover { border-color: $text-dim; color: $text; }
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
.coupon-row { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.coupon-input-wrap { display: flex; gap: 6px; }

.coupon-input {
    flex: 1; background: #0d0d0d; border: 1px solid $border; border-radius: 8px; color: $text;
    font-size: 13px; font-family: 'Inter', sans-serif; padding: 9px 14px; outline: none; min-width: 0;
    transition: border-color 0.2s; &::placeholder { color: $text-dark; } &:focus { border-color: rgba($red, 0.4); }
    &:disabled { opacity: 0.5; }
}

.coupon-btn {
    background: transparent; border: 1px solid $border; border-radius: 8px; color: $text-muted;
    font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; padding: 9px 16px;
    cursor: pointer; white-space: nowrap; transition: border-color 0.2s, color 0.2s;
    &:hover:not(:disabled) { border-color: $red; color: $text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.coupon-error { font-size: 12px; color: #e55; }

.billing-step {
    max-width: 680px; margin: 0 auto; background: #0a0a0a; border: 1px solid $border;
    border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 20px;
}

.billing-step-title {
    display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; color: $text; margin: 0;
    .v-icon { color: $red; }
}

.billing-step-sub { font-size: 13px; color: $text-dim; line-height: 1.5; margin: 0; }

.billing-order-summary { background: #0d0d0d; border: 1px solid $border; border-radius: 8px; overflow: hidden; }

.bos-row {
    display: flex; justify-content: space-between; align-items: center; padding: 10px 14px;
    font-size: 13px; color: $text-muted; border-bottom: 1px solid rgba(255,255,255,0.04);
    &:last-child { border-bottom: none; }
}

.bos-discount { color: #4caf50; }
.bos-net, .bos-vat { color: $text-dim; font-size: 12px; }
.bos-total { background: rgba($red, 0.06); color: $text; font-weight: 700; strong { font-size: 18px; color: $red; } }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
