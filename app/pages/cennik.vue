<template>
    <div class="pricing-page">
        <div class="container">

            <div class="page-hero">
                <h1 class="page-title">{{ $t('pricing.title') }}</h1>
                <p class="page-sub">{{ $t('pricing.subtitle') }}</p>
            </div>

            <!-- Tab switch -->
            <div class="tab-switch">
                <button
                    class="tab-btn"
                    :class="{ active: tab === 'personal' }"
                    @click="tab = 'personal'"
                >
                    <v-icon icon="mdi-account-outline" size="18" />
                    {{ $t('pricing.tabPersonal') }}
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: tab === 'business' }"
                    @click="tab = 'business'"
                >
                    <v-icon icon="mdi-briefcase-outline" size="18" />
                    {{ $t('pricing.tabBusiness') }}
                </button>
            </div>

            <!-- ── PERSONAL ─────────────────────────────────────────────────── -->
            <div v-if="tab === 'personal'" class="tab-content">

                <div v-if="promoActive" class="promo-banner">
                    <v-icon icon="mdi-gift-outline" size="17" />
                    {{ $t('pricing.promoBanner') }}
                </div>

                <section class="price-section">
                    <h2 class="section-title">{{ $t('pricing.adsTitle') }}</h2>
                    <p class="section-sub">{{ $t('pricing.adsSub') }}</p>

                    <div class="info-cards">
                        <div class="info-card info-card--free">
                            <div class="info-card-icon">
                                <v-icon icon="mdi-car-outline" size="22" />
                            </div>
                            <div>
                                <div class="info-card-title">{{ $t('pricing.addAdvert') }}</div>
                                <div class="info-card-desc">{{ $t('pricing.addAdvertDesc') }}</div>
                            </div>
                            <div class="info-card-price free">{{ $t('pricing.freeUpper') }}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-card-icon">
                                <v-icon icon="mdi-calendar-range" size="22" />
                            </div>
                            <div>
                                <div class="info-card-title">{{ $t('pricing.emissionTime') }}</div>
                                <div class="info-card-desc">{{ $t('pricing.emissionDesc') }}</div>
                            </div>
                            <div class="info-card-price">{{ $t('pricing.days90') }}</div>
                        </div>
                    </div>

                    <div class="limit-note">
                        <v-icon icon="mdi-information-outline" size="15" />
                        {{ $t('pricing.limitNote') }}
                    </div>
                </section>

                <section class="price-section">
                    <h2 class="section-title">{{ $t('pricing.promoteTitle') }}</h2>
                    <p class="section-sub">{{ $t('pricing.promoteSubPersonal') }}</p>

                    <div class="promo-table">
                        <div class="promo-row promo-header">
                            <span>{{ $t('pricing.colOption') }}</span>
                            <span>{{ $t('pricing.col7') }}</span>
                            <span>{{ $t('pricing.col14') }}</span>
                            <span>{{ $t('pricing.col30') }}</span>
                        </div>
                        <div v-for="p in promoPlansPersonal" :key="p.key" class="promo-row" :class="`promo-row--${p.key}`">
                            <div class="promo-name-cell">
                                <v-icon :icon="p.icon" size="16" class="promo-icon" />
                                <div>
                                    <div class="promo-name">{{ p.name }}</div>
                                    <div class="promo-hint">{{ p.hint }}</div>
                                </div>
                            </div>
                            <span v-for="price in p.prices" :key="price" class="promo-price">
                                <template v-if="price === '—'">—</template>
                                <template v-else-if="promoActive">
                                    <span class="promo-price-crossed">{{ price }}</span>
                                    <span class="promo-price-free">{{ $t('pricing.forFreeLower') }}</span>
                                </template>
                                <template v-else>{{ price }}</template>
                            </span>
                        </div>
                    </div>

                    <div class="vat-note">{{ $t('pricing.vatIncluded') }}</div>
                </section>

            </div>

            <!-- ── BUSINESS ─────────────────────────────────────────────────── -->
            <div v-if="tab === 'business'" class="tab-content">

                <div v-if="promoActive" class="promo-banner">
                    <v-icon icon="mdi-gift-outline" size="17" />
                    {{ $t('pricing.promoBanner') }}
                </div>

                <section class="price-section">
                    <h2 class="section-title">{{ $t('pricing.monthlyPackagesTitle') }}</h2>
                    <p class="section-sub">{{ $t('pricing.monthlyPackagesSub') }}</p>

                    <div class="b2b-grid">
                        <div
                            v-for="plan in b2bPlans"
                            :key="plan.key"
                            class="b2b-card"
                            :class="[`b2b-card--${plan.key}`, { 'b2b-card--popular': plan.popular }]"
                        >
                            <div class="b2b-accent" />
                            <div v-if="plan.popular" class="b2b-popular">
                                <v-icon icon="mdi-fire" size="11" />{{ $t('pricing.mostPopular') }}
                            </div>
                            <div class="b2b-head">
                                <div class="b2b-icon">
                                    <v-icon :icon="plan.icon" size="20" />
                                </div>
                                <div>
                                    <div class="b2b-name">{{ plan.name }}</div>
                                    <div v-if="plan.badge" class="b2b-badge" :class="`b2b-badge--${plan.key}`">{{ plan.badge }}</div>
                                </div>
                            </div>

                            <div v-if="!plan.custom && promoActive" class="b2b-price-block">
                                <div class="b2b-price-netto b2b-price-netto--crossed">{{ plan.priceNetto }}</div>
                                <div class="b2b-price-brutto b2b-price-brutto--free">{{ $t('pricing.forFreeUpper') }}</div>
                            </div>
                            <div v-else-if="!plan.custom" class="b2b-price-block">
                                <div class="b2b-price-netto">{{ plan.priceNetto }} <span>{{ $t('pricing.nettoPerMonth') }}</span></div>
                                <div class="b2b-price-brutto">{{ plan.priceBrutto }} {{ $t('pricing.bruttoWithVat') }}</div>
                            </div>
                            <div v-else class="b2b-price-block">
                                <div class="b2b-price-netto custom">{{ $t('pricing.customPricing') }}</div>
                                <div class="b2b-price-brutto">{{ $t('pricing.contactUsShort') }}</div>
                            </div>

                            <ul class="b2b-features">
                                <li v-for="f in plan.features" :key="f">
                                    <v-icon icon="mdi-check" size="13" class="b2b-check" />
                                    {{ f }}
                                </li>
                            </ul>

                            <NuxtLink v-if="!plan.custom" to="/pakiety" class="b2b-cta">
                                {{ $t('pricing.choosePackage') }}
                                <v-icon icon="mdi-arrow-right" size="14" />
                            </NuxtLink>
                            <a v-else href="mailto:kontakt@carizo.eu" class="b2b-cta b2b-cta--contact">
                                {{ $t('pricing.contact') }}
                                <v-icon icon="mdi-email-outline" size="14" />
                            </a>
                        </div>
                    </div>

                    <div class="vat-note">
                        {{ $t('pricing.b2bVatNote') }}
                    </div>
                </section>

                <section class="price-section">
                    <h2 class="section-title">{{ $t('pricing.promoteTitle') }}</h2>
                    <p class="section-sub">{{ $t('pricing.promoteSubBusiness') }}</p>

                    <div class="promo-table">
                        <div class="promo-row promo-header">
                            <span>{{ $t('pricing.colOption') }}</span>
                            <span>{{ $t('pricing.col7') }}</span>
                            <span>{{ $t('pricing.col14') }}</span>
                            <span>{{ $t('pricing.col30') }}</span>
                        </div>
                        <div v-for="p in promoPlansB2B" :key="p.key" class="promo-row" :class="`promo-row--${p.key}`">
                            <div class="promo-name-cell">
                                <v-icon :icon="p.icon" size="16" class="promo-icon" />
                                <div>
                                    <div class="promo-name">{{ p.name }}</div>
                                    <div class="promo-hint">{{ p.hint }}</div>
                                </div>
                            </div>
                            <div v-for="col in p.cols" :key="col.brutto" class="promo-price-cell">
                                <template v-if="col.brutto === '—'">
                                    <div class="promo-brutto">—</div>
                                </template>
                                <template v-else-if="promoActive">
                                    <div class="promo-price-crossed">{{ col.brutto }}</div>
                                    <div class="promo-price-free">{{ $t('pricing.forFreeLower') }}</div>
                                </template>
                                <template v-else>
                                    <div class="promo-brutto">{{ col.brutto }}</div>
                                    <div class="promo-netto">{{ col.netto }} {{ $t('pricing.nettoSuffix') }}</div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <div class="vat-note">{{ $t('pricing.b2bVatNote2') }}</div>
                </section>

            </div>

            <!-- ── FAQ ─────────────────────────────────────────────────────── -->
            <section class="faq-section">
                <h2 class="section-title">{{ $t('pricing.faqTitle') }}</h2>
                <div class="faq-grid">
                    <div v-for="q in faq" :key="q.q" class="faq-item">
                        <div class="faq-q">
                            <v-icon icon="mdi-help-circle-outline" size="16" class="faq-icon" />
                            {{ q.q }}
                        </div>
                        <div class="faq-a">{{ q.a }}</div>
                    </div>
                </div>
            </section>

        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
    title: t('pricing.metaTitle'),
    meta: [{ name: 'description', content: t('pricing.metaDescription') }],
})

