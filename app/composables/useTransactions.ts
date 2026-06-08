import type { Transaction, CreateTransactionDto, TransactionStatus, PagedResult } from '~/types'

export const useTransactions = () => {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getMyTransactions(page = 1, pageSize = 10): Promise<PagedResult<Transaction>> {
        return $fetch('/api/proxy/api/Transaction', { query: { page, pageSize } })
    }

    async function getTransaction(id: number): Promise<Transaction> {
        return $fetch(`/api/proxy/api/Transaction/${id}`)
    }

    async function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
        loading.value = true
        error.value = null
        try {
            return await $fetch('/api/proxy/api/Transaction', { method: 'POST', body: dto })
        } catch (e: any) {
            error.value = e?.data?.message ?? 'Nie udało się utworzyć transakcji.'
            throw e
        } finally {
            loading.value = false
        }
    }

    async function updateStatus(id: number, status: TransactionStatus, note?: string): Promise<void> {
        await $fetch(`/api/proxy/api/Transaction/${id}/status`, { method: 'PUT', body: { status, note } })
    }

    async function cancelTransaction(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Transaction/${id}/cancel`, { method: 'POST', body: {} })
    }

    return { loading, error, getMyTransactions, getTransaction, createTransaction, updateStatus, cancelTransaction }
}
