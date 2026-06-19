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

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
    return Buffer.from(buffer)
})
