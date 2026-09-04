/**
 * Wysyla do serwera awarie, ktore zdarzaja sie w przegladarce uzytkownika.
 *
 * DLACZEGO WLASNIE TO
 * Obie awarie, ktore w tym projekcie dojechaly na produkcje, byly niewidoczne dla
 * budowania: nierozwiazany auto-import i odczyt `.length` z wartosci `undefined`.
 * Jedna i druga wywracala strone dopiero w przegladarce. Dowiadywalismy sie o nich
 * ze zrzutu ekranu od uzytkownika - czyli wtedy, gdy juz kogos dotknely.
 *
 * ZASADY, KTORE MAJA ZNACZENIE
 *  - dziala tylko na produkcji; w trybie deweloperskim blad i tak jest w konsoli,
 *  - najwyzej piec zgloszen na jedno wejscie na strone. Blad w petli renderowania
 *    potrafi wystrzelic tysiace razy w sekunde i sam w sobie zamulilby przegladarke,
 *  - to samo zgloszenie leci raz,
 *  - wysylka NIGDY nie rzuca. Zglaszanie awarii, ktore samo wywoluje awarie,
 *    jest gorsze niz brak zglaszania.
 */
export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.dev) return

    const MAKS_NA_STRONE = 5
    let wyslane = 0
    const widziane = new Set<string>()

    function zglos(message: unknown, stack?: string) {
        try {
            if (wyslane >= MAKS_NA_STRONE) return
            const tresc = String(message ?? '').slice(0, 300)
            if (!tresc) return
            const klucz = tresc + '|' + (stack ?? '').slice(0, 120)
            if (widziane.has(klucz)) return
            widziane.add(klucz)
            wyslane++

            // `keepalive` sprawia, ze zgloszenie dojdzie takze wtedy, gdy uzytkownik
            // zamknie karte w reakcji na to, ze strona sie wywrocila - a to jest
            // najczestsza reakcja i wlasnie te przypadki chcemy widziec.
            fetch('/api/_awaria', {
                method: 'POST',
                keepalive: true,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ message: tresc, stack: stack?.slice(0, 1500), url: location.href }),
            }).catch(() => { /* brak sieci - trudno */ })
        } catch { /* zglaszanie nie moze wywrocic strony */ }
    }

    // Blad w komponencie: Vue lapie go sam i nie dopuszcza do `window.onerror`.
    nuxtApp.hook('vue:error', (err) => {
        zglos((err as Error)?.message ?? err, (err as Error)?.stack)
    })

    window.addEventListener('error', (e) => {
        zglos(e.message, e.error?.stack)
    })

    // Odrzucona obietnica bez `catch` - typowo nieudane zapytanie do API,
    // po ktorym widok zostaje w polowie wypelniony.
    window.addEventListener('unhandledrejection', (e) => {
        const r = e.reason
        zglos(r?.message ?? r, r?.stack)
    })
})
