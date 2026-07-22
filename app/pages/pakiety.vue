<template>
    <div class="packages-page">

        <!-- Hero -->
        <div class="hero">
            <div class="hero-inner">
                <div class="hero-badge">
                    <v-icon icon="mdi-briefcase-outline" size="14" />
                    {{ $t('packages.heroBadge') }}
                </div>
                <h1 class="hero-title">{{ $t('packages.heroTitleLine1') }}<br><span class="accent">{{ $t('packages.heroTitleLine2') }}</span></h1>
                <p class="hero-desc">{{ $t('packages.heroDesc') }}</p>

                <div v-if="subscription?.isActive" class="current-plan-banner">
                    <v-icon icon="mdi-check-circle-outline" size="18" />
                    {{ $t('packages.activePackage') }} <strong>{{ subscription.tierName }}</strong>
                    <span v-if="subscription.expiresAt" class="exp-date">{{ $t('packages.validUntil', { date: formatDate(subscription.expiresAt) }) }}</span>
                </div>

                <div v-if="promoActive" class="promo-banner">
                    <v-icon icon="mdi-gift-outline" size="17" />
                    {{ $t('packages.promoBanner') }}
                </div>
            </div>
        </div>

        <!-- Start Program -->
        <div v-if="!subscription?.isStartProgram && !subscription?.isActive" class="start-program-banner">
            <div class="sp-inner">
                <div class="sp-left">
                    <div class="sp-label">{{ $t('packages.startProgramLabel') }}</div>
                    <div class="sp-title">{{ $t('packages.startProgramTitle') }}</div>
                    <div class="sp-desc">{{ $t('packages.startProgramDesc') }}</div>
                </div>
                <button class="sp-btn" :disabled="startLoading || !user" @click="activateStart">
                    <template v-if="!user">{{ $t('packages.loginToActivate') }}</template>
                    <template v-else-if="startLoading">
                        <v-icon icon="mdi-loading" size="16" class="spin" />
                        {{ $t('packages.activating') }}
                    </template>
                    <template v-else>{{ $t('packages.activateStartProgram') }}</template>
                </button>
            </div>
        </div>
        <div v-else-if="subscription?.isStartProgram" class="start-program-banner start-program-banner--active">
            <div class="sp-inner">
                <div class="sp-left">
                    <div class="sp-label">
                        <v-icon icon="mdi-check-circle" size="14" />
                        {{ $t('packages.startProgramActiveLabel') }}
                    </div>
                    <div class="sp-title">{{ $t('packages.startProgramActiveTitle') }}</div>
                    <div class="sp-desc">{{ $t('packages.startProgramActiveDesc', { date: formatDate(subscription.expiresAt) }) }}</div>
                </div>
            </div>
        </div>

        <!-- Plans grid -->
        <div class="plans-section">
            <div class="plans-grid">
                <div
                    v-for="plan in plans"
                    :key="plan.tier"
                    class="plan-card"
                    :class="{
                        'plan-card--popular': plan.tier === 'Biznes',
                        'plan-card--custom': plan.isCustom,
                        'plan-card--active': subscription?.tier === plan.tier && subscription?.isActive,
                    }"
                >
                    <div v-if="plan.tier === 'Biznes'" class="popular-tag">
                        <v-icon icon="mdi-fire" size="13" /> {{ $t('packages.mostPopular') }}
                    </div>

                    <div class="plan-header">
                        <div class="plan-name">
                            {{ plan.name }}
                            <span v-if="promoActive && !plan.isCustom" class="plan-badge-free">{{ $t('packages.forFreeUpper') }}</span>
                        </div>
                        <div v-if="!plan.isCustom && promoActive" class="plan-price">
                            <span class="price-amount price-amount--crossed">{{ formatPrice(plan.nettoPrice) }} zł</span>
                            <span class="price-amount price-amount--free">{{ $t('packages.forFreeLower') }}</span>
                        </div>
                        <div v-else-if="!plan.isCustom" class="plan-price">
                            <span class="price-amount">{{ formatPrice(plan.nettoPrice) }}</span>
                            <span class="price-unit">{{ $t('packages.nettoPerMonth') }}</span>
                        </div>
                        <div v-else class="plan-price plan-price--custom">
                            <span class="price-amount">{{ $t('packages.priceCustom') }}</span>
                            <span class="price-unit">{{ $t('packages.priceCustomUnit') }}</span>
                        </div>
                        <div v-if="!plan.isCustom && !promoActive" class="price-brutto">{{ $t('packages.bruttoWithVat', { price: formatPrice(plan.bruttoPrice) }) }}</div>
                    </div>

                    <ul class="plan-features">
                        <li v-for="f in plan.features" :key="f">
                            <v-icon icon="mdi-check" size="15" class="check-icon" />
                            {{ f }}
                        </li>
                    </ul>

                    <div class="plan-stats">
                        <div class="stat">
                            <v-icon icon="mdi-car-multiple" size="15" />
                            <span>{{ $t('packages.adsCount', { count: plan.maxActiveAds >= 999999 ? '∞' : plan.maxActiveAds }) }}</span>
                        </div>
                        <div class="stat">
                            <v-icon icon="mdi-calendar-clock" size="15" />
                            <span>{{ $t('packages.emissionDays', { days: plan.emissionDays }) }}</span>
                        </div>
                        <div class="stat">
                            <v-icon icon="mdi-star-outline" size="15" />
                            <span>{{ $t('packages.featuredPerMonth', { count: plan.featuredQuotaPerMonth >= 999999 ? '∞' : plan.featuredQuotaPerMonth }) }}</span>
                        </div>
                    </div>

                    <template v-if="subscription?.tier === plan.tier && subscription?.isActive">
                        <button class="plan-btn plan-btn--active" disabled>
                            <v-icon icon="mdi-check-circle-outline" size="16" />
                            {{ $t('packages.activePackageBtn') }}
                        </button>
                    </template>
                    <template v-else-if="plan.isCustom">
                        <a href="mailto:kontakt@carizo.eu" class="plan-btn plan-btn--contact">
                            {{ $t('packages.contact') }}
                        </a>
                    </template>
                    <template v-else>
                        <button
                            class="plan-btn"
                            :class="{ 'plan-btn--popular': plan.tier === 'Biznes' }"
                            :disabled="buyLoading === plan.tier || !user"
                            @click="buyPlan(plan)"
                        >
                            <template v-if="!user">{{ $t('packages.login') }}</template>
                            <template v-else-if="buyLoading === plan.tier">
                                <v-icon icon="mdi-loading" size="16" class="spin" />
                                {{ $t('packages.redirecting') }}
                            </template>
                            <template v-else-if="promoActive">{{ $t('packages.activateForFree') }}</template>
                            <template v-else>
                                {{ subscription?.isActive ? $t('packages.changePackage') : $t('packages.choosePackage') }}
                            </template>
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <!-- FAQ -->
        <div class="faq-section">
            <div class="faq-inner">
                <h2 class="faq-title">{{ $t('packages.faqTitle') }}</h2>
                <div class="faq-list">
                    <div v-for="(item, i) in faq" :key="i" class="faq-item" @click="toggleFaq(i)">
                        <div class="faq-q">
                            {{ item.q }}
                            <v-icon :icon="openFaq === i ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="18" />
                        </div>
                        <div v-if="openFaq === i" class="faq-a">{{ item.a }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast -->
        <div v-if="toast" class="toast" :class="'toast--' + toast.type">
            <v-icon :icon="toast.type === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'" size="18" />
            {{ toast.msg }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSubscription, type SubscriptionPlan, type SubscriptionStatus } from '~/composables/useSubscription'

const { t } = useI18n()
const { fetchProfile } = useUser()
const user = ref(false)
const { getPlans, getMySubscription, activateStartProgram, buySubscription } = useSubscription()
const { getPromoStatus } = usePayment()

const plans = ref<SubscriptionPlan[]>([])
const subscription = ref<SubscriptionStatus | null>(null)
const promoActive = ref(false)
const startLoading = ref(false)
const buyLoading = ref<string | null>(null)
const openFaq = ref<number | null>(null)
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)

