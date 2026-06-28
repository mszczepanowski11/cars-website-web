<template>
    <div class="auth-bg">

        <!-- Success screen after registration -->
        <Transition name="success-fade">
            <div v-if="registrationSuccess" class="reg-success">
                <img src="/carizo-logo.svg" alt="CARIZO" class="reg-success-logo" />
                <div class="reg-success-icon email-icon">
                    <v-icon icon="mdi-email-check-outline" size="44" />
                </div>
                <h2 class="reg-success-title">Sprawdź swoją skrzynkę!</h2>
                <p class="reg-success-desc">
                    Wysłaliśmy link weryfikacyjny na adres <strong>{{ registeredEmail }}</strong>.<br>
                    Kliknij w link w e-mailu, aby aktywować konto.
                </p>
                <div class="reg-success-tip">
                    <v-icon icon="mdi-information-outline" size="15" />
                    Nie widzisz e-maila? Sprawdź folder spam lub
                    <button type="button" class="resend-link" :disabled="resending" @click="resendVerification">
                        <span v-if="resending">wysyłanie...</span>
                        <span v-else>wyślij ponownie</span>
                    </button>.
                </div>
                <div class="reg-success-actions">
                    <NuxtLink to="/login" class="rsact-btn rsact-btn--primary">
                        <v-icon icon="mdi-login" size="17" />
                        Przejdź do logowania
                    </NuxtLink>
                </div>
            </div>
        </Transition>

        <div v-if="!registrationSuccess" class="auth-card">
            <NuxtLink to="/" class="auth-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>
            <h2>Zarejestruj się</h2>
            <p class="auth-sub">Dołącz do społeczności CARIZO</p>

            <!-- Account type toggle -->
            <div class="type-toggle">
                <button
                    type="button"
                    class="type-btn"
                    :class="{ 'type-active': accountType === 'Personal' }"
                    @click="accountType = 'Personal'; businessSubType = null"
                >
                    <v-icon icon="mdi-account-outline" size="18" />
                    Sprzedawca prywatny
                </button>
                <button
                    type="button"
                    class="type-btn"
                    :class="{ 'type-active': accountType === 'Business' }"
                    @click="accountType = 'Business'"
                >
                    <v-icon icon="mdi-domain" size="18" />
                    Dealer / Firma
                </button>
            </div>

            <!-- Business sub-type selector -->
            <Transition name="btype-fade">
                <div v-if="accountType === 'Business'" class="btype-section">
                    <p class="btype-title">Wybierz typ konta biznesowego</p>
                    <div class="btype-cards">
                        <button
                            v-for="bt in businessTypes"
                            :key="bt.key"
                            type="button"
                            class="btype-card"
                            :class="{ 'btype-card--active': businessSubType === bt.key }"
                            @click="businessSubType = bt.key"
                        >
                            <div class="btype-icon">
                                <v-icon :icon="bt.icon" size="22" />
                            </div>
                            <div class="btype-text">
                                <strong class="btype-name">{{ bt.name }}</strong>
                                <span class="btype-desc">{{ bt.desc }}</span>
                            </div>
                            <v-icon
                                v-if="businessSubType === bt.key"
                                icon="mdi-check-circle"
                                size="18"
                                class="btype-check"
                            />
                        </button>
                    </div>
                </div>
            </Transition>

            <form class="auth-form" @submit.prevent="submit">
                <!-- Business fields -->
                <template v-if="accountType === 'Business'">
                    <div class="auth-field">
                        <label for="reg-company" class="auth-label">Nazwa firmy <span class="req">*</span></label>
                        <div class="auth-input-wrap">
                            <v-icon icon="mdi-domain" size="17" class="auth-field-icon" />
                            <input id="reg-company" v-model="companyName" class="auth-input" placeholder="np. Auto Salon Kowalski" required />
                        </div>
                    </div>
                    <div class="auth-field">
                        <label for="reg-nip" class="auth-label">NIP <span class="req">*</span></label>
                        <div class="auth-input-wrap">
                            <v-icon icon="mdi-card-account-details-outline" size="17" class="auth-field-icon" />
                            <input id="reg-nip" v-model="nip" class="auth-input" inputmode="numeric" pattern="[0-9\-]*" placeholder="123-456-78-90" maxlength="13" required />
                        </div>
                        <div v-if="nip && nip.replace(/\D/g,'').length !== 10" class="auth-hint">
                            Wymagane 10 cyfr
                        </div>
                    </div>
                </template>

                <!-- Name row -->
                <div class="auth-row">
                    <div class="auth-field">
                        <label for="reg-name" class="auth-label">{{ accountType === 'Business' ? 'Imię (kontakt)' : 'Imię' }} <span class="req">*</span></label>
                        <div class="auth-input-wrap">
                            <input id="reg-name" v-model="name" class="auth-input auth-input--solo" :placeholder="accountType === 'Business' ? 'Jan' : 'Jan'" required autocomplete="given-name" />
                        </div>
                    </div>
                    <div class="auth-field">
                        <label for="reg-surname" class="auth-label">{{ accountType === 'Business' ? 'Nazwisko (kontakt)' : 'Nazwisko' }} <span class="req">*</span></label>
                        <div class="auth-input-wrap">
                            <input id="reg-surname" v-model="surname" class="auth-input auth-input--solo" placeholder="Kowalski" required autocomplete="family-name" />
                        </div>
                    </div>
                </div>

                <div class="auth-field">
                    <label for="reg-email" class="auth-label">Adres email <span class="req">*</span></label>
                    <div class="auth-input-wrap">
                        <v-icon icon="mdi-email-outline" size="17" class="auth-field-icon" />
                        <input id="reg-email" v-model="email" type="email" class="auth-input" placeholder="np. jan@kowalski.pl" required autocomplete="email" />
                    </div>
                </div>

                <div class="auth-field">
                    <label for="reg-phone" class="auth-label">Numer telefonu <span class="req">*</span></label>
                    <div class="auth-input-wrap">
                        <v-icon icon="mdi-phone-outline" size="17" class="auth-field-icon" />
                        <input id="reg-phone" v-model="phoneNumber" type="tel" inputmode="tel" pattern="[+0-9\s\-()]*" maxlength="20" class="auth-input" placeholder="+48 600 123 456" required autocomplete="tel" />
                    </div>
                </div>

                <div class="auth-field">
                    <label for="reg-password" class="auth-label">Hasło <span class="req">*</span></label>
                    <div class="auth-input-wrap">
                        <v-icon icon="mdi-lock-outline" size="17" class="auth-field-icon" />
                        <input
                            id="reg-password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="auth-input"
                            placeholder="Min. 8 znaków"
                            required
                            autocomplete="new-password"
                        />
                        <button type="button" class="auth-eye" :aria-label="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'" @click="showPassword = !showPassword">
                            <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="17" />
                        </button>
                    </div>
                    <!-- Password strength -->
                    <div v-if="password" class="strength-wrap">
                        <div class="strength-track">
                            <div class="strength-fill" :class="`strength-${strengthLevel}`" :style="{ width: strengthWidth }" />
                        </div>
                        <span class="strength-label" :class="`strength-label-${strengthLevel}`">{{ strengthLabel }}</span>
                    </div>
                </div>

                <div class="auth-field">
                    <label for="reg-password-confirm" class="auth-label">Powtórz hasło <span class="req">*</span></label>
                    <div class="auth-input-wrap" :class="{ 'auth-input-wrap--error': passwordConfirm && password !== passwordConfirm }">
                        <v-icon icon="mdi-lock-check-outline" size="17" class="auth-field-icon" />
                        <input
                            id="reg-password-confirm"
                            v-model="passwordConfirm"
                            type="password"
                            class="auth-input"
                            placeholder="••••••••"
                            required
                            autocomplete="new-password"
                        />
                    </div>
                    <div v-if="passwordConfirm && password !== passwordConfirm" class="auth-hint auth-hint--error">
                        Hasła nie są identyczne.
                    </div>
                </div>

                <div class="auth-field">
                    <label for="reg-dob" class="auth-label">Data urodzenia <span class="req">*</span></label>
                    <div class="auth-input-wrap">
                        <v-icon icon="mdi-calendar-outline" size="17" class="auth-field-icon" />
                        <input id="reg-dob" v-model="dateOfBirth" type="date" class="auth-input" :max="maxDob" required />
                    </div>
                    <div v-if="dateOfBirth && !isAdult" class="auth-hint auth-hint--error">
                        Musisz mieć ukończone 18 lat.
                    </div>
                </div>

                <label class="age-check">
                    <input v-model="termsConfirmed" type="checkbox" class="age-check-input" />
                    <span class="age-check-box" :class="{ 'age-check-box--checked': termsConfirmed }">
                        <v-icon v-if="termsConfirmed" icon="mdi-check" size="13" />
                    </span>
                    <span class="age-check-label">Akceptuję <NuxtLink to="/regulamin" class="cookie-link">Regulamin</NuxtLink> oraz <NuxtLink to="/polityka-prywatnosci" class="cookie-link">Politykę prywatności</NuxtLink> <span class="req">*</span></span>
                </label>

                <label class="age-check">
                    <input v-model="gdprConfirmed" type="checkbox" class="age-check-input" />
                    <span class="age-check-box" :class="{ 'age-check-box--checked': gdprConfirmed }">
                        <v-icon v-if="gdprConfirmed" icon="mdi-check" size="13" />
                    </span>
                    <span class="age-check-label">Wyrażam zgodę na przetwarzanie moich danych osobowych przez CARIZO Wiktor Niezgoda w celu realizacji usług świadczonych drogą elektroniczną, zgodnie z <NuxtLink to="/polityka-prywatnosci" class="cookie-link">Polityką prywatności</NuxtLink> <span class="req">*</span></span>
                </label>

                <label class="age-check">
                    <input v-model="marketingConsent" type="checkbox" class="age-check-input" />
                    <span class="age-check-box" :class="{ 'age-check-box--checked': marketingConsent }">
                        <v-icon v-if="marketingConsent" icon="mdi-check" size="13" />
                    </span>
                    <span class="age-check-label age-check-label--optional">Wyrażam zgodę na otrzymywanie informacji handlowych i ofert specjalnych CARIZO drogą elektroniczną. Zgodę możesz wycofać w każdej chwili. <span class="opt-label">(opcjonalne)</span></span>
                </label>

                <div v-if="validationError || error" role="alert" class="auth-error">
                    <v-icon icon="mdi-alert-circle-outline" size="15" />
                    {{ validationError || error }}
                </div>

                <TurnstileWidget
                    v-if="turnstileSiteKey"
                    ref="turnstileRef"
                    v-model="turnstileToken"
                    :site-key="turnstileSiteKey"
                />

                <button type="submit" class="auth-btn" :disabled="loading">
                    <v-icon v-if="loading" icon="mdi-loading" size="18" class="spin" />
                    <span>{{ loading ? 'Rejestrowanie...' : 'Zarejestruj się' }}</span>
                </button>
            </form>

            <div class="auth-divider"><span>lub</span></div>

            <button v-if="facebookAppId" class="fb-btn" :disabled="fbLoading" @click="handleFacebookLogin">
                <svg class="fb-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{{ fbLoading ? 'Logowanie...' : 'Kontynuuj z Facebook' }}</span>
            </button>
            <p v-if="facebookAppId" class="fb-disclosure">Logując się przez Facebook, akceptujesz nasz <NuxtLink to="/regulamin" class="cookie-link">Regulamin</NuxtLink> i <NuxtLink to="/polityka-prywatnosci" class="cookie-link">Politykę prywatności</NuxtLink>. Pobieramy Twój adres email oraz imię i nazwisko z konta Facebook.</p>

            <p class="auth-link">Masz już konto? <NuxtLink to="/login">Zaloguj się</NuxtLink></p>
        </div>

    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Zarejestruj się — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const route = useRoute()
