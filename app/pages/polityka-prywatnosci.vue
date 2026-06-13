<template>
    <div class="static-page">
        <div class="page-hero">
            <div class="container">
                <div class="hero-eyebrow">Dokumenty prawne</div>
                <h1>Polityka <span>prywatności</span></h1>
                <p>Ostatnia aktualizacja: 1 czerwca 2026</p>
            </div>
        </div>

        <div class="container page-body">
            <div class="doc-content">

                <section class="doc-section">
                    <h2>1. Administrator danych osobowych</h2>
                    <p>Administratorem danych osobowych jest CARIZO sp. z o.o. z siedzibą w Polsce. Kontakt w sprawach dotyczących danych osobowych: <strong>privacy@carizo.pl</strong></p>
                </section>

                <section class="doc-section">
                    <h2>2. Jakie dane zbieramy</h2>
                    <p>W ramach świadczenia usług zbieramy następujące kategorie danych:</p>
                    <ul>
                        <li><strong>Dane konta</strong> – imię, nazwisko, adres e-mail, numer telefonu, hasło (hashowane)</li>
                        <li><strong>Dane firmowe</strong> (konta business) – nazwa firmy, NIP</li>
                        <li><strong>Dane ogłoszeń</strong> – treść i zdjęcia ogłoszeń, lokalizacja pojazdu</li>
                        <li><strong>Dane transakcyjne</strong> – historia płatności, faktury</li>
                        <li><strong>Dane techniczne</strong> – adres IP, typ przeglądarki, logi dostępu</li>
                        <li><strong>Pliki cookie</strong> – pliki niezbędne do działania serwisu oraz analityczne</li>
                    </ul>
                </section>

                <section class="doc-section">
                    <h2>3. Podstawa i cel przetwarzania</h2>
                    <ul>
                        <li><strong>Realizacja umowy (art. 6 ust. 1 lit. b RODO)</strong> – świadczenie usług platformy ogłoszeniowej, obsługa płatności, kontakt z użytkownikiem</li>
                        <li><strong>Obowiązek prawny (art. 6 ust. 1 lit. c RODO)</strong> – wystawianie faktur, archiwizacja dokumentacji podatkowej</li>
                        <li><strong>Uzasadniony interes (art. 6 ust. 1 lit. f RODO)</strong> – bezpieczeństwo serwisu, zapobieganie nadużyciom, marketing bezpośredni usług własnych</li>
                        <li><strong>Zgoda (art. 6 ust. 1 lit. a RODO)</strong> – newsletter, pliki cookie analityczne i marketingowe</li>
                    </ul>
                </section>

                <section class="doc-section">
                    <h2>4. Okres przechowywania danych</h2>
                    <p>Dane konta przechowywane są przez czas trwania konta użytkownika oraz do 3 lat po jego usunięciu (dla celów dochodzenia roszczeń).</p>
                    <p>Dane transakcyjne i faktury przechowywane są przez 5 lat zgodnie z przepisami podatkowymi.</p>
                    <p>Dane techniczne (logi) przechowywane są przez maksymalnie 12 miesięcy.</p>
                </section>

                <section class="doc-section">
                    <h2>5. Prawa użytkownika</h2>
                    <p>Przysługują Ci następujące prawa w związku z przetwarzaniem danych osobowych:</p>
                    <ul>
                        <li>Prawo dostępu do danych</li>
                        <li>Prawo do sprostowania danych</li>
                        <li>Prawo do usunięcia danych („prawo do bycia zapomnianym")</li>
                        <li>Prawo do ograniczenia przetwarzania</li>
                        <li>Prawo do przenoszenia danych</li>
                        <li>Prawo do sprzeciwu</li>
                        <li>Prawo do cofnięcia zgody (bez wpływu na zgodność z prawem przetwarzania przed cofnięciem)</li>
                    </ul>
                    <p>Aby skorzystać z przysługujących praw, skontaktuj się z nami pod adresem <strong>privacy@carizo.pl</strong></p>
                </section>

                <section class="doc-section">
                    <h2>6. Pliki cookie</h2>
                    <p>Serwis używa plików cookie niezbędnych do jego działania (sesja, bezpieczeństwo) oraz opcjonalnych plików analitycznych i marketingowych.</p>
                    <p>Możesz zarządzać zgodami na pliki cookie za pomocą baneru wyświetlanego przy pierwszej wizycie lub przez ustawienia przeglądarki.</p>
                </section>

                <section class="doc-section">
                    <h2>7. Przekazywanie danych</h2>
                    <p>Dane mogą być przekazywane podmiotom przetwarzającym w imieniu Administratora (hosting, operatorzy płatności, dostawcy usług e-mail). Dane nie są przekazywane do krajów poza Europejskim Obszarem Gospodarczym bez odpowiednich zabezpieczeń.</p>
                </section>

                <section class="doc-section">
                    <h2>8. Skarga do organu nadzorczego</h2>
                    <p>Masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO) w przypadku uznania, że przetwarzanie Twoich danych narusza przepisy RODO.</p>
                </section>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Polityka prywatności — CARIZO' })
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
        li { font-size: 14px; color: $text-muted; line-height: 1.8; margin-bottom: 4px; }
    }

    strong { color: $text; font-weight: 600; }
}
</style>