const faq = computed(() => [
    { q: t('packages.faq.q1'), a: t('packages.faq.a1') },
    { q: t('packages.faq.q2'), a: t('packages.faq.a2') },
    { q: t('packages.faq.q3'), a: t('packages.faq.a3') },
    { q: t('packages.faq.q4'), a: t('packages.faq.a4') },
    { q: t('packages.faq.q5'), a: t('packages.faq.a5') },
    { q: t('packages.faq.q6'), a: t('packages.faq.a6') },
])

function formatPrice(n: number) {
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(d: string | null) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function toggleFaq(i: number) {
    openFaq.value = openFaq.value === i ? null : i
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
    toast.value = { msg, type }
    setTimeout(() => { toast.value = null }, 4000)
}

async function activateStart() {
    if (!user.value) { navigateTo('/login') ; return }
    startLoading.value = true
    try {
        const res = await activateStartProgram()
        showToast(res.message, 'success')
        subscription.value = await getMySubscription()
    } catch (e: any) {
        showToast(e?.data?.message ?? t('packages.toastStartError'), 'error')
    } finally {
        startLoading.value = false
    }
}

async function buyPlan(plan: SubscriptionPlan) {
    if (!user.value) { navigateTo('/login') ; return }
    buyLoading.value = plan.tier
    try {
        const result: any = await buySubscription(plan.tier)
        if (result?.adminActivated) {
            showToast(t('packages.toastPackageActivated'), 'success')
            subscription.value = await getMySubscription()
        } else if (result?.paymentUrl && result?.formFields) {
            // Create and submit iMoje form
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = result.paymentUrl
            for (const [k, v] of Object.entries(result.formFields as Record<string, string>)) {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = k
                input.value = v
                form.appendChild(input)
            }
            document.body.appendChild(form)
            form.submit()
        }
    } catch (e: any) {
        showToast(e?.data?.message ?? t('packages.toastPaymentError'), 'error')
        buyLoading.value = null
    }
}

onMounted(async () => {
    const profile = await fetchProfile()
    user.value = !!profile
    const [p, s] = await Promise.allSettled([getPlans(), user.value ? getMySubscription() : Promise.resolve(null)])
    if (p.status === 'fulfilled') plans.value = p.value
    if (s.status === 'fulfilled' && s.value) subscription.value = s.value
    getPromoStatus().then(r => { promoActive.value = r.isFreePromoActive }).catch(() => {})
})

useHead({ title: t('packages.metaTitle'), meta: [{ name: 'description', content: t('packages.metaDescription') }] })
</script>

<style lang="scss" scoped>
.packages-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }

