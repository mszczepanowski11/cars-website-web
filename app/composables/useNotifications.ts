import type { Notification, PagedResult } from '~/types'

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

    return { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, fetchUnreadCount }
}
