<script setup lang="ts">
/**
 * Sekcja linkow wewnetrznych na dole strony glownej.
 *
 * PO CO
 * Google dociera do stron kategorii i marek przez linki. Bez tej sekcji
 * jedyna droga do `/kategorie/osobowe/audi` prowadzi przez formularz
 * wyszukiwania, czyli przez JavaScript - a to zla droga.
 *
 * DLACZEGO NIE SCIANA LINKOW
 * Typowa „stopka SEO" to setka linkow wrzuconych obok siebie. Google to widzi,
 * uzytkownik widzi balagan, a serwis wyglada na tani. Dlatego: trzy nazwane
 * grupy, po dziesiec linkow widocznych od razu, reszta pod przyciskiem.
 * Sekcja ma pomagac wyszukiwarce, ale przede wszystkim nie psuc wrazenia.
 *
 * SKAD LINKI
 * WYLACZNIE z danych, ktore strona faktycznie ma: kategorie i marki przychodza
 * z API, miasta to staly zestaw najwiekszych polskich miast (strona wynikow
 * przyjmuje `locationCity` i renderuje sie zawsze).
 *
 * CELOWO NIE MA „popularnych modeli". Model bez pokrycia w bazie daje strone
 * bez tresci - a dziesiatki takich stron szkodza w wyszukiwarce bardziej,
 * niz pomaga kilka linkow.
 */
import { slugifyPart } from '~/composables/advertUrl'

const props = defineProps<{
    categories: { id: number; name: string; slug?: string | null }[]
    brands: { id: number; name: string }[]
}>()

const localePath = useLocalePath()

/** Ile pozycji w grupie widac przed kliknieciem „Pokaz wiecej". */
const WIDOCZNYCH = 10

const MIASTA = [
    'Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin',
    'Bydgoszcz', 'Lublin', 'Białystok', 'Katowice', 'Gdynia', 'Częstochowa',
    'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Rzeszów', 'Olsztyn', 'Bielsko-Biała',
]

interface Link { label: string; to: string }

const grupy = computed<{ tytul: string; ikona: string; linki: Link[] }[]>(() => [
    {
        tytul: 'Kategorie pojazdów',
        ikona: 'mdi-shape-outline',
        linki: props.categories
            .filter(c => c.slug)
            .map(c => ({ label: c.name, to: `/kategorie/${c.slug}` })),
    },
    {
        tytul: 'Popularne marki',
        ikona: 'mdi-car-side',
        linki: props.brands
            .filter(b => b.name && !/^\d+$/.test(b.name))
            .map(b => ({ label: b.name, to: `/kategorie/osobowe/${slugifyPart(b.name)}` })),
    },
    {
        tytul: 'Pojazdy w miastach',
        ikona: 'mdi-map-marker-outline',
        linki: MIASTA.map(m => ({ label: m, to: `/adverts?locationCity=${encodeURIComponent(m)}` })),
    },
].filter(g => g.linki.length > 0))

const rozwiniete = ref<Record<string, boolean>>({})
const widoczne = (tytul: string, linki: Link[]) =>
    rozwiniete.value[tytul] ? linki : linki.slice(0, WIDOCZNYCH)
</script>

<template>
    <section v-if="grupy.length" class="seo" aria-labelledby="seo-h">
        <div class="seo-inner">
            <h2 id="seo-h" class="seo-h">Przeglądaj ogłoszenia</h2>
            <p class="seo-sub">Najczęściej wybierane kategorie, marki i lokalizacje.</p>

            <div class="seo-grid">
                <div v-for="g in grupy" :key="g.tytul" class="seo-group">
                    <h3 class="seo-group-h">
                        <CzIcon :icon="g.ikona" :size="16" />
                        {{ g.tytul }}
                    </h3>

                    <ul class="seo-list">
                        <li v-for="l in widoczne(g.tytul, g.linki)" :key="l.to">
                            <NuxtLink :to="localePath(l.to)" class="seo-link">{{ l.label }}</NuxtLink>
                        </li>
                    </ul>

                    <button
                        v-if="g.linki.length > WIDOCZNYCH"
                        class="seo-more"
                        :aria-expanded="!!rozwiniete[g.tytul]"
                        @click="rozwiniete[g.tytul] = !rozwiniete[g.tytul]"
                    >
                        {{ rozwiniete[g.tytul] ? 'Pokaż mniej' : `Pokaż więcej (${g.linki.length - WIDOCZNYCH})` }}
                        <CzIcon :icon="rozwiniete[g.tytul] ? 'mdi-chevron-up' : 'mdi-chevron-down'" :size="15" />
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style lang="scss" scoped>
.seo {
    margin-top: $section-gap;
    padding: $s-10 0;
    border-top: 1px solid $border;
    background: rgba(255, 255, 255, 0.012);

    @media (max-width: $bp-mobile) { margin-top: $section-gap-mobile; padding: $s-7 0; }
}

.seo-inner { @include container; }

.seo-h {
    margin: 0 0 $s-15;
    font-size: 22px;
    font-weight: $fw-bold;
    color: $text;
}

.seo-sub {
    margin: 0 0 $s-6;
    font-size: 14px;
    color: $text-muted;
}

.seo-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $s-6;

    @media (max-width: $bp-sm) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (max-width: $bp-mobile) { grid-template-columns: minmax(0, 1fr); gap: $s-5; }
}

.seo-group { min-width: 0; }

.seo-group-h {
    display: flex;
    align-items: center;
    gap: $s-15;
    margin: 0 0 $s-3;
    font-size: 12px;
    font-weight: $fw-bold;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: $text-muted;

    .cz-icon { color: $red-text; flex-shrink: 0; }
}

.seo-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $s-05;
}

.seo-link {
    display: block;
    // Pelna wysokosc dotykowa - to sa linki, w ktore ktos celuje kciukiem.
    padding: $s-15 0;
    color: $text-link;
    font-size: 14px;
    text-decoration: none;
    overflow-wrap: anywhere;
    transition: color 0.15s;

    &:hover { color: $red-text; text-decoration: underline; }
    &:focus-visible { outline: 2px solid $red-hot; outline-offset: 2px; border-radius: $r-xs; }
}

.seo-more {
    display: inline-flex;
    align-items: center;
    gap: $s-1;
    margin-top: $s-2;
    padding: $s-15 0;
    background: none;
    border: none;
    color: $text-muted;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: $fw-semibold;
    cursor: pointer;

    &:hover { color: $text; }
    &:focus-visible { outline: 2px solid $red-hot; outline-offset: 2px; border-radius: $r-xs; }
}
</style>
