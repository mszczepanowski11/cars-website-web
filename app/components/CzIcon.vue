<script setup lang="ts">
/**
 * Ikona jako wstawiony SVG.
 *
 * Zastępuje `<v-icon>` z Vuetify, które renderowało ikonę jako znak z czcionki
 * Material Design Icons. Ta czcionka waży 396 kB (woff2) i zawiera 7448 ikon,
 * z których serwis używa 314. Ładowała się na KAŻDEJ podstronie, także takiej,
 * która pokazuje trzy ikony.
 *
 * Tutaj ikona to ścieżka SVG pobrana z mapy zbudowanej ze skanu kodu, więc do
 * przeglądarki trafia wyłącznie to, co naprawdę jest w użyciu.
 *
 * Interfejs jest celowo zgodny z `<v-icon>` (`icon`, `size`, `color`), żeby
 * podmiana 1413 wystąpień sprowadzała się do zamiany nazwy znacznika i nie
 * wymagała ruszania żadnego atrybutu - im mniej zmian na wystąpienie, tym mniej
 * miejsc, w których coś może się rozjechać.
 */
import { MDI_PATHS, MDI_FALLBACK } from '~/utils/mdiPaths'

const props = withDefaults(defineProps<{
    /** Nazwa ikony w postaci `mdi-` + nazwa, np. mdi-car-outline. */
    icon?: string | null
    /** Rozmiar w pikselach. Vuetify przyjmowało tu liczbę albo napis - obsługujemy oba. */
    size?: string | number
    /** Kolor. Pominięty = dziedziczy `currentColor` po rodzicu, tak jak robiło to `<v-icon>`. */
    color?: string
}>(), { size: 20 })

const px = computed(() => {
    const n = typeof props.size === 'number' ? props.size : parseFloat(String(props.size))
    return Number.isFinite(n) && n > 0 ? `${n}px` : '20px'
})

const path = computed(() => {
    const name = props.icon
    if (!name) return ''
    // Nieznana nazwa (np. nowa kategoria dodana w panelu, zanim mapa zostanie
    // odświeżona) daje znak zapytania zamiast pustego miejsca - dziura w układzie
    // jest trudniejsza do zauważenia niż widoczny brak.
    return MDI_PATHS[name] ?? MDI_FALLBACK
})
</script>

<template>
    <span
        v-if="path"
        class="cz-icon"
        :style="{ width: px, height: px, color: color || undefined }"
        aria-hidden="true"
    >
        <svg viewBox="0 0 24 24" focusable="false" width="100%" height="100%"><path :d="path" fill="currentColor" /></svg>
    </span>
</template>

<style lang="scss" scoped>
.cz-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    // `<v-icon>` ustawiało `vertical-align: middle`; bez tego ikony obok tekstu
    // siadałyby na linii bazowej i wizualnie opadały o kilka pikseli.
    vertical-align: middle;
    line-height: 1;

    svg { display: block; }
}
</style>
