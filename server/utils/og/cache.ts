import { buildAdCardData } from './data'
import { renderAdCard } from './render'
import { resolveFormat } from './formats'
import { cloudinaryExists, cloudinaryUpload } from './cloudinary'

// Returns a URL for this advert's ad-card in the given format, generating (and persisting to
// Cloudinary) a fresh one only when needed. The public_id embeds advert.updatedAt, so editing
// an advert automatically invalidates the old cached card - no webhook between the .NET API and
// this server is needed, "po zapisaniu lub edycji ogłoszenia" regeneration falls out for free
// the next time anything (a crawler, a share button) requests the card.
export async function getOrRenderCardUrl(advert: any, formatId: string | undefined, siteUrl: string): Promise<{ url: string; persisted: boolean }> {
    const format = resolveFormat(formatId)
    const data = buildAdCardData(advert, siteUrl)

    const versionTag = advert.updatedAt ? new Date(advert.updatedAt).getTime() : (advert.createdAt ? new Date(advert.createdAt).getTime() : 0)
    const publicId = `og-cards/${format.id}/advert-${advert.id}-${versionTag}`

    const cached = await cloudinaryExists(publicId)
    if (cached) return { url: cached, persisted: true }

    const buffer = await renderAdCard(data, format)
    const uploaded = await cloudinaryUpload(buffer, publicId)
    if (uploaded) return { url: uploaded, persisted: true }

    // Cloudinary not configured (e.g. local dev) or upload failed - caller falls back to
    // streaming the freshly rendered buffer directly instead of a redirect.
    return { url: '', persisted: false }
}
