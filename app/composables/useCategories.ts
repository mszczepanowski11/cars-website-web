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
    { id: 10, slug: 'inne', name: 'Inne', description: 'Pozostałe pojazdy i przedmioty', iconName: 'mdi-dots-horizontal-circle', advertCount: 0 },
]

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