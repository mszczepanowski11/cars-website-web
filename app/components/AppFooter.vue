<template>
  <footer class="carizo-footer">
    <div class="footer-main">
      <div class="footer-grid">

        <div class="footer-brand">
          <div class="footer-logo">CARI<span>ZO</span></div>
          <p class="footer-desc">Nowoczesna platforma motoryzacyjna dla ludzi, którzy kochają samochody.</p>
          <div class="footer-social">
            <a href="#" class="social-link" title="TikTok"><v-icon icon="mdi-music-note" size="18" /></a>
            <a href="#" class="social-link" title="Instagram"><v-icon icon="mdi-instagram" size="18" /></a>
            <a href="#" class="social-link" title="Facebook"><v-icon icon="mdi-facebook" size="18" /></a>
            <a href="#" class="social-link" title="YouTube"><v-icon icon="mdi-youtube" size="18" /></a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Nawigacja</h4>
          <NuxtLink to="/">Strona główna</NuxtLink>
          <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
          <NuxtLink to="/categories">Kategorie</NuxtLink>
          <NuxtLink to="/#about">O nas</NuxtLink>
          <NuxtLink to="/#contact">Kontakt</NuxtLink>
        </div>

        <div class="footer-col">
          <h4>Informacje</h4>
          <a href="#">Jak to działa</a>
          <a href="#">Regulamin</a>
          <a href="#">Polityka prywatności</a>
          <a href="#">Pomoc</a>
          <a href="#">FAQ</a>
        </div>

        <div class="footer-col">
          <h4>Dla użytkowników</h4>
          <NuxtLink to="/dashboard">Moje konto</NuxtLink>
          <NuxtLink to="/favorites">Ulubione</NuxtLink>
          <NuxtLink to="/my-adverts">Moje ogłoszenia</NuxtLink>
          <a href="#">Powiadomienia</a>
        </div>

        <div class="footer-col">
          <h4>Aplikacja</h4>
          <a href="#">Pobierz na iOS</a>
          <a href="#">Pobierz na Android</a>
        </div>

      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>© 2024 CARIZO. Wszelkie prawa zastrzeżone.</span>
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 40px;

  @include respond-to(md) { grid-template-columns: 1fr 1fr 1fr; }
  @include respond-to(sm) { grid-template-columns: 1fr 1fr; }
  @include respond-to(xs) { grid-template-columns: 1fr; }
}

.footer-brand {
  @include respond-to(md) { grid-column: 1 / -1; }
}

.footer-logo {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 5px;
  color: $text;
  margin-bottom: 14px;

  span { color: $red; }
}

.footer-desc {
  color: $text-dark;
  line-height: 1.7;
  font-size: 14px;
  max-width: 280px;
  margin-bottom: 20px;
}

.footer-social { display: flex; gap: 8px; }

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
</style>
