import type { Review, CreateReviewDto, ReviewsResult, PagedResult } from '~/types'

export const useReviews = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getSellerReviews(sellerId: number, page = 1, pageSize = 10): Promise<ReviewsResult> {
        return $fetch('/api/proxy/api/Review', { query: { sellerId, page, pageSize } })
    }

    async function getMyReceivedReviews(page = 1, pageSize = 10): Promise<ReviewsResult> {
        return $fetch('/api/proxy/api/Review/received', { query: { page, pageSize } })
    }

    async function getMyGivenReviews(page = 1, pageSize = 10): Promise<PagedResult<Review>> {
        return $fetch('/api/proxy/api/Review/given', { query: { page, pageSize } })
    }

    async function canReview(sellerId: number): Promise<boolean> {
        try {
            const r = await $fetch<{ canReview: boolean }>('/api/proxy/api/Review/can-review', { query: { sellerId } })
            return r.canReview
        } catch { return false }
    }

    async function submitReview(dto: CreateReviewDto): Promise<Review> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Review', { method: 'POST', body: dto })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się wysłać opinii.'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function deleteReview(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Review/${id}`, { method: 'DELETE' })
    }

    return { loading, error, getSellerReviews, getMyReceivedReviews, getMyGivenReviews, canReview, submitReview, deleteReview }
}
