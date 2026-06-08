import type { MonthlyInvoice, PagedResult } from '~/types'

export const useInvoices = () => {
    async function getMyInvoices(page = 1, pageSize = 20): Promise<PagedResult<MonthlyInvoice>> {
        return $fetch('/api/proxy/api/Invoice/my', { query: { page, pageSize } })
    }

    async function getInvoice(id: number): Promise<MonthlyInvoice> {
        return $fetch(`/api/proxy/api/Invoice/${id}`)
    }

    function downloadHtml(id: number): void {
        window.open(`/api/proxy/api/Invoice/${id}/html`, '_blank')
    }

    async function getAdminInvoices(page = 1, pageSize = 50): Promise<PagedResult<MonthlyInvoice>> {
        return $fetch('/api/proxy/api/Invoice/admin/all', { query: { page, pageSize } })
    }

    async function adminGenerate(month: number, year: number): Promise<void> {
        await $fetch('/api/proxy/api/Invoice/admin/generate', { method: 'POST', query: { month, year } })
    }

    async function adminSend(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Invoice/admin/${id}/send`, { method: 'POST', body: {} })
    }

    return { getMyInvoices, getInvoice, downloadHtml, getAdminInvoices, adminGenerate, adminSend }
}