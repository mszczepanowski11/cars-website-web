import type { CreateReportDto } from '~/types'

export const useReports = () => {
    const loading = ref(false)
    const error = ref('')

    async function submitReport(dto: CreateReportDto) {
        loading.value = true
        error.value = ''
        try {
            await $fetch('/api/proxy/api/Report', { method: 'POST', body: dto })
        } catch (err: any) {
            error.value = err?.data?.statusMessage || err?.message || 'Błąd podczas wysyłania zgłoszenia.'
            throw err
        } finally {
            loading.value = false
        }
    }

    return { submitReport, loading, error }
}