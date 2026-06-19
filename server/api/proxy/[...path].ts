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

    async function proxyFetch(options: Parameters<typeof $fetch>[1]) {
        try {
            return await $fetch(targetUrl.toString(), options)
        } catch (err: any) {
            const statusCode = err?.response?.status ?? err?.statusCode ?? 500
            const backendData = err?.data ?? err?.response?._data
            const message =
                (typeof backendData?.message === 'string' ? backendData.message : null) ??
                err?.statusMessage ??
                err?.message ??
                'Request failed'
            throw createError({ statusCode, statusMessage: message, data: backendData })
        }
    }

    const hasBody = !['GET', 'HEAD', 'DELETE'].includes(method)

    if (!hasBody) {
        return proxyFetch({ method: method as any, headers })
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
            return proxyFetch({ method: method as any, body: formData, headers })
        }
    }

    const body = await readBody(event)
    headers['Content-Type'] = 'application/json'
    return proxyFetch({ method: method as any, body, headers })
})
