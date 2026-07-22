<template>
    <div class="auth-bg">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo"><img src="/carizo-logo.svg" alt="CARIZO" /></NuxtLink>

            <div v-if="loading" class="status-state">
                <v-icon icon="mdi-loading" size="28" class="spin" />
                <p>{{ $t('dataDeletion.loading') }}</p>
            </div>

            <div v-else-if="status?.completed" class="status-state status-state--ok">
                <v-icon icon="mdi-check-circle-outline" size="36" />
                <h2>{{ $t('dataDeletion.okTitle') }}</h2>
                <p>{{ $t('dataDeletion.okDesc') }}</p>
                <p class="status-code">{{ $t('dataDeletion.confirmCode') }} <code>{{ status.confirmationCode }}</code></p>
            </div>

            <div v-else class="status-state status-state--error">
                <v-icon icon="mdi-alert-circle-outline" size="36" />
                <h2>{{ $t('dataDeletion.errorTitle') }}</h2>
                <p>{{ $t('dataDeletion.errorDesc') }}</p>
            </div>

            <NuxtLink to="/" class="back-link">{{ $t('dataDeletion.backHome') }}</NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('dataDeletion.metaTitle'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
const route = useRoute()
const loading = ref(true)
const status = ref<{ confirmationCode: string; requestedAt: string; completed: boolean } | null>(null)

onMounted(async () => {
    const id = route.query.id
    if (typeof id !== 'string' || !id) { loading.value = false; return }
    try {
        status.value = await $fetch(`/api/proxy/api/Meta/data-deletion-status/${encodeURIComponent(id)}`)
    } catch {
        status.value = null
    } finally {
        loading.value = false
    }
})
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
}

.auth-card {
    @include card($r-xl);
    padding: 48px 40px 40px;
    width: 100%;
    max-width: 440px;
    text-align: center;
}

.auth-logo { display: block; height: 32px; width: auto; margin: 0 auto 28px; }

.status-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: $text-dim;
    font-size: 14px;
    margin-bottom: 24px;

    h2 { font-size: 19px; font-weight: 800; color: $text; margin: 4px 0 0; }
    p { margin: 0; line-height: 1.5; }
}

.status-state--ok { color: #4caf50; }
.status-state--error { color: #e55; }

.status-code {
    color: $text-dim !important;
    font-size: 12px !important;
    margin-top: 6px !important;

    code {
        background: #0d0d0d;
        border: 1px solid $border;
        border-radius: 6px;
        padding: 2px 6px;
        color: $text-muted;
    }
}

.back-link {
    display: inline-block;
    color: $red;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
