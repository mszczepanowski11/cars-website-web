// Konfiguracja pól formularza dodawania ogłoszenia, per kategoria.
//
// Wydzielone z add-advert.vue (8913 linii). To CZYSTE DANE - bez stanu
// reaktywnego, bez odwołań do komponentu - więc przeniesienie jest mechaniczne
// i nie zmienia zachowania. Trzymanie 585 linii tablic konfiguracyjnych w tym
// samym pliku co szablon i logika formularza sprawiało, że najważniejszy
// formularz portalu był praktycznie nieczytelny.
//
// To ten mechanizm sprawia, że formularz "wie", jakie pola pokazać dla auta,
// motocykla, maszyny czy części - i dlatego użytkownik nie ogląda pól, które
// nie mają sensu dla wybranej kategorii.

export interface ExtraField {
    key: string
    label: string
    type: 'number' | 'select' | 'text' | 'boolean' | 'radio' | 'color-picker' | 'finish-picker'
    options?: { value: string; label: string }[]
    unit?: string
    placeholder?: string
    required?: boolean
    hint?: string
    fullWidth?: boolean
}

export interface CatFieldConfig {
    // Standard backend fields to show
    fields: string[]
    required: string[]
    // Whether brand uses API dropdown or free-text input. 'select-all' is a dropdown too, but
    // fetches the full unscoped brand list instead of brands linked to this category - for a
    // category like czesci where "brand" means "which vehicle brand this fits", not the part's
    // own brand, so scoping to czesci-linked brands (of which there are none) makes no sense.
    brandFieldType?: 'select' | 'text' | 'select-all'
    // Whether model uses API dropdown or free-text input; defaults to brandFieldType when unset
    // (used for categories with a real brand catalog but no per-brand model catalog yet)
    modelFieldType?: 'select' | 'text'
    // Extra category-specific fields (stored in description on submit)
    extraFields?: ExtraField[]
    // Dynamic labels
    brandLabel?: string
    modelLabel?: string
    yearLabel?: string
    mileageLabel?: string
    engineLabel?: string
    powerLabel?: string
    priceLabel?: string
    // Hints
    brandHint?: string
    modelHint?: string
    mileageHint?: string
    priceHint?: string
    yearHint?: string
    /** Placeholder w polu pojemnosci - sam przyklad wartosci, np. "np. 1995 cm3". */
    engineHint?: string
    /**
     * Dodatkowa podpowiedz POD polem pojemnosci. Celowo osobna od `engineHint`:
     * wczesniej jedna wartosc szla i w placeholder, i w podpowiedz, wiec uzytkownik
     * czytal ten sam przyklad dwa razy. Wypelniaj tylko wtedy, gdy jest do
     * przekazania cos, czego przyklad w polu nie mowi.
     */
    engineNote?: string
    categoryNote?: string
    // Step 1 section visibility
    showVinSection?: boolean
    showHistorySection?: boolean
    // Wizard "details" step title/desc override (default: "Dane pojazdu")
    detailsStepName?: string
    detailsStepDesc?: string
}

export const FINISH_SWATCHES: Record<string, string> = {
    solid: 'linear-gradient(135deg, #4a4a4a, #6b6b6b)',
    metallic: 'linear-gradient(135deg, #8e9aa3 0%, #d8dee2 30%, #6b7680 55%, #c7d0d4 80%, #838f98 100%)',
    pearl: 'linear-gradient(135deg, #f3e9f7 0%, #d9c7e8 25%, #f5f0fa 50%, #c9b8dd 75%, #efe4f4 100%)',
    matte: 'linear-gradient(135deg, #3a3a3d, #4d4d50)',
    bicolor: 'linear-gradient(115deg, #1a1a1a 0% 48%, #8B0D1D 52% 100%)',
    chrome: 'linear-gradient(135deg, #cfd8dc 0%, #ffffff 20%, #78909c 45%, #eceff1 65%, #607d8b 85%, #ffffff 100%)',
    multicolor: 'linear-gradient(115deg, #e63946 0%, #f4a261 20%, #e9c46a 40%, #2a9d8f 60%, #264653 80%, #8B0D1D 100%)',
}

