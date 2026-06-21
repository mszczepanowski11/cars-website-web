<template>
    <Teleport to="body">
        <transition name="slide-up">
            <div v-if="visible" class="cookie-bar">
                <div class="cookie-inner">
                    <div class="cookie-text">
                        <v-icon icon="mdi-cookie-outline" size="20" class="cookie-icon" />
                        <span>
                            Używamy plików cookie, aby zapewnić najlepsze działanie serwisu.
                            Korzystając z CARIZO, akceptujesz naszą
                            <NuxtLink to="/polityka-prywatnosci" class="cookie-link">Politykę prywatności</NuxtLink>,
                            <NuxtLink to="/polityka-cookies" class="cookie-link">Politykę cookies</NuxtLink>
                            oraz
                            <NuxtLink to="/regulamin" class="cookie-link">Regulamin</NuxtLink>.
                        </span>
                    </div>
                    <div class="cookie-actions">
                        <button class="btn-reject" @click="reject">Tylko niezbędne</button>
                        <button class="btn-accept" @click="accept">Akceptuję</button>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
const visible = ref(false)

onMounted(() => {
    const stored = localStorage.getItem('cookieConsent')
    if (!stored) {
        visible.value = true
    } else {
        applyConsent(stored === 'all' ? 'all' : 'essential')
    }
    window.addEventListener('openCookieSettings', () => {
        visible.value = true
    })
})

function accept() {
    localStorage.setItem('cookieConsent', 'all')
    visible.value = false
    applyConsent('all')
    window.dispatchEvent(new Event('cookieConsentAccepted'))
}

function reject() {
    localStorage.setItem('cookieConsent', 'essential')
    visible.value = false
    applyConsent('essential')
}

function applyConsent(level: 'all' | 'essential') {
    if (typeof window === 'undefined' || typeof (window as any).gtag !== 'function') return
    const granted = level === 'all' ? 'granted' : 'denied'
    ;(window as any).gtag('consent', 'update', {
        analytics_storage: granted,
        ad_storage: granted,
        functionality_storage: granted,
        personalization_storage: granted,
    })
}
</script>

<style lang="scss" scoped>
.cookie-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: #0c0c0c;
    border-top: 1px solid $border;
    padding: 14px 0;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
}

.cookie-inner {
    @include container;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: space-between;
}

.cookie-text {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: $text-muted;
    flex: 1;
    min-width: 0;
    line-height: 1.5;
}

.cookie-icon {
    color: $text-dim;
    flex-shrink: 0;
    margin-top: 1px;
}

.cookie-link {
    color: $red;
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
}

.cookie-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.btn-reject {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 8px 16px;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-accept {
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 8px 20px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
}

.slide-up-enter-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-up-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-up-enter-from { transform: translateY(100%); opacity: 0; }
.slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
