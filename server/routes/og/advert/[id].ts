import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
// Safe margins around the car photo(s) (spec: 40-60px on every edge).
const MARGIN_X = 60
const MARGIN_TOP = 50
const MARGIN_BOTTOM = 50
const COLLAGE_GAP = 8
const BRAND_RED = '#8B0D1D'
const FONT_STACK = "Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif"

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Tile positions (relative to the collage box's own top-left) for 2-4 photos. One big tile plus
// smaller ones for 3, an even grid for 2/4 - the common photo-collage patterns.
function gridLayout(n: number, boxW: number, boxH: number, gap: number) {
    if (n === 2) {
        const w = (boxW - gap) / 2
        return [
            { x: 0, y: 0, w, h: boxH },
            { x: w + gap, y: 0, w, h: boxH },
        ]
    }
    if (n === 3) {
        const bigW = (boxW - gap) * 0.6
        const smallW = boxW - gap - bigW
        const smallH = (boxH - gap) / 2
        return [
            { x: 0, y: 0, w: bigW, h: boxH },
            { x: bigW + gap, y: 0, w: smallW, h: smallH },
            { x: bigW + gap, y: smallH + gap, w: smallW, h: smallH },
        ]
    }
    // n === 4
    const w = (boxW - gap) / 2
    const h = (boxH - gap) / 2
    return [
        { x: 0, y: 0, w, h },
        { x: w + gap, y: 0, w, h },
        { x: 0, y: h + gap, w, h },
        { x: w + gap, y: h + gap, w, h },
    ]
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = event.context.params?.id ?? ''
    const apiBase = config.public.apiBase.replace(/\/$/, '')

    // Redirect (not fetch-and-re-serve) to the static fallback - a self-referencing HTTP
    // fetch from within this same server to its own public URL is fragile in production
    // (hairpin routing, cold-start timing), and must never be the thing standing between
    // a failure here and getting SOME image back to the crawler.
    function fallbackRedirect() {
        return sendRedirect(event, '/og-image.jpg', 302)
    }

    try {
        const advert = await $fetch<any>(`${apiBase}/api/Advert/${id}`)
        const title = [advert.year, advert.brand?.name, advert.model?.name].filter(Boolean).join(' ')
        const priceNum = typeof advert.price === 'number' ? advert.price : null
        const priceText = priceNum !== null
            ? `${priceNum.toLocaleString('pl-PL')} ${!advert.currency || advert.currency === 'PLN' ? 'zł' : advert.currency}`
            : ''

        // Main image first, then whatever else exists - up to 4 total for the collage.
        const imageUrls: string[] = Array.from(new Set(
            [...(advert.images ?? [])]
                .sort((a: any, b: any) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0))
                .map((i: any) => i.url)
                .filter(Boolean)
        )).slice(0, 4)

        if (imageUrls.length === 0) return fallbackRedirect()

        const mainRes = await fetch(imageUrls[0])
        if (!mainRes.ok) return fallbackRedirect()
        const mainBuffer = Buffer.from(await mainRes.arrayBuffer())

        // Full-bleed blurred/darkened backdrop from the main photo, cropped to fill the whole
        // frame. This is what shows around (and through the bottom text gradient over) the
        // photo(s) below - so there's never a plain color bar, and it's still cropped from a
        // real advert photo rather than a generic fill color.
        const backdrop = await sharp(mainBuffer)
            .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
            .modulate({ brightness: 0.5 })
            .blur(30)
            .toBuffer()

        // Extra photos for the collage are best-effort - one failing to fetch just drops it from
        // the grid instead of aborting the whole card.
        const extraBuffers: Buffer[] = []
        for (const url of imageUrls.slice(1)) {
            try {
                const r = await fetch(url)
                if (r.ok) extraBuffers.push(Buffer.from(await r.arrayBuffer()))
            } catch { /* skip this photo */ }
        }
        const photoBuffers = [mainBuffer, ...extraBuffers]

        const boxW = WIDTH - MARGIN_X * 2
        const boxH = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM

        let photoLayers: sharp.OverlayOptions[]
        if (photoBuffers.length === 1) {
            // Single photo: always "contain", never "cover" - the whole vehicle is guaranteed
            // visible no matter the source photo's orientation. A portrait photo just comes out
            // smaller and centered instead of having its top/bottom cropped off.
            const carLayer = await sharp(photoBuffers[0])
                .resize(boxW, boxH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png()
                .toBuffer()
            photoLayers = [{ input: carLayer, left: MARGIN_X, top: MARGIN_TOP }]
        } else {
            // 2-4 photos: collage grid. Each tile is "cover"-fit with a thin gap between tiles -
            // some cropping per tile is the expected look for a multi-photo collage, unlike the
            // single-hero-photo case above where the whole car must stay visible.
            const cells = gridLayout(photoBuffers.length, boxW, boxH, COLLAGE_GAP)
            photoLayers = await Promise.all(cells.map(async (cell, i) => ({
                input: await sharp(photoBuffers[i])
                    .resize(Math.round(cell.w), Math.round(cell.h), { fit: 'cover', position: 'attention' })
                    .jpeg()
                    .toBuffer(),
                left: MARGIN_X + Math.round(cell.x),
                top: MARGIN_TOP + Math.round(cell.y),
            })))
        }

        const overlaySvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect x="0" y="290" width="${WIDTH}" height="${HEIGHT - 290}" fill="url(#fade)"/>
  <rect x="${WIDTH - 224}" y="24" width="204" height="56" rx="10" fill="rgba(0,0,0,0.55)"/>
  <text x="${WIDTH - 122}" y="60" text-anchor="middle" font-family="${FONT_STACK}" font-size="28" font-weight="700" letter-spacing="1" fill="#FFFFFF">CARIZO</text>
  ${title ? `<text x="56" y="${HEIGHT - 96}" font-family="${FONT_STACK}" font-size="46" font-weight="700" fill="#FFFFFF">${escapeXml(title)}</text>` : ''}
  ${priceText ? `<text x="56" y="${HEIGHT - 40}" font-family="${FONT_STACK}" font-size="60" font-weight="800" fill="${BRAND_RED}">${escapeXml(priceText)}</text>` : ''}
</svg>`

        const jpeg = await sharp(backdrop)
            .composite([
                ...photoLayers,
                { input: Buffer.from(overlaySvg) },
            ])
            .jpeg({ quality: 88 })
            .toBuffer()

        setHeader(event, 'Content-Type', 'image/jpeg')
        setHeader(event, 'Cache-Control', 'public, max-age=3600')
        return jpeg
    } catch (err) {
        console.error(`[og/advert/${id}] card generation failed:`, err)
        return fallbackRedirect()
    }
})
