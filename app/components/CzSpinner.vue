<script setup lang="ts">
/**
 * Wskaźnik ładowania.
 *
 * Zastępuje `<v-progress-circular indeterminate>` z Vuetify. Ten sam efekt daje
 * jeden okrąg SVG z animowanym `stroke-dasharray`, bez ładowania frameworka.
 */
withDefaults(defineProps<{
    size?: string | number
    color?: string
    /** Etykieta dla czytników ekranu. Domyślnie ukryty przed nimi, bo obok zwykle stoi tekst. */
    label?: string
}>(), { size: 24 })
</script>

<template>
    <span
        class="cz-spinner"
        :style="{ width: `${size}px`, height: `${size}px`, color: color || undefined }"
        :role="label ? 'status' : undefined"
        :aria-label="label || undefined"
        :aria-hidden="label ? undefined : 'true'"
    >
        <svg viewBox="0 0 44 44" width="100%" height="100%">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        </svg>
    </span>
</template>

<style lang="scss" scoped>
.cz-spinner {
    display: inline-flex;
    flex-shrink: 0;
    vertical-align: middle;

    svg {
        display: block;
        animation: cz-spin 1.4s linear infinite;
    }
    circle {
        // Widoczny jest wycinek okręgu, który jednocześnie obraca się i zmienia długość -
        // dzięki temu ruch nie wygląda mechanicznie.
        stroke-dasharray: 90 120;
        animation: cz-dash 1.4s ease-in-out infinite;
    }
}

@keyframes cz-spin { to { transform: rotate(360deg); } }
@keyframes cz-dash {
    0%   { stroke-dasharray: 12 200; stroke-dashoffset: 0; }
    50%  { stroke-dasharray: 90 200; stroke-dashoffset: -20; }
    100% { stroke-dasharray: 12 200; stroke-dashoffset: -102; }
}

// Bez ruchu wskaźnik nadal musi być widoczny, więc zostaje pełny okrąg.
@media (prefers-reduced-motion: reduce) {
    .cz-spinner {
        svg { animation: none; }
        circle { animation: none; stroke-dasharray: none; opacity: 0.5; }
    }
}
</style>
