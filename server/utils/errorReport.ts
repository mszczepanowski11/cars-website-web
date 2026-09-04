/**
 * Jedno miejsce, przez ktore przechodzi kazde zgloszenie awarii.
 *
 * DLACZEGO TO ISTNIEJE
 * Do tej pory o awarii na produkcji dowiadywalismy sie wtedy, gdy ktos przyslal
 * zrzut ekranu. Dokladnie tak zaczela sie ta sesja: strona ogloszenia byla martwa,
 * a serwis nie mial o tym pojecia. Budowanie tego nie wykrywa - blad istnieje
 * dopiero w przegladarce uzytkownika.
 *
 * CO TO NIE JEST
 * To nie jest Sentry. Nie ma tu odwzorowania stosu na zrodla, wersji wydania,
 * grupowania ani interfejsu. Jest jedna rzecz, ktorej naprawde brakowalo:
 * awaria trafia do logow serwera, a gdy ustawiono `ERROR_WEBHOOK_URL` - takze
 * na Twoj kanal. Pelne Sentry to jedna komenda wiecej i okolo 35 kB w paczce
 * wysylanej do KAZDEJ przegladarki; ta wersja kosztuje okolo kilobajta.
 */

/** Ile zgloszen na minute przepuszczamy. Awaria w petli renderowania potrafi wyprodukowac tysiace. */
const LIMIT_NA_MINUTE = 30
/** Jak dlugo pamietamy, ze taki sam blad juz zglosilismy. */
const OKNO_POWTORZEN_MS = 10 * 60 * 1000

let okno = { start: 0, ile: 0 }
const juzZgloszone = new Map<string, number>()

export interface ZgloszenieAwarii {
    /** 'client' - przegladarka, 'server' - renderowanie po stronie serwera. */
    kind: 'client' | 'server'
    message: string
    stack?: string
    url?: string
    userAgent?: string
}

/** Przycina i czysci tekst - do logu nie moze trafic megabajt ani znaki sterujace. */
function skroc(v: unknown, max: number): string {
    return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
}

/**
 * Odsiewa halas, ktory nie jest awaria serwisu:
 *  - "Script error." bez stosu to blad ze skryptu z innej domeny (wtyczka przegladarki,
 *    skrypt reklamowy) - przegladarka nie zdradza nic wiecej i nic z tym nie zrobimy,
 *  - "ResizeObserver loop..." to znane, nieszkodliwe ostrzezenie silnika.
 */
function toHalas(z: ZgloszenieAwarii): boolean {
    const m = z.message
    if (!m) return true
    if (/^Script error\.?$/i.test(m) && !z.stack) return true
    if (/ResizeObserver loop/i.test(m)) return true
    return false
}

export async function zglosAwarie(z: ZgloszenieAwarii, webhookUrl: string): Promise<'ok' | 'halas' | 'powtorka' | 'limit'> {
    const wpis: ZgloszenieAwarii = {
        kind: z.kind,
        message: skroc(z.message, 300),
        stack: z.stack ? skroc(z.stack, 1500) : undefined,
        url: skroc(z.url, 300),
        userAgent: skroc(z.userAgent, 200),
    }
    if (toHalas(wpis)) return 'halas'

    const teraz = Date.now()

    // Ten sam blad z tej samej strony zglaszamy raz na dziesiec minut. Bez tego
    // jedna zepsuta podstrona zasypuje kanal setkami identycznych wiadomosci
    // i przestaje sie go czytac - czyli monitoring przestaje dzialac.
    const klucz = `${wpis.kind}|${wpis.message}|${wpis.url}`
    const ostatnio = juzZgloszone.get(klucz)
    if (ostatnio && teraz - ostatnio < OKNO_POWTORZEN_MS) return 'powtorka'
    juzZgloszone.set(klucz, teraz)
    if (juzZgloszone.size > 500) {
        for (const [k, t] of juzZgloszone) if (teraz - t > OKNO_POWTORZEN_MS) juzZgloszone.delete(k)
    }

    if (teraz - okno.start > 60_000) okno = { start: teraz, ile: 0 }
    if (okno.ile >= LIMIT_NA_MINUTE) return 'limit'
    okno.ile++

    // Log leci zawsze - Railway go zbiera, wiec dziala nawet bez webhooka.
    console.error('[awaria]', JSON.stringify(wpis))

    if (webhookUrl) {
        const tresc = [
            `AWARIA (${wpis.kind}) na carizo`,
            wpis.message,
            wpis.url ? `strona: ${wpis.url}` : '',
            wpis.userAgent ? `przegladarka: ${wpis.userAgent}` : '',
            wpis.stack ? `\n${wpis.stack.slice(0, 600)}` : '',
        ].filter(Boolean).join('\n')

        // Cokolwiek pojdzie nie tak z samym powiadamianiem, NIE moze wywrocic
        // zadania, w ktorym powstal pierwotny blad.
        try {
            await $fetch(webhookUrl, {
                method: 'POST',
                body: { content: tresc.slice(0, 1800), text: tresc.slice(0, 1800) },
                timeout: 4000,
            })
        } catch { /* kanal powiadomien nie dziala - log i tak zostal */ }
    }

    return 'ok'
}
