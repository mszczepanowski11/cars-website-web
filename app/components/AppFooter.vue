<template>
  <footer class="carizo-footer">
    <div class="footer-main">
      <div class="footer-grid">

        <div class="footer-brand">
          <div class="footer-logo">CARI<span>ZO</span></div>
          <p class="footer-desc">Nowoczesna platforma motoryzacyjna dla ludzi, którzy kochają samochody.</p>
          <div class="social-links">
            <a href="#" class="social-link" title="TikTok"><v-icon size="18">mdi-music-note</v-icon></a>
            <a href="#" class="social-link" title="Instagram"><v-icon size="18">mdi-instagram</v-icon></a>
            <a href="#" class="social-link" title="YouTube"><v-icon size="18">mdi-youtube</v-icon></a>
            <a href="#" class="social-link" title="Facebook"><v-icon size="18">mdi-facebook</v-icon></a>
          </div>
        </div>

        <div>
          <div class="col-title">Nawigacja</div>
          <div class="footer-col">
            <NuxtLink to="/">Strona główna</NuxtLink>
            <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
            <NuxtLink to="/categories">Kategorie</NuxtLink>
            <NuxtLink to="/#about">O nas</NuxtLink>
            <a href="#">Jak to działa</a>
            <NuxtLink to="/#contact">Kontakt</NuxtLink>
          </div>
        </div>

        <div>
          <div class="col-title">Konto</div>
          <div class="footer-col">
            <NuxtLink to="/login">Zaloguj się</NuxtLink>
            <NuxtLink to="/register">Rejestracja</NuxtLink>
            <NuxtLink to="/dashboard">Moje ogłoszenia</NuxtLink>
            <NuxtLink to="/favorites">Ulubione</NuxtLink>
          </div>
        </div>

        <div>
          <div class="col-title">Pomoc</div>
          <div class="footer-col">
            <a href="#">Regulamin</a>
            <a href="#">Polityka prywatności</a>
            <a href="#">Centrum pomocy</a>
          </div>
        </div>

        <div>
          <div class="col-title">Kategorie</div>
          <div class="footer-col">
            <a href="#">Auta osobowe</a>
            <a href="#">Dostawcze</a>
            <a href="#">Ciężarowe</a>
            <a href="#">Motocykle</a>
            <a href="#">Maszyny</a>
            <a href="#">Części i akcesoria</a>
          </div>
        </div>

        <div>
          <div class="col-title">Kontakt</div>
          <div class="footer-col contact-col">
            <a href="tel:+48123456789">
              <v-icon size="15" class="contact-icon">mdi-phone-outline</v-icon>
              +48 123 456 789
            </a>
            <a href="mailto:kontakt@carizo.eu">
              <v-icon size="15" class="contact-icon">mdi-email-outline</v-icon>
              kontakt@carizo.eu
            </a>
            <span>
              <v-icon size="15" class="contact-icon">mdi-map-marker-outline</v-icon>
              ul. Motoryzacyjna 1<br>00-001 Warszawa
            </span>
          </div>
        </div>

      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <span>© 2024 CARIZO. Wszelkie prawa zastrzeżone.</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.carizo-footer {
  margin-top: 90px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: $bg;
}

.footer-main {
  padding: 70px 0 50px;
}

.footer-grid {
  @include container;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.4fr;
  gap: 40px;

  @include respond-to(md) { grid-template-columns: repeat(3, 1fr); }
  @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(xs) { grid-template-columns: 1fr; }
}

.footer-brand {
  @include respond-to(md) { grid-column: 1 / -1; }
}

.footer-logo {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 5px;
  color: $text;
  margin-bottom: 14px;
  span { color: $red; }
}

.footer-desc {
  color: $text-dark;
  font-size: 14px;
  line-height: 1.7;
  max-width: 260px;
}

.social-links {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: rgba($red, 0.5);
    color: $text;
  }
}

.col-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: $text-muted;
  margin-bottom: 20px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;

  a {
    color: $text-dark;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: $text; }
  }
}

.contact-col {
  a, span {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    color: $text-dark;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.2s;
    line-height: 1.5;

    &:hover { color: $text; }
  }
}

.contact-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: $red;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 20px 0;
}

.footer-bottom-inner {
  @include container;
  display: flex;
  justify-content: center;

  span {
    font-size: 12px;
    color: $text-faint;
  }
}
</style>
