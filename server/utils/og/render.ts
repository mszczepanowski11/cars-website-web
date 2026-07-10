import sharp from 'sharp'
import type { AdCardData } from './data'
import type { CardFormat } from './formats'
import { ICON_ENGINE, ICON_SPEED, ICON_DRIVETRAIN, ICON_GLOBE, arrowGlyph } from './icons'

const BRAND_RED = '#8B0D1D'
const RED_BRIGHT = '#C81E33' // slightly lifted red for small accents/dividers that need to read on a dark photo
const FONT_STACK = "Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif"

function escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Rough advance width for bold uppercase Arial/Liberation Sans at a given font-size + tracking -
// good enough to size the CTA button/arrow so they never overlap, without needing a real text
// shaper at generation time.
function estimateTextWidth(text: string, fontSize: number, letterSpacing = 0): number {
    return text.length * fontSize * 0.62 + Math.max(0, text.length - 1) * letterSpacing
}

const CTA_LABEL = 'ZOBACZ OFERTĘ'

interface SpecColumn { icon: string; value: string; label: string }

interface Layout {
    photoBox: { x: number; y: number; w: number; h: number }
    topFade: { y0: number; y1: number } | null
    bottomFade: { y0: number; y1: number }
    logoY: number
    logoFontSize: number
    domainY: number
    domainFontSize: number
    headline: { lines: string[]; x: number; startY: number; lineHeight: number; fontSize: number; underlineY: number }
    modelTwoLine: boolean
    infoTopY: number // baseline of the year/spec-label row
    modelY: number[] // 1 or 2 baselines for brand/model
    modelFontSize: number
    specColX: number[] // 3 x-positions
    specIconY: number
    specIconSize: number
    specValueY: number
    specLabelY: number
    priceX: number
    priceAnchor: 'start' | 'end'
    dividerXs: [number, number] // vertical dividers flanking the spec columns
    fullDividerY: number
    ctaBox: { x: number; y: number; w: number; h: number }
    bottomRightY: number
}

// Reserves a solid black header band for the logo+headline (never sits on top of the photo, so
// it's always legible regardless of how bright/busy the source photo is) and confines the photo
// to the remaining band - ~73% of the frame height, matching the "70-80% duże zdjęcie" spec
// instead of the old 100% full-bleed treatment.
function wideLayout(w: number, h: number): Layout {
    const mx = 64
    const headerH = 170
    return {
        photoBox: { x: 0, y: headerH, w, h: h - headerH },
        topFade: null,
        bottomFade: { y0: h - 260, y1: h },
        logoY: 50,
        logoFontSize: 24,
        domainY: 48,
        domainFontSize: 14,
        headline: { lines: ['SAMOCHÓD DNIA.'], x: mx, startY: 130, lineHeight: 0, fontSize: 42, underlineY: 146 },
        modelTwoLine: false,
        infoTopY: h - 128,
        modelY: [h - 92],
        modelFontSize: 30,
        specColX: [mx + 390, mx + 520, mx + 650],
        specIconY: h - 150,
        specIconSize: 22,
        specValueY: h - 100,
        specLabelY: h - 78,
        priceX: w - mx,
        priceAnchor: 'end',
        dividerXs: [mx + 360, mx + 780],
        fullDividerY: h - 60,
        ctaBox: { x: mx, y: h - 46, w: 200, h: 40 },
        bottomRightY: h - 22,
    }
}

function squareLayout(w: number, h: number): Layout {
    const mx = 64
    const photoY = Math.round(h * 0.34)
    return {
        photoBox: { x: 0, y: photoY, w, h: h - photoY },
        topFade: null,
        bottomFade: { y0: h - 260, y1: h },
        logoY: 96,
        logoFontSize: 34,
        domainY: 94,
        domainFontSize: 17,
        headline: { lines: ['SAMOCHÓD', 'DNIA.'], x: mx, startY: 200, lineHeight: 80, fontSize: 72, underlineY: 362 },
        modelTwoLine: true,
        infoTopY: h - 190,
        modelY: [h - 150, h - 105],
        modelFontSize: 38,
        specColX: [mx + 370, mx + 500, mx + 630],
        specIconY: h - 178,
        specIconSize: 24,
        specValueY: h - 120,
        specLabelY: h - 96,
        priceX: w - mx,
        priceAnchor: 'end',
        dividerXs: [mx + 340, mx + 760],
        fullDividerY: h - 70,
        ctaBox: { x: mx, y: h - 58, w: 250, h: 46 },
        bottomRightY: h - 30,
    }
}

