<template>
  <div class="onas-page">

    <!-- Hero -->
    <div class="onas-hero">
      <div class="onas-hero-inner">
        <div class="onas-eyebrow">{{ $t('about.eyebrow') }}</div>
        <h1>{{ $t('about.heroTitleLine1') }}<br><span class="accent">{{ $t('about.heroTitleLine2') }}</span></h1>
        <p class="onas-hero-desc">{{ $t('about.heroDesc') }}</p>
      </div>
    </div>

    <!-- Story + Stats -->
    <div class="onas-body">
      <div class="onas-story-wrap">
        <div class="onas-story">
          <p>{{ $t('about.story1') }}</p>
          <p>{{ $t('about.story2') }}</p>
          <p>{{ $t('about.story3') }}</p>
          <NuxtLink to="/kontakt" class="onas-cta">
            <v-icon icon="mdi-email-outline" size="16" />
            {{ $t('about.ctaWrite') }}
          </NuxtLink>
        </div>

        <div class="onas-stats">
          <div class="onas-stat">
            <div class="onas-stat-val">10k+</div>
            <div class="onas-stat-label">{{ $t('about.statAdverts') }}</div>
          </div>
          <div class="onas-stat">
            <div class="onas-stat-val">500+</div>
            <div class="onas-stat-label">{{ $t('about.statDealers') }}</div>
          </div>
          <div class="onas-stat">
            <div class="onas-stat-val">98%</div>
            <div class="onas-stat-label">{{ $t('about.statSatisfied') }}</div>
          </div>
          <div class="onas-stat">
            <div class="onas-stat-val">24/7</div>
            <div class="onas-stat-label">{{ $t('about.statSupport') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Values -->
    <div class="onas-values-section">
      <div class="onas-values-inner">
        <div class="onas-values-header">
          <div class="onas-eyebrow">{{ $t('about.valuesEyebrow') }}</div>
          <h2>{{ $t('about.valuesTitle') }}</h2>
        </div>
        <div class="onas-values">
          <div class="onas-value">
            <div class="onas-value-icon"><v-icon icon="mdi-shield-check-outline" size="26" /></div>
            <div class="onas-value-title">{{ $t('about.valueSecurityTitle') }}</div>
            <div class="onas-value-desc">{{ $t('about.valueSecurityDesc') }}</div>
          </div>
          <div class="onas-value">
            <div class="onas-value-icon"><v-icon icon="mdi-lightbulb-outline" size="26" /></div>
            <div class="onas-value-title">{{ $t('about.valueTechnologyTitle') }}</div>
            <div class="onas-value-desc">{{ $t('about.valueTechnologyDesc') }}</div>
          </div>
          <div class="onas-value">
            <div class="onas-value-icon"><v-icon icon="mdi-handshake-outline" size="26" /></div>
            <div class="onas-value-title">{{ $t('about.valueTransparencyTitle') }}</div>
            <div class="onas-value-desc">{{ $t('about.valueTransparencyDesc') }}</div>
          </div>
          <div class="onas-value">
            <div class="onas-value-icon"><v-icon icon="mdi-car-heart" size="26" /></div>
            <div class="onas-value-title">{{ $t('about.valuePassionTitle') }}</div>
            <div class="onas-value-desc">{{ $t('about.valuePassionDesc') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA bottom -->
    <div class="onas-bottom">
      <div class="onas-bottom-inner">
        <h2>{{ $t('about.bottomTitle') }} <span>{{ $t('about.bottomTitleAccent') }}</span></h2>
        <p>{{ $t('about.bottomDesc') }}</p>
        <div class="onas-bottom-btns">
          <NuxtLink to="/kontakt" class="onas-btn-primary">
            <v-icon icon="mdi-email-outline" size="16" />
            {{ $t('about.bottomContact') }}
          </NuxtLink>
          <NuxtLink to="/adverts" class="onas-btn-secondary">
            {{ $t('about.bottomBrowse') }}
            <v-icon icon="mdi-arrow-right" size="16" />
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: t('about.metaTitle'),
  meta: [{ name: 'description', content: t('about.metaDescription') }],
})
</script>

<style lang="scss" scoped>
.onas-page {
  background: $bg;
  min-height: 100vh;
  padding-top: $nav-height;
}

// ── Hero ──────────────────────────────────────────────────────────────

.onas-hero {
  padding: 80px 0 72px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid $border;
  background: radial-gradient(ellipse at 50% 0%, rgba($red, 0.12) 0%, transparent 65%);
}

.onas-hero-inner { @include container; max-width: 760px; }

.onas-eyebrow {
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
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  color: $text;
  line-height: 1.15;
  margin: 0 0 20px;
  letter-spacing: -0.02em;
  .accent { color: $red; }
}

.onas-hero-desc {
  font-size: 17px;
  color: $text-muted;
  line-height: 1.7;
  margin: 0 auto;
  max-width: 580px;
}

// ── Story + Stats ──────────────────────────────────────────────────────

.onas-body {
  padding: 80px 0;
  border-bottom: 1px solid $border;
}

.onas-story-wrap {
  @include container;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 64px;
  align-items: start;

  @include respond-to(md) { grid-template-columns: 1fr; gap: 48px; }
}

.onas-story {
  p {
    font-size: 15px;
    color: $text-muted;
    line-height: 1.85;
    margin: 0 0 20px;
    &:last-of-type { margin-bottom: 32px; }
  }
}

.onas-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid $border;
  border-radius: $r-sm;
  color: $text-muted;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
  &:hover { border-color: rgba($red, 0.5); color: $text; }
}

.onas-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @include respond-to(md) { grid-template-columns: repeat(4, 1fr); }
  @include respond-to(xs) { grid-template-columns: repeat(2, 1fr); }
}

