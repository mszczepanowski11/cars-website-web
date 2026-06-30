<script setup lang="ts">
const year = new Date().getFullYear()
const config = useRuntimeConfig()

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
          <img src="/carizo-logo.svg" alt="CARIZO" class="footer-logo" loading="lazy" />
          <p class="footer-desc">Nowoczesna platforma motoryzacyjna dla ludzi, którzy kochają samochody.</p>
          <div class="footer-social">
            <a v-if="social.tiktok" :href="social.tiktok" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na TikTok"><v-icon icon="mdi-music-note" size="18" /></a>
            <a v-if="social.instagram" :href="social.instagram" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na Instagram"><v-icon icon="mdi-instagram" size="18" /></a>
            <a v-if="social.facebook" :href="social.facebook" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na Facebook"><v-icon icon="mdi-facebook" size="18" /></a>
            <a v-if="social.youtube" :href="social.youtube" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="CARIZO na YouTube"><v-icon icon="mdi-youtube" size="18" /></a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Firma</h4>
          <NuxtLink to="/o-nas">O nas</NuxtLink>
          <NuxtLink to="/#contact">Kontakt</NuxtLink>
          <NuxtLink to="/jak-to-dziala">Jak to działa</NuxtLink>
          <NuxtLink to="/pomoc">Pomoc i FAQ</NuxtLink>
        </div>

        <div class="footer-col">
          <h4>Dla sprzedających</h4>
          <NuxtLink to="/add-advert">Dodaj ogłoszenie</NuxtLink>
          <NuxtLink to="/cennik">Cennik</NuxtLink>
          <NuxtLink to="/promote">Pakiety Premium</NuxtLink>
          <NuxtLink to="/pakiety">Dla dealerów</NuxtLink>
          <NuxtLink to="/regulamin-b2b">Regulamin B2B</NuxtLink>
        </div>

        <div class="footer-col">
          <h4>Bezpieczeństwo</h4>
          <NuxtLink to="/regulamin">Regulamin</NuxtLink>
          <NuxtLink to="/polityka-prywatnosci">Polityka prywatności</NuxtLink>
          <button class="footer-cookie-btn" @click="openCookieSettings">Polityka cookies</button>
          <NuxtLink to="/#contact">Zgłoś naruszenie</NuxtLink>
        </div>

      </div>
    </div>

    <!-- Newsletter strip -->
    <div class="footer-newsletter">
      <div class="fn-inner">
        <div class="fn-text">
          <v-icon icon="mdi-email-fast-outline" size="20" class="fn-icon" />
          <div>
            <div class="fn-title">Bądź na bieżąco</div>
            <div class="fn-sub">Najlepsze oferty prosto na Twój e-mail</div>
          </div>
        </div>
        <template v-if="!newsletterOk">
          <div class="fn-form">
            <input
              v-model="newsletterEmail"
              class="fn-input"
              type="email"
              placeholder="Twój adres e-mail"
              @keyup.enter="subscribeNewsletter"
            />
            <button class="fn-btn" :disabled="newsletterLoading" @click="subscribeNewsletter">
              <v-icon v-if="newsletterLoading" icon="mdi-loading" size="15" class="spin" />
              <span v-else>Zapisz się</span>
            </button>
          </div>
          <p v-if="newsletterErr" class="fn-err">{{ newsletterErr }}</p>
        </template>
        <div v-else class="fn-ok">
          <v-icon icon="mdi-email-check-outline" size="18" />
          Sprawdź skrzynkę email i potwierdź zapis — link ważny 24h.
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>© {{ year }} CARIZO. Wszelkie prawa zastrzeżone.</span>
        <span class="footer-credit">Stworzone z pasją do motoryzacji. <span class="heart">❤</span></span>
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
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;

  @include respond-to(md) { grid-template-columns: 1fr 1fr 1fr; }
  @include respond-to(sm) { grid-template-columns: 1fr 1fr; }
  @include respond-to(xs) { grid-template-columns: 1fr; }
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

  a {
    color: $text-muted;
    font-size: 14px;
    transition: color 0.2s;
    &:hover { color: $text; }
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
}

.fn-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fn-icon { color: $red; flex-shrink: 0; }

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
  color: #4caf50;
  font-size: 13px;
  font-weight: 600;
}

.fn-err {
  font-size: 12px;
  color: #e55;
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

.heart { color: $red; }

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
