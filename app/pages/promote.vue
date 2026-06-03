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

                <img
                    src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=700&auto=format&fit=crop"
                    alt=""
                    class="promo-car-img"
                />
            </div>

            <!-- ── Standard header (after premiere) ───────────────────────── -->
            <div v-else class="page-header">
                <h1 class="page-title">Wyróżnij swoje ogłoszenie</h1>
                <p class="page-sub">Większa widoczność = większe szanse na sprzedaż</p>
            </div>

            <!-- ── Pricing section ─────────────────────────────────────────── -->
            <div class="pricing-section">
                <div v-if="isPremiereActive || isPremiereUpcoming" class="pricing-head">
                    <h2 class="pricing-title">Wybierz opcję promowania</h2>
                    <p class="pricing-sub">Większa widoczność = większe szanse na sprzedaż</p>
                </div>

                <div class="pricing-grid">
                    <div
                        v-for="plan in plans"
                        :key="plan.key"
                        class="plan-card"
                        :class="`plan-card--${plan.key}`"
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
                                @click="selectedDays[plan.key as MultiPlanKey] = d.days"
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

                        <button class="plan-btn" @click="navigateTo('/my-adverts')">
                            {{ plan.cta }}
                            <v-icon icon="mdi-arrow-right" size="15" />
                        </button>
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
const { isPremiereActive, isPremiereUpcoming, remainingToEnd, remainingToStart, pad } = usePromotion()

// ── Data ──────────────────────────────────────────────────────────────────────

type MultiPlanKey = 'highlight' | 'top'

interface PlanDuration { days: number; price: string }
interface Plan {
    key: string
    icon: string
    name: string
    desc: string
    singlePrice: string | null
    durations: PlanDuration[] | null
    cta: string
    badgeLabel: string | null
}

const plans: Plan[] = [
    {
        key: 'refresh',
        icon: 'mdi-refresh',
        name: 'Odśwież ofertę',
        desc: 'Twoje ogłoszenie wróci na początek wyników wyszukiwania i listy w kategorii.',
        singlePrice: '3,99 zł',
        durations: null,
        cta: 'Odśwież teraz',
        badgeLabel: null,
    },
    {
        key: 'highlight',
        icon: 'mdi-star',
        name: 'Wyróżnij ofertę',
        desc: 'Ogłoszenie otrzymuje oznaczenie „WYRÓŻNIONE", czerwone obramowanie i jest wyświetlane wyżej od zwykłych ofert.',
        singlePrice: null,
        durations: [
            { days: 7,  price: '7,99 zł'  },
            { days: 30, price: '19,99 zł' },
        ],
        cta: 'Wyróżnij teraz',
        badgeLabel: 'WYRÓŻNIONE',
    },
    {
        key: 'top',
        icon: 'mdi-crown',
        name: 'Oferta TOP',
        desc: 'Ogłoszenie pojawia się na stronie głównej, na początku kategorii i wyników wyszukiwania.',
        singlePrice: null,
        durations: [
            { days: 7,  price: '14,99 zł' },
            { days: 30, price: '39,99 zł' },
        ],
        cta: 'Dodaj do TOP',
        badgeLabel: 'TOP',
    },
]

const benefits = [
    { icon: 'mdi-trending-up',       title: 'Więcej wyświetleń',        sub: 'Twoja oferta na górze listy' },
    { icon: 'mdi-eye-outline',        title: 'Lepsza widoczność',         sub: 'Docieraj do większej liczby kupujących' },
    { icon: 'mdi-lightning-bolt',     title: 'Szybsza sprzedaż',          sub: 'Zwiększ szanse na udaną transakcję' },
    { icon: 'mdi-shield-check-outline', title: 'Bezpiecznie i skutecznie', sub: 'Sprawdzona platforma wymagających' },
]

// ── State ─────────────────────────────────────────────────────────────────────

const selectedDays = reactive<Record<MultiPlanKey, number>>({ highlight: 7, top: 7 })

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPrice(plan: Plan): string {
    if (plan.singlePrice) return plan.singlePrice
    const days = selectedDays[plan.key as MultiPlanKey]
    return plan.durations!.find(d => d.days === days)!.price
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
</script>

<style lang="scss" scoped>
.promote-page {
    background: $bg;
    min-height: 100vh;
    padding-top: $header-total;
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
