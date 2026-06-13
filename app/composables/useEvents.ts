import type { CarEvent, AdminEvent, CreateEventReportDto, CreateEventDto, PagedResult } from '~/types'

export const useEvents = () => {
    async function getEvents(params: {
        search?: string
        page?: number
        pageSize?: number
        isFeatured?: boolean | string
        dateRange?: string
        status?: string
    }): Promise<PagedResult<CarEvent>> {
        return $fetch('/api/proxy/api/Event', { query: params })
    }

    function isNotPast(ev: CarEvent): boolean {
        return new Date(ev.endDate ?? ev.startDate) >= new Date()
    }

    async function getUpcoming(count = 4): Promise<CarEvent[]> {
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        function isRelevant(e: CarEvent): boolean {
            if (e.status !== 'Published') return false
            const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate)
            return end >= sevenDaysAgo
        }

        try {
            const result = await $fetch<CarEvent[] | PagedResult<CarEvent>>('/api/proxy/api/Event/upcoming', { query: { count: count * 3 } })
            const items = Array.isArray(result) ? result : (result as PagedResult<CarEvent>).items ?? []
            const filtered = items.filter(isRelevant)
            if (filtered.length > 0) return filtered.slice(0, count)
            // fallthrough to base endpoint if upcoming returns nothing relevant
        } catch { /* fall through */ }

        try {
            const r = await $fetch<CarEvent[] | PagedResult<CarEvent>>('/api/proxy/api/Event', {
                query: { page: 1, pageSize: count * 5 }
            })
            const items = Array.isArray(r) ? r : (r as PagedResult<CarEvent>).items ?? []
            const filtered = items.filter(isRelevant)
            if (filtered.length > 0) return filtered.slice(0, count)
            // Last resort: show any published events sorted by start date desc
            return items
                .filter(e => e.status === 'Published')
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, count)
        } catch {
            return []
        }
    }

    async function getEvent(id: number): Promise<CarEvent> {
        return $fetch(`/api/proxy/api/Event/${id}`)
    }

    async function createEvent(data: CreateEventDto, mainImage?: File, galleryImages?: File[]): Promise<CarEvent> {
        const form = new FormData()
        Object.entries(data).forEach(([k, v]) => { if (v != null) form.append(k, String(v)) })
        if (mainImage) form.append('mainImage', mainImage)
        galleryImages?.forEach(f => form.append('galleryImages', f))
        return $fetch('/api/event', { method: 'POST', body: form })
    }

    async function updateMyEvent(id: number, data: CreateEventDto, mainImage?: File, galleryImages?: File[]): Promise<CarEvent> {
        const form = new FormData()
        Object.entries(data).forEach(([k, v]) => { if (v != null) form.append(k, String(v)) })
        if (mainImage) form.append('mainImage', mainImage)
        galleryImages?.forEach(f => form.append('galleryImages', f))
        return $fetch(`/api/event/${id}`, { method: 'PUT', body: form })
    }

    async function deleteMyEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}`, { method: 'DELETE' })
    }

    async function getMyEvents(page = 1, pageSize = 20): Promise<PagedResult<CarEvent>> {
        return $fetch('/api/proxy/api/Event/my', { query: { page, pageSize } })
    }

    async function reportEvent(id: number, dto: CreateEventReportDto): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}/report`, { method: 'POST', body: dto })
    }

    async function attendEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}/attend`, { method: 'POST', body: {} })
    }

    async function unattendEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}/attend`, { method: 'DELETE' })
    }

    async function addEventFavourite(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}/favourite`, { method: 'POST', body: {} })
    }

    async function removeEventFavourite(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}/favourite`, { method: 'DELETE' })
    }

    // Admin
    async function adminGetEvents(params: {
        status?: string; search?: string; page?: number; pageSize?: number
    }): Promise<PagedResult<AdminEvent>> {
        return $fetch('/api/proxy/api/Event/admin/all', { query: params })
    }

    async function adminGetEvent(id: number): Promise<CarEvent> {
        return $fetch(`/api/proxy/api/Event/admin/${id}`)
    }

    async function publishEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}/publish`, { method: 'POST', body: {} })
    }

    async function rejectEvent(id: number, note?: string): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}/reject`, { method: 'POST', body: { note } })
    }

    async function archiveEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}/archive`, { method: 'POST', body: {} })
    }

    async function featureEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}/feature`, { method: 'POST', body: {} })
    }

    async function unfeatureEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}/feature`, { method: 'DELETE' })
    }

    async function deleteEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}`, { method: 'DELETE' })
    }

    async function updateEvent(id: number, dto: CreateEventDto): Promise<CarEvent> {
        return $fetch(`/api/proxy/api/Event/admin/${id}`, { method: 'PUT', body: dto })
    }

    return {
        getEvents, getUpcoming, getEvent, createEvent, updateMyEvent, deleteMyEvent, getMyEvents,
        reportEvent, attendEvent, unattendEvent, addEventFavourite, removeEventFavourite,
        adminGetEvents, adminGetEvent, publishEvent, rejectEvent, archiveEvent,
        featureEvent, unfeatureEvent, deleteEvent, updateEvent
    }
}
