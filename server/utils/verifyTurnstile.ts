export async function verifyTurnstile(token: string, secretKey: string, ip?: string): Promise<boolean> {
    if (!secretKey || !token) return false
    try {
        const params = new URLSearchParams({ secret: secretKey, response: token })
        if (ip) params.append('remoteip', ip)
        const res = await $fetch<{ success: boolean }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: params,
        })
        return res.success === true
    } catch {
        return false
    }
}
