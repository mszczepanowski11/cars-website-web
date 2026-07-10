// Minimal signed Cloudinary upload, kept dependency-free (no `cloudinary` npm package) since
// all we need is one signed multipart POST. Reuses the SAME CLOUDINARY_* Railway env vars as
// the .NET API (cars-website-api reads Environment.GetEnvironmentVariable("CLOUDINARY_..."))
// so both services point at the same Cloudinary account without duplicated secrets to manage.
import crypto from 'node:crypto'

interface CloudinaryConfig { cloudName: string; apiKey: string; apiSecret: string }

function getCloudinaryConfig(): CloudinaryConfig | null {
    const config = useRuntimeConfig()
    const cloudName = config.cloudinaryCloudName
    const apiKey = config.cloudinaryApiKey
    const apiSecret = config.cloudinaryApiSecret
    if (!cloudName || !apiKey || !apiSecret) return null
    return { cloudName, apiKey, apiSecret }
}

export function cloudinaryDeliveryUrl(cloudName: string, publicId: string): string {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`
}

// The public_id embeds the advert's updatedAt timestamp, so a fresh advert edit naturally
// produces a new public_id - no separate invalidation/webhook plumbing needed. A HEAD check
// against the deterministic delivery URL tells us whether that exact version was already
// rendered and cached.
export async function cloudinaryExists(publicId: string): Promise<string | null> {
    const cfg = getCloudinaryConfig()
    if (!cfg) return null
    const url = cloudinaryDeliveryUrl(cfg.cloudName, publicId)
    try {
        const res = await fetch(url, { method: 'HEAD' })
        return res.ok ? url : null
    } catch {
        return null
    }
}

export async function cloudinaryUpload(buffer: Buffer, publicId: string): Promise<string | null> {
    const cfg = getCloudinaryConfig()
    if (!cfg) return null

    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto.createHash('sha1').update(paramsToSign + cfg.apiSecret).digest('hex')

    const form = new FormData()
    form.append('file', new Blob([buffer], { type: 'image/jpeg' }), `${publicId}.jpg`)
    form.append('public_id', publicId)
    form.append('overwrite', 'true')
    form.append('timestamp', String(timestamp))
    form.append('api_key', cfg.apiKey)
    form.append('signature', signature)

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
            method: 'POST',
            body: form,
        })
        if (!res.ok) {
            console.error('[og/cloudinary] upload failed', res.status, await res.text().catch(() => ''))
            return null
        }
        const json: any = await res.json()
        return json.secure_url ?? cloudinaryDeliveryUrl(cfg.cloudName, publicId)
    } catch (err) {
        console.error('[og/cloudinary] upload error', err)
        return null
    }
}
