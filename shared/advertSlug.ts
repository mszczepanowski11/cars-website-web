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
    /** Kategoria pojazdu — pierwszy segment adresu, np. "osobowe". */
    category?: { slug?: string | null; name?: string | null } | null
    /** Wersja silnikowa, np. "2.0 TDI" — trafia do części opisowej. */
    engineVersion?: { name?: string | null } | null
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
 * Część opisowa adresu — ostatni segment, ten, który człowiek czyta.
 *
 * Kolejność od najbardziej do najmniej rozpoznawalnego:
 * marka → model → generacja → wersja silnikowa → rok → miasto.
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
    // Wersja silnikowa ("2.0 TDI") to dla kupującego jeden z pierwszych filtrów -
    // w adresie działa jak dopowiedzenie, po którym widać, że to właśnie ta odmiana.
    if (advert.engineVersion?.name) parts.push(slugifyPart(advert.engineVersion.name))

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

/** Znacznik identyfikatora na końcu adresu. */
const ID_MARK = 'ID'

/**
 * Pełna ścieżka ogłoszenia. Jedyne miejsce w projekcie, które zna kształt tego adresu.
 *
 * Postać docelowa:
 *   /ogloszenia/osobowe/audi/q5/audi-q5-2-0-tdi-2020-warszawa-ID1234
 *    └ kategoria  └ marka └ model └──── część czytelna ────┘  └ ID
 *
 * Segmenty kategorii, marki i modelu dają wyszukiwarce hierarchię serwisu -
 * bez nich wszystkie ogłoszenia leżą na jednym poziomie i nie da się zbudować
 * stron pośrednich typu "wszystkie Audi Q5", które w tej branży generują
 * większość ruchu z wyszukiwarki.
 *
 * Segmenty pojawiają się tylko wtedy, gdy dane naprawdę są. Ogłoszenie części
 * bez marki dostanie krótszy adres zamiast segmentu "brak" albo pustego członu.
 *
 * Identyfikator zostaje NA KOŃCU i jest jedynym źródłem prawdy. Dzięki temu
 * zmiana tytułu, marki czy kategorii nie unieważnia istniejących linków -
 * strona i tak znajdzie ogłoszenie, po czym przekieruje na aktualną postać.
 * Przedrostek "ID" usuwa dwuznaczność: bez niego adres urwany na roczniku
 * ("...-audi-q5-2020") wyglądałby jak poprawne ID 2020.
 */
export function advertPath(advert: SlugSource): string {
    const segments = ['ogloszenia']

    const category = slugifyPart(advert.category?.slug ?? advert.category?.name)
    const brand = slugifyPart(advert.brand?.name)
    const model = slugifyPart(advert.model?.name)

    if (category) segments.push(category)
    // Model bez marki nie niesie informacji ("q5" samo w sobie nic nie mówi),
    // więc dokładamy go dopiero, gdy marka też jest znana.
    if (brand) {
        segments.push(brand)
        if (model) segments.push(model)
    }

    const slug = buildAdvertSlug(advert)
    segments.push(slug ? `${slug}-${ID_MARK}${advert.id}` : `${ID_MARK}${advert.id}`)

    return '/' + segments.join('/')
}

/**
 * Wyciąga ID z adresu ogłoszenia.
 *
 * Rozpoznaje trzy postacie, bo wszystkie trzy żyją w sieci:
 *   1. aktualną      "...-warszawa-ID1234"
 *   2. poprzednią    "...-warszawa-1234"   (adresy sprzed wprowadzenia przedrostka)
 *   3. samo ID       "/ogloszenia/1234"    (skrót, np. z wiadomości)
 *
 * Znacznik "ID" ma pierwszeństwo i jest szukany W CAŁYM adresie, nie tylko na końcu.
 * Dzięki temu adres, do którego ktoś dokleił coś po identyfikatorze
 * ("...-ID1234-2020", parametr sklejony przez zewnętrzny serwis), nadal prowadzi
 * do właściwego ogłoszenia zamiast do tego o numerze 2020.
 *
 * CZEGO TO NIE ROZWIĄZUJE - i trzeba to wiedzieć:
 * Adres URWANY przed znacznikiem ("...-audi-q5-2020") nie zawiera już żadnej
 * wskazówki, więc odczyta się jako ogłoszenie 2020. Nie da się tego odróżnić od
 * poprawnego adresu w starej postaci, który kończy się na 2020 - i właśnie dlatego
 * stara postać musi być nadal obsługiwana. To ograniczenie wynika z decyzji
 * o zachowaniu wstecznej zgodności, a nie z niedopatrzenia.
 *
 * Uboczny wniosek: adres typu "/ogloszenia/osobowe/audi/q5" odczytałby się jako
 * ogłoszenie numer 5, bo "q5" kończy się cyfrą. To jeden z powodów, dla których
 * listy kategoria/marka/model leżą pod osobnym prefiksem /kategorie/, a nie
 * pod /ogloszenia/.
 */
export function parseAdvertId(slugParam: string | string[] | undefined): number | null {
    const raw = (Array.isArray(slugParam) ? slugParam.join('/') : (slugParam ?? '')).trim()

    // Ostatnie wystąpienie znacznika - gdyby w adresie znalazły się dwa,
    // liczy się ten bliżej końca, czyli dopisany później.
    const marked = raw.match(new RegExp(`${ID_MARK}(\\d+)`, 'gi'))
    const match = marked?.length
        ? new RegExp(`${ID_MARK}(\\d+)`, 'i').exec(marked[marked.length - 1]!)
        : /(\d+)$/.exec(raw)
    if (!match) return null

    const id = Number(match[1])
    return Number.isFinite(id) && id > 0 ? id : null
}
