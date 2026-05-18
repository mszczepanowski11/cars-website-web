import type { PagedResult, CarAdvert } from '~/types'

const favoriteIds = useState<number[]>('favorite-ids', () => [])
const initialized = useState('favorites-initialized', () => false)

export const useFavorites = () => {
    const authStatus = useCookie('auth_status')
    const isLoggedIn = computed(() => !!authStatus.value)

    async function fetchFavoriteIds() {
        if (!isLoggedIn.value) { favoriteIds.value = []; initialized.value = false; return }
        if (initialized.value) return
        try {
            const r = await $fetch<PagedResult<CarAdvert>>('/api/proxy/api/Favorite?page=1&pageSize=200')
            favoriteIds.value = r.items.map(a => a.id)
            initialized.value = true
        } catch {}
    }

    function isFavorite(id: number) {
        return favoriteIds.value.includes(id)
    }

    async function toggleFavorite(id: number) {
        if (!isLoggedIn.value) return
        const idx = favoriteIds.value.indexOf(id)
        try {
            if (idx !== -1) {
                await $fetch(`/api/proxy/api/Favorite/${id}`, { method: 'DELETE' })
                favoriteIds.value.splice(idx, 1)
            } else {
                await $fetch(`/api/proxy/api/Favorite/${id}`, { method: 'POST' })
                favoriteIds.value.push(id)
            }
        } catch {}
    }

    return { fetchFavoriteIds, isFavorite, toggleFavorite, isLoggedIn }
}
