/**
 * Test dymny: czy kluczowe strony w ogóle się renderują i czy mieszczą się w ekranie.
 *
 * DLACZEGO AKURAT TAKI ZAKRES
 * Ten test istnieje dlatego, że dwie awarie w tym projekcie przeszły przez cały
 * proces aż na produkcję, mimo że budowanie kończyło się sukcesem:
 *
 *   1. Strona ogłoszenia wywoływała funkcję, która nie istniała. Nierozwiązany
 *      auto-import Nuxta zostaje zwykłą nazwą i wybucha dopiero w przeglądarce,
 *      więc `npm run build` niczego nie zauważył.
 *   2. Na telefonie dokument był szerszy od ekranu i cała strona przewijała się
 *      na boki. Tego nie widać w kodzie — widać po zmierzeniu.
 *
 * Test uruchamia ZBUDOWANY serwer i otwiera strony prawdziwą przeglądarką, bo
 * tylko tak łapie się błędy, które pojawiają się dopiero przy renderowaniu.
 *
 * Backend zastępuje atrapa (test/mock-api.mjs) — sprawdzamy własny kod, a nie
 * dostępność cudzego API. Dzięki temu test jest powtarzalny i nie wymaga sekretów.
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const APP = 'http://127.0.0.1:3000'
const MOCK_PORT = 4999

/** Strony publiczne, przez które przechodzi ruch. Każda musi renderować się bez błędu. */
const PAGES = [
    // `expect` to selektor, ktory MUSI byc obecny po zaladowaniu. Bez tego test
    // przechodzil dla strony wynikow pokazujacej "Nie znaleziono ogloszen" - czyli
    // sprawdzal szkielet, a nie to, po co ta strona istnieje.
    { path: '/', expect: '.cat-row-head' },
    { path: '/adverts', expect: '.car-card' },
    { path: '/categories' },
    { path: '/firmy' },
    { path: '/login', expect: 'input[type=password]' },
    { path: '/register' },
    { path: '/cennik' },
    { path: '/pakiety' },
    { path: '/jak-to-dziala' },
    { path: '/kontakt' },
    { path: '/o-nas' },
    // Strony pośrednie kategoria → marka → model. To one zbierają ruch z wyszukiwarki,
    // więc muszą realnie renderować listę, a nie sam szkielet.
    // Profil firmy i profil sprzedawcy - obie strony korzystaja ze wspolnej karty
    // `CzCard`, wiec musza byc realnie otwierane, a nie tylko zbudowane.
    { path: '/firmy/auto-serwis-kowalski', expect: '.cz-card' },
    { path: '/seller/5', expect: '.seller-hero' },
    { path: '/kategorie/osobowe', expect: '.car-card' },
    { path: '/kategorie/osobowe/audi', expect: '.kat-chips' },
    { path: '/kategorie/osobowe/audi/q5', expect: '.car-card' },
    // Postać aktualna: kategoria / marka / model / opis-IDxxxx
    { path: '/ogloszenia/osobowe/volkswagen/passat/volkswagen-passat-2021-poznan-ID1003', expect: '.advert-page' },
    // Postać sprzed zmiany - musi nadal prowadzić do ogłoszenia (przez przekierowanie 301).
    { path: '/ogloszenia/audi-q5-2020-warszawa-1003', expect: '.advert-page' },
    // Sam identyfikator - skrót używany np. w wiadomościach.
    { path: '/ogloszenia/1003', expect: '.advert-page' },
    // Ta sama strona, ale oczami kogoś, kto wchodzi PIERWSZY RAZ - bez zapisanej zgody
    // na cookies. Baner zgody jest przyklejony do dołu ekranu z bardzo wysoką warstwą
    // i dwukrotnie w tym projekcie przykrył element, który musi być klikalny:
    // przycisk „Zadzwoń" na ogłoszeniu i „Pokaż N ogłoszeń" w filtrach.
    // `clickable` sprawdza, czy w środku wskazanego elementu naprawdę leży ON, a nie coś nad nim.
    { path: '/ogloszenia/1003', noConsent: true, clickable: '.mobile-cta-bar', onlyMobile: true },
]

