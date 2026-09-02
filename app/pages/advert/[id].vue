<script setup lang="ts">
/**
 * Trwałe przekierowanie ze starej struktury adresów.
 *
 * Do tej pory ogłoszenia żyły pod /advert/123456. Nowa, przyjazna dla SEO postać
 * to /ogloszenia/marka-model-rok-miasto-123456. Ta strona istnieje wyłącznie po
 * to, żeby KAŻDY dotychczasowy link - z wyników wyszukiwarek, z wiadomości,
 * z zakładek użytkowników i z zewnętrznych serwisów - nadal działał.
 *
 * Przekierowanie jest trwałe (301), więc wyszukiwarki przepiszą zgromadzoną
 * wartość starego adresu na nowy zamiast traktować go jako duplikat.
 *
 * Nie pobieramy tu ogłoszenia, żeby nie płacić za dodatkowe zapytanie: docelowa
 * strona i tak potrafi zbudować adres kanoniczny z samego ID i przekieruje po
 * raz drugi, gdy pozna markę i model.
 */
const route = useRoute()
const id = Number(route.params.id)

if (!Number.isFinite(id) || id <= 0) {
    throw createError({ statusCode: 404, statusMessage: 'Ogłoszenie nie istnieje', fatal: true })
}

// `localePath` zachowuje jezyk: wejscie z /en/advert/123 trafia na /en/ogloszenia/123,
// a nie na polska wersje strony.
const localePath = useLocalePath()
await navigateTo(localePath(`/ogloszenia/${id}`), { redirectCode: 301, replace: true })
</script>

<template>
    <div />
</template>
