export const useAuth = () => {

    const config = useRuntimeConfig()
    const token = useCookie('auth_token')
    const loading = ref(false)
    const error = ref('')

    async function login(credentials: { email: string; password: string }) {
        loading.value = true
        error.value = ''
        try {
            const data = await $fetch<{ token: string }>(
                `${config.public.apiBase}api/Auth/login`,
                {
                    method: 'POST',
                    body: credentials,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            token.value = data.token
            await navigateTo('/')
        } catch (err: any) {
            error.value = err?.data || 'Login failed'
        } finally {
            loading.value = false
        }
    }

    async function register(dto: {
        name: string;
        surname: string;
        email: string,
        phonenumber: string,
        password: string
    }) {

        loading.value = true
        error.value = ''

        try {
            const data = await $fetch<{ token: string }>(
                `${config.public.apiBase}api/Auth/register`,
                {
                    method: 'POST',
                    body: JSON.stringify({ ...dto }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            token.value = data.token
            await navigateTo('/')

        } catch (err: any) {
            error.value = err?.data || 'Registration failed'
        } finally {
            loading.value = false

        }
    }

    function logout() {
        token.value = null
        navigateTo('/')
    }


    return { login,logout, register, loading, error }
}