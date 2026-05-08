<template>
  <footer class="carizo-footer">
    <div class="footer-grid">
      <div>
        <div class="footer-logo">CARI<span>ZO</span></div>
        <p class="footer-desc">Nowoczesna platforma motoryzacyjna dla ludzi którzy kochają samochody.</p>
      </div>
      <div class="footer-col">
        <NuxtLink to="/">Strona główna</NuxtLink>
        <NuxtLink to="/adverts">Ogłoszenia</NuxtLink>
        <NuxtLink to="/add-advert">Dodaj ogłoszenie</NuxtLink>
      </div>
      <div class="footer-col">
        <a href="#">Polityka prywatności</a>
        <a href="#">Regulamin</a>
        <a href="#">Pomoc</a>
      </div>
      <div class="footer-col">
        <a href="#">TikTok</a>
        <a href="#">Instagram</a>
        <a href="#">Facebook</a>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.carizo-footer {
  padding: 70px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: $bg;
}

.footer-grid {
  @include container;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;

  @include respond-to(sm) { grid-template-columns: 1fr; }
}

.footer-logo {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 5px;
  color: $text;
  margin-bottom: 16px;

  span { color: $red; }
}

.footer-desc {
  color: $text-dark;
  line-height: 1.7;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 14px;

  a {
    color: $text-muted;
    transition: color 0.2s;
    &:hover { color: $text; }
  }
}
</style>
