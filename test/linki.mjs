// Sprawdza, czy linki wewnetrzne na stronie glownej PROWADZA DOKADS.
//
// Powod istnienia: sekcja „Przegladaj ogloszenia" budowala adresy marek jako
// /kategorie/osobowe/{marka}, a liste marek brala z globalnego zapytania - czyli
// z calej bazy, razem z markami motocyklowymi i budowlanymi. Strona kategorii
// sprawdza marke wylacznie w taksonomii SWOJEJ kategorii, wiec kazda taka pozycja
// odpowiadala 404. Kilkadziesiat martwych linkow w miejscu, ktore istnieje po to,
// zeby wyszukiwarka miala czym chodzic po serwisie.
//
// Zaden dotychczasowy test tego nie widzial: test dymny sprawdza, czy STRONA sie
// renderuje, a nie czy adresy NA NIEJ dokads prowadza.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const APP = 'http://127.0.0.1:3000'
const MOCK_PORT = 4999

// Strony, ktore zbieraja linki wewnetrzne kierujace ruch w glab serwisu.
const STRONY = ['/', '/adverts', '/categories']

const started = []
function run(cmd, args, env) {
    const p = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: 'pipe' })
    started.push(p)
    return p
}
async function waitFor(url, seconds = 60) {
    for (let i = 0; i < seconds * 2; i++) {
        try { const r = await fetch(url); if (r.ok || r.status === 404) return true } catch { /* jeszcze nie wstal */ }
        await sleep(500)
    }
    return false
}

async function main() {
    for (const [port, co] of [[3000, 'aplikacji'], [MOCK_PORT, 'atrapy API']]) {
        try {
            await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) })
            throw new Error(`Port ${port} jest juz zajety (serwer ${co}). Zatrzymaj go - inaczej test sprawdzilby nieaktualna wersje.`)
        } catch (e) {
            if (e instanceof Error && e.message.startsWith('Port ')) throw e
        }
    }
    run('node', ['test/mock-api.mjs'])
    run('node', ['.output/server/index.mjs'], {
        NUXT_PUBLIC_API_BASE: `http://127.0.0.1:${MOCK_PORT}/`, PORT: '3000',
    })
    if (!await waitFor(APP)) throw new Error('Serwer aplikacji nie wystartowal w 60 s')

    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    // Zgoda na cookies z gory - baner potrafi zaslonic czesc stopki.
    await page.context().addInitScript(() => {
        try { localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, analytics: false, marketing: false })) } catch { /* prywatne okno */ }
    })

    const doSprawdzenia = new Map()   // adres -> skad go wziecismy
    for (const sciezka of STRONY) {
        await page.goto(APP + sciezka, { waitUntil: 'networkidle' })
        // „Pokaz wiecej" odslania reszte linkow - one tez musza dokads prowadzic.
        for (const btn of await page.locator('.seo-more').all()) {
            await btn.click().catch(() => {})
        }
        await page.waitForTimeout(300)
        const znalezione = await page.evaluate(() => {
            const out = []
            for (const a of document.querySelectorAll('a[href^="/"]')) {
                const href = a.getAttribute('href')
                if (!href || href.startsWith('//')) continue
                const sekcja = a.closest('.seo') ? 'sekcja linkow'
                    : a.closest('footer, .site-footer, [class*="footer"]') ? 'stopka'
                    : 'tresc'
                out.push({ href, sekcja, tekst: (a.textContent || '').trim().slice(0, 24) })
            }
            return out
        })
        for (const z of znalezione) {
            if (!doSprawdzenia.has(z.href)) doSprawdzenia.set(z.href, { ...z, skad: sciezka })
        }
    }
    await browser.close()

    const martwe = []
    for (const [href, info] of doSprawdzenia) {
        let status = 0
        try {
            const r = await fetch(APP + href, { redirect: 'follow' })
            status = r.status
        } catch (e) {
            martwe.push({ ...info, href, status: `blad: ${e.message}` })
            continue
        }
        if (status >= 400) martwe.push({ ...info, href, status })
    }

    if (martwe.length === 0) {
        console.log(`\n✓ Linki wewnetrzne: ${doSprawdzenia.size} adresow z ${STRONY.length} stron — kazdy prowadzi dokads`)
        return
    }
    console.error(`\n✗ Linki wewnetrzne: ${martwe.length} z ${doSprawdzenia.size} nie prowadzi nigdzie\n`)
    for (const m of martwe.sort((a, b) => a.sekcja.localeCompare(b.sekcja))) {
        console.error(`  ${String(m.status).padEnd(5)} ${m.href}`)
        console.error(`        „${m.tekst}" — ${m.sekcja} na ${m.skad}`)
    }
    process.exitCode = 1
}

main()
    .catch(err => { console.error('\n✗ Test linkow przerwany:', err.message); process.exitCode = 1 })
    .finally(() => { for (const p of started) { try { p.kill('SIGKILL') } catch { /* juz nie zyje */ } } })