const { register, loginWithFacebook, loading, error } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const runtimeConfig = useRuntimeConfig()

const accountType      = ref<'Personal' | 'Business'>('Personal')
const businessSubType  = ref<'Dealer' | 'Komis' | 'Firma' | null>(null)
const name             = ref('')
const surname          = ref('')
const email            = ref('')
const phoneNumber      = ref('')
const password         = ref('')
const passwordConfirm  = ref('')
const companyName      = ref('')
const nip              = ref('')
const validationError  = ref('')
const showPassword     = ref(false)
const dateOfBirth      = ref('')
const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]
const isAdult = computed(() => {
    if (!dateOfBirth.value) return false
    return new Date(dateOfBirth.value) <= new Date(maxDob)
})
const termsConfirmed   = ref(false)
const gdprConfirmed    = ref(false)
const marketingConsent = ref(false)
const registrationSuccess = ref(false)
const registeredEmail = ref('')
const resending = ref(false)
const turnstileToken  = ref('')
const turnstileRef    = ref<{ reset: () => void } | null>(null)
const fbLoading        = ref(false)
const turnstileSiteKey = runtimeConfig.public.turnstileSiteKey as string
const facebookAppId    = runtimeConfig.public.facebookAppId as string

const businessTypes = [
    { key: 'Dealer' as const, name: 'Dealer',  icon: 'mdi-car-key',                  desc: 'Indywidualny dealer pojazdów' },
    { key: 'Komis'  as const, name: 'Komis',   icon: 'mdi-store-outline',             desc: 'Komis samochodowy – sprzedaż komisowa' },
    { key: 'Firma'  as const, name: 'Firma',   icon: 'mdi-office-building-outline',   desc: 'Firma lub spółka handlowa' },
]

