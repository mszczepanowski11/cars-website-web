import type { SavedSearch, CreateSavedSearchDto, PagedResult } from '~/types'

export const useSavedSearches = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getSavedSearches(page = 1, pageSize = 20): Promise<PagedResult<SavedSearch>> {
        return $fetch('/api/proxy/api/SavedSearch', { query: { page, pageSize } })
    }

    async function saveSearch(dto: CreateSavedSearchDto): Promise<SavedSearch> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/SavedSearch', { method: 'POST', body: dto })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się zapisać wyszukiwania.'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateSearch(id: number, dto: Partial<CreateSavedSearchDto>): Promise<SavedSearch> {
        return $fetch(`/api/proxy/api/SavedSearch/${id}`, { method: 'PUT', body: dto })
    }

    async function deleteSearch(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/SavedSearch/${id}`, { method: 'DELETE' })
    }

    async function toggleNotify(id: number, notifyOnNew: boolean): Promise<void> {
        await $fetch(`/api/proxy/api/SavedSearch/${id}/notify`, { method: 'PUT', body: { notifyOnNew } })
    }

    return { loading, error, getSavedSearches, saveSearch, updateSearch, deleteSearch, toggleNotify }
}
