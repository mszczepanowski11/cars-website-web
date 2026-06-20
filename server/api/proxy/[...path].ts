export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const method = getMethod(event)

    if (!token && !['GET', 'HEAD'].includes(method)) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const path = event.context.params?.path ?? ''
    const query = getQuery(event)

    const targetUrl = new URL(`${config.public.apiBase}${path}`)
    for (const [k, v] of Object.entries(query)) {
        targetUrl.searchParams.set(k, String(v))
    }

    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const hasBody = !['GET', 'HEAD', 'DELETE'].includes(method)

    async function proxyFetch(body?: FormData | any) {
        const opts: any = { method, headers }
        if (body !== undefined) opts.body = body
        try {
            return await $fetch(targetUrl.toString(), opts)
        } catch (err: any) {
            const status = err?.response?.status ?? err?.statusCode ?? 500
            const raw = err?.data ?? err?.response?._data ?? err?.message ?? 'Proxy error'
            const msg = typeof raw === 'string' ? raw : JSON.stringify(raw)
            console.error(`[proxy] ${method} ${path} → ${status}: ${msg}`)
            throw createError({ statusCode: status, statusMessage: msg.slice(0, 500) })
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
