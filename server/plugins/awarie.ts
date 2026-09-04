/**
 * Awarie po stronie SERWERA - czyli te, ktore uzytkownik widzi jako pusta strone
 * albo komunikat „Coś poszło nie tak", zanim jeszcze cokolwiek sie u niego wykona.
 *
 * Nitro wola ten hook dla kazdego nieobsluzonego bledu w trakcie obslugi zadania.
 */
import { zglosAwarie } from '../utils/errorReport'

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('error', async (error, { event }) => {
        const status = (error as { statusCode?: number })?.statusCode ?? 500
        // 404 i inne odpowiedzi z zakresu 4xx to normalny ruch (boty, stare linki),
        // a nie awaria serwisu. Zglaszamy tylko to, co jest wina serwera.
        if (status < 500) return

        await zglosAwarie({
            kind: 'server',
            message: (error as Error)?.message ?? String(error),
            stack: (error as Error)?.stack,
            url: event?.path,
            userAgent: event ? getRequestHeader(event, 'user-agent') : undefined,
        }, useRuntimeConfig().errorWebhookUrl as string)
    })
})
