<template>
    <div ref="containerRef" class="turnstile-wrap"></div>
</template>

<script setup lang="ts">
const props = defineProps<{
    siteKey: string
    modelValue: string
}>()

const emit = defineEmits<{
    'update:modelValue': [token: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
let widgetId: string | undefined
let pollTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
    if (!props.siteKey) return
    loadScript()
})

function loadScript() {
    if ((window as any).turnstile) { renderWidget(); return }
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
        pollTimer = setInterval(() => {
            if ((window as any).turnstile) { clearInterval(pollTimer); pollTimer = undefined; renderWidget() }
        }, 50)
        return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = renderWidget
    document.head.appendChild(script)
}

function renderWidget() {
    if (!containerRef.value || !(window as any).turnstile) {
        setTimeout(renderWidget, 100)
        return
    }
    widgetId = (window as any).turnstile.render(containerRef.value, {
        sitekey: props.siteKey,
        callback: (token: string) => emit('update:modelValue', token),
        'expired-callback': () => emit('update:modelValue', ''),
        'error-callback': () => emit('update:modelValue', ''),
        theme: 'dark',
    })
}

function reset() {
    if (widgetId !== undefined && (window as any).turnstile) {
        (window as any).turnstile.reset(widgetId)
    }
    emit('update:modelValue', '')
}

defineExpose({ reset })

onUnmounted(() => {
    if (pollTimer !== undefined) { clearInterval(pollTimer); pollTimer = undefined }
    if (widgetId !== undefined && (window as any).turnstile) {
        (window as any).turnstile.remove(widgetId)
    }
})
</script>

<style scoped>
.turnstile-wrap {
    display: flex;
    justify-content: center;
}
</style>
