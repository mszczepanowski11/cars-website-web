import sharp from 'sharp'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    const parts = await readMultipartFormData(event)
    const filePart = parts?.find(p => p.name === 'file')
    if (!filePart) throw createError({ statusCode: 400, statusMessage: 'No file provided' })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const fileType = filePart.type ?? ''
    if (!allowedTypes.includes(fileType)) {
        throw createError({ statusCode: 400, statusMessage: 'Niedozwolony typ pliku. Dozwolone: JPG, PNG, WebP, GIF.' })
    }
    const MAX_SIZE = 10 * 1024 * 1024
    if (filePart.data.length > MAX_SIZE) {
        throw createError({ statusCode: 400, statusMessage: 'Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.' })
    }

    // Apply CARIZO watermark server-side
    const watermarkedBuffer = await applyWatermark(filePart.data)

    const formData = new FormData()
    const blob = new Blob([watermarkedBuffer], { type: 'image/jpeg' })
    formData.append('file', blob, (filePart.filename ?? 'image').replace(/\.[^.]+$/, '.jpg'))

    const response = await fetch(`${config.public.apiBase}api/Advert/${id}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    })

    if (!response.ok) throw createError({ statusCode: response.status, statusMessage: await response.text() })

    return response.json()
})

async function applyWatermark(inputBuffer: Buffer): Promise<Buffer> {
    const image = sharp(inputBuffer)
    const meta = await image.metadata()
    const w = meta.width ?? 800
    const h = meta.height ?? 600

    const fontSize = Math.max(14, Math.round(w * 0.032))
    const pad = Math.round(w * 0.018)
    // Approximate text width: ~0.6 * fontSize per char for bold Inter
    const textWidth = Math.round(fontSize * 0.6 * 6) // "CARIZO" = 6 chars
    const textHeight = fontSize

    const svgWatermark = Buffer.from(`
        <svg width="${textWidth + pad * 2}" height="${textHeight + pad * 2}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.8)" flood-opacity="1"/>
                </filter>
            </defs>
            <text
                x="${pad}"
                y="${textHeight}"
                font-family="Arial, sans-serif"
                font-size="${fontSize}"
                font-weight="bold"
                fill="rgba(255,255,255,0.62)"
                filter="url(#shadow)"
            >CARIZO</text>
        </svg>
    `)

    return image
        .resize({ width: Math.min(w, 1920), withoutEnlargement: true })
        .composite([{
            input: svgWatermark,
            gravity: 'southeast',
        }])
        .jpeg({ quality: 85 })
        .toBuffer()
}
