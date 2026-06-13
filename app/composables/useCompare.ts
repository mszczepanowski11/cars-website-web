const MAX_COMPARE = 3

export function useCompare() {
    const compared = useState<number[]>('carizo_compare', () => [])

    function toggle(id: number) {
        const idx = compared.value.indexOf(id)
        if (idx !== -1) {
            compared.value = compared.value.filter(x => x !== id)
        } else if (compared.value.length < MAX_COMPARE) {
            compared.value = [...compared.value, id]
        }
    }

    const isCompared = (id: number) => compared.value.includes(id)

    function clear() { compared.value = [] }

    return { compared, toggle, isCompared, clear, MAX_COMPARE }
}
