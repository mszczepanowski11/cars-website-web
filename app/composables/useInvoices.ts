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
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = doc.internal.pageSize.getWidth()
        let y = 0

        // Red header
        doc.setFillColor(139, 13, 29)
        doc.rect(0, 0, W, 22, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18); doc.setFont('helvetica', 'bold')
        doc.text('CARIZO', 14, 14)
        doc.setFontSize(8); doc.setFont('helvetica', 'normal')
        doc.text('carizo.eu | biuro@carizo.eu', W - 14, 14, { align: 'right' })
        y = 32

        doc.setTextColor(20, 20, 20)
        doc.setFontSize(22); doc.setFont('helvetica', 'bold')
        doc.text('FAKTURA VAT', 14, y); y += 8
        doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
        doc.text(`Nr faktury: ${inv.invoiceNumber}`, 14, y)
        doc.text(`Data wystawienia: ${new Date(inv.generatedAt).toLocaleDateString('pl-PL')}`, W - 14, y, { align: 'right' })
        y += 6

        const months = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień']
        doc.text(`Okres: ${months[(inv.month - 1) % 12]} ${inv.year}`, 14, y); y += 14

        // Boxes
        const boxH = 36
        doc.setFillColor(248, 248, 248)
        doc.roundedRect(12, y - 2, (W - 30) / 2, boxH, 2, 2, 'F')
        doc.roundedRect(W / 2 + 3, y - 2, (W - 30) / 2, boxH, 2, 2, 'F')

        const sellerName = inv.sellerName ?? 'CARIZO'
        const sellerEmail = inv.sellerEmail ?? 'biuro@carizo.eu'
        const sellerAddress = inv.sellerAddress ?? 'ul. Przykładowa 1, 00-000 Warszawa'
        const sellerNip = inv.sellerNip ?? ''

        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 13, 29)
        doc.text('SPRZEDAWCA', 16, y + 4)
        doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40)
        doc.text(sellerName, 16, y + 10)
        doc.setTextColor(80, 80, 80)
        doc.text(`carizo.eu | ${sellerEmail}`, 16, y + 16)
        if (sellerNip) doc.text(`NIP: ${sellerNip}`, 16, y + 22)
        else doc.text(sellerAddress, 16, y + 22)

        const bx = W / 2 + 7
        doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 13, 29)
        doc.text('NABYWCA', bx, y + 4)
        doc.setFont('helvetica', 'normal')
        const lines: string[] = []
        if (inv.companyName) { lines.push(inv.companyName); if (inv.nip) lines.push(`NIP: ${inv.nip}`) }
        else lines.push(inv.userName)
        if (inv.street) lines.push(inv.street)
        if (inv.postalCode || inv.city) lines.push(`${inv.postalCode ?? ''} ${inv.city ?? ''}`.trim())
        lines.push(inv.userEmail)
        lines.forEach((l, i) => {
            doc.setTextColor(i === 0 ? 40 : 80, i === 0 ? 40 : 80, i === 0 ? 40 : 80)
            doc.text(l, bx, y + 10 + i * 6)
        })
        y += boxH + 12

        // Table header
        const cols = [14, 24, 110, 138, 158, 175]
        doc.setFillColor(139, 13, 29); doc.rect(12, y, W - 24, 8, 'F')
        doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
        ;['Lp.', 'Nazwa usługi', 'Data', 'Netto', 'VAT', 'Brutto'].forEach((h, i) => doc.text(h, cols[i], y + 5.5))
        y += 9

        doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40)
        inv.items.forEach((item, idx) => {
            if (idx % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(12, y - 1, W - 24, 7, 'F') }
            const net = item.amount / (1 + inv.vatRate / 100)
            const vat = item.amount - net
            doc.setFontSize(7.5)
            doc.text(String(idx + 1), cols[0], y + 4.5)
            doc.text(((item.serviceDescription || item.serviceType) + (item.durationDays ? ` — ${item.durationDays} dni` : '')).slice(0, 40), cols[1], y + 4.5)
            doc.text(new Date(item.createdAt).toLocaleDateString('pl-PL'), cols[2], y + 4.5)
            doc.text(`${net.toFixed(2)} zł`, cols[3], y + 4.5)
            doc.text(`${inv.vatRate}%`, cols[4], y + 4.5)
            doc.text(`${item.amount.toFixed(2)} zł`, cols[5], y + 4.5)
            y += 7
        })

        doc.setDrawColor(200, 200, 200); doc.line(12, y + 2, W - 12, y + 2); y += 8

        // Totals
        const tw = 80; const tx = W - 12 - tw
        doc.setFillColor(248, 248, 248); doc.roundedRect(tx, y, tw, 26, 2, 2, 'F')
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80)
        doc.text('Razem netto:', tx + 4, y + 7); doc.text(`${inv.netAmount.toFixed(2)} zł`, tx + tw - 4, y + 7, { align: 'right' })
        doc.text(`VAT (${inv.vatRate}%):`, tx + 4, y + 14); doc.text(`${inv.vatAmount.toFixed(2)} zł`, tx + tw - 4, y + 14, { align: 'right' })
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(139, 13, 29)
        doc.text('RAZEM:', tx + 4, y + 23); doc.text(`${inv.totalAmount.toFixed(2)} zł`, tx + tw - 4, y + 23, { align: 'right' })
        y += 34

        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
        doc.text('Forma płatności: płatność elektroniczna (ING IMOJE)', 14, y)

        doc.setFontSize(7); doc.setTextColor(160, 160, 160)
        doc.text('Dokument wygenerowany przez system CARIZO | carizo.eu | Nie wymaga podpisu ani pieczęci.', W / 2, 289, { align: 'center' })

        doc.save(`faktura-${inv.invoiceNumber.replace(/\//g, '-')}.pdf`)
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
