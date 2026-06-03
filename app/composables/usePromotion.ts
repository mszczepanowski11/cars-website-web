// Premiere: June 12 (00:00) – June 14 (23:59:59) 2026, Warsaw time (UTC+2)
const PREMIERE_START = new Date('2026-06-12T00:00:00+02:00').getTime()
const PREMIERE_END   = new Date('2026-06-15T00:00:00+02:00').getTime()

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
