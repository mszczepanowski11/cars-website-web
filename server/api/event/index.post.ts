export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const parts = await readMultipartFormData(event)
    if (!parts) throw createError({ statusCode: 400, statusMessage: 'No form data' })

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const MAX_SIZE = 10 * 1024 * 1024

    const formData = new FormData()
    for (const part of parts) {
        if (!part.name) continue
        if (part.filename) {
            const fileType = part.type ?? ''
            if (!allowedImageTypes.includes(fileType)) {
                throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Niedozwolony typ pliku. Dozwolone: JPG, PNG, WebP, GIF.', data: { message: 'Niedozwolony typ pliku. Dozwolone: JPG, PNG, WebP, GIF.' } })
            }
            if (part.data.length > MAX_SIZE) {
                throw createError({ statusCode: 400, statusMessage: 'Payload Too Large', message: 'Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.', data: { message: 'Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.' } })
            }
            const blob = new Blob([part.data], { type: fileType })
            formData.append(part.name, blob, part.filename)
        } else {
            formData.append(part.name, part.data.toString())
        }
    }

    const response = await fetch(`${config.public.apiBase}api/Event`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })

    if (!response.ok) throw createError({ statusCode: response.status, statusMessage: await response.text() })
    return response.json()
})
