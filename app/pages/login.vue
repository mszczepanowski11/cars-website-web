<template>
    <div class="auth-bg">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo">CARI<span>ZO</span></NuxtLink>
            <h2>Zaloguj się</h2>
            <p class="auth-sub">Witaj ponownie w CARIZO</p>

            <form class="auth-form" @submit.prevent="submit">
                <div class="auth-field">
                    <label class="auth-label">Adres email</label>
                    <div class="auth-input-wrap" :class="{ 'auth-input-wrap--focus': emailFocused }">
                        <v-icon icon="mdi-email-outline" size="17" class="auth-field-icon" />
                        <input
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
                        <label class="auth-label">Hasło</label>
                        <NuxtLink to="/forgot-password" class="auth-forgot">Zapomniałem hasła</NuxtLink>
                    </div>
                    <div class="auth-input-wrap" :class="{ 'auth-input-wrap--focus': passwordFocused }">
                        <v-icon icon="mdi-lock-outline" size="17" class="auth-field-icon" />
                        <input
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="auth-input"
                            placeholder="••••••••"
                            required
                            autocomplete="current-password"
                            @focus="passwordFocused = true"
                            @blur="passwordFocused = false"
                        />
                        <button type="button" class="auth-eye" @click="showPassword = !showPassword">
                            <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="17" />
                        </button>
                    </div>
                </div>

                <div v-if="error" class="auth-error">
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

            <p class="auth-link">Nie masz konta? <NuxtLink to="/register">Zarejestruj się bezpłatnie</NuxtLink></p>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { login, loginWithGoogle, loading, error } = useAuth()
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
const turnstileSiteKey = runtimeConfig.public.turnstileSiteKey as string
const googleClientId   = runtimeConfig.public.googleClientId as string

const redirectTo = computed(() => {
    const r = route.query.redirect
    return typeof r === 'string' && r.startsWith('/') ? r : '/'
})

onMounted(() => {
    if (googleClientId) loadGoogleGSI()
})

function loadGoogleGSI() {
    if ((window as any).google?.accounts?.id) { initGoogle(); return }
    if (document.querySelector('script[src*="accounts.google.com/gsi"]')) {
        const timer = setInterval(() => {
            if ((window as any).google?.accounts?.id) { clearInterval(timer); initGoogle() }
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

.auth-logo {
    display: inline-block;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;
    text-decoration: none;
    margin-bottom: 28px;
    span { color: $red; }
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