/** Szerokości: najwęższy realny telefon, mały telefon, tablet, laptop. */
const VIEWPORTS = [
    // 320 px to iPhone SE i starsze Androidy - najwezszy ekran, ktory ma sens obslugiwac.
    // Jest tu jednak z drugiego powodu: DAJE ZAPAS. Dwa razy z rzedu okazalo sie, ze
    // uklad miescil sie przy 360 px u mnie i NIE miescil na serwerze CI, bo tam
    // `sans-serif` rozwiazuje sie na inna czcionke - szersza o kilka procent. Strona,
    // ktora miesci sie przy 320, ma przy 360 czterdziesci pikseli marginesu bledu
    // i takie roznice przestaja ja wywracac. Dotyczy to tez uzytkownika, u ktorego
    // webfont jeszcze sie nie wczytal.
    { w: 320, h: 720, mobile: true },
    { w: 360, h: 780, mobile: true },
    { w: 768, h: 1024, mobile: false },
    { w: 1440, h: 900, mobile: false },
]

const failures = []
const started = []

function run(cmd, args, env) {
    const p = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: 'pipe' })
    started.push(p)
    return p
}

async function waitFor(url, seconds = 60) {
    for (let i = 0; i < seconds * 2; i++) {
        try {
            const r = await fetch(url)
            if (r.ok || r.status === 404) return true
        } catch { /* jeszcze nie wstał */ }
        await sleep(500)
    }
    return false
}

