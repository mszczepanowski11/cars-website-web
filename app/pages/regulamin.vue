<template>
    <div class="static-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">Dokumenty prawne</div>
                <h1>Regulamin <span>serwisu</span></h1>
                <p>Ostatnia aktualizacja: 1 czerwca 2026</p>
            </div>
        </div>

        <div class="container page-body">
            <div class="doc-content">

                <section class="doc-section">
                    <h2>§1. Postanowienia ogólne</h2>
                    <p>Niniejszy Regulamin określa zasady korzystania z serwisu CARIZO, dostępnego pod adresem carizo.pl, prowadzonego przez CARIZO sp. z o.o. z siedzibą w Polsce.</p>
                    <p>Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu. Jeśli nie zgadzasz się z jego postanowieniami, prosimy o zaprzestanie korzystania z Serwisu.</p>
                </section>

                <section class="doc-section">
                    <h2>§2. Definicje</h2>
                    <ul>
                        <li><strong>Serwis</strong> – platforma ogłoszeniowa CARIZO dostępna pod adresem carizo.pl</li>
                        <li><strong>Użytkownik</strong> – osoba fizyczna lub prawna korzystająca z Serwisu</li>
                        <li><strong>Ogłoszenie</strong> – oferta sprzedaży lub zakupu pojazdu zamieszczona w Serwisie</li>
                        <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie</li>
                        <li><strong>Operator</strong> – CARIZO sp. z o.o.</li>
                    </ul>
                </section>

                <section class="doc-section">
                    <h2>§3. Rejestracja i konto</h2>
                    <p>Korzystanie z pełnej funkcjonalności Serwisu wymaga rejestracji i utworzenia Konta. Rejestracja jest bezpłatna i dostępna dla osób pełnoletnich.</p>
                    <p>Użytkownik zobowiązuje się do podania prawdziwych danych podczas rejestracji oraz ich aktualizowania w razie zmiany. Zabrania się tworzenia kont fikcyjnych oraz podszywania się pod inne osoby.</p>
                    <p>Użytkownik jest odpowiedzialny za zachowanie poufności danych dostępowych do Konta.</p>
                </section>

                <section class="doc-section">
                    <h2>§4. Zasady zamieszczania ogłoszeń</h2>
                    <p>Użytkownik może zamieszczać ogłoszenia dotyczące pojazdów, których jest właścicielem lub posiada uprawnienie do ich sprzedaży. Zabrania się zamieszczania ogłoszeń:</p>
                    <ul>
                        <li>dotyczących pojazdów kradzionych lub pochodzących z przestępstwa</li>
                        <li>zawierających nieprawdziwe informacje lub wprowadzających w błąd</li>
                        <li>naruszających prawa osób trzecich</li>
                        <li>niezgodnych z obowiązującym prawem</li>
                        <li>zawierających treści obraźliwe lub niestosowne</li>
                    </ul>
                    <p>Operator zastrzega sobie prawo do usunięcia ogłoszeń naruszających Regulamin bez uprzedniego powiadomienia.</p>
                </section>

                <section class="doc-section">
                    <h2>§5. Płatności i promocje</h2>
                    <p>Podstawowe zamieszczenie ogłoszenia jest bezpłatne. Serwis oferuje płatne opcje promocji ogłoszeń (TOP, Premium, Wyróżnienie, Odświeżenie), których ceny dostępne są w cenniku.</p>
                    <p>Płatności obsługiwane są przez system płatności ING IMOJE. Operator nie przechowuje danych kart płatniczych.</p>
                    <p>W przypadku nieudanej płatności lub rezygnacji, Użytkownik może ubiegać się o zwrot środków zgodnie z procedurą reklamacyjną.</p>
                </section>

                <section class="doc-section">
                    <h2>§6. Odpowiedzialność</h2>
                    <p>Operator nie ponosi odpowiedzialności za treść ogłoszeń zamieszczanych przez Użytkowników ani za transakcje zawierane między Użytkownikami poza Serwisem.</p>
                    <p>Operator dokłada wszelkich starań w celu zapewnienia nieprzerwanego działania Serwisu, jednak nie gwarantuje jego dostępności przez 24 godziny na dobę, 7 dni w tygodniu.</p>
                </section>

                <section class="doc-section">
                    <h2>§7. Ochrona danych osobowych</h2>
                    <p>Dane osobowe Użytkowników przetwarzane są zgodnie z Polityką Prywatności dostępną pod adresem carizo.pl/polityka-prywatnosci oraz z obowiązującymi przepisami RODO.</p>
                </section>

                <section class="doc-section">
                    <h2>§8. Zmiany Regulaminu</h2>
                    <p>Operator zastrzega sobie prawo do zmiany Regulaminu. O wszelkich zmianach Użytkownicy zostaną poinformowani z co najmniej 14-dniowym wyprzedzeniem za pośrednictwem poczty elektronicznej lub powiadomienia w Serwisie.</p>
                </section>

                <section class="doc-section">
                    <h2>§9. Postanowienia końcowe</h2>
                    <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</p>
                    <p>Wszelkie spory między Użytkownikiem a Operatorem rozstrzygane będą przez właściwy sąd powszechny.</p>
                </section>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Regulamin — CARIZO' })
</script>

<style lang="scss" scoped>
.static-page { background: $bg; min-height: 100vh; padding-top: $nav-height; }
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

.page-hero p { font-size: 14px; color: $text-dim; }

.page-body { padding: 48px 0 80px; }

.doc-content { max-width: 760px; }

.doc-section {
    margin-bottom: 40px;

    h2 {
        font-size: 20px; font-weight: 800; color: $text;
        margin-bottom: 16px;
        padding-bottom: 10px;
        border-bottom: 1px solid $border;
    }

    p {
        font-size: 14px; color: $text-muted; line-height: 1.8;
        margin-bottom: 12px;
    }

    ul {
        padding-left: 20px; margin-bottom: 12px;
        li {
            font-size: 14px; color: $text-muted; line-height: 1.8; margin-bottom: 4px;
        }
    }

    strong { color: $text; font-weight: 600; }
}
</style>