// Shares its bottom info-bar geometry verbatim with squareLayout (both are 1080 wide) - only
// the photo band and headline placement differ for the taller 9:16 canvas.
function tallLayout(w: number, h: number): Layout {
    const mx = 64
    const photoY = Math.round(h * 0.24)
    const photoH = Math.round(h * 0.62)
    return {
        photoBox: { x: 0, y: photoY, w, h: photoH },
        topFade: null,
        bottomFade: { y0: h - 260, y1: h },
        logoY: 100,
        logoFontSize: 34,
        domainY: 98,
        domainFontSize: 17,
        headline: { lines: ['SAMOCHÓD', 'DNIA.'], x: mx, startY: 200, lineHeight: 80, fontSize: 72, underlineY: 360 },
        modelTwoLine: true,
        infoTopY: h - 190,
        modelY: [h - 150, h - 105],
        modelFontSize: 38,
        specColX: [mx + 370, mx + 500, mx + 630],
        specIconY: h - 178,
        specIconSize: 24,
        specValueY: h - 120,
        specLabelY: h - 96,
        priceX: w - mx,
        priceAnchor: 'end',
        dividerXs: [mx + 340, mx + 760],
        fullDividerY: h - 70,
        ctaBox: { x: mx, y: h - 58, w: 250, h: 46 },
        bottomRightY: h - 30,
    }
}

function layoutFor(format: CardFormat): Layout {
    if (format.layout === 'square') return squareLayout(format.width, format.height)
    if (format.layout === 'tall') return tallLayout(format.width, format.height)
    return wideLayout(format.width, format.height)
}

function iconGroup(svg: string, x: number, y: number, size: number): string {
    return `<g transform="translate(${x - size / 2},${y - size / 2}) scale(${size / 24})">${svg}</g>`
}

