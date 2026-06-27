export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing advert ID' })

    const apiBase = config.public.apiBase as string
    const backendUrl = `${apiBase.replace(/\/$/, '')}/api/Advert/${id}/pdf`

    const response = await fetch(backendUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok && response.status !== 204) {
        throw createError({ statusCode: response.status, statusMessage: 'Failed to delete PDF' })
    }
    return { ok: true }
})
