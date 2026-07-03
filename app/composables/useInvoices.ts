import type { MonthlyInvoice, PagedResult, PaymentRecord, PaymentStatusType } from '~/types'

export const useInvoices = () => {
    async function getMyInvoices(page = 1, pageSize = 20): Promise<PagedResult<MonthlyInvoice>> {
        return $fetch('/api/proxy/api/Invoice/my', { query: { page, pageSize } })
    }

    async function getInvoice(id: number): Promise<MonthlyInvoice> {
        return $fetch(`/api/proxy/api/Invoice/${id}`)
    }

    async function getMyPayments(page = 1, pageSize = 20): Promise<PagedResult<PaymentRecord>> {
        return $fetch('/api/proxy/api/Payment/my', { query: { page, pageSize } })
    }

    async function downloadHtml(id: number): Promise<void> {
        try {
            const blob = await $fetch<Blob>(`/api/proxy/api/Invoice/${id}/html`, { responseType: 'blob' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `faktura-${id}.html`
            document.body.appendChild(a); a.click()
            document.body.removeChild(a); URL.revokeObjectURL(url)
        } catch {
            window.open(`/api/proxy/api/Invoice/${id}/html`, '_blank')
        }
    }

    async function generatePdf(inv: MonthlyInvoice): Promise<void> {
        const blob = await $fetch<Blob>(`/api/proxy/api/Invoice/${inv.id}/pdf`, { responseType: 'blob' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `faktura-${inv.invoiceNumber.replace(/\//g, '-')}.pdf`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
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

    async function adminUpdatePaymentStatus(paymentId: number, status: PaymentStatusType, note?: string): Promise<void> {
        await $fetch(`/api/proxy/api/Payment/admin/${paymentId}/status`, {
            method: 'PATCH',
            body: { status, note }
        })
    }

    async function adminResendInvoice(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Invoice/admin/${id}/resend`, { method: 'POST', body: {} })
    }

    return {
        getMyInvoices,
        getInvoice,
        getMyPayments,
        downloadHtml,
        generatePdf,
        getAdminInvoices,
        adminGenerate,
        adminSend,
        adminUpdatePaymentStatus,
        adminResendInvoice
    }
}
