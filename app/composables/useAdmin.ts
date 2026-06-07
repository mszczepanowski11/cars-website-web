import type { AdminStats, AdminReport, AdminUser, AdminAdvert, AdminActionLog, PagedResult } from '~/types'

export const useAdmin = () => {
    async function getStats(): Promise<AdminStats> {
        return $fetch('/api/proxy/api/Admin/stats')
    }

    async function getReports(params: {
        status?: string; targetType?: string; reason?: string
        search?: string; page?: number; pageSize?: number
    }): Promise<PagedResult<AdminReport>> {
        return $fetch('/api/proxy/api/Admin/reports', { query: params })
    }

    async function getReport(id: number): Promise<AdminReport> {
        return $fetch(`/api/proxy/api/Admin/reports/${id}`)
    }

    async function resolveReport(id: number, note?: string) {
        return $fetch(`/api/proxy/api/Admin/reports/${id}/resolve`, { method: 'POST', body: { note } })
    }

    async function rejectReport(id: number, note?: string) {
        return $fetch(`/api/proxy/api/Admin/reports/${id}/reject`, { method: 'POST', body: { note } })
    }

    async function hideAdvert(id: number, note?: string) {
        return $fetch(`/api/proxy/api/Admin/adverts/${id}/hide`, { method: 'POST', body: { note } })
    }

    async function unhideAdvert(id: number) {
        return $fetch(`/api/proxy/api/Admin/adverts/${id}/unhide`, { method: 'POST', body: {} })
    }

    async function deleteAdvert(id: number, note?: string) {
        return $fetch(`/api/proxy/api/Admin/adverts/${id}`, { method: 'DELETE', body: { note } })
    }

    async function activateAdvert(id: number) {
        return $fetch(`/api/proxy/api/Admin/adverts/${id}/activate`, { method: 'POST', body: {} })
    }

    async function deactivateAdvert(id: number) {
        return $fetch(`/api/proxy/api/Admin/adverts/${id}/deactivate`, { method: 'POST', body: {} })
    }

    async function blockUser(id: number, reason?: string) {
        return $fetch(`/api/proxy/api/Admin/users/${id}/block`, { method: 'POST', body: { reason } })
    }

    async function unblockUser(id: number) {
        return $fetch(`/api/proxy/api/Admin/users/${id}/unblock`, { method: 'POST', body: {} })
    }

    async function getUsers(params: { search?: string; page?: number; pageSize?: number }): Promise<PagedResult<AdminUser>> {
        return $fetch('/api/proxy/api/Admin/users', { query: params })
    }

    async function getAdverts(params: {
        search?: string; isHidden?: boolean; isActive?: boolean
        page?: number; pageSize?: number
    }): Promise<PagedResult<AdminAdvert>> {
        return $fetch('/api/proxy/api/Admin/adverts', { query: params })
    }

    async function getLogs(params: { page?: number; pageSize?: number }): Promise<AdminActionLog[]> {
        return $fetch('/api/proxy/api/Admin/logs', { query: params })
    }

    return {
        getStats, getReports, getReport,
        resolveReport, rejectReport,
        hideAdvert, unhideAdvert, deleteAdvert, activateAdvert, deactivateAdvert,
        blockUser, unblockUser,
        getUsers, getAdverts, getLogs
    }
}