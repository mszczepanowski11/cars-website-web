<template>
    <div class="auth-bg">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>
            <h2>Resetowanie hasła</h2>
            <p class="auth-sub">Podaj adres email, a wyślemy Ci link do ustawienia nowego hasła.</p>

            <template v-if="!sent">
                <form @submit.prevent="submit" class="auth-form">
                    <div class="field-group">
                        <label class="field-label">Adres email</label>
                        <div class="field-input-wrap">
                            <v-icon icon="mdi-email-outline" size="16" class="field-icon" />
                            <input
                                v-model="email"
                                type="email"
                                class="field-input"
                                placeholder="twoj@email.pl"
                                required
                                autocomplete="email"
                            />
                        </div>
                    </div>

                    <div v-if="error" class="error-msg">
                        <v-icon icon="mdi-alert-circle-outline" size="14" />
                        {{ error }}
                    </div>

                    <TurnstileWidget
                        v-if="turnstileSiteKey"
                        ref="turnstileRef"
                        v-model="turnstileToken"
                        :site-key="turnstileSiteKey"
                    />

                    <button type="submit" class="btn-submit" :disabled="loading">
                        <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
                        <v-icon v-else icon="mdi-email-arrow-right-outline" size="16" />
                        {{ loading ? 'Wysyłanie...' : 'Wyślij link resetujący' }}
                    </button>
                </form>
            </template>

            <template v-else>
                <div class="success-state">
                    <div class="success-icon">
                        <v-icon icon="mdi-email-check-outline" size="52" />
                    </div>
                    <p class="success-text">
                        Jeśli konto z adresem <strong>{{ email }}</strong> istnieje, wysłaliśmy na nie email z linkiem
                        do resetowania hasła. Sprawdź również folder SPAM.
                    </p>
                </div>
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
useHead({ title: 'Przypomnij hasło — CARIZO' })
useSeoMeta({ robots: 'noindex, nofollow' })
const runtimeConfig = useRuntimeConfig()

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)
const turnstileToken  = ref('')
const turnstileRef    = ref<{ reset: () => void } | null>(null)
const turnstileSiteKey = runtimeConfig.public.turnstileSiteKey as string

async function submit() {
    loading.value = true
    error.value = ''
    try {
        await $fetch('/api/auth/forgot-password', {
            method: 'POST',
            body: { email: email.value, turnstileToken: turnstileToken.value },
        })
        sent.value = true
    } catch (err: any) {
        if (err?.data?.statusMessage?.includes('CAPTCHA')) {
            error.value = err.data.statusMessage
            turnstileRef.value?.reset()
        } else {
            // Always show success to prevent email enumeration
            sent.value = true
        }
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

h2 {
    font-size: 26px;
    font-weight: 800;
    color: $text;
    margin-bottom: 8px;
}

.auth-sub {
    color: $text-dim;
    margin-bottom: 32px;
    font-size: 14px;
    line-height: 1.6;
}

.auth-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

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

.error-msg {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.2);
    border-radius: $r-sm;
    padding: 10px 14px;
    font-size: 13px;
    color: #e55;
    .v-icon { flex-shrink: 0; }
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
    padding: 16px 0 24px;
    width: 100%;
}

.success-icon {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: rgba($red, 0.08);
    border: 1px solid rgba($red, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: $red;
}

.success-text {
    font-size: 14px;
    color: $text-dim;
    line-height: 1.7;
    strong { color: $text; }
}

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
