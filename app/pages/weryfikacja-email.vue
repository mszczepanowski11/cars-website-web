<template>
    <div class="verify-page">
        <div class="verify-card">
            <NuxtLink to="/" class="verify-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>

            <!-- Loading -->
            <template v-if="status === 'loading'">
                <div class="icon-wrap icon-loading">
                    <v-icon icon="mdi-loading" size="48" class="spin" />
                </div>
                <h1 class="verify-title">Weryfikacja konta...</h1>
                <p class="verify-desc">Prosimy czekać.</p>
            </template>

            <!-- Success -->
            <template v-else-if="status === 'success'">
                <div class="icon-wrap icon-success">
                    <v-icon icon="mdi-check-circle" size="52" />
                </div>
                <h1 class="verify-title">Email zweryfikowany!</h1>
                <p class="verify-desc">
                    Twoje konto zostało pomyślnie aktywowane.<br>
                    Możesz teraz się zalogować i korzystać z CARIZO.
                </p>
                <div class="verify-actions">
                    <NuxtLink to="/login" class="btn-red">
                        <v-icon icon="mdi-login" size="17" />
                        Zaloguj się
                    </NuxtLink>
                    <NuxtLink to="/" class="btn-ghost">
                        Strona główna
                    </NuxtLink>
                </div>
            </template>

            <!-- Error -->
            <template v-else>
                <div class="icon-wrap icon-error">
                    <v-icon icon="mdi-close-circle" size="52" />
                </div>
                <h1 class="verify-title">Link wygasł lub jest nieprawidłowy</h1>
                <p class="verify-desc">
                    Link weryfikacyjny wygasł (ważny 24 godziny) lub jest nieprawidłowy.<br>
                    Możesz poprosić o nowy link.
                </p>
                <div class="verify-resend">
                    <input v-model="resendEmail" class="resend-input" type="email" placeholder="Twój adres e-mail" />
                    <button class="btn-red" :disabled="resending" @click="resend">
                        <v-icon v-if="resending" icon="mdi-loading" size="15" class="spin" />
                        <v-icon v-else icon="mdi-email-outline" size="15" />
                        Wyślij ponownie
                    </button>
                    <p v-if="resendMessage" class="resend-msg">{{ resendMessage }}</p>
                </div>
                <div class="verify-actions">
                    <NuxtLink to="/login" class="btn-ghost">
                        Wróć do logowania
                    </NuxtLink>
                </div>
            </template>

            <div class="verify-footer">
                Potrzebujesz pomocy? <NuxtLink to="/pomoc" class="footer-link">Skontaktuj się z obsługą</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()

const status = ref<'loading' | 'success' | 'error'>('loading')
const resendEmail = ref('')
const resending = ref(false)
const resendMessage = ref('')

onMounted(async () => {
    const token = route.query.token as string | undefined
    if (!token) { status.value = 'error'; return }
    try {
        await $fetch(`/api/proxy/api/Auth/verify-email`, { query: { token } })
        status.value = 'success'
    } catch {
        status.value = 'error'
    }
})

async function resend() {
    if (!resendEmail.value || resending.value) return
    resending.value = true
    resendMessage.value = ''
    try {
        await $fetch('/api/proxy/api/Auth/resend-verification', {
            method: 'POST',
            body: { email: resendEmail.value }
        })
        resendMessage.value = 'Jeśli konto istnieje i nie jest zweryfikowane, wysłaliśmy nowy link.'
    } catch {
        resendMessage.value = 'Nie udało się wysłać. Spróbuj ponownie.'
    } finally {
        resending.value = false
    }
}
</script>

<style lang="scss" scoped>
.verify-page {
    min-height: 100vh;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
}

.verify-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-xl;
    padding: 48px 40px 32px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    animation: card-appear 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both;

    @include respond-to(sm) { padding: 36px 20px 24px; }
}

@keyframes card-appear {
    from { opacity: 0; transform: scale(0.94) translateY(16px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
}

.verify-logo {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 5px;
    color: $text;
    text-decoration: none;
    margin-bottom: 4px;
    span { color: $red; }
}

.icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-loading { color: $text-dim; }
.icon-success {
    background: rgba(76,175,80,0.1);
    border: 2px solid rgba(76,175,80,0.3);
    color: #4caf50;
}
.icon-error {
    background: rgba(220,60,60,0.1);
    border: 2px solid rgba(220,60,60,0.25);
    color: #e55;
}

.verify-title {
    font-size: 22px;
    font-weight: 900;
    color: $text;
    margin: 0;
}

.verify-desc {
    font-size: 14px;
    color: $text-dim;
    line-height: 1.8;
    margin: 0;
}

.verify-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.verify-resend {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}

.resend-input {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 16px;
    outline: none;
    transition: border-color 0.2s;
    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
}

.resend-msg {
    font-size: 13px;
    color: #4caf50;
    margin: 0;
}

.btn-red {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: $red;
    border: none;
    border-radius: $r-md;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 13px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: $text-dark;
    font-size: 13px;
    padding: 8px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: $text-muted; }
}

.verify-footer {
    font-size: 12px;
    color: $text-dark;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    width: 100%;
}

.footer-link { color: $red; &:hover { text-decoration: underline; } }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
