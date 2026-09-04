import type { PagedResult, CarAdvert } from '~/types'

export const useFavorites = () => {
    const favoriteIds = useState<number[]>('favorite-ids', () => [])
    const initialized = useState('favorites-initialized', () => false)
    const authStatus = useCookie('auth_status')
    const isLoggedIn = computed(() => !!authStatus.value)
    // Pobierana w ciele composable (czyli w setupie), zeby przy klikniecu miec
    // aktualna sciezke bez siegania po kontekst Nuxta z wnetrza obslugi zdarzenia.
    const route = useRoute()

    async function fetchFavoriteIds() {
        if (!isLoggedIn.value) { favoriteIds.value = []; initialized.value = false; return }
        if (initialized.value) return
        try {
            const ids: number[] = []
            let page = 1
            let hasMore = true
            while (hasMore) {
                const r = await $fetch<PagedResult<CarAdvert>>(`/api/proxy/api/Favorite?page=${page}&pageSize=100`)
                ids.push(...r.items.map(a => a.id))
                hasMore = r.items.length === 100 && ids.length < r.totalCount
                page++
            }
            favoriteIds.value = ids
            initialized.value = true
        } catch {}
    }

    function isFavorite(id: number) {
        return favoriteIds.value.includes(id)
    }

    async function toggleFavorite(id: number) {
        if (!isLoggedIn.value) {
            // Wczesniej: ciche `return`. Serce na karcie bylo wtedy MARTWYM PRZYCISKIEM -
            // uzytkownik klikal i nie dostawal zadnej odpowiedzi, wiec klikal jeszcze raz.
            // Teraz prowadzi do logowania z powrotem na te sama strone.
            return navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
        }
        const idx = favoriteIds.value.indexOf(id)
        try {
            if (idx !== -1) {
                await $fetch(`/api/proxy/api/Favorite/${id}`, { method: 'DELETE' })
                favoriteIds.value.splice(idx, 1)
            } else {
                await $fetch(`/api/proxy/api/Favorite/${id}`, { method: 'POST' })
                favoriteIds.value.push(id)
            }
        } catch {
            const { error } = useToast()
            error('Nie udało się zmienić ulubionych. Spróbuj ponownie.')
        }
    }

    return { fetchFavoriteIds, isFavorite, toggleFavorite, isLoggedIn }
}