const redirectTo = computed(() => {
    const r = route.query.redirect
    return typeof r === 'string' && /^\/[^/]/.test(r) ? r : '/'
})

const strengthLevel = computed(() => {
    const p = password.value
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
})

const strengthWidth = computed(() => `${strengthLevel.value * 25}%`)

const strengthLabel = computed(() => {
    const labels = ['', 'Bardzo słabe', 'Słabe', 'Dobre', 'Silne']
    return labels[strengthLevel.value] ?? ''
})

async function submit() {
    validationError.value = ''
    if (!dateOfBirth.value || !isAdult.value) {
        validationError.value = 'Musisz mieć ukończone 18 lat.'
        return
    }
    if (!termsConfirmed.value) {
        validationError.value = 'Musisz zaakceptować Regulamin oraz Politykę prywatności.'
        return
    }
    if (!gdprConfirmed.value) {
        validationError.value = 'Wymagana jest zgoda na przetwarzanie danych osobowych.'
        return
    }
    if (password.value !== passwordConfirm.value) {
        validationError.value = 'Hasła nie są identyczne.'
        return
    }
    if (password.value.length < 8) {
        validationError.value = 'Hasło musi mieć co najmniej 8 znaków.'
        return
    }
    const phoneDigits = phoneNumber.value.replace(/\D/g, '')
    if (phoneDigits.length < 9) {
        validationError.value = 'Podaj prawidłowy numer telefonu (min. 9 cyfr).'
        return
    }
    if (accountType.value === 'Business') {
        if (!businessSubType.value) {
            validationError.value = 'Wybierz typ konta biznesowego (Dealer / Komis / Firma).'
            return
        }
        const nipDigits = nip.value.replace(/\D/g, '')
        if (nipDigits.length !== 10) {
            validationError.value = 'NIP musi składać się z dokładnie 10 cyfr.'
            return
        }
        if (!companyName.value.trim()) {
            validationError.value = 'Podaj nazwę firmy.'
            return
        }
    }
    const ok = await register({
        name: name.value,
        surname: surname.value,
        email: email.value,
        phonenumber: phoneNumber.value,
        password: password.value,
        dateOfBirth: dateOfBirth.value,
        accountType: accountType.value,
        businessType: accountType.value === 'Business' ? businessSubType.value : undefined,
        companyName: accountType.value === 'Business' ? companyName.value : undefined,
        nip: accountType.value === 'Business' ? nip.value : undefined,
        turnstileToken: turnstileToken.value,
    }, redirectTo.value)
    if (ok === false) turnstileRef.value?.reset()
    if (ok !== false) {
        registeredEmail.value = email.value
        registrationSuccess.value = true
    }
}

