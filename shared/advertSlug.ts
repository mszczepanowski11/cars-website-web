/**
 * Budowanie przyjaznych adresów ogłoszeń — czysta logika, bez zależności od Nuxta.
 *
 * Leży w `shared/`, a nie w `app/composables/`, bo potrzebują jej OBIE strony:
 * przeglądarka (linki na kartach ogłoszeń) i serwer (sitemap, obrazy OG). Gdyby
 * każda miała własną kopię, adres w mapie strony mógłby się rozejść z adresem
 * w linku — a to dla wyszukiwarki wygląda jak dwie różne strony z tą samą treścią.
 */

export interface SlugSource {
    id: number
    title?: string | null
    year?: number | null
    city?: string | null
    brand?: { name?: string | null } | null
    model?: { name?: string | null } | null
    generation?: { name?: string | null } | null
}

/** Zamienia polskie i inne znaki diakrytyczne oraz wszystko spoza [a-z0-9] na bezpieczny tekst. */
export function slugifyPart(input: string | null | undefined): string {
    if (!input) return ''
    return input
        .toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's')
        .replace(/ź/g, 'z').replace(/ż/g, 'z')
        // Pozostałe diakrytyki (np. "Škoda" → "skoda", "Citroën" → "citroen").
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Część opisowa adresu. Kolejność od najbardziej do najmniej rozpoznawalnego:
 * marka → model → generacja → rok → miasto.
 *
 * Dla kategorii bez marki i modelu (części, opony, felgi, maszyny) fallbackiem
 * jest tytuł, dzięki czemu adres pozostaje sensowny dla KAŻDEJ kategorii,
 * a nie tylko dla samochodów.
 */
export function buildAdvertSlug(advert: SlugSource): string {
    const parts: string[] = []

    if (advert.brand?.name) parts.push(slugifyPart(advert.brand.name))
    if (advert.model?.name) parts.push(slugifyPart(advert.model.name))
    if (advert.generation?.name) parts.push(slugifyPart(advert.generation.name))

    if (parts.length === 0 && advert.title) parts.push(slugifyPart(advert.title))

    if (advert.year) parts.push(String(advert.year))
    if (advert.city) parts.push(slugifyPart(advert.city))

    // Zbyt długie adresy są gorsze i dla ludzi, i dla wyszukiwarek. Ucinamy na
    // granicy członu, żeby nie zostawić urwanego słowa.
    let slug = parts.filter(Boolean).join('-')
    const MAX = 80
    if (slug.length > MAX) {
        slug = slug.slice(0, MAX)
        const lastDash = slug.lastIndexOf('-')
        if (lastDash > 20) slug = slug.slice(0, lastDash)
        slug = slug.replace(/-+$/, '')
    }
    return slug
}

/** Pełna ścieżka. Jedyne miejsce w projekcie, które zna kształt tego adresu. */
export function advertPath(advert: SlugSource): string {
    const slug = buildAdvertSlug(advert)
    return slug ? `/ogloszenia/${slug}-${advert.id}` : `/ogloszenia/${advert.id}`
}

/**
 * Wyciąga ID z adresu. Autorytatywne jest ID na KOŃCU — dzięki temu działa
 * zarówno pełna postać ("porsche-911-2018-warszawa-123456"), jak i samo ID,
 * a zmiana tytułu ogłoszenia nigdy nie unieważnia istniejących linków.
 */
export function parseAdvertId(slugParam: string | string[] | undefined): number | null {
    const raw = Array.isArray(slugParam) ? slugParam.join('/') : (slugParam ?? '')
    const match = /(\d+)$/.exec(raw.trim())
    if (!match) return null
    const id = Number(match[1])
    return Number.isFinite(id) && id > 0 ? id : null
}
