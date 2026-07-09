<template>
    <div class="auth-bg">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>
            <h2>Zaloguj się</h2>
            <p class="auth-sub">Witaj ponownie w CARIZO</p>

            <form class="auth-form" @submit.prevent="submit">
                <div class="auth-field">
                    <label for="login-email" class="auth-label">Adres email</label>
                    <div class="auth-input-wrap" :class="{ 'auth-input-wrap--focus': emailFocused }">
                        <v-icon icon="mdi-email-outline" size="17" class="auth-field-icon" />
                        <input
                            id="login-email"
                            v-model="email"
                            type="email"
                            class="auth-input"
                            placeholder="np. jan@kowalski.pl"
                            required
                            autocomplete="email"
                            @focus="emailFocused = true"
                            @blur="emailFocused = false"
                        />
                    </div>
                </div>

                <div class="auth-field">
                    <div class="auth-label-row">
                        <label for="login-password" class="auth-label">Hasło</label>
                        <NuxtLink to="/forgot-password" class="auth-forgot">Zapomniałem hasła</NuxtLink>
                    </div>
                    <div class="auth-input-wrap" :class="{ 'auth-input-wrap--focus': passwordFocused }">
                        <v-icon icon="mdi-lock-outline" size="17" class="auth-field-icon" />
                        <input
                            id="login-password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="auth-input"
                            placeholder="••••••••"
                            required
                            autocomplete="current-password"
                            @focus="passwordFocused = true"
                            @blur="passwordFocused = false"
                        />
                        <button type="button" class="auth-eye" :aria-label="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'" @click="showPassword = !showPassword">
                            <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="17" />
                        </button>
                    </div>
                </div>

                <div v-if="error" role="alert" class="auth-error">
                    <v-icon icon="mdi-alert-circle-outline" size="15" />
                    {{ error }}
                    <NuxtLink v-if="unverifiedEmail" :to="`/register`" class="verify-hint">
                        Zarejestruj ponownie lub sprawdź skrzynkę email
                    </NuxtLink>
                </div>

                <TurnstileWidget
                    v-if="turnstileSiteKey"
                    ref="turnstileRef"
                    v-model="turnstileToken"
                    :site-key="turnstileSiteKey"
                />

                <button type="submit" class="auth-btn" :disabled="loading">
                    <v-icon v-if="loading" icon="mdi-loading" size="18" class="spin" />
                    <span>{{ loading ? 'Logowanie...' : 'Zaloguj się' }}</span>
                </button>
            </form>

            <div class="auth-divider"><span>lub</span></div>

            <div v-if="googleClientId" ref="googleBtnRef" class="google-btn-wrap"></div>

            <button v-if="facebookAppId" class="fb-btn" :disabled="fbLoading" @click="handleFacebookLogin">
                <svg class="fb-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{{ fbLoading ? 'Logowanie...' : 'Kontynuuj z Facebook' }}</span>
            </button>

            <p v-if="facebookAppId" class="fb-disclosure">Logując się przez Facebook, akceptujesz nasz <NuxtLink to="/regulamin" class="fb-disclosure-link">Regulamin</NuxtLink> i <NuxtLink to="/polityka-prywatnosci" class="fb-disclosure-link">Politykę prywatności</NuxtLink>. Nowe konto zakładamy dopiero po Twoim potwierdzeniu.</p>

            <p class="auth-link">Nie masz konto? <NuxtLink to="/register">Zarejestruj się bezpłatnie</NuxtLink></p>
        </div>

        <FacebookConsentModal
            :visible="!!pendingFacebookConsent"
            :name="pendingFacebookConsent?.name ?? ''"
            :email="pendingFacebookConsent?.email ?? ''"
            :loading="loading"
            @confirm="onConfirmFacebookConsent"
            @cancel="cancelFacebookConsent"
        />
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Zaloguj się — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const route = useRoute()
const { login, loginWithGoogle, loginWithFacebook, loading, error, pendingFacebookConsent, confirmFacebookConsent, cancelFacebookConsent } = useAuth()
const runtimeConfig = useRuntimeConfig()
const email    = ref('')
const password = ref('')
const emailFocused    = ref(false)
const passwordFocused = ref(false)
const showPassword    = ref(false)
const unverifiedEmail = ref(false)
const turnstileToken  = ref('')
const turnstileRef    = ref<{ reset: () => void } | null>(null)
const googleBtnRef    = ref<HTMLElement | null>(null)
const fbLoading        = ref(false)
const turnstileSiteKey = runtimeConfig.public.turnstileSiteKey as string
const googleClientId   = runtimeConfig.public.googleClientId as string
const facebookAppId    = runtimeConfig.public.facebookAppId as string

