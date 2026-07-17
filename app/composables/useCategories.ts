import type { CategoryWithCount } from '~/types'

const STATIC_CATEGORIES: CategoryWithCount[] = [
    { id: 1, slug: 'auta-osobowe', name: 'Auta osobowe', description: 'Sedany, coupe, SUV-y i więcej', iconName: 'mdi-car', advertCount: 0 },
    { id: 2, slug: 'dostawcze', name: 'Dostawcze', description: 'Busy, vany, samochody dostawcze', iconName: 'mdi-truck-delivery', advertCount: 0 },
    { id: 3, slug: 'ciezarowe', name: 'Ciężarowe', description: 'Ciężarówki, TIR-y, naczepy i więcej', iconName: 'mdi-truck', advertCount: 0 },
    { id: 4, slug: 'maszyny', name: 'Maszyny', description: 'Maszyny budowlane, rolnicze i przemysłowe', iconName: 'mdi-excavator', advertCount: 0 },
    { id: 5, slug: 'czesci', name: 'Części', description: 'Części samochodowe, akcesoria i tuning', iconName: 'mdi-cog', advertCount: 0 },
    { id: 6, slug: 'motocykle', name: 'Motocykle', description: 'Motocykle, skutery, quady i więcej', iconName: 'mdi-motorbike', advertCount: 0 },
    { id: 7, slug: 'przyczepy', name: 'Przyczepy', description: 'Przyczepy, lawety, naczepy i więcej', iconName: 'mdi-rv-truck', advertCount: 0 },
    { id: 8, slug: 'rolnicze', name: 'Rolnicze', description: 'Maszyny i pojazdy rolnicze', iconName: 'mdi-tractor', advertCount: 0 },
    { id: 9, slug: 'budowlane', name: 'Budowlane', description: 'Sprzęt budowlany i narzędzia', iconName: 'mdi-hard-hat', advertCount: 0 },
    { id: 11, slug: 'lodzie-i-jachty', name: 'Łodzie i jachty', description: 'Łodzie motorowe, żaglówki, jachty i pontony', iconName: 'mdi-sail-boat', advertCount: 0 },
    { id: 12, slug: 'kampery', name: 'Kampery', description: 'Kampery, autobusy kempingowe i pojazdy rekreacyjne', iconName: 'mdi-caravan', advertCount: 0 },
    { id: 13, slug: 'quady-atv', name: 'Quady i ATV', description: 'Quady sportowe, użytkowe i pojazdy SSV/UTV', iconName: 'mdi-atv', advertCount: 0 },
    { id: 14, slug: 'skutery-wodne', name: 'Skutery wodne', description: 'Skutery wodne jedno- i wieloosobowe', iconName: 'mdi-ski-water', advertCount: 0 },
    { id: 15, slug: 'autobusy', name: 'Autobusy', description: 'Autobusy miejskie, turystyczne i minibusy', iconName: 'mdi-bus', advertCount: 0 },
    { id: 16, slug: 'naczepy', name: 'Naczepy', description: 'Naczepy ciągnięte przez ciągniki siodłowe', iconName: 'mdi-truck-trailer', advertCount: 0 },
    { id: 17, slug: 'wozki-widlowe', name: 'Wózki widłowe', description: 'Wózki widłowe spalinowe, elektryczne i magazynowe', iconName: 'mdi-forklift', advertCount: 0 },
    { id: 18, slug: 'opony', name: 'Opony', description: 'Opony letnie, zimowe i całoroczne do wszystkich pojazdów', iconName: 'mdi-tire', advertCount: 0 },
    { id: 19, slug: 'felgi', name: 'Felgi', description: 'Felgi aluminiowe, stalowe i akcesoria kołowe', iconName: 'mdi-record-circle-outline', advertCount: 0 },
    { id: 20, slug: 'akcesoria', name: 'Akcesoria', description: 'Akcesoria i wyposażenie dodatkowe', iconName: 'mdi-seat-recline-extra', advertCount: 0 },
    { id: 21, slug: 'uslugi-motoryzacyjne', name: 'Usługi motoryzacyjne', description: 'Warsztaty, detailing, wulkanizacja i inne usługi', iconName: 'mdi-account-wrench', advertCount: 0 },
]
// "Inne" is deliberately excluded — this is only a fallback used if the real /api/Category
// fetch fails, and index.vue also filters it out of whatever the API returns (see homeCategories).

export const useCategories = () => {
    async function fetchCategories(): Promise<CategoryWithCount[]> {
        try {
            return await $fetch<CategoryWithCount[]>('/api/proxy/api/Category')
        } catch {
            return STATIC_CATEGORIES
        }
    }

    return { fetchCategories, STATIC_CATEGORIES }
}