export const CATEGORY_CONFIGS: Record<string, CatFieldConfig> = {
    'auta-osobowe': {
        fields: ['brand', 'model', 'generation', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price', 'bodyType'],
        required: ['brand', 'model', 'year', 'fuelType', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        priceHint: 'Rynek: 10 000 – 500 000 zł',
        engineHint: 'np. 1995 cm³ (2.0)',
        showVinSection: true,
        showHistorySection: true,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'new-demo', label: 'Nowy (demo)' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'driveType', label: 'Napęd', type: 'select',
              options: [
                { value: 'fwd', label: 'Przedni (FWD)' }, { value: 'rwd', label: 'Tylny (RWD)' },
                { value: 'awd', label: '4×4 stały (AWD)' }, { value: '4wd', label: '4×4 dołączany (4WD)' },
              ] },
            { key: 'doors', label: 'Liczba drzwi', type: 'select',
              options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6+' }] },
            { key: 'seatsCount', label: 'Liczba miejsc', type: 'select',
              options: [{ value: '2', label: '2' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '7', label: '7' }, { value: '8', label: '8' }, { value: '9', label: '9+' }] },
            { key: 'color', label: 'Kolor nadwozia', type: 'color-picker', fullWidth: true },
            { key: 'colorFinish', label: 'Wykończenie lakieru', type: 'finish-picker', fullWidth: true,
              options: [
                { value: 'solid', label: 'Pełny (solid)' }, { value: 'metallic', label: 'Metalik' },
                { value: 'pearl', label: 'Perłowy / efekt perły' }, { value: 'matte', label: 'Matowy' },
                { value: 'bicolor', label: 'Dwukolorowy' }, { value: 'chrome', label: 'Chromowany' },
              ] },
            { key: 'euroNorm', label: 'Norma emisji spalin', type: 'select',
              options: [
                { value: 'euro3', label: 'Euro 3' }, { value: 'euro4', label: 'Euro 4' },
                { value: 'euro5', label: 'Euro 5' }, { value: 'euro6', label: 'Euro 6' },
                { value: 'euro6d', label: 'Euro 6d / 6d-TEMP' },
              ] },
            { key: 'co2', label: 'Emisja CO₂', type: 'number', unit: 'g/km', placeholder: 'np. 120', hint: 'Emisja CO₂ w cyklu mieszanym' },
            { key: 'fuelConsumptionCity', label: 'Spalanie miasto', type: 'number', unit: 'l/100km', placeholder: 'np. 8.5' },
            { key: 'fuelConsumptionHwy', label: 'Spalanie trasa', type: 'number', unit: 'l/100km', placeholder: 'np. 5.5' },
            { key: 'fuelConsumptionMix', label: 'Spalanie mieszane', type: 'number', unit: 'l/100km', placeholder: 'np. 6.5' },
            { key: 'torque', label: 'Moment obrotowy', type: 'number', unit: 'Nm', placeholder: 'np. 400' },
            // Faza 4: firstOwner/noDamage/hasASO/testDrive/vatMargin/registeredInPoland/
            // rightHandDrive/tuning migrated to AttributeDefinition (rendered by DynamicAttributeField).
        ],
    },

    'dostawcze': {
        fields: ['brand', 'model', 'generation', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price'],
        required: ['brand', 'model', 'year', 'fuelType', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        priceHint: 'Rynek: 5 000 – 200 000 zł',
        categoryNote: 'Dostawcze i busy do 3,5t. Parametry ładunkowe wpisz poniżej.',
        showVinSection: true,
        showHistorySection: true,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 1000' },
            { key: 'gvw', label: 'DMC (dopuszczalna masa całkowita)', type: 'number', unit: 'kg', placeholder: 'np. 3500' },
            { key: 'curbWeight', label: 'Masa własna', type: 'number', unit: 'kg', placeholder: 'np. 2000' },
            { key: 'loadingLength', label: 'Długość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 3.5' },
            { key: 'cargoHeight', label: 'Wysokość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 1.9' },
            { key: 'color', label: 'Kolor', type: 'color-picker', fullWidth: true },
            { key: 'colorFinish', label: 'Wykończenie lakieru', type: 'finish-picker', fullWidth: true,
              options: [
                { value: 'solid', label: 'Pełny (solid)' }, { value: 'metallic', label: 'Metalik' },
                { value: 'pearl', label: 'Perłowy' }, { value: 'matte', label: 'Matowy' },
              ] },
            { key: 'euroNorm', label: 'Norma EURO', type: 'select',
              options: [{ value: 'euro3', label: 'Euro 3' }, { value: 'euro4', label: 'Euro 4' },
                        { value: 'euro5', label: 'Euro 5' }, { value: 'euro6', label: 'Euro 6' }, { value: 'euro6d', label: 'Euro 6d' }] },
            // Faza 4: loadingHeight/loadingWidth/hasAC/hasReverseCam/hasLiftgate/firstOwner
            // migrated to AttributeDefinition.
        ],
    },

    'ciezarowe': {
        fields: ['brand', 'model', 'generation', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price'],
        required: ['brand', 'model', 'year', 'fuelType', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        engineHint: 'np. 12 900 cm³',
        priceHint: 'Rynek: 10 000 – 1 000 000 zł',
        categoryNote: 'Pojazdy ciężarowe powyżej 3,5t. Uzupełnij dane techniczne poniżej.',
        showVinSection: true,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'axles', label: 'Liczba osi', type: 'select', required: true,
              options: [{ value: '2', label: '2 osie' }, { value: '3', label: '3 osie' },
                        { value: '4', label: '4 osie' }, { value: '5+', label: '5+ osi' }] },
            { key: 'gvw', label: 'DMC (tony)', type: 'number', unit: 't', placeholder: 'np. 26' },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 18000' },
            { key: 'curbWeight', label: 'Masa własna', type: 'number', unit: 'kg', placeholder: 'np. 8000' },
            { key: 'cargoHeight', label: 'Wysokość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 2.7' },
            { key: 'color', label: 'Kolor', type: 'color-picker', fullWidth: true },
            { key: 'euroNorm', label: 'Norma EURO', type: 'select',
              options: [{ value: 'euro3', label: 'Euro 3' }, { value: 'euro4', label: 'Euro 4' },
                        { value: 'euro5', label: 'Euro 5' }, { value: 'euro6', label: 'Euro 6' }, { value: 'euro6d', label: 'Euro 6d' }] },
            { key: 'hasTachograph', label: 'Tachograf cyfrowy', type: 'boolean' },
            { key: 'hasRetarder', label: 'Retarder (hamulec hydrodynamiczny)', type: 'boolean' },
            // Faza 4: cabType/hasAC/hasAPU/hasHydraulics/hasLiftAxle/hasADR/firstOwner
            // migrated to AttributeDefinition.
        ],
    },

    'czesci': {
        fields: ['brand', 'model', 'year', 'price'],
        required: ['price'],
        // "Marka" here means the vehicle brand this part fits, not the part's own brand - no
        // VehicleCategory-scoped brand set makes sense, so show every seeded brand instead.
        brandFieldType: 'select-all',
        brandLabel: 'Pasuje do marki pojazdu',
        modelLabel: 'Pasuje do modelu pojazdu',
        yearLabel: 'Rocznik pojazdu (do którego pasuje)',
        priceLabel: 'Cena części (zł)',
        brandHint: 'Wybierz markę pojazdu, do którego pasuje część',
        modelHint: 'Wybierz model pojazdu, do którego pasuje część',
        priceHint: 'Podaj cenę jednej sztuki',
        categoryNote: 'Części, akcesoria i wyposażenie. Podaj szczegóły części poniżej.',
        showVinSection: false,
        showHistorySection: false,
        // Kategoria/podkategoria części, strona montażu, numery katalogowe, producent i lista
        // pojazdów kompatybilnych mają dedykowane, prawdziwe pola (patrz blok "Części — dane
        // katalogowe" w szablonie) zamiast tego ogólnego mechanizmu extraFields, żeby trafiały
        // do bazy jako przeszukiwalne kolumny, a nie do wolnego tekstu opisu.
        extraFields: [
            { key: 'condition', label: 'Stan części', type: 'radio', required: true,
              options: [
                { value: 'new', label: 'Nowa' }, { value: 'regen', label: 'Regenerowana' },
                { value: 'used-good', label: 'Używana – dobry stan' }, { value: 'used', label: 'Używana' },
                { value: 'damaged', label: 'Uszkodzona / na części' },
              ] },
            // Faza 4: shipping/warranty migrated to AttributeDefinition.
        ],
    },

    'motocykle': {
        fields: ['brand', 'model', 'generation', 'year', 'fuelType', 'engine', 'power', 'mileage', 'price'],
        required: ['brand', 'model', 'year', 'fuelType', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        engineHint: 'np. 649 cm³, 1000 cm³',
        priceHint: 'Rynek: 1 000 – 150 000 zł',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'color', label: 'Kolor', type: 'color-picker', fullWidth: true },
            { key: 'colorFinish', label: 'Wykończenie lakieru', type: 'finish-picker', fullWidth: true,
              options: [
                { value: 'solid', label: 'Pełny (solid)' }, { value: 'metallic', label: 'Metalik' },
                { value: 'matte', label: 'Matowy' }, { value: 'multicolor', label: 'Wielobarwny / racing livery' },
              ] },
            // Faza 4: motorcycleType (required)/hasABS/hasTCS/hasQuickshifter/hasHeatedGrips/
            // hasCruiseControl/hasRideByWire/hasLedLights/hasSaddlebags/firstOwner/noDamage/
            // testDrive migrated to AttributeDefinition (motorcycleType stays required there).
        ],
    },

    'przyczepy': {
        fields: ['brand', 'model', 'year', 'price'],
        required: ['year', 'price'],
        yearLabel: 'Rok produkcji przyczepy',
        priceHint: 'Rynek: 500 – 200 000 zł',
        categoryNote: 'Przyczepy, naczepy i lawety. Uzupełnij dane ładunkowe poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona' }] },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 24000' },
            { key: 'gvw', label: 'DMC', type: 'number', unit: 'kg', placeholder: 'np. 39000' },
            { key: 'curbWeight', label: 'Masa własna', type: 'number', unit: 'kg', placeholder: 'np. 6000' },
            { key: 'length', label: 'Długość całkowita', type: 'number', unit: 'm', placeholder: 'np. 13.6' },
            { key: 'cargoHeight', label: 'Wysokość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 2.7' },
            { key: 'axles', label: 'Liczba osi', type: 'select',
              options: [{ value: '1', label: '1 oś' }, { value: '2', label: '2 osie' }, { value: '3', label: '3 osie' }, { value: '4+', label: '4+ osi' }] },
            // Faza 4: width/height/hasHydraulics/hasLift/hasBrakes migrated to AttributeDefinition.
        ],
    },

    'rolnicze': {
        fields: ['brand', 'model', 'year', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'price'],
        brandFieldType: 'text',
        brandLabel: 'Producent / marka',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        mileageLabel: 'Motogodziny (mth)',
        mileageHint: 'Liczba przepracowanych motogodzin',
        engineLabel: 'Pojemność silnika (cm³)',
        priceHint: 'Rynek: 5 000 – 2 000 000 zł',
        categoryNote: 'Ciągniki, kombajny i maszyny rolnicze. Uzupełnij parametry robocze poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan maszyny', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona / na części' }] },
            { key: 'workingWidth', label: 'Szerokość robocza', type: 'number', unit: 'm', placeholder: 'np. 6.0' },
            // Faza 4: engineHp/frontLoader/dualWheels/frontPTO/rearPTO/gps/fourWD/cabinAC/isobus
            // migrated to AttributeDefinition.
        ],
    },

    'budowlane': {
        fields: ['brand', 'model', 'year', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'price'],
        brandFieldType: 'text',
        brandLabel: 'Producent / marka',
        modelLabel: 'Model maszyny',
        yearLabel: 'Rok produkcji maszyny',
        mileageLabel: 'Motogodziny (mth)',
        mileageHint: 'Liczba przepracowanych motogodzin',
        engineLabel: 'Pojemność silnika (cm³)',
        priceHint: 'Rynek: 10 000 – 5 000 000 zł',
        categoryNote: 'Maszyny budowlane i drogowe. Uzupełnij parametry poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan maszyny', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona / na części' }] },
            { key: 'operatingWeight', label: 'Masa robocza maszyny', type: 'number', unit: 'kg', placeholder: 'np. 20000' },
            // Faza 4: liftCapacity/workingHeight/hasHydraulics/hasCabin/hasAC/hasGPS migrated to
            // AttributeDefinition.
        ],
    },

    'maszyny': {
        fields: ['brand', 'model', 'year', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'price'],
        brandFieldType: 'text',
        brandLabel: 'Producent / marka maszyny',
        modelLabel: 'Model maszyny',
        yearLabel: 'Rok produkcji maszyny',
        mileageLabel: 'Motogodziny (mth)',
        mileageHint: 'Liczba przepracowanych motogodzin',
        engineLabel: 'Pojemność silnika (cm³)',
        priceHint: 'Rynek: 5 000 – 5 000 000 zł',
        categoryNote: 'Wózki widłowe, dźwigi, żurawie, maszyny przemysłowe. Typ i parametry uzupełnij poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan maszyny', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona' }] },
            // Faza 4: liftCapacity/workingHeight/hasAC/hasCabin migrated to AttributeDefinition.
        ],
    },

    'inne': {
        fields: ['brand', 'model', 'year', 'mileage', 'price'],
        required: ['price'],
        // Catch-all miscellaneous-vehicle category - no natural brand catalog to scope to,
        // same free-text convention as rolnicze/budowlane/maszyny.
        brandFieldType: 'text',
        mileageLabel: 'Przebieg (km)',
        priceHint: 'Podaj cenę pojazdu',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio',
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }] },
        ],
    },

    // ── Kategorie dodane w ramach rozszerzenia 10 -> 17 ──────────────────────
    // Rodzaj (np. "Jacht żaglowy", "Naczepa chłodnia") wybiera się przez sekcję
    // "Rodzaj pojazdu" zasilaną prawdziwymi VehicleSubtype, nie przez extraFields - tak samo
    // jak przyczepy/rolnicze/budowlane/maszyny/ciezarowe/dostawcze od czasu usunięcia ich
    // zdublowanych wolnotekstowych selectów (bodyVariant/trailerType/machineType/truckType).
    // extraFields tu ograniczone do pól bez naturalnego miejsca gdzie indziej.
    'lodzie-i-jachty': {
        fields: ['brand', 'model', 'year', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Producent / stocznia',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        mileageLabel: 'Godziny pracy silnika (mth)',
        mileageHint: 'Liczba przepracowanych motogodzin (jeśli dotyczy)',
        engineLabel: 'Pojemność silnika (cm³)',
        priceHint: 'Rynek: 5 000 – 2 000 000 zł',
        categoryNote: 'Łodzie, jachty i pontony. Wybierz rodzaj jednostki poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona' }] },
            // Faza 4: hullMaterial/lengthM migrated to AttributeDefinition.
        ],
    },

    'kampery': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price'],
        required: ['year', 'fuelType', 'mileage', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Marka pojazdu bazowego',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        priceHint: 'Rynek: 20 000 – 1 000 000 zł',
        categoryNote: 'Kampery i pojazdy rekreacyjne. Wybierz rodzaj zabudowy poniżej.',
        showVinSection: true,
        showHistorySection: true,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            // Faza 4: berths migrated to AttributeDefinition.
        ],
    },

    'quady-atv': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'fuelType', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Marka',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        engineLabel: 'Pojemność silnika (cm³)',
        priceHint: 'Rynek: 3 000 – 150 000 zł',
        categoryNote: 'Quady, ATV i pojazdy SSV/UTV. Wybierz rodzaj poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
        ],
    },

    'skutery-wodne': {
        fields: ['brand', 'model', 'year', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Marka',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        mileageLabel: 'Godziny pracy silnika (mth)',
        mileageHint: 'Liczba przepracowanych motogodzin',
        engineLabel: 'Pojemność silnika (cm³)',
        priceHint: 'Rynek: 5 000 – 150 000 zł',
        categoryNote: 'Skutery wodne. Wybierz rodzaj poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
        ],
    },

    'autobusy': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price'],
        required: ['year', 'fuelType', 'mileage', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Marka',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        priceHint: 'Rynek: 10 000 – 1 500 000 zł',
        categoryNote: 'Autobusy, minibusy i autokary. Wybierz rodzaj poniżej.',
        showVinSection: true,
        showHistorySection: true,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'seatsCount', label: 'Liczba miejsc siedzących', type: 'number', placeholder: 'np. 49' },
        ],
    },

    'naczepy': {
        fields: ['brand', 'model', 'year', 'price'],
        required: ['year', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Producent',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        priceHint: 'Rynek: 5 000 – 300 000 zł',
        categoryNote: 'Naczepy ciągnięte przez ciągnik siodłowy. Wybierz rodzaj poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona' }] },
            { key: 'axles', label: 'Liczba osi', type: 'select',
              options: [{ value: '1', label: '1 oś' }, { value: '2', label: '2 osie' }, { value: '3', label: '3 osie' }, { value: '4+', label: '4+ osi' }] },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 24000' },
            { key: 'gvw', label: 'DMC', type: 'number', unit: 'kg', placeholder: 'np. 39000' },
            { key: 'curbWeight', label: 'Masa własna', type: 'number', unit: 'kg', placeholder: 'np. 7000' },
            { key: 'cargoHeight', label: 'Wysokość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 2.7' },
        ],
    },

    'wozki-widlowe': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'mileage', 'price'],
        required: ['year', 'price'],
        modelFieldType: 'text',
        brandLabel: 'Producent / marka',
        modelLabel: 'Model',
        yearLabel: 'Rok produkcji',
        mileageLabel: 'Motogodziny (mth)',
        mileageHint: 'Liczba przepracowanych motogodzin',
        priceHint: 'Rynek: 5 000 – 300 000 zł',
        categoryNote: 'Wózki widłowe i magazynowe. Wybierz rodzaj poniżej.',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            // Faza 4: liftCapacity migrated to AttributeDefinition.
        ],
    },

    // ── Faza 6: Opony, Felgi, Akcesoria, Usługi motoryzacyjne ────────────────
    // Wszystkie 4 nie mają hardkodowanych extraFields — ich specyfika (rozmiar opony/felgi, typ
    // akcesorium, typ usługi itd.) przychodzi wyłącznie z AttributeDefinition (Faza 3/5), więc
    // te configi ograniczają się do tego, które z ~90 "twardych" pól CarAdvert w ogóle pokazać.
    // Opony/Felgi: NIE używają taksonomii pojazdu (marka/model) - to były przerobione pola
    // "Producent opon"/"Linia produktowa", mylące dla użytkownika. Właściwe pola (rozmiar, sezon,
    // DOT, ET, PCD, materiał, producent opon/felg...) przychodzą w całości z AttributeDefinition
    // (renderowane jako "Dodatkowe informacje"). Zostaje tylko cena + opcjonalny "Rodzaj pojazdu"
    // (do jakiego typu pojazdu pasują), jeśli kategoria ma podtypy.
    'opony': {
        fields: ['price'],
        required: ['price'],
        detailsStepName: 'Dane opon',
        detailsStepDesc: 'Rozmiar, sezon, stan',
        priceHint: 'Rynek: 100 – 5 000 zł za sztukę / komplet',
        categoryNote: 'Opony do wszystkich typów pojazdów. Uzupełnij rozmiar i parametry poniżej.',
        showVinSection: false,
        showHistorySection: false,
    },

    'felgi': {
        fields: ['price'],
        required: ['price'],
        detailsStepName: 'Dane felg',
        detailsStepDesc: 'Rozmiar, rozstaw śrub, materiał',
        priceHint: 'Rynek: 200 – 10 000 zł za sztukę / komplet',
        categoryNote: 'Felgi do wszystkich typów pojazdów. Uzupełnij rozmiar i parametry poniżej.',
        showVinSection: false,
        showHistorySection: false,
    },

    'akcesoria': {
        fields: ['price'],
        required: ['price'],
        detailsStepName: 'Szczegóły',
        detailsStepDesc: 'Typ, stan, dopasowanie',
        priceHint: 'Podaj cenę akcesorium',
        categoryNote: 'Akcesoria i wyposażenie dodatkowe. Typ i szczegóły uzupełnij poniżej.',
        showVinSection: false,
        showHistorySection: false,
    },

    // Jedyna kategoria semantycznie niepojazdowa - pusty `fields` ukrywa całą taksonomię
    // pojazdu (marka/model/rok/paliwo/silnik/moc/skrzynia/przebieg/nadwozie), zostaje tylko cena
    // (renderowana bez względu na `fields`, patrz pole Cena w kroku 5) i pola usługowe przez
    // AttributeDefinition (typ usługi, obszar działania, godziny, telefon).
    'uslugi-motoryzacyjne': {
        fields: [],
        required: ['price'],
        detailsStepName: 'Szczegóły usługi',
        detailsStepDesc: 'Typ usługi, obszar, kontakt',
        priceLabel: 'Cena usługi (zł)',
        priceHint: 'Podaj cenę usługi lub cenę od',
        categoryNote: 'Usługi motoryzacyjne (warsztaty, wulkanizacja, detailing itd.) — to nie jest ogłoszenie pojazdu. Uzupełnij szczegóły usługi poniżej.',
        showVinSection: false,
        showHistorySection: false,
    },
}

