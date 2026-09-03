<script setup lang="ts">
/**
 * Potwierdzenie akcji nieodwracalnej.
 *
 * Powód powstania: usunięcie ogłoszenia było możliwe jednym kliknięciem, bez
 * pytania i bez pokazania konsekwencji. Ten komponent wymusza świadomą decyzję i
 * jest jednym miejscem, w którym wygląda ona tak samo w całym portalu.
 *
 * Świadomie NIE jest to pełnoekranowy modal ze złożoną zawartością — właściciel
 * nie chce wrażenia „strony w środku strony". To wąski dialog z jednym pytaniem,
 * jasnym skutkiem i dwiema akcjami, gdzie bezpieczna jest domyślna.
 */
withDefaults(defineProps<{
    modelValue: boolean
    title: string
    /** Co dokładnie się stanie — użytkownik musi to wiedzieć przed kliknięciem */
    message: string
    confirmLabel?: string
    cancelLabel?: string
    /** danger dla akcji niszczących (usuwanie), primary dla zwykłego potwierdzenia */
    tone?: 'danger' | 'primary'
    loading?: boolean
}>(), {
    confirmLabel: 'Potwierdź',
    cancelLabel: 'Anuluj',
    tone: 'danger',
})

const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: [] }>()

function close() { emit('update:modelValue', false) }
</script>

<template>
    <Teleport to="body">
        <Transition name="cz-dlg">
            <div
                v-if="modelValue"
                class="cz-dlg-backdrop"
                role="dialog"
                aria-modal="true"
                :aria-label="title"
                @click.self="close"
                @keydown.esc="close"
            >
                <div class="cz-dlg">
                    <div class="cz-dlg__icon" :class="`cz-dlg__icon--${tone}`">
                        <CzIcon :icon="tone === 'danger' ? 'mdi-alert-outline' : 'mdi-help-circle-outline'" size="26" />
                    </div>
                    <h3 class="cz-dlg__title">{{ title }}</h3>
                    <p class="cz-dlg__msg">{{ message }}</p>
                    <div class="cz-dlg__actions">
                        <!-- Anuluj jest pierwsze i wizualnie spokojniejsze: przy akcji
                             nieodwracalnej bezpieczny wybór ma być łatwiejszy. -->
                        <CzButton variant="secondary" :disabled="loading" @click="close">{{ cancelLabel }}</CzButton>
                        <CzButton
                            :variant="tone === 'danger' ? 'danger' : 'primary'"
                            :loading="loading"
                            @click="emit('confirm')"
                        >{{ confirmLabel }}</CzButton>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped lang="scss">
.cz-dlg-backdrop {
    position: fixed;
    inset: 0;
    z-index: 3000;
    background: rgba(0, 0, 0, .72);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $s-4;
}

.cz-dlg {
    background: $card;
    border: 1px solid $border;
    border-radius: $r-md;
    box-shadow: $shadow-lg;
    padding: $s-6;
    width: 100%;
    max-width: 420px;
    text-align: center;
}

.cz-dlg__icon {
    width: 52px;
    height: 52px;
    border-radius: $r-pill;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $s-4;

    &--danger  { background: rgba(229, 57, 53, .14); color: $danger; }
    &--primary { background: $red-glow; color: $red-hot; }
}

.cz-dlg__title {
    margin: 0 0 $s-2;
    font-size: $fs-xl;
    font-weight: $fw-bold;
    color: $text;
}

.cz-dlg__msg {
    margin: 0 0 $s-6;
    font-size: $fs-base;
    line-height: 1.55;
    color: $text-muted;
}

.cz-dlg__actions {
    display: flex;
    gap: $s-3;
    justify-content: center;

    // Na telefonie akcje idą w kolumnę i na pełną szerokość — łatwiej trafić.
    @media (max-width: $bp-phone) {
        flex-direction: column-reverse;
        :deep(.cz-btn) { width: 100%; }
    }
}

.cz-dlg-enter-active, .cz-dlg-leave-active { transition: opacity $t-base; }
.cz-dlg-enter-from, .cz-dlg-leave-to { opacity: 0; }
</style>
