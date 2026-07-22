<template>
    <div class="help-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">{{ $t('help.heroEyebrow') }}</div>
                <h1>{{ $t('help.heroTitleBefore') }} <span>{{ $t('help.heroTitleHighlight') }}</span></h1>
                <div class="hero-search">
                    <v-icon icon="mdi-magnify" size="20" class="hs-icon" />
                    <input v-model="query" class="hs-input" :placeholder="$t('help.searchPlaceholder')" />
                </div>
            </div>
        </div>

        <div class="container page-body">

            <div class="categories-row">
                <button
                    v-for="cat in categories"
                    :key="cat.key"
                    class="cat-chip"
                    :class="{ active: activeCategory === cat.key }"
                    @click="activeCategory = activeCategory === cat.key ? null : cat.key"
                >
                    <v-icon :icon="cat.icon" size="16" />
                    {{ cat.label }}
                </button>
            </div>

            <div v-if="filteredGroups.length === 0" class="no-results">
                <v-icon icon="mdi-help-circle-outline" size="40" />
                <p>{{ $t('help.noResults', { query }) }}</p>
            </div>

            <div v-for="group in filteredGroups" :key="group.key" class="faq-group">
                <div class="group-header">
                    <v-icon :icon="group.icon" size="20" class="group-icon" />
                    <h2>{{ group.label }}</h2>
                </div>
                <div class="faq-list">
                    <div v-for="(faq, i) in group.faqs" :key="i" class="faq-item">
                        <button
                            class="faq-q"
                            :class="{ open: openKey === `${group.key}-${i}` }"
                            @click="toggle(`${group.key}-${i}`)"
                        >
                            {{ faq.q }}
                            <v-icon :icon="openKey === `${group.key}-${i}` ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="18" />
                        </button>
                        <transition name="accordion">
                            <div v-if="openKey === `${group.key}-${i}`" class="faq-a" v-html="faq.a" />
                        </transition>
                    </div>
                </div>
            </div>

            <div class="contact-cta">
                <div class="cc-icon"><v-icon icon="mdi-headset" size="32" /></div>
                <div>
                    <div class="cc-title">{{ $t('help.contactCtaTitle') }}</div>
                    <div class="cc-sub">{{ $t('help.contactCtaSub') }}</div>
                </div>
                <a href="mailto:kontakt@carizo.eu" class="btn-contact">{{ $t('help.contactCtaBtn') }}</a>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
const pomocConfig = useRuntimeConfig()
const { t, tm, rt } = useI18n()
useSeoMeta({
    title: () => t('help.metaTitle'),
    description: () => t('help.metaDescription'),
    ogType: 'website',
    ogUrl: `${pomocConfig.public.siteUrl}/pomoc`,
    ogTitle: () => t('help.ogTitle'),
    ogDescription: () => t('help.ogDescription'),
    ogImage: `${pomocConfig.public.siteUrl}/og-image.jpg`,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogSiteName: 'CARIZO',
    twitterCard: 'summary_large_image',
    twitterTitle: () => t('help.twitterTitle'),
    twitterDescription: () => t('help.twitterDescription'),
    twitterImage: `${pomocConfig.public.siteUrl}/og-image.jpg`,
})
useHead({ link: [{ rel: 'canonical', href: `${pomocConfig.public.siteUrl}/pomoc` }] })

const query = ref('')
const openKey = ref<string | null>(null)
const activeCategory = ref<string | null>(null)

function toggle(key: string) {
    openKey.value = openKey.value === key ? null : key
}

const categories = computed(() => [
    { key: 'konto', label: t('help.catKonto'), icon: 'mdi-account-outline' },
    { key: 'ogloszenia', label: t('help.catOgloszenia'), icon: 'mdi-car-outline' },
    { key: 'platnosci', label: t('help.catPlatnosci'), icon: 'mdi-credit-card-outline' },
    { key: 'bezpieczenstwo', label: t('help.catBezpieczenstwo'), icon: 'mdi-shield-outline' },
])

