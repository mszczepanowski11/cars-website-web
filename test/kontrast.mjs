// Audyt kontrastu czerwieni marki.
//
// Powod istnienia: burgund logo (#8B0D1D) daje na karcie #0d0d0d kontrast 2,01:1.
// Na ciemnym tle kontrast bierze sie prawie wylacznie z jasnosci, wiec "ciemniej,
// blizej logo" i "czytelnie" to dwa przeciwne kierunki. Granice mozna wyznaczyc
// tylko pomiarem, a nie ocena na oko - i trzeba jej pilnowac, bo kazdy nowy napis
// w kolorze marki moze ja przekroczyc.
//
// Test sprawdza KAZDY element w czerwieni marki: liczy jego rzeczywiste tlo
// (idac w gore drzewa, az trafi na nieprzezroczyste), liczy kontrast i porownuje
// z progiem WCAG 2.1 wlasciwym dla tego elementu:
//   3:1    ikony i grafika (1.4.11) oraz duzy tekst - od 24px, albo od 18,66px
//          przy grubosci 700+ (1.4.3)
//   4,5:1  kazdy inny tekst (1.4.3)
//
// Dotyczy to takze polskiego prawa: Europejski Akt o Dostepnosci obowiazuje
// e-commerce w UE od czerwca 2025 i odwoluje sie do WCAG 2.1 AA.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { readFileSync } from 'node:fs'

const APP = 'http://127.0.0.1:3000'
const MOCK_PORT = 4999

// Strony, na ktorych czerwien marki faktycznie wystepuje w wiekszych ilosciach.
// Wersja mobilna jest osobno, bo czesc napisow zmienia tam rozmiar - a rozmiar
// decyduje o progu.
const PAGES = [
    '/', '/adverts', '/categories', '/firmy', '/login', '/register', '/cennik',
    '/pakiety', '/jak-to-dziala', '/kontakt', '/o-nas', '/firmy/auto-serwis-kowalski',
    '/seller/5', '/kategorie/osobowe', '/kategorie/osobowe/audi',
    '/ogloszenia/1003', '/dla-firm', '/wydarzenia', '/compare', '/forgot-password',
]
const VIEWPORTS = [{ w: 360, h: 780, mobile: true }, { w: 1440, h: 900, mobile: false }]

// Tokeny czytane wprost ze zrodla prawdy. Recznie przepisana lista rozjechalaby sie
// przy pierwszej zmianie palety, a audyt cicho przestalby cokolwiek sprawdzac.
const SCSS = readFileSync(new URL('../app/assets/scss/_variables.scss', import.meta.url), 'utf8')
const CZERWIENIE = ['$red', '$red-bright', '$red-hot', '$red-text', '$red-text-sm'].map(nazwa => {
    const m = new RegExp(`\\${nazwa}:\\s*(#[0-9a-fA-F]{6})`).exec(SCSS)
    if (!m) throw new Error(`Nie znalazlem tokenu ${nazwa} w _variables.scss`)
    const h = m[1]
    return `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`
})

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

