<template>
    <div class="error-page">
        <div class="error-card">
            <img src="/carizo-logo.svg" alt="CARIZO" class="error-logo" />

            <div class="error-icon-wrap" :class="isNotFound ? 'wrap-404' : 'wrap-500'">
                <v-icon :icon="isNotFound ? 'mdi-map-search-outline' : 'mdi-alert-circle-outline'" size="52" />
            </div>

            <div class="error-code">{{ error.statusCode }}</div>
            <h1 class="error-title">{{ title }}</h1>
            <p class="error-desc">{{ desc }}</p>

            <div class="error-actions">
                <button class="btn-home" @click="handleError">
                    <v-icon icon="mdi-home-outline" size="17" />
                    Strona główna
                </button>
                <button class="btn-back" @click="goBack">
                    <v-icon icon="mdi-arrow-left" size="17" />
                    Wróć
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

const title = computed(() =>
    isNotFound.value
        ? 'Nie znaleziono strony'
        : 'Coś poszło nie tak'
)

const desc = computed(() =>
    isNotFound.value
        ? 'Strona, której szukasz, nie istnieje lub została przeniesiona.'
        : 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub wróć na stronę główną.'
)

function handleError() {
    clearError({ redirect: '/' })
}

function goBack() {
    clearError()
    window.history.back()
}
</script>

<style lang="scss" scoped>
.error-page {
    background: $bg;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    font-family: 'Inter', sans-serif;
}

.error-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    max-width: 440px;
    width: 100%;
}

.error-logo {
    margin-bottom: 8px;
}

.error-icon-wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.wrap-404 {
        background: rgba($red, 0.08);
        border: 1px solid rgba($red, 0.2);
        color: $red;
    }
    &.wrap-500 {
        background: rgba(255,152,0,0.08);
        border: 1px solid rgba(255,152,0,0.2);
        color: #ff9800;
    }
}

.error-code {
    font-size: 72px;
    font-weight: 900;
    color: rgba(255,255,255,0.04);
    line-height: 1;
    letter-spacing: -4px;
    margin-top: -8px;
}

.error-title {
    font-size: 24px;
    font-weight: 800;
    color: $text;
    margin: 0;
}

.error-desc {
    font-size: 14px;
    color: $text-dim;
    line-height: 1.7;
    margin: 0;
    max-width: 340px;
}

.error-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
}

.btn-home {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: $red;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 12px 24px;
    cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    color: $text-muted;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 12px 20px;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}
</style>
