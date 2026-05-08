import type { UserProfile, UserStats } from '~/types'

export const useUser = () => {
    const config = useRuntimeConfig()
    const base = config.public.apiBase
    const token = useCookie('auth_token')

    const headers = computed(() => ({ Authorization: `Bearer ${token.value}` }))

    async function fetchProfile(): Promise<UserProfile | null> {
        try {
            return await $fetch<UserProfile>(`${base}api/User/me`, { headers: headers.value })
        } catch { return null }
    }

    async function fetchStats(): Promise<UserStats | null> {
        try {
            return await $fetch<UserStats>(`${base}api/User/stats`, { headers: headers.value })
        } catch { return null }
    }

    return { fetchProfile, fetchStats }
}