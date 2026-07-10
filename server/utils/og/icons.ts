// Small line-style icon glyphs used in the spec row, all drawn on a 24x24 grid and positioned
// by the caller via a wrapping <g transform="translate(...) scale(...)">. Hand-drawn with basic
// shapes (no external icon font/library dependency) so rendering never depends on font glyph
// coverage inside the sandboxed server SVG->raster pipeline.
const STROKE = 'stroke="#FFFFFF" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"'

export const ICON_ENGINE = `
  <rect x="3" y="9" width="14" height="9" rx="1.5" ${STROKE}/>
  <path d="M6 9V6h3v3M10 9V6h3v3" ${STROKE}/>
  <path d="M17 12h3v4h-3" ${STROKE}/>
  <path d="M6.5 18v2M13.5 18v2" ${STROKE}/>
`

export const ICON_SPEED = `
  <circle cx="11" cy="12" r="8.2" ${STROKE}/>
  <path d="M11 12l4-3.4" ${STROKE}/>
  <path d="M11 6.6v1.1M5.4 12h1.1M16.5 12h1.1" ${STROKE}/>
`

export const ICON_DRIVETRAIN = `
  <circle cx="5" cy="5" r="2" ${STROKE}/>
  <circle cx="19" cy="5" r="2" ${STROKE}/>
  <circle cx="5" cy="19" r="2" ${STROKE}/>
  <circle cx="19" cy="19" r="2" ${STROKE}/>
  <path d="M7 5h10M5 7v10M19 7v10M7 19h10" ${STROKE}/>
  <circle cx="12" cy="12" r="2.3" ${STROKE}/>
`

export const ICON_GLOBE = `
  <circle cx="12" cy="12" r="8.5" ${STROKE}/>
  <path d="M3.5 12h17" ${STROKE}/>
  <path d="M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" ${STROKE}/>
`

// Small right-pointing arrow used in the CTA button, drawn separately (currentColor via the
// caller's fill/stroke) so it can be recolored to match the button's border/text color.
export function arrowGlyph(x: number, y: number, size: number, color: string): string {
    const w = size
    return `
    <line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <path d="M${x + w - w * 0.4} ${y - w * 0.4} L${x + w} ${y} L${x + w - w * 0.4} ${y + w * 0.4}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  `
}