onMounted(() => {
    if (facebookAppId) loadFacebookSDK()
})

function loadFacebookSDK() {
    if ((window as any).FB) return
    ;(window as any).fbAsyncInit = function () {
        ;(window as any).FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: false,
            version: 'v19.0',
        })
    }
    if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.src = 'https://connect.facebook.net/pl_PL/sdk.js'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
    }
}

async function handleFacebookLogin() {
    if (!(window as any).FB) return
    fbLoading.value = true
    ;(window as any).FB.login(async (response: any) => {
        if (response.authResponse?.accessToken) {
            await loginWithFacebook(response.authResponse.accessToken, redirectTo.value)
        } else {
            fbLoading.value = false
        }
    }, { scope: 'email,public_profile' })
}

async function resendVerification() {
    if (resending.value || !registeredEmail.value) return
    resending.value = true
    try {
        await $fetch('/api/proxy/api/Auth/resend-verification', {
            method: 'POST',
            body: { email: registeredEmail.value }
        })
        toastSuccess('Link weryfikacyjny został wysłany ponownie.')
    } catch {
        toastError('Nie udało się wysłać linku. Spróbuj ponownie.')
    } finally { resending.value = false }
}
</script>

<style lang="scss" scoped>
.auth-bg {
    background: $bg;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    padding-top: calc(#{$nav-height} + 32px);
    padding-bottom: 60px;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba($red, 0.06) 0%, transparent 70%);
        pointer-events: none;
    }
}

