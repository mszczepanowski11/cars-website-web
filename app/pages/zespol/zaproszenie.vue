<template>
    <div class="invite-page">
        <div class="container">
            <div class="invite-card">
                <template v-if="state === 'loading'">
                    <CzIcon icon="mdi-loading" size="40" class="spin" />
                    <p>{{ $t('team.acceptLoading') }}</p>
                </template>

                <template v-else-if="state === 'success'">
                    <CzIcon icon="mdi-check-circle-outline" size="48" class="icon-success" />
                    <h1>{{ $t('team.acceptSuccessTitle') }}</h1>
                    <p>{{ $t('team.acceptSuccessSub') }}</p>
                    <NuxtLink to="/zespol" class="btn-red">{{ $t('team.goToTeam') }}</NuxtLink>
                </template>

                <template v-else>
                    <CzIcon icon="mdi-alert-circle-outline" size="48" class="icon-error" />
                    <h1>{{ $t('team.acceptErrorTitle') }}</h1>
                    <p>{{ errorMessage }}</p>
                    <NuxtLink to="/" class="btn-outline">{{ $t('team.backHome') }}</NuxtLink>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
useHead({ title: t('team.acceptMetaTitle'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const { acceptInvite } = useCompany()

const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
    const token = String(route.query.token ?? '')
    if (!token) {
        state.value = 'error'
        errorMessage.value = t('team.acceptMissingToken')
        return
    }
    try {
        await acceptInvite(token)
        state.value = 'success'
    } catch (e: any) {
        state.value = 'error'
        errorMessage.value = e?.data?.message ?? t('team.acceptError')
    }
})
</script>

<style lang="scss" scoped>
.invite-page {
    background: $bg;
    min-height: 100vh;
    padding-top: var(--nav-h);
    display: flex;
    align-items: center;
}

.container { @include container; }

.invite-card {
    max-width: 440px;
    margin: 0 auto;
    background: $bg;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 48px 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;

    .cz-icon { color: $text-dim; }
    .icon-success { color: $success; }
    .icon-error { color: $danger; }

    h1 { font-size: 20px; font-weight: 800; color: $text; margin: 0; }
    p { font-size: 14px; color: $text-dim; line-height: 1.6; margin: 0 0 8px; }
}

.btn-red {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    padding: 11px 24px;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.btn-outline {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 700;
    padding: 11px 24px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.05); }
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
