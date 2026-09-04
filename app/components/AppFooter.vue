<script setup lang="ts">
const year = new Date().getFullYear()
const config = useRuntimeConfig()
const localePath = useLocalePath()

const social = {
    tiktok:    (config.public as any).socialTiktok    || null,
    instagram: (config.public as any).socialInstagram || null,
    facebook:  (config.public as any).socialFacebook  || null,
    youtube:   (config.public as any).socialYoutube   || null,
}

function openCookieSettings() {
    window.dispatchEvent(new Event('openCookieSettings'))
}

const newsletterEmail = ref('')
const newsletterLoading = ref(false)
const newsletterOk = ref(false)
const newsletterErr = ref('')

async function subscribeNewsletter() {
    const e = newsletterEmail.value.trim()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(e)) {
        newsletterErr.value = 'Podaj prawidłowy adres email.'
        return
    }
    newsletterLoading.value = true
    newsletterErr.value = ''
    try {
        await $fetch('/api/proxy/api/Newsletter/subscribe', { method: 'POST', body: { email: e } })
        newsletterOk.value = true
        newsletterEmail.value = ''
    } catch (err: any) {
        newsletterErr.value = err?.data?.message ?? 'Błąd zapisu. Spróbuj ponownie.'
    } finally {
        newsletterLoading.value = false
    }
}
</script>