function faqsFrom(key: string) {
    return (tm(key) as any[]).map(f => ({ q: rt(f.q), a: rt(f.a) }))
}

const groups = computed(() => [
    { key: 'konto', label: t('help.groupKontoLabel'), icon: 'mdi-account-circle-outline', faqs: faqsFrom('help.groupKontoFaqs') },
    { key: 'ogloszenia', label: t('help.groupOgloszeniaLabel'), icon: 'mdi-car-outline', faqs: faqsFrom('help.groupOgloszeniaFaqs') },
    { key: 'platnosci', label: t('help.groupPlatnosciLabel'), icon: 'mdi-credit-card-outline', faqs: faqsFrom('help.groupPlatnosciFaqs') },
    { key: 'bezpieczenstwo', label: t('help.groupBezpieczenstwoLabel'), icon: 'mdi-shield-outline', faqs: faqsFrom('help.groupBezpieczenstwoFaqs') },
])

const filteredGroups = computed(() => {
    let result = groups.value
    if (activeCategory.value) {
        result = result.filter(g => g.key === activeCategory.value)
    }
    if (query.value.trim()) {
        const q = query.value.toLowerCase()
        result = result.map(g => ({
            ...g,
            faqs: g.faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
        })).filter(g => g.faqs.length > 0)
    }
    return result
})
</script>

<style lang="scss" scoped>
.help-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }
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
    font-size: 48px; font-weight: 900; color: $text; margin-bottom: 28px;
    span { color: $red; }
    @include respond-to(sm) { font-size: 34px; }
}

.hero-search {
    max-width: 540px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 12px 16px;
    transition: border-color 0.2s;
    &:focus-within { border-color: rgba($red, 0.4); }
}

.hs-icon { color: $text-dim; flex-shrink: 0; }

.hs-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    &::placeholder { color: $text-dim; }
}

.page-body { padding: 36px 0 80px; }

.categories-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 36px;
}

.cat-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: 999px;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 7px 16px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;

    &:hover { border-color: $text-dim; color: $text; }
    &.active { background: rgba($red, 0.1); border-color: rgba($red, 0.4); color: $text; }
}

.no-results {
    text-align: center;
    padding: 80px 0;
    color: $text-dim;
    .v-icon { color: $text-dim; margin-bottom: 16px; display: block; margin-inline: auto; }
    p { font-size: 15px; }
}

.faq-group { margin-bottom: 48px; }

.group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;

    h2 { font-size: 20px; font-weight: 800; color: $text; }
}

.group-icon { color: $red; }

.faq-list { max-width: 800px; display: flex; flex-direction: column; gap: 6px; }

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
    padding: 15px 18px;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;

    &:hover { background: rgba(255,255,255,0.03); }
    &.open { background: rgba($red, 0.05); }

    .v-icon { flex-shrink: 0; color: $text-dim; }
}

.faq-a {
    padding: 0 18px 16px;
    font-size: 13px;
    color: $text-muted;
    line-height: 1.8;
    :deep(strong) { color: $text; font-weight: 600; }
}

.accordion-enter-active, .accordion-leave-active { transition: opacity 0.2s; }
.accordion-enter-from, .accordion-leave-to { opacity: 0; }

.contact-cta {
    display: flex;
    align-items: center;
    gap: 20px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 28px 32px;
    margin-top: 24px;
    flex-wrap: wrap;

    @include respond-to(sm) { flex-direction: column; text-align: center; }
}

.cc-icon {
    width: 56px; height: 56px;
    background: rgba($red, 0.1);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: $red;
    flex-shrink: 0;
}

.cc-title { font-size: 16px; font-weight: 800; color: $text; margin-bottom: 4px; }
.cc-sub { font-size: 13px; color: $text-dim; }

.btn-contact {
    margin-left: auto;
    background: $red;
    color: white;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 28px;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }

    @include respond-to(sm) { margin-left: 0; }
}
</style>
