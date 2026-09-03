<script setup lang="ts">
/**
 * Pole formularza — etykieta, kontrolka, podpowiedź i błąd jako jeden element.
 *
 * DLACZEGO
 * Audyt wykazał 201 pól, w których etykieta jest wprawdzie widoczna, ale nie jest
 * technicznie powiązana z kontrolką — czytnik ekranu odczytuje wtedy „pole
 * edycji” bez nazwy. Powiązanie `label for` ↔ `input id` trzeba by dopisać
 * ręcznie w każdym z tych miejsc. Tutaj robi to jeden komponent, raz.
 *
 * Przy okazji zamyka drugą rzecz z audytu: formularze „skakały”, bo komunikat
 * błędu pojawiał się jako nowy element i przesuwał wszystko poniżej. Miejsce na
 * komunikat jest tu rezerwowane z góry (`min-height`), więc układ stoi
 * nieruchomo niezależnie od tego, czy błąd jest widoczny.
 *
 * UŻYCIE
 *   <CzField v-slot="{ id, describedBy, invalid }" label="Marka" required :error="err">
 *       <select :id="id" :aria-describedby="describedBy" :aria-invalid="invalid" />
 *   </CzField>
 *
 * Slot dostaje gotowe `id` i `aria-*`, więc opakować można dowolną kontrolkę —
 * także `SmartSelect` czy pole z maską — bez dublowania logiki dostępności.
 */
const props = defineProps<{
    label?: string
    /** Gwiazdka przy etykiecie plus `aria-required` na kontrolce. */
    required?: boolean
    /** Podpowiedź pod polem. Pomijana, gdy powtarza treść placeholdera. */
    hint?: string
    /** Komunikat błędu. Niepusty = pole w stanie błędu. */
    error?: string | null
    /** Ikona po lewej stronie etykiety. */
    icon?: string
    /** Pole zajmuje całą szerokość siatki formularza. */
    wide?: boolean
}>()

// Identyfikatory muszą być stabilne między serwerem a przeglądarką, inaczej
// Vue zgłasza rozjazd przy uwodnieniu. `useId()` Nuxta to gwarantuje.
const uid = useId()
const id = computed(() => `f-${uid}`)
const hintId = computed(() => `${id.value}-hint`)
const errorId = computed(() => `${id.value}-err`)

const invalid = computed(() => !!props.error)
const describedBy = computed(() => {
    const parts: string[] = []
    if (props.error) parts.push(errorId.value)
    else if (props.hint) parts.push(hintId.value)
    return parts.length ? parts.join(' ') : undefined
})
</script>

<template>
    <div class="cz-field" :class="{ 'cz-field--wide': wide, 'cz-field--invalid': invalid }">
        <label v-if="label" :for="id" class="cz-field-label">
            <CzIcon v-if="icon" :icon="icon" :size="14" />
            <span>{{ label }}</span>
            <span v-if="required" class="cz-field-req" aria-hidden="true">*</span>
        </label>

        <slot
            :id="id"
            :described-by="describedBy"
            :invalid="invalid"
            :required="required"
        />

        <!--
            Wiersz na komunikat istnieje zawsze, także pusty. Dzięki temu pokazanie
            błędu nie przesuwa pól poniżej — a to była jedna z rzeczy, które
            najbardziej psuły wrażenie dopracowania w formularzach.
        -->
        <p class="cz-field-msg" :class="{ 'is-error': invalid }">
            <template v-if="error">
                <CzIcon icon="mdi-alert-circle-outline" :size="13" />
                <span :id="errorId" role="alert">{{ error }}</span>
            </template>
            <template v-else-if="hint">
                <CzIcon icon="mdi-information-outline" :size="13" />
                <span :id="hintId">{{ hint }}</span>
            </template>
        </p>
    </div>
</template>

<style lang="scss" scoped>
.cz-field {
    display: flex;
    flex-direction: column;
    gap: $s-15;
    min-width: 0;

    &--wide { grid-column: 1 / -1; }
}

.cz-field-label {
    display: flex;
    align-items: center;
    gap: $s-15;
    font-size: $fs-sm;
    font-weight: $fw-semibold;
    color: $text-muted;
    // Etykieta jest celem kliknięcia dla swojej kontrolki - kursor ma to zdradzać.
    cursor: pointer;
    width: fit-content;

    .cz-icon { color: $text-dark; }
}

.cz-field-req {
    color: $red-text;
    font-weight: $fw-bold;
    line-height: 1;
}

.cz-field-msg {
    display: flex;
    align-items: flex-start;
    gap: $s-1;
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: $text-dark;
    // Wysokość jednego wiersza, rezerwowana niezależnie od treści.
    min-height: 17px;

    .cz-icon { margin-top: 1px; }

    &.is-error {
        color: $danger;
        .cz-icon { color: $danger; }
    }
}

// Stan błędu przenosi się na kontrolkę w środku, bez potrzeby wiązania klas
// w miejscu użycia.
.cz-field--invalid :slotted(input),
.cz-field--invalid :slotted(select),
.cz-field--invalid :slotted(textarea) {
    border-color: rgba($danger, 0.65);
}
</style>
