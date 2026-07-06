import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
const BRAND_RED = '#8B0D1D'
const FONT_STACK = "Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif"

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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
        const mainImageUrl: string | undefined = advert.images?.find((i: any) => i.isMain)?.url ?? advert.images?.[0]?.url

        if (!mainImageUrl) return fallbackRedirect()

        const imgRes = await fetch(mainImageUrl)
        if (!imgRes.ok) return fallbackRedirect()
        const photoBuffer = Buffer.from(await imgRes.arrayBuffer())

        const background = await sharp(photoBuffer)
            .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
            .toBuffer()

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

        const jpeg = await sharp(background)
            .composite([{ input: Buffer.from(overlaySvg) }])
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