async function main() {
    // Port zajety przez wczesniejszy, NIEAKTUALNY serwer to najgorszy mozliwy przypadek:
    // `spawn` cicho przegrywa binding, a test sprawdza starą wersję aplikacji i przechodzi
    // albo pada bez zwiazku z biezacymi zmianami. Lepiej stanac od razu z jasnym powodem.
    for (const [port, co] of [[3000, 'aplikacji'], [MOCK_PORT, 'atrapy API']]) {
        try {
            await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) })
            throw new Error(`Port ${port} jest juz zajety (serwer ${co}). Zatrzymaj go - inaczej test sprawdzilby nieaktualna wersje.`)
        } catch (e) {
            if (e instanceof Error && e.message.startsWith('Port ')) throw e
            // brak odpowiedzi = port wolny, o to chodzi
        }
    }

    run('node', ['test/mock-api.mjs'])
    run('node', ['.output/server/index.mjs'], {
        NUXT_PUBLIC_API_BASE: `http://127.0.0.1:${MOCK_PORT}/`,
        PORT: '3000',
    })

    if (!await waitFor(APP)) throw new Error('Serwer aplikacji nie wystartował w 60 s')

    const browser = await chromium.launch()

    for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({
            viewport: { width: vp.w, height: vp.h },
            isMobile: vp.mobile,
        })
        // Baner zgody przykrywa dolną część ekranu i zaburza pomiary (a przy okazji
        // maskował błąd: panel filtrów lądował POD nim). Zgoda jest trzymana
        // w localStorage pod kluczem `cookieConsent` - ustawienie ciasteczka o podobnej
        // nazwie nic nie dawało i baner wychodził na każdym sprawdzeniu.


        // Strony sprawdzamy równolegle, po kilka naraz. Sekwencyjnie 12 stron razy
        // 3 szerokości trwało ponad osiem minut, co w CI zniechęca do czekania na wynik -
        // a test, na który nikt nie czeka, przestaje cokolwiek chronić.
        const queue = [...PAGES]
        const CONCURRENCY = 4
        await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
          while (queue.length) {
            const { path, expect, clickable, noConsent, onlyMobile } = queue.shift()
            if (onlyMobile && !vp.mobile) continue
            const page = await ctx.newPage()

            if (!noConsent) {
                await page.addInitScript(() => {
                    try {
                        localStorage.setItem('cookieConsent', JSON.stringify({
                            analytics: false, marketing: false, timestamp: new Date().toISOString(),
                        }))
                    } catch { /* prywatne okno - trudno, baner się pokaże */ }
                })
            }

            // Pomiar przesunięć układu (CLS) - Google liczy go do oceny strony, a gołym
            // okiem widać go jako „treść skacze w trakcie ładowania". Mierzymy skutek,
            // nie jego domniemaną przyczynę: wcześniejszy audyt zakładał, że obrazy bez
            // atrybutu `width` powodują skoki, a pomiar pokazał CLS równy zeru - bo
            // wszystkie siedzą w kontenerach o stałych proporcjach.
            await page.addInitScript(() => {
                window.__cls = 0
                window.__shifts = []
                new PerformanceObserver(list => {
                    for (const e of list.getEntries()) {
                        if (e.hadRecentInput) continue
                        window.__cls += e.value
                        for (const src of (e.sources || [])) {
                            const n = src.node
                            if (n && n.nodeType === 1) {
                                const cls = typeof n.className === 'string' && n.className.trim()
                                    ? '.' + n.className.trim().split(/\s+/)[0] : ''
                                window.__shifts.push(n.tagName.toLowerCase() + cls)
                            }
                        }
                    }
                }).observe({ type: 'layout-shift', buffered: true })
            })

            const jsErrors = []
            page.on('pageerror', e => jsErrors.push(String(e).split('\n')[0].slice(0, 160)))

            // Niezgodnosc przy uwadnianiu: serwer wyrenderowal co innego, niz klient
            // wyrenderowal w pierwszym przebiegu. Vue nie przerywa dzialania - porzuca
            // gotowe wezly z HTML-a i przebudowuje wszystko, co idzie po nich. Widac to
            // jako skok ukladu. Tak wlasnie powstal CLS 0,142 na stronie glownej: dwie
            // sekcje pobierane wylacznie z przegladarki istnialy w pierwszym renderowaniu
            // klienta, a nie istnialy w HTML-u z serwera. Warto to lapac WPROST, bo
            // pomiar CLS wychwytuje to tylko wtedy, gdy skok akurat wypadnie w widocznej
            // czesci ekranu - przy 1440 px ta sama wada dawala 0,062 i przechodzila.
            let niezgodnoscUwodnienia = false
            page.on('console', m => {
                if (m.type() === 'error' && m.text().includes('Hydration completed but contains mismatches')) {
                    niezgodnoscUwodnienia = true
                }
            })

            // Zewnętrzne zasoby (fonty Google) bywają niedostępne z runnera i wieszałyby
            // oczekiwanie na bezczynność sieci. Testujemy własny kod, nie cudze CDN-y.
            await page.route('**://*', r =>
                r.request().url().includes('127.0.0.1') ? r.continue() : r.abort())

            const label = `${String(vp.w).padStart(4)}px ${path}`
            try {
                const res = await page.goto(APP + path, { waitUntil: 'domcontentloaded', timeout: 30000 })
                if (res && res.status() >= 500) {
                    failures.push(`${label} — serwer odpowiedział ${res.status()}`)
                    await page.close(); continue
                }
                // Chwila na uwodnienie i dociągnięcie danych po stronie klienta.
                await page.waitForTimeout(1500)
            } catch (e) {
                failures.push(`${label} — nie udało się otworzyć: ${String(e).split('\n')[0]}`)
                await page.close(); continue
            }

            const result = await page.evaluate(() => {
                const de = document.documentElement
                const overflow = de.scrollWidth - de.clientWidth
                let culprits = []
                if (overflow > 1) {
                    const granica = de.clientWidth + 1
                    const wystajace = [...document.querySelectorAll('body *')].filter(el => {
                        const b = el.getBoundingClientRect()
                        return b.width > 0 && b.right > granica && b.left < granica
                    })
                    // NAJGLEBSZE, nie pierwsze w dokumencie. Gdy cokolwiek rozepcha strone,
                    // rozciagaja sie za nim wszystkie elementy o szerokosci 100% - w tym
                    // pasek nawigacji i inne `position: fixed`, bo na widoku telefonu
                    // Chrome poszerza dla nich blok zawierajacy do szerokosci dokumentu.
                    // Poprzednia wersja wypisywala trzy pierwsze w kolejnosci dokumentu
                    // i konsekwentnie wskazywala wlasnie je - czyli OFIARY. Prawdziwa
                    // przyczyna, lezaca nizej, nigdy nie trafiala do raportu i szukalem
                    // jej trzy razy w zlym miejscu.
                    const najglebsze = wystajace.filter(el => !wystajace.some(inny => inny !== el && el.contains(inny)))
                    // Element przyciety przez przewijany lub ukryty kontener NIE MOZE rozepchnac
                    // dokumentu - poziomy pasek kart kategorii czy wiersz parametrow ogloszenia
                    // wystaja poza ekran z zalozenia i przewijaja sie same. Wypisywanie ich
                    // jako winnych to falszywy trop; przy poprzedniej wersji zajely cala liste.
                    const nieprzyciety = el => {
                        for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
                            const cs = getComputedStyle(a)
                            if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return false
                        }
                        return true
                    }
                    culprits = najglebsze
                        .filter(nieprzyciety)
                        // Najdalej wystajacy na poczatku - to on wyznacza szerokosc dokumentu.
                        .sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)
                        .slice(0, 5)
                        .map(el => {
                            const cls = typeof el.className === 'string' && el.className.trim()
                                ? '.' + el.className.trim().split(/\s+/)[0] : ''
                            return el.tagName.toLowerCase() + cls + '@' + Math.round(el.getBoundingClientRect().right)
                        })
                }
                // Pola formularza bez nazwy dostępnej dla czytnika ekranu. Etykieta bywa
                // widoczna na ekranie, ale technicznie niepowiązana z polem - wtedy czytnik
                // mówi „pole edycji" i nic więcej. Placeholder się nie liczy: znika po
                // wpisaniu pierwszego znaku.
                const poleBezNazwy = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')]
                    .filter(e => {
                        if (e.getAttribute('aria-label')?.trim()) return false
                        if (e.getAttribute('aria-labelledby')) return false
                        if (e.id && document.querySelector(`label[for="${CSS.escape(e.id)}"]`)) return false
                        if (e.closest('label')) return false
                        if (e.getAttribute('title')?.trim()) return false
                        return true
                    })
                    .map(e => e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' && e.className.trim()
                        ? e.className.trim().split(/\s+/)[0] : ''))

                const icons = [...document.querySelectorAll('.cz-icon')]
                return {
                    overflow,
                    culprits,
                    // Ikona bez ścieżki to nazwa spoza mapy — na stronie wygląda jak dziura.
                    emptyIcons: icons.filter(i => !i.querySelector('svg path')?.getAttribute('d')).length,
                    iconCount: icons.length,
                    // Strona, która wyrenderowała pusty <body>, technicznie „działa”.
                    textLength: (document.body.innerText || '').trim().length,
                    cls: window.__cls ?? 0,
                    shifts: [...new Set(window.__shifts ?? [])].slice(0, 3),
                    poleBezNazwy: [...new Set(poleBezNazwy)],
                }
            })

            if (jsErrors.length) failures.push(`${label} — błąd JS: ${jsErrors[0]}`)
            if (niezgodnoscUwodnienia) {
                failures.push(`${label} — serwer wyrenderował co innego niż przeglądarka (niezgodność przy uwadnianiu)`)
            }
            if (result.overflow > 1) {
                failures.push(`${label} — przewijanie poziome +${result.overflow}px (${result.culprits.join(', ')})`)
            }
            if (result.emptyIcons > 0) {
                failures.push(`${label} — ikon bez ścieżki: ${result.emptyIcons}/${result.iconCount}`)
            }
            if (result.textLength < 200) {
                failures.push(`${label} — strona prawie pusta (${result.textLength} znaków tekstu)`)
            }
            // Próg Google dla oceny „dobry". Dziś wszystkie strony mają 0,000 -
            // ten warunek pilnuje, żeby tak zostało.
            if (result.poleBezNazwy.length) {
                failures.push(`${label} — pola bez nazwy dla czytnika ekranu: ${result.poleBezNazwy.join(', ')}`)
            }
            if (result.cls > 0.1) {
                failures.push(`${label} — treść skacze w trakcie ładowania, CLS ${result.cls.toFixed(3)} (${result.shifts.join(', ')})`)
            }
            if (expect && await page.locator(expect).count() === 0) {
                failures.push(`${label} — brak oczekiwanej treści (${expect})`)
            }
            if (clickable) {
                const verdict = await page.evaluate(sel => {
                    const el = document.querySelector(sel)
                    if (!el) return 'brak elementu'
                    const r = el.getBoundingClientRect()
                    if (r.width === 0 || r.height === 0) return 'element o zerowym rozmiarze'
                    const top = document.elementFromPoint(r.left + r.width * 0.25, r.top + r.height / 2)
                    if (el.contains(top)) return 'ok'
                    const cls = top && typeof top.className === 'string' && top.className.trim()
                        ? '.' + top.className.trim().split(/\s+/)[0] : ''
                    return `przykryty przez ${top ? top.tagName.toLowerCase() + cls : 'nic'}`
                }, clickable)
                if (verdict !== 'ok') failures.push(`${label} — ${clickable} nie jest klikalny: ${verdict}`)
            }

            if (!failures.some(f => f.startsWith(label))) {
                console.log(`  ok   ${label}  (ikon: ${result.iconCount}, CLS ${result.cls.toFixed(3)})`)
            }
            await page.close()
          }
        }))
        await ctx.close()
    }

    await browser.close()
}

main()
    .then(() => {
        if (failures.length) {
            console.error(`\n✗ Test dymny: ${failures.length} problemów\n`)
            failures.forEach(f => console.error('  ' + f))
            process.exitCode = 1
        } else {
            console.log(`\n✓ Test dymny: ${PAGES.length} sprawdzanych adresow × ${VIEWPORTS.length} szerokości — bez zastrzeżeń`)
        }
    })
    .catch(err => {
        console.error('\n✗ Test dymny przerwany:', err.message)
        process.exitCode = 1
    })
    .finally(() => {
        for (const p of started) { try { p.kill('SIGKILL') } catch { /* już nie żyje */ } }
    })
