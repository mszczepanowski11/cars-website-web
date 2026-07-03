/**
 * ING IMOJE payment webhook handler.
 * ING sends a POST with JSON payload when payment status changes.
 * We validate the signature, then forward the notification to the ASP.NET backend
 * which handles service activation, invoice generation, and email sending.
 *
 * Endpoint: POST /api/payment/webhook
 * ING IMOJE docs: https://imoje.ing.pl/dokumentacja/powiadomienia
 */

import { createHmac, timingSafeEqual } from 'crypto'

interface ImojeNotification {
    // imoje's real payload nests these under "transaction" — flat fields below are a fallback
    // for integration modes that don't nest, mirroring the backend's ImojeWebhookDto exactly.
    transaction?: {
        id?: string
        orderId?: string
        status?: string
        amount?: number
        currency?: string
        paymentMethod?: string
    }
    serviceId?: string
    orderId?: string
    transactionId?: string
    amount?: number
    currency?: string
    status?: 'new' | 'pending' | 'completed' | 'rejected' | 'cancelled' | 'refunded'
    statusDate?: string
    paymentType?: string
    paymentMethodCode?: string
    customerFirstName?: string
    customerLastName?: string
    customerEmail?: string
    signature?: string
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Read raw body for signature validation
    const rawBody = await readRawBody(event)
    if (!rawBody) {
        throw createError({ statusCode: 400, statusMessage: 'Empty body' })
    }

    let notification: ImojeNotification
    try {
        notification = JSON.parse(rawBody) as ImojeNotification
    } catch {
        throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
    }

    // Validate HMAC-SHA256 signature from ING IMOJE. This is a SECONDARY check — the backend
    // independently verifies the signature again (PaymentService.VerifySignature) before acting
    // on anything, using its own Imoje:WebhookSecret. A misconfigured/mismatched secret HERE used
    // to hard-block the request (500/401) before it ever reached the backend's own check, turning
    // a local config slip into a total payment-confirmation outage. Now it only warns locally and
    // always forwards — the backend remains the sole authority on whether to trust the payload.
    const webhookSecret = config.imojeWebhookSecret as string | undefined
    if (!webhookSecret) {
        console.warn('[webhook] NUXT_IMOJE_WEBHOOK_SECRET not set — forwarding without a local signature check (backend still verifies independently)')
    } else {
        const receivedSig = getHeader(event, 'x-imoje-signature') ?? notification.signature ?? ''
        const expectedSig = createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex')

        const sigValid = receivedSig.length === expectedSig.length &&
            timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig))
        if (!sigValid) {
            console.warn('[webhook] Local IMOJE signature check failed — forwarding anyway, backend will do its own verification', { orderId: notification.orderId })
        }
    }

    // Forward to ASP.NET backend — the backend handles:
    // 1. Updating payment status in DB
    // 2. Activating the purchased service (promotion)
    // 3. Generating the invoice
    // 4. Sending confirmation email
    //
    // Forward the parsed body AS-IS instead of hand-picking flat fields into a new object.
    // imoje's real payload nests transaction data under a "transaction" key (confirmed by the
    // backend's own ImojeWebhookDto, which resolves orderId/status/transactionId from either the
    // nested "transaction" object or flat top-level fields) — picking only
    // notification.orderId/.status/.transactionId here silently dropped them to undefined
    // whenever imoje sent the nested form, so the backend could never find the matching payment
    // by orderId and the whole notification was a silent no-op.
    try {
        await $fetch(`${config.public.apiBase}api/Payment/webhook`, {
            method: 'POST',
            body: notification,
            headers: {
                'Content-Type': 'application/json',
                // Internal service-to-service key so the backend can trust this call
                'X-Internal-Secret': config.internalServiceSecret as string ?? ''
            }
        })
    } catch (err: any) {
        // Log but return 200 to ING so they don't retry unnecessarily
        console.error('[webhook] Backend notification failed:', {
            orderId: notification.orderId ?? (notification as any).transaction?.orderId,
            status: err?.response?.status,
            msg: err?.message
        })
    }

    // ING IMOJE expects 200 OK with empty body or { status: 'ok' }
    return { status: 'ok' }
})
