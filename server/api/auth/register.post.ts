export default defineEventHandler(async (event) => {
    rateLimit(event, 'register', 5, 60_000) // 5 per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)
    if (!body || typeof body !== 'object') {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
    }

    if (config.turnstileSecretKey) {
        const ip = getRequestHeader(event, 'cf-connecting-ip') ?? getRequestHeader(event, 'x-forwarded-for') ?? ''
        const valid = await verifyTurnstile(body.turnstileToken ?? '', config.turnstileSecretKey, ip)
        if (!valid) throw createError({ statusCode: 400, statusMessage: 'Captcha failed', message: 'Weryfikacja CAPTCHA nie powiodła się.', data: { message: 'Weryfikacja CAPTCHA nie powiodła się.' } })
    }

    const { turnstileToken: _t, ...registerBody } = body

    try {
        const data = await $fetch<{ message?: string }>(
            `${config.public.apiBase}api/Auth/register`,
            { method: 'POST', body: registerBody }
        )
        // No auth cookie — user must verify email before they can log in
        return { success: true, message: data.message ?? 'Sprawdź skrzynkę email, aby aktywować konto.' }
    } catch (err: any) {
        const status: number = err.response?.status ?? err.status ?? 500
        const raw: string = err?.data?.message ?? err?.data?.statusMessage ?? err?.message ?? ''
        let displayMsg: string
        if (status === 409) {
            displayMsg = 'Konto z tym adresem e-mail już istnieje. Zaloguj się lub zresetuj hasło.'
        } else if (raw && raw.length < 200 && !raw.trim().startsWith('<') && !raw.trim().startsWith('{')) {
            displayMsg = raw
        } else {
            displayMsg = 'Błąd rejestracji. Sprawdź dane i spróbuj ponownie.'
        }
        throw createError({
            statusCode: status,
            statusMessage: status === 409 ? 'Conflict' : 'Bad Request',
            message: displayMsg,
            data: { message: displayMsg }
        })
    }
})