.onas-stat {
  background: rgba(255,255,255,0.02);
  border: 1px solid $border;
  border-radius: $r-lg;
  padding: 24px 16px;
  text-align: center;
}

.onas-stat-val {
  font-size: 30px;
  font-weight: 800;
  color: $red;
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.onas-stat-label {
  font-size: 12px;
  color: $text-dim;
  line-height: 1.4;
}

// ── Values ────────────────────────────────────────────────────────────

.onas-values-section {
  padding: 80px 0;
  border-bottom: 1px solid $border;
  background: $card-alt;
}

.onas-values-inner { @include container; }

.onas-values-header {
  margin-bottom: 48px;

  h2 {
    font-size: 32px;
    font-weight: 800;
    color: $text;
    margin: 12px 0 0;
  }
}

.onas-values {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @include respond-to(md) { grid-template-columns: repeat(2, 1fr); }
  @include respond-to(xs) { grid-template-columns: 1fr; }
}

.onas-value {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px 24px;
  background: rgba(255,255,255,0.015);
  border: 1px solid $border;
  border-radius: $r-xl;
  transition: border-color 0.2s, background 0.2s;

  &:hover { border-color: rgba($red, 0.25); background: rgba(255,255,255,0.03); }
}

.onas-value-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba($red, 0.08);
  border: 1px solid rgba($red, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $red;
  flex-shrink: 0;
}

.onas-value-title {
  font-size: 16px;
  font-weight: 700;
  color: $text;
}

.onas-value-desc {
  font-size: 13px;
  color: $text-dim;
  line-height: 1.7;
}

// ── Bottom CTA ────────────────────────────────────────────────────────

.onas-bottom {
  padding: 80px 0;
  text-align: center;
}

.onas-bottom-inner {
  @include container;
  max-width: 600px;

  h2 {
    font-size: 32px;
    font-weight: 800;
    color: $text;
    margin: 0 0 16px;
    span { color: $red; }
  }

  p {
    font-size: 15px;
    color: $text-muted;
    line-height: 1.7;
    margin: 0 0 32px;
  }
}

.onas-bottom-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.onas-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: $red;
  border: none;
  border-radius: $r-sm;
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover { opacity: 0.88; }
}

.onas-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid $border;
  border-radius: $r-sm;
  color: $text-muted;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
  &:hover { border-color: rgba(255,255,255,0.2); color: $text; }
}
</style>
