export default defineEventHandler(async (event) => {
    rateLimit(event, 'forgot-password', 3, 60_000) // 3 per minute per IP
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (config.turnstileSecretKey) {
        const ip = getRequestHeader(event, 'cf-connecting-ip') ?? getRequestHeader(event, 'x-forwarded-for') ?? ''
        const valid = await verifyTurnstile(body.turnstileToken ?? '', config.turnstileSecretKey, ip)
        if (!valid) throw createError({ statusCode: 400, statusMessage: 'Weryfikacja CAPTCHA nie powiodła się.' })
    }

    const { turnstileToken: _t, ...requestBody } = body

    try {
        await $fetch(`${config.public.apiBase}api/Auth/forgot-password`, {
            method: 'POST',
            body: requestBody,
        })
    } catch { /* always return success to prevent email enumeration */ }

    return { success: true }
})
