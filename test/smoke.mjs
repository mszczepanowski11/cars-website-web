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
    '/',
    '/adverts',
    '/categories',
    '/firmy',
    '/login',
    '/register',
    '/cennik',
    '/pakiety',
    '/jak-to-dziala',
    '/kontakt',
    '/o-nas',
    '/ogloszenia/audi-q5-2020-warszawa-1003',
]

/** Szerokości: mały telefon, tablet, laptop. */
const VIEWPORTS = [
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
        // Baner zgody przykrywałby treść i zaburzał pomiary — zgoda jest już zapisana.
        await ctx.addCookies([{
            name: 'cookie_consent',
            value: '{"analytics":false,"marketing":false}',
            domain: '127.0.0.1',
            path: '/',
        }])

        // Strony sprawdzamy równolegle, po kilka naraz. Sekwencyjnie 12 stron razy
        // 3 szerokości trwało ponad osiem minut, co w CI zniechęca do czekania na wynik -
        // a test, na który nikt nie czeka, przestaje cokolwiek chronić.
        const queue = [...PAGES]
        const CONCURRENCY = 4
        await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
          while (queue.length) {
            const path = queue.shift()
            const page = await ctx.newPage()
            const jsErrors = []
            page.on('pageerror', e => jsErrors.push(String(e).split('\n')[0].slice(0, 160)))

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
                const culprits = []
                if (overflow > 1) {
                    for (const el of document.querySelectorAll('body *')) {
                        const b = el.getBoundingClientRect()
                        if (b.width > 0 && b.right > de.clientWidth + 1 && b.left < de.clientWidth) {
                            const cls = typeof el.className === 'string' && el.className.trim()
                                ? '.' + el.className.trim().split(/\s+/)[0] : ''
                            culprits.push(el.tagName.toLowerCase() + cls)
                            if (culprits.length >= 3) break
                        }
                    }
                }
                const icons = [...document.querySelectorAll('.cz-icon')]
                return {
                    overflow,
                    culprits,
                    // Ikona bez ścieżki to nazwa spoza mapy — na stronie wygląda jak dziura.
                    emptyIcons: icons.filter(i => !i.querySelector('svg path')?.getAttribute('d')).length,
                    iconCount: icons.length,
                    // Strona, która wyrenderowała pusty <body>, technicznie „działa”.
                    textLength: (document.body.innerText || '').trim().length,
                }
            })

            if (jsErrors.length) failures.push(`${label} — błąd JS: ${jsErrors[0]}`)
            if (result.overflow > 1) {
                failures.push(`${label} — przewijanie poziome +${result.overflow}px (${result.culprits.join(', ')})`)
            }
            if (result.emptyIcons > 0) {
                failures.push(`${label} — ikon bez ścieżki: ${result.emptyIcons}/${result.iconCount}`)
            }
            if (result.textLength < 200) {
                failures.push(`${label} — strona prawie pusta (${result.textLength} znaków tekstu)`)
            }

            if (!failures.some(f => f.startsWith(label))) {
                console.log(`  ok   ${label}  (ikon: ${result.iconCount})`)
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
            console.log(`\n✓ Test dymny: ${PAGES.length} stron × ${VIEWPORTS.length} szerokości — bez zastrzeżeń`)
        }
    })
    .catch(err => {
        console.error('\n✗ Test dymny przerwany:', err.message)
        process.exitCode = 1
    })
    .finally(() => {
        for (const p of started) { try { p.kill('SIGKILL') } catch { /* już nie żyje */ } }
    })
