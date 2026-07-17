const MAX_DIMENSION = 2000

export default defineEventHandler(async (event) => {
    const path = event.context.params?.path ?? ''
    // Reverse the "photos" alias applied in useImageUrl.ts back to the real Cloudinary
    // public_id segment ("adverts") before reconstructing the fetchable URL.
    const realPath = path.replace('/photos/', '/adverts/')

    // Cloudinary transformations go right after "/image/upload/" in the URL. Requesting an
    // already-resized/re-encoded asset from Cloudinary's own CDN is far cheaper than always
    // proxying the full-size original, both for our egress and for the client's download size.
    const query = getQuery(event)
    const width = Math.min(parseInt(String(query.w ?? ''), 10) || 0, MAX_DIMENSION)
    const quality = String(query.q ?? 'auto')
    const format = String(query.f ?? 'auto')
    const transformParts = ['f_' + format, 'q_' + quality, 'c_limit']
    if (width > 0) transformParts.push('w_' + width)
    const transform = transformParts.join(',')

    const uploadMarker = '/image/upload/'
    const uploadIdx = realPath.indexOf(uploadMarker)
    const cloudinaryPath = uploadIdx === -1
        ? realPath
        : realPath.slice(0, uploadIdx + uploadMarker.length) + transform + '/' + realPath.slice(uploadIdx + uploadMarker.length)
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudinaryPath}`

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
