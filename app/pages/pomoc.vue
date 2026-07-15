<template>
    <div class="help-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">Centrum pomocy</div>
                <h1>Jak możemy <span>pomóc?</span></h1>
                <div class="hero-search">
                    <v-icon icon="mdi-magnify" size="20" class="hs-icon" />
                    <input v-model="query" class="hs-input" placeholder="Szukaj w centrum pomocy..." />
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
                <p>Brak wyników dla „{{ query }}"</p>
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
                    <div class="cc-title">Nie znalazłeś odpowiedzi?</div>
                    <div class="cc-sub">Skontaktuj się z naszym zespołem wsparcia.</div>
                </div>
                <a href="mailto:kontakt@carizo.eu" class="btn-contact">Napisz do nas</a>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
const pomocConfig = useRuntimeConfig()
useSeoMeta({
    title: 'Pomoc — CARIZO',
    description: 'Centrum pomocy CARIZO — znajdź odpowiedzi na najczęstsze pytania dotyczące sprzedaży, zakupu i bezpieczeństwa transakcji.',
    ogType: 'website',
    ogUrl: `${pomocConfig.public.siteUrl}/pomoc`,
    ogTitle: 'Centrum pomocy — CARIZO',
    ogDescription: 'FAQ i wskazówki dla kupujących i sprzedających na platformie CARIZO.',
    ogImage: `${pomocConfig.public.siteUrl}/og-image.jpg`,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogSiteName: 'CARIZO',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Centrum pomocy — CARIZO',
    twitterDescription: 'FAQ i wskazówki dla kupujących i sprzedających na platformie CARIZO.',
    twitterImage: `${pomocConfig.public.siteUrl}/og-image.jpg`,
})
useHead({ link: [{ rel: 'canonical', href: `${pomocConfig.public.siteUrl}/pomoc` }] })

const query = ref('')
const openKey = ref<string | null>(null)
const activeCategory = ref<string | null>(null)

function toggle(key: string) {
    openKey.value = openKey.value === key ? null : key
}

const categories = [
    { key: 'konto', label: 'Konto', icon: 'mdi-account-outline' },
    { key: 'ogloszenia', label: 'Ogłoszenia', icon: 'mdi-car-outline' },
    { key: 'platnosci', label: 'Płatności', icon: 'mdi-credit-card-outline' },
    { key: 'bezpieczenstwo', label: 'Bezpieczeństwo', icon: 'mdi-shield-outline' },
]

