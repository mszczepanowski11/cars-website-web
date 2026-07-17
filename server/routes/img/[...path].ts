const MAX_DIMENSION = 2000
const ALLOWED_FORMATS = new Set(['webp', 'avif', 'jpeg', 'png'])

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const path = event.context.params?.path ?? ''
    // /img/photos/ is an alias for /uploads/adverts/ — "adverts" in URL path triggers ad blockers
    const uploadPath = path.startsWith('photos/') ? 'adverts/' + path.slice('photos/'.length) : path
    const backendUrl = `${config.public.apiBase.replace(/\/$/, '')}/uploads/${uploadPath}`

    const response = await fetch(backendUrl)
    if (!response.ok) {
        throw createError({ statusCode: response.status, statusMessage: 'Image not found' })
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'

    // Locally-uploaded images have no CDN to transform them, so resizing/re-encoding happens
    // here with sharp - same query-param contract (w/q/f) as the Cloudinary proxy route.
    const query = getQuery(event)
    const width = Math.min(parseInt(String(query.w ?? ''), 10) || 0, MAX_DIMENSION)
    const format = String(query.f ?? '')
    if (width > 0 || ALLOWED_FORMATS.has(format)) {
        try {
            const sharp = (await import('sharp')).default
            let img = sharp(buffer)
            if (width > 0) img = img.resize({ width, withoutEnlargement: true })
            if (ALLOWED_FORMATS.has(format)) img = img.toFormat(format as 'webp' | 'avif' | 'jpeg' | 'png')
            const transformed = await img.toBuffer()
            setHeader(event, 'Content-Type', ALLOWED_FORMATS.has(format) ? `image/${format}` : contentType)
            setHeader(event, 'Cache-Control', 'public, max-age=86400')
            return transformed
        } catch {
            // Fall through and serve the untransformed original rather than erroring the request.
        }
    }

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
    return buffer
})
