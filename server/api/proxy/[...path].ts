export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    const method = getMethod(event)

    if (!token && !['GET', 'HEAD'].includes(method)) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const path = event.context.params?.path ?? ''
    const query = getQuery(event)

    const hasBody = !['GET', 'HEAD', 'DELETE'].includes(method)
    const body = hasBody ? await readBody(event) : undefined

    const targetUrl = new URL(`${config.public.apiBase}${path}`)
    for (const [k, v] of Object.entries(query)) {
        targetUrl.searchParams.set(k, String(v))
    }

    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (hasBody) headers['Content-Type'] = 'application/json'

    return $fetch(targetUrl.toString(), { method: method as any, body, headers })
})