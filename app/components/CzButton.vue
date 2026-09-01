<script setup lang="ts">
/**
 * Przycisk systemu CARIZO.
 *
 * Powód powstania: audyt spójności znalazł 217 unikalnych klas przycisków w 81
 * plikach (page-btn, btn-action, fopt-btn, dr-btn, act-btn, bulk-btn...), bo nie
 * istniał ani jeden komponent-prymityw — każda strona projektowała przycisk od
 * nowa. To samo źródło dało 157 kolorów i 48 rozmiarów tekstu.
 *
 * Komponent jest DODANY obok istniejących klas, niczego nie psuje. Strony można
 * migrować pojedynczo.
 */
withDefaults(defineProps<{
    /** primary = akcja główna (czerwona), secondary = obrys, ghost = bez tła, danger = akcja niszcząca */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    /** Rozciąga na pełną szerokość — domyślne zachowanie na telefonie w formularzach */
    block?: boolean
    loading?: boolean
    disabled?: boolean
    /** Renderuje NuxtLink zamiast <button>, zachowując ten sam wygląd */
    to?: string
    type?: 'button' | 'submit'
    icon?: string
}>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
})
</script>

<template>
    <component
        :is="to ? resolveComponent('NuxtLink') : 'button'"
        :to="to"
        :type="to ? undefined : type"
        :disabled="to ? undefined : (disabled || loading)"
        class="cz-btn"
        :class="[`cz-btn--${variant}`, `cz-btn--${size}`, { 'cz-btn--block': block, 'is-loading': loading }]"
    >
        <v-icon v-if="loading" icon="mdi-loading" size="18" class="cz-btn__spin" />
        <v-icon v-else-if="icon" :icon="icon" size="18" />
        <span v-if="$slots.default" class="cz-btn__label"><slot /></span>
    </component>
</template>

<style scoped lang="scss">
.cz-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $s-2;
    border: 1px solid transparent;
    border-radius: $r-sm;
    font-family: inherit;
    font-weight: $fw-semibold;
    line-height: 1;
    cursor: pointer;
    transition: background $t-fast, border-color $t-fast, color $t-fast, opacity $t-fast;
    text-align: center;
    white-space: nowrap;

    &:disabled,
    &.is-loading {
        opacity: .55;
        cursor: not-allowed;
    }

    // Widoczny stan fokusu jest wymagany do obsługi klawiaturą (WCAG 2.4.7).
    &:focus-visible {
        outline: 2px solid $red-hot;
        outline-offset: 2px;
    }
}

.cz-btn--sm { padding: $s-2 $s-3; font-size: $fs-sm; }
.cz-btn--md { padding: $s-3 $s-5; font-size: $fs-base; }
.cz-btn--lg { padding: $s-4 $s-6; font-size: $fs-lg; }

.cz-btn--block { width: 100%; }

.cz-btn--primary {
    background: $red;
    color: #fff;
    &:hover:not(:disabled) { background: $red-bright; }
}

.cz-btn--secondary {
    background: transparent;
    border-color: $border;
    color: $text;
    &:hover:not(:disabled) { border-color: $red; color: $red-hot; }
}

.cz-btn--ghost {
    background: transparent;
    color: $text-muted;
    &:hover:not(:disabled) { color: $text; background: $card; }
}

.cz-btn--danger {
    background: $danger;
    color: #fff;
    &:hover:not(:disabled) { filter: brightness(1.1); }
}

.cz-btn__spin { animation: cz-spin .8s linear infinite; }
@keyframes cz-spin { to { transform: rotate(360deg); } }

// Na telefonie każdy przycisk musi spełniać minimalny cel dotykowy.
@media (max-width: $bp-mobile) {
    .cz-btn { min-height: $touch-min; }
}
</style>