// ── Hero ──────────────────────────────────────────────────────────────
.hero {
    padding: 80px 0 60px;
    text-align: center;
    background: radial-gradient(ellipse at 50% 0%, rgba(139,13,29,0.14) 0%, transparent 70%);
    border-bottom: 1px solid $border;
}

.hero-inner { @include container; }

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(139,13,29,0.12);
    border: 1px solid rgba(139,13,29,0.3);
    color: $red;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 5px 14px;
    border-radius: 20px;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.hero-title {
    font-size: clamp(32px, 5vw, 54px);
    font-weight: 800;
    color: $text;
    line-height: 1.15;
    margin: 0 0 16px;
    .accent { color: $red; }
}

.hero-desc {
    font-size: 16px;
    color: $text-muted;
    margin: 0 auto 28px;
    max-width: 520px;
    line-height: 1.6;
}

.current-plan-banner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(139,13,29,0.1);
    border: 1px solid rgba(139,13,29,0.25);
    color: $text-muted;
    font-size: 13px;
    padding: 8px 18px;
    border-radius: $r-sm;
    margin-top: 8px;
    v-icon { color: $red; }
    strong { color: $text; }
    .exp-date { color: $text-dim; }
}

.promo-banner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(76,175,80,0.1);
    border: 1px solid rgba(76,175,80,0.3);
    color: #4caf50;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 18px;
    border-radius: $r-sm;
    margin-top: 12px;
}

// ── Start Program ─────────────────────────────────────────────────────
.start-program-banner {
    border-bottom: 1px solid $border;
    background: linear-gradient(135deg, rgba(139,13,29,0.08) 0%, rgba(139,13,29,0.03) 100%);
    padding: 28px 0;
}
.start-program-banner--active { background: rgba(22,80,22,0.08); border-color: rgba(60,140,60,0.2); }

