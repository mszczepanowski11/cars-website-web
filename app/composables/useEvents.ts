import type { CarEvent, AdminEvent, CreateEventReportDto, PagedResult } from '~/types'

export const useEvents = () => {
    async function getEvents(params: {
        search?: string; page?: number; pageSize?: number
    }): Promise<PagedResult<CarEvent>> {
        return $fetch('/api/proxy/api/Event', { query: params })
    }

    async function getUpcoming(count = 4): Promise<CarEvent[]> {
        return $fetch('/api/proxy/api/Event/upcoming', { query: { count } })
    }

    async function getEvent(id: number): Promise<CarEvent> {
        return $fetch(`/api/proxy/api/Event/${id}`)
    }

    async function createEvent(data: CreateEventDto, mainImage?: File, galleryImages?: File[]): Promise<CarEvent> {
        const form = new FormData()
        Object.entries(data).forEach(([k, v]) => { if (v != null) form.append(k, String(v)) })
        if (mainImage) form.append('mainImage', mainImage)
        galleryImages?.forEach(f => form.append('galleryImages', f))
        return $fetch('/api/proxy/api/Event', { method: 'POST', body: form })
    }

    async function reportEvent(id: number, dto: CreateEventReportDto): Promise<void> {
        await $fetch(`/api/proxy/api/Event/${id}/report`, { method: 'POST', body: dto })
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

    async function deleteEvent(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Event/admin/${id}`, { method: 'DELETE' })
    }

    async function updateEvent(id: number, dto: CreateEventDto): Promise<CarEvent> {
        return $fetch(`/api/proxy/api/Event/admin/${id}`, { method: 'PUT', body: dto })
    }

    return {
        getEvents, getUpcoming, getEvent, createEvent, reportEvent,
        adminGetEvents, adminGetEvent, publishEvent, rejectEvent, archiveEvent, deleteEvent, updateEvent
    }
}