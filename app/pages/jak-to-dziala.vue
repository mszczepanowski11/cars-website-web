<template>
    <div class="htw-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">Przewodnik</div>
                <h1>Jak to <span>działa?</span></h1>
                <p>Sprzedawaj i kupuj auta w kilku prostych krokach.</p>
            </div>
        </div>

        <div class="container page-body">

            <div class="section-title-row">
                <h2 class="section-h2">Chcę <span>sprzedać</span> auto</h2>
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
                <h2 class="section-h2">Chcę <span>kupić</span> auto</h2>
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
                <h2 class="section-h2">Często zadawane <span>pytania</span></h2>
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
                <NuxtLink to="/register" class="btn-cta">Zarejestruj się za darmo</NuxtLink>
                <NuxtLink to="/adverts" class="btn-cta-outline">Przeglądaj ogłoszenia</NuxtLink>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: 'Jak to działa — CARIZO',
    meta: [
        { name: 'description', content: 'Dowiedz się jak sprzedawać i kupować samochody na CARIZO. Prosta rejestracja, bezpieczne ogłoszenia i bezpośredni kontakt ze sprzedającym.' },
        { property: 'og:title', content: 'Jak to działa — CARIZO' },
        { property: 'og:description', content: 'Sprzedaj lub kup samochód w kilku prostych krokach. Zarejestruj się za darmo na CARIZO.' },
    ]
})

const openFaq = ref<number | null>(null)

const sellSteps = [
    { icon: 'mdi-account-plus-outline', title: 'Utwórz konto', desc: 'Rejestracja jest darmowa i zajmuje mniej niż minutę. Możesz wybrać konto osobiste lub firmowe.' },
    { icon: 'mdi-car-info', title: 'Dodaj ogłoszenie', desc: 'Wypełnij formularz z danymi pojazdu, dodaj zdjęcia i ustal cenę. System podpowie Ci rynkową wycenę.' },
    { icon: 'mdi-star-outline', title: 'Opcjonalnie: promuj', desc: 'Zwiększ widoczność ogłoszenia wybierając pakiet TOP, Premium lub Wyróżnienie. Lub opublikuj za darmo.' },
    { icon: 'mdi-handshake-outline', title: 'Finalizuj transakcję', desc: 'Odbieraj zapytania, prowadź negocjacje i finalizuj sprzedaż bezpośrednio z kupującym.' },
]

const buySteps = [
    { icon: 'mdi-magnify', title: 'Szukaj', desc: 'Skorzystaj z rozbudowanej wyszukiwarki z filtrami marki, modelu, ceny, przebiegu i wielu innych parametrów.' },
    { icon: 'mdi-heart-outline', title: 'Obserwuj', desc: 'Zapisuj ulubione ogłoszenia i ustawiaj alerty cenowe, aby nie przegapić okazji.' },
    { icon: 'mdi-message-outline', title: 'Skontaktuj się', desc: 'Napisz do sprzedającego przez wbudowany komunikator lub zadzwoń bezpośrednio ze strony ogłoszenia.' },
    { icon: 'mdi-calendar-check-outline', title: 'Umów oględziny', desc: 'Zarezerwuj termin oględzin bezpośrednio w serwisie i bezpiecznie sfinalizuj transakcję.' },
]

const faqs = [
    { q: 'Czy zamieszczenie ogłoszenia jest bezpłatne?', a: 'Tak, podstawowe ogłoszenie jest całkowicie bezpłatne. Płatne są jedynie opcje promocji zwiększające widoczność.' },
    { q: 'Jak długo ogłoszenie jest widoczne?', a: 'Standardowe ogłoszenie jest aktywne przez 30 dni. Możesz je przedłużyć lub odświeżyć (opcja płatna).' },
    { q: 'Czy CARIZO weryfikuje ogłoszenia?', a: 'Tak, ogłoszenia przechodzą weryfikację systemu. Ogłoszenia oznaczone jako VERIFIED zostały dodatkowo sprawdzone przez nasz zespół.' },
    { q: 'Jak działa system płatności?', a: 'Płatności obsługuje ING IMOJE – bezpieczny system płatności online. Akceptujemy karty Visa/Mastercard, BLIK, przelewy bankowe i inne metody.' },
    { q: 'Mogę usunąć ogłoszenie przed wygaśnięciem?', a: 'Tak, możesz usunąć lub ukryć ogłoszenie w każdej chwili z poziomu panelu „Moje ogłoszenia".' },
    { q: 'Co zrobić gdy sprzedam auto?', a: 'Oznacz ogłoszenie jako sprzedane przyciskiem „Oznacz jako sprzedane" w panelu użytkownika. Ogłoszenie zniknie z wyników wyszukiwania.' },
]
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
