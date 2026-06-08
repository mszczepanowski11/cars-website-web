import type { UserProfile, UserStats, UpdateProfileDto, UpdatePasswordDto, UpdateSettingsDto, AccountSettings } from '~/types'

export const useUser = () => {
    async function fetchProfile(): Promise<UserProfile | null> {
        try { return await $fetch<UserProfile>('/api/proxy/api/User/me') }
        catch { return null }
    }

    async function fetchStats(): Promise<UserStats | null> {
        try { return await $fetch<UserStats>('/api/proxy/api/User/stats') }
        catch { return null }
    }

    async function updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
        return $fetch('/api/proxy/api/User/me', { method: 'PUT', body: dto })
    }

    async function updatePassword(dto: UpdatePasswordDto): Promise<void> {
        await $fetch('/api/proxy/api/User/password', { method: 'PUT', body: dto })
    }

    async function fetchSettings(): Promise<AccountSettings | null> {
        try { return await $fetch<AccountSettings>('/api/proxy/api/User/settings') }
        catch { return null }
    }

    async function updateSettings(dto: UpdateSettingsDto): Promise<AccountSettings> {
        return $fetch('/api/proxy/api/User/settings', { method: 'PUT', body: dto })
    }

    async function deleteAccount(): Promise<void> {
        await $fetch('/api/proxy/api/User/me', { method: 'DELETE' })
    }

    return { fetchProfile, fetchStats, updateProfile, updatePassword, fetchSettings, updateSettings, deleteAccount }
}