.auth-card {
    @include card($r-xl);
    padding: 48px 40px 40px;
    width: 100%;
    max-width: 500px;
    position: relative;
    z-index: 1;

    @include respond-to(sm) { padding: 32px 20px 24px; }
}

.auth-logo {
    display: block;
    margin-bottom: 28px;
    height: 32px;
    width: auto;
}

h2 {
    font-size: 26px;
    font-weight: 800;
    color: $text;
    margin-bottom: 6px;
}

.auth-sub {
    color: $text-dim;
    margin-bottom: 24px;
    font-size: 14px;
}

.type-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 4px;
    gap: 4px;
    margin-bottom: 16px;
}

.type-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: $r-sm;
    border: none;
    background: transparent;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s;

    &:hover { color: $text; }
    &.type-active { background: $red; color: white; font-weight: 700; }
}

// ── Business sub-type ──────────────────────────────────────────────────────────
.btype-section {
    margin-bottom: 20px;
}

.btype-title {
    font-size: 12px;
    font-weight: 600;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 10px;
}

.btype-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.btype-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 14px 16px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    text-align: left;
    width: 100%;
    font-family: 'Inter', sans-serif;

    &:hover {
        border-color: rgba($red, 0.4);
        background: rgba($red, 0.04);
    }

    &--active {
        border-color: $red;
        background: rgba($red, 0.07);
    }
}

.btype-icon {
    width: 40px;
    height: 40px;
    border-radius: $r-sm;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: $text-muted;

    .btype-card--active & {
        background: rgba($red, 0.15);
        color: $red;
    }
}

.btype-text {
    flex: 1;
    min-width: 0;
}

.btype-name {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 2px;
}

.btype-desc {
    font-size: 12px;
    color: $text-dim;
}

.btype-check {
    color: $red;
    flex-shrink: 0;
}

// Transition
.btype-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.btype-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.btype-fade-enter-from,
.btype-fade-leave-to { opacity: 0; transform: translateY(-6px); }

// ── Form ──────────────────────────────────────────────────────────────────────
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.auth-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @include respond-to(xs) { grid-template-columns: 1fr; }
}

.auth-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.auth-label {
    font-size: 13px;
    font-weight: 600;
    color: $text-muted;
}

.req { color: $red; }

.auth-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 0 14px;
    transition: border-color 0.2s;

    &:focus-within { border-color: rgba($red, 0.5); }
    &--error { border-color: rgba(220,50,50,0.5); }
}

.auth-field-icon { color: $text-dark; flex-shrink: 0; }

