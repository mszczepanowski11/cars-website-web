// UWAGA: ten plik nie eksportuje funkcji `useAdvertUrl()`. Eksportuje pojedyncze funkcje,
// ktore Nuxt auto-importuje po NAZWIE EKSPORTU - dlatego plik nazywa sie `advertUrl.ts`.
//
// Cienka nakladka na wspoldzielona logike z `shared/advertSlug.ts`, dzieki ktorej funkcje
// sa auto-importowane w komponentach. Sama logika jest wspoldzielona z kodem serwerowym
// (sitemap, obrazy OG), zeby adres w mapie strony nigdy nie rozjechal sie z adresem w linku.
//
// Celowo `export const nazwa = ...`, a nie `export { nazwa } from ...`: skaner auto-importow
// Nuxta nie zaglada do re-eksportow, wiec przy tamtej formie funkcje dzialaly w przegladarce,
// ale nie istnialy w deklaracjach typow - i literowka w wywolaniu przechodzila przez build,
// a wywracala strone dopiero u uzytkownika.
import {
    advertPath as advertPathImpl,
    buildAdvertSlug as buildAdvertSlugImpl,
    parseAdvertId as parseAdvertIdImpl,
    slugifyPart as slugifyPartImpl,
} from '~shared/advertSlug'

export type { SlugSource } from '~shared/advertSlug'

export const advertPath = advertPathImpl
export const buildAdvertSlug = buildAdvertSlugImpl
export const parseAdvertId = parseAdvertIdImpl
export const slugifyPart = slugifyPartImpl
