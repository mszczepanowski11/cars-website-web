import type { Coupon, CouponValidation, CreateCouponDto, PagedResult } from '~/types'

export const useCoupons = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function validateCoupon(code: string, originalPrice: number): Promise<CouponValidation> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Coupon/validate', { query: { code, originalPrice } })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nieprawidłowy kupon.'
            throw e
        } finally {
            loading.value = false
        }
    }

    // Admin
    async function adminGetCoupons(page = 1, pageSize = 20): Promise<PagedResult<Coupon>> {
        return $fetch('/api/proxy/api/Admin/Coupon', { query: { page, pageSize } })
    }

    async function adminCreateCoupon(dto: CreateCouponDto): Promise<Coupon> {
        return $fetch('/api/proxy/api/Admin/Coupon', { method: 'POST', body: dto })
    }

    async function adminDeactivateCoupon(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Admin/Coupon/${id}/deactivate`, { method: 'POST', body: {} })
    }

    async function adminDeleteCoupon(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Admin/Coupon/${id}`, { method: 'DELETE' })
    }

    return { loading, error, validateCoupon, adminGetCoupons, adminCreateCoupon, adminDeactivateCoupon, adminDeleteCoupon }
}
