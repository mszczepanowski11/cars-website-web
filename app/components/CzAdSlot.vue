<script setup lang="ts">
/**
 * Miejsce reklamowe.
 *
 * DLACZEGO OSOBNY KOMPONENT
 * Reklama wstawiona „na wyczucie" psuje strone na dwa sposoby naraz: doklada
 * wysokosc dopiero po wczytaniu (cala tresc pod nia podskakuje) i nie wiadomo,
 * gdzie sie konczy tresc serwisu, a zaczyna oplacony baner. Oba problemy
 * rozwiazuje sie raz, w jednym miejscu.
 *
 * MIEJSCE JEST REZERWOWANE Z GORY
 * Wysokosc wynika z formatu, nie z tego, co sie wczyta - w skrajnym przypadku
 * (brak reklamy, blokada, wolne lacze) zostaje pusty, estetyczny prostokat
 * tej samej wysokosci. Dzieki temu wskaznik CLS nie drgnie, a to on decyduje
 * o ocenie strony w Google.
 *
 * OZNACZENIE
 * Kazde miejsce ma widoczna etykiete „Reklama". To nie jest ozdoba - tresc
 * platna musi byc odrozniona od redakcyjnej, a uzytkownik i tak rozpozna baner
 * w ulamku sekundy i bardziej ufa serwisowi, ktory sie z tym nie kryje.
 *
 * JAK PODLACZYC PRAWDZIWA REKLAME
 * Wstawic ja w slot domyslny. Dopoki slot jest pusty, widac zastepnik.
 *   <CzAdSlot format="billboard"><ins class="adsbygoogle" ... /></CzAdSlot>
 */
withDefaults(defineProps<{
    /**
     * billboard - szeroki pas pod wyszukiwarka i miedzy glownymi sekcjami,
     * inline    - nizszy pas miedzy sekcjami ogloszen,
     * compact   - najnizszy, tuz przed sekcja linkow.
     */
    format?: 'billboard' | 'inline' | 'compact'
}>(), { format: 'inline' })

const slots = useSlots()
const maReklame = computed(() => !!slots.default)
</script>

<template>
    <aside class="cz-ad" :class="`cz-ad--${format}`" aria-label="Reklama">
        <span class="cz-ad-tag">Reklama</span>
        <div class="cz-ad-box">
            <slot />
            <div v-if="!maReklame" class="cz-ad-ph" aria-hidden="true">
                <CzIcon icon="mdi-image-outline" :size="22" />
                <span>To miejsce czeka na reklamę</span>
            </div>
        </div>
    </aside>
</template>

<style lang="scss" scoped>
.cz-ad {
    @include container;
    // Ten sam odstep, co miedzy sekcjami tresci - baner ma byc czescia ukladu,
    // a nie czyms doklejonym miedzy nie.
    margin-top: $section-gap;
    margin-bottom: 0;

    @media (max-width: $bp-mobile) { margin-top: $section-gap-mobile; }
}

.cz-ad-tag {
    display: block;
    margin-bottom: $s-15;
    font-size: 10px;
    font-weight: $fw-bold;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: $text-dark;
}

.cz-ad-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px dashed rgba(255, 255, 255, 0.09);
    border-radius: $r-sm;
    background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.01) 100%);

    // WYSOKOSC JEST STALA I ZNANA PRZED WCZYTANIEM. To jest cala istota tego
    // komponentu - bez tego kazda reklama przesuwalaby tresc pod soba.
    .cz-ad--billboard & { height: 160px; }
    .cz-ad--inline &    { height: 120px; }
    .cz-ad--compact &   { height: 100px; }

    @media (max-width: $bp-mobile) {
        .cz-ad--billboard & { height: 120px; }
        .cz-ad--inline &    { height: 100px; }
        .cz-ad--compact &   { height: 90px; }
    }

    // Cokolwiek wstawi sie w slot, ma wypelnic zarezerwowane pole i nie wyjsc poza nie.
    :deep(> *:not(.cz-ad-ph)) {
        max-width: 100%;
        max-height: 100%;
    }
}

.cz-ad-ph {
    display: flex;
    align-items: center;
    gap: $s-2;
    color: $text-dark;
    font-size: 12.5px;
    font-weight: $fw-semibold;
    letter-spacing: 0.2px;

    .cz-icon { opacity: 0.75; }
}
</style>