const tab = ref<'personal' | 'business'>('personal')

const { getPromoStatus } = usePayment()
const promoActive = ref(false)
onMounted(() => {
    getPromoStatus().then(r => { promoActive.value = r.isFreePromoActive }).catch(() => {})
})

const promoPlansPersonal = computed(() => [
    {
        key: 'refresh', icon: 'mdi-refresh', name: t('pricing.plans.refresh.name'),
        hint: t('pricing.plans.refresh.hint'),
        prices: ['4,99 zł', '—', '—'],
    },
    {
        key: 'highlight', icon: 'mdi-star', name: t('pricing.plans.highlight.name'),
        hint: t('pricing.plans.highlight.hint'),
        prices: ['14,99 zł', '24,99 zł', '39,99 zł'],
    },
    {
        key: 'top', icon: 'mdi-crown', name: t('pricing.plans.top.name'),
        hint: t('pricing.plans.top.hint'),
        prices: ['19,99 zł', '29,99 zł', '49,99 zł'],
    },
    {
        key: 'premium', icon: 'mdi-diamond-outline', name: t('pricing.plans.premium.name'),
        hint: t('pricing.plans.premium.hint'),
        prices: ['29,99 zł', '44,99 zł', '79,99 zł'],
    },
])

function toNetto(brutto: number) {
    return (brutto / 1.23).toFixed(2).replace('.', ',') + ' zł'
}
function toBrutto(brutto: number) {
    return brutto.toFixed(2).replace('.', ',') + ' zł'
}

