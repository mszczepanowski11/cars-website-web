import type { PagedResult, CarAdvert } from '~/types'

const favoriteIds = ref<number[]>([])
let initialized = false

export const useFavorites = () => {
    const config = useRuntimeConfig()
    const base = config.public.apiBase
    const token = useCookie('auth_token')
    const isLoggedIn = computed(() => !!token.value)

    async function fetchFavoriteIds() {
        if (!isLoggedIn.value) { favoriteIds.value = []; initialized = false; return }
        if (initialized) return
        try {
            const r = await $fetch<PagedResult<CarAdvert>>(
                `${base}api/Favorite?page=1&pageSize=200`,
                { headers: { Authorization: `Bearer ${token.value}` } }
            )
            favoriteIds.value = r.items.map(a => a.id)
            initialized = true
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
                await $fetch(`${base}api/Favorite/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token.value}` }
                })
                favoriteIds.value.splice(idx, 1)
            } else {
                await $fetch(`${base}api/Favorite/${id}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token.value}` }
                })
                favoriteIds.value.push(id)
            }
        } catch {}
    }

    return { fetchFavoriteIds, isFavorite, toggleFavorite, isLoggedIn }
}
