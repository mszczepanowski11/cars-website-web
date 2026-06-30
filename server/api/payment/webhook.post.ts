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
    serviceId: string
    orderId: string
    transactionId: string
    amount: number
    currency: string
    status: 'new' | 'pending' | 'completed' | 'rejected' | 'cancelled' | 'refunded'
    statusDate: string
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

    // Validate HMAC-SHA256 signature from ING IMOJE
    const webhookSecret = config.imojeWebhookSecret as string | undefined
    if (!webhookSecret) {
        // Secret not configured — reject in production, warn in dev
        if (process.env.NODE_ENV === 'production') {
            throw createError({ statusCode: 500, statusMessage: 'Webhook secret not configured' })
        }
        console.warn('[webhook] IMOJE_WEBHOOK_SECRET not set — skipping signature check (dev only)')
    } else {
        const receivedSig = getHeader(event, 'x-imoje-signature') ?? notification.signature ?? ''
        const expectedSig = createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex')

        const sigValid = receivedSig.length === expectedSig.length &&
            timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig))
        if (!sigValid) {
            console.warn('[webhook] IMOJE signature mismatch — possible spoofed request', { orderId: notification.orderId })
            throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
        }
    }

    // Forward to ASP.NET backend — the backend handles:
    // 1. Updating payment status in DB
    // 2. Activating the purchased service (promotion)
    // 3. Generating the invoice
    // 4. Sending confirmation email
    try {
        await $fetch(`${config.public.apiBase}api/Payment/webhook`, {
            method: 'POST',
            body: {
                transactionId: notification.transactionId,
                orderId: notification.orderId,
                amount: notification.amount,
                currency: notification.currency,
                status: notification.status,
                statusDate: notification.statusDate,
                paymentType: notification.paymentType,
                customerEmail: notification.customerEmail
            },
            headers: {
                'Content-Type': 'application/json',
                // Internal service-to-service key so the backend can trust this call
                'X-Internal-Secret': config.internalServiceSecret as string ?? ''
            }
        })
    } catch (err: any) {
        // Log but return 200 to ING so they don't retry unnecessarily
        console.error('[webhook] Backend notification failed:', {
            orderId: notification.orderId,
            status: err?.response?.status,
            msg: err?.message
        })
    }

    // ING IMOJE expects 200 OK with empty body or { status: 'ok' }
    return { status: 'ok' }
})