.auth-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 0;
    min-width: 0;
    &::placeholder { color: $text-dark; }

    &--solo { padding: 12px 0; }
}

.auth-eye {
    background: transparent;
    border: none;
    color: $text-dark;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
    &:hover { color: $text-muted; }
}

.auth-hint {
    font-size: 11px;
    color: $text-dark;
    &--error { color: #e55; }
}

.strength-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 2px;
}

.strength-track {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.07);
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease, background 0.3s ease;

    &.strength-1 { background: #e53935; }
    &.strength-2 { background: #ff9800; }
    &.strength-3 { background: #fdd835; }
    &.strength-4 { background: #4caf50; }
}

.strength-label {
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;

    &.strength-label-1 { color: #e53935; }
    &.strength-label-2 { color: #ff9800; }
    &.strength-label-3 { color: #fdd835; }
    &.strength-label-4 { color: #4caf50; }
}

.auth-error {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.25);
    border-radius: $r-sm;
    color: #e55;
    font-size: 13px;
    padding: 10px 14px;
}

.auth-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: $red;
    color: white;
    border: none;
    border-radius: $r-md;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 14px 24px;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-top: 4px;
    width: 100%;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.auth-link {
    color: $text-dim;
    text-align: center;
    margin-top: 18px;
    font-size: 14px;

    a {
        color: $red;
        font-weight: 600;
        &:hover { text-decoration: underline; }
    }
}

// ── Registration success ──────────────────────────────────────────────────────
.reg-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
    max-width: 460px;
    width: 100%;
    animation: success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes success-pop {
    from { opacity: 0; transform: scale(0.9) translateY(16px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);    }
}

.reg-success-logo {
    font-size: 30px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;
    span { color: $red; }
}

.reg-success-icon {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(76,175,80,0.1);
    border: 2px solid rgba(76,175,80,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4caf50;
    animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.2); }
    50%       { box-shadow: 0 0 0 14px rgba(76,175,80,0); }
}

.reg-success-title {
    font-size: 26px;
    font-weight: 900;
    color: $text;
    margin: 0;
}

.reg-success-desc {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.8;
    margin: 0;
    max-width: 380px;
    strong { color: $text; }
}

.reg-success-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-dark;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 360px;
    text-align: center;
}

.resend-link {
    background: none;
    border: none;
    color: $red;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.email-icon { color: #4caf50 !important; }

.reg-success-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 340px;
}

.rsact-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 14px 24px;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s, border-color 0.2s, color 0.2s;

    &--primary {
        background: $red;
        color: white;
        border: none;
        &:hover { opacity: 0.88; }
    }
    &--secondary {
        background: transparent;
        color: $text;
        border: 1px solid rgba(255,255,255,0.15);
        &:hover { border-color: rgba(255,255,255,0.3); }
    }
}

.age-check {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    user-select: none;
}

.age-check-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.age-check-box {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 1.5px solid $border;
    border-radius: 4px;
    background: #0d0d0d;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, background 0.2s;
    margin-top: 2px;
    color: white;

    &--checked {
        background: $red;
        border-color: $red;
    }
}

.age-check-label {
    font-size: 13px;
    color: $text-muted;
    line-height: 1.5;

    a { color: $red; font-weight: 500; &:hover { text-decoration: underline; } }

    &--optional { opacity: 0.8; }
}

.opt-label {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    font-style: italic;
}

.fb-disclosure {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    text-align: center;
    margin-top: -8px;
    line-height: 1.5;
    a { color: rgba(255,255,255,0.6); text-decoration: underline; }
}

.cookie-link {
    color: $red;
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
}

.auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0 16px;
    color: $text-dark;
    font-size: 12px;

    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: $border;
    }
}

.fb-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    background: #1877f2;
    color: white;
    border: none;
    border-radius: $r-md;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 24px;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-bottom: 4px;

    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.fb-icon { flex-shrink: 0; }

// Transitions
.success-fade-enter-active { transition: opacity 0.35s ease; }
.success-fade-leave-active { transition: opacity 0.2s ease; }
.success-fade-enter-from,
.success-fade-leave-to { opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
