<template>
    <Teleport to="body">
        <transition name="fb-consent-fade">
            <div v-if="visible" class="fb-consent-backdrop" @click.self="$emit('cancel')">
                <div class="fb-consent-card" role="dialog" aria-modal="true" aria-labelledby="fb-consent-title">
                    <svg class="fb-consent-icon" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <h2 id="fb-consent-title">{{ $t('cFbConsent.title') }}</h2>
                    <p class="fb-consent-body">
                        {{ $t('cFbConsent.body') }}
                    </p>
                    <ul class="fb-consent-fields">
                        <li><v-icon icon="mdi-account-outline" size="15" />{{ name || $t('cFbConsent.namePlaceholder') }}</li>
                        <li><v-icon icon="mdi-email-outline" size="15" />{{ email }}</li>
                    </ul>
                    <p class="fb-consent-legal">
                        {{ $t('cFbConsent.legalPrefix') }}
                        <NuxtLink to="/regulamin" target="_blank" class="fb-consent-link">{{ $t('cFbConsent.linkTerms') }}</NuxtLink>
                        {{ $t('cFbConsent.legalAnd') }}
                        <NuxtLink to="/polityka-prywatnosci" target="_blank" class="fb-consent-link">{{ $t('cFbConsent.linkPrivacy') }}</NuxtLink>.
                        {{ $t('cFbConsent.legalSuffix') }}
                    </p>
                    <div class="fb-consent-actions">
                        <button type="button" class="fb-consent-btn fb-consent-btn--ghost" :disabled="loading" @click="$emit('cancel')">{{ $t('cFbConsent.cancel') }}</button>
                        <button type="button" class="fb-consent-btn fb-consent-btn--primary" :disabled="loading" @click="$emit('confirm')">
                            <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
                            {{ loading ? $t('cFbConsent.creating') : $t('cFbConsent.createAccount') }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; name: string; email: string; loading: boolean }>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<style lang="scss" scoped>
.fb-consent-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 2100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.fb-consent-card {
    @include card($r-xl);
    width: 100%;
    max-width: 420px;
    padding: 32px 28px 28px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.fb-consent-icon { color: #1877f2; margin-bottom: 8px; }

h2 { font-size: 19px; font-weight: 800; color: $text; margin: 0 0 10px; }

.fb-consent-body {
    font-size: 13.5px;
    color: $text-muted;
    margin: 0 0 14px;
    line-height: 1.5;
}

.fb-consent-fields {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    li {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #0d0d0d;
        border: 1px solid $border;
        border-radius: $r-sm;
        padding: 9px 12px;
        font-size: 13px;
        color: $text;
        text-align: left;

        .v-icon { color: $text-dark; flex-shrink: 0; }
    }
}

.fb-consent-legal {
    font-size: 11.5px;
    color: $text-dark;
    line-height: 1.5;
    margin: 0 0 22px;
}

.fb-consent-link { color: $red; &:hover { text-decoration: underline; } }

.fb-consent-actions {
    display: flex;
    gap: 10px;
    width: 100%;
}

.fb-consent-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-radius: $r-md;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 16px;
    cursor: pointer;
    transition: opacity 0.2s;
    border: none;

    &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.fb-consent-btn--ghost {
    background: transparent;
    border: 1px solid $border;
    color: $text-muted;
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
}

.fb-consent-btn--primary {
    background: $red;
    color: white;
    &:hover:not(:disabled) { opacity: 0.88; }
}

.fb-consent-fade-enter-active, .fb-consent-fade-leave-active { transition: opacity 0.2s; }
.fb-consent-fade-enter-from, .fb-consent-fade-leave-to { opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
