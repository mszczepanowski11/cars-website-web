<template>
  <div class="df-page">

    <div class="df-hero">
      <div class="df-hero-inner">
        <div class="df-eyebrow">DLA FIRM</div>
        <h1>Połącz swoją firmę<br><span class="accent">z CARIZO</span></h1>
        <p class="df-hero-desc">Synchronizuj swoje ogłoszenia automatycznie. Bez ręcznego dodawania.</p>
        <div class="df-badge"><v-icon icon="mdi-sync" size="13" />XML • CSV • API</div>
      </div>
    </div>

    <div class="df-body">
      <div class="df-form-card">

        <template v-if="step === 'form'">
          <h2 class="df-form-title">Rozpocznij integrację</h2>
          <p class="df-form-sub">Podaj podstawowe dane — resztę ustalimy mailowo. Jeśli masz link do pliku XML/CSV z ofertą, sprawdzimy go od razu.</p>

          <div class="df-field">
            <label>Nazwa firmy *</label>
            <input v-model="form.companyName" type="text" placeholder="np. AutoHandel Kowalski Sp. z o.o." />
          </div>
          <div class="df-field-row">
            <div class="df-field">
              <label>E-mail *</label>
              <input v-model="form.email" type="email" placeholder="kontakt@twojafirma.pl" />
            </div>
            <div class="df-field">
              <label>Telefon *</label>
              <input v-model="form.phone" type="tel" placeholder="+48 600 000 000" />
            </div>
          </div>
          <div class="df-field">
            <label>Adres strony</label>
            <input v-model="form.websiteUrl" type="text" placeholder="https://twojafirma.pl" />
          </div>
          <div class="df-field">
            <label>Link do XML/CSV <span class="df-optional">(jeżeli posiadasz)</span></label>
            <input v-model="form.feedUrl" type="text" placeholder="https://twojafirma.pl/export/oferty.xml" />
          </div>

          <div v-if="formError" class="df-alert df-alert--error">{{ formError }}</div>

          <button class="df-btn-primary" :disabled="!canSubmit || loading" @click="startIntegration">
            <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
            Rozpocznij integrację
          </button>
        </template>

        <template v-else-if="step === 'preview-error'">
          <div class="df-result-icon df-result-icon--error"><v-icon icon="mdi-alert-circle-outline" size="32" /></div>
          <h2 class="df-form-title">Nie udało się odczytać pliku</h2>
          <p class="df-form-sub">{{ previewError }}</p>
          <div class="df-result-actions">
            <button class="df-btn-secondary" @click="step = 'form'">Popraw link</button>
            <button class="df-btn-primary" :disabled="loading" @click="submitWithoutFeed">
              <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
              Wyślij zgłoszenie bez pliku
            </button>
          </div>
        </template>

        <template v-else-if="step === 'preview-ok'">
          <div class="df-result-icon df-result-icon--ok"><v-icon icon="mdi-check-circle-outline" size="32" /></div>
          <h2 class="df-form-title">Znaleźliśmy {{ previewCount }} {{ pluralOgloszen(previewCount) }}.</h2>
          <p class="df-form-sub">Synchronizacja będzie wykonywana automatycznie. Po zatwierdzeniu zgłoszenia (zwykle w ciągu 1 dnia roboczego) otworzymy Ci konto i zaimportujemy plik.</p>
          <div class="df-result-actions">
            <button class="df-btn-secondary" @click="step = 'form'">Wróć</button>
            <button class="df-btn-primary" :disabled="loading" @click="submit">
              <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
              Importuj
            </button>
          </div>
        </template>

        <template v-else-if="step === 'no-feed'">
          <h2 class="df-form-title">Wyślij zgłoszenie</h2>
          <p class="df-form-sub">Nie podałeś linku do pliku — skontaktujemy się z Tobą, aby ustalić szczegóły integracji.</p>
          <div class="df-result-actions">
            <button class="df-btn-secondary" @click="step = 'form'">Wróć</button>
            <button class="df-btn-primary" :disabled="loading" @click="submit">
              <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
              Wyślij zgłoszenie
            </button>
          </div>
        </template>

        <template v-else-if="step === 'done'">
          <div class="df-result-icon df-result-icon--ok"><v-icon icon="mdi-check-circle-outline" size="32" /></div>
          <h2 class="df-form-title">Dziękujemy!</h2>
          <p class="df-form-sub">Zgłoszenie zostało wysłane i czeka na zatwierdzenie. Odezwiemy się na adres <strong>{{ form.email }}</strong>, zwykle w ciągu 1 dnia roboczego.</p>
          <NuxtLink to="/" class="df-btn-secondary df-btn-secondary--link">Wróć na stronę główną</NuxtLink>
        </template>

      </div>

      <div class="df-info-grid">
        <div class="df-info-card">
          <v-icon icon="mdi-file-code-outline" size="22" />
          <div class="df-info-title">XML lub CSV</div>
          <div class="df-info-desc">Obsługujemy oba formaty — wystarczy jeden link do pliku, który już eksportujesz z Twojego systemu.</div>
        </div>
        <div class="df-info-card">
          <v-icon icon="mdi-shape-outline" size="22" />
          <div class="df-info-title">Wszystkie kategorie</div>
          <div class="df-info-desc">Auta, części, maszyny, przyczepy, opony — feed sam wskazuje kategorię dla każdej pozycji.</div>
        </div>
        <div class="df-info-card">
          <v-icon icon="mdi-sync" size="22" />
          <div class="df-info-title">Sync automatyczny</div>
          <div class="df-info-desc">Po zatwierdzeniu Twój plik jest pobierany cyklicznie — nowe pozycje pojawiają się bez Twojego udziału.</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Dla firm — CARIZO',
  meta: [{ name: 'description', content: 'Połącz swoją firmę z CARIZO i synchronizuj ogłoszenia automatycznie przez XML, CSV lub API.' }],
})

