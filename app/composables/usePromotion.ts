function toUnits(ms: number) {
    const diff = Math.max(0, ms)
    return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
    }
}

export const usePromotion = () => {
    const config = useRuntimeConfig()
    const PREMIERE_START = new Date(config.public.premiereStart as string).getTime()
    const PREMIERE_END   = new Date(config.public.premiereEnd as string).getTime()

    const now = ref(Date.now())

    const isPremiereActive   = computed(() => now.value >= PREMIERE_START && now.value < PREMIERE_END)
    const isPremiereUpcoming = computed(() => now.value < PREMIERE_START)
    const remainingToEnd     = computed(() => toUnits(PREMIERE_END - now.value))
    const remainingToStart   = computed(() => toUnits(PREMIERE_START - now.value))

    const pad = (n: number) => String(n).padStart(2, '0')

    let timer: ReturnType<typeof setInterval>
    onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
    onUnmounted(() => clearInterval(timer))

    return { isPremiereActive, isPremiereUpcoming, remainingToEnd, remainingToStart, pad }
}