const AUDYT = () => {
    const kanal = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    const jasnosc = ([r, g, b]) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b)
    const kontrast = (a, b) => {
        const [x, y] = [jasnosc(a), jasnosc(b)].sort((p, q) => q - p)
        return (x + 0.05) / (y + 0.05)
    }
    const rozbierz = s => {
        const m = /rgba?\(([^)]+)\)/.exec(s || '')
        if (!m) return null
        const c = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number)
        return { rgb: c.slice(0, 3), a: c.length > 3 ? c[3] : 1 }
    }
    const zmieszaj = (wierzch, spod) => wierzch.rgb.map((v, i) => v * wierzch.a + spod[i] * (1 - wierzch.a))

    // Rzeczywiste tlo elementu: pierwszy przodek z nieprzezroczystym tlem.
    // Bez tego liczylibysmy kontrast wzgledem `transparent`, czyli wzgledem niczego.
    const tloPod = el => {
        const warstwy = []
        for (let a = el; a; a = a.parentElement) {
            const c = rozbierz(getComputedStyle(a).backgroundColor)
            if (!c || c.a === 0) continue
            warstwy.push(c)
            if (c.a === 1) break
        }
        let wynik = [0, 0, 0]
        for (let i = warstwy.length - 1; i >= 0; i--) wynik = zmieszaj(warstwy[i], wynik)
        return wynik
    }

    // Czerwienie marki - wstrzykiwane z _variables.scss, zeby lista nie rozjechala
    // sie z tokenami przy nastepnej zmianie palety. Bledy i marki obce (YouTube,
    // Instagram, ING) sa poza zakresem tego audytu.
    const MARKOWE = new Set(window.__czerwienie)

    const problemy = []
    for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el)
        if (!MARKOWE.has(cs.color)) continue
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue

        const svg = el.tagName === 'svg'
        const wlasnyTekst = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
        if (!svg && !wlasnyTekst) continue          // sam dziedziczy kolor, policzymy go u dziecka

        const px = parseFloat(cs.fontSize)
        const waga = parseInt(cs.fontWeight) || 400
        const duzy = px >= 24 || (px >= 18.66 && waga >= 700)
        const prog = (svg || duzy) ? 3 : 4.5

        const kol = rozbierz(cs.color)
        const tlo = tloPod(el)
        const wynik = kontrast(zmieszaj(kol, tlo), tlo)
        if (wynik + 0.005 < prog) {
            problemy.push({
                sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
                    ? '.' + el.className.trim().split(/\s+/)[0] : ''),
                kolor: cs.color, px, waga, ikona: svg, prog,
                kontrast: Math.round(wynik * 100) / 100,
                tekst: (el.textContent || '').trim().slice(0, 30),
            })
        }
    }
    return problemy
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
    const zebrane = new Map()
    let sprawdzonych = 0

    for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({
            viewport: { width: vp.w, height: vp.h },
            isMobile: vp.mobile, hasTouch: vp.mobile,
            deviceScaleFactor: 1, userAgent: vp.mobile ? undefined : undefined,
        })
        await ctx.addInitScript(lista => { window.__czerwienie = lista }, CZERWIENIE)
        // Zgoda na cookies zapisana z gory - inaczej baner zaslania czesc strony.
        await ctx.addInitScript(() => {
            try { localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, analytics: false, marketing: false })) } catch { /* prywatne okno */ }
        })
        const page = await ctx.newPage()
        for (const sciezka of PAGES) {
            try {
                await page.goto(APP + sciezka, { waitUntil: 'networkidle', timeout: 30000 })
            } catch { continue }
            sprawdzonych++
            for (const p of await page.evaluate(AUDYT)) {
                const klucz = `${p.sel}|${p.px}|${p.waga}|${p.ikona}`
                if (!zebrane.has(klucz)) zebrane.set(klucz, { ...p, gdzie: new Set() })
                zebrane.get(klucz).gdzie.add(`${vp.w}px ${sciezka}`)
            }
        }
        await ctx.close()
    }
    await browser.close()

    if (zebrane.size === 0) {
        console.log(`\n✓ Kontrast czerwieni: ${sprawdzonych} widokow — kazdy napis i kazda ikona spelniaja swoj prog WCAG 2.1 AA`)
        return
    }
    console.error(`\n✗ Kontrast czerwieni: ${zebrane.size} elementow ponizej progu\n`)
    for (const p of [...zebrane.values()].sort((a, b) => a.kontrast - b.kontrast)) {
        const rodzaj = p.ikona ? 'ikona' : `${p.px}px/${p.waga}`
        console.error(`  ${p.kontrast.toFixed(2)}:1 (wymagane ${p.prog}:1)  ${p.sel.padEnd(28)} ${rodzaj.padEnd(11)} "${p.tekst}"`)
        console.error(`      ${[...p.gdzie].slice(0, 3).join(', ')}`)
    }
    console.error('\n  Naprawa: element ponizej 18,66px/700 potrzebuje $red-text-sm zamiast $red-text.')
    process.exitCode = 1
}

main()
    .catch(err => { console.error('\n✗ Audyt kontrastu przerwany:', err.message); process.exitCode = 1 })
    .finally(() => { for (const p of started) { try { p.kill('SIGKILL') } catch { /* juz nie zyje */ } } })
