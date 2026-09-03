/**
 * Testy budowania i czytania adresów ogłoszeń.
 *
 * DLACZEGO AKURAT TEN MODUŁ
 * `shared/advertSlug.ts` decyduje o KAŻDYM adresie ogłoszenia w serwisie: o linkach
 * na kartach, o adresie kanonicznym, o mapie strony i o obrazach OG. Był zmieniany
 * dwa razy w krótkim czasie, a jedna z tych zmian wywróciła stronę ogłoszenia na
 * produkcji. Test dymny łapie skutek („strona się nie renderuje"), ale nie powie,
 * że adres jest zbudowany źle, dopóki ktoś nie wejdzie akurat na to ogłoszenie.
 *
 * Tutaj sprawdzamy samą logikę - bez przeglądarki, bez serwera, w ułamku sekundy.
 *
 * Uruchomienie: npm run test:unit
 * (Node czyta plik .ts wprost, dzięki --experimental-strip-types - bez kroku budowania.)
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { slugifyPart, buildAdvertSlug, advertPath, parseAdvertId } from '../shared/advertSlug.ts'

describe('slugifyPart', () => {
    test('zamienia polskie znaki na odpowiedniki bez ogonków', () => {
        assert.equal(slugifyPart('Łódź'), 'lodz')
        assert.equal(slugifyPart('Gdańsk'), 'gdansk')
        assert.equal(slugifyPart('Świętokrzyskie'), 'swietokrzyskie')
        assert.equal(slugifyPart('Zażółć gęślą jaźń'), 'zazolc-gesla-jazn')
    })

    test('radzi sobie z diakrytykami spoza polskiego', () => {
        assert.equal(slugifyPart('Škoda'), 'skoda')
        assert.equal(slugifyPart('Citroën'), 'citroen')
        assert.equal(slugifyPart('Mercedes-Benz'), 'mercedes-benz')
    })

    test('skleja znaki spoza [a-z0-9] w pojedyncze myślniki i nie zostawia ich na brzegach', () => {
        assert.equal(slugifyPart('  A.B  C  '), 'a-b-c')
        assert.equal(slugifyPart('2.0 TDI quattro'), '2-0-tdi-quattro')
        assert.equal(slugifyPart('!!!'), '')
    })

    test('brak wartości daje pusty tekst, a nie wyjątek', () => {
        assert.equal(slugifyPart(null), '')
        assert.equal(slugifyPart(undefined), '')
        assert.equal(slugifyPart(''), '')
    })
})

describe('buildAdvertSlug', () => {
    test('układa człony od najbardziej rozpoznawalnego', () => {
        assert.equal(
            buildAdvertSlug({
                id: 1, brand: { name: 'Audi' }, model: { name: 'Q5' },
                engineVersion: { name: '2.0 TDI' }, year: 2020, city: 'Warszawa',
            }),
            'audi-q5-2-0-tdi-2020-warszawa'
        )
    })

    test('bez marki i modelu (części, opony) sięga po tytuł', () => {
        const slug = buildAdvertSlug({ id: 1, title: 'Klocki hamulcowe przód Bosch', year: null, city: null })
        assert.equal(slug, 'klocki-hamulcowe-przod-bosch')
    })

    test('pomija człony, których nie ma - bez pustych miejsc i podwójnych myślników', () => {
        const slug = buildAdvertSlug({ id: 1, brand: { name: 'BMW' }, year: 2018 })
        assert.equal(slug, 'bmw-2018')
        assert.ok(!slug.includes('--'))
    })

    test('ucina zbyt długi adres na granicy członu, nie w środku słowa', () => {
        const slug = buildAdvertSlug({
            id: 1,
            brand: { name: 'Mercedes-Benz' },
            model: { name: 'Klasa E Kombi All-Terrain' },
            generation: { name: 'W213 po liftingu wersja limitowana' },
            engineVersion: { name: '3.0 CDI BlueTEC 4Matic' },
            year: 2021, city: 'Zielona Góra',
        })
        assert.ok(slug.length <= 80, `slug ma ${slug.length} znaków`)
        assert.ok(!slug.endsWith('-'), 'nie może kończyć się myślnikiem')
    })

    test('ogłoszenie zupełnie bez danych daje pusty tekst zamiast śmieci', () => {
        assert.equal(buildAdvertSlug({ id: 7 }), '')
    })
})

describe('advertPath', () => {
    const pelne = {
        id: 1234,
        brand: { name: 'Audi' },
        model: { name: 'Q5' },
        engineVersion: { name: '2.0 TDI' },
        category: { slug: 'osobowe', name: 'Auta osobowe' },
        year: 2020,
        city: 'Warszawa',
    }

    test('buduje pełną hierarchię: kategoria / marka / model / opis-ID', () => {
        assert.equal(advertPath(pelne), '/ogloszenia/osobowe/audi/q5/audi-q5-2-0-tdi-2020-warszawa-ID1234')
    })

    test('bez modelu pomija ten poziom, zamiast zostawiać pusty segment', () => {
        const { model, ...bezModelu } = pelne
        assert.equal(advertPath(bezModelu), '/ogloszenia/osobowe/audi/audi-2-0-tdi-2020-warszawa-ID1234')
    })

    test('model bez marki nie trafia do adresu - samo "q5" nic nie znaczy', () => {
        const { brand, ...bezMarki } = pelne
        const sciezka = advertPath(bezMarki)
        assert.ok(!sciezka.includes('/q5/'), `model nie powinien być segmentem: ${sciezka}`)
        assert.ok(sciezka.startsWith('/ogloszenia/osobowe/'))
    })

    test('bez kategorii adres jest krótszy, ale wciąż poprawny', () => {
        const { category, ...bezKategorii } = pelne
        assert.equal(advertPath(bezKategorii), '/ogloszenia/audi/q5/audi-q5-2-0-tdi-2020-warszawa-ID1234')
    })

    test('ogłoszenie bez żadnych danych opisowych ma sam identyfikator', () => {
        assert.equal(advertPath({ id: 9 }), '/ogloszenia/ID9')
    })

    test('nigdy nie tworzy pustego ani podwójnego segmentu', () => {
        const warianty = [
            { id: 1 },
            { id: 2, brand: { name: '' }, model: { name: 'Q5' } },
            { id: 3, category: { slug: '' }, brand: { name: 'Audi' } },
            { id: 4, title: '!!!' },
        ]
        for (const w of warianty) {
            const p = advertPath(w)
            assert.ok(!p.includes('//'), `podwójny ukośnik w ${p}`)
            assert.ok(!p.endsWith('/'), `kończy się ukośnikiem: ${p}`)
        }
    })
})

describe('parseAdvertId', () => {
    test('czyta postać aktualną, z przedrostkiem ID', () => {
        assert.equal(parseAdvertId('osobowe/audi/q5/audi-q5-2020-warszawa-ID1234'), 1234)
    })

    test('czyta postać sprzed zmiany, bez przedrostka', () => {
        assert.equal(parseAdvertId('audi-q5-2020-warszawa-1234'), 1234)
    })

    test('czyta sam identyfikator', () => {
        assert.equal(parseAdvertId('1234'), 1234)
    })

    test('przyjmuje segmenty jako tablicę - tak podaje je trasa [...slug]', () => {
        assert.equal(parseAdvertId(['osobowe', 'audi', 'q5', 'audi-q5-2020-ID1234']), 1234)
    })

    test('znacznik ID ma pierwszeństwo, także gdy coś doklejono po nim', () => {
        // Zewnętrzne serwisy potrafią dokleić do adresu własny parametr. Bez szukania
        // znacznika w całym adresie taki link prowadziłby do ogłoszenia numer 2020.
        assert.equal(parseAdvertId('osobowe/audi/q5/audi-q5-ID1234-2020'), 1234)
    })

    test('przy dwóch znacznikach liczy się ten bliżej końca', () => {
        assert.equal(parseAdvertId('audi-ID12-cos-ID99'), 99)
    })

    test('brak cyfr to brak identyfikatora, a nie zgadywanie', () => {
        assert.equal(parseAdvertId('bez-zadnych-cyfr'), null)
        assert.equal(parseAdvertId(''), null)
        assert.equal(parseAdvertId(undefined), null)
    })

    test('UDOKUMENTOWANE OGRANICZENIE: nazwa modelu kończąca się cyfrą wygląda jak identyfikator', () => {
        // "/ogloszenia/osobowe/audi/q5" odczyta się jako ogłoszenie numer 5, bo bez
        // znacznika jedyną wskazówką są cyfry na końcu. To NIE jest błąd do naprawienia
        // w tej funkcji - to powód, dla którego listy kategoria/marka/model leżą pod
        // osobnym prefiksem /kategorie/, gdzie ta funkcja w ogóle nie jest wywoływana.
        // Test istnieje po to, żeby ktoś, kto zechce przenieść listy pod /ogloszenia/,
        // zobaczył ten problem od razu, a nie po wdrożeniu.
        assert.equal(parseAdvertId('osobowe/audi/q5'), 5)
    })

    test('UDOKUMENTOWANE OGRANICZENIE: adres urwany przed znacznikiem czyta rocznik jako identyfikator', () => {
        // Nie da się tego odróżnić od poprawnego adresu w starej postaci kończącego się
        // na 2020 - a stara postać musi być obsługiwana, bo takie linki są już w sieci.
        // Świadomy kompromis na rzecz wstecznej zgodności.
        assert.equal(parseAdvertId('audi-q5-2020'), 2020)
    })

    test('zero i wartości ujemne nie są poprawnym identyfikatorem', () => {
        assert.equal(parseAdvertId('audi-0'), null)
        // Minus jest częścią separatora, więc "-5" czyta się jako 5 - to zamierzone:
        // identyfikatory są dodatnie, a myślnik oddziela człony.
        assert.equal(parseAdvertId('audi--5'), 5)
    })

    test('ignoruje białe znaki na brzegach', () => {
        assert.equal(parseAdvertId('  audi-q5-ID77  '), 77)
    })
})

describe('adres zbudowany i odczytany z powrotem', () => {
    test('dla każdego kształtu ogłoszenia identyfikator wraca ten sam', () => {
        // To jest właściwe zabezpieczenie: cokolwiek zmieni się w budowaniu adresu,
        // odczyt musi nadal trafiać w to samo ogłoszenie. Bez tego cicha zmiana
        // formatu rozsypuje wszystkie linki w serwisie i widać to dopiero,
        // gdy ktoś kliknie.
        const przypadki = [
            { id: 1, brand: { name: 'Audi' }, model: { name: 'Q5' }, category: { slug: 'osobowe' }, year: 2020, city: 'Warszawa' },
            { id: 42, title: 'Klocki hamulcowe Bosch', category: { slug: 'czesci' } },
            { id: 999999, brand: { name: 'Škoda' }, model: { name: 'Octavia' }, year: 2019 },
            { id: 2020, brand: { name: 'BMW' }, year: 2020 },          // ID równe rocznikowi
            { id: 7 },                                                  // brak jakichkolwiek danych
            { id: 123, brand: { name: 'Mercedes-Benz' }, model: { name: 'Klasa E' }, city: 'Zielona Góra' },
        ]
        for (const a of przypadki) {
            const sciezka = advertPath(a)
            const segmenty = sciezka.replace(/^\/ogloszenia\//, '')
            assert.equal(parseAdvertId(segmenty), a.id, `adres ${sciezka} odczytał się jako inne ogłoszenie`)
        }
    })

    test('ogłoszenie o identyfikatorze równym rocznikowi nie myli się samo ze sobą', () => {
        // Przypadek brzegowy, który bez przedrostka ID byłby niejednoznaczny:
        // /ogloszenia/osobowe/bmw/bmw-2020-2020 - który 2020 jest identyfikatorem?
        const sciezka = advertPath({ id: 2020, brand: { name: 'BMW' }, category: { slug: 'osobowe' }, year: 2020 })
        assert.ok(sciezka.endsWith('-ID2020'), sciezka)
        assert.equal(parseAdvertId(sciezka.replace(/^\/ogloszenia\//, '')), 2020)
    })
})
