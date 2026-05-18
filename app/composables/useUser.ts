import type { UserProfile, UserStats } from '~/types'

export const useUser = () => {
   
    async function fetchProfile(): Promise<UserProfile | null> {
        try {
            return await $fetch<UserProfile>('/api/proxy/api/User/me')
        } catch { return null }
    }

    async function fetchStats(): Promise<UserStats | null> {
        try {
            return await $fetch<UserStats>('/api/proxy/api/User/stats')
        } catch { return null }
    }

    return { fetchProfile, fetchStats }
}