const { error: toastError } = useToast()

const form = reactive({
  companyName: '',
  email: '',
  phone: '',
  websiteUrl: '',
  feedUrl: '',
})

const step = ref<'form' | 'preview-error' | 'preview-ok' | 'no-feed' | 'done'>('form')
const loading = ref(false)
const formError = ref('')
const previewError = ref('')
const previewCount = ref(0)

const canSubmit = computed(() => !!form.companyName.trim() && !!form.email.trim() && !!form.phone.trim())

function pluralOgloszen(n: number) {
  if (n === 1) return 'ogłoszenie'
  const lastDigit = n % 10
  const lastTwo = n % 100
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'ogłoszenia'
  return 'ogłoszeń'
}

function payload() {
  return {
    companyName: form.companyName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    websiteUrl: form.websiteUrl.trim() || null,
    feedUrl: form.feedUrl.trim() || null,
  }
}

async function startIntegration() {
  formError.value = ''
  if (!canSubmit.value) return
  loading.value = true
  try {
    const result = await $fetch<{ valid: boolean; itemCount: number | null; error: string | null; noFeedProvided: boolean }>(
      '/api/proxy/api/partner-signup/preview',
      { method: 'POST', body: payload() }
    )
    if (result.noFeedProvided) {
      step.value = 'no-feed'
    } else if (result.valid) {
      previewCount.value = result.itemCount ?? 0
      step.value = 'preview-ok'
    } else {
      previewError.value = result.error ?? 'Nie udało się odczytać pliku pod podanym adresem.'
      step.value = 'preview-error'
    }
  } catch (e: any) {
    formError.value = e?.data?.message ?? 'Nie udało się wysłać formularza. Spróbuj ponownie.'
  } finally {
    loading.value = false
  }
}