const promoPlansB2B = computed(() => [
    {
        key: 'refresh', icon: 'mdi-refresh', name: t('pricing.plans.refresh.name'),
        hint: t('pricing.plans.refresh.hint'),
        cols: [
            { brutto: toBrutto(4.99), netto: toNetto(4.99) },
            { brutto: '—', netto: '' },
            { brutto: '—', netto: '' },
        ],
    },
    {
        key: 'highlight', icon: 'mdi-star', name: t('pricing.plans.highlight.name'),
        hint: t('pricing.plans.highlight.hint'),
        cols: [
            { brutto: toBrutto(14.99), netto: toNetto(14.99) },
            { brutto: toBrutto(24.99), netto: toNetto(24.99) },
            { brutto: toBrutto(39.99), netto: toNetto(39.99) },
        ],
    },
    {
        key: 'top', icon: 'mdi-crown', name: t('pricing.plans.top.name'),
        hint: t('pricing.plans.top.hint'),
        cols: [
            { brutto: toBrutto(19.99), netto: toNetto(19.99) },
            { brutto: toBrutto(29.99), netto: toNetto(29.99) },
            { brutto: toBrutto(49.99), netto: toNetto(49.99) },
        ],
    },
    {
        key: 'premium', icon: 'mdi-diamond-outline', name: t('pricing.plans.premium.name'),
        hint: t('pricing.plans.premium.hint'),
        cols: [
            { brutto: toBrutto(29.99), netto: toNetto(29.99) },
            { brutto: toBrutto(44.99), netto: toNetto(44.99) },
            { brutto: toBrutto(79.99), netto: toNetto(79.99) },
        ],
    },
])

