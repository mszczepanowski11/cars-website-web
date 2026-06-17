import type { ServicePrice, PaymentInitiated, PaymentRecord, PagedResult } from '~/types'

export const usePayment = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getPrice(serviceType: string, durationDays: number): Promise<ServicePrice> {
        return $fetch('/api/proxy/api/Payment/price', { query: { serviceType, durationDays } })
    }

    async function initiatePayment(dto: { serviceType: string; advertId?: number; eventId?: number; durationDays: number }): Promise<PaymentInitiated> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Payment/initiate', { method: 'POST', body: dto })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się zainicjować płatności.'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function getMyPayments(page = 1, pageSize = 20): Promise<PagedResult<PaymentRecord>> {
        return $fetch('/api/proxy/api/Payment/my', { query: { page, pageSize } })
    }

    async function getAdminPayments(page = 1, pageSize = 50): Promise<PagedResult<PaymentRecord>> {
        return $fetch('/api/proxy/api/Payment/admin/all', { query: { page, pageSize } })
    }

    return { loading, error, getPrice, initiatePayment, getMyPayments, getAdminPayments }
}