const redirectTo = computed(() => {
    const r = route.query.redirect
    // Prevent open redirect: must start with / but NOT with // (protocol-relative URLs)
    return typeof r === 'string' && /^\/[^/]/.test(r) ? r : '/'
})

onMounted(() => {
    if (googleClientId) loadGoogleGSI()
    if (facebookAppId) loadFacebookSDK()
})

let _gsiTimer: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
    if (_gsiTimer !== null) { clearInterval(_gsiTimer); _gsiTimer = null }
})

function loadGoogleGSI() {
    if ((window as any).google?.accounts?.id) { initGoogle(); return }
    if (document.querySelector('script[src*="accounts.google.com/gsi"]')) {
        _gsiTimer = setInterval(() => {
            if ((window as any).google?.accounts?.id) { clearInterval(_gsiTimer!); _gsiTimer = null; initGoogle() }
        }, 50)
        return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)
}

function initGoogle() {
    ;(window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
    })
    nextTick(() => {
        if (googleBtnRef.value) {
            ;(window as any).google.accounts.id.renderButton(googleBtnRef.value, {
                theme: 'filled_black',
                size: 'large',
                width: String(googleBtnRef.value.offsetWidth || 380),
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
            })
        }
    })
}

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
        }
        fbLoading.value = false
    }, { scope: 'email,public_profile' })
}

async function onConfirmFacebookConsent() {
    await confirmFacebookConsent(redirectTo.value)
}

async function handleGoogleCredential(response: { credential: string }) {
    await loginWithGoogle(response.credential, redirectTo.value)
    if (error.value) unverifiedEmail.value = false
}

async function submit() {
    unverifiedEmail.value = false
    await login(
        { email: email.value, password: password.value, turnstileToken: turnstileToken.value },
        redirectTo.value
    )
    if (error.value) {
        turnstileRef.value?.reset()
        if (error.value.toLowerCase().includes('zweryfikuj') || error.value.toLowerCase().includes('email')) {
            unverifiedEmail.value = true
        }
    }
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
    padding-top: calc(#{$nav-height} + 40px);
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
    max-width: 460px;
    position: relative;
    z-index: 1;

    @include respond-to(sm) { padding: 36px 24px 28px; }
}

.auth-logo { height: 32px; width: auto; // overrides below
    display: inline-block;
    display: block;
    
    
    
    
    margin-bottom: 28px;
}

h2 {
    font-size: 26px;
    font-weight: 800;
    color: $text;
    margin-bottom: 6px;
}

.auth-sub {
    color: $text-dim;
    margin-bottom: 28px;
    font-size: 14px;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.auth-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.auth-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.auth-label {
    font-size: 13px;
    font-weight: 600;
    color: $text-muted;
}

.auth-forgot {
    font-size: 12px;
    color: $text-dark;
    text-decoration: none;
    &:hover { color: $red; }
}

.auth-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 0 14px;
    transition: border-color 0.2s;

    &--focus { border-color: rgba($red, 0.5); }
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
    padding: 13px 0;
    min-width: 0;
    &::placeholder { color: $text-dark; }
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
    flex-wrap: wrap;
}

.verify-hint {
    display: block;
    width: 100%;
    color: rgba(255,255,255,0.5);
    font-size: 12px;
    margin-top: 4px;
    text-decoration: underline;
    &:hover { color: $text-muted; }
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

.auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0 16px;
    color: $text-dark;
    font-size: 12px;

    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: $border;
    }
}

.google-btn-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;

    // Make Google button fill the card width
    :deep(div) { width: 100% !important; }
    :deep(iframe) { width: 100% !important; }
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
    margin-bottom: 16px;

    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.fb-icon { flex-shrink: 0; }

.fb-disclosure {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    text-align: center;
    margin: -8px 0 16px;
    line-height: 1.5;
}
.fb-disclosure-link { color: rgba(255,255,255,0.6); text-decoration: underline; }

.auth-link {
    color: $text-dim;
    text-align: center;
    margin-top: 4px;
    font-size: 14px;

    a {
        color: $red;
        font-weight: 600;
        &:hover { text-decoration: underline; }
    }
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
