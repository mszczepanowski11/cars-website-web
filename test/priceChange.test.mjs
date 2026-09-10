/**
 * Testy komunikatu o zmianie ceny.
 *
 * DLACZEGO AKURAT TEN MODUL
 * `readPriceChange` decyduje, czy kupujacy zobaczy „obnizka o X zl". Pomylka w jedna
 * strone znaczy, ze sprzedajacy obniza cene i nikt tego nie widzi; w druga - ze kazde
 * ogloszenie do konca zycia nosi etykiete o obnizce sprzed roku.
 *
 * Testu dymnego tu nie wystarczy: atrapa API zwraca dla kazdego identyfikatora to samo
 * ogloszenie, wiec przez przegladarke nie da sie sprawdzic przypadku brzegowego, jakim
 * jest zmiana starsza niz trzydziesci dni. Tutaj sprawdzamy sama regule - bez serwera.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readPriceChange, PRICE_CHANGE_VISIBLE_DAYS } from '../app/composables/usePriceChange.ts'

const dniTemu = (n) => new Date(Date.now() - n * 86_400_000).toISOString()

describe('readPriceChange', () => {
    test('obnizka: kierunek, kwota i poprzednia cena', () => {
        const z = readPriceChange({ price: 83_000, previousPrice: 89_000, priceChangedAt: dniTemu(2) })
        assert.equal(z.direction, 'drop')
        assert.equal(z.diff, 6_000)
        assert.equal(z.previous, 89_000)
        assert.equal(z.daysAgo, 2)
    })

    test('podwyzka jest rozpoznawana osobno', () => {
        const z = readPriceChange({ price: 95_000, previousPrice: 89_000, priceChangedAt: dniTemu(1) })
        assert.equal(z.direction, 'rise')
        assert.equal(z.diff, 6_000)
    })

    test('brak zmiany ceny - brak komunikatu', () => {
        assert.equal(readPriceChange({ price: 89_000, previousPrice: null, priceChangedAt: null }), null)
        assert.equal(readPriceChange({ price: 89_000, previousPrice: 89_000, priceChangedAt: dniTemu(1) }), null)
    })

    // Granica progu. To jest przypadek, ktory najlatwiej zepsuc przy zmianie warunku z
    // `>` na `>=` - a skutkiem jest etykieta o obnizce, ktora nigdy nie znika.
    test(`zmiana dokladnie sprzed ${PRICE_CHANGE_VISIBLE_DAYS} dni jest jeszcze pokazywana`, () => {
        const z = readPriceChange({
            price: 83_000, previousPrice: 89_000,
            // pol dnia zapasu, zeby test nie zalezal od tego, o ktorej godzinie jest uruchamiany
            priceChangedAt: dniTemu(PRICE_CHANGE_VISIBLE_DAYS - 0.5),
        })
        assert.ok(z, 'komunikat powinien byc jeszcze widoczny')
    })

    test('zmiana starsza niz prog przestaje byc pokazywana', () => {
        assert.equal(readPriceChange({
            price: 83_000, previousPrice: 89_000, priceChangedAt: dniTemu(PRICE_CHANGE_VISIBLE_DAYS + 1),
        }), null)
        assert.equal(readPriceChange({
            price: 83_000, previousPrice: 89_000, priceChangedAt: dniTemu(180),
        }), null)
    })

    // Zegar serwera potrafi sie rozjechac z zegarem przegladarki. Data z przyszlosci nie
    // moze dac „obnizki za trzy dni".
    test('data z przyszlosci nie daje komunikatu', () => {
        assert.equal(readPriceChange({
            price: 83_000, previousPrice: 89_000, priceChangedAt: dniTemu(-3),
        }), null)
    })

    test('niepoprawna data nie wywraca komunikatu', () => {
        assert.equal(readPriceChange({
            price: 83_000, previousPrice: 89_000, priceChangedAt: 'nie-data',
        }), null)
    })
})
