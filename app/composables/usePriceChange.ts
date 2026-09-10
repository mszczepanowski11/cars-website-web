/**
 * Zmiana ceny ogloszenia - jedno miejsce, w ktorym rozstrzyga sie, CZY i JAK ja pokazac.
 *
 * Karta ogloszenia i strona ogloszenia musza mowic dokladnie to samo. Gdyby kazda liczyla
 * to u siebie, wystarczyloby, ze jedna sprawdza wiek zmiany, a druga nie - i kupujacy
 * widzialby „obnizke" na liscie, ktora znika po wejsciu w ogloszenie.
 *
 * ILE CZASU POKAZUJEMY
 * Trzydziesci dni. Komunikat ma znaczyc „to sie stalo niedawno" - obnizka sprzed pol roku
 * nie jest zadna informacja dla kupujacego, a zostawiona na zawsze zamienia sie w ozdobnik,
 * ktory kazde ogloszenie nosi do konca zycia.
 *
 * OBNIZKA I PODWYZKA
 * Rozrozniamy je, ale nie traktujemy tak samo. Obnizka to informacja, na ktorej kupujacemu
 * zalezy, i dostaje pelny komunikat z kwota. Podwyzka jest odnotowana uczciwie (przekreslona
 * stara cena), ale bez eksponowania kwoty - inaczej sprzedajacy placiliby za ogloszenie,
 * ktore samo z siebie odradza zakup.
 */
export interface PriceChange {
    /** 'drop' = cena spadla, 'rise' = wzrosla */
    direction: 'drop' | 'rise'
    /** Bezwzgledna roznica w walucie ogloszenia. */
    diff: number
    /** Poprzednia cena, do przekreslenia obok biezacej. */
    previous: number
    /** Ile dni temu cena sie zmienila (0 = dzis). */
    daysAgo: number
}

/** Po ilu dniach komunikat o zmianie ceny przestaje byc pokazywany. */
export const PRICE_CHANGE_VISIBLE_DAYS = 30

export function readPriceChange(advert: {
    price?: number | null
    previousPrice?: number | null
    priceChangedAt?: string | null
}): PriceChange | null {
    const current = advert.price
    const previous = advert.previousPrice
    if (current == null || previous == null || !advert.priceChangedAt) return null
    if (current === previous) return null

    const changedAt = new Date(advert.priceChangedAt)
    if (Number.isNaN(changedAt.getTime())) return null

    const daysAgo = Math.floor((Date.now() - changedAt.getTime()) / 86_400_000)
    // Ujemne = data z przyszlosci (rozjechany zegar serwera). Nie pokazujemy - lepiej nic
    // niz „obnizka za trzy dni".
    if (daysAgo < 0 || daysAgo > PRICE_CHANGE_VISIBLE_DAYS) return null

    return {
        direction: current < previous ? 'drop' : 'rise',
        diff: Math.abs(previous - current),
        previous,
        daysAgo,
    }
}
