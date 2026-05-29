export const useMessages = () => {
    const unreadCount = useState<number>('messages-unread', () => 0)
    const authStatus = useCookie('auth_status')
    const isLoggedIn = computed(() => !!authStatus.value)

    async function fetchUnreadCount() {
        if (!isLoggedIn.value) { unreadCount.value = 0; return }
        try {
            unreadCount.value = await $fetch<number>('/api/proxy/api/Message/unread-count')
        } catch {}
    }

    async function startConversation(advertId: number, initialMessage = '') {
        const body: Record<string, unknown> = { advertId }
        if (initialMessage) body.initialMessage = initialMessage
        const res = await $fetch<{ conversationId: number }>('/api/proxy/api/Message/start', {
            method: 'POST',
            body
        })
        return res.conversationId
    }

    return { unreadCount, fetchUnreadCount, startConversation, isLoggedIn }
}