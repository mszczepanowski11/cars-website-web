<script setup lang="ts">
/**
 * Karta — powierzchnia, na której leży treść.
 *
 * Audyt naliczył 115 różnych klas wyglądających na kartę, każdą z własnym
 * zaokrągleniem, obramowaniem i odstępem wewnętrznym. To główne źródło wrażenia,
 * że sąsiadujące ze sobą elementy „nie są z tego samego serwisu”.
 *
 * Trzy warianty, bo tyle ról naprawdę istnieje w projekcie:
 *   plain  — zwykła powierzchnia (domyślna)
 *   raised — wyróżniona, z cieniem: modale, panele nad treścią
 *   inset  — wgłębienie: bloki wewnątrz innej karty, np. podsumowanie w formularzu
 *
 * `interactive` dokłada reakcję na najechanie i widoczny focus — dla kart, które
 * są linkiem lub przyciskiem. Karta nieinteraktywna go nie dostaje, żeby nie
 * sugerować klikalności tam, gdzie jej nie ma.
 */
withDefaults(defineProps<{
    variant?: 'plain' | 'raised' | 'inset'
    /** Gęstość odstępu wewnętrznego. */
    padding?: 'none' | 'sm' | 'md' | 'lg'
    interactive?: boolean
    /** Element wynikowy — `article`, `li`, `section` tam, gdzie to ma znaczenie semantyczne. */
    as?: string
}>(), { variant: 'plain', padding: 'md', as: 'div' })
</script>

<template>
    <component
        :is="as"
        class="cz-card"
        :class="[`cz-card--${variant}`, `cz-card--p-${padding}`, { 'cz-card--interactive': interactive }]"
    >
        <slot />
    </component>
</template>

<style lang="scss" scoped>
.cz-card {
    border-radius: $r-md;
    border: 1px solid $border;
    background: $card;
    color: $text;
    min-width: 0;

    // Wariant „wyrozniony" odroznia sie CIENIEM, a nie tlem. Wczesniej mial tez
    // `background: $card-alt`, czyli barwe o jeden krok na kanal ciemniejsza od
    // zwyklej karty - nierozroznialna golym okiem, wiec cala roznica i tak niosl cien.
    &--raised {
        box-shadow: $shadow-lg;
    }

    &--inset {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.07);
        box-shadow: none;
    }

    &--p-none { padding: 0; }
    &--p-sm   { padding: $s-3; }
    &--p-md   { padding: $s-5; }
    &--p-lg   { padding: $s-6; }

    @media (max-width: $bp-mobile) {
        &--p-md { padding: $s-4; }
        &--p-lg { padding: $s-5; }
    }

    &--interactive {
        cursor: pointer;
        transition: border-color $t-fast, background $t-fast, transform $t-fast;

        &:hover {
            border-color: rgba($red, 0.4);
            background: $card-hover;
        }
        // Karta klikalna musi mieć widoczny focus - inaczej osoba poruszająca się
        // klawiaturą nie wie, na czym stoi.
        &:focus-visible {
            outline: 2px solid $red-hot;
            outline-offset: 2px;
        }
        &:active { transform: scale(0.995); }
    }
}
</style>
