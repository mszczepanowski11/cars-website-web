/**
 * Generuje `app/utils/mdiPaths.ts` — mapę nazwa ikony → ścieżka SVG.
 *
 * Uruchomienie: npm run icons
 *
 * DLACZEGO TO ISTNIEJE
 * Serwis wyświetla ~320 ikon, a pełna czcionka Material Design Icons ma ich 7448
 * i waży 396 kB. Zamiast ładować całość, wypisujemy jawne importy tylko tych,
 * które są faktycznie używane — bundler dołącza wtedy wyłącznie je.
 *
 * SKĄD NAZWY
 * Ze skanu OBU repozytoriów. Frontend używa ikon wprost w szablonach, ale backend
 * przysyła nazwy ikon kategorii i podtypów w danych, więc sam skan frontendu
 * byłby niepełny i część kategorii wyświetlałaby się bez ikony.
 *
 * Repozytorium backendu jest opcjonalne: jeśli go nie ma obok (tak jest w CI,
 * gdzie klonowany jest tylko frontend), skan obejmuje sam frontend. Nazwy ikon
 * z backendu i tak są już w mapie z poprzedniego uruchomienia, a CI sprawdza
 * jedynie, czy mapa jest zgodna z kodem frontendu.
 */
import { writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

// Ścieżki liczone od położenia tego pliku, nie zaszyte na sztywno.
// Wcześniej była tu bezwzględna ścieżka ze środowiska, w którym skrypt powstał -
// działał u autora i wywracał się wszędzie indziej, w tym w CI.
const here = dirname(fileURLToPath(import.meta.url))
const webRoot = resolve(here, '..')
const apiRoot = resolve(webRoot, '..', 'cars-website-api')

const mdi = await import(join(webRoot, 'node_modules', '@mdi', 'js', 'mdi.js'))

/** Katalogi do przeskanowania — te, których brakuje, są po prostu pomijane. */
const scanRoots = [
    join(webRoot, 'app'),
    join(webRoot, 'server'),
    join(apiRoot),
].filter(p => existsSync(p))

if (!scanRoots.some(p => p.startsWith(webRoot))) {
    throw new Error('Nie znaleziono katalogów frontendu do przeskanowania.')
}
if (!existsSync(apiRoot)) {
    console.log('Uwaga: repozytorium backendu nie leży obok — skan obejmuje sam frontend.')
}

const raw = execFileSync('grep', [
    '-rhoE', 'mdi-[a-z0-9-]+',
    ...scanRoots,
    '--include=*.vue', '--include=*.ts', '--include=*.cs',
], { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean)

const unikalne = [...new Set(raw)]

const toCamel = n => 'mdi' + n.slice(4).split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('')

const found = []
const missing = []
for (const n of unikalne) {
    const key = toCamel(n)
    if (mdi[key]) found.push([n, key])
    else missing.push(n)
}
found.sort((a, b) => a[0].localeCompare(b[0]))

const lines = [
    '/**',
    ' * Mapa nazwa ikony -> sciezka SVG.',
    ' *',
    ' * Wygenerowana ze skanu repozytoriow (frontend, a gdy lezy obok - takze backend,',
    ' * bo nazwy ikon kategorii przychodza z bazy). Importy sa WYPISANE JAWNIE, nie przez',
    ` * \`import * as\` - dzieki temu bundler dolacza wylacznie te ${found.length} sciezek,`,
    ` * a nie caly zestaw ${Object.keys(mdi).length}. To jest cala roznica miedzy ~8 kB`,
    ' * a ~400 kB w paczce wyslanej do przegladarki.',
    ' *',
    ' * NIE EDYTOWAC RECZNIE - plik odtwarza `npm run icons`.',
    ' */',
    'import {',
    ...found.map(([, k]) => `    ${k},`),
    "} from '@mdi/js'",
    '',
    'export const MDI_PATHS: Record<string, string> = {',
    ...found.map(([n, k]) => `    '${n}': ${k},`),
    '}',
    '',
    '/** Zastepcza ikona, gdy backend przysle nazwe spoza mapy - lepsza niz pusty kwadrat. */',
    "export const MDI_FALLBACK = MDI_PATHS['mdi-help-circle-outline'] ?? ''",
    '',
].join('\n')

writeFileSync(join(webRoot, 'app', 'utils', 'mdiPaths.ts'), lines)
console.log('zmapowanych ikon:', found.length)
if (missing.length) {
    // Nazwa spoza zestawu MDI renderuje sie na stronie jako puste miejsce.
    console.log('NIEZNANE (pominiete, sprawdz literowke):', missing.join(', '))
}
