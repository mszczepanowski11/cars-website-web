<template>
    <Teleport to="body">
        <div class="toast-container" aria-live="polite">
            <TransitionGroup name="toast" tag="div" class="toast-list">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast"
                    :class="`toast--${toast.type}`"
                    role="alert"
                    @click="dismiss(toast.id)"
                >
                    <div class="toast-icon-wrap">
                        <v-icon :icon="iconFor(toast.type)" size="18" />
                    </div>
                    <div class="toast-body">
                        <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
                        <div class="toast-message">{{ toast.message }}</div>
                    </div>
                    <button class="toast-close" @click.stop="dismiss(toast.id)" aria-label="Zamknij">
                        <v-icon icon="mdi-close" size="14" />
                    </button>
                    <div class="toast-progress" :style="{ animationDuration: toast.duration + 'ms' }" />
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

function iconFor(type: ToastType): string {
    const map: Record<ToastType, string> = {
        success: 'mdi-check-circle-outline',
        error: 'mdi-alert-circle-outline',
        info: 'mdi-information-outline',
        warning: 'mdi-alert-outline',
    }
    return map[type]
}
</script>

<style lang="scss" scoped>
.toast-container {
    position: fixed;
    bottom: 28px;
    right: 24px;
    z-index: 9999;
    pointer-events: none;

    @include respond-to(sm) {
        bottom: 16px;
        right: 12px;
        left: 12px;
    }
}

.toast-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;

    @include respond-to(sm) { align-items: stretch; }
}

.toast {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 320px;
    max-width: 420px;
    background: #111;
    border: 1px solid $border;
    border-radius: $r-lg;
    padding: 14px 16px 18px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.7);
    cursor: pointer;
    pointer-events: all;
    overflow: hidden;
    position: relative;

    @include respond-to(sm) {
        min-width: 0;
        max-width: 100%;
    }

    &--success {
        border-color: rgba(76,175,80,0.3);
        .toast-icon-wrap { background: rgba(76,175,80,0.12); color: #4caf50; }
        .toast-progress { background: #4caf50; }
    }
    &--error {
        border-color: rgba(220,60,60,0.35);
        .toast-icon-wrap { background: rgba(220,60,60,0.12); color: #e55; }
        .toast-progress { background: #e55; }
    }
    &--info {
        border-color: rgba(33,150,243,0.3);
        .toast-icon-wrap { background: rgba(33,150,243,0.12); color: #2196f3; }
        .toast-progress { background: #2196f3; }
    }
    &--warning {
        border-color: rgba(255,152,0,0.3);
        .toast-icon-wrap { background: rgba(255,152,0,0.12); color: #ff9800; }
        .toast-progress { background: #ff9800; }
    }
}

.toast-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.toast-body {
    flex: 1;
    min-width: 0;
    padding-top: 1px;
}

.toast-title {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 3px;
}

.toast-message {
    font-size: 13px;
    color: $text-muted;
    line-height: 1.5;
}

.toast-close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: $text-dark;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    &:hover { background: rgba(255,255,255,0.07); color: $text; }
}

.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    transform-origin: left;
    animation: toast-shrink linear forwards;
    opacity: 0.7;
    border-radius: 0 0 $r-lg $r-lg;
}

@keyframes toast-shrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
}

// TransitionGroup animations
.toast-enter-active {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
    transition: all 0.25s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(40px) scale(0.92);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(40px) scale(0.92);
}
.toast-move {
    transition: transform 0.3s ease;
}
</style>
