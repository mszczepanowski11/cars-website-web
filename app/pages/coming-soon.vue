<template>
    <div class="cs-root">
        <div class="cs-card">
            <img src="/carizo-logo.svg" alt="CARIZO" class="cs-logo" />
            <h1 class="cs-title">Już <span>wkrótce</span></h1>
            <p class="cs-sub">Pracujemy nad czymś wyjątkowym. Wróć niebawem.</p>

            <form v-if="needsPassword" class="cs-form" @submit.prevent="submit">
                <div class="cs-input-wrap" :class="{ shake: shaking }">
                    <input
                        ref="inputRef"
                        v-model="password"
                        type="password"
                        placeholder="Hasło dostępu"
                        class="cs-input"
                        autocomplete="current-password"
                    />
                    <button type="submit" class="cs-btn" :disabled="loading">
                        <span v-if="!loading">→</span>
                        <span v-else class="cs-spinner" />
                    </button>
                </div>
                <p v-if="error" class="cs-error">Nieprawidłowe hasło</p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ robots: 'noindex, nofollow' })
useHead({ title: 'CARIZO – Już wkrótce' })

const route = useRoute()
const router = useRouter()

const password = ref('')
const loading = ref(false)
const error = ref(false)
const shaking = ref(false)
const needsPassword = ref(true)
const inputRef = ref<HTMLInputElement | null>(null)

function safeFrom(): string {
    const raw = (route.query.from as string) || '/'
    const decoded = decodeURIComponent(raw)
    return /^\/(?!\/)/.test(decoded) ? decoded : '/'
}

onMounted(async () => {
    try {
        const { hasAccess } = await $fetch<{ hasAccess: boolean }>('/api/site-access')
        if (hasAccess) {
            router.replace(safeFrom())
            return
        }
    } catch { /* continue to show form */ }
    nextTick(() => inputRef.value?.focus())
})

async function submit() {
    if (!password.value.trim()) return
    loading.value = true
    error.value = false

    try {
        const res = await $fetch<{ ok: boolean }>('/api/site-access', {
            method: 'POST',
            body: { password: password.value },
        })

        if (res.ok) {
            await router.replace(safeFrom())
        } else {
            error.value = true
            password.value = ''
            shaking.value = true
            setTimeout(() => { shaking.value = false }, 600)
            nextTick(() => inputRef.value?.focus())
        }
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.cs-root {
    min-height: 100vh;
    background: #050505;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.cs-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 420px;
    width: 100%;
}

.cs-logo {
    width: 140px;
    opacity: 0.9;
}

.cs-title {
    font-size: 52px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -2px;
    margin: 0;
    line-height: 1;
    span { color: $red; }

    @media (max-width: 480px) { font-size: 38px; }
}

.cs-sub {
    font-size: 15px;
    color: #555;
    margin: 0;
    line-height: 1.6;
}

.cs-form {
    width: 100%;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.cs-input-wrap {
    display: flex;
    width: 100%;
    border: 1px solid #1e1e1e;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s;

    &:focus-within { border-color: rgba($red, 0.5); }

    &.shake {
        border-color: rgba($red, 0.7);
        animation: shake 0.5s ease;
    }
}

.cs-input {
    flex: 1;
    background: #0a0a0a;
    border: none;
    outline: none;
    color: #fff;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    padding: 13px 16px;

    &::placeholder { color: #444; }
}

.cs-btn {
    background: $red;
    border: none;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    padding: 0 20px;
    cursor: pointer;
    transition: opacity 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 52px;

    &:hover:not(:disabled) { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.cs-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.cs-error {
    font-size: 13px;
    color: $red;
    margin: 0;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