<template>
  <footer class="carizo-footer">
    <div class="footer-main">
      <div class="footer-grid">

        <div class="footer-brand">
          <img src="/carizo-logo.svg" alt="CARIZO" class="footer-logo" loading="lazy" decoding="async" />
          <p class="footer-desc">{{ $t('footer.tagline') }}</p>
          <div class="footer-social">
            <a v-if="social.tiktok" :href="social.tiktok" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na TikTok"><CzIcon icon="mdi-music-note" size="18" /></a>
            <a v-if="social.instagram" :href="social.instagram" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na Instagram"><CzIcon icon="mdi-instagram" size="18" /></a>
            <a v-if="social.facebook" :href="social.facebook" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na Facebook"><CzIcon icon="mdi-facebook" size="18" /></a>
            <a v-if="social.youtube" :href="social.youtube" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na YouTube"><CzIcon icon="mdi-youtube" size="18" /></a>
          </div>
        </div>

        <!--
          Cztery nazwane grupy zamiast trzech, i podzial wedlug TEGO, PO CO KTOS
          tu przyszedl: poznac serwis / kupic / sprzedac / sprawdzic zasady.
          Wczesniej „Bezpieczenstwo" mieszalo regulamin z polityka prywatnosci
          i zgloszeniem naruszenia, a dla kupujacego nie bylo grupy w ogole -
          ogloszenia, kategorie i firmy dalo sie znalezc tylko w gornym menu.

          KAZDY LINK PROWADZI DO ISTNIEJACEJ STRONY. Kilku pozycji z listy zyczen
          (Reklama, Wycena pojazdu, Finansowanie, Ubezpieczenie, Partnerzy) tu nie
          ma, bo nie maja jeszcze stron - martwy link w stopce to 404 dla
          uzytkownika i dla wyszukiwarki.
        -->
        <div class="footer-col">
          <h4>{{ $t('footer.company') }}</h4>
          <NuxtLink :to="localePath('/o-nas')">{{ $t('footer.about') }}</NuxtLink>
          <NuxtLink :to="localePath('/jak-to-dziala')">{{ $t('footer.howItWorks') }}</NuxtLink>
          <NuxtLink :to="localePath('/pomoc')">{{ $t('footer.help') }}</NuxtLink>
          <NuxtLink :to="localePath('/kontakt')">{{ $t('footer.contact') }}</NuxtLink>
        </div>

        <div class="footer-col">
          <h4>{{ $t('footer.forBuyers') }}</h4>
          <NuxtLink :to="localePath('/adverts')">{{ $t('nav.listings') }}</NuxtLink>
          <NuxtLink :to="localePath('/categories')">{{ $t('nav.categories') }}</NuxtLink>
          <NuxtLink :to="localePath('/firmy')">{{ $t('nav.companies') }}</NuxtLink>
          <NuxtLink :to="localePath('/compare')">{{ $t('footer.compare') }}</NuxtLink>
          <NuxtLink :to="localePath('/wydarzenia')">{{ $t('nav.events') }}</NuxtLink>
        </div>

        <div class="footer-col">
          <h4>{{ $t('footer.forSellers') }}</h4>
          <NuxtLink :to="localePath('/add-advert')">{{ $t('footer.addAdvert') }}</NuxtLink>
          <NuxtLink :to="localePath('/cennik')">{{ $t('footer.pricing') }}</NuxtLink>
          <NuxtLink :to="localePath('/promote')">{{ $t('footer.premium') }}</NuxtLink>
          <NuxtLink :to="localePath('/pakiety')">{{ $t('footer.forDealers') }}</NuxtLink>
          <NuxtLink :to="localePath('/dla-firm')">{{ $t('footer.integration') }}</NuxtLink>
        </div>

        <div class="footer-col">
          <h4>{{ $t('footer.legal') }}</h4>
          <NuxtLink :to="localePath('/regulamin')">{{ $t('footer.terms') }}</NuxtLink>
          <NuxtLink :to="localePath('/regulamin-b2b')">{{ $t('footer.b2bTerms') }}</NuxtLink>
          <NuxtLink :to="localePath('/polityka-prywatnosci')">{{ $t('footer.privacy') }}</NuxtLink>
          <button class="footer-cookie-btn" @click="openCookieSettings">{{ $t('footer.cookies') }}</button>
          <a href="mailto:kontakt@carizo.eu?subject=Zg%C5%82oszenie%20naruszenia">{{ $t('footer.report') }}</a>
        </div>

      </div>
    </div>

    <!-- Newsletter strip -->
    <div class="footer-newsletter">
      <div class="fn-inner">
        <div class="fn-text">
          <CzIcon icon="mdi-email-fast-outline" size="20" class="fn-icon" />
          <div>
            <div class="fn-title">{{ $t('footer.newsTitle') }}</div>
            <div class="fn-sub">{{ $t('footer.newsSub') }}</div>
          </div>
        </div>
        <template v-if="!newsletterOk">
          <div class="fn-form">
            <!--
              Etykieta zamiast samego placeholdera: placeholder znika po wpisaniu
              pierwszego znaku, a czytnik ekranu i tak odczytuje go niekonsekwentnie.
              To pole jest w stopce KAŻDEJ strony, więc jedna poprawka obejmuje cały serwis.
            -->
            <input
              id="footer-newsletter-email"
              v-model="newsletterEmail"
              class="fn-input"
              type="email"
              autocomplete="email"
              :aria-label="$t('footer.emailPlaceholder')"
              :placeholder="$t('footer.emailPlaceholder')"
              @keyup.enter="subscribeNewsletter"
            />
            <button class="fn-btn" :disabled="newsletterLoading" @click="subscribeNewsletter">
              <CzIcon v-if="newsletterLoading" icon="mdi-loading" size="15" class="spin" />
              <span v-else>{{ $t('footer.subscribe') }}</span>
            </button>
          </div>
          <p v-if="newsletterErr" class="fn-err">{{ newsletterErr }}</p>
        </template>
        <div v-else class="fn-ok">
          <CzIcon icon="mdi-email-check-outline" size="18" />
          {{ $t('footer.newsOk') }}
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>© {{ year }} CARIZO. {{ $t('footer.rights') }}</span>
        <span class="footer-credit">{{ $t('footer.credit') }}</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.carizo-footer {
  border-top: 1px solid $border;
  background: $bg;
}

.footer-main { padding: 70px 0 50px; }

.footer-grid {
  @include container;
  display: grid;
  // Piata kolumna doszla razem z grupa „Dla kupujacych". `minmax(0, ...)` na
  // kazdej sciezce - kolumna z linkami nie moze rozepchnac stopki poza ekran
  // przez jedno dluzsze haslo.
  grid-template-columns: minmax(0, 1.6fr) repeat(4, minmax(0, 1fr));
  gap: $s-10 $s-8;

  @include respond-to(md) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @include respond-to(sm) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: $s-7 $s-5; }
  @include respond-to(xs) { grid-template-columns: minmax(0, 1fr); }
}

.footer-brand {
  @include respond-to(md) { grid-column: 1 / -1; }
}

.footer-logo {
  height: 30px;
  width: auto;
  display: block;
  margin-bottom: 14px;
}

.footer-desc {
  color: $text-dark;
  line-height: 1.7;
  font-size: 14px;
  max-width: 280px;
  margin-bottom: 20px;
}

.footer-social { display: flex; gap: 8px; align-items: center; }


