<template>
    <div class="confirm-page">
        <div class="confirm-card">
            <template v-if="status === 'loading'">
                <v-progress-circular indeterminate color="#8B0D1D" size="48" />
                <p class="confirm-text">Potwierdzanie zapisu…</p>
            </template>
            <template v-else-if="status === 'success'">
                <v-icon icon="mdi-check-circle-outline" size="56" color="#4CAF50" />
                <h1 class="confirm-title">Zapis potwierdzony!</h1>
                <p class="confirm-text">Dziękujemy! Twój adres e-mail został potwierdzony. Będziesz otrzymywać najnowsze ogłoszenia i aktualności CARIZO.</p>
                <NuxtLink to="/" class="confirm-btn">Przejdź do serwisu</NuxtLink>
            </template>
            <template v-else>
                <v-icon icon="mdi-alert-circle-outline" size="56" color="#8B0D1D" />
                <h1 class="confirm-title">Link wygasł</h1>
                <p class="confirm-text">Ten link potwierdzający jest nieważny lub wygasł. Spróbuj zapisać się ponownie.</p>
                <NuxtLink to="/" class="confirm-btn">Wróć do strony głównej</NuxtLink>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Potwierdzenie zapisu — CARIZO' })

const route = useRoute()
const status = ref<'loading' | 'success' | 'error'>('loading')

onMounted(async () => {
    const token = route.query.token as string
    if (!token) { status.value = 'error'; return }
    try {
        await $fetch(`/api/proxy/api/Newsletter/confirm?token=${encodeURIComponent(token)}`, {
            method: 'GET'
        })
        status.value = 'success'
    } catch {
        status.value = 'error'
    }
})
</script>

<style lang="scss" scoped>
.confirm-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
}
.confirm-card {
    background: #0c0c0c;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 48px 40px;
    text-align: center;
    max-width: 480px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}
.confirm-title {
    font-size: 22px;
    font-weight: 700;
    color: $text;
    margin: 0;
}
.confirm-text {
    font-size: 14px;
    color: $text-muted;
    line-height: 1.6;
    margin: 0;
}
.confirm-btn {
    display: inline-block;
    background: $red;
    color: white;
    padding: 10px 24px;
    border-radius: $r-sm;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    margin-top: 8px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}
</style>