const b2bPlans = computed(() => [
    {
        key: 'start', icon: 'mdi-rocket-launch-outline', name: t('pricing.b2b.start.name'),
        badge: null, popular: false, custom: false,
        priceNetto: '99,00 zł', priceBrutto: '121,77 zł',
        features: [
            t('pricing.b2b.start.f1'),
            t('pricing.b2b.start.f2'),
            t('pricing.b2b.start.f3'),
            t('pricing.b2b.start.f4'),
            t('pricing.b2b.start.f5'),
        ],
    },
    {
        key: 'biznes', icon: 'mdi-briefcase-outline', name: t('pricing.b2b.biznes.name'),
        badge: t('pricing.b2b.biznes.badge'), popular: true, custom: false,
        priceNetto: '279,00 zł', priceBrutto: '343,17 zł',
        features: [
            t('pricing.b2b.biznes.f1'),
            t('pricing.b2b.biznes.f2'),
            t('pricing.b2b.biznes.f3'),
            t('pricing.b2b.biznes.f4'),
            t('pricing.b2b.biznes.f5'),
        ],
    },
    {
        key: 'premium', icon: 'mdi-diamond-outline', name: t('pricing.b2b.premium.name'),
        badge: null, popular: false, custom: false,
        priceNetto: '599,00 zł', priceBrutto: '736,77 zł',
        features: [
            t('pricing.b2b.premium.f1'),
            t('pricing.b2b.premium.f2'),
            t('pricing.b2b.premium.f3'),
            t('pricing.b2b.premium.f4'),
            t('pricing.b2b.premium.f5'),
        ],
    },
    {
        key: 'enterprise', icon: 'mdi-office-building-outline', name: t('pricing.b2b.enterprise.name'),
        badge: null, popular: false, custom: true,
        priceNetto: '', priceBrutto: '',
        features: [
            t('pricing.b2b.enterprise.f1'),
            t('pricing.b2b.enterprise.f2'),
            t('pricing.b2b.enterprise.f3'),
            t('pricing.b2b.enterprise.f4'),
            t('pricing.b2b.enterprise.f5'),
        ],
    },
])

const faq = computed(() => [
    { q: t('pricing.faq.q1'), a: t('pricing.faq.a1') },
    { q: t('pricing.faq.q2'), a: t('pricing.faq.a2') },
    { q: t('pricing.faq.q3'), a: t('pricing.faq.a3') },
    { q: t('pricing.faq.q4'), a: t('pricing.faq.a4') },
    { q: t('pricing.faq.q5'), a: t('pricing.faq.a5') },
    { q: t('pricing.faq.q6'), a: t('pricing.faq.a6') },
])
</script>

<style lang="scss" scoped>
.pricing-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $nav-height;
    padding-bottom: 100px;
}

.container { @include container; }

// ── Hero ──────────────────────────────────────────────────────────────────────
.page-hero {
    padding: 64px 0 40px;
    text-align: center;
}

.page-title {
    font-size: 52px;
    font-weight: 900;
    color: $text;
    margin-bottom: 12px;

    @include respond-to(sm) { font-size: 36px; }
}

.page-sub {
    font-size: 16px;
    color: $text-dim;
}

// ── Tab switch ────────────────────────────────────────────────────────────────
.tab-switch {
    display: flex;
    gap: 8px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 6px;
    max-width: 440px;
    margin: 0 auto 52px;
}

.tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: none;
    border-radius: $r-md;
    color: $text-dim;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;

    .v-icon { transition: color 0.2s; }

    &:hover { color: $text-muted; }

    &.active {
        background: $red;
        color: white;
        .v-icon { color: white; }
    }
}

.tab-content { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.promo-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(76,175,80,0.1);
    border: 1px solid rgba(76,175,80,0.3);
    color: #4caf50;
    font-size: 13px;
    font-weight: 700;
    padding: 10px 16px;
    border-radius: $r-sm;
    margin-bottom: 24px;
    text-align: center;
}

