/**
 * Dwie kolekcje na stronie głównej — „najczęściej oglądane" i „kolekcja premium".
 *
 * DLACZEGO TO ISTNIEJE
 * Obie były pobierane WYŁĄCZNIE z przeglądarki, z komentarzem „client-side only to
 * avoid SSR crashes". Kosztowało to trzy rzeczy naraz:
 *
 *   1. Serwer renderował stronę BEZ tych sekcji, a przeglądarka - już przy pierwszym
 *      renderowaniu - Z nimi (w postaci szkieletów). Vue trafiał więc na niezgodność
 *      przy uwadnianiu, porzucał gotowe węzły z HTML-a i budował od nowa wszystko,
 *      co szło po nich. Widać to było jako skok układu na sekcji „PEŁNA OFERTA":
 *      CLS 0,142 przy 768 px, czyli powyżej progu Google (0,1).
 *   2. Dwa dodatkowe żądania z KAŻDEJ przeglądarki, nieobjęte żadnym buforem.
 *   3. Treść, która nie istnieje w HTML-u, nie istnieje dla wyszukiwarek.
 *
 * Wszystkie trzy znikają, gdy dane są pobierane po stronie serwera i buforowane
 * wspólnie dla wszystkich odwiedzających - dokładnie tak, jak paski kategorii.
 *
 * „Awarie SSR", przed którymi bronił się komentarz, załatwia `Promise.allSettled`:
 * odpadnięcie jednej z kolekcji nie przewraca strony, tylko chowa jedną sekcję.
 */

interface Advert { id: number }
type Odpowiedz = Advert[] | { items?: Advert[] }

export interface HomeCollections {
    mostViewed: Advert[]
    premium: Advert[]
}

/** Backend zwraca raz gołą tablicę, raz obiekt ze stronicowaniem - godzimy oba kształty. */
function pozycje(dane: Odpowiedz | null | undefined): Advert[] {
    if (Array.isArray(dane)) return dane
    return dane?.items ?? []
}

export default defineCachedEventHandler(async (): Promise<HomeCollections> => {
    const base = useRuntimeConfig().public.apiBase.replace(/\/$/, '')

    const [mv, pc] = await Promise.allSettled([
        $fetch<Odpowiedz>(`${base}/api/listings/most-viewed`, { query: { count: 8 } }),
        $fetch<Odpowiedz>(`${base}/api/listings/premium-collection`, { query: { count: 8 } }),
    ])

    // Pusta kolekcja to poprawny stan (nikt jeszcze nie wykupił wyróżnienia) i wolno ją
    // zbuforować. Odrzucone ŻĄDANIE to awaria - zapisanie jej w buforze pozbawiłoby
    // stronę główną obu sekcji na pięć minut po tym, jak backend już wróci.
    if (mv.status === 'rejected' && pc.status === 'rejected') {
        throw createError({ statusCode: 503, statusMessage: 'Backend nie odpowiada' })
    }

    return {
        mostViewed: mv.status === 'fulfilled' ? pozycje(mv.value) : [],
        premium: pc.status === 'fulfilled' ? pozycje(pc.value) : [],
    }
}, {
    // Tyle samo co paski kategorii - obie sekcje zmieniają się w tej samej skali czasu.
    maxAge: 300,
    getKey: () => 'home-collections',
    swr: true,
})
