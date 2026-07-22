<template>
    <div class="htw-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">{{ $t('howItWorks.heroEyebrow') }}</div>
                <h1>{{ $t('howItWorks.heroTitleBefore') }} <span>{{ $t('howItWorks.heroTitleHighlight') }}</span></h1>
                <p>{{ $t('howItWorks.heroDesc') }}</p>
            </div>
        </div>

        <div class="container page-body">

            <div class="section-title-row">
                <h2 class="section-h2">{{ $t('howItWorks.sellTitleBefore') }} <span>{{ $t('howItWorks.sellTitleHighlight') }}</span> {{ $t('howItWorks.sellTitleAfter') }}</h2>
            </div>
            <div class="steps-grid">
                <div v-for="(s, i) in sellSteps" :key="i" class="step-card">
                    <div class="step-num">{{ i + 1 }}</div>
                    <div class="step-icon"><v-icon :icon="s.icon" size="28" /></div>
                    <div class="step-title">{{ s.title }}</div>
                    <div class="step-desc">{{ s.desc }}</div>
                </div>
            </div>

            <div class="section-title-row" style="margin-top: 72px;">
                <h2 class="section-h2">{{ $t('howItWorks.buyTitleBefore') }} <span>{{ $t('howItWorks.buyTitleHighlight') }}</span> {{ $t('howItWorks.buyTitleAfter') }}</h2>
            </div>
            <div class="steps-grid">
                <div v-for="(s, i) in buySteps" :key="i" class="step-card">
                    <div class="step-num">{{ i + 1 }}</div>
                    <div class="step-icon"><v-icon :icon="s.icon" size="28" /></div>
                    <div class="step-title">{{ s.title }}</div>
                    <div class="step-desc">{{ s.desc }}</div>
                </div>
            </div>

            <div class="faq-section">
                <h2 class="section-h2">{{ $t('howItWorks.faqTitleBefore') }} <span>{{ $t('howItWorks.faqTitleHighlight') }}</span></h2>
                <div class="faq-list">
                    <div v-for="(faq, i) in faqs" :key="i" class="faq-item">
                        <button class="faq-q" :class="{ open: openFaq === i }" @click="openFaq = openFaq === i ? null : i">
                            {{ faq.q }}
                            <v-icon :icon="openFaq === i ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="18" />
                        </button>
                        <transition name="accordion">
                            <div v-if="openFaq === i" class="faq-a">{{ faq.a }}</div>
                        </transition>
                    </div>
                </div>
            </div>

            <div class="cta-row">
                <NuxtLink to="/register" class="btn-cta">{{ $t('howItWorks.ctaRegister') }}</NuxtLink>
                <NuxtLink to="/adverts" class="btn-cta-outline">{{ $t('howItWorks.ctaBrowse') }}</NuxtLink>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
const jakConfig = useRuntimeConfig()
const { t, tm, rt } = useI18n()
useSeoMeta({
    title: () => t('howItWorks.metaTitle'),
    description: () => t('howItWorks.metaDescription'),
    ogType: 'website',
    ogUrl: `${jakConfig.public.siteUrl}/jak-to-dziala`,
    ogTitle: () => t('howItWorks.ogTitle'),
    ogDescription: () => t('howItWorks.ogDescription'),
    ogImage: `${jakConfig.public.siteUrl}/og-image.jpg`,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogSiteName: 'CARIZO',
    twitterCard: 'summary_large_image',
    twitterTitle: () => t('howItWorks.twitterTitle'),
    twitterDescription: () => t('howItWorks.twitterDescription'),
    twitterImage: `${jakConfig.public.siteUrl}/og-image.jpg`,
})
useHead({ link: [{ rel: 'canonical', href: `${jakConfig.public.siteUrl}/jak-to-dziala` }] })

const openFaq = ref<number | null>(null)

const sellIcons = ['mdi-account-plus-outline', 'mdi-car-info', 'mdi-star-outline', 'mdi-handshake-outline']
const buyIcons = ['mdi-magnify', 'mdi-heart-outline', 'mdi-message-outline', 'mdi-calendar-check-outline']

const sellSteps = computed(() => (tm('howItWorks.sellSteps') as any[]).map((s, i) => ({ icon: sellIcons[i], title: rt(s.title), desc: rt(s.desc) })))
const buySteps = computed(() => (tm('howItWorks.buySteps') as any[]).map((s, i) => ({ icon: buyIcons[i], title: rt(s.title), desc: rt(s.desc) })))
const faqs = computed(() => (tm('howItWorks.faqs') as any[]).map(f => ({ q: rt(f.q), a: rt(f.a) })))
</script>

<style lang="scss" scoped>
.htw-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }
.container { @include container; }

.page-hero {
    padding: 56px 0 48px;
    border-bottom: 1px solid $border;
    background: linear-gradient(180deg, #0d0005 0%, $bg 100%);
}

.hero-eyebrow {
    font-size: 11px; font-weight: 700; color: $red;
    text-transform: uppercase; letter-spacing: 3px; margin-bottom: 14px;
}

.page-hero h1 {
    font-size: 48px; font-weight: 900; color: $text; margin-bottom: 10px;
    span { color: $red; }
    @include respond-to(sm) { font-size: 34px; }
}

.page-hero p { font-size: 15px; color: $text-muted; }

.page-body { padding: 56px 0 80px; }

.section-title-row { margin-bottom: 32px; }

.section-h2 {
    font-size: 30px; font-weight: 900; color: $text;
    span { color: $red; }
}

.steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.step-card {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 24px 20px;
    position: relative;
    transition: border-color 0.2s;
    &:hover { border-color: rgba($red, 0.3); }
}

.step-num {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 32px;
    font-weight: 900;
    color: rgba(255,255,255,0.05);
    line-height: 1;
}

.step-icon { color: $red; margin-bottom: 16px; }

.step-title {
    font-size: 15px; font-weight: 800; color: $text; margin-bottom: 10px;
}

.step-desc {
    font-size: 13px; color: $text-dim; line-height: 1.7;
}

.faq-section { margin-top: 72px; }

.faq-list { margin-top: 28px; max-width: 760px; display: flex; flex-direction: column; gap: 8px; }

.faq-item {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-md;
    overflow: hidden;
}

.faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: transparent;
    border: none;
    color: $text;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 16px 18px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;

    &:hover { background: rgba(255,255,255,0.03); }
    &.open { background: rgba($red, 0.05); color: $text; }

    .v-icon { flex-shrink: 0; color: $text-dim; }
}

.faq-a {
    padding: 0 18px 16px;
    font-size: 13px;
    color: $text-muted;
    line-height: 1.8;
}

.accordion-enter-active, .accordion-leave-active { transition: opacity 0.2s; }
.accordion-enter-from, .accordion-leave-to { opacity: 0; }

.cta-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 72px;
    flex-wrap: wrap;
}

.btn-cta {
    display: inline-flex;
    align-items: center;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-md;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 32px;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.btn-cta-outline {
    display: inline-flex;
    align-items: center;
    background: transparent;
    color: $text-muted;
    border: 1px solid $border;
    border-radius: $r-md;
    font-size: 15px;
    font-weight: 600;
    padding: 14px 32px;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}
</style>
