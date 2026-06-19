export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing advert ID' })

    const parts = await readMultipartFormData(event)
    const filePart = parts?.find(p => p.name === 'file')
    if (!filePart) throw createError({ statusCode: 400, statusMessage: 'No file provided' })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const fileType = filePart.type ?? 'application/octet-stream'
    if (!allowedTypes.includes(fileType)) {
        throw createError({ statusCode: 400, statusMessage: `Niedozwolony typ pliku: ${fileType}. Dozwolone: JPG, PNG, WebP.` })
    }
    const MAX_SIZE = 10 * 1024 * 1024
    if (filePart.data.length > MAX_SIZE) {
        throw createError({ statusCode: 400, statusMessage: 'Plik jest zbyt duży. Maksymalny rozmiar to 10 MB.' })
    }

    console.log(`[images.post] advertId=${id} file=${filePart.filename ?? 'blob'} type=${fileType} size=${filePart.data.length}B`)

    // Apply CARIZO watermark server-side; if sharp is unavailable, send original
    let outputBuffer: Buffer
    let outputMime = fileType === 'image/gif' ? 'image/gif' : 'image/jpeg'
    try {
        outputBuffer = await applyWatermark(filePart.data)
        console.log(`[images.post] watermark applied, output size=${outputBuffer.length}B`)
    } catch (sharpErr) {
        console.error('[images.post] watermark failed, using original:', sharpErr)
        try {
            const sharp = (await import('sharp')).default
            outputBuffer = await sharp(filePart.data)
                .resize({ width: 1920, withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer()
            outputMime = 'image/jpeg'
        } catch (err2) {
            console.error('[images.post] fallback resize failed, using raw buffer:', err2)
            outputBuffer = filePart.data
            outputMime = fileType
        }
    }

    // Build filename with correct extension
    const baseName = (filePart.filename ?? 'image').replace(/\.[^.]+$/, '')
    const ext = outputMime === 'image/png' ? '.png' : outputMime === 'image/gif' ? '.gif' : '.jpg'
    const outputFilename = baseName + ext

    const formData = new FormData()
    const blob = new Blob([outputBuffer], { type: outputMime })
    formData.append('file', blob, outputFilename)

    const apiBase = config.public.apiBase as string
    const backendUrl = `${apiBase.replace(/\/$/, '')}/api/Advert/${id}/images`
    console.log(`[images.post] forwarding to backend: ${backendUrl}`)

    let response: Response
    try {
        response = await fetch(backendUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
    } catch (networkErr) {
        console.error('[images.post] network error calling backend:', networkErr)
        throw createError({ statusCode: 502, statusMessage: 'Błąd sieci przy zapisywaniu zdjęcia.' })
    }

    const responseText = await response.text()
    console.log(`[images.post] backend response: status=${response.status} body=${responseText.slice(0, 200)}`)

    if (!response.ok) {
        throw createError({
            statusCode: response.status,
            statusMessage: tryParseMessage(responseText) ?? `Błąd backendu: ${response.status}`,
        })
    }

    try {
        return JSON.parse(responseText)
    } catch {
        return { url: responseText }
    }
})

function tryParseMessage(text: string): string | null {
    try {
        const obj = JSON.parse(text)
        return obj?.message ?? obj?.title ?? null
    } catch {
        return text.length < 200 ? text : null
    }
}

async function applyWatermark(inputBuffer: Buffer): Promise<Buffer> {
    const sharp = (await import('sharp')).default
    const image = sharp(inputBuffer)
    const meta = await image.metadata()
    const w = meta.width ?? 800

    const fontSize = Math.max(14, Math.round(w * 0.032))
    const pad = Math.round(w * 0.018)
    const textWidth = Math.round(fontSize * 0.6 * 6)
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
        .composite([{ input: svgWatermark, gravity: 'southeast' }])
        .jpeg({ quality: 85 })
        .toBuffer()
}