async function submit() {
  loading.value = true
  try {
    await $fetch('/api/proxy/api/partner-signup', { method: 'POST', body: payload() })
    step.value = 'done'
  } catch (e: any) {
    toastError(e?.data?.message ?? 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
  } finally {
    loading.value = false
  }
}

async function submitWithoutFeed() {
  form.feedUrl = ''
  await submit()
}
</script>

<style lang="scss" scoped>
.df-page {
  background: $bg;
  min-height: 100vh;
  padding-top: $nav-height;
}

.df-hero {
  padding: 72px 0 48px;
  text-align: center;
  border-bottom: 1px solid $border;
  background: radial-gradient(ellipse at 50% 0%, rgba($red, 0.14) 0%, transparent 65%);
}
.df-hero-inner { @include container; max-width: 680px; }
.df-eyebrow {
  display: inline-flex; align-items: center; gap: 14px;
  font-size: 10px; font-weight: 700; color: $red; letter-spacing: 4px; text-transform: uppercase;
  margin-bottom: 24px;
  &::before, &::after { content: ''; display: block; width: 36px; height: 1px; background: $red; opacity: 0.6; }
}
h1 {
  font-size: clamp(30px, 5vw, 44px); font-weight: 800; color: $text; line-height: 1.15;
  margin: 0 0 16px; letter-spacing: -0.02em;
  .accent { color: $red; }
}
.df-hero-desc { font-size: 16px; color: $text-muted; line-height: 1.6; margin: 0 auto 20px; }
.df-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: $red;
  background: rgba($red, 0.12); border: 1px solid rgba($red, 0.3); border-radius: $r-sm;
  padding: 5px 12px;
}

.df-body { @include container; max-width: 720px; padding: 56px 0 80px; }

.df-form-card {
  background: rgba(255,255,255,0.015);
  border: 1px solid $border;
  border-radius: $r-xl;
  padding: 36px;
  @media (max-width: $bp-xs) { padding: 24px; }
}

.df-form-title { font-size: 22px; font-weight: 800; color: $text; margin: 0 0 8px; }
.df-form-sub { font-size: 14px; color: $text-muted; line-height: 1.6; margin: 0 0 24px; }

.df-field { margin-bottom: 16px; }
.df-field-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  @media (max-width: $bp-xs) { grid-template-columns: 1fr; }
}
.df-field label { display: block; font-size: 12px; font-weight: 600; color: $text-dim; margin-bottom: 6px; }
.df-optional { font-weight: 400; color: $text-dark; }
.df-field input {
  width: 100%; background: #0a0a0a; border: 1px solid $border; border-radius: $r-sm;
  color: $text; font-size: 14px; padding: 11px 14px; outline: none; font-family: 'Inter', sans-serif;
  transition: border-color 0.2s;
  &:focus { border-color: rgba($red, 0.4); }
  &::placeholder { color: $text-faint; }
}

.df-alert {
  font-size: 13px; padding: 10px 14px; border-radius: $r-sm; margin-bottom: 16px;
  &--error { background: rgba(220,50,50,0.08); color: #e88; border: 1px solid rgba(220,50,50,0.25); }
}

.df-btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; background: $red; color: white; font-size: 14px; font-weight: 700;
  padding: 13px 24px; border: none; border-radius: $r-sm; cursor: pointer;
  font-family: 'Inter', sans-serif; transition: opacity 0.2s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.88; }
}
.df-btn-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid $border; color: $text-muted;
  font-size: 14px; font-weight: 600; padding: 13px 24px; border-radius: $r-sm; cursor: pointer;
  font-family: 'Inter', sans-serif; text-decoration: none; transition: border-color 0.2s, color 0.2s;
  &:hover { border-color: rgba(255,255,255,0.2); color: $text; }
  &--link { margin-top: 8px; }
}

.df-result-icon {
  width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  &--ok { background: rgba(60, 180, 100, 0.12); color: #5c5; }
  &--error { background: rgba(220,50,50,0.1); color: #e55; }
}
.df-result-actions { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
.df-result-actions .df-btn-primary { width: auto; flex: 1; min-width: 160px; }

.df-info-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px;
  @include respond-to(md) { grid-template-columns: 1fr; }
}
.df-info-card {
  padding: 22px; background: rgba(255,255,255,0.015); border: 1px solid $border; border-radius: $r-md;
  color: $red;
}
.df-info-title { font-size: 14px; font-weight: 700; color: $text; margin: 10px 0 6px; }
.df-info-desc { font-size: 13px; color: $text-dim; line-height: 1.55; }

.spin { animation: df-spin 0.8s linear infinite; }
@keyframes df-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
