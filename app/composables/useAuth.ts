export const useAuth = () => {
    const loading = ref(false)
    const error = ref('')

    async function login(credentials: { email: string; password: string }) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/login', { method: 'POST', body: credentials })
            await navigateTo('/')
        } catch (err: any) {
            error.value = err?.data?.statusMessage || err?.message || 'Nieprawidłowy email lub hasło.'
        } finally {
            loading.value = false
        }
    }

    async function register(dto: { name: string; surname: string; email: string; phonenumber: string; password: string }) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/auth/register', { method: 'POST', body: dto })
            await navigateTo('/')
        } catch (err: any) {
            error.value = err?.data?.statusMessage || err?.message || 'Błąd rejestracji. Sprawdź dane i spróbuj ponownie.'
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        try {
            await $fetch('/api/auth/logout', { method: 'POST' })
        } catch {}
        await navigateTo('/')
    }

    return { login, logout, register, loading, error }
}