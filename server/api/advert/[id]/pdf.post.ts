export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    if (!id || !/^\d+$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid advert ID' })

    const parts = await readMultipartFormData(event)
    const filePart = parts?.find(p => p.name === 'file')
    if (!filePart) throw createError({ statusCode: 400, statusMessage: 'No file provided' })

    const fileType = filePart.type ?? 'application/octet-stream'
    if (fileType !== 'application/pdf') {
        throw createError({ statusCode: 400, statusMessage: 'Dozwolony tylko plik PDF.' })
    }

    const MAX_SIZE = 25 * 1024 * 1024
    if (filePart.data.length > MAX_SIZE) {
        throw createError({ statusCode: 413, statusMessage: 'Plik PDF przekracza limit 25 MB.' })
    }

    const formData = new FormData()
    const blob = new Blob([filePart.data], { type: 'application/pdf' })
    const filename = filePart.filename ?? 'brochure.pdf'
    formData.append('file', blob, filename)

    const apiBase = config.public.apiBase as string
    const backendUrl = `${apiBase.replace(/\/$/, '')}/api/Advert/${id}/pdf`

    let response: Response
    try {
        response = await fetch(backendUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
    } catch {
        throw createError({ statusCode: 502, statusMessage: 'Błąd sieci przy wysyłaniu PDF.' })
    }

    const responseText = await response.text()
    if (!response.ok) {
        const msg = tryParseMessage(responseText) ?? `Błąd backendu: ${response.status}`
        throw createError({ statusCode: response.status, message: msg, data: { message: msg } })
    }

    try { return JSON.parse(responseText) } catch { return { url: responseText } }
})

function tryParseMessage(text: string): string | null {
    try {
        const obj = JSON.parse(text)
        return obj?.message ?? obj?.title ?? null
    } catch {
        return text.length < 200 ? text : null
    }
}