.sp-inner {
    @include container;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
}

.sp-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $red;
    margin-bottom: 6px;
}
.sp-title { font-size: 18px; font-weight: 700; color: $text; margin-bottom: 4px; }
.sp-desc { font-size: 13px; color: $text-muted; }

.sp-btn {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 28px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
}

// ── Plans grid ────────────────────────────────────────────────────────
.plans-section {
    @include container;
    padding-top: 56px;
    padding-bottom: 72px;
}

.plans-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 600px)  { grid-template-columns: 1fr; }
}

.plan-card {
    position: relative;
    background: $card;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: border-color 0.2s, transform 0.2s;
    &:hover { border-color: #333; transform: translateY(-2px); }
    &--popular {
        border-color: $red;
        background: linear-gradient(160deg, rgba(139,13,29,0.06) 0%, $card 60%);
        box-shadow: 0 0 40px rgba(139,13,29,0.12);
    }
    &--active { border-color: #2a6b2a; background: rgba(22,80,22,0.05); }
}

.popular-tag {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: $red;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.03em;
}

.plan-header { text-align: center; }

.plan-name {
    font-size: 20px;
    font-weight: 800;
    color: $text;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.plan-badge-free {
    font-size: 10px;
    font-weight: 800;
    color: #4caf50;
    background: rgba(76,175,80,0.12);
    border: 1px solid rgba(76,175,80,0.3);
    padding: 2px 8px;
    border-radius: 20px;
}

.plan-price { display: flex; align-items: baseline; gap: 4px; justify-content: center; }
.plan-price--custom { flex-direction: column; gap: 2px; }

.price-amount { font-size: 36px; font-weight: 800; color: $text; line-height: 1; }
.price-amount--crossed { font-size: 18px; font-weight: 500; color: $text-dim; text-decoration: line-through; }
.price-amount--free { color: #4caf50; }
.price-unit { font-size: 13px; color: $text-dim; align-self: flex-end; padding-bottom: 3px; }
.price-brutto { font-size: 11px; color: $text-dim; margin-top: 4px; }

.plan-features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 13px;
        color: $text-muted;
        line-height: 1.4;
    }
}

.check-icon { color: $red; flex-shrink: 0; margin-top: 1px; }

.plan-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid $border;
    padding-top: 16px;
    .stat {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: $text-dim;
        v-icon { color: $text-faint; }
    }
}

.plan-btn {
    margin-top: auto;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-decoration: none;
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
    &--popular {
        background: $red;
        border-color: $red;
        color: white;
        &:hover:not(:disabled) { opacity: 0.88; border-color: $red; }
    }
    &--active {
        background: rgba(22,80,22,0.15);
        border-color: rgba(60,140,60,0.3);
        color: #5db85d;
    }
    &--contact {
        border-color: $border;
        color: $text-muted;
        &:hover { border-color: $text-dim; color: $text; }
    }
}

// ── FAQ ───────────────────────────────────────────────────────────────
.faq-section {
    border-top: 1px solid $border;
    padding: 64px 0 80px;
    background: $card-alt;
}

.faq-inner { @include container; max-width: 760px; }

.faq-title {
    font-size: 28px;
    font-weight: 800;
    color: $text;
    margin: 0 0 32px;
}

.faq-list { display: flex; flex-direction: column; gap: 0; }

.faq-item {
    border-bottom: 1px solid $border;
    padding: 18px 0;
    cursor: pointer;
}

.faq-q {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
    color: $text;
    gap: 16px;
    user-select: none;
}

.faq-a {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.6;
    margin-top: 12px;
}

// ── Toast ─────────────────────────────────────────────────────────────
.toast {
    position: fixed;
    bottom: 28px;
    right: 24px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: $r-sm;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    &--success { background: #0f2e0f; border: 1px solid #2a6b2a; color: #6fcf6f; }
    &--error   { background: #1a0a0a; border: 1px solid #5a1a1a; color: #e07070; }
}

// ── Spin animation ────────────────────────────────────────────────────
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
