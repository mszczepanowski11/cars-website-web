// Shared format registry for every auto-generated advert "ad card" graphic.
// One template (render.ts) draws all of these - only width/height/layout differ.
export type CardLayout = 'wide' | 'square' | 'tall'

export interface CardFormat {
    id: string
    width: number
    height: number
    layout: CardLayout
    label: string
}

export const CARD_FORMATS: Record<string, CardFormat> = {
    'facebook-og':     { id: 'facebook-og',     width: 1200, height: 630,  layout: 'wide',   label: 'Facebook / Open Graph' },
    'linkedin':        { id: 'linkedin',        width: 1200, height: 627,  layout: 'wide',   label: 'LinkedIn' },
    'meta-ad-thumb':   { id: 'meta-ad-thumb',   width: 1200, height: 628,  layout: 'wide',   label: 'Miniatura reklam Meta' },
    'banner':          { id: 'banner',          width: 1200, height: 400,  layout: 'wide',   label: 'Baner promocyjny' },
    'instagram-post':  { id: 'instagram-post',  width: 1080, height: 1080, layout: 'square', label: 'Instagram Post' },
    'instagram-story': { id: 'instagram-story', width: 1080, height: 1920, layout: 'tall',   label: 'Instagram Story' },
    'facebook-story':  { id: 'facebook-story',  width: 1080, height: 1920, layout: 'tall',   label: 'Facebook Story' },
}

export const DEFAULT_FORMAT = 'facebook-og'

export function resolveFormat(id?: string | null): CardFormat {
    if (id && CARD_FORMATS[id]) return CARD_FORMATS[id]
    return CARD_FORMATS[DEFAULT_FORMAT]
}
