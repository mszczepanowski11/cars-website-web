// Cienka nakładka na współdzieloną logikę z `shared/advertSlug.ts`, dzięki której
// funkcje są auto-importowane w komponentach. Sama logika jest współdzielona
// z kodem serwerowym (sitemap, obrazy OG), żeby adres w mapie strony nigdy nie
// rozjechał się z adresem w linku.
export {
    advertPath,
    buildAdvertSlug,
    parseAdvertId,
    slugifyPart,
    type SlugSource,
} from '~shared/advertSlug'
