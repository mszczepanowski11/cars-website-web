/**
 * Dyrektywa `v-click-outside` — wywołuje przekazaną funkcję, gdy kliknięcie
 * padnie poza element.
 *
 * Zastępuje dyrektywę o tej samej nazwie z Vuetify (używaną do zamykania menu
 * udostępniania na stronie ogłoszenia). Zachowuje tę samą nazwę, żeby wyjście
 * z frameworka nie wymagało zmiany kodu w miejscu użycia.
 *
 * Dwie rzeczy, które łatwo tu przeoczyć, a bez których dyrektywa jest wadliwa:
 * nasłuchujemy w fazie przechwytywania i na `pointerdown`, a nie na `click` —
 * inaczej element, który znika w trakcie obsługi kliknięcia, zdąży opuścić
 * dokument, `contains()` zwróci fałsz i menu zamknie się przy każdym kliknięciu
 * we własne wnętrze. Obsługujemy też `Escape`, bo menu zamykane wyłącznie myszą
 * jest pułapką dla osoby korzystającej z klawiatury.
 */
type Handler = (event: Event) => void

interface Bound extends HTMLElement {
    __clickOutside?: {
        onPointer: (e: Event) => void
        onKey: (e: KeyboardEvent) => void
    }
}

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.directive('click-outside', {
        mounted(el: Bound, binding) {
            const callback = binding.value as Handler | undefined
            if (typeof callback !== 'function') return

            const onPointer = (event: Event) => {
                const target = event.target as Node | null
                if (target && !el.contains(target)) callback(event)
            }
            const onKey = (event: KeyboardEvent) => {
                if (event.key === 'Escape') callback(event)
            }

            el.__clickOutside = { onPointer, onKey }
            document.addEventListener('pointerdown', onPointer, true)
            document.addEventListener('keydown', onKey)
        },

        unmounted(el: Bound) {
            const handlers = el.__clickOutside
            if (!handlers) return
            document.removeEventListener('pointerdown', handlers.onPointer, true)
            document.removeEventListener('keydown', handlers.onKey)
            delete el.__clickOutside
        },
    })
})
