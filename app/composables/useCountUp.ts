export function useCountUp() {
    function animate(el: Element, target: number, duration = 1600) {
        const start = Date.now()
        const step = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = Math.round(target * eased).toLocaleString('pl')
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }

    function observe(el: Element, target: number, duration = 1600) {
        if (!import.meta.client || !el) return
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animate(el, target, duration)
                observer.disconnect()
            }
        }, { threshold: 0.4 })
        observer.observe(el)
    }

    return { observe }
}
