<template>
    <div class="auth-bg">
        <div class="auth-card">
            <div class="auth-logo">CARI<span>ZO</span></div>
            <h2>Zarejestruj się</h2>
            <p class="auth-sub">Dołącz do społeczności CARIZO</p>

            <v-form @submit.prevent="submit" :disabled="loading">
                <div class="frow">
                    <v-text-field v-model="firstName" label="Imię" required />
                    <v-text-field v-model="lastName" label="Nazwisko" required />
                </div>
                <v-text-field v-model="email" label="Adres email" type="email" required class="mb-3" />
                <v-text-field v-model="password" label="Hasło" type="password" required class="mb-4" />
                <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
                <v-btn type="submit" color="primary" size="large" block :loading="loading">
                    Zarejestruj się
                </v-btn>
            </v-form>

            <p class="auth-link">Masz już konto? <NuxtLink to="/login">Zaloguj się</NuxtLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const base = config.public.apiBase
const token = useCookie('auth_token')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
    error.value = ''
    loading.value = true
    try {
        await $fetch(`${base}api/Auth/register`, {
            method: 'POST',
            body: { firstName: firstName.value, lastName: lastName.value, email: email.value, password: password.value },
        })
        const data = await $fetch < { token: string } > (`${base}api/Auth/login`, {
            method: 'POST',
            body: { email: email.value, password: password.value },
        })
        token.value = data.token
        navigateTo('/')
    } catch {
        error.value = 'Błąd rejestracji. Sprawdź dane i spróbuj ponownie.'
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
}

.auth-card {
    @include card($r-xl);
    padding: 50px 40px;
    width: 100%;
    max-width: 500px;
}

.auth-logo {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 6px;
    color: $text;
    margin-bottom: 28px;

    span {
        color: $red;
    }
}

h2 {
    font-size: 28px;
    font-weight: 800;
    color: $text;
    margin-bottom: 8px;
}

.auth-sub {
    color: $text-dim;
    margin-bottom: 32px;
}

.frow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @include respond-to(xs) {
        grid-template-columns: 1fr;
    }
}

.auth-link {
    color: $text-dim;
    text-align: center;
    margin-top: 24px;
    font-size: 14px;

    a {
        color: $red;
    }
}
</style>