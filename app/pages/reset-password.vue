<template>
    <div class="auth-bg">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>
            <h2>Nowe hasło</h2>
            <p class="auth-sub">Ustaw nowe hasło dla swojego konta.</p>

            <template v-if="!tokenPresent">
                <div class="error-msg">
                    <v-icon icon="mdi-alert-circle-outline" size="16" />
                    Link do resetowania hasła jest nieprawidłowy lub wygasł. Wyślij prośbę ponownie.
                </div>
                <NuxtLink to="/forgot-password" class="btn-primary">Wyślij nowy link</NuxtLink>
            </template>

            <template v-else-if="success">
                <div class="success-state">
                    <div class="success-icon">
                        <v-icon icon="mdi-check-circle-outline" size="52" />
                    </div>
                    <p class="success-text">
                        Hasło zostało zmienione. Możesz się teraz zalogować używając nowego hasła.
                    </p>
                    <NuxtLink to="/login" class="btn-primary">Zaloguj się</NuxtLink>
                </div>
            </template>

            <template v-else>
                <form @submit.prevent="submit" class="auth-form">
                    <div class="field-group">
                        <label class="field-label">Nowe hasło</label>
                        <div class="field-input-wrap">
                            <v-icon icon="mdi-lock-outline" size="16" class="field-icon" />
                            <input
                                v-model="password"
                                :type="showPass ? 'text' : 'password'"
                                class="field-input"
                                placeholder="Minimum 8 znaków"
                                required
                                autocomplete="new-password"
                            />
                            <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
                                <v-icon :icon="showPass ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" size="16" />
                            </button>
                        </div>
                        <!-- Strength bar -->
                        <div v-if="password" class="strength-wrap">
                            <div class="strength-track">
                                <div class="strength-fill" :class="`strength-${strengthLevel}`" :style="{ width: strengthWidth }" />
                            </div>
                            <span class="strength-label" :class="`sl-${strengthLevel}`">{{ strengthLabel }}</span>
                        </div>
                    </div>

                    <div class="field-group">
                        <label class="field-label">Powtórz hasło</label>
                        <div class="field-input-wrap" :class="{ 'field-input-wrap--error': passwordConfirm && password !== passwordConfirm }">
                            <v-icon icon="mdi-lock-check-outline" size="16" class="field-icon" />
                            <input
                                v-model="passwordConfirm"
                                type="password"
                                class="field-input"
                                placeholder="Powtórz nowe hasło"
                                required
                                autocomplete="new-password"
                            />
                        </div>
                        <span v-if="passwordConfirm && password !== passwordConfirm" class="field-error">
                            <v-icon icon="mdi-close-circle-outline" size="12" />Hasła nie są identyczne.
                        </span>
                    </div>

                    <div v-if="validationError || apiError" class="error-msg">
                        <v-icon icon="mdi-alert-circle-outline" size="14" />
                        {{ validationError || apiError }}
                    </div>

                    <button type="submit" class="btn-submit" :disabled="loading || (!!passwordConfirm && password !== passwordConfirm)">
                        <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
                        <v-icon v-else icon="mdi-lock-reset" size="16" />
                        {{ loading ? 'Zmienianie...' : 'Zmień hasło' }}
                    </button>
                </form>
            </template>

            <p class="auth-link">
                <NuxtLink to="/login">
                    <v-icon icon="mdi-arrow-left" size="14" />
                    Wróć do logowania
                </NuxtLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Ustaw nowe hasło — CARIZO' })

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)
const tokenPresent = computed(() => !!token.value)

const password = ref('')
const passwordConfirm = ref('')
const showPass = ref(false)
const loading = ref(false)
const validationError = ref('')
const apiError = ref('')
const success = ref(false)

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
const strengthLabel = computed(() => ['', 'Bardzo słabe', 'Słabe', 'Dobre', 'Silne'][strengthLevel.value] ?? '')

async function submit() {
    validationError.value = ''
    apiError.value = ''
    if (password.value !== passwordConfirm.value) { validationError.value = 'Hasła nie są identyczne.'; return }
    if (password.value.length < 8) { validationError.value = 'Hasło musi mieć co najmniej 8 znaków.'; return }
    loading.value = true
    try {
        await $fetch('/api/proxy/api/Auth/reset-password', {
            method: 'POST',
            body: { token: token.value, newPassword: password.value },
        })
        success.value = true
    } catch (e: any) {
        apiError.value = e?.data?.statusMessage ?? e?.data?.message ?? 'Link wygasł lub jest nieprawidłowy. Wyślij nową prośbę.'
    } finally {
        loading.value = false
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
    background-image: radial-gradient(ellipse 60% 40% at 50% 0%, rgba($red, 0.06) 0%, transparent 65%);
}

.auth-card {
    @include card($r-xl);
    padding: 50px 40px;
    width: 100%;
    max-width: 460px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    @include respond-to(sm) { padding: 36px 24px; }
}

.auth-logo { height: 32px; width: auto; // overrides below
    display: block;
    
    
    
    
    margin-bottom: 32px;
}

h2 { font-size: 26px; font-weight: 800; color: $text; margin-bottom: 8px; }
.auth-sub { color: $text-dim; margin-bottom: 32px; font-size: 14px; line-height: 1.6; }

.auth-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.field-group { display: flex; flex-direction: column; gap: 7px; }

.field-label {
    font-size: 12px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.field-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 0 14px;
    transition: border-color 0.2s;

    &:focus-within { border-color: rgba($red, 0.5); }
    &--error { border-color: rgba(220,60,60,0.45) !important; }
}

.field-icon { color: $text-dark; flex-shrink: 0; }

.field-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 13px 0;
    &::placeholder { color: $text-dark; }
}

.toggle-pass {
    background: transparent;
    border: none;
    color: $text-dark;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.2s;
    &:hover { color: $text-muted; }
}

.strength-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
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
    &.sl-1 { color: #e53935; }
    &.sl-2 { color: #ff9800; }
    &.sl-3 { color: #fdd835; }
    &.sl-4 { color: #4caf50; }
}

.field-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #e55;
}

.error-msg {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.2);
    border-radius: $r-sm;
    padding: 12px 14px;
    font-size: 13px;
    color: #e55;
    line-height: 1.4;
    width: 100%;
    .v-icon { flex-shrink: 0; margin-top: 1px; }
}

.btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background: $red;
    color: white;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    padding: 14px 24px;
    text-decoration: none;
    transition: opacity 0.2s;
    margin-top: 4px;
    &:hover { opacity: 0.88; }
}

.btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    background: $red;
    border: none;
    border-radius: $r-md;
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 14px 24px;
    cursor: pointer;
    margin-top: 4px;
    transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.success-state {
    text-align: center;
    padding: 8px 0 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.success-icon {
    width: 88px; height: 88px; border-radius: 50%;
    background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; color: #4caf50;
}

.success-text { font-size: 14px; color: $text-dim; line-height: 1.7; margin-bottom: 24px; }

.auth-link {
    color: $text-dim;
    margin-top: 20px;
    font-size: 14px;
    a {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: $text-dim;
        text-decoration: none;
        transition: color 0.2s;
        &:hover { color: $red; }
    }
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
