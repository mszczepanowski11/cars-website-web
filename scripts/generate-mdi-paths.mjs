import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import * as mdi from '/home/user/cars-website-web/node_modules/@mdi/js/mdi.js'

// Nazwy ikon zbieramy z OBU repozytoriow: front uzywa ich wprost w szablonach,
// a backend przysyla je w danych (kategorie, podtypy), wiec sam skan frontu by nie wystarczyl.
const raw = execSync(
  "grep -rhoE 'mdi-[a-z0-9-]+' /home/user/cars-website-web/app /home/user/cars-website-web/server /home/user/cars-website-api --include='*.vue' --include='*.ts' --include='*.cs' 2>/dev/null | sort -u",
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean)

const toCamel = n => 'mdi' + n.slice(4).split('-').map(p => p[0].toUpperCase() + p.slice(1)).join('')
const found = [], missing = []
for (const n of raw) {
  const key = toCamel(n)
  if (mdi[key]) found.push([n, key]); else missing.push(n)
}
found.sort((a,b) => a[0].localeCompare(b[0]))

const lines = [
`/**`,
` * Mapa nazwa ikony -> sciezka SVG.`,
` *`,
` * Wygenerowana ze skanu OBU repozytoriow (frontend + backend, bo nazwy ikon kategorii`,
` * przychodza z bazy). Importy sa WYPISANE JAWNIE, nie przez \`import * as\` - dzieki temu`,
` * bundler dolacza wylacznie te ${found.length} sciezek, a nie caly zestaw ${Object.keys(mdi).length}.`,
` * To jest cala roznica miedzy ~8 kB a ~400 kB w paczce wyslanej do przegladarki.`,
` *`,
` * NIE EDYTOWAC RECZNIE - plik odtwarza \`npm run icons\`.`,
` */`,
`import {`,
...found.map(([,k]) => `    ${k},`),
`} from '@mdi/js'`,
``,
`export const MDI_PATHS: Record<string, string> = {`,
...found.map(([n,k]) => `    '${n}': ${k},`),
`}`,
``,
`/** Zastepcza ikona, gdy backend przysle nazwe spoza mapy - lepsza niz pusty kwadrat. */`,
`export const MDI_FALLBACK = MDI_PATHS['mdi-help-circle-outline'] ?? ''`,
``,
].join('\n')

writeFileSync('/home/user/cars-website-web/app/utils/mdiPaths.ts', lines)
console.log('zmapowanych ikon:', found.length)
if (missing.length) console.log('NIEZNANE (pominiete):', missing.join(', '))
