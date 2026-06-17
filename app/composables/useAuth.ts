export const useAuth = () => {
    const loading = ref(false)
    const error = ref('')

    async function login(credentials: { email: string; password: string }, redirectTo?: string) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/login', { method: 'POST', body: credentials })
            await navigateTo(redirectTo || '/')
        } catch (err: any) {
            if (err?.status === 429 || err?.statusCode === 429) {
                error.value = err?.data?.statusMessage || 'Zbyt wiele prób logowania. Poczekaj chwilę i spróbuj ponownie.'
            } else {
                error.value = err?.data?.statusMessage || err?.message || 'Nieprawidłowy email lub hasło.'
            }
        } finally {
            loading.value = false
        }
    }

    async function register(dto: {
        name: string; surname: string; email: string
        phonenumber: string; password: string
        accountType: 'Personal' | 'Business'
        companyName?: string; nip?: string
    }, redirectTo?: string) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/register', { method: 'POST', body: dto })
            return true
        } catch (err: any) {
            if (err?.status === 429 || err?.statusCode === 429) {
                error.value = err?.data?.statusMessage || 'Zbyt wiele prób rejestracji. Poczekaj chwilę i spróbuj ponownie.'
            } else {
                error.value = err?.data?.statusMessage || err?.message || 'Błąd rejestracji. Sprawdź dane i spróbuj ponownie.'
            }
            return false
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        try {
            await $fetch('/api/auth/logout', { method: 'POST' })
        } catch { }
        // Clear all user-specific localStorage keys on logout
        if (import.meta.client) {
            Object.keys(localStorage)
                .filter(k => k.startsWith('carizo_profile_override_'))
                .forEach(k => localStorage.removeItem(k))
        }
        await navigateTo('/')
    }

    return { login, logout, register, loading, error }
}