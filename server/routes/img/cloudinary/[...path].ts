export default defineEventHandler(async (event) => {
    const path = event.context.params?.path ?? ''
    // Reverse the "photos" alias applied in useImageUrl.ts back to the real Cloudinary
    // public_id segment ("adverts") before reconstructing the fetchable URL.
    const realPath = path.replace('/photos/', '/adverts/')
    const cloudinaryUrl = `https://res.cloudinary.com/${realPath}`

    const response = await fetch(cloudinaryUrl)
    if (!response.ok) {
        throw createError({ statusCode: response.status, statusMessage: 'Image not found' })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
    return Buffer.from(buffer)
})
