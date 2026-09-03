/**
 * Najnowsze ogłoszenia w rozbiciu na kategorie — jedno zapytanie zamiast dwudziestu.
 *
 * DLACZEGO TO ISTNIEJE
 * Strona główna pokazuje pasek „najnowsze w kategorii” dla każdej kategorii z osobna.
 * Wcześniej robiła to z przeglądarki: `loadCategoryShowcase()` mapowało listę kategorii
 * na osobne żądania `POST /listings/search` — czyli DWADZIEŚCIA pełnych zapytań
 * wyszukiwania do bazy na KAŻDE wejście na stronę główną, licząc też boty i crawlery.
 * Przy dzisiejszym ruchu to niewidoczne. Przy docelowym — to najdroższy pojedynczy
 * wzorzec w całym serwisie.
 *
 * CO SIĘ ZMIENIA
 * Fan-out zostaje, ale przenosi się na serwer i — co ważniejsze — jest buforowany.
 * Dwadzieścia zapytań wykonuje się raz na kilka minut dla WSZYSTKICH odwiedzających,
 * zamiast raz dla każdego z osobna. Przeglądarka wykonuje jedno żądanie.
 *
 * Docelowo backend powinien wystawić jeden endpoint zwracający komplet za jednym
 * zapytaniem do bazy; wtedy wystarczy podmienić wnętrze tej funkcji, a strona główna
 * nie zauważy różnicy.
 */

interface Category { id: number; name: string; slug?: string; iconName?: string; advertCount?: number }
interface Advert { id: number }
interface Paged { items?: Advert[]; totalCount?: number; total?: number }

export interface ShowcaseGroup {
    category: Category
    items: Advert[]
    total: number
}

/** Ile kafelków w pasku jednej kategorii — tyle, ile mieści się w rzędzie na desktopie. */
const PER_CATEGORY = 4

export default defineCachedEventHandler(async (): Promise<ShowcaseGroup[]> => {
    const base = useRuntimeConfig().public.apiBase.replace(/\/$/, '')

    const categories = await $fetch<Category[]>(`${base}/api/Category`).catch(() => [] as Category[])
    // "inne" to kategoria techniczna — nigdy nie pokazujemy jej jako pasek na stronie głównej.
    const visible = (categories ?? []).filter(c => c.slug !== 'inne')
    // Pusta lista kategorii oznacza awarię backendu, a nie „nie ma nic do pokazania”.
    // Zwrócenie tu pustej tablicy zapisałoby tę awarię w buforze na pięć minut i strona
    // główna zostałaby bez treści długo po tym, jak backend wróci. Wyjątek nie trafia
    // do bufora, więc kolejne wejście spróbuje ponownie.
    if (visible.length === 0) {
        throw createError({ statusCode: 503, statusMessage: 'Brak danych kategorii' })
    }

    const results = await Promise.allSettled(
        visible.map(async category => {
            const r = await $fetch<Paged>(`${base}/api/listings/search`, {
                method: 'POST',
                body: { page: 1, pageSize: PER_CATEGORY, sortBy: '', categoryId: category.id },
            })
            return { category, items: r?.items ?? [], total: r?.totalCount ?? r?.total ?? 0 }
        })
    )

    const groups = results
        .filter((r): r is PromiseFulfilledResult<ShowcaseGroup> => r.status === 'fulfilled' && r.value.items.length > 0)
        .map(r => r.value)
        // Najbogatsze kategorie na początku, żeby najmocniejsza treść prowadziła stronę.
        .sort((a, b) => b.total - a.total)

    // Jak wyżej: jeśli ani jedna kategoria nie zwróciła ogłoszeń, to jest awaria,
    // a nie stan „serwis jest pusty” — nie utrwalamy jej w buforze.
    if (groups.length === 0) {
        throw createError({ statusCode: 503, statusMessage: 'Brak ogłoszeń do pokazania' })
    }

    return groups
}, {
    // Pięć minut. Nowe ogłoszenie pojawi się w pasku najpóźniej po tym czasie — dla
    // sekcji „zobacz, co mamy” to bez znaczenia, a odciążenie bazy jest całkowite.
    maxAge: 300,
    // Jeden wpis dla wszystkich — pasek nie zależy od tego, kto ogląda.
    getKey: () => 'home-showcase',
    swr: true,
})