// ── Section ───────────────────────────────────────────────────────────────────
.price-section {
    margin-bottom: 60px;
}

.section-title {
    font-size: 26px;
    font-weight: 900;
    color: $text;
    margin-bottom: 8px;
}

.section-sub {
    font-size: 14px;
    color: $text-dim;
    margin-bottom: 28px;
}

// ── Personal info cards ───────────────────────────────────────────────────────
.info-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.info-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 20px 22px;

    &--free { border-color: rgba(76, 175, 80, 0.25); }
}

.info-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    flex-shrink: 0;

    .info-card--free & {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.25);
        color: #4caf50;
    }
}

.info-card-title {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 3px;
}

.info-card-desc {
    font-size: 12px;
    color: $text-dim;
}

.info-card-price {
    margin-left: auto;
    font-size: 18px;
    font-weight: 900;
    color: $text;
    flex-shrink: 0;

    &.free {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #4caf50;
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid rgba(76, 175, 80, 0.25);
        padding: 5px 12px;
        border-radius: 20px;
    }
}

.limit-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    color: $text-dark;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 12px 16px;

    .v-icon { flex-shrink: 0; margin-top: 1px; }
}

// ── Promo table ───────────────────────────────────────────────────────────────
.promo-table {
    border: 1px solid $border;
    border-radius: $r-lg;
    overflow: hidden;
    margin-bottom: 16px;
}

