export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    let token = getCookie(event, 'auth_token')
    const method = getMethod(event)
    const path = event.context.params?.path ?? ''

    const PUBLIC_POST_PATHS = ['api/Advert/search', 'api/Payment/webhook']
    const isPublicPost = PUBLIC_POST_PATHS.some(p => path === p || path.startsWith(p + '/')) || /^api\/Advert\/\d+\/view$/.test(path)

    if (!token && !['GET', 'HEAD'].includes(method) && !isPublicPost) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const query = getQuery(event)

    const targetUrl = new URL(`${config.public.apiBase}${path}`)
    for (const [k, v] of Object.entries(query)) {
        targetUrl.searchParams.set(k, String(v))
    }

    const buildHeaders = (t: string | undefined) => {
        const h: Record<string, string> = {}
        if (t) h['Authorization'] = `Bearer ${t}`
        return h
    }

    async function tryRefreshToken() {
        const refreshToken = getCookie(event, 'refresh_token')
        if (!refreshToken) return null
        try {
            const data = await $fetch<{ token: string; refreshToken: string }>(
                `${config.public.apiBase}api/Auth/refresh`,
                { method: 'POST', body: { refreshToken } }
            )
            const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
            setCookie(event, 'auth_token', data.token, { ...cookieOpts, maxAge: 60 * 60 * 2 })
            setCookie(event, 'refresh_token', data.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })
            return data.token
        } catch {
            deleteCookie(event, 'auth_token')
            deleteCookie(event, 'refresh_token')
            deleteCookie(event, 'auth_status')
            return null
        }
    }

    const headers = buildHeaders(token)
    const hasBody = !['GET', 'HEAD', 'DELETE'].includes(method)

    async function proxyFetch(body?: FormData | any) {
        const opts: any = { method, headers }
        if (body !== undefined) opts.body = body
        try {
            return await $fetch(targetUrl.toString(), opts)
        } catch (err: any) {
            const statusCode = err?.response?.status ?? err?.statusCode ?? 500
            if (statusCode === 401 && token) {
                const newToken = await tryRefreshToken()
                if (newToken) {
                    try {
                        return await $fetch(targetUrl.toString(), { ...opts, headers: buildHeaders(newToken) })
                    } catch (retryErr: any) {
                        const rc = retryErr?.response?.status ?? retryErr?.statusCode ?? 500
                        const raw = retryErr?.data ?? retryErr?.response?._data ?? retryErr?.message ?? 'Request failed'
                        const msg = typeof raw === 'string' ? raw : JSON.stringify(raw)
                        throw createError({ statusCode: rc, statusMessage: msg.slice(0, 500) })
                    }
                }
            }
            const raw = err?.data ?? err?.response?._data ?? err?.message ?? 'Proxy error'
            const msg = typeof raw === 'string' ? raw : JSON.stringify(raw)
            console.error(`[proxy] ${method} ${path} → ${statusCode}: ${msg}`)
            throw createError({ statusCode, statusMessage: msg.slice(0, 500) })
        }
    }

    if (!hasBody) {
        return proxyFetch()
    }

    const contentType = getRequestHeader(event, 'content-type') ?? ''

    if (contentType.startsWith('multipart/form-data')) {
        const parts = await readMultipartFormData(event)
        if (parts && parts.length > 0) {
            const formData = new FormData()
            for (const part of parts) {
                if (part.filename !== undefined) {
                    formData.append(
                        part.name ?? 'file',
                        new Blob([part.data], { type: part.type ?? 'application/octet-stream' }),
                        part.filename
                    )
                } else {
                    formData.append(part.name ?? 'field', part.data.toString('utf-8'))
                }
            }
            return proxyFetch(formData)
        }
    }

    const body = await readBody(event)
    headers['Content-Type'] = 'application/json'
    return proxyFetch(body)
})