const groups = [
    {
        key: 'konto',
        label: 'Konto i rejestracja',
        icon: 'mdi-account-circle-outline',
        faqs: [
            { q: 'Jak założyć konto w CARIZO?', a: 'Kliknij przycisk „Zarejestruj się" w prawym górnym rogu strony. Wypełnij formularz podając imię, adres e-mail i hasło. Po rejestracji otrzymasz e-mail z linkiem aktywacyjnym.' },
            { q: 'Zapomniałem hasła – co zrobić?', a: 'Na stronie logowania kliknij „Zapomniałem hasła". Podaj swój adres e-mail, a my wyślemy Ci link do resetowania hasła.' },
            { q: 'Jak zmienić dane konta?', a: 'Przejdź do <strong>Ustawień konta</strong> dostępnych w panelu użytkownika. Możesz tam zmienić imię, numer telefonu, adres i inne dane.' },
            { q: 'Jak usunąć konto?', a: 'Możesz to zrobić w Ustawieniach konta → sekcja „Strefa niebezpieczna". Pamiętaj, że usunięcie konta jest nieodwracalne i spowoduje usunięcie wszystkich Twoich ogłoszeń.' },
            { q: 'Czym różni się konto osobiste od firmowego?', a: 'Konto firmowe (Business) pozwala na dodawanie większej liczby ogłoszeń, wyświetlanie logo firmy, zarządzanie wieloma ogłoszeniami z jednego panelu oraz wystawianie faktur VAT.' },
        ]
    },
    {
        key: 'ogloszenia',
        label: 'Ogłoszenia',
        icon: 'mdi-car-outline',
        faqs: [
            { q: 'Jak dodać ogłoszenie?', a: 'Kliknij „Dodaj ogłoszenie" w menu. Wypełnij dane pojazdu w formularzu: marka, model, rok, przebieg, cena i opis. Dodaj co najmniej 3 zdjęcia. Kliknij „Opublikuj".' },
            { q: 'Ile kosztuje dodanie ogłoszenia?', a: 'Podstawowe ogłoszenie jest <strong>bezpłatne</strong>. Płatne są jedynie pakiety promocji (TOP, Premium, Wyróżnienie), które zwiększają widoczność oferty.' },
            { q: 'Jak długo ogłoszenie jest aktywne?', a: 'Standardowe ogłoszenie jest aktywne przez <strong>90 dni</strong>. Po tym czasie możesz je odświeżyć (płatna opcja) lub opublikować ponownie.' },
            { q: 'Mogę edytować opublikowane ogłoszenie?', a: 'Tak, możesz edytować ogłoszenie w dowolnym momencie z poziomu panelu „Moje ogłoszenia". Zmiany będą widoczne natychmiast.' },
            { q: 'Jak oznaczyć auto jako sprzedane?', a: 'W panelu „Moje ogłoszenia" kliknij przycisk z ikoną uścisku dłoni (handshake) przy ogłoszeniu. Potwierdź w oknie dialogowym. Ogłoszenie zniknie z wyników wyszukiwania.' },
            { q: 'Ile zdjęć mogę dodać?', a: 'Możesz dodać do 20 zdjęć do jednego ogłoszenia. Pierwsze zdjęcie będzie zdjęciem głównym widocznym w wynikach wyszukiwania. Zalecamy dodanie minimum 8 zdjęć.' },
        ]
    },
    {
        key: 'platnosci',
        label: 'Płatności i faktury',
        icon: 'mdi-credit-card-outline',
        faqs: [
            { q: 'Jakie metody płatności akceptujecie?', a: 'Akceptujemy: karty Visa i Mastercard, BLIK, przelewy bankowe online oraz inne metody dostępne przez system ING IMOJE.' },
            { q: 'Czy moje dane płatnicze są bezpieczne?', a: 'Tak. Płatności obsługuje ING IMOJE – certyfikowany operator płatności. CARIZO nie przechowuje danych kart płatniczych.' },
            { q: 'Jak pobrać fakturę?', a: 'Faktury dostępne są w sekcji „Faktury" w panelu użytkownika. Kliknij przycisk pobierania przy wybranej fakturze, aby ją zapisać w formacie HTML lub PDF.' },
            { q: 'Czy mogę anulować transakcję?', a: 'Możesz anulować transakcję ze statusem „Oczekująca" z poziomu sekcji „Transakcje". Transakcji już zrealizowanych nie można anulować – w takim przypadku skontaktuj się z pomocą techniczną.' },
            { q: 'Kiedy płatność za promocję zostaje aktywowana?', a: 'Promocja jest aktywowana natychmiast po potwierdzeniu płatności przez system płatności (zazwyczaj w ciągu kilku sekund).' },
        ]
    },
    {
        key: 'bezpieczenstwo',
        label: 'Bezpieczeństwo i oszustwa',
        icon: 'mdi-shield-outline',
        faqs: [
            { q: 'Jak rozpoznać fałszywe ogłoszenie?', a: 'Czerwone flagi: cena znacznie poniżej rynkowej, brak zdjęć lub zdjęcia z internetu, sprzedający prosi o przelew przed oględzinami, brak możliwości kontaktu telefonicznego, prośby o płatności przez komunikatory.' },
            { q: 'Jak bezpiecznie sfinalizować transakcję?', a: 'Zawsze <strong>obejrzyj auto osobiście</strong> przed zakupem. Spotkaj się w bezpiecznym miejscu. Nie płać z góry bez sprawdzenia pojazdu. Sprawdź historię pojazdu przez CEPiK lub inne serwisy.' },
            { q: 'Jak zgłosić podejrzane ogłoszenie?', a: 'Na stronie ogłoszenia kliknij przycisk „Zgłoś" (ikona flagi). Opisz problem i wyślij zgłoszenie. Nasz zespół weryfikuje zgłoszenia w ciągu 24 godzin.' },
            { q: 'Czy CARIZO weryfikuje sprzedawców?', a: 'Sprzedawcy mogą uzyskać status VERIFIED po przejściu procesu weryfikacji tożsamości. Ogłoszenia od zweryfikowanych sprzedawców oznaczone są specjalną odznaką.' },
        ]
    },
]

const filteredGroups = computed(() => {
    let result = groups
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
