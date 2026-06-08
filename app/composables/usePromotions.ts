import type { ActivePromotion, CreatePromotionDto, PromotionOrder, PagedResult } from '~/types'

export const usePromotions = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getMyPromotions(page = 1, pageSize = 10): Promise<PagedResult<ActivePromotion>> {
        return $fetch('/api/proxy/api/Promotion', { query: { page, pageSize } })
    }

    async function getAdvertPromotions(advertId: number): Promise<ActivePromotion[]> {
        return $fetch(`/api/proxy/api/Promotion/advert/${advertId}`)
    }

    async function purchasePromotion(dto: CreatePromotionDto): Promise<ActivePromotion> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Promotion', { method: 'POST', body: dto })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się aktywować promocji.'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function previewOrder(dto: CreatePromotionDto): Promise<PromotionOrder> {
        return $fetch('/api/proxy/api/Promotion/preview', { method: 'POST', body: dto })
    }

    async function cancelPromotion(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Promotion/${id}`, { method: 'DELETE' })
    }

    // Admin
    async function adminGetPromotions(page = 1, pageSize = 20): Promise<PagedResult<ActivePromotion>> {
        return $fetch('/api/proxy/api/Admin/Promotion', { query: { page, pageSize } })
    }

    async function adminCancelPromotion(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Admin/Promotion/${id}`, { method: 'DELETE' })
    }

    return { loading, error, getMyPromotions, getAdvertPromotions, purchasePromotion, previewOrder, cancelPromotion, adminGetPromotions, adminCancelPromotion }
}
