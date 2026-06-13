import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: number
    type: ToastType
    title?: string
    message: string
    duration: number
}

const _toasts = ref<Toast[]>([])
let _nextId = 0

export function useToast() {
    function show(message: string, type: ToastType = 'success', title?: string, duration = 4500) {
        const id = ++_nextId
        _toasts.value.push({ id, type, message, title, duration })
        setTimeout(() => dismiss(id), duration)
    }

    function success(message: string, title?: string) {
        show(message, 'success', title)
    }

    function error(message: string, title?: string) {
        show(message, 'error', title, 6000)
    }

    function info(message: string, title?: string) {
        show(message, 'info', title)
    }

    function warning(message: string, title?: string) {
        show(message, 'warning', title)
    }

    function dismiss(id: number) {
        const i = _toasts.value.findIndex(t => t.id === id)
        if (i !== -1) _toasts.value.splice(i, 1)
    }

    return { toasts: _toasts, show, success, error, info, warning, dismiss }
}
