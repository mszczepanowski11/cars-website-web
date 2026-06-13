const KEY = 'carizo_recently_viewed'
const MAX = 10

export function useRecentlyViewed() {
    function getIds(): number[] {
        if (!import.meta.client) return []
        try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
    }

    function track(id: number) {
        if (!import.meta.client) return
        const list = getIds().filter(x => x !== id)
        list.unshift(id)
        localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
    }

    function clear() {
        if (import.meta.client) localStorage.removeItem(KEY)
    }

    return { getIds, track, clear }
}