export const DEFAULT_CAT_CONFIG: CatFieldConfig = {
    fields: ['brand', 'model', 'generation', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price', 'bodyType'],
    required: ['brand', 'model', 'year', 'mileage', 'price'],
    mileageLabel: 'Przebieg (km)',
}

export const SUBTYPE_EXTRA_FIELDS: Record<string, ExtraField[]> = {
  // ── Trucks ──────────────────────────────────────────────────────────────
  'chlodnia-ciezarowa': [
    { key: 'tankCapacity', label: 'Objętość ładowni (m³)', type: 'number', unit: 'm³' },
  ],
  'cysterna': [
    { key: 'tankCapacity', label: 'Pojemność zbiornika (m³)', type: 'number', unit: 'm³' },
  ],

  // ── Agricultural ────────────────────────────────────────────────────────
  'kombajn': [
    { key: 'workingWidth', label: 'Szerokość heder (cm)', type: 'number', unit: 'cm' },
    { key: 'tankCapacity', label: 'Pojemność zbiornika ziarna (L)', type: 'number', unit: 'L' },
  ],
  'opryskiwacz': [
    { key: 'workingWidth', label: 'Szerokość robocza (m)', type: 'number', unit: 'm' },
    { key: 'tankCapacity', label: 'Pojemność zbiornika (L)', type: 'number', unit: 'L' },
  ],
  'prasa': [
    { key: 'workingWidth', label: 'Szerokość podbierania (cm)', type: 'number', unit: 'cm' },
  ],
  'siewnik': [
    { key: 'workingWidth', label: 'Szerokość robocza (m)', type: 'number', unit: 'm' },
    { key: 'tankCapacity', label: 'Pojemność skrzyni nasiennej (L)', type: 'number', unit: 'L' },
  ],

  // ── Construction ─────────────────────────────────────────────────────────
  'koparka': [
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'maxDiggingDepth', label: 'Max. głębokość kopania (m)', type: 'number', unit: 'm' },
    { key: 'bucketCapacity', label: 'Pojemność łyżki (L)', type: 'number', unit: 'L' },
  ],
  'minikopiarka': [
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'maxDiggingDepth', label: 'Max. głębokość kopania (m)', type: 'number', unit: 'm' },
    { key: 'bucketCapacity', label: 'Pojemność łyżki (L)', type: 'number', unit: 'L' },
  ],
  'ladowarka': [
    { key: 'bucketCapacity', label: 'Pojemność łyżki (m³)', type: 'number', unit: 'm³' },
  ],
  'spycharka': [
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
  ],
  'walec': [
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'workingWidth', label: 'Szerokość robocza (cm)', type: 'number', unit: 'cm' },
  ],
}

export const EF_LOCK_MAP: Record<string, keyof typeof engineLocked> = {
    fuelConsumptionCity: 'consumptionCity',
    fuelConsumptionHwy: 'consumptionHwy',
    fuelConsumptionMix: 'consumptionMix',
    torque:       'torque',
    co2:          'co2',
    euroNorm:     'euroNorm',
    acceleration: 'acceleration',
    driveType:    'driveType',
}