.social-link {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: $card;
  border: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-dim;
  transition: border-color 0.2s, color 0.2s;

  &:hover { border-color: $text-muted; color: $text; }
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;

  h4 {
    color: $text;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  // Link i przycisk MUSZA byc opisane razem. „Polityka cookies" jest przyciskiem,
  // bo otwiera ustawienia zgod zamiast prowadzic na strone - i przez to lapala
  // globalna regule celu dotykowego (min-height 44px na telefonie), podczas gdy
  // sasiednie linki mialy 16px. Zmierzone: 44 vs 16, czyli 28px roznicy, ktore
  // widac jako dziure w liscie nad i pod ta jedna pozycja.
  a,
  .footer-cookie-btn {
    color: $text-muted;
    font-size: 14px;
    line-height: 1.4;
    transition: color 0.2s;
    &:hover { color: $text; }
  }
}

// Na telefonie wyrownanie idzie W GORE, nie w dol: 16px to cel dotykowy grubo
// ponizej minimum (WCAG 2.5.8 mowi o 24px, Apple i Google o 44px). Zamiast
// scinac przycisk do wysokosci linkow, wszystkie pozycje dostaja ten sam wiersz.
@media (max-width: $bp-mobile) {
  .footer-col {
    gap: 0;

    a,
    .footer-cookie-btn {
      display: flex;
      align-items: center;
      min-height: $touch-min;
    }
  }
}

.footer-newsletter {
  border-top: 1px solid $border;
  padding: 22px 0;
  background: rgba(255,255,255,0.015);
}

.fn-inner {
  @include container;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: space-between;

  // Na wąskim ekranie zachęta i formularz idą JEDNO POD DRUGIM. Wcześniej dzieliły
  // jeden wiersz: tekst zabierał 235 z 331 px, na formularz zostawały 72 px, w które
  // przycisk „Zapisz się" (98 px, nie da się go zwęzić) po prostu się nie mieścił -
  // i wypychał całą stronę poza ekran. Pole na wejście adresu miało wtedy 30 px.
  @include respond-to(sm) {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    // KONIECZNE razem ze zmianą kierunku na pionowy. `flex-wrap: wrap` w kolumnie
    // zawija na KOLUMNY, a nie na wiersze - szerokość każdej kolumny wyznacza wtedy
    // najszersze dziecko (tu: cały tekst zachęty w jednej linii, 317 px), a `stretch`
    // rozciąga elementy do tej kolumny, nie do kontenera. Efekt: oba wiersze były
    // szersze od stopki i wypychały stronę.
    flex-wrap: nowrap;
  }
}

.fn-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fn-icon { color: $red-text; flex-shrink: 0; }

.fn-title {
  font-size: 15px;
  font-weight: 700;
  color: $text;
  line-height: 1.3;
}

.fn-sub {
  font-size: 12px;
  color: $text-dark;
  margin-top: 2px;
}

.fn-form {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 400px;

  // CELOWO BEZ `min-width: 0`. Automatyczny rozmiar minimalny elementu flex jest tu
  // zabezpieczeniem: nie pozwala zwęzić wiersza poniżej szerokości przycisku, który
  // i tak nie potrafi się zwęzić. Dodanie tu zera „żeby się mieściło" daje efekt
  // odwrotny - wiersz kurczy się, a przycisk wychodzi poza niego i poza ekran.
  @include respond-to(sm) { max-width: none; }
}

.fn-input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid $border;
  border-radius: 8px;
  color: $text;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  padding: 9px 14px;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: $text-dark; }
  &:focus { border-color: rgba(255,255,255,0.2); }
}

.fn-btn {
  background: $red;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  padding: 9px 18px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.fn-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $success;
  font-size: 13px;
  font-weight: 600;
}

.fn-err {
  font-size: 12px;
  color: $danger;
  margin: 0;
  width: 100%;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

.footer-bottom {
  border-top: 1px solid $border;
  padding: 20px 0;
}

.footer-bottom-inner {
  @include container;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: $text-dark;
  font-size: 13px;

  @include respond-to(sm) { flex-direction: column; gap: 8px; text-align: center; }
}

.footer-cookie-btn {
  background: transparent;
  border: none;
  padding: 0;
  color: $text-muted;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  text-align: left;
  transition: color 0.2s;
  &:hover { color: $text; }
}

.footer-soon {
  color: $text-dark;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.soon-tag {
  font-size: 10px;
  font-weight: 700;
  background: rgba(255,255,255,0.06);
  border: 1px solid $border;
  border-radius: 4px;
  padding: 1px 6px;
  color: $text-dim;
  letter-spacing: 0.3px;
}
</style>