function buildOverlaySvg(data: AdCardData, format: CardFormat): string {
    const { width: W, height: H } = format
    const L = layoutFor(format)

    const specs: SpecColumn[] = [
        { icon: ICON_ENGINE, value: data.engineLabel ?? '—', label: 'SILNIK' },
        { icon: ICON_SPEED, value: data.powerLabel ?? '—', label: 'MOC' },
        { icon: ICON_DRIVETRAIN, value: data.driveLabel ?? '—', label: 'NAPĘD' },
    ]

    const headlineSvg = L.headline.lines.map((line, i) => {
        const y = L.headline.startY + i * L.headline.lineHeight
        const isLast = i === L.headline.lines.length - 1
        // Trailing period rendered in brand red, matching the reference's accent treatment.
        const body = isLast && line.endsWith('.') ? line.slice(0, -1) : line
        const dot = isLast && line.endsWith('.') ? `<tspan fill="${RED_BRIGHT}">.</tspan>` : ''
        return `<text x="${L.headline.x}" y="${y}" font-family="${FONT_STACK}" font-size="${L.headline.fontSize}" font-weight="800" fill="#FFFFFF">${escapeXml(body)}${dot}</text>`
    }).join('\n')

    const modelLines: string[] = L.modelTwoLine
        ? (data.brand && data.model ? [data.brand, data.model] : [data.brand || data.model || ''])
        : [[data.brand, data.model].filter(Boolean).join(' ')]
    const modelSvg = L.modelY.map((y, i) => modelLines[i]
        ? `<text x="64" y="${y}" font-family="${FONT_STACK}" font-size="${L.modelFontSize}" font-weight="800" fill="#FFFFFF">${escapeXml(modelLines[i].toUpperCase())}</text>`
        : '').join('\n')

    const specsSvg = specs.map((s, i) => {
        const x = L.specColX[i]
        return `
      ${iconGroup(s.icon, x, L.specIconY, L.specIconSize)}
      <text x="${x}" y="${L.specValueY}" text-anchor="middle" font-family="${FONT_STACK}" font-size="21" font-weight="800" fill="#FFFFFF">${escapeXml(s.value)}</text>
      <text x="${x}" y="${L.specLabelY}" text-anchor="middle" font-family="${FONT_STACK}" font-size="11" font-weight="700" letter-spacing="1.5" fill="#9a9a9a">${s.label}</text>`
    }).join('\n')

    const dividers = L.dividerXs[0] > 0
        ? `<line x1="${L.dividerXs[0]}" y1="${L.infoTopY - 10}" x2="${L.dividerXs[0]}" y2="${L.specLabelY + 6}" stroke="#3a3a3a" stroke-width="1.5"/>
           <line x1="${L.dividerXs[1]}" y1="${L.infoTopY - 10}" x2="${L.dividerXs[1]}" y2="${L.specLabelY + 6}" stroke="#3a3a3a" stroke-width="1.5"/>`
        : ''

    // Size the button around the actual label so the arrow never overlaps the text, whichever
    // layout's font size/padding this is - see estimateTextWidth.
    const ctaFontSize = 14
    const ctaPadLeft = 22
    const ctaGap = 14
    const ctaArrowSize = 16
    const ctaPadRight = 20
    const ctaTextW = estimateTextWidth(CTA_LABEL, ctaFontSize, 1)
    const ctaBoxW = Math.max(L.ctaBox.w, ctaPadLeft + ctaTextW + ctaGap + ctaArrowSize + ctaPadRight)
    const ctaBox = { x: L.ctaBox.x, y: L.ctaBox.y, w: ctaBoxW, h: L.ctaBox.h }
    const arrowX = ctaBox.x + ctaPadLeft + ctaTextW + ctaGap
    const arrowY = ctaBox.y + ctaBox.h / 2

    return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.92"/>
    </linearGradient>
  </defs>

  ${L.topFade ? `<rect x="0" y="${L.topFade.y0}" width="${W}" height="${L.topFade.y1 - L.topFade.y0}" fill="url(#topFade)"/>` : ''}
  <rect x="0" y="${L.bottomFade.y0}" width="${W}" height="${L.bottomFade.y1 - L.bottomFade.y0}" fill="url(#bottomFade)"/>

  <text x="64" y="${L.logoY}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="${L.logoFontSize}" font-weight="200" letter-spacing="2" fill="#FFFFFF">CARI<tspan fill="${BRAND_RED}">Z</tspan>O</text>

  <line x1="${W - 64 - 168}" y1="${L.domainY - 10}" x2="${W - 64 - 158}" y2="${L.domainY + 4}" stroke="${RED_BRIGHT}" stroke-width="2.5"/>
  <text x="${W - 64}" y="${L.domainY}" text-anchor="end" font-family="${FONT_STACK}" font-size="${L.domainFontSize}" font-weight="700" letter-spacing="2.5" fill="#FFFFFF">CARIZO.EU</text>

  ${headlineSvg}
  <rect x="${L.headline.x}" y="${L.headline.underlineY}" width="90" height="4" fill="${RED_BRIGHT}"/>

  <text x="64" y="${L.infoTopY}" font-family="${FONT_STACK}" font-size="15" font-weight="700" letter-spacing="1" fill="${RED_BRIGHT}">${escapeXml(data.year)}</text>
  ${modelSvg}

  ${dividers}
  ${specsSvg}

  <text x="${L.priceX}" y="${L.infoTopY}" text-anchor="${L.priceAnchor}" font-family="${FONT_STACK}" font-size="15" font-weight="700" letter-spacing="1" fill="${RED_BRIGHT}">CENA</text>
  ${data.priceText ? `<text x="${L.priceX}" y="${L.modelY[L.modelY.length - 1]}" text-anchor="${L.priceAnchor}" font-family="${FONT_STACK}" font-size="${Math.round(L.modelFontSize * 1.05)}" font-weight="800" fill="#FFFFFF">${escapeXml(data.priceText)}</text>` : ''}

  <line x1="64" y1="${L.fullDividerY}" x2="${W - 64}" y2="${L.fullDividerY}" stroke="#333333" stroke-width="1.5"/>

  <rect x="${ctaBox.x}" y="${ctaBox.y}" width="${ctaBox.w}" height="${ctaBox.h}" rx="6" fill="none" stroke="${RED_BRIGHT}" stroke-width="1.5"/>
  <text x="${ctaBox.x + ctaPadLeft}" y="${ctaBox.y + ctaBox.h / 2 + 5}" font-family="${FONT_STACK}" font-size="${ctaFontSize}" font-weight="700" letter-spacing="1" fill="#FFFFFF">${CTA_LABEL}</text>
  ${arrowGlyph(arrowX, arrowY, ctaArrowSize, '#FFFFFF')}

  ${iconGroup(ICON_GLOBE, W - 64 - 100, L.bottomRightY, 18)}
  <text x="${W - 64 - 82}" y="${L.bottomRightY + 5}" font-family="${FONT_STACK}" font-size="14" font-weight="700" letter-spacing="1" fill="#cfcfcf">CARIZO.EU</text>
</svg>`
}

// Renders one premium "ad card" for the given advert data + output format. The whole car is
// always kept fully in frame - "automatyczne przycięcie zdjęcia bez deformacji" means never
// cropping into the vehicle, not just never stretching it - via a contain-fit foreground over a
// cover-fit blurred/darkened backdrop of the same photo, so the photo band is still filled
// edge-to-edge without ugly letterbox bars.
export async function renderAdCard(data: AdCardData, format: CardFormat): Promise<Buffer> {
    const L = layoutFor(format)
    const base = sharp({
        create: { width: format.width, height: format.height, channels: 3, background: '#050505' },
    })

    const layers: sharp.OverlayOptions[] = []

    if (data.photoUrl) {
        try {
            const res = await fetch(data.photoUrl)
            if (res.ok) {
                const buf = Buffer.from(await res.arrayBuffer())
                const { w: pw, h: ph } = L.photoBox
                const backdrop = await sharp(buf)
                    .resize(pw, ph, { fit: 'cover', position: 'attention' })
                    .modulate({ brightness: 0.45 })
                    .blur(28)
                    .toBuffer()
                const foreground = await sharp(buf)
                    .resize(pw, ph, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .png()
                    .toBuffer()
                const photo = await sharp(backdrop)
                    .composite([{ input: foreground }])
                    .jpeg()
                    .toBuffer()
                layers.push({ input: photo, left: L.photoBox.x, top: L.photoBox.y })
            }
        } catch (err) {
            console.error('[og/render] photo fetch failed:', err)
        }
    }

    layers.push({ input: Buffer.from(buildOverlaySvg(data, format)) })

    return base.composite(layers).jpeg({ quality: 92 }).toBuffer()
}
