import type { Notification, NotificationPreference, UpdateNotificationPreferenceDto, PagedResult } from '~/types'

let _pollTimer: ReturnType<typeof setInterval> | null = null
let _pollInterval = 30_000

export const useNotifications = () => {
    const notifications = useState<Notification[]>('notifications', () => [])
    const unreadCount = useState('notifications-unread', () => 0)
    const loading = ref(false)

    async function fetchNotifications(page = 1, pageSize = 20): Promise<PagedResult<Notification>> {
        loading.value = true
        try {
            const r = await $fetch<PagedResult<Notification>>('/api/proxy/api/Notification', { query: { page, pageSize } })
            if (page === 1) notifications.value = r.items
            else notifications.value.push(...r.items)
            unreadCount.value = r.items.filter(n => !n.isRead).length
            return r
        } finally {
            loading.value = false
        }
    }

    async function markAsRead(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Notification/${id}/read`, { method: 'PUT', body: {} })
        const n = notifications.value.find(n => n.id === id)
        if (n) { n.isRead = true; unreadCount.value = Math.max(0, unreadCount.value - 1) }
    }

    async function markAllAsRead(): Promise<void> {
        await $fetch('/api/proxy/api/Notification/read-all', { method: 'PUT', body: {} })
        notifications.value.forEach(n => { n.isRead = true })
        unreadCount.value = 0
    }

    async function deleteNotification(id: number): Promise<void> {
        await $fetch(`/api/proxy/api/Notification/${id}`, { method: 'DELETE' })
        notifications.value = notifications.value.filter(n => n.id !== id)
    }

    async function fetchUnreadCount(): Promise<number> {
        try {
            const r = await $fetch<{ count: number }>('/api/proxy/api/Notification/unread-count')
            unreadCount.value = r.count
            return r.count
        } catch { return 0 }
    }

    async function getPreferences(): Promise<NotificationPreference[]> {
        return await $fetch<NotificationPreference[]>('/api/proxy/api/Notification/preferences')
    }

    async function updatePreference(dto: UpdateNotificationPreferenceDto): Promise<void> {
        await $fetch('/api/proxy/api/Notification/preferences', { method: 'PUT', body: dto })
    }

    function startPolling(intervalMs = 30_000): void {
        if (_pollTimer) {
            // Already polling — restart only if interval changed
            if (intervalMs === _pollInterval) return
            clearInterval(_pollTimer)
            _pollTimer = null
        }
        _pollInterval = intervalMs
        _pollTimer = setInterval(() => { fetchUnreadCount() }, intervalMs)
    }

    function stopPolling(): void {
        if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null }
    }

    return { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, fetchUnreadCount, getPreferences, updatePreference, startPolling, stopPolling }
}
