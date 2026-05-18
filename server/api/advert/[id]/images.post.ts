export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    const parts = await readMultipartFormData(event)
    const filePart = parts?.find(p => p.name === 'file')
    if (!filePart) throw createError({ statusCode: 400, statusMessage: 'No file provided' })

    const formData = new FormData()
    const blob = new Blob([filePart.data], { type: filePart.type ?? 'application/octet-stream' })
    formData.append('file', blob, filePart.filename ?? 'image')

    const response = await fetch(`${config.public.apiBase}api/Advert/${id}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })

    if (!response.ok) throw createError({ statusCode: response.status, statusMessage: await response.text() })

    return response.json()
})