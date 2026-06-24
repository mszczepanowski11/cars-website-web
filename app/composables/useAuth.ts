export const useAuth = () => {
    const loading = ref(false)
    const error = ref('')

    async function login(credentials: { email: string; password: string; turnstileToken?: string }, redirectTo?: string) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/login', { method: 'POST', body: credentials })
            await navigateTo(redirectTo || '/')
        } catch (err: any) {
            const d = err?.data
            // Nitro wraps: d.message contains the Polish display text; d.statusMessage is ASCII-only.
            const msg = d?.message || d?.statusMessage || err?.message
            if (err?.status === 429 || err?.statusCode === 429 || d?.statusCode === 429) {
                error.value = msg || 'Zbyt wiele prób logowania. Poczekaj chwilę i spróbuj ponownie.'
            } else {
                error.value = msg || 'Nieprawidłowy email lub hasło.'
            }
        } finally {
            loading.value = false
        }
    }

    async function loginWithGoogle(credential: string, redirectTo?: string) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/google', { method: 'POST', body: { credential } })
            await navigateTo(redirectTo || '/')
        } catch (err: any) {
            if (err?.status === 429 || err?.statusCode === 429) {
                error.value = err?.data?.statusMessage || 'Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.'
            } else {
                error.value = err?.data?.statusMessage || err?.message || 'Logowanie przez Google nie powiodło się.'
            }
        } finally {
            loading.value = false
        }
    }

    async function loginWithFacebook(accessToken: string, redirectTo?: string) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/facebook', { method: 'POST', body: { accessToken } })
            await navigateTo(redirectTo || '/')
        } catch (err: any) {
            if (err?.status === 429 || err?.statusCode === 429) {
                error.value = err?.data?.statusMessage || 'Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.'
            } else {
                error.value = err?.data?.statusMessage || err?.message || 'Logowanie przez Facebook nie powiodło się.'
            }
        } finally {
            loading.value = false
        }
    }

    async function register(dto: {
        name: string; surname: string; email: string
        phonenumber: string; password: string
        dateOfBirth: string
        accountType: 'Personal' | 'Business'
        companyName?: string; nip?: string
        businessType?: 'Dealer' | 'Komis' | 'Firma'
        turnstileToken?: string
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
                .filter(k => k.startsWith('carizo_profile_override_') || k.startsWith('carizo_advert_draft_'))
                .forEach(k => localStorage.removeItem(k))
        }
        await navigateTo('/')
    }

    return { login, loginWithGoogle, loginWithFacebook, logout, register, loading, error }
}
