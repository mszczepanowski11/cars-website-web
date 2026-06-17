import type { UserProfile, UserStats, UpdateProfileDto, UpdatePasswordDto, UpdateSettingsDto, AccountSettings } from '~/types'

const PROFILE_OVERRIDE_KEY = (userId: number) => `carizo_profile_override_${userId}`

function loadOverride(userId: number): Partial<UserProfile> {
    if (!import.meta.client) return {}
    try {
        const raw = localStorage.getItem(PROFILE_OVERRIDE_KEY(userId))
        return raw ? JSON.parse(raw) : {}
    } catch { return {} }
}

function saveOverride(userId: number, data: Partial<UserProfile>) {
    if (!import.meta.client) return
    localStorage.setItem(PROFILE_OVERRIDE_KEY(userId), JSON.stringify(data))
}

export const useUser = () => {
    async function fetchProfile(): Promise<UserProfile | null> {
        try {
            const remote = await $fetch<UserProfile>('/api/proxy/api/User/me')
            const override = loadOverride(remote.id)
            return { ...remote, ...override }
        } catch { return null }
    }

    async function fetchStats(): Promise<UserStats | null> {
        try { return await $fetch<UserStats>('/api/proxy/api/User/stats') }
        catch { return null }
    }

    async function updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
        try {
            const result = await $fetch<UserProfile>('/api/proxy/api/User/me', { method: 'PATCH', body: dto })
            if (import.meta.client) localStorage.removeItem(PROFILE_OVERRIDE_KEY(result.id))
            return result
        } catch (e: any) {
            const status = e?.status ?? e?.statusCode
            if (status === 404 || status === 405) {
                const remote = await $fetch<UserProfile>('/api/proxy/api/User/me').catch(() => ({} as UserProfile))
                saveOverride(remote.id, dto as Partial<UserProfile>)
                return { ...remote, ...dto } as UserProfile
            }
            throw e
        }
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
