<template>
  <div class="kontakt-page">

    <div class="kontakt-hero">
      <div class="kontakt-hero-inner">
        <div class="kontakt-eyebrow">KONTAKT</div>
        <h1>Porozmawiajmy<br><span class="accent">o Twoim ogłoszeniu</span></h1>
        <p class="kontakt-hero-desc">Masz pytanie dotyczące konta, płatności lub ogłoszenia? Napisz do nas — odpowiadamy zwykle w ciągu 24 godzin roboczych.</p>
      </div>
    </div>

    <div class="kontakt-body">
      <div class="kontakt-grid">

        <a href="mailto:kontakt@carizo.eu" class="kontakt-card kontakt-card--main">
          <div class="kc-icon"><v-icon icon="mdi-email-outline" size="26" /></div>
          <div class="kc-title">E-mail</div>
          <div class="kc-value">kontakt@carizo.eu</div>
          <div class="kc-hint">Napisz do nas <v-icon icon="mdi-arrow-right" size="14" /></div>
        </a>

        <NuxtLink to="/pomoc" class="kontakt-card">
          <div class="kc-icon"><v-icon icon="mdi-help-circle-outline" size="26" /></div>
          <div class="kc-title">Centrum pomocy</div>
          <div class="kc-value">Najczęstsze pytania</div>
          <div class="kc-hint">Zobacz FAQ <v-icon icon="mdi-arrow-right" size="14" /></div>
        </NuxtLink>

        <div class="kontakt-card kontakt-card--static">
          <div class="kc-icon"><v-icon icon="mdi-map-marker-outline" size="26" /></div>
          <div class="kc-title">Siedziba</div>
          <div class="kc-value">CARIZO Wiktor Niezgoda<br>ul. Henryka Pachońskiego 7/60<br>31-223 Kraków</div>
        </div>

      </div>

      <div v-if="social.facebook || social.instagram" class="kontakt-social">
        <span class="ks-label">Znajdziesz nas też na:</span>
        <a v-if="social.facebook" :href="social.facebook" target="_blank" rel="noopener noreferrer" class="ks-link">
          <v-icon icon="mdi-facebook" size="18" />Facebook
        </a>
        <a v-if="social.instagram" :href="social.instagram" target="_blank" rel="noopener noreferrer" class="ks-link">
          <v-icon icon="mdi-instagram" size="18" />Instagram
        </a>
      </div>

      <div class="kontakt-legal">
        NIP: 9452331007 &nbsp;·&nbsp; REGON: 544870688
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const social = {
  facebook: config.public.socialFacebook as string,
  instagram: config.public.socialInstagram as string,
}

useHead({
  title: 'Kontakt — CARIZO',
  meta: [{ name: 'description', content: 'Skontaktuj się z zespołem CARIZO — e-mail, centrum pomocy i dane firmy.' }],
})
</script>

<style lang="scss" scoped>
.kontakt-page {
  background: $bg;
  min-height: 100vh;
  padding-top: $nav-height;
}

.kontakt-hero {
  padding: 80px 0 64px;
  text-align: center;
  border-bottom: 1px solid $border;
  background: radial-gradient(ellipse at 50% 0%, rgba($red, 0.12) 0%, transparent 65%);
}

.kontakt-hero-inner { @include container; max-width: 680px; }

.kontakt-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 10px;
  font-weight: 700;
  color: $red;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 24px;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 36px;
    height: 1px;
    background: $red;
    opacity: 0.6;
  }
}

h1 {
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 800;
  color: $text;
  line-height: 1.15;
  margin: 0 0 18px;
  letter-spacing: -0.02em;
  .accent { color: $red; }
}

.kontakt-hero-desc {
  font-size: 16px;
  color: $text-muted;
  line-height: 1.7;
  margin: 0 auto;
}

.kontakt-body { @include container; padding: 64px 0 80px; }

.kontakt-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @include respond-to(md) { grid-template-columns: 1fr; }
}

.kontakt-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 28px 24px;
  background: rgba(255,255,255,0.015);
  border: 1px solid $border;
  border-radius: $r-xl;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;

  &--main { border-color: rgba($red, 0.3); }
}

a.kontakt-card:hover { border-color: rgba($red, 0.5); background: rgba(255,255,255,0.03); }

.kc-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba($red, 0.08);
  border: 1px solid rgba($red, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $red;
  margin-bottom: 8px;
}

.kc-title {
  font-size: 12px;
  font-weight: 700;
  color: $text-dim;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kc-value {
  font-size: 16px;
  font-weight: 700;
  color: $text;
  line-height: 1.5;
}

.kc-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: $text-muted;
  margin-top: 4px;
}

.kontakt-social {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid $border;
}

.ks-label { font-size: 13px; color: $text-dim; }

.ks-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $text-muted;
  text-decoration: none;
  transition: color 0.2s;
  &:hover { color: $text; }
}

.kontakt-legal {
  margin-top: 24px;
  font-size: 12px;
  color: $text-dark;
}
</style>
