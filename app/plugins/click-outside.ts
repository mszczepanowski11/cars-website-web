export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('click-outside', {
        mounted(el, binding) {
            el._clickOutsideHandler = (e: MouseEvent) => {
                if (!el.contains(e.target as Node)) {
                    binding.value(e)
                }
            }
            document.addEventListener('click', el._clickOutsideHandler)
        },
        unmounted(el) {
            document.removeEventListener('click', el._clickOutsideHandler)
            delete el._clickOutsideHandler
        }
    })
})
