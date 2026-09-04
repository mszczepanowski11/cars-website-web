/**
 * Punkt odbioru zgloszen awarii z przegladarki.
 *
 * Nazwa zaczyna sie od podkreslenia, zeby nie wygladala jak zasob tresci -
 * i zeby nie mylila sie z niczym, co moze trafic do mapy strony.
 */
import { zglosAwarie } from '../utils/errorReport'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ message?: string; stack?: string; url?: string }>(event).catch(() => null)
    if (!body?.message) {
        // Puste zgloszenie to nie jest blad wart odnotowania - odpowiadamy krotko.
        return { ok: false }
    }

    await zglosAwarie({
        kind: 'client',
        message: body.message,
        stack: body.stack,
        url: body.url,
        userAgent: getRequestHeader(event, 'user-agent'),
    }, useRuntimeConfig().errorWebhookUrl as string)

    // Zawsze 204: przegladarka nie ma co robic z wynikiem, a niepowodzenie
    // zgloszenia nie moze wywolac kolejnego bledu w kliencie.
    setResponseStatus(event, 204)
    return null
})