.promo-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    align-items: center;
    border-bottom: 1px solid $border;
    padding: 0 4px;

    &:last-child { border-bottom: none; }

    > span, > div { padding: 16px 14px; }

    &.promo-header {
        background: #060606;
        > span {
            font-size: 11px;
            font-weight: 700;
            color: $text-dark;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
    }

    &--top       { background: rgba(#f5a623, 0.015); }
    &--premium   { background: rgba(#b388ff, 0.015); }

    @include respond-to(sm) {
        grid-template-columns: 1.5fr repeat(3, 1fr);
        > span, > div { padding: 12px 10px; }
    }
}

.promo-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.promo-icon {
    color: $red;
    flex-shrink: 0;

    .promo-row--top &     { color: #f5a623; }
    .promo-row--premium & { color: #b388ff; }
}

.promo-name {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 2px;
}

.promo-hint {
    font-size: 11px;
    color: $text-dark;

    @include respond-to(sm) { display: none; }
}

.promo-price {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.promo-price-crossed {
    text-decoration: line-through;
    color: $text-dim;
    font-weight: 400;
    font-size: 12px;
}

.promo-price-free {
    color: #4caf50;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 12px;
}

.promo-price-cell {
    padding: 14px;
}

.promo-brutto {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 2px;
}

.promo-netto {
    font-size: 11px;
    color: $text-dark;
}

.vat-note {
    font-size: 12px;
    color: $text-dark;
    text-align: right;
    margin-top: 10px;
}

// ── B2B plans grid ────────────────────────────────────────────────────────────
.b2b-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 20px;

    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.b2b-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-lg;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;

    &:hover { transform: translateY(-3px); }

    &--start:hover   { border-color: rgba($red, 0.35); box-shadow: 0 8px 30px rgba($red, 0.07); }
    &--biznes:hover  { border-color: rgba(#f5a623, 0.4); box-shadow: 0 8px 30px rgba(#f5a623, 0.07); }
    &--premium:hover { border-color: rgba(#b388ff, 0.4); box-shadow: 0 8px 30px rgba(#b388ff, 0.07); }
    &--enterprise:hover { border-color: rgba(255,255,255, 0.15); }

    &--popular {
        border-color: rgba(#f5a623, 0.35);
    }

    > *:not(.b2b-accent):not(.b2b-popular) {
        padding-left: 20px;
        padding-right: 20px;
    }

    > .b2b-head { padding-top: 18px; }
    > .b2b-cta  { margin: auto 20px 20px; padding-left: 0; padding-right: 0; }
    > .b2b-features { padding-left: 20px; padding-right: 20px; }
}

.b2b-accent {
    height: 3px;
    border-radius: $r-lg $r-lg 0 0;

    .b2b-card--start &     { background: $red; }
    .b2b-card--biznes &    { background: linear-gradient(90deg, #e89020, #f5a623); }
    .b2b-card--premium &   { background: linear-gradient(90deg, #7b52d4, #b388ff); }
    .b2b-card--enterprise & { background: linear-gradient(90deg, #555, #aaa); }
}

.b2b-popular {
    position: absolute;
    top: 14px;
    right: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(#f5a623, 0.15);
    border: 1px solid rgba(#f5a623, 0.4);
    color: #f5a623;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 3px 8px;
    border-radius: 20px;
}

.b2b-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.b2b-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    color: $red;

    .b2b-card--biznes &    { background: rgba(#f5a623, 0.1); border-color: rgba(#f5a623, 0.2); color: #f5a623; }
    .b2b-card--premium &   { background: rgba(#b388ff, 0.1); border-color: rgba(#b388ff, 0.2); color: #b388ff; }
    .b2b-card--enterprise & { background: rgba(255,255,255, 0.06); border-color: rgba(255,255,255, 0.12); color: $text-muted; }
}

.b2b-name {
    font-size: 16px;
    font-weight: 800;
    color: $text;
}

.b2b-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 3px;

    &--biznes { background: rgba(#f5a623, 0.15); color: #f5a623; border: 1px solid rgba(#f5a623, 0.3); }
}

.b2b-price-block {
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid $border;
}

.b2b-price-netto {
    font-size: 24px;
    font-weight: 900;
    color: $text;
    margin-bottom: 4px;

    span { font-size: 13px; font-weight: 500; color: $text-dim; }

    &.custom {
        font-size: 16px;
        font-weight: 700;
        color: $text-muted;
    }

    &--crossed {
        font-size: 16px;
        font-weight: 500;
        color: $text-dim;
        text-decoration: line-through;
    }
}

.b2b-price-brutto {
    font-size: 12px;
    color: $text-dark;

    &--free {
        font-size: 20px;
        font-weight: 900;
        color: #4caf50;
        letter-spacing: 0.02em;
    }
}

.b2b-features {
    list-style: none;
    padding: 0;
    margin: 0 0 22px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    flex: 1;

    li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: $text-muted;
    }
}

.b2b-check {
    color: $red;
    flex-shrink: 0;
    .b2b-card--biznes &    { color: #f5a623; }
    .b2b-card--premium &   { color: #b388ff; }
    .b2b-card--enterprise & { color: $text-muted; }
}

.b2b-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.3);
    border-radius: $r-sm;
    color: lighten($red, 12%);
    font-size: 13px;
    font-weight: 700;
    padding: 12px;
    text-decoration: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.2s, border-color 0.2s;
    width: 100%;

    &:hover { background: rgba($red, 0.18); border-color: rgba($red, 0.5); }

    .b2b-card--biznes & {
        background: rgba(#f5a623, 0.1);
        border-color: rgba(#f5a623, 0.3);
        color: #f5a623;
        &:hover { background: rgba(#f5a623, 0.18); border-color: rgba(#f5a623, 0.5); }
    }

    .b2b-card--premium & {
        background: rgba(#b388ff, 0.1);
        border-color: rgba(#b388ff, 0.3);
        color: #b388ff;
        &:hover { background: rgba(#b388ff, 0.18); border-color: rgba(#b388ff, 0.5); }
    }

    &--contact {
        background: rgba(255,255,255, 0.04);
        border-color: rgba(255,255,255, 0.1);
        color: $text-muted;
        &:hover { background: rgba(255,255,255, 0.08); border-color: rgba(255,255,255, 0.2); color: $text; }
    }
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
.faq-section {
    border-top: 1px solid $border;
    padding-top: 56px;
    margin-top: 16px;
}

.faq-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 32px;

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.faq-item {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 22px;
}

.faq-q {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 10px;
}

.faq-icon { color: $red; flex-shrink: 0; margin-top: 1px; }

.faq-a {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.7;
    padding-left: 25px;
}
</style>
