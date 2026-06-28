<template>
    <!-- ── Success screen ──────────────────────────────────────────────────── -->
    <Transition name="success-fade">
        <div v-if="showSuccess" class="success-screen">
            <div class="success-card">
                <div class="success-confetti">
                    <span v-for="i in 12" :key="i" class="confetti-dot" :style="{ '--i': i }" />
                </div>
                <img src="/carizo-logo.svg" alt="CARIZO" class="success-logo" />
                <div class="success-icon-wrap">
                    <v-icon icon="mdi-check-circle" size="52" class="success-icon" />
                </div>
                <h1 class="success-title">Dziękujemy za dodanie ogłoszenia!</h1>
                <p class="success-desc">
                    Twoje ogłoszenie zostało pomyślnie zapisane i opublikowane w serwisie CARIZO.<br>
                    Gratulujemy — życzymy szybkiej sprzedaży!
                </p>
                <div class="success-actions">
                    <NuxtLink v-if="publishedAdvertId" :to="`/advert/${publishedAdvertId}`" class="sact-btn sact-btn--primary">
                        <v-icon icon="mdi-arrow-right-circle-outline" size="18" />
                        Zobacz swoje ogłoszenie
                    </NuxtLink>
                    <NuxtLink to="/add-advert" class="sact-btn sact-btn--secondary" @click="showSuccess = false">
                        <v-icon icon="mdi-plus-circle-outline" size="17" />
                        Dodaj kolejne ogłoszenie
                    </NuxtLink>
                    <NuxtLink to="/" class="sact-btn sact-btn--ghost">
                        <v-icon icon="mdi-home-outline" size="17" />
                        Strona główna
                    </NuxtLink>
                </div>
                <div class="success-tip">
                    <v-icon icon="mdi-lightbulb-outline" size="15" class="tip-icon" />
                    <span>Wyróżnij ogłoszenie — <NuxtLink v-if="publishedAdvertId" :to="`/promote-advert/${publishedAdvertId}`" class="tip-link">kup promocję</NuxtLink> i sprzedaj szybciej!</span>
                </div>
            </div>
        </div>
    </Transition>

    <div class="add-page">

        <!-- Top bar -->
        <div class="top-bar">
            <div class="top-left">
                <img src="/carizo-logo.svg" alt="CARIZO" class="tl-logo" />
                <button class="back-btn" @click="navigateTo('/dashboard')">
                    <v-icon icon="mdi-arrow-left" size="16" />
                    Wróć do panelu
                </button>
            </div>
            <div class="top-center">{{ isEdit ? 'Edytuj ogłoszenie' : 'Dodaj ogłoszenie' }}</div>
            <div class="top-right">
                <button class="btn-draft" :class="{ 'btn-draft--saved': draftSaved }" @click="saveDraft">
                    <v-icon :icon="draftSaved ? 'mdi-check' : 'mdi-content-save-outline'" size="16" />
                    {{ draftSaved ? 'Zapisano!' : 'Zapisz szkic' }}
                </button>
                <button class="btn-close" aria-label="Zamknij i wróć do ogłoszeń" @click="navigateTo('/my-adverts')">
                    <v-icon icon="mdi-close" size="18" />
                </button>
            </div>
        </div>

        <!-- Mobile step progress (hidden on desktop where left sidebar shows) -->
        <div class="mobile-step-bar">
            <div class="mobile-step-label">Krok {{ currentStep + 1 }} z {{ steps.length }}: {{ steps[currentStep]?.name }}</div>
            <div class="mobile-step-track">
                <div class="mobile-step-fill" :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }" />
            </div>
        </div>

        <!-- Body -->
        <div class="page-body">

            <!-- Left sidebar -->
            <aside class="left-sidebar">
                <nav class="steps-nav">
                    <div v-for="(step, i) in steps" :key="i"
                        class="step-item"
                        :class="{ 'step-active': currentStep === i, 'step-done': currentStep > i }"
                        @click="currentStep > i && (currentStep = i)">
                        <div class="step-num">
                            <v-icon v-if="currentStep > i" icon="mdi-check" size="13" />
                            <span v-else>{{ i + 1 }}</span>
                        </div>
                        <div class="step-info">
                            <div class="step-name">{{ step.name }}</div>
                            <div class="step-desc">{{ step.desc }}</div>
                        </div>
                    </div>
                </nav>
                <div class="sidebar-help">
                    <v-icon icon="mdi-help-circle-outline" size="20" class="help-icon" />
                    <div>
                        <div class="help-title">Potrzebujesz pomocy?</div>
                        <p class="help-sub">Sprawdź poradnik jak dodać najlepsze ogłoszenie</p>
                        <NuxtLink to="/jak-to-dziala" target="_blank" rel="noopener noreferrer" class="help-link">Zobacz poradnik →</NuxtLink>
                    </div>
                </div>
            </aside>

            <!-- Center -->
            <main class="center-area">

                <!-- Hero -->
                <div class="form-hero">
                    <div class="form-hero-text">
                        <h1>Dodaj swoje auto.</h1>
                        <p>Stwórz premium ogłoszenie w kilka minut.</p>
                    </div>
                </div>

                <!-- Progress -->
                <div class="progress-track">
                    <div v-for="(ps, i) in progressSteps" :key="i"
                        class="progress-node"
                        :class="{ 'pn-active': currentStep === i, 'pn-done': currentStep > i }">
                        <div class="pn-icon">
                            <v-icon :icon="ps.icon" size="16" />
                        </div>
                        <span class="pn-label">{{ ps.label }}</span>
                        <div v-if="i < progressSteps.length - 1" class="pn-line" />
                    </div>
                </div>

                <!-- Step 0: Basic info -->
                <div v-if="currentStep === 0" class="form-content">
                    <div class="form-section-head">
                        <h2>Wybierz kategorię</h2>
                        <p>Zaznacz typ pojazdu — formularz dostosuje się do wybranej kategorii.</p>
                    </div>

                    <!-- Category -->
                    <div class="field full-width" style="margin-bottom: 16px;">
                        <label class="flabel">Kategoria <span class="req">*</span></label>
                        <div class="category-grid">
                            <button
                                v-for="cat in advertCategories"
                                :key="cat.id"
                                type="button"
                                class="cat-choice-btn"
                                :class="{ active: form.categoryId === cat.id }"
                                @click="onCategory(cat.id)"
                            >
                                <div class="ccb-icon-wrap">
                                    <v-icon :icon="cat.iconName" size="28" />
                                </div>
                                <span class="ccb-name">{{ cat.name }}</span>
                                <span v-if="cat.advertCount" class="ccb-count">{{ cat.advertCount.toLocaleString('pl') }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Category context banner -->
                    <transition name="fade-err">
                        <div v-if="selectedCategory" class="cat-context-bar">
                            <v-icon :icon="selectedCategory.iconName" size="14" class="ccb-icon" />
                            <span><strong>{{ selectedCategory.name }}</strong> — formularz dostosowany do tej kategorii</span>
                            <span class="ccb-count">{{ selectedCategory.advertCount?.toLocaleString('pl') ?? '' }} ogłoszeń</span>
                        </div>
                    </transition>

                    <!-- Category note (special instructions per category) -->
                    <transition name="fade-err">
                        <div v-if="categoryConfig.categoryNote" class="cat-note-bar">
                            <v-icon icon="mdi-lightbulb-outline" size="14" class="cnb-icon" />
                            <span>{{ categoryConfig.categoryNote }}</span>
                        </div>
                    </transition>
                </div>

                <!-- ════════════════════════════════════════════════════════════ -->
                <!-- Step 1: Dane pojazdu                                        -->
                <!-- ════════════════════════════════════════════════════════════ -->
                <div v-else-if="currentStep === 1" class="form-content">
                    <div class="form-section-head">
                        <h2>Dane pojazdu</h2>
                        <p>Podaj dane techniczne i identyfikacyjne pojazdu.</p>
                    </div>
                    <div class="fields-grid">

                        <!-- Vehicle Subtype -->
                        <div v-if="subtypes.length > 0" class="field full-width">
                            <label class="flabel">
                                Rodzaj pojazdu <span class="req">*</span>
                            </label>
                            <SmartSelect
                                v-model="form.vehicleSubtypeId"
                                :options="subtypes.map(s => ({ value: s.id, label: s.name }))"
                                placeholder="Wybierz rodzaj pojazdu"
                            />
                        </div>

                        <!-- Brand: SmartSelect for known categories, text input for specialized machinery -->
                        <div v-if="isFieldVisible('brand')" class="field">
                            <label class="flabel">
                                {{ categoryConfig.brandLabel ?? 'Marka' }}
                                <span v-if="isFieldRequired('brand')" class="req">*</span>
                            </label>
                            <template v-if="categoryConfig.brandFieldType === 'text'">
                                <input
                                    v-model="brandTextInput"
                                    type="text"
                                    class="finput"
                                    :placeholder="`Wpisz ${(categoryConfig.brandLabel ?? 'markę').toLowerCase()}`"
                                />
                            </template>
                            <template v-else>
                                <SmartSelect
                                    v-model="form.brandId"
                                    :options="brandOptions"
                                    :placeholder="`Wybierz ${categoryConfig.brandLabel ?? 'markę'}`"
                                    search-placeholder="marki"
                                    prefix-icon="mdi-car-outline"
                                    @change="onBrand"
                                />
                            </template>
                            <div class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />
                                {{ categoryConfig.brandHint ?? `${brands.length} dostępnych marek` }}
                            </div>
                        </div>

                        <!-- Model -->
                        <div v-if="isFieldVisible('model')" class="field">
                            <label class="flabel">
                                {{ categoryConfig.modelLabel ?? 'Model' }}
                                <span v-if="isFieldRequired('model')" class="req">*</span>
                            </label>
                            <template v-if="categoryConfig.brandFieldType === 'text'">
                                <input
                                    v-model="modelTextInput"
                                    type="text"
                                    class="finput"
                                    :placeholder="`Wpisz ${(categoryConfig.modelLabel ?? 'model').toLowerCase()}`"
                                />
                            </template>
                            <template v-else>
                                <SmartSelect
                                    v-model="form.modelId"
                                    :options="modelOptions"
                                    :placeholder="`Wybierz ${categoryConfig.modelLabel ?? 'model'}`"
                                    search-placeholder="modele"
                                    :disabled="!form.brandId"
                                    @change="onModel"
                                />
                                <div class="field-hint">
                                    <template v-if="!form.brandId">
                                        <v-icon icon="mdi-arrow-up-left" size="12" />
                                        Najpierw wybierz {{ categoryConfig.brandLabel ?? 'markę' }}
                                    </template>
                                    <template v-else-if="models.length">
                                        <v-icon icon="mdi-information-outline" size="12" />
                                        {{ categoryConfig.modelHint ?? `${models.length} modeli dla ${brandName}` }}
                                    </template>
                                </div>
                                <!-- AI hint: popular models for selected brand -->
                                <div v-if="form.brandId && !form.modelId && models.length > 1" class="ai-hints">
                                    <span class="ai-hints-label">
                                        <v-icon icon="mdi-lightning-bolt" size="12" />
                                        Popularne:
                                    </span>
                                    <button
                                        v-for="m in models.slice(0, 5)"
                                        :key="m.id"
                                        type="button"
                                        class="ai-hint-chip"
                                        @click="form.modelId = m.id; onModel()"
                                    >
                                        {{ m.name }}
                                    </button>
                                </div>
                            </template>
                        </div>

                        <!-- Generation (cars only) -->
                        <div v-if="isFieldVisible('generation') && generations.length" class="field">
                            <label class="flabel">Generacja / wersja</label>
                            <SmartSelect
                                v-model="form.generationId"
                                :options="generationOptions"
                                placeholder="Wybierz generację (opcjonalnie)"
                                search-placeholder="generacji"
                                :disabled="!form.modelId"
                                @change="onGen"
                            />
                            <div class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />{{ generations.length }} generacji dostępnych
                            </div>
                        </div>

                        <!-- Trim / Version (optional, shown when trims exist for generation) -->
                        <div v-if="isFieldVisible('generation') && trims.length" class="field">
                            <label class="flabel">Wersja wyposażenia</label>
                            <SmartSelect
                                v-model="form.trimId"
                                :options="trims.map((t: any) => ({ value: t.id, label: t.name }))"
                                placeholder="Wybierz wersję (opcjonalnie)"
                                prefix-icon="mdi-car-cog"
                                search-placeholder="wersji"
                                :disabled="!form.generationId"
                                @change="onTrim"
                            />
                            <div class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />{{ trims.length }} wersji dostępnych
                            </div>
                        </div>

                        <!-- Engine version (loaded after generation selection) -->
                        <div v-if="isFieldVisible('generation') && engines.length" class="field">
                            <label class="flabel">Wersja silnika</label>
                            <SmartSelect
                                v-model="form.engineVersionId"
                                :options="engineOptions"
                                placeholder="Wybierz wersję silnika (opcjonalnie)"
                                prefix-icon="mdi-engine-outline"
                                search-placeholder="wersji silnika"
                                @change="onEngineVersionChange(form.engineVersionId)"
                            />
                            <div class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />{{ engines.length }} wersji silnika dostępnych
                            </div>
                            <!-- AI hint: popular engine versions -->
                            <div v-if="!form.engineVersionId && engines.length > 1" class="ai-hints">
                                <span class="ai-hints-label">
                                    <v-icon icon="mdi-lightning-bolt" size="12" />
                                    Popularne:
                                </span>
                                <button
                                    v-for="e in engines.slice(0, 5)"
                                    :key="e.id"
                                    type="button"
                                    class="ai-hint-chip"
                                    @click="form.engineVersionId = e.id; onEngineVersionChange(e.id)"
                                >
                                    {{ e.name }}
                                </button>
                            </div>
                        </div>

                        <!-- Engine specs auto-fill preview -->
                        <div v-if="engineSpecs" class="field full-width">
                            <div class="engine-specs-preview">
                                <div class="esp-title">
                                    <v-icon icon="mdi-information-outline" size="13" />
                                    Dane techniczne pobrane automatycznie
                                </div>
                                <div class="esp-chips">
                                    <span v-if="engineSpecs.powerHP" class="esp-chip esp-chip--primary">{{ engineSpecs.powerHP }} KM</span>
                                    <span v-if="engineSpecs.torqueNm" class="esp-chip esp-chip--primary">{{ engineSpecs.torqueNm }} Nm</span>
                                    <span v-if="engineSpecs.displacement" class="esp-chip esp-chip--secondary">{{ engineSpecs.displacement }} cm³</span>
                                    <span v-if="engineSpecs.acceleration0100" class="esp-chip esp-chip--secondary">0–100: {{ engineSpecs.acceleration0100 }}s</span>
                                    <span v-if="engineSpecs.topSpeedKmh" class="esp-chip esp-chip--secondary">Vmax: {{ engineSpecs.topSpeedKmh }} km/h</span>
                                    <span v-if="engineSpecs.co2EmissionGkm" class="esp-chip esp-chip--success">CO₂: {{ engineSpecs.co2EmissionGkm }} g/km</span>
                                    <span v-if="engineSpecs.euroNorm" class="esp-chip esp-chip--success">{{ engineSpecs.euroNorm }}</span>
                                    <span v-if="engineSpecs.avgConsumptionL" class="esp-chip esp-chip--success">{{ engineSpecs.avgConsumptionL }} l/100km</span>
                                </div>
                            </div>
                        </div>

                        <!-- Vehicle subtype — shown when subtypes exist for selected category -->
                        <div v-if="vehicleSubtypes.length > 0" class="field">
                            <label class="flabel">Podtyp pojazdu</label>
                            <SmartSelect
                                v-model="form.vehicleSubtypeId"
                                :options="vehicleSubtypeOptions"
                                placeholder="Np. Ciągnik siodłowy, Wywrotka..."
                                search-placeholder="podtypów"
                                clearable
                            />
                        </div>

                        <!-- Year -->
                        <div class="field">
                            <label class="flabel">
                                {{ categoryConfig.yearLabel ?? 'Rok produkcji' }} <span class="req">*</span>
                            </label>
                            <div class="input-icon-wrap">
                                <v-icon icon="mdi-calendar-outline" class="input-prefix" size="16" />
                                <input v-model.number="form.year" type="number"
                                    :class="['finput has-prefix', fieldErrors.year ? 'finput--error' : '']"
                                    placeholder="np. 2020" min="1900" :max="new Date().getFullYear() + 1" />
                            </div>
                            <div v-if="fieldErrors.year" class="field-error">
                                <v-icon icon="mdi-alert-circle-outline" size="12" />{{ fieldErrors.year }}
                            </div>
                            <div v-else-if="categoryConfig.yearHint" class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.yearHint }}
                            </div>
                        </div>

                        <!-- Fuel type (not shown for machinery/trailers/parts) -->
                        <div v-if="isFieldVisible('fuelType')" class="field">
                            <label class="flabel">
                                Rodzaj paliwa <span v-if="isFieldRequired('fuelType')" class="req">*</span>
                                <span v-if="engineLocked.fuelType" class="field-locked-badge">
                                    <v-icon icon="mdi-lock-outline" size="11" />z silnika
                                </span>
                            </label>
                            <SmartSelect
                                v-model="form.fuelTypeId"
                                :options="fuelTypeOptions"
                                placeholder="Wybierz rodzaj paliwa"
                                prefix-icon="mdi-gas-station-outline"
                                :disabled="engineLocked.fuelType"
                            />
                        </div>

                        <!-- Engine capacity -->
                        <div v-if="isFieldVisible('engine')" class="field">
                            <label class="flabel">
                                {{ categoryConfig.engineLabel ?? 'Pojemność silnika (cm³)' }}
                                <span v-if="engineLocked.capacity" class="field-locked-badge">
                                    <v-icon icon="mdi-lock-outline" size="11" />z silnika
                                </span>
                            </label>
                            <input v-model.number="form.engineCapacity" type="number" class="finput"
                                :class="{ 'finput--locked': engineLocked.capacity }"
                                :placeholder="categoryConfig.engineHint ?? 'np. 1995'"
                                :readonly="engineLocked.capacity" />
                            <div v-if="categoryConfig.engineHint" class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.engineHint }}
                            </div>
                        </div>

                        <!-- Power -->
                        <div v-if="isFieldVisible('power')" class="field">
                            <label class="flabel">
                                {{ categoryConfig.powerLabel ?? 'Moc (KM)' }}
                                <span v-if="engineLocked.power" class="field-locked-badge">
                                    <v-icon icon="mdi-lock-outline" size="11" />z silnika
                                </span>
                            </label>
                            <input v-model.number="form.power" type="number"
                                :class="['finput', engineLocked.power ? 'finput--locked' : '', fieldErrors.power ? 'finput--error' : '']"
                                placeholder="np. 150"
                                :readonly="engineLocked.power" />
                            <div v-if="fieldErrors.power" class="field-error">
                                <v-icon icon="mdi-alert-circle-outline" size="12" />{{ fieldErrors.power }}
                            </div>
                        </div>

                        <!-- Gearbox (not for machinery/trailers/parts/motorcycles) -->
                        <div v-if="isFieldVisible('gearbox')" class="field">
                            <label class="flabel">Skrzynia biegów</label>
                            <SmartSelect
                                v-model="form.gearboxId"
                                :options="gearboxOptions"
                                placeholder="Wybierz skrzynię biegów"
                                prefix-icon="mdi-car-shift-pattern"
                            />
                        </div>

                        <!-- Gear count -->
                        <div v-if="isFieldVisible('gearbox')" class="field">
                            <label class="flabel">Liczba biegów</label>
                            <select v-model="form.gearCount" class="finput">
                                <option :value="null">Nie podaję</option>
                                <option v-for="n in [4,5,6,7,8,9,10]" :key="n" :value="n">{{ n }}</option>
                            </select>
                        </div>

                        <!-- Metallic paint -->
                        <div v-if="isFieldVisible('color')" class="field">
                            <label class="flabel">Rodzaj lakieru</label>
                            <div class="radio-group">
                                <label class="radio-opt" :class="{ active: !form.metallicPaint }">
                                    <input type="radio" name="metallicPaint" :value="false" v-model="form.metallicPaint" hidden />
                                    Niemetalik
                                </label>
                                <label class="radio-opt" :class="{ active: form.metallicPaint }">
                                    <input type="radio" name="metallicPaint" :value="true" v-model="form.metallicPaint" hidden />
                                    Metalik
                                </label>
                            </div>
                        </div>

                        <!-- Mileage / Motohours (not for parts/trailers) -->
                        <div v-if="isFieldVisible('mileage')" class="field">
                            <label class="flabel">
                                {{ categoryConfig.mileageLabel ?? 'Przebieg (km)' }}
                                <span v-if="isFieldRequired('mileage')" class="req">*</span>
                            </label>
                            <div class="input-icon-wrap">
                                <v-icon
                                    :icon="categoryConfig.mileageLabel?.includes('mth') ? 'mdi-timer-outline' : 'mdi-speedometer'"
                                    class="input-prefix" size="16" />
                                <input v-model.number="form.mileage" type="number" min="0" max="2000000"
                                    :class="['finput has-prefix', fieldErrors.mileage ? 'finput--error' : '']"
                                    :placeholder="categoryConfig.mileageLabel?.includes('mth') ? 'np. 5 000' : 'np. 100 000'" />
                            </div>
                            <div v-if="fieldErrors.mileage" class="field-error">
                                <v-icon icon="mdi-alert-circle-outline" size="12" />{{ fieldErrors.mileage }}
                            </div>
                            <div v-else-if="categoryConfig.mileageHint" class="field-hint">
                                <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.mileageHint }}
                            </div>
                        </div>

                    </div>

                    <!-- ── Category-specific extra fields ─────────────────────────────────── -->
                    <transition name="fade-err">
                        <div v-if="categoryConfig.extraFields?.length" class="extra-fields-wrap">
                            <div class="form-section-subhead">Szczegóły ogłoszenia</div>
                            <div class="fields-grid">
                                <template v-for="ef in categoryConfig.extraFields" :key="ef.key">

                                    <!-- Radio (condition, type) -->
                                    <div v-if="ef.type === 'radio'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <div class="radio-group">
                                            <label v-for="opt in ef.options" :key="opt.value" class="radio-opt"
                                                :class="{ active: extras[ef.key] === opt.value }">
                                                <input type="radio" :name="ef.key" :value="opt.value"
                                                    v-model="extras[ef.key]" hidden />
                                                {{ opt.label }}
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Select -->
                                    <div v-else-if="ef.type === 'select'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">
                                            {{ ef.label }} <span v-if="ef.required" class="req">*</span>
                                            <span v-if="efIsLocked(ef.key)" class="field-locked-badge">
                                                <v-icon icon="mdi-lock-outline" size="11" />z silnika
                                            </span>
                                        </label>
                                        <SmartSelect
                                            :model-value="extras[ef.key]"
                                            @update:model-value="v => !efIsLocked(ef.key) && (extras[ef.key] = v)"
                                            :options="(ef.options ?? []).map(o => ({ value: o.value, label: o.label }))"
                                            :placeholder="`Wybierz ${ef.label.toLowerCase()}`"
                                            :disabled="efIsLocked(ef.key)"
                                        />
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>

                                    <!-- Number -->
                                    <div v-else-if="ef.type === 'number'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">
                                            {{ ef.label }} <span v-if="ef.required" class="req">*</span>
                                            <span v-if="efIsLocked(ef.key)" class="field-locked-badge">
                                                <v-icon icon="mdi-lock-outline" size="11" />z silnika
                                            </span>
                                        </label>
                                        <div class="input-unit-wrap">
                                            <input v-model.number="extras[ef.key]" type="number"
                                                :class="['finput', efIsLocked(ef.key) ? 'finput--locked' : '']"
                                                :placeholder="ef.placeholder ?? ''"
                                                :readonly="efIsLocked(ef.key)" />
                                            <span v-if="ef.unit" class="input-unit-badge">{{ ef.unit }}</span>
                                        </div>
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>

                                    <!-- Text -->
                                    <div v-else-if="ef.type === 'text'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <input v-model="extras[ef.key]" type="text" class="finput"
                                            :placeholder="ef.placeholder ?? ''" />
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>

                                    <!-- Color picker -->
                                    <div v-else-if="ef.type === 'color-picker'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <div class="ef-color-label">
                                            <span>{{ ef.label }}</span>
                                            <span v-if="extras[ef.key]" class="ef-color-name">
                                                {{ colors.find(c => c.id === extras[ef.key])?.name }}
                                            </span>
                                        </div>
                                        <div class="ef-color-swatches">
                                            <button
                                                class="ef-color-swatch ef-color-swatch--clear"
                                                :class="{ active: !extras[ef.key] }"
                                                title="Nie określono"
                                                type="button"
                                                @click="extras[ef.key] = null"
                                            >
                                                <v-icon icon="mdi-close" size="10" />
                                            </button>
                                            <button
                                                v-for="col in colors"
                                                :key="col.id"
                                                class="ef-color-swatch"
                                                :class="{ active: extras[ef.key] === col.id }"
                                                :style="{ background: col.hexCode || '#888' }"
                                                :title="col.name"
                                                type="button"
                                                @click="extras[ef.key] = extras[ef.key] === col.id ? null : col.id"
                                            />
                                        </div>
                                    </div>

                                    <!-- Boolean checkbox -->
                                    <div v-else-if="ef.type === 'boolean'" :class="['field field--bool', ef.fullWidth ? 'full-width' : '']">
                                        <label class="bool-check" :class="{ active: extras[ef.key] }">
                                            <input type="checkbox" v-model="extras[ef.key]" hidden />
                                            <span class="bool-box">
                                                <v-icon v-if="extras[ef.key]" icon="mdi-check" size="12" />
                                            </span>
                                            {{ ef.label }}
                                        </label>
                                    </div>

                                </template>
                            </div>
                        </div>
                    </transition>

                    <!-- ── Subtype-specific extra fields ──────────────────────────────────── -->
                    <transition name="fade-err">
                        <div v-if="subtypeExtraFields.length > 0" class="extra-fields-wrap">
                            <div class="extras-section-divider">
                                <span>Specyfikacja {{ selectedSubtype?.name }}</span>
                            </div>
                            <div class="fields-grid">
                                <template v-for="ef in subtypeExtraFields" :key="'sub-' + ef.key">

                                    <!-- Radio -->
                                    <div v-if="ef.type === 'radio'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <div class="radio-group">
                                            <label v-for="opt in ef.options" :key="opt.value" class="radio-opt"
                                                :class="{ active: extras[ef.key] === opt.value }">
                                                <input type="radio" :name="'sub-' + ef.key" :value="opt.value"
                                                    v-model="extras[ef.key]" hidden />
                                                {{ opt.label }}
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Select -->
                                    <div v-else-if="ef.type === 'select'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <SmartSelect
                                            :model-value="extras[ef.key]"
                                            @update:model-value="extras[ef.key] = $event"
                                            :options="(ef.options ?? []).map(o => ({ value: o.value, label: o.label }))"
                                            :placeholder="`Wybierz ${ef.label.toLowerCase()}`"
                                        />
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>

                                    <!-- Number -->
                                    <div v-else-if="ef.type === 'number'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <div class="input-unit-wrap">
                                            <input v-model.number="extras[ef.key]" type="number"
                                                class="finput"
                                                :placeholder="ef.placeholder ?? ''" />
                                            <span v-if="ef.unit" class="input-unit-badge">{{ ef.unit }}</span>
                                        </div>
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>

                                </template>
                            </div>
                        </div>
                    </transition>

                    <!-- ── VIN & Identification ── -->
                    <div v-if="categoryConfig.showVinSection !== false" class="hist-section">
                        <div class="hist-section-title"><v-icon icon="mdi-barcode-scan" size="16" />Identyfikacja pojazdu</div>
                        <div class="fields-grid">
                            <div class="field full-width">
                                <label class="flabel">Numer VIN</label>
                                <div class="vin-row">
                                    <input v-model="form.vin" class="finput vin-input" placeholder="Wpisz 17-znakowy numer VIN" maxlength="17"
                                        :class="{ 'input-ok': form.vin.length === 17 }" />
                                    <button type="button" class="btn-vin-lookup"
                                        :disabled="form.vin.length !== 17 || vinLoading"
                                        @click="lookupVin">
                                        <v-icon v-if="vinLoading" icon="mdi-loading" size="16" class="spin" />
                                        <v-icon v-else icon="mdi-magnify" size="16" />
                                        {{ vinLoading ? 'Sprawdzam...' : 'Sprawdź VIN' }}
                                    </button>
                                </div>
                                <transition name="fade-err">
                                    <span v-if="fieldErrors.vin || vinError" class="vin-error">
                                        <v-icon icon="mdi-alert-circle-outline" size="14" />{{ fieldErrors.vin || vinError }}
                                    </span>
                                </transition>
                                <p class="field-hint"><v-icon icon="mdi-information-outline" size="12" />VIN pozwala automatycznie uzupełnić dane i buduje zaufanie kupujących</p>
                            </div>
                            <div class="field">
                                <label class="flabel">Pierwsza data rejestracji</label>
                                <input v-model="history.firstRegDate" type="date" class="finput" />
                                <div class="field-hint"><v-icon icon="mdi-information-outline" size="12" />Data pierwszej rejestracji pojazdu</div>
                            </div>
                            <div class="field">
                                <label class="flabel">Kraj rejestracji</label>
                                <div class="select-wrap">
                                    <select v-model="history.registrationCountry" class="fselect">
                                        <option value="PL">Polska</option>
                                        <option value="DE">Niemcy</option>
                                        <option value="FR">Francja</option>
                                        <option value="IT">Włochy</option>
                                        <option value="NL">Holandia</option>
                                        <option value="BE">Belgia</option>
                                        <option value="AT">Austria</option>
                                        <option value="CH">Szwajcaria</option>
                                        <option value="SE">Szwecja</option>
                                        <option value="DK">Dania</option>
                                        <option value="NO">Norwegia</option>
                                        <option value="FI">Finlandia</option>
                                        <option value="GB">Wielka Brytania</option>
                                        <option value="US">USA</option>
                                        <option value="JP">Japonia</option>
                                        <option value="other">Inny</option>
                                    </select>
                                    <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ── Ownership & History ── -->
                    <template v-if="categoryConfig.showHistorySection !== false">
                    <div class="hist-section">
                        <div class="hist-section-title"><v-icon icon="mdi-account-multiple-outline" size="16" />Właściciele i import</div>
                        <div class="fields-grid">
                            <div class="field">
                                <label class="flabel">Liczba właścicieli</label>
                                <div class="select-wrap">
                                    <select v-model="history.ownersCount" class="fselect">
                                        <option :value="null" disabled>Wybierz</option>
                                        <option :value="1">1 właściciel</option>
                                        <option :value="2">2 właściciele</option>
                                        <option :value="3">3 właściciele</option>
                                        <option :value="4">4 właściciele</option>
                                        <option :value="5">5+ właścicieli</option>
                                    </select>
                                    <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                                </div>
                            </div>
                            <div class="field">
                                <label class="flabel">Pojazd sprowadzony z zagranicy?</label>
                                <div class="radio-group">
                                    <label class="radio-opt" :class="{ active: !history.isImported }">
                                        <input type="radio" :value="false" v-model="history.isImported" hidden />
                                        Nie, krajowy
                                    </label>
                                    <label class="radio-opt" :class="{ active: history.isImported }">
                                        <input type="radio" :value="true" v-model="history.isImported" hidden />
                                        Tak, import
                                    </label>
                                </div>
                            </div>
                            <transition name="fade-err">
                                <div v-if="history.isImported" class="field">
                                    <label class="flabel">Kraj importu</label>
                                    <input v-model="history.importCountry" type="text" class="finput" placeholder="np. Niemcy, USA" />
                                </div>
                            </transition>
                        </div>
                    </div>

                    <!-- ── Service ── -->
                    <div class="hist-section">
                        <div class="hist-section-title"><v-icon icon="mdi-wrench-outline" size="16" />Serwis i przeglądy</div>
                        <div class="fields-grid">
                            <div class="field">
                                <label class="flabel">Następny przegląd techniczny</label>
                                <input v-model="history.nextInspection" type="month" class="finput" />
                                <div class="field-hint"><v-icon icon="mdi-information-outline" size="12" />Miesiąc i rok kolejnego badania</div>
                            </div>
                            <div class="field">
                                <label class="flabel">Dokumentacja serwisowa</label>
                                <div class="bool-stack">
                                    <label class="bool-check" :class="{ active: history.hasServiceBook }">
                                        <input type="checkbox" v-model="history.hasServiceBook" hidden />
                                        <span class="bool-box"><v-icon v-if="history.hasServiceBook" icon="mdi-check" size="12" /></span>
                                        Książka serwisowa
                                    </label>
                                    <label class="bool-check" :class="{ active: history.hasFullServiceHistory }">
                                        <input type="checkbox" v-model="history.hasFullServiceHistory" hidden />
                                        <span class="bool-box"><v-icon v-if="history.hasFullServiceHistory" icon="mdi-check" size="12" /></span>
                                        Pełna historia ASO
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ── Damage & Warranty ── -->
                    <div class="hist-section">
                        <div class="hist-section-title"><v-icon icon="mdi-shield-check-outline" size="16" />Szkody i gwarancja</div>
                        <div class="fields-grid">
                            <div class="field">
                                <label class="flabel">Czy pojazd był po wypadku lub szkodzie?</label>
                                <div class="radio-group">
                                    <label class="radio-opt" :class="{ active: !history.hasDamage }">
                                        <input type="radio" :value="false" v-model="history.hasDamage" hidden />
                                        <v-icon icon="mdi-check-circle-outline" size="13" style="margin-right:4px;color:#4ade80" />Bezwypadkowy
                                    </label>
                                    <label class="radio-opt" :class="{ active: history.hasDamage }">
                                        <input type="radio" :value="true" v-model="history.hasDamage" hidden />
                                        <v-icon icon="mdi-alert-outline" size="13" style="margin-right:4px;color:#fb923c" />Po szkodzie
                                    </label>
                                </div>
                            </div>
                            <transition name="fade-err">
                                <div v-if="history.hasDamage" class="field">
                                    <label class="flabel">Opis szkody / naprawy</label>
                                    <textarea v-model="history.damageDesc" class="ftextarea" rows="3"
                                        placeholder="Opisz charakter szkody i czy została naprawiona..." />
                                </div>
                            </transition>
                            <div class="field">
                                <label class="flabel">Gwarancja producenta / dealera</label>
                                <div class="bool-stack">
                                    <label class="bool-check" :class="{ active: history.hasWarranty }">
                                        <input type="checkbox" v-model="history.hasWarranty" hidden />
                                        <span class="bool-box"><v-icon v-if="history.hasWarranty" icon="mdi-check" size="12" /></span>
                                        Gwarancja aktywna
                                    </label>
                                </div>
                                <transition name="fade-err">
                                    <div v-if="history.hasWarranty" style="margin-top:8px">
                                        <label class="flabel" style="font-size:11px;margin-bottom:4px">Ważna do</label>
                                        <input v-model="history.warrantyUntil" type="month" class="finput" />
                                    </div>
                                </transition>
                            </div>
                        </div>
                    </div>

                    <div class="hist-quality-tip">
                        <v-icon icon="mdi-trophy-outline" size="16" class="hq-icon" />
                        <div>
                            <div class="hq-title">Kompletna historia = szybsza sprzedaż</div>
                            <div class="hq-sub">Ogłoszenia z VIN i historią serwisową sprzedają się nawet 40% szybciej.</div>
                        </div>
                    </div>
                    </template>

                    <!-- ── "Inne" (Other) Category Custom Form ── -->
                    <template v-if="isOtherCategorySelected">
                        <v-divider class="my-4" />
                        <div class="hist-section">
                            <div class="hist-section-title"><v-icon icon="mdi-shape-plus-outline" size="16" />Kategoria niestandardowa</div>
                            <p class="field-hint" style="margin-bottom:12px">
                                <v-icon icon="mdi-information-outline" size="12" />
                                Opisz rodzaj pojazdu/maszyny. Nasz admin zweryfikuje i zatwierdzi kategorię.
                            </p>

                            <template v-if="!otherCategorySubmitted">
                                <div class="fields-grid">
                                    <div class="field">
                                        <label class="flabel">Nazwa kategorii <span class="req">*</span></label>
                                        <input
                                            v-model="otherCategoryForm.categoryName"
                                            type="text"
                                            class="finput"
                                            placeholder="np. Skuter, Quad, Motorówka..."
                                        />
                                    </div>

                                    <div class="field">
                                        <label class="flabel">Opis</label>
                                        <input
                                            v-model="otherCategoryForm.description"
                                            type="text"
                                            class="finput"
                                            placeholder="Opisz krótko czego dotyczy ogłoszenie"
                                        />
                                    </div>
                                </div>

                                <div class="field full-width" style="margin-top:12px">
                                    <label class="flabel">Dodatkowe parametry (opcjonalne)</label>
                                    <div v-for="(param, idx) in otherCategoryForm.parameters" :key="idx" class="other-param-row">
                                        <input
                                            v-model="param.key"
                                            type="text"
                                            class="finput"
                                            placeholder="np. Pojemność"
                                        />
                                        <input
                                            v-model="param.value"
                                            type="text"
                                            class="finput"
                                            placeholder="np. 500cc"
                                        />
                                        <button type="button" class="other-param-remove" @click="removeOtherParameter(idx)">
                                            <v-icon icon="mdi-delete-outline" size="16" />
                                        </button>
                                    </div>
                                    <button type="button" class="other-param-add" @click="addOtherParameter">
                                        <v-icon icon="mdi-plus" size="14" />
                                        Dodaj parametr
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    class="btn-next"
                                    style="margin-top:16px"
                                    :disabled="otherCategorySubmitting || !otherCategoryForm.categoryName.trim()"
                                    @click="submitOtherCategory"
                                >
                                    <v-icon v-if="otherCategorySubmitting" icon="mdi-loading" size="15" class="spin" />
                                    <v-icon v-else icon="mdi-send-outline" size="15" />
                                    {{ otherCategorySubmitting ? 'Wysyłanie...' : 'Wyślij do weryfikacji' }}
                                </button>
                            </template>

                            <div v-else class="other-cat-success">
                                <v-icon icon="mdi-check-circle-outline" size="20" />
                                <div>
                                    <div class="hq-title">Wniosek wysłany!</div>
                                    <div class="hq-sub">Nasz admin sprawdzi i zatwierdzi Twoją kategorię. Otrzymasz powiadomienie.</div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- Step 2: Zdjęcia -->
                <div v-else-if="currentStep === 2" class="form-content">
                    <div class="form-section-head">
                        <h2>Zdjęcia</h2>
                        <p v-if="!isEdit">Dodaj minimum <strong>3 zdjęcia</strong> pojazdu. Pierwsze zdjęcie będzie zdjęciem głównym.</p>
                        <p v-else>Możesz usunąć istniejące zdjęcia lub dodać nowe.</p>
                    </div>
                    <div
                        class="img-grid"
                        :class="{ 'img-grid--dragover': gridDragOver }"
                        @dragover.prevent="gridDragOver = true"
                        @dragleave="gridDragOver = false"
                        @drop.prevent="onGridDrop"
                    >
                        <!-- Existing images (edit mode) -->
                        <div v-for="img in existingImages" :key="`ex-${img.id}`" class="img-thumb img-thumb--existing">
                            <img :src="getImageUrl(img.url)" :alt="`Zdjęcie pojazdu ${img.id}`" loading="lazy" />
                            <button type="button" class="img-remove"
                                :disabled="deletingImageId === img.id"
                                @click="deleteExistingImage(img.id)">
                                <v-icon v-if="deletingImageId === img.id" icon="mdi-loading" size="14" class="spin" />
                                <v-icon v-else icon="mdi-close" size="14" />
                            </button>
                            <span v-if="img.isMain" class="img-main-badge">Główne</span>
                        </div>
                        <!-- New images being added (draggable for reorder) -->
                        <div
                            v-for="(preview, i) in previews"
                            :key="`new-${i}`"
                            class="img-thumb"
                            :class="{ 'img-thumb--drag-src': dragSrcIdx === i, 'img-thumb--drag-over': dragOverIdx === i }"
                            draggable="true"
                            @dragstart="dragSrcIdx = i"
                            @dragend="dragSrcIdx = null; dragOverIdx = null"
                            @dragover.prevent="dragOverIdx = i"
                            @dragleave="dragOverIdx = null"
                            @drop.prevent="reorderPhoto(i)"
                        >
                            <img :src="preview" :alt="`Zdjęcie ${i + 1}`" />
                            <button type="button" class="img-remove" :aria-label="`Usuń zdjęcie ${i + 1}`" @click="removeImage(i)">
                                <v-icon icon="mdi-close" size="14" />
                            </button>
                            <span v-if="!existingImages.length && i === 0" class="img-main-badge">Główne</span>
                            <span class="img-drag-hint"><v-icon icon="mdi-drag" size="13" /></span>
                        </div>
                        <label v-if="(existingImages.length + selectedFiles.length) < 50" class="img-add" :class="{ 'img-add--loading': photoUploading }">
                            <input type="file" multiple accept="image/jpeg,image/png,image/webp" @change="onFilesSelected" :disabled="photoUploading" hidden />
                            <v-icon v-if="photoUploading" icon="mdi-loading" size="28" class="spin" />
                            <v-icon v-else icon="mdi-plus" size="28" />
                            <span>{{ photoUploading ? 'Przetwarzanie...' : 'Dodaj zdjęcia' }}</span>
                        </label>
                        <!-- Drop zone hint when no files yet -->
                        <div v-if="!previews.length && !existingImages.length" class="img-drop-hint">
                            <v-icon icon="mdi-cloud-upload-outline" size="32" />
                            <span>Przeciągnij zdjęcia tutaj lub kliknij „Dodaj zdjęcia"</span>
                        </div>
                    </div>

                    <!-- AI Photo Quality Analysis -->
                    <div v-if="previews.length > 0" class="photo-ai-section">
                        <div class="photo-ai-title">
                            <v-icon icon="mdi-image-search-outline" size="14" />
                            Analiza jakości zdjęć
                        </div>
                        <div v-for="(preview, index) in previews" :key="`ai-${index}`" class="photo-ai-item">
                            <div class="photo-ai-thumb">
                                <img :src="preview" :alt="`Podgląd zdjęcia ${index + 1} do analizy AI`" />
                                <span class="photo-ai-num">{{ index + 1 }}</span>
                            </div>
                            <div class="photo-ai-content">
                                <div v-if="photoAnalysisResults[index]">
                                    <div v-if="photoAnalysisResults[index].loading" class="photo-ai-loading">
                                        <v-progress-circular indeterminate size="20" color="primary" />
                                        <span>Analizuję...</span>
                                    </div>
                                    <template v-else>
                                        <div class="photo-ai-score-row">
                                            <span class="photo-ai-label">Jakość:</span>
                                            <v-chip
                                                size="x-small"
                                                :color="photoAnalysisResults[index].score >= 7 ? 'success' : photoAnalysisResults[index].score >= 4 ? 'warning' : 'error'"
                                                variant="tonal"
                                            >
                                                {{ photoAnalysisResults[index].score }}/10
                                            </v-chip>
                                        </div>
                                        <p v-if="photoAnalysisResults[index].summary" class="photo-ai-summary">
                                            {{ photoAnalysisResults[index].summary }}
                                        </p>
                                        <ul v-if="photoAnalysisResults[index].issues.length" class="photo-ai-issues">
                                            <li v-for="issue in photoAnalysisResults[index].issues" :key="issue">{{ issue }}</li>
                                        </ul>
                                    </template>
                                </div>
                                <v-btn
                                    size="x-small"
                                    variant="text"
                                    color="primary"
                                    :loading="photoAnalysisResults[index]?.loading"
                                    @click="analyzePhoto(index, selectedFiles[index])"
                                    class="photo-ai-btn"
                                >
                                    <v-icon icon="mdi-magnify" size="14" class="mr-1" />
                                    Analizuj jakość
                                </v-btn>
                            </div>
                        </div>
                    </div>

                    <!-- Photo quality feedback -->
                    <div class="photo-hints">
                        <div class="photo-hint" :class="photoFeedback.mainOk ? 'ph-ok' : 'ph-warn'">
                            <v-icon :icon="photoFeedback.mainOk ? 'mdi-check-circle' : 'mdi-alert-circle-outline'" size="14" />
                            {{ photoFeedback.mainOk ? 'Zdjęcie główne ustawione' : 'Brak zdjęcia głównego — pierwsze zdjęcie będzie głównym' }}
                        </div>
                        <div class="photo-hint" :class="photoFeedback.countClass">
                            <v-icon :icon="photoFeedback.countIcon" size="14" />
                            {{ photoFeedback.countMsg }}
                        </div>
                        <div v-if="photoFeedback.lowQuality.length" class="photo-hint ph-warn">
                            <v-icon icon="mdi-image-size-select-large" size="14" />
                            {{ photoFeedback.lowQuality.length }} zdjęcie(-a) mają niską rozdzielczość (poniżej 800px)
                        </div>
                    </div>

                    <!-- PDF Brochure Upload -->
                    <div class="pdf-section">
                        <div class="pdf-section-title">
                            <v-icon icon="mdi-file-pdf-box" size="16" style="color:#e53e3e" />
                            Broszura PDF
                            <span class="flabel-opt">(opcjonalnie)</span>
                        </div>
                        <div class="pdf-section-desc">Dodaj PDF z pełną specyfikacją, historią serwisową lub ofertą finansową.</div>

                        <div v-if="form.pdfBrochureUrl && form.pdfBrochureUrl !== '__pending__'" class="pdf-uploaded">
                            <v-icon icon="mdi-file-pdf-box" size="20" style="color:#e53e3e" />
                            <div class="pdf-info">
                                <div class="pdf-name">{{ pdfFileName || 'Broszura.pdf' }}</div>
                                <a :href="form.pdfBrochureUrl" target="_blank" rel="noopener noreferrer" class="pdf-view-link">
                                    <v-icon icon="mdi-open-in-new" size="12" />Podgląd
                                </a>
                            </div>
                            <button type="button" class="pdf-remove-btn" @click="removePdf">
                                <v-icon icon="mdi-close" size="15" />
                            </button>
                        </div>

                        <div v-else-if="form.pdfBrochureUrl === '__pending__'" class="pdf-uploaded pdf-pending">
                            <v-icon icon="mdi-file-pdf-box" size="20" style="color:#e53e3e" />
                            <div class="pdf-info">
                                <div class="pdf-name">{{ pdfFileName }}</div>
                                <div class="pdf-pending-label">Zostanie przesłany po publikacji</div>
                            </div>
                            <button type="button" class="pdf-remove-btn" @click="removePdf">
                                <v-icon icon="mdi-close" size="15" />
                            </button>
                        </div>

                        <label v-else class="pdf-upload-btn" :class="{ 'pdf-upload-btn--loading': pdfUploading }">
                            <input type="file" accept="application/pdf" @change="onPdfSelected" :disabled="pdfUploading" hidden />
                            <v-icon :icon="pdfUploading ? 'mdi-loading' : 'mdi-upload'" size="16" :class="{ spin: pdfUploading }" />
                            {{ pdfUploading ? 'Wysyłanie...' : 'Wybierz plik PDF (maks. 25 MB)' }}
                        </label>

                        <transition name="fade-err">
                            <div v-if="pdfUploadError" class="pdf-error">
                                <v-icon icon="mdi-alert-circle-outline" size="13" />{{ pdfUploadError }}
                            </div>
                        </transition>
                    </div>
                </div>

                <!-- Step 3: Wyposażenie -->
                <div v-else-if="currentStep === 3" class="form-content">
                    <div class="form-section-head">
                        <h2>Wyposażenie</h2>
                        <p>Zaznacz wyposażenie pojazdu. Ogłoszenia z kompletnym wyposażeniem sprzedają się <strong>2× szybciej</strong>.</p>
                    </div>
                    <div v-if="isFieldVisible('bodyType')" class="field" style="margin-bottom:16px">
                        <label class="flabel">Typ nadwozia</label>
                        <SmartSelect
                            v-model="form.bodyTypeId"
                            :options="bodyTypeOptions"
                            placeholder="Wybierz typ nadwozia"
                            prefix-icon="mdi-car-outline"
                        />
                    </div>
                    <div v-if="!featuresLoaded" class="feat-empty">
                        <v-icon icon="mdi-loading" size="40" class="spin" />
                        <p>Ładowanie wyposażenia...</p>
                    </div>
                    <div v-else-if="!allFeatures.length" class="feat-empty">
                        <v-icon icon="mdi-check-circle-outline" size="36" style="color: #4ade80" />
                        <p>Ta kategoria nie wymaga listy wyposażenia.<br>Szczegóły techniczne podajesz w sekcji <strong>Dane pojazdu</strong>.</p>
                        <button type="button" class="btn-next" style="margin-top:16px" @click="currentStep++">
                            Przejdź dalej <v-icon icon="mdi-arrow-right" size="15" />
                        </button>
                    </div>
                    <div v-else-if="allFeatures.length && !Object.keys(featureGroups).length" class="feat-empty">
                        <v-icon icon="mdi-check-circle-outline" size="36" style="color: #4ade80" />
                        <p>Ta kategoria nie wymaga listy wyposażenia.<br>Szczegóły techniczne podajesz w sekcji <strong>Dane pojazdu</strong>.</p>
                        <button type="button" class="btn-next" style="margin-top:16px" @click="currentStep++">
                            Przejdź dalej <v-icon icon="mdi-arrow-right" size="15" />
                        </button>
                    </div>
                    <template v-else>
                        <!-- Equipment search bar -->
                        <div class="feat-search-wrap">
                            <v-icon icon="mdi-magnify" size="16" class="feat-search-icon" />
                            <input
                                v-model="featSearch"
                                class="feat-search-input"
                                placeholder="Szukaj wyposażenia..."
                                autocomplete="off"
                                @keydown.escape="featSearch = ''"
                            />
                            <button v-if="featSearch" type="button" class="feat-search-clear" @click="featSearch = ''">
                                <v-icon icon="mdi-close" size="14" />
                            </button>
                        </div>
                        <!-- expand/collapse controls -->
                        <div class="equip-controls">
                            <button type="button" class="equip-ctrl-btn" @click="expandAllEquip">
                                <v-icon icon="mdi-unfold-more-horizontal" size="13" />Rozwiń wszystkie
                            </button>
                            <button type="button" class="equip-ctrl-btn" @click="collapseAllEquip">
                                <v-icon icon="mdi-unfold-less-horizontal" size="13" />Zwiń wszystkie
                            </button>
                        </div>

                        <div v-if="featSearch && !Object.keys(filteredFeatureGroups).length" class="feat-empty" style="padding:24px 0">
                            <v-icon icon="mdi-magnify-close" size="32" />
                            <p>Brak wyposażenia pasującego do „{{ featSearch }}"</p>
                        </div>
                        <div v-for="(group, cat) in filteredFeatureGroups" :key="cat" class="feat-group">
                            <button type="button" class="feat-group-header"
                                :class="{ 'fgh-open': openFeatGroups.has(String(cat)) || !!featSearch }"
                                @click="toggleFeatGroup(String(cat))">
                                <div class="fgh-left">
                                    <v-icon :icon="featureGroupIcon(String(cat))" size="15" />
                                    <span class="fgh-name">{{ cat }}</span>
                                    <span class="feat-group-count"
                                        :class="{ 'fgc-has': group.filter(f => form.featureIds.includes(f.id)).length > 0 }">
                                        {{ group.filter(f => form.featureIds.includes(f.id)).length }}/{{ group.length }}
                                    </span>
                                </div>
                                <v-icon class="fgh-arrow" icon="mdi-chevron-down" size="16" />
                            </button>
                            <Transition name="equip-collapse">
                                <div v-if="openFeatGroups.has(String(cat)) || !!featSearch" class="feat-badges">
                                    <button
                                        v-for="feat in group"
                                        :key="feat.id"
                                        type="button"
                                        class="feat-badge"
                                        :class="{ 'feat-badge--on': form.featureIds.includes(feat.id) }"
                                        @click="toggleFeature(feat.id)"
                                    >
                                        <v-icon v-if="form.featureIds.includes(feat.id)" icon="mdi-check" size="12" class="feat-badge-icon" />
                                        <span v-html="highlightSearch(feat.name)" />
                                    </button>
                                </div>
                            </Transition>
                        </div>
                    </template>
                    <div v-if="form.featureIds.length" class="feat-summary-bar">
                        <v-icon icon="mdi-check-circle-outline" size="16" />
                        Zaznaczono {{ form.featureIds.length }} pozycji wyposażenia
                        <button type="button" class="feat-clear-btn" @click="form.featureIds = []">
                            <v-icon icon="mdi-close" size="12" /> Wyczyść
                        </button>
                    </div>
                </div>

                <!-- Step 4: Historia pojazdu -->
                <div v-else-if="currentStep === 4" class="form-content">
                    <div class="form-section-head">
                        <h2>Historia pojazdu</h2>
                        <p>Kompletna historia zwiększa <strong>zaufanie kupujących</strong> i przyspiesza sprzedaż. Każda potwierdzona pozycja podnosi ocenę ogłoszenia.</p>
                    </div>
                    <div class="verified-grid">
                        <!-- VIN -->
                        <div class="verified-item" :class="{ 'verified-item--filled': form.vin }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': form.vin }">
                                    <v-icon :icon="form.vin ? 'mdi-check' : 'mdi-barcode'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Numer VIN</div>
                                    <div class="vi-desc">Unikalny identyfikator pojazdu — potwierdza jego tożsamość</div>
                                </div>
                                <div v-if="form.vin" class="vi-badge">+4 pkt</div>
                            </div>
                            <input v-model="form.vin" type="text" class="finput" placeholder="np. WBA3A5G51ENP37056" maxlength="17" style="margin-top:12px" />
                        </div>

                        <!-- First owner -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.isFirstOwner }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.isFirstOwner }">
                                    <v-icon :icon="history.isFirstOwner ? 'mdi-check' : 'mdi-account-key-outline'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Pierwszy właściciel</div>
                                    <div class="vi-desc">Pojazd nigdy wcześniej nie był zarejestrowany na inną osobę</div>
                                </div>
                                <div v-if="history.isFirstOwner" class="vi-badge">+2 pkt</div>
                            </div>
                            <label class="toggle-row" style="margin-top:12px">
                                <span class="toggle-label">Jestem pierwszym właścicielem</span>
                                <div class="toggle-switch" :class="{ active: history.isFirstOwner }" @click="history.isFirstOwner = !history.isFirstOwner">
                                    <div class="toggle-knob" />
                                </div>
                            </label>
                        </div>

                        <!-- Accident free -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.isAccidentFree }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.isAccidentFree }">
                                    <v-icon :icon="history.isAccidentFree ? 'mdi-check' : 'mdi-shield-car'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Bezwypadkowy</div>
                                    <div class="vi-desc">Pojazd nie brał udziału w żadnych kolizjach ani wypadkach</div>
                                </div>
                                <div v-if="history.isAccidentFree" class="vi-badge">+3 pkt</div>
                            </div>
                            <label class="toggle-row" style="margin-top:12px">
                                <span class="toggle-label">Pojazd jest bezwypadkowy</span>
                                <div class="toggle-switch" :class="{ active: history.isAccidentFree }" @click="history.isAccidentFree = !history.isAccidentFree">
                                    <div class="toggle-knob" />
                                </div>
                            </label>
                        </div>

                        <!-- Service book -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.hasServiceBook }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.hasServiceBook }">
                                    <v-icon :icon="history.hasServiceBook ? 'mdi-check' : 'mdi-book-open-outline'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Książka serwisowa</div>
                                    <div class="vi-desc">Pełna dokumentacja historii serwisowej pojazdu</div>
                                </div>
                                <div v-if="history.hasServiceBook" class="vi-badge">+2 pkt</div>
                            </div>
                            <label class="toggle-row" style="margin-top:12px">
                                <span class="toggle-label">Posiadam książkę serwisową</span>
                                <div class="toggle-switch" :class="{ active: history.hasServiceBook }" @click="history.hasServiceBook = !history.hasServiceBook">
                                    <div class="toggle-knob" />
                                </div>
                            </label>
                        </div>

                        <!-- ASO Service -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.servicedAtASO }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.servicedAtASO }">
                                    <v-icon :icon="history.servicedAtASO ? 'mdi-check' : 'mdi-wrench-outline'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Serwisowany w ASO</div>
                                    <div class="vi-desc">Wszystkie przeglądy wykonywane w autoryzowanym serwisie</div>
                                </div>
                                <div v-if="history.servicedAtASO" class="vi-badge">+2 pkt</div>
                            </div>
                            <label class="toggle-row" style="margin-top:12px">
                                <span class="toggle-label">Serwisowany w autoryzowanym serwisie</span>
                                <div class="toggle-switch" :class="{ active: history.servicedAtASO }" @click="history.servicedAtASO = !history.servicedAtASO">
                                    <div class="toggle-knob" />
                                </div>
                            </label>
                        </div>

                        <!-- Owners count -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.ownersCount !== null }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.ownersCount !== null }">
                                    <v-icon :icon="history.ownersCount !== null ? 'mdi-check' : 'mdi-account-group-outline'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Liczba właścicieli</div>
                                    <div class="vi-desc">Ilu właścicieli miał pojazd od początku</div>
                                </div>
                                <div v-if="history.ownersCount !== null" class="vi-badge">+2 pkt</div>
                            </div>
                            <select v-model="history.ownersCount" class="finput" style="margin-top:12px">
                                <option :value="null">Nie podaję</option>
                                <option :value="1">1 właściciel</option>
                                <option :value="2">2 właścicieli</option>
                                <option :value="3">3 właścicieli</option>
                                <option :value="4">4+ właścicieli</option>
                            </select>
                        </div>
                    </div>

                        <!-- Garaged -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.isGaraged }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.isGaraged }">
                                    <v-icon :icon="history.isGaraged ? 'mdi-check' : 'mdi-garage-outline'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Garażowany</div>
                                    <div class="vi-desc">Pojazd przechowywany w garażu lub hali</div>
                                </div>
                                <div v-if="history.isGaraged" class="vi-badge">+1 pkt</div>
                            </div>
                            <label class="toggle-row" style="margin-top:12px">
                                <span class="toggle-label">Pojazd jest garażowany</span>
                                <div class="toggle-switch" :class="{ active: history.isGaraged }" @click="history.isGaraged = !history.isGaraged">
                                    <div class="toggle-knob" />
                                </div>
                            </label>
                        </div>

                        <!-- Key count -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.keyCount !== null }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.keyCount !== null }">
                                    <v-icon :icon="history.keyCount !== null ? 'mdi-check' : 'mdi-key-outline'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">Liczba kluczyków</div>
                                    <div class="vi-desc">Ile kluczyków / pilotów jest dostępnych do pojazdu</div>
                                </div>
                                <div v-if="history.keyCount !== null" class="vi-badge">+1 pkt</div>
                            </div>
                            <select v-model="history.keyCount" class="finput" style="margin-top:12px">
                                <option :value="null">Nie podaję</option>
                                <option :value="1">1 kluczyk</option>
                                <option :value="2">2 kluczyki</option>
                                <option :value="3">3 kluczyki</option>
                                <option :value="4">4+ kluczyków</option>
                            </select>
                        </div>

                        <!-- Insurance until -->
                        <div class="verified-item" :class="{ 'verified-item--filled': history.insuranceUntil }">
                            <div class="vi-header">
                                <div class="vi-icon-wrap" :class="{ 'vi-icon-wrap--done': history.insuranceUntil }">
                                    <v-icon :icon="history.insuranceUntil ? 'mdi-check' : 'mdi-shield-car'" size="18" />
                                </div>
                                <div class="vi-texts">
                                    <div class="vi-title">OC ważne do</div>
                                    <div class="vi-desc">Data ważności ubezpieczenia odpowiedzialności cywilnej</div>
                                </div>
                                <div v-if="history.insuranceUntil" class="vi-badge">+1 pkt</div>
                            </div>
                            <input v-model="history.insuranceUntil" type="month" class="finput" style="margin-top:12px" />
                        </div>

                    <!-- Carizo verified summary -->
                    <div class="cverified-summary">
                        <div class="cvs-icon">
                            <v-icon icon="mdi-shield-star-outline" size="24" />
                        </div>
                        <div>
                            <div class="cvs-title">CARIZO VERIFIED</div>
                            <div class="cvs-desc">{{ [form.vin, history.isFirstOwner, history.isAccidentFree, history.hasServiceBook, history.servicedAtASO, history.ownersCount !== null, history.isGaraged, history.keyCount !== null, history.insuranceUntil].filter(Boolean).length }} z 9 punktów potwierdzonych</div>
                        </div>
                        <div class="cvs-score">
                            {{ Math.round([form.vin, history.isFirstOwner, history.isAccidentFree, history.hasServiceBook, history.servicedAtASO, history.ownersCount !== null, history.isGaraged, history.keyCount !== null, history.insuranceUntil].filter(Boolean).length / 9 * 100) }}%
                        </div>
                    </div>
                </div>

                <!-- Step 5: Opis -->
                <div v-else-if="currentStep === 5" class="form-content">
                    <div class="form-section-head">
                        <h2>Cena i opis</h2>
                        <p>Ustal cenę, opisz pojazd i podaj lokalizację.</p>
                    </div>

                    <!-- Seller type -->
                    <div class="field full-width" style="margin-bottom: 16px;">
                        <label class="flabel">Typ ogłoszenia</label>
                        <div class="radio-group">
                            <label class="radio-opt" :class="{ active: form.sellerType === 'private' }">
                                <input type="radio" name="sellerType" value="private" v-model="form.sellerType" hidden />
                                <v-icon icon="mdi-account-outline" size="14" style="margin-right:5px" />
                                Osoba prywatna
                            </label>
                            <label class="radio-opt" :class="{ active: form.sellerType === 'dealer' }">
                                <input type="radio" name="sellerType" value="dealer" v-model="form.sellerType" hidden />
                                <v-icon icon="mdi-store-outline" size="14" style="margin-right:5px" />
                                Dealer / Firma
                            </label>
                        </div>
                    </div>

                    <!-- Registration plate -->
                    <div class="field full-width" style="margin-bottom:12px">
                        <label class="flabel">
                            Numer rejestracyjny
                            <span class="flabel-opt">(opcjonalnie)</span>
                        </label>
                        <div class="input-icon-wrap">
                            <v-icon icon="mdi-card-account-details-outline" class="input-prefix" size="16" />
                            <input v-model="form.registrationPlate" type="text" class="finput has-prefix"
                                placeholder="np. WA 12345" maxlength="10" style="text-transform:uppercase"
                                @input="(form.registrationPlate as string) = (form.registrationPlate as string).toUpperCase()" />
                        </div>
                        <div class="field-hint">
                            <v-icon icon="mdi-information-outline" size="12" />Widoczny dla poważnych kupujących — pomaga w weryfikacji historii
                        </div>
                    </div>

                    <!-- Financing & payment options -->
                    <div class="field full-width" style="margin-bottom:16px">
                        <label class="flabel">Opcje finansowania i wymiany</label>
                        <div class="bool-checks-row">
                            <label class="bool-check" :class="{ active: form.hasVatInvoice }">
                                <input type="checkbox" v-model="form.hasVatInvoice" hidden />
                                <span class="bool-box"><v-icon v-if="form.hasVatInvoice" icon="mdi-check" size="12" /></span>
                                <v-icon icon="mdi-receipt-text-outline" size="14" style="margin-right:4px" />
                                Faktura VAT
                            </label>
                            <label class="bool-check" :class="{ active: form.isLeasingPossible }">
                                <input type="checkbox" v-model="form.isLeasingPossible" hidden />
                                <span class="bool-box"><v-icon v-if="form.isLeasingPossible" icon="mdi-check" size="12" /></span>
                                <v-icon icon="mdi-handshake-outline" size="14" style="margin-right:4px" />
                                Możliwość leasingu
                            </label>
                            <label class="bool-check" :class="{ active: form.isCreditPossible }">
                                <input type="checkbox" v-model="form.isCreditPossible" hidden />
                                <span class="bool-box"><v-icon v-if="form.isCreditPossible" icon="mdi-check" size="12" /></span>
                                <v-icon icon="mdi-credit-card-outline" size="14" style="margin-right:4px" />
                                Kredyt
                            </label>
                            <label class="bool-check" :class="{ active: form.isExchangePossible }">
                                <input type="checkbox" v-model="form.isExchangePossible" hidden />
                                <span class="bool-box"><v-icon v-if="form.isExchangePossible" icon="mdi-check" size="12" /></span>
                                <v-icon icon="mdi-swap-horizontal" size="14" style="margin-right:4px" />
                                Zamiana
                            </label>
                        </div>
                    </div>

                    <!-- Price + negotiable -->
                    <div class="fields-grid" style="margin-bottom:12px">
                        <div class="field">
                            <label class="flabel">{{ categoryConfig.priceLabel ?? 'Cena (zł)' }} <span class="req">*</span></label>
                            <input v-model.number="form.price" type="number" min="0" max="10000000" class="finput finput-price" :class="{ 'finput--error': fieldErrors.price }" placeholder="np. 50 000" />
                            <div v-if="fieldErrors.price" class="field-error">
                                <v-icon icon="mdi-alert-circle-outline" size="12" />{{ fieldErrors.price }}
                            </div>
                            <div v-if="categoryConfig.priceHint" class="field-hint">
                                <v-icon icon="mdi-trending-up" size="12" />{{ categoryConfig.priceHint }}
                            </div>
                            <label class="nego-toggle" :class="{ active: form.isNegotiable }">
                                <input type="checkbox" v-model="form.isNegotiable" hidden />
                                <span class="nego-box"><v-icon v-if="form.isNegotiable" icon="mdi-check" size="11" /></span>
                                Cena do negocjacji
                            </label>
                        </div>
                    </div>

                    <!-- Title suggestion + custom title -->
                    <transition name="fade-err">
                        <div v-if="suggestedTitle" class="title-suggest-card">
                            <div class="tsc-left">
                                <v-icon icon="mdi-auto-fix" size="15" class="tsc-icon" />
                                <div>
                                    <div class="tsc-label">Sugerowany tytuł ogłoszenia</div>
                                    <div class="tsc-title">{{ suggestedTitle }}</div>
                                </div>
                            </div>
                            <button v-if="form.title !== suggestedTitle" class="tsc-use-btn" @click="form.title = suggestedTitle">Użyj</button>
                            <span v-else class="tsc-used"><v-icon icon="mdi-check" size="13" />Aktywny</span>
                        </div>
                    </transition>
                    <div class="field full-width" style="margin-top:12px">
                        <label class="flabel">
                            Tytuł ogłoszenia
                            <span class="flabel-opt">(opcjonalnie — jeśli puste, użyjemy sugerowanego)</span>
                        </label>
                        <div class="title-input-wrap">
                            <input v-model="form.title" type="text" class="finput"
                                :placeholder="suggestedTitle || 'np. BMW 3 2020 świetny stan'" maxlength="120" />
                            <span class="title-char-count" :class="{ warn: form.title.length > 100 }">{{ form.title.length }}/120</span>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="field full-width" style="margin-top:16px">
                        <div class="desc-label-row">
                            <label class="flabel">Opis ogłoszenia <span class="req">*</span></label>
                            <button type="button" class="btn-ai-desc" :disabled="aiDescLoading" @click="generateAiDescription">
                                <v-icon :icon="aiDescLoading ? 'mdi-loading' : 'mdi-auto-fix'" size="15"
                                    :class="{ 'spin': aiDescLoading }" />
                                {{ aiDescLoading ? 'Generuję...' : '✨ Wygeneruj opis' }}
                            </button>
                        </div>
                        <transition name="fade-err">
                            <div v-if="aiDescError" class="ai-desc-error">{{ aiDescError }}</div>
                        </transition>
                        <div class="desc-wrap">
                            <textarea v-model="form.description" class="ftextarea" rows="8"
                                placeholder="Opisz dokładnie stan pojazdu, historię serwisową, powód sprzedaży, co zostało wymienione lub odnowione..."
                                maxlength="5000" />
                            <div class="desc-bar">
                                <div class="desc-tips">
                                    <span class="desc-tip"><v-icon icon="mdi-check-circle-outline" size="11" class="tip-icon" />Historia serwisowa</span>
                                    <span class="desc-tip"><v-icon icon="mdi-check-circle-outline" size="11" class="tip-icon" />Stan techniczny</span>
                                    <span class="desc-tip"><v-icon icon="mdi-check-circle-outline" size="11" class="tip-icon" />Powód sprzedaży</span>
                                </div>
                                <div class="desc-counter" :class="descQuality">
                                    {{ descCharCount }}<span class="desc-max">/5000</span>
                                    <span class="desc-qlabel">
                                        {{ descQuality === 'great' ? '✓ Świetny' : descQuality === 'good' ? 'Dobry' : descQuality === 'ok' ? 'Rozbuduj' : 'Za krótki' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <transition name="fade-err">
                        <div v-if="fieldErrors.description" class="field-error" style="margin-bottom:8px">
                            <v-icon icon="mdi-alert-circle-outline" size="12" />{{ fieldErrors.description }}
                        </div>
                    </transition>
                    <transition name="fade-err">
                        <div v-if="descPhoneWarning" class="desc-phone-warn">
                            <v-icon icon="mdi-phone-alert-outline" size="14" />{{ descPhoneWarning }}
                        </div>
                    </transition>
                    <div class="writing-tips">
                        <div class="wt-title"><v-icon icon="mdi-lightbulb-outline" size="14" />Wskazówki dla dobrego opisu</div>
                        <div class="wt-grid">
                            <div class="wt-item"><v-icon icon="mdi-history" size="13" />Historia serwisowa i naprawy</div>
                            <div class="wt-item"><v-icon icon="mdi-wrench-outline" size="13" />Co zostało wymienione</div>
                            <div class="wt-item"><v-icon icon="mdi-car-multiple" size="13" />Powód sprzedaży</div>
                            <div class="wt-item"><v-icon icon="mdi-package-variant-closed" size="13" />Dodatkowe akcesoria</div>
                        </div>
                    </div>

                    <!-- YouTube video link -->
                    <div class="field full-width" style="margin-top:16px;margin-bottom:16px">
                        <label class="flabel">
                            Film YouTube
                            <span class="flabel-opt">(opcjonalnie)</span>
                        </label>
                        <div class="input-icon-wrap">
                            <v-icon icon="mdi-youtube" class="input-prefix" size="16" style="color:#ff0000" />
                            <input v-model="form.youtubeUrl" type="url" class="finput has-prefix"
                                placeholder="https://youtube.com/watch?v=..." maxlength="500" />
                        </div>
                        <div v-if="youtubeEmbedId" class="field-hint" style="color:#4ade80">
                            <v-icon icon="mdi-check-circle-outline" size="12" style="color:#4ade80" />Film będzie wyświetlany bezpośrednio w ogłoszeniu
                        </div>
                        <div v-else class="field-hint">
                            <v-icon icon="mdi-information-outline" size="12" />Ogłoszenia z filmem sprzedają się szybciej — nagraj krótką prezentację pojazdu
                        </div>
                        <div v-if="youtubeEmbedId" class="yt-preview">
                            <iframe
                                :src="`https://www.youtube-nocookie.com/embed/${youtubeEmbedId}`"
                                class="yt-iframe"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <!-- Location -->
                    <div class="form-section-subhead">Lokalizacja</div>
                    <div class="fields-grid">
                        <div class="field">
                            <label class="flabel">Województwo <span class="req">*</span></label>
                            <div class="select-wrap">
                                <select v-model="form.region" class="fselect">
                                    <option :value="null" disabled>Wybierz województwo</option>
                                    <option v-for="v in voivodeships" :key="v" :value="v">{{ v }}</option>
                                </select>
                                <v-icon icon="mdi-chevron-down" class="sel-arrow" size="16" />
                            </div>
                        </div>
                        <div class="field">
                            <label class="flabel">Miasto <span class="req">*</span></label>
                            <div class="input-icon-wrap">
                                <v-icon icon="mdi-map-marker-outline" class="input-prefix" size="16" />
                                <input v-model="form.city" type="text" class="finput has-prefix" placeholder="np. Warszawa" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 6: Promocja -->
                <div v-else-if="currentStep === 6" class="form-content promo-step">
                    <div class="form-section-head">
                        <h2>{{ isEdit ? 'Podsumowanie zmian' : 'Podsumowanie i promocja' }}</h2>
                        <p v-if="isEdit">Sprawdź wprowadzone zmiany i zapisz ogłoszenie.</p>
                        <p v-else>Przejrzyj ogłoszenie, wybierz promocję i opublikuj.</p>
                    </div>
                    <div v-if="error" class="submit-error">
                        <v-icon icon="mdi-alert-circle-outline" size="15" />
                        {{ error }}
                    </div>

                    <!-- Advert summary before publish -->
                    <div class="pub-summary-card">
                        <div class="psc-title">Podsumowanie ogłoszenia</div>
                        <div class="psc-grid">
                            <div class="psc-row">
                                <v-icon icon="mdi-car-outline" size="14" class="psc-icon" />
                                <span class="psc-label">Pojazd</span>
                                <span class="psc-val">{{ previewTitle || '—' }}</span>
                            </div>
                            <div class="psc-row">
                                <v-icon icon="mdi-calendar-outline" size="14" class="psc-icon" />
                                <span class="psc-label">Rok</span>
                                <span class="psc-val">{{ form.year ?? '—' }}</span>
                            </div>
                            <div class="psc-row">
                                <v-icon icon="mdi-speedometer" size="14" class="psc-icon" />
                                <span class="psc-label">Przebieg</span>
                                <span class="psc-val">{{ form.mileage ? Number(form.mileage).toLocaleString('pl') + ' km' : '—' }}</span>
                            </div>
                            <div class="psc-row">
                                <v-icon icon="mdi-tag-outline" size="14" class="psc-icon" />
                                <span class="psc-label">Cena</span>
                                <span class="psc-val psc-price">
                                    {{ form.price ? Number(form.price).toLocaleString('pl') + ' zł' : '—' }}
                                    <span v-if="form.isNegotiable" class="psc-nego">do negocjacji</span>
                                </span>
                            </div>
                            <div class="psc-row">
                                <v-icon icon="mdi-image-outline" size="14" class="psc-icon" />
                                <span class="psc-label">Zdjęcia</span>
                                <span class="psc-val">{{ selectedFiles.length + existingImages.length }} szt.</span>
                            </div>
                            <div class="psc-row">
                                <v-icon icon="mdi-map-marker-outline" size="14" class="psc-icon" />
                                <span class="psc-label">Lokalizacja</span>
                                <span class="psc-val">{{ [form.city, form.region].filter(Boolean).join(', ') || '—' }}</span>
                            </div>
                            <div v-if="form.vin" class="psc-row">
                                <v-icon icon="mdi-barcode-scan" size="14" class="psc-icon" />
                                <span class="psc-label">VIN</span>
                                <span class="psc-val psc-vin">{{ form.vin }}</span>
                            </div>
                        </div>
                        <div class="psc-score">
                            <div class="psc-score-bar">
                                <div class="psc-score-fill"
                                    :style="{ width: adScore + '%' }"
                                    :class="adScore >= 80 ? 'fill-great' : adScore >= 60 ? 'fill-good' : 'fill-poor'" />
                            </div>
                            <span class="psc-score-label">
                                Ocena: {{ adScore }}/100 —
                                <span :class="adScore >= 80 ? 'col-great' : adScore >= 60 ? 'col-good' : 'col-poor'">
                                    {{ adScore >= 80 ? 'Doskonałe ogłoszenie' : adScore >= 60 ? 'Dobre ogłoszenie' : 'Uzupełnij więcej danych' }}
                                </span>
                            </span>
                        </div>
                    </div>

                    <!-- Edit mode summary -->
                    <div v-if="isEdit" class="edit-summary">
                        <div class="edit-summary-row">
                            <v-icon icon="mdi-car-outline" size="18" class="es-icon" />
                            <div>
                                <div class="es-label">Ogłoszenie</div>
                                <div class="es-val">{{ previewTitle }}</div>
                            </div>
                        </div>
                        <div class="edit-summary-row">
                            <v-icon icon="mdi-currency-usd" size="18" class="es-icon" />
                            <div>
                                <div class="es-label">Cena</div>
                                <div class="es-val">{{ form.price ? Number(form.price).toLocaleString('pl') + ' zł' : '—' }}</div>
                            </div>
                        </div>
                        <div class="edit-summary-row">
                            <v-icon icon="mdi-image-outline" size="18" class="es-icon" />
                            <div>
                                <div class="es-label">Zdjęcia</div>
                                <div class="es-val">{{ existingImages.length }} istniejących<span v-if="selectedFiles.length"> + {{ selectedFiles.length }} nowych</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- Plans grid (create mode only) -->
                    <div v-if="!isEdit" class="promo-plans-grid">
                        <!-- Free -->
                        <div class="pp-card pp-free" :class="{ 'pp-selected': promoSelected === 'free' }" @click="promoSelected = 'free'">
                            <div class="pp-header">
                                <div class="pp-icon"><v-icon icon="mdi-car-outline" size="24" /></div>
                                <div class="pp-name">Podstawowe</div>
                                <span class="pp-badge-free">DARMOWE</span>
                            </div>
                            <div class="pp-price">0 zł</div>
                            <div class="pp-desc">Standardowe ogłoszenie w wynikach wyszukiwania.</div>
                            <ul class="pp-feats">
                                <li><v-icon icon="mdi-check" size="13" />Widoczne w wynikach</li>
                                <li><v-icon icon="mdi-check" size="13" />30 dni aktywności</li>
                                <li class="pp-feat-no"><v-icon icon="mdi-close" size="13" />Brak wyróżnienia</li>
                            </ul>
                            <div class="pp-sel-bar" />
                        </div>

                        <!-- Paid plans -->
                        <div v-for="plan in promoPlans" :key="plan.key"
                            class="pp-card"
                            :class="[`pp-${plan.key.toLowerCase()}`, { 'pp-selected': promoSelected === plan.key, 'pp-popular': plan.popular }]"
                            @click="promoSelected = plan.key; promoDays = plan.defaultDays">
                            <div v-if="plan.popular" class="pp-popular-badge">NAJPOPULARNIEJSZY</div>
                            <div class="pp-header">
                                <div class="pp-icon"><v-icon :icon="plan.icon" size="24" /></div>
                                <div class="pp-name">{{ plan.name }}</div>
                            </div>
                            <div class="pp-price">od <strong>{{ getPromoPriceFrom(plan.key, plan.priceFrom).toFixed(2) }} zł</strong></div>
                            <div class="pp-desc">{{ plan.desc }}</div>
                            <ul class="pp-feats">
                                <li v-for="f in plan.feats" :key="f"><v-icon icon="mdi-check" size="13" />{{ f }}</li>
                            </ul>
                            <div v-if="promoSelected === plan.key" class="pp-days">
                                <button v-for="d in plan.days" :key="d"
                                    class="pp-day-btn" :class="{ active: promoDays === d }"
                                    @click.stop="promoDays = d">
                                    {{ d }} dni · {{ getPromoDisplayPrice(plan.key, d).toFixed(2) }} zł
                                </button>
                            </div>
                            <div class="pp-sel-bar" />
                        </div>
                    </div>

                    <!-- Summary + coupon (create mode only) -->
                    <div v-if="!isEdit" class="promo-summary">
                        <div v-if="promoSelected === 'free'" class="ps-free-info">
                            <v-icon icon="mdi-check-circle-outline" size="18" />
                            Opublikujesz ogłoszenie bez promocji (darmowe)
                        </div>
                        <div v-else class="ps-paid-info">
                            <div class="ps-plan-name">{{ selectedPromoPlan?.name }} – {{ promoDays }} dni</div>
                            <div class="ps-plan-price">
                                <span v-if="couponResult?.isValid" class="ps-original">{{ selectedPromoPrice?.toFixed(2) }} zł</span>
                                {{ finalPromoPrice.toFixed(2) }} zł
                            </div>
                            <div v-if="couponResult?.isValid" class="ps-coupon-ok">
                                <v-icon icon="mdi-tag-outline" size="13" />Rabat zastosowany
                            </div>
                        </div>
                        <div v-if="promoSelected !== 'free'" class="ps-coupon-row">
                            <div class="ps-coupon-wrap">
                                <input v-model="couponCode" class="ps-coupon-input"
                                    placeholder="Kod rabatowy (opcjonalnie)"
                                    :disabled="couponLoading"
                                    @keyup.enter="applyCoupon" />
                                <button class="ps-coupon-btn" :disabled="!couponCode || couponLoading" @click="applyCoupon">
                                    <v-icon v-if="couponLoading" icon="mdi-loading" size="13" class="spin" />
                                    <span v-else>Zastosuj</span>
                                </button>
                            </div>
                            <div v-if="couponError" class="ps-coupon-error">{{ couponError }}</div>
                        </div>
                    </div>
                </div>

                <!-- Step 7: Podgląd -->
                <div v-else-if="currentStep === 7" class="form-content">
                    <div class="form-section-head">
                        <h2>Podgląd i publikacja</h2>
                        <p>Sprawdź jak będzie wyglądało Twoje ogłoszenie przed publikacją.</p>
                    </div>
                    <div class="preview-card">
                        <div class="prev-img-wrap">
                            <img v-if="previews.length" :src="previews[0]" class="prev-main-img" alt="Zdjęcie główne" />
                            <div v-else class="prev-img-placeholder">
                                <v-icon icon="mdi-image-outline" size="48" />
                                <span>Brak zdjęć</span>
                            </div>
                            <div v-if="previews.length > 1" class="prev-img-count">+{{ previews.length - 1 }} zdjęć</div>
                        </div>
                        <div class="prev-body">
                            <div class="prev-badges">
                                <span v-if="form.sellerType === 'dealer'" class="prev-badge prev-badge--dealer">Dealer</span>
                                <span class="prev-badge prev-badge--cat">{{ selectedCategory?.name ?? 'Pojazd' }}</span>
                            </div>
                            <div class="prev-title">{{ form.title || previewTitle }}</div>
                            <div class="prev-price">{{ form.price ? form.price.toLocaleString('pl') + ' zł' : 'Cena do ustalenia' }}</div>
                            <div v-if="form.isNegotiable" class="prev-nego">do negocjacji</div>
                            <div class="prev-specs">
                                <span v-if="form.year"><v-icon icon="mdi-calendar" size="13" />{{ form.year }}</span>
                                <span v-if="form.mileage"><v-icon icon="mdi-speedometer" size="13" />{{ form.mileage.toLocaleString('pl') }} km</span>
                                <span v-if="fuelTypeName"><v-icon icon="mdi-fuel" size="13" />{{ fuelTypeName }}</span>
                                <span v-if="form.city"><v-icon icon="mdi-map-marker-outline" size="13" />{{ form.city }}</span>
                            </div>
                            <div v-if="form.description" class="prev-desc">{{ form.description.slice(0, 200) }}{{ form.description.length > 200 ? '...' : '' }}</div>
                            <div class="prev-features">
                                <span v-for="fId in form.featureIds.slice(0, 6)" :key="fId" class="prev-feat-tag">
                                    {{ allFeatures.find(f => f.id === fId)?.name }}
                                </span>
                                <span v-if="form.featureIds.length > 6" class="prev-feat-tag prev-feat-tag--more">+{{ form.featureIds.length - 6 }} więcej</span>
                            </div>
                        </div>
                    </div>
                    <!-- Completeness checklist -->
                    <div class="summary-checklist">
                        <div class="summary-checklist-title">
                            <v-icon icon="mdi-clipboard-check-outline" size="15" />
                            Kompletność ogłoszenia
                        </div>
                        <div v-for="factor in scoreFactors" :key="factor.label" class="summary-factor">
                            <v-icon
                                :icon="factor.done ? 'mdi-check-circle' : 'mdi-circle-outline'"
                                size="16"
                                :style="{ color: factor.done ? '#4ade80' : '#6b7280' }"
                            />
                            <span :class="{ 'summary-factor--done': factor.done }">{{ factor.label }}</span>
                        </div>
                    </div>

                    <!-- Tips -->
                    <div v-if="scoreTips.length" class="summary-tips">
                        <div class="summary-tips-title">
                            <v-icon icon="mdi-lightbulb-on-outline" size="14" />
                            Wskazówki jak poprawić skuteczność
                        </div>
                        <div v-for="tip in scoreTips" :key="tip" class="summary-tip-item">
                            <v-icon icon="mdi-arrow-right-thin" size="14" />{{ tip }}
                        </div>
                    </div>

                    <div class="preview-publish-row">
                        <div class="ppr-score">
                            <div class="ppr-score-ring" :style="{ '--score': adScore }">
                                <span class="ppr-score-num">{{ adScore }}</span>
                            </div>
                            <div class="ppr-score-label">Jakość ogłoszenia</div>
                            <div class="ppr-score-tier" :class="adScore >= 90 ? 'tier--gold' : adScore >= 70 ? 'tier--silver' : 'tier--bronze'">
                                {{ adScore >= 90 ? 'PREMIUM VERIFIED' : adScore >= 70 ? 'DOBRA JAKOŚĆ' : 'DO UZUPEŁNIENIA' }}
                            </div>
                        </div>
                        <div class="ppr-actions">
                            <button class="btn-cancel" @click="currentStep--">Wróć i edytuj</button>
                        </div>
                    </div>
                </div>

                <!-- Form actions -->
                <div class="form-actions">
                    <div class="form-actions-left">
                        <button class="btn-cancel" @click="currentStep > 0 ? currentStep-- : navigateTo('/my-adverts')">
                            {{ currentStep > 0 ? 'Wstecz' : 'Anuluj' }}
                        </button>
                        <transition name="fade-err">
                            <span v-if="stepError" class="step-error">
                                <v-icon icon="mdi-alert-circle-outline" size="14" />{{ stepError }}
                            </span>
                        </transition>
                    </div>
                    <button v-if="currentStep < steps.length - 1" class="btn-next" @click="goNext">
                        Dalej: {{ steps[currentStep + 1]?.name }}
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </button>
                    <template v-else>
                        <div v-if="limitError" class="limit-error-banner">
                            <v-icon icon="mdi-store-outline" size="18" />
                            <div class="limit-error-text">
                                <strong>{{ limitError === 'private_limit_yearly' ? 'Osiągnąłeś roczny limit 3 ogłoszeń' : 'Masz już aktywne ogłoszenie' }}</strong>
                                <span>Konto prywatne pozwala na max. 1 aktywne i 3 roczne ogłoszenia. Przejdź na konto biznesowe, by publikować bez ograniczeń.</span>
                            </div>
                            <NuxtLink to="/account/upgrade" class="limit-error-cta">Konto biznesowe</NuxtLink>
                        </div>
                        <div v-else-if="error" class="submit-error-inline">
                            <v-icon icon="mdi-alert-circle-outline" size="15" />{{ error }}
                        </div>
                    </template>
                    <template v-if="currentStep === steps.length - 1">
                        <template v-if="isEdit">
                            <button class="btn-publish-free" :disabled="loading" @click="submit">
                                <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
                                <v-icon v-else icon="mdi-content-save-outline" size="16" />
                                {{ loading ? 'Zapisywanie...' : 'Zapisz zmiany' }}
                            </button>
                        </template>
                        <template v-else>
                            <button v-if="promoSelected === 'free'" class="btn-publish-free" :disabled="loading" @click="submit">
                                <v-icon v-if="loading" icon="mdi-loading" size="16" class="spin" />
                                <v-icon v-else icon="mdi-check" size="16" />
                                {{ loading ? 'Publikowanie...' : 'Opublikuj za darmo' }}
                            </button>
                            <button v-else class="btn-pay" :disabled="loading || paying" @click="submit">
                                <v-icon v-if="loading || paying" icon="mdi-loading" size="16" class="spin" />
                                <v-icon v-else icon="mdi-credit-card-outline" size="16" />
                                {{ loading ? 'Tworzę ogłoszenie...' : paying ? 'Przekierowuję...' : `Zapłać ${finalPromoPrice.toFixed(2)} zł` }}
                            </button>
                        </template>
                    </template>
                </div>

                <!-- Bottom strip -->
                <div class="bottom-strip">
                    <div v-for="f in stripFeats" :key="f.title" class="strip-feat">
                        <v-icon :icon="f.icon" size="20" class="strip-icon" />
                        <div>
                            <div class="strip-title">{{ f.title }}</div>
                            <div class="strip-desc">{{ f.desc }}</div>
                        </div>
                    </div>
                </div>

            </main>

            <!-- Right panel -->
            <aside class="right-panel">

                <div class="score-panel">
                    <div class="sp-ring-wrap">
                        <svg class="sp-ring" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" class="sp-track" />
                            <circle cx="40" cy="40" r="34" class="sp-fill" :stroke-dashoffset="214 - (214 * adScore / 100)" />
                        </svg>
                        <div class="sp-num">{{ adScore }}</div>
                    </div>
                    <div class="sp-label">Jakość ogłoszenia</div>
                    <div class="sp-tier" :class="adScore >= 90 ? 'sp-tier--gold' : adScore >= 70 ? 'sp-tier--silver' : 'sp-tier--bronze'">
                        <v-icon :icon="adScore >= 90 ? 'mdi-crown' : adScore >= 70 ? 'mdi-star' : 'mdi-star-outline'" size="13" />
                        {{ adScore >= 90 ? 'PREMIUM VERIFIED' : adScore >= 70 ? 'DOBRA JAKOŚĆ' : 'DO UZUPEŁNIENIA' }}
                    </div>
                    <div class="sp-tips">
                        <div v-if="!form.brandId && !brandTextInput" class="sp-tip">
                            <v-icon icon="mdi-circle-small" size="16" />Dodaj markę
                        </div>
                        <div v-if="selectedFiles.length + existingImages.length < 5" class="sp-tip">
                            <v-icon icon="mdi-circle-small" size="16" />Dodaj min. 5 zdjęć
                        </div>
                        <div v-if="!form.vin" class="sp-tip">
                            <v-icon icon="mdi-circle-small" size="16" />Podaj numer VIN
                        </div>
                        <div v-if="(form.description?.length ?? 0) < 200" class="sp-tip">
                            <v-icon icon="mdi-circle-small" size="16" />Opis min. 200 znaków
                        </div>
                        <div v-if="form.featureIds.length < 5" class="sp-tip">
                            <v-icon icon="mdi-circle-small" size="16" />Zaznacz wyposażenie
                        </div>
                    </div>
                    <!-- Missing data suggestions -->
                    <div v-if="adScore < 90" class="sp-missing">
                        <div class="sp-missing-title">Uzupełnij aby zwiększyć skuteczność:</div>
                        <div v-if="!form.vin" class="sp-missing-item">
                            <v-icon icon="mdi-identifier" size="13" />VIN
                        </div>
                        <div v-if="selectedFiles.length + existingImages.length < 5" class="sp-missing-item">
                            <v-icon icon="mdi-image-multiple-outline" size="13" />Minimum 5 zdjęć
                        </div>
                        <div v-if="!history.hasServiceBook" class="sp-missing-item">
                            <v-icon icon="mdi-book-open-outline" size="13" />Historia serwisowa
                        </div>
                        <div v-if="(form.description?.length ?? 0) < 500" class="sp-missing-item">
                            <v-icon icon="mdi-text-long" size="13" />Opis powyżej 500 znaków
                        </div>
                        <div v-if="form.featureIds.length < 5" class="sp-missing-item">
                            <v-icon icon="mdi-format-list-checkbox" size="13" />Wyposażenie (min. 5 opcji)
                        </div>
                    </div>
                    <div v-else class="sp-premium-verified">
                        <v-icon icon="mdi-crown" size="14" />CARIZO PREMIUM VERIFIED
                    </div>
                </div>

                <div class="preview-card">
                    <div class="preview-card-title">Podgląd ogłoszenia</div>
                    <div class="preview-img-wrap">
                        <img
                            :src="previews[0] ?? '/car-placeholder.svg'"
                            alt=""
                        />
                    </div>
                    <div class="preview-details">
                        <div class="preview-car-name">{{ previewTitle }}</div>
                        <div class="preview-meta-row">
                            <span v-if="form.year">{{ form.year }}</span>
                            <template v-if="fuelTypeName"><span class="dot">•</span><span>{{ fuelTypeName }}</span></template>
                            <template v-if="form.mileage"><span class="dot">•</span><span>{{ Number(form.mileage).toLocaleString('pl') }} km</span></template>
                        </div>
                        <div class="preview-price">
                            {{ form.price ? Number(form.price).toLocaleString('pl') + ' zł' : '— zł' }}
                            <span v-if="form.isNegotiable" class="preview-nego">do negocjacji</span>
                        </div>
                    </div>
                    <button class="preview-full-btn" @click="previewOpen = true">
                        <v-icon icon="mdi-eye-outline" size="15" />
                        Zobacz pełny podgląd
                    </button>
                </div>

            </aside>

        </div>
    </div>

    <!-- Preview modal -->
    <Teleport to="body">
        <transition name="fade">
            <div v-if="previewOpen" class="preview-modal-overlay" @click.self="previewOpen = false">
                <div class="preview-modal">
                    <div class="pm-header">
                        <span class="pm-title">Podgląd ogłoszenia</span>
                        <button class="pm-close" @click="previewOpen = false">
                            <v-icon icon="mdi-close" size="20" />
                        </button>
                    </div>
                    <div class="pm-body">
                        <div class="pm-img-wrap">
                            <img :src="previews[0] ?? '/car-placeholder.svg'" class="pm-img" alt="" />
                            <div class="pm-img-count" v-if="previews.length > 1">+{{ previews.length - 1 }} zdjęć</div>
                        </div>
                        <div class="pm-content">
                            <div class="pm-brand">{{ brandName }}</div>
                            <h2 class="pm-name">{{ previewTitle }}</h2>
                            <div class="pm-meta">
                                <span v-if="form.year">{{ form.year }}</span>
                                <span v-if="fuelTypeName">{{ fuelTypeName }}</span>
                                <span v-if="form.mileage">{{ Number(form.mileage).toLocaleString('pl') }} km</span>
                                <span v-if="form.city">{{ form.city }}</span>
                            </div>
                            <div class="pm-price">{{ form.price ? Number(form.price).toLocaleString('pl') + ' zł' : '— zł' }}</div>
                            <p v-if="form.description" class="pm-desc">{{ form.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { TaxonomyItem, Generation, EngineVersion, Feature, DriveType, CarColor, CouponValidation, CarAdvert, AdvertImage, CategoryWithCount, SelectOption, VehicleSubtype, PartCategory, PartSubcategory } from '~/types'
import { useImageUrl } from '~/composables/useImageUrl'
import { usePhotoAnalysis } from '~/composables/usePhotoAnalysis'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Dodaj ogłoszenie — CARIZO', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { getImageUrl } = useImageUrl()
const { analyzePhoto: analyzePhotoLocal } = usePhotoAnalysis()

// ── Category field configuration ──────────────────────────────────────────────
interface ExtraField {
    key: string
    label: string
    type: 'number' | 'select' | 'text' | 'boolean' | 'radio' | 'color-picker'
    options?: { value: string; label: string }[]
    unit?: string
    placeholder?: string
    required?: boolean
    hint?: string
    fullWidth?: boolean
}

interface CatFieldConfig {
    // Standard backend fields to show
    fields: string[]
    required: string[]
    // Whether brand uses API dropdown or free-text input
    brandFieldType?: 'select' | 'text'
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
    engineHint?: string
    categoryNote?: string
    // Step 1 section visibility
    showVinSection?: boolean
    showHistorySection?: boolean
}

const CATEGORY_CONFIGS: Record<string, CatFieldConfig> = {
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
            { key: 'colorFinish', label: 'Wykończenie lakieru', type: 'radio',
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
            { key: 'firstOwner', label: 'Pierwszy właściciel', type: 'boolean' },
            { key: 'noDamage', label: 'Bezwypadkowy (potwierdzony)', type: 'boolean' },
            { key: 'hasASO', label: 'Serwisowany w ASO', type: 'boolean' },
            { key: 'testDrive', label: 'Możliwość jazdy próbnej', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT (23%)', type: 'boolean' },
            { key: 'vatMargin', label: 'Faktura VAT-marża', type: 'boolean' },
            { key: 'registeredInPoland', label: 'Zarejestrowany w Polsce', type: 'boolean' },
            { key: 'rightHandDrive', label: 'Kierownica po prawej stronie (RHD)', type: 'boolean' },
            { key: 'tuning', label: 'Tuning / modyfikacje', type: 'boolean' },
            { key: 'leasingPossible', label: 'Możliwość leasingu / finansowania', type: 'boolean' },
        ],
    },

    'dostawcze': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price'],
        required: ['brand', 'model', 'year', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        priceHint: 'Rynek: 5 000 – 200 000 zł',
        categoryNote: 'Dostawcze i busy do 3,5t. Parametry ładunkowe wpisz poniżej.',
        showVinSection: true,
        showHistorySection: true,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'bodyVariant', label: 'Zabudowa / typ', type: 'select', required: true,
              options: [
                { value: 'furgon', label: 'Furgon' }, { value: 'skrzyniowy', label: 'Skrzyniowy' },
                { value: 'wywrotka', label: 'Wywrotka' }, { value: 'izoterma', label: 'Izoterma' },
                { value: 'chlodnia', label: 'Chłodnia' }, { value: 'busa', label: 'Bus osobowo-towarowy' },
                { value: 'kontener', label: 'Kontener' }, { value: 'minibus', label: 'Minibus / Mikrobus' },
                { value: 'specjalny', label: 'Specjalny / zabudowa niestandardowa' },
              ] },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 1000' },
            { key: 'gvw', label: 'DMC (dopuszczalna masa całkowita)', type: 'number', unit: 'kg', placeholder: 'np. 3500' },
            { key: 'loadingLength', label: 'Długość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 3.5' },
            { key: 'loadingHeight', label: 'Wysokość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 1.8' },
            { key: 'loadingWidth', label: 'Szerokość przestrzeni ładunkowej', type: 'number', unit: 'm', placeholder: 'np. 1.9' },
            { key: 'color', label: 'Kolor', type: 'color-picker', fullWidth: true },
            { key: 'colorFinish', label: 'Wykończenie lakieru', type: 'radio',
              options: [
                { value: 'solid', label: 'Pełny (solid)' }, { value: 'metallic', label: 'Metalik' },
                { value: 'pearl', label: 'Perłowy' }, { value: 'matte', label: 'Matowy' },
              ] },
            { key: 'euroNorm', label: 'Norma EURO', type: 'select',
              options: [{ value: 'euro3', label: 'Euro 3' }, { value: 'euro4', label: 'Euro 4' },
                        { value: 'euro5', label: 'Euro 5' }, { value: 'euro6', label: 'Euro 6' }, { value: 'euro6d', label: 'Euro 6d' }] },
            { key: 'hasAC', label: 'Klimatyzacja', type: 'boolean' },
            { key: 'hasReverseCam', label: 'Kamera cofania', type: 'boolean' },
            { key: 'hasLiftgate', label: 'Winda załadowcza', type: 'boolean' },
            { key: 'firstOwner', label: 'Pierwszy właściciel', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT (23%)', type: 'boolean' },
        ],
    },

    'ciezarowe': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price'],
        required: ['brand', 'model', 'year', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        engineHint: 'np. 12 900 cm³',
        priceHint: 'Rynek: 10 000 – 1 000 000 zł',
        categoryNote: 'Pojazdy ciężarowe powyżej 3,5t. Uzupełnij dane techniczne poniżej.',
        showVinSection: true,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'truckType', label: 'Typ pojazdu', type: 'select', required: true,
              options: [
                { value: 'ciagnik', label: 'Ciągnik siodłowy' }, { value: 'skrzyniowy', label: 'Skrzyniowy' },
                { value: 'wywrotka', label: 'Wywrotka' }, { value: 'chlodnia', label: 'Chłodnia' },
                { value: 'izoterma', label: 'Izoterma' }, { value: 'cysterna', label: 'Cysterna' },
                { value: 'hakowiec', label: 'Hakowiec / Kontenerowiec' }, { value: 'betonomieszarka', label: 'Betonomieszarka' },
                { value: 'dzwig', label: 'Dźwig / HDS' }, { value: 'specjalny', label: 'Specjalny' },
              ] },
            { key: 'axles', label: 'Liczba osi', type: 'select', required: true,
              options: [{ value: '2', label: '2 osie' }, { value: '3', label: '3 osie' },
                        { value: '4', label: '4 osie' }, { value: '5+', label: '5+ osi' }] },
            { key: 'cabType', label: 'Typ kabiny', type: 'select',
              options: [{ value: 'normal', label: 'Normalna' }, { value: 'low', label: 'Niska' },
                        { value: 'high', label: 'Wysoka (sleeper)' }, { value: 'mega', label: 'Mega / Super Space' },
                        { value: 'crew', label: 'Crew cab (załogowa)' }] },
            { key: 'gvw', label: 'DMC (tony)', type: 'number', unit: 't', placeholder: 'np. 26' },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 18000' },
            { key: 'color', label: 'Kolor', type: 'color-picker', fullWidth: true },
            { key: 'euroNorm', label: 'Norma EURO', type: 'select',
              options: [{ value: 'euro3', label: 'Euro 3' }, { value: 'euro4', label: 'Euro 4' },
                        { value: 'euro5', label: 'Euro 5' }, { value: 'euro6', label: 'Euro 6' }, { value: 'euro6d', label: 'Euro 6d' }] },
            { key: 'hasTachograph', label: 'Tachograf cyfrowy', type: 'boolean' },
            { key: 'hasRetarder', label: 'Retarder (hamulec hydrodynamiczny)', type: 'boolean' },
            { key: 'hasAC', label: 'Klimatyzacja kabiny', type: 'boolean' },
            { key: 'hasAPU', label: 'Agregat postojowy (APU)', type: 'boolean' },
            { key: 'hasHydraulics', label: 'Hydraulika (PTO)', type: 'boolean' },
            { key: 'hasLiftAxle', label: 'Oś podnoszona (Lift Axle)', type: 'boolean' },
            { key: 'hasADR', label: 'Dopuszczenie ADR', type: 'boolean' },
            { key: 'firstOwner', label: 'Pierwszy właściciel', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT (23%)', type: 'boolean' },
        ],
    },

    'czesci': {
        fields: ['brand', 'model', 'year', 'price'],
        required: ['price'],
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
        extraFields: [
            { key: 'condition', label: 'Stan części', type: 'radio', required: true,
              options: [
                { value: 'new', label: 'Nowa' }, { value: 'regen', label: 'Regenerowana' },
                { value: 'used-good', label: 'Używana – dobry stan' }, { value: 'used', label: 'Używana' },
                { value: 'damaged', label: 'Uszkodzona / na części' },
              ] },
            { key: 'partCategory', label: 'Kategoria części', type: 'select', required: true,
              options: [
                { value: 'silnik', label: 'Silnik i osprzęt' }, { value: 'skrzynia', label: 'Skrzynia biegów / napęd' },
                { value: 'zawieszenie', label: 'Zawieszenie i układ kierowniczy' }, { value: 'hamulce', label: 'Hamulce' },
                { value: 'elektryka', label: 'Elektryka i elektronika' }, { value: 'nadwozie-zewn', label: 'Nadwozie zewnętrzne' },
                { value: 'nadwozie-wewn', label: 'Wnętrze / tapicerka' }, { value: 'oswietlenie', label: 'Oświetlenie' },
                { value: 'chlodnica', label: 'Układ chłodzenia' }, { value: 'wydech', label: 'Układ wydechowy' },
                { value: 'paliwo', label: 'Układ paliwowy' }, { value: 'klimatyzacja', label: 'Klimatyzacja / ogrzewanie' },
                { value: 'kola', label: 'Koła, felgi i opony' }, { value: 'akcesoria', label: 'Akcesoria i tuning' },
                { value: 'narzedzia', label: 'Narzędzia i wyposażenie warsztatu' },
                { value: 'inne', label: 'Inne' },
              ] },
            { key: 'side', label: 'Strona montażu', type: 'select',
              options: [
                { value: 'left', label: 'Lewa' }, { value: 'right', label: 'Prawa' },
                { value: 'front', label: 'Przód' }, { value: 'rear', label: 'Tył' },
                { value: 'universal', label: 'Uniwersalna / obustronnie' },
              ] },
            { key: 'partNumber', label: 'Numer OEM / katalogowy', type: 'text', placeholder: 'np. 3C0853630A', hint: 'Numer oryginalny części od producenta pojazdu' },
            { key: 'manufacturer', label: 'Producent części', type: 'text', placeholder: 'np. Bosch, Febi, SKF, OEM' },
            { key: 'compatibility', label: 'Pasuje również do', type: 'text', placeholder: 'np. VW Golf VI, Seat Leon II', fullWidth: true, hint: 'Inne modele, do których pasuje ta część' },
            { key: 'quantity', label: 'Dostępna ilość (szt.)', type: 'number', placeholder: 'np. 1' },
            { key: 'vatInvoice', label: 'Faktura VAT', type: 'boolean' },
            { key: 'shipping', label: 'Możliwa wysyłka', type: 'boolean' },
            { key: 'warranty', label: 'Gwarancja na część', type: 'boolean' },
        ],
    },

    'motocykle': {
        fields: ['brand', 'model', 'year', 'fuelType', 'engine', 'power', 'mileage', 'price'],
        required: ['brand', 'model', 'year', 'mileage', 'price'],
        mileageLabel: 'Przebieg (km)',
        engineHint: 'np. 649 cm³, 1000 cm³',
        priceHint: 'Rynek: 1 000 – 150 000 zł',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan pojazdu', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }, { value: 'damaged', label: 'Uszkodzony' }] },
            { key: 'motorcycleType', label: 'Typ motocykla', type: 'select', required: true,
              options: [
                { value: 'sport', label: 'Sportowy / Supersport' }, { value: 'touring', label: 'Turystyczny (Tourer)' },
                { value: 'adventure', label: 'Adventure / Enduro drogowe' }, { value: 'enduro', label: 'Enduro / Cross / Off-road' },
                { value: 'cruiser', label: 'Cruiser / Chopper' }, { value: 'naked', label: 'Naked / Streetfighter' },
                { value: 'cafe-racer', label: 'Café Racer / Scrambler' }, { value: 'scooter', label: 'Skuter' },
                { value: 'scooter125', label: 'Skuter 125 cm³ (AM)' }, { value: 'trial', label: 'Trial' },
                { value: 'quad', label: 'Quad / ATV' }, { value: 'sidecar', label: 'Z wózkiem bocznym' },
                { value: 'electric', label: 'Elektryczny' }, { value: 'other', label: 'Inny' },
              ] },
            { key: 'color', label: 'Kolor', type: 'color-picker', fullWidth: true },
            { key: 'colorFinish', label: 'Wykończenie lakieru', type: 'radio',
              options: [
                { value: 'solid', label: 'Pełny (solid)' }, { value: 'metallic', label: 'Metalik' },
                { value: 'matte', label: 'Matowy' }, { value: 'multicolor', label: 'Wielobarwny / racing livery' },
              ] },
            { key: 'hasABS', label: 'ABS', type: 'boolean' },
            { key: 'hasTCS', label: 'Kontrola trakcji (TCS)', type: 'boolean' },
            { key: 'hasQuickshifter', label: 'Quickshifter (bi-directional)', type: 'boolean' },
            { key: 'hasHeatedGrips', label: 'Podgrzewane manetki', type: 'boolean' },
            { key: 'hasCruiseControl', label: 'Tempomat', type: 'boolean' },
            { key: 'hasRideByWire', label: 'Ride-by-Wire / tryby jazdy', type: 'boolean' },
            { key: 'hasLedLights', label: 'Oświetlenie LED', type: 'boolean' },
            { key: 'hasSaddlebags', label: 'Kufry / sakwy', type: 'boolean' },
            { key: 'firstOwner', label: 'Pierwszy właściciel', type: 'boolean' },
            { key: 'noDamage', label: 'Bezwypadkowy', type: 'boolean' },
            { key: 'testDrive', label: 'Możliwość jazdy próbnej', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT', type: 'boolean' },
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
            { key: 'trailerType', label: 'Typ przyczepy', type: 'select', required: true,
              options: [
                { value: 'naczepa-plandeka', label: 'Naczepa plandeka' }, { value: 'naczepa-chlodnia', label: 'Naczepa chłodnia' },
                { value: 'polnaczepa', label: 'Półnaczepa skrzyniowa' }, { value: 'laweta', label: 'Laweta / autotransporter' },
                { value: 'wywrotka', label: 'Przyczepa wywrotka' }, { value: 'chlodnia', label: 'Przyczepa chłodnia' },
                { value: 'platforma', label: 'Naczepa platforma / niskopodwozie' }, { value: 'tandem', label: 'Tandem / dwuosiowa' },
                { value: 'cysterna', label: 'Cysterna' }, { value: 'lekka', label: 'Przyczepa lekka (osobowa)' },
                { value: 'kempingowa', label: 'Kempingowa / karavan' }, { value: 'inne', label: 'Inne' },
              ] },
            { key: 'payload', label: 'Ładowność', type: 'number', unit: 'kg', placeholder: 'np. 24000' },
            { key: 'gvw', label: 'DMC', type: 'number', unit: 'kg', placeholder: 'np. 39000' },
            { key: 'length', label: 'Długość całkowita', type: 'number', unit: 'm', placeholder: 'np. 13.6' },
            { key: 'width', label: 'Szerokość całkowita', type: 'number', unit: 'm', placeholder: 'np. 2.6' },
            { key: 'height', label: 'Wysokość całkowita', type: 'number', unit: 'm', placeholder: 'np. 4.0' },
            { key: 'axles', label: 'Liczba osi', type: 'select',
              options: [{ value: '1', label: '1 oś' }, { value: '2', label: '2 osie' }, { value: '3', label: '3 osie' }, { value: '4+', label: '4+ osi' }] },
            { key: 'hasHydraulics', label: 'Hydraulika', type: 'boolean' },
            { key: 'hasLift', label: 'Winda załadunkowa', type: 'boolean' },
            { key: 'hasBrakes', label: 'Hamulec najazdowy', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT', type: 'boolean' },
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
            { key: 'machineType', label: 'Typ maszyny / urządzenia', type: 'select', required: true,
              options: [
                { value: 'ciagnik', label: 'Ciągnik rolniczy' }, { value: 'kombajn-zbozowy', label: 'Kombajn zbożowy' },
                { value: 'kombajn-ziemniaczany', label: 'Kombajn ziemniaczany' }, { value: 'kombajn-buraczkowy', label: 'Kombajn buraczkowy' },
                { value: 'siewnik', label: 'Siewnik zbożowy / punktowy' }, { value: 'plug', label: 'Pług' },
                { value: 'glebogryzarka', label: 'Glebogryzarka' }, { value: 'opryskiwacz', label: 'Opryskiwacz' },
                { value: 'prasa', label: 'Prasa rolnicza (baler)' }, { value: 'ladowacz', label: 'Ładowacz czołowy (TUR)' },
                { value: 'rozsiewacz', label: 'Rozsiewacz nawozów' }, { value: 'rozrzutnik', label: 'Rozrzutnik obornika' },
                { value: 'agregat', label: 'Agregat uprawowy' }, { value: 'sadzarka', label: 'Sadzarka do ziemniaków' },
                { value: 'kopaczka', label: 'Kopaczka do ziemniaków' }, { value: 'beczkowoz', label: 'Beczkowóz / wóz asenizacyjny' },
                { value: 'sieczkarnia', label: 'Sieczkarnia polowa' }, { value: 'inne', label: 'Inne' },
              ] },
            { key: 'condition', label: 'Stan maszyny', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona / na części' }] },
            { key: 'workingWidth', label: 'Szerokość robocza', type: 'number', unit: 'm', placeholder: 'np. 6.0' },
            { key: 'engineHp', label: 'Moc silnika (HP)', type: 'number', unit: 'HP', placeholder: 'np. 200' },
            { key: 'frontLoader', label: 'Ładowacz czołowy (TUR)', type: 'boolean' },
            { key: 'dualWheels', label: 'Bliźniaki (koła bliźniacze)', type: 'boolean' },
            { key: 'frontPTO', label: 'Przedni WOM', type: 'boolean' },
            { key: 'rearPTO', label: 'Tylny WOM', type: 'boolean' },
            { key: 'gps', label: 'GPS / Auto-steer', type: 'boolean' },
            { key: 'fourWD', label: 'Napęd 4WD', type: 'boolean' },
            { key: 'cabinAC', label: 'Klimatyzacja kabiny', type: 'boolean' },
            { key: 'isobus', label: 'ISOBUS (ISO 11783)', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT', type: 'boolean' },
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
            { key: 'machineType', label: 'Typ maszyny', type: 'select', required: true,
              options: [
                { value: 'koparka-gasienicowa', label: 'Koparka gąsienicowa' },
                { value: 'koparka-kolowa', label: 'Koparka kołowa' },
                { value: 'koparka-ladowarka', label: 'Koparko-ładowarka' },
                { value: 'minieksawator', label: 'Minieksawator / minikoparko-ładowarka' },
                { value: 'ladowarka', label: 'Ładowarka kołowa' },
                { value: 'ladowarka-teleskopowa', label: 'Ładowarka teleskopowa' },
                { value: 'wozek-widlowy', label: 'Wózek widłowy' },
                { value: 'dzwig-mobilny', label: 'Dźwig mobilny (samojezdny)' },
                { value: 'dzwig-wieze', label: 'Dźwig wieżowy' },
                { value: 'platforma-nosna', label: 'Platforma nożycowa / wznośna' },
                { value: 'walec', label: 'Walec drogowy' },
                { value: 'finisher', label: 'Finisher / rozkładarka asfaltu' },
                { value: 'betonomieszarka', label: 'Betonomieszarka' },
                { value: 'pompa-betonu', label: 'Pompa do betonu' },
                { value: 'spycharka', label: 'Spycharka / buldożer' },
                { value: 'wiertnica', label: 'Wiertnica / palownica' },
                { value: 'inne', label: 'Inne' },
              ] },
            { key: 'condition', label: 'Stan maszyny', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona / na części' }] },
            { key: 'liftCapacity', label: 'Udźwig / nośność', type: 'number', unit: 'kg', placeholder: 'np. 10000' },
            { key: 'workingHeight', label: 'Wysokość robocza / zasięg', type: 'number', unit: 'm', placeholder: 'np. 12' },
            { key: 'operatingWeight', label: 'Masa robocza maszyny', type: 'number', unit: 'kg', placeholder: 'np. 20000' },
            { key: 'hasHydraulics', label: 'Rozdzielacz hydrauliczny', type: 'boolean' },
            { key: 'hasCabin', label: 'Zamknięta kabina', type: 'boolean' },
            { key: 'hasAC', label: 'Klimatyzacja kabiny', type: 'boolean' },
            { key: 'hasGPS', label: 'GPS / system sterowania', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT', type: 'boolean' },
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
            { key: 'machineType', label: 'Typ maszyny', type: 'select', required: true,
              options: [
                { value: 'wozek-widlowy', label: 'Wózek widłowy' }, { value: 'wozek-teleskopowy', label: 'Wózek teleskopowy' },
                { value: 'koparka', label: 'Koparka' }, { value: 'koparka-ladowarka', label: 'Koparko-ładowarka' },
                { value: 'ladowarka', label: 'Ładowarka' }, { value: 'dzwig', label: 'Dźwig / Żuraw' },
                { value: 'platforma', label: 'Platforma nożycowa / wznośna' }, { value: 'walec', label: 'Walec drogowy' },
                { value: 'betonomieszarka', label: 'Betoniarka / Betonomieszarka' }, { value: 'miniescavator', label: 'Minieksawator' },
                { value: 'agregat-prad', label: 'Agregat prądotwórczy' }, { value: 'sprężarka', label: 'Sprężarka powietrza' },
                { value: 'inne', label: 'Inne maszyny przemysłowe' },
              ] },
            { key: 'liftCapacity', label: 'Udźwig / nośność', type: 'number', unit: 'kg', placeholder: 'np. 5000' },
            { key: 'workingHeight', label: 'Wysokość robocza / zasięg', type: 'number', unit: 'm', placeholder: 'np. 12' },
            { key: 'condition', label: 'Stan maszyny', type: 'radio', required: true,
              options: [{ value: 'used', label: 'Używana' }, { value: 'new', label: 'Nowa' }, { value: 'damaged', label: 'Uszkodzona' }] },
            { key: 'hasAC', label: 'Klimatyzacja kabiny', type: 'boolean' },
            { key: 'hasCabin', label: 'Zamknięta kabina', type: 'boolean' },
            { key: 'vatInvoice', label: 'Faktura VAT', type: 'boolean' },
        ],
    },

    'inne': {
        fields: ['brand', 'model', 'year', 'mileage', 'price'],
        required: ['price'],
        mileageLabel: 'Przebieg (km)',
        priceHint: 'Podaj cenę pojazdu',
        showVinSection: false,
        showHistorySection: false,
        extraFields: [
            { key: 'condition', label: 'Stan', type: 'radio',
              options: [{ value: 'used', label: 'Używany' }, { value: 'new', label: 'Nowy' }] },
        ],
    },
}

const DEFAULT_CAT_CONFIG: CatFieldConfig = {
    fields: ['brand', 'model', 'generation', 'year', 'fuelType', 'engine', 'power', 'gearbox', 'mileage', 'price', 'bodyType'],
    required: ['brand', 'model', 'year', 'mileage', 'price'],
    mileageLabel: 'Przebieg (km)',
}

// ── Subtype-specific extra fields ──────────────────────────────────────────
const SUBTYPE_EXTRA_FIELDS: Record<string, ExtraField[]> = {
  // ── Trucks ──────────────────────────────────────────────────────────────
  'ciagnik-siodlowy': [
    { key: 'cabType', label: 'Typ kabiny', type: 'select', options: [
      { value: 'dzienna', label: 'Kabina dzienna' },
      { value: 'sypialnia', label: 'Kabina sypialnia' },
      { value: 'maxi', label: 'Kabina Maxi' },
    ]},
    { key: 'suspension', label: 'Zawieszenie tylne', type: 'select', options: [
      { value: 'resorowe', label: 'Resorowe' },
      { value: 'powietrzne', label: 'Powietrzne' },
    ]},
    { key: 'axleConfig', label: 'Konfiguracja osi', type: 'select', options: [
      { value: '4x2', label: '4x2' }, { value: '6x2', label: '6x2' },
      { value: '6x4', label: '6x4' }, { value: '8x4', label: '8x4' },
    ]},
  ],
  'wywrotka': [
    { key: 'bodySubtype', label: 'Kierunek wysypu', type: 'select', options: [
      { value: 'tylny', label: 'Tylny' },
      { value: '3-stronny', label: '3-stronny' },
      { value: 'boczny', label: 'Boczny' },
    ]},
    { key: 'dumpBodyMaterial', label: 'Materiał skrzyni', type: 'select', options: [
      { value: 'stal', label: 'Stal' },
      { value: 'aluminium', label: 'Aluminium' },
      { value: 'polietylen', label: 'Polietylen' },
    ]},
    { key: 'volume', label: 'Pojemność skrzyni (m³)', type: 'number', unit: 'm³' },
  ],
  'chlodnia-ciezarowa': [
    { key: 'tempMin', label: 'Min. temperatura (°C)', type: 'number', unit: '°C' },
    { key: 'tempMax', label: 'Max. temperatura (°C)', type: 'number', unit: '°C' },
    { key: 'tankCapacity', label: 'Objętość ładowni (m³)', type: 'number', unit: 'm³' },
    { key: 'atpCert', label: 'Certyfikat ATP', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'firanka': [
    { key: 'loadingHeight', label: 'Wysokość załadunku (m)', type: 'number', unit: 'm' },
    { key: 'volume', label: 'Objętość ładowni (m³)', type: 'number', unit: 'm³' },
    { key: 'hasLiftgate', label: 'Winda załadowcza', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'cysterna': [
    { key: 'tankCapacity', label: 'Pojemność zbiornika (m³)', type: 'number', unit: 'm³' },
    { key: 'tankMaterial', label: 'Materiał zbiornika', type: 'select', options: [
      { value: 'stal', label: 'Stal nierdzewna' },
      { value: 'aluminium', label: 'Aluminium' },
      { value: 'tworzywo', label: 'Tworzywo sztuczne' },
    ]},
    { key: 'adrClass', label: 'Klasa ADR', type: 'select', options: [
      { value: 'brak', label: 'Brak' }, { value: '1', label: 'Klasa 1 (mat. wybuchowe)' },
      { value: '2', label: 'Klasa 2 (gazy)' }, { value: '3', label: 'Klasa 3 (ciecze łatwopal.)' },
      { value: '8', label: 'Klasa 8 (substancje żrące)' },
    ]},
  ],

  // ── Agricultural ────────────────────────────────────────────────────────
  'ciagnik': [
    { key: 'ptoRpm', label: 'WOM (rpm)', type: 'select', options: [
      { value: '540', label: '540 rpm' }, { value: '1000', label: '1000 rpm' },
      { value: '540/1000', label: '540/1000 rpm' }, { value: 'eco', label: 'ECO' },
    ]},
    { key: 'hasFrontLinkage', label: 'TUZ przedni', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
    { key: 'hydraulicOutputs', label: 'Wyjścia hydrauliczne', type: 'number', unit: 'szt.' },
    { key: 'cabin', label: 'Kabina', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'kombajn': [
    { key: 'bodySubtype', label: 'Typ uprawy', type: 'select', options: [
      { value: 'zbozowy', label: 'Zbożowy' }, { value: 'kukurydza', label: 'Kukurydza' },
      { value: 'rzepak', label: 'Rzepak' }, { value: 'uniwersalny', label: 'Uniwersalny' },
    ]},
    { key: 'workingWidth', label: 'Szerokość heder (cm)', type: 'number', unit: 'cm' },
    { key: 'tankCapacity', label: 'Pojemność zbiornika ziarna (L)', type: 'number', unit: 'L' },
    { key: 'hasStrawChopper', label: 'Rozdrabniacz słomy', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'opryskiwacz': [
    { key: 'selfPropelled', label: 'Typ', type: 'radio', options: [
      { value: 'samojezdny', label: 'Samojezdny' }, { value: 'zawieszany', label: 'Zawieszany' },
      { value: 'przyczepiany', label: 'Przyczepiany' },
    ]},
    { key: 'workingWidth', label: 'Szerokość robocza (m)', type: 'number', unit: 'm' },
    { key: 'tankCapacity', label: 'Pojemność zbiornika (L)', type: 'number', unit: 'L' },
    { key: 'hasGps', label: 'Prowadzenie GPS', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'prasa': [
    { key: 'bodySubtype', label: 'Typ bel', type: 'select', options: [
      { value: 'okragle', label: 'Bele okrągłe' }, { value: 'prostokatne', label: 'Bele prostokątne' },
    ]},
    { key: 'workingWidth', label: 'Szerokość podbierania (cm)', type: 'number', unit: 'cm' },
    { key: 'hasNetWrap', label: 'Owijarka siatką', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'siewnik': [
    { key: 'workingWidth', label: 'Szerokość robocza (m)', type: 'number', unit: 'm' },
    { key: 'tankCapacity', label: 'Pojemność skrzyni nasiennej (L)', type: 'number', unit: 'L' },
    { key: 'rowSpacing', label: 'Rozstaw rzędów (cm)', type: 'number', unit: 'cm' },
  ],

  // ── Construction ─────────────────────────────────────────────────────────
  'koparka': [
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'maxDiggingDepth', label: 'Max. głębokość kopania (m)', type: 'number', unit: 'm' },
    { key: 'bucketCapacity', label: 'Pojemność łyżki (L)', type: 'number', unit: 'L' },
    { key: 'undercarriage', label: 'Podwozie', type: 'select', options: [
      { value: 'gabki-gumowe', label: 'Gąsienice gumowe' },
      { value: 'gabki-stalowe', label: 'Gąsienice stalowe' },
      { value: 'kolowe', label: 'Kołowe' },
    ]},
    { key: 'tailSwing', label: 'Tylni zwis', type: 'select', options: [
      { value: 'standardowy', label: 'Standardowy' },
      { value: 'ograniczony', label: 'Ograniczony' },
      { value: 'zerowy', label: 'Zerowy' },
    ]},
  ],
  'minikopiarka': [
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'maxDiggingDepth', label: 'Max. głębokość kopania (m)', type: 'number', unit: 'm' },
    { key: 'bucketCapacity', label: 'Pojemność łyżki (L)', type: 'number', unit: 'L' },
    { key: 'hasOffsetBoom', label: 'Offset ramię', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'ladowarka': [
    { key: 'bucketCapacity', label: 'Pojemność łyżki (m³)', type: 'number', unit: 'm³' },
    { key: 'liftHeight', label: 'Wysokość podnoszenia (m)', type: 'number', unit: 'm' },
    { key: 'hasPalletForks', label: 'Widelce paletowe', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
    { key: 'hasTelescopicArm', label: 'Ramię teleskopowe', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'spycharka': [
    { key: 'bodySubtype', label: 'Typ lemiesza', type: 'select', options: [
      { value: 'prosty', label: 'Lemiesz prosty (S)' },
      { value: 'u-blade', label: 'Lemiesz U' },
      { value: 's-blade', label: 'Lemiesz S-blade' },
    ]},
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'hasRipper', label: 'Spulchniacz', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'walec': [
    { key: 'bodySubtype', label: 'Typ walca', type: 'select', options: [
      { value: 'jednostkowy', label: 'Jednostkowy (wibracyjny)' },
      { value: 'dwuwalcowy', label: 'Dwuwalcowy' },
      { value: 'ogumiony', label: 'Ogumiony' },
    ]},
    { key: 'operatingWeight', label: 'Masa robocza (t)', type: 'number', unit: 't' },
    { key: 'workingWidth', label: 'Szerokość robocza (cm)', type: 'number', unit: 'cm' },
    { key: 'hasVibration', label: 'Wibrator', type: 'radio', options: [
      { value: 'tak', label: 'Tak' }, { value: 'nie', label: 'Nie' },
    ]},
  ],
  'zuraw': [
    { key: 'bodySubtype', label: 'Typ żurawia', type: 'select', options: [
      { value: 'wiezowy', label: 'Wieżowy' }, { value: 'mobilny', label: 'Mobilny' },
      { value: 'samojezdny', label: 'Samojezdny' },
    ]},
    { key: 'maxLoad', label: 'Udźwig max (t)', type: 'number', unit: 't' },
    { key: 'maxBoom', label: 'Długość wysięgnika (m)', type: 'number', unit: 'm' },
  ],
}

const route = useRoute()
const editId = computed(() => route.query.edit ? Number(route.query.edit) : null)
const isEdit = computed(() => !!editId.value)

const { fetchBrands, fetchBrandsByCategory, fetchModels, fetchGenerations, fetchEngines, fetchTrims, fetchEnginesByTrim, fetchFuelTypes, fetchGearboxes, fetchBodyTypes, fetchDriveTypes, fetchColors, fetchFeatures, fetchFeatureCategoriesByContext, fetchVehicleSubtypes, fetchPartCategories, fetchPartSubcategories, fetchEngineSpecs } = useTaxonomy()
const { validateCoupon } = useCoupons()
const { getPrice } = usePayment()
const { fetchCategories } = useCategories()

const brands = ref<TaxonomyItem[]>([])
const models = ref<TaxonomyItem[]>([])
const generations = ref<Generation[]>([])
const trims = ref<TaxonomyItem[]>([])
const engines = ref<EngineVersion[]>([])
const subtypes = ref<VehicleSubtype[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const gearboxes = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])
const driveTypes = ref<DriveType[]>([])
const colors = ref<CarColor[]>([])
const allFeatures = ref<Feature[]>([])
const featuresLoaded = ref(false)
const vehicleSubtypes = ref<VehicleSubtype[]>([])
const partCategories = ref<PartCategory[]>([])
const partSubcategories = ref<PartSubcategory[]>([])
const engineSpecs = ref<any>(null)
const loading = ref(false)
const error = ref('')
const limitError = ref<'private_limit_active' | 'private_limit_yearly' | null>(null)
const stepError = ref('')
const selectedFiles = ref<File[]>([])
const previews = ref<string[]>([])
const currentStep = ref(0)

const advertCategories = ref<CategoryWithCount[]>([])

// Success screen state
const publishedAdvertId = ref<number | null>(null)
const showSuccess = ref(false)

const voivodeships = [
    'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
    'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
    'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
    'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
]

const draftSaved = ref(false)
const existingImages = ref<AdvertImage[]>([])
const deletingImageId = ref<number | null>(null)
const vinLoading = ref(false)
const vinError = ref('')
const previewOpen = ref(false)
const photoUploading = ref(false)
const paying = ref(false)
const dragSrcIdx = ref<number | null>(null)
const dragOverIdx = ref<number | null>(null)
const gridDragOver = ref(false)
const pdfUploading = ref(false)
const pdfUploadError = ref('')
const pdfFileName = ref('')
const pdfPendingFile = ref<File | null>(null)

// ── AI Photo Quality Analysis ─────────────────────────────────────────────────
const photoAnalysisResults = ref<Record<number, { score: number, issues: string[], suggestions: string[], summary: string, loading: boolean }>>({})

async function analyzePhoto(index: number, file: File) {
    photoAnalysisResults.value[index] = { score: 0, issues: [], suggestions: [], loading: true, summary: '' }
    try {
        const result = await analyzePhotoLocal(file)
        photoAnalysisResults.value[index] = { ...result, loading: false }
    } catch {
        photoAnalysisResults.value[index] = {
            score: 0,
            issues: ['Błąd analizy zdjęcia'],
            suggestions: [],
            summary: 'Nie udało się przeanalizować zdjęcia',
            loading: false
        }
    }
}

// ── "Inne" (Other) Category Custom Form ──────────────────────────────────────
const otherCategoryForm = reactive({
    categoryName: '',
    description: '',
    parameters: [] as { key: string, value: string }[]
})
const otherCategorySubmitted = ref(false)
const otherCategorySubmitting = ref(false)

function addOtherParameter() {
    otherCategoryForm.parameters.push({ key: '', value: '' })
}

function removeOtherParameter(index: number) {
    otherCategoryForm.parameters.splice(index, 1)
}

async function submitOtherCategory() {
    if (!otherCategoryForm.categoryName.trim()) return
    otherCategorySubmitting.value = true
    try {
        const parametersJson = otherCategoryForm.parameters.length > 0
            ? JSON.stringify(Object.fromEntries(otherCategoryForm.parameters.map(p => [p.key, p.value])))
            : null

        await $fetch('/api/custom-categories', {
            method: 'POST',
            body: {
                categoryName: otherCategoryForm.categoryName,
                description: otherCategoryForm.description || null,
                parametersJson
            }
        })
        otherCategorySubmitted.value = true
    } catch {
        const { error: toastError } = useToast()
        toastError('Nie udało się wysłać propozycji kategorii. Spróbuj ponownie.')
    } finally {
        otherCategorySubmitting.value = false
    }
}

const isOtherCategorySelected = computed(() => {
    const selected = advertCategories.value.find((c: any) => c.id === form.categoryId)
    return selected?.name?.toLowerCase().includes('inne') ||
        selected?.slug?.toLowerCase().includes('inne') ||
        selected?.name?.toLowerCase().includes('other')
})

// Promotion plan state
const promoSelected = ref<string>('free')
const promoDays = ref(7)
const promoApiPrices = ref<Record<string, number>>({})
const couponCode = ref('')
const couponLoading = ref(false)
const couponError = ref('')
const couponResult = ref<CouponValidation | null>(null)

const promoPlans = [
    {
        key: 'Featured', name: 'Wyróżnienie', icon: 'mdi-star-outline',
        priceFrom: 14.99, popular: false, defaultDays: 7, days: [7, 14, 30],
        desc: 'Ogłoszenie wyróżnione w wynikach wyszukiwania.',
        feats: ['Wyróżniony kolor ramki', 'Oznaczenie WYRÓŻNIONE', '2× więcej wyświetleń'],
        prices: { 7: 14.99, 14: 24.99, 30: 39.99 } as Record<number, number>,
    },
    {
        key: 'Top', name: 'TOP', icon: 'mdi-crown-outline',
        priceFrom: 19.99, popular: true, defaultDays: 7, days: [7, 14, 30],
        desc: 'Ogłoszenie na szczycie wyników wyszukiwania.',
        feats: ['Pozycja TOP w wynikach', 'Baner reklamowy', '5× więcej wyświetleń'],
        prices: { 7: 19.99, 14: 29.99, 30: 49.99 } as Record<number, number>,
    },
    {
        key: 'Premium', name: 'Premium', icon: 'mdi-diamond-outline',
        priceFrom: 29.99, popular: false, defaultDays: 7, days: [7, 14, 30],
        desc: 'Maksymalna widoczność i priorytetowe pozycjonowanie.',
        feats: ['Wszystko z TOP', 'Sekcja polecane ogłoszenia', 'Priorytetowe wsparcie'],
        prices: { 7: 29.99, 14: 44.99, 30: 79.99 } as Record<number, number>,
    },
    {
        key: 'Refresh', name: 'Odświeżenie', icon: 'mdi-refresh',
        priceFrom: 4.99, popular: false, defaultDays: 1, days: [1],
        desc: 'Przesuń ogłoszenie na górę listy – jednorazowo.',
        feats: ['Awans na szczyt listy', 'Nowa data publikacji'],
        prices: { 1: 4.99 } as Record<number, number>,
    },
]

function getPromoDisplayPrice(planKey: string, days: number): number {
    const apiKey = `${planKey}-${days}`
    return promoApiPrices.value[apiKey] ?? promoPlans.find(p => p.key === planKey)?.prices[days] ?? 0
}

function getPromoPriceFrom(planKey: string, fallback: number): number {
    const plan = promoPlans.find(p => p.key === planKey)
    if (!plan) return fallback
    return getPromoDisplayPrice(planKey, Math.min(...plan.days))
}

const selectedPromoPlan = computed(() => promoPlans.find(p => p.key === promoSelected.value))
const selectedPromoPrice = computed(() => {
    if (!selectedPromoPlan.value) return null
    return getPromoDisplayPrice(selectedPromoPlan.value.key, promoDays.value)
})
const finalPromoPrice = computed(() =>
    couponResult.value?.isValid ? couponResult.value.finalPrice : (selectedPromoPrice.value ?? 0)
)

watch(promoSelected, () => { couponResult.value = null; couponError.value = '' })
watch(promoDays, () => { couponResult.value = null; couponError.value = '' })

async function applyCoupon() {
    if (!couponCode.value.trim() || !selectedPromoPrice.value) return
    couponLoading.value = true
    couponError.value = ''
    couponResult.value = null
    try {
        const r = await validateCoupon(couponCode.value.trim(), selectedPromoPrice.value)
        couponResult.value = r
        if (!r.isValid) couponError.value = r.message ?? 'Nieprawidłowy kod rabatowy.'
    } catch (e: any) {
        couponError.value = e?.data?.message ?? 'Nie udało się zastosować kuponu.'
    } finally {
        couponLoading.value = false
    }
}

// Draft key is user-specific to prevent data leakage between accounts on the same browser
const draftKey = ref('carizo_advert_draft')

function saveDraft() {
    const draft = {
        form: { ...form },
        extras: { ...extras },
        history: { ...history },
        brandTextInput: brandTextInput.value,
        modelTextInput: modelTextInput.value,
        step: currentStep.value,
    }
    localStorage.setItem(draftKey.value, JSON.stringify(draft))
    draftSaved.value = true
    setTimeout(() => { draftSaved.value = false }, 2500)
}

function loadDraft() {
    try {
        const raw = localStorage.getItem(draftKey.value)
        if (!raw) return
        const saved = JSON.parse(raw)
        if (saved.form) Object.assign(form, saved.form)
        if (saved.extras) Object.assign(extras, saved.extras)
        if (saved.history) Object.assign(history, saved.history)
        if (saved.brandTextInput) brandTextInput.value = saved.brandTextInput
        if (saved.modelTextInput) modelTextInput.value = saved.modelTextInput
        if (typeof saved.step === 'number' && saved.step >= 0 && saved.step < steps.length) currentStep.value = saved.step
    } catch {}
}

async function lookupVin() {
    if (form.vin.length !== 17) return
    vinLoading.value = true
    vinError.value = ''
    try {
        const data = await $fetch<Partial<typeof form>>(`/api/proxy/api/listings/vin/${form.vin}`)
        if (data.brandId) form.brandId = data.brandId
        if (form.brandId) await onBrand()
        if (data.modelId) form.modelId = data.modelId
        if (form.modelId) await onModel()
        if (data.year) form.year = data.year
        if (data.fuelTypeId) form.fuelTypeId = data.fuelTypeId
        if (data.gearboxId) form.gearboxId = data.gearboxId
        if (data.engineCapacity) form.engineCapacity = data.engineCapacity
        if (data.power) form.power = data.power
    } catch {
        vinError.value = 'Nie udało się pobrać danych VIN. Uzupełnij formularz ręcznie.'
        setTimeout(() => { vinError.value = '' }, 4000)
    } finally {
        vinLoading.value = false
    }
}

const form = reactive({
    title: '',
    description: '',
    price: null as number | null,
    categoryId: null as number | null,
    brandId: null as number | null,
    modelId: null as number | null,
    generationId: null as number | null,
    trimId: null as number | null,
    vehicleSubtypeId: null as number | null,
    engineVersionId: null as number | null,
    fuelTypeId: null as number | null,
    gearboxId: null as number | null,
    bodyTypeId: null as number | null,
    year: null as number | null,
    mileage: null as number | null,
    featureIds: [] as number[],
    engineCapacity: null as number | null,
    power: null as number | null,
    vin: '',
    city: '',
    region: null as string | null,
    isNegotiable: false,
    sellerType: 'private' as 'private' | 'dealer',
    partCategoryId: null as number | null,
    partSubcategoryId: null as number | null,
    oemNumber: '',
    manufacturerPartNumber: '',
    partManufacturer: '',
    registrationPlate: '',
    hasVatInvoice: false,
    isLeasingPossible: false,
    isCreditPossible: false,
    isExchangePossible: false,
    gearCount: null as number | null,
    metallicPaint: false,
    maxTrailerWeight: null as number | null,
    youtubeUrl: '',
    pdfBrochureUrl: '' as string,
})

const extras = reactive<Record<string, any>>({})

const engineLocked = reactive({
    fuelType: false, power: false, capacity: false,
    consumptionCity: false, consumptionHwy: false, consumptionMix: false,
    torque: false, co2: false, euroNorm: false,
    acceleration: false, topSpeed: false, driveType: false,
    gearboxType: false, cylinders: false,
})

const EF_LOCK_MAP: Record<string, keyof typeof engineLocked> = {
    fuelConsumptionCity: 'consumptionCity',
    fuelConsumptionHwy: 'consumptionHwy',
    fuelConsumptionMix: 'consumptionMix',
    torque:       'torque',
    co2:          'co2',
    euroNorm:     'euroNorm',
    acceleration: 'acceleration',
    driveType:    'driveType',
}
function efIsLocked(key: string): boolean {
    const lockKey = EF_LOCK_MAP[key]
    return lockKey ? engineLocked[lockKey] : false
}

const currentYear = new Date().getFullYear()
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/

const fieldErrors = computed(() => {
    const e: Record<string, string> = {}
    if (form.year) {
        if (form.year < 1900) e.year = 'Rok nie może być wcześniejszy niż 1900.'
        else if (form.year > currentYear + 1) e.year = `Rok nie może być późniejszy niż ${currentYear + 1}.`
    }
    if (form.power && form.power < 1) e.power = 'Moc musi być większa niż 0 KM.'
    if (form.power && form.power > 5000) e.power = 'Podana moc wydaje się nieprawidłowa (>5000 KM).'
    if (form.mileage !== null && form.mileage !== undefined && form.mileage < 0) e.mileage = 'Przebieg nie może być ujemny.'
    if (form.mileage !== null && form.mileage !== undefined && form.mileage > 2_000_000) e.mileage = 'Przebieg nie może przekraczać 2 000 000 km.'
    if (form.price && form.price > 10_000_000) e.price = 'Cena nie może przekraczać 10 000 000 zł.'
    if (form.vin && form.vin.length === 17 && !VIN_REGEX.test(form.vin)) e.vin = 'Numer VIN zawiera niedozwolone znaki (I, O, Q są zakazane w VIN).'
    if (form.description && form.description.trim().length > 0 && form.description.trim().length < 30) e.description = 'Opis jest za krótki — napisz przynajmniej kilka zdań.'
    return e
})

const selectedSubtype = computed(() =>
    subtypes.value.find(s => s.id === form.vehicleSubtypeId) ?? null
)
const subtypeExtraFields = computed<ExtraField[]>(() => {
    const slug = selectedSubtype.value?.slug
    return (slug && SUBTYPE_EXTRA_FIELDS[slug]) ? SUBTYPE_EXTRA_FIELDS[slug] : []
})

const brandTextInput = ref('')
const modelTextInput = ref('')

const history = reactive({
    ownersCount: null as number | null,
    isImported: false,
    importCountry: '',
    firstRegDate: '',
    hasServiceBook: false,
    hasFullServiceHistory: false,
    nextInspection: '',
    hasDamage: false,
    damageDesc: '',
    hasWarranty: false,
    warrantyUntil: '',
    registrationCountry: 'PL',
    isFirstOwner: false,
    isAccidentFree: false,
    servicedAtASO: false,
    isGaraged: false,
    keyCount: null as number | null,
    insuranceUntil: '',
})

const steps = [
    { name: 'Kategoria',        desc: 'Typ pojazdu',                   icon: 'mdi-apps' },
    { name: 'Dane pojazdu',     desc: 'Marka, model, dane techniczne', icon: 'mdi-car-outline' },
    { name: 'Zdjęcia',          desc: 'Galeria pojazdu',               icon: 'mdi-image-outline' },
    { name: 'Wyposażenie',      desc: 'Opcje i wyposażenie',           icon: 'mdi-format-list-checkbox' },
    { name: 'Historia pojazdu', desc: 'VIN, historia, dokumenty',      icon: 'mdi-shield-check-outline' },
    { name: 'Opis',             desc: 'Opis i lokalizacja',            icon: 'mdi-text-box-outline' },
    { name: 'Promocja',         desc: 'Wyróżnij ogłoszenie',           icon: 'mdi-crown-outline' },
    { name: 'Podgląd',          desc: 'Przejrzyj i opublikuj',         icon: 'mdi-check-circle-outline' },
]

const progressSteps = [
    { label: 'Kategoria',  icon: 'mdi-apps' },
    { label: 'Pojazd',     icon: 'mdi-car-outline' },
    { label: 'Zdjęcia',    icon: 'mdi-image-outline' },
    { label: 'Wyposażenie',icon: 'mdi-format-list-checkbox' },
    { label: 'Historia',   icon: 'mdi-shield-check-outline' },
    { label: 'Opis',       icon: 'mdi-text-box-outline' },
    { label: 'Promocja',   icon: 'mdi-crown-outline' },
    { label: 'Podgląd',    icon: 'mdi-check-circle-outline' },
]

const stripFeats = [
    { icon: 'mdi-lock-outline', title: 'Bezpieczne transakcje', desc: 'Weryfikujemy i dbamy o bezpieczeństwo' },
    { icon: 'mdi-tag-off-outline', title: 'Darmowe ogłoszenia', desc: 'Dodawaj auta bez ukrytych kosztów' },
    { icon: 'mdi-bullhorn-outline', title: 'Promowanie ofert', desc: 'Wyróżnij swoje auto i sprzedaj szybciej' },
    { icon: 'mdi-headset', title: 'Wsparcie 24/7', desc: 'Nasz zespół jest dostępny zawsze' },
]

const brandName = computed(() => brands.value.find(b => b.id === form.brandId)?.name ?? '')
const modelName = computed(() => models.value.find(m => m.id === form.modelId)?.name ?? '')
const fuelTypeName = computed(() => fuelTypes.value.find(f => f.id === form.fuelTypeId)?.name ?? '')

const aiDescLoading = ref(false)
const aiDescError = ref('')

const previewTitle = computed(() => {
    const parts = [brandName.value, modelName.value].filter(Boolean)
    return parts.length ? parts.join(' ') : 'Twoje ogłoszenie'
})

const descCharCount = computed(() => form.description?.length ?? 0)
const descQuality = computed(() => {
    const l = descCharCount.value
    if (l >= 500) return 'great'
    if (l >= 200) return 'good'
    if (l >= 50) return 'ok'
    return 'poor'
})

const adScore = computed(() => {
    let s = 0
    // Basic info 40 pts
    if (form.brandId || brandTextInput.value) s += 6
    if (form.modelId) s += 6
    if (form.year) s += 5
    if (form.fuelTypeId) s += 4
    if (form.mileage) s += 5
    if (form.price) s += 6
    if (form.gearboxId) s += 3
    if (form.generationId) s += 3
    if (form.engineCapacity) s += 2
    // Photos 20 pts
    const photos = selectedFiles.value.length + existingImages.value.length
    if (photos >= 10) s += 20
    else if (photos >= 5) s += 14
    else if (photos > 0) s += photos * 2
    // Description 20 pts
    const dl = form.description?.length ?? 0
    if (dl >= 500) s += 20
    else if (dl >= 200) s += 14
    else if (dl >= 50) s += 7
    else if (dl > 0) s += 3
    // Equipment 10 pts
    if (form.featureIds.length >= 5) s += 10
    else s += form.featureIds.length * 2
    // History 10 pts
    if (form.vin) s += 4
    if (history.hasServiceBook) s += 2
    if (history.ownersCount !== null) s += 2
    if (history.nextInspection) s += 2
    // Premium bonuses (capped at 100 total)
    if (form.youtubeUrl) s += 3
    if (history.isFirstOwner) s += 2
    if (history.isGaraged) s += 2
    if (form.hasVatInvoice || form.isLeasingPossible || form.isCreditPossible || form.isExchangePossible) s += 2
    if (form.registrationPlate) s += 1
    return Math.min(s, 100)
})

const scoreArc = computed(() => (adScore.value / 100) * 326.7)

const descPhoneWarning = computed(() => {
    const text = form.description ?? ''
    return /(?:\+48|48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/.test(text)
        ? 'Wykryto numer telefonu w opisie — dodaj go w danych kontaktowych zamiast w treści.'
        : ''
})

const youtubeEmbedId = computed(() => {
    if (!form.youtubeUrl) return ''
    const m = form.youtubeUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
    return m?.[1] ?? ''
})

const scoreFactors = computed(() => {
    const photos = selectedFiles.value.length + existingImages.value.length
    return [
        { label: 'Podstawowe informacje', done: !!(form.brandId && form.modelId && form.year && form.price) },
        { label: `Zdjęcia (${photos}/10)`, done: photos >= 10 },
        { label: `Opis (${descCharCount.value} znaków)`, done: descCharCount.value >= 200 },
        { label: `Wyposażenie (${form.featureIds.length}/5)`, done: form.featureIds.length >= 5 },
        { label: 'Historia pojazdu', done: !!(form.vin || history.hasServiceBook || history.ownersCount !== null) },
        { label: 'Film YouTube', done: !!form.youtubeUrl },
        { label: 'Dane premium', done: !!(form.registrationPlate || form.hasVatInvoice || form.isLeasingPossible) },
    ]
})

const scoreTips = computed(() => {
    const tips: string[] = []
    const photos = selectedFiles.value.length + existingImages.value.length
    if (!form.brandId && !brandTextInput.value) tips.push('Wybierz markę pojazdu — zwiększa wiarygodność.')
    if (photos < 5) tips.push(`Dodaj więcej zdjęć (masz ${photos}) — ogłoszenia z 10+ zdjęciami sprzedają się 3× szybciej.`)
    if ((form.description?.length ?? 0) < 100) tips.push('Napisz szczegółowy opis — kupujący czytają go uważnie.')
    if (form.featureIds.length < 3) tips.push('Zaznacz wyposażenie — filtry po wyposażeniu zwiększają wyświetlenia.')
    if (!form.vin) tips.push('Podaj numer VIN — buduje zaufanie i filtruje poważnych kupujących.')
    if (!history.hasServiceBook && !history.hasFullServiceHistory) tips.push('Zaznacz historię serwisową jeśli ją posiadasz.')
    if (!form.youtubeUrl) tips.push('Dodaj film YouTube — ogłoszenia z filmem wzbudzają 2× więcej zainteresowania.')
    if (!form.registrationPlate) tips.push('Podaj numer rejestracyjny — ułatwia weryfikację historii pojazdu.')
    return tips.slice(0, 4)
})

// ── Smart form: category-aware logic ─────────────────────────────────────────
const selectedCategory = computed(() =>
    advertCategories.value.find(c => c.id === form.categoryId) ?? null
)

const categoryConfig = computed<CatFieldConfig>(() => {
    if (!selectedCategory.value) return DEFAULT_CAT_CONFIG
    const slug = selectedCategory.value.slug ?? ''
    return CATEGORY_CONFIGS[slug] ?? DEFAULT_CAT_CONFIG
})

const isPartsCategorySelected = computed(() => {
    const partsCategory = advertCategories.value.find(c =>
        c.slug?.toLowerCase() === 'czesci' ||
        c.name?.toLowerCase().includes('część') ||
        c.name?.toLowerCase().includes('czesci') ||
        c.name?.toLowerCase().includes('parts')
    )
    return partsCategory ? form.categoryId === partsCategory.id : false
})

const featureGroups = computed(() => {
    const g: Record<string, Feature[]> = {}
    for (const f of allFeatures.value) {
        const cat = f.category?.name ?? 'Inne'
        ;(g[cat] ??= []).push(f)
    }
    return g
})

// Equipment search + collapsible sections
const featSearch = ref('')
const openFeatGroups = ref(new Set<string>())

watch(featureGroups, (groups) => {
    // Auto-open first 3 groups when groups load
    const keys = Object.keys(groups)
    openFeatGroups.value = new Set(keys.slice(0, 3))
}, { immediate: true })

function toggleFeatGroup(cat: string) {
    if (openFeatGroups.value.has(cat)) openFeatGroups.value.delete(cat)
    else openFeatGroups.value.add(cat)
}
function expandAllEquip() { openFeatGroups.value = new Set(Object.keys(featureGroups.value)) }
function collapseAllEquip() { openFeatGroups.value = new Set() }
function toggleFeature(id: number) {
    const idx = form.featureIds.indexOf(id)
    if (idx >= 0) form.featureIds.splice(idx, 1)
    else form.featureIds.push(id)
}

const filteredFeatureGroups = computed(() => {
    const q = featSearch.value.trim().toLowerCase()
    if (!q) return featureGroups.value
    const result: Record<string, Feature[]> = {}
    for (const [cat, items] of Object.entries(featureGroups.value)) {
        const filtered = items.filter(f => f.name.toLowerCase().includes(q))
        if (filtered.length) result[cat] = filtered
    }
    return result
})

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function highlightSearch(name: string): string {
    const q = featSearch.value.trim()
    if (!q) return escapeHtml(name)
    const idx = name.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return escapeHtml(name)
    return escapeHtml(name.slice(0, idx))
        + `<mark class="feat-hl">${escapeHtml(name.slice(idx, idx + q.length))}</mark>`
        + escapeHtml(name.slice(idx + q.length))
}

// Photo quality feedback
const photoFeedback = computed(() => {
    const all = selectedFiles.value.length + existingImages.value.length
    const mainOk = existingImages.value.some(i => i.isMain) || selectedFiles.value.length > 0

    let countMsg = ''
    let countClass = ''
    let countIcon = ''
    if (all === 0) { countMsg = 'Brak zdjęć — dodaj minimum 3'; countClass = 'ph-error'; countIcon = 'mdi-image-off-outline' }
    else if (all < 3) { countMsg = `Za mało zdjęć (${all}/3 minimum) — dodaj więcej`; countClass = 'ph-warn'; countIcon = 'mdi-alert-circle-outline' }
    else if (all < 8) { countMsg = `${all} zdjęcia — dobrze! Zalecamy 8-15 zdjęć`; countClass = 'ph-ok'; countIcon = 'mdi-check-circle-outline' }
    else { countMsg = `${all} zdjęcia — doskonale!`; countClass = 'ph-ok'; countIcon = 'mdi-check-circle' }

    return { mainOk, countMsg, countClass, countIcon, lowQuality: [] as File[] }
})

function featureGroupIcon(cat: string): string {
    const lower = cat.toLowerCase()
    if (lower.includes('bezpiecze')) return 'mdi-shield-check-outline'
    if (lower.includes('komfort')) return 'mdi-seat-recline-extra'
    if (lower.includes('multim') || lower.includes('czno')) return 'mdi-monitor-speaker'
    if (lower.includes('wietle') || lower.includes('wiatl')) return 'mdi-car-light-high'
    if (lower.includes('wspomagania') || lower.includes('asyst')) return 'mdi-car-cruise-control'
    if (lower.includes('tapicerka') || lower.includes('wn')) return 'mdi-car-seat'
    if (lower.includes('zewn')) return 'mdi-car-side'
    if (lower.includes('dodatki') || lower.includes('akcesoria')) return 'mdi-package-variant-closed'
    if (lower.includes('naped') || lower.includes('napęd') || lower.includes('układ')) return 'mdi-car-traction-control'
    if (lower.includes('ciężar') || lower.includes('ciezar')) return 'mdi-truck-outline'
    if (lower.includes('motocykl')) return 'mdi-motorbike'
    if (lower.includes('dostawcze') || lower.includes('dostawc')) return 'mdi-van-utility'
    if (lower.includes('przyczepa') || lower.includes('naczepa')) return 'mdi-truck-trailer'
    if (lower.includes('budowlan')) return 'mdi-crane'
    if (lower.includes('rolnicze') || lower.includes('rolnicza')) return 'mdi-tractor'
    if (lower.includes('maszyn')) return 'mdi-cog-transfer-outline'
    return 'mdi-star-outline'
}

function isFieldVisible(field: string): boolean {
    if (!form.categoryId) return true
    return categoryConfig.value.fields.includes(field)
}

function isFieldRequired(field: string): boolean {
    if (!form.categoryId) return false
    return categoryConfig.value.required.includes(field)
}

// SmartSelect option arrays
const brandOptions = computed<SelectOption[]>(() => brands.value.map(b => ({ value: b.id, label: b.name })))
const modelOptions = computed<SelectOption[]>(() => models.value.map(m => ({ value: m.id, label: m.name })))
const generationOptions = computed<SelectOption[]>(() => generations.value.map(g => ({ value: g.id, label: g.name })))
const engineOptions = computed<SelectOption[]>(() => engines.value.map(e => ({ value: e.id, label: `${e.name} (${e.powerHP ?? e.horsepower ?? '?'}KM)` })))
const trimOptions = computed<SelectOption[]>(() => trims.value.map(t => ({ value: t.id, label: t.name })))
const vehicleSubtypeOptions = computed<SelectOption[]>(() => vehicleSubtypes.value.map(s => ({ value: s.id, label: s.namePl ?? s.name })))
const partCategoryOptions = computed<SelectOption[]>(() => partCategories.value.map(c => ({ value: c.id, label: c.namePl ?? c.name })))
const partSubcategoryOptions = computed<SelectOption[]>(() => partSubcategories.value.map(s => ({ value: s.id, label: s.namePl ?? s.name })))

const fuelTypeOptions = computed<SelectOption[]>(() => fuelTypes.value.map(f => ({ value: f.id, label: f.name })))
const gearboxOptions = computed<SelectOption[]>(() => gearboxes.value.map(g => ({ value: g.id, label: g.name })))
const bodyTypeOptions = computed<SelectOption[]>(() => bodyTypes.value.map(b => ({ value: b.id, label: b.name })))

// Smart title suggestion: brand + model + year + fuel (when enough filled)
const suggestedTitle = computed(() => {
    const isTextMode = categoryConfig.value.brandFieldType === 'text'
    const brand = isTextMode ? brandTextInput.value : brandName.value
    const model = isTextMode ? modelTextInput.value : modelName.value
    const parts = [brand, model, form.year ? String(form.year) : ''].filter(Boolean)
    return parts.length >= 2 ? parts.join(' ') : ''
})

async function onCategory(catId: number) {
    const changed = form.categoryId !== catId
    form.categoryId = catId
    if (changed) {
        form.brandId = null; form.modelId = null; form.generationId = null; form.trimId = null; form.engineVersionId = null
        models.value = []; generations.value = []; trims.value = []; engines.value = []
        form.vehicleSubtypeId = null
        subtypes.value = []
        for (const key of Object.keys(extras)) delete extras[key]
        brandTextInput.value = ''
        modelTextInput.value = ''
        form.featureIds = []
    }
    // Load subtypes for this category
    try {
        subtypes.value = await fetchVehicleSubtypes(catId)
    } catch {
        subtypes.value = []
    }
    // Reload brands filtered by category (fall back to all brands if none returned)
    const cfg = categoryConfig.value
    if (cfg.brandFieldType !== 'text') {
        try {
            const filtered = await fetchBrandsByCategory(catId)
            brands.value = filtered.length ? filtered : await fetchBrands()
        } catch {
            brands.value = await fetchBrands()
        }
    }
    // Load vehicle subtypes for the selected category
    vehicleSubtypes.value = await fetchVehicleSubtypes(catId)
    // Reload features for the new category context
    if (changed) await loadContextFeatures()
    // Auto-advance to vehicle data step on first category selection
    if (changed && currentStep.value === 0) {
        setTimeout(() => { currentStep.value = 1 }, 250)
    }
}

function validateStep(step: number): string | null {
    // Step 0: Category
    if (step === 0) {
        if (!form.categoryId) return 'Wybierz kategorię pojazdu.'
    }
    // Step 1: Vehicle data
    if (step === 1) {
        const cfg = categoryConfig.value
        if (cfg.required.includes('brand') && !form.brandId && cfg.brandFieldType !== 'text') return 'Wybierz markę pojazdu.'
        if (cfg.required.includes('brand') && cfg.brandFieldType === 'text' && !brandTextInput.value.trim()) return `Podaj ${cfg.brandLabel ?? 'markę'}.`
        if (cfg.required.includes('model') && !form.modelId) return 'Wybierz model pojazdu.'
        if (!form.year) return 'Podaj rok produkcji.'
        if (cfg.required.includes('fuelType') && !form.fuelTypeId) return 'Wybierz rodzaj paliwa.'
        if (cfg.required.includes('mileage') && !form.mileage && form.mileage !== 0) return `Podaj ${cfg.mileageLabel ?? 'przebieg'}.`
        // Validate extra required fields
        for (const ef of (cfg.extraFields ?? [])) {
            if (ef.required && !extras[ef.key] && extras[ef.key] !== false) {
                return `Pole "${ef.label}" jest wymagane.`
            }
        }
    }
    // Step 2: Photos
    if (step === 2) {
        const totalPhotos = existingImages.value.length + selectedFiles.value.length
        if (isEdit.value && totalPhotos < 1) return 'Ogłoszenie musi zawierać co najmniej 1 zdjęcie.'
        if (!isEdit.value && totalPhotos < 3) return 'Dodaj minimum 3 zdjęcia.'
    }
    // Step 3: Equipment — no required fields
    // Step 4: Historia pojazdu — VIN required per Regulamin §4.1
    if (step === 4) {
        if (categoryConfig.value.showVinSection !== false) {
            if (!form.vin || form.vin.length !== 17) return 'Podaj prawidłowy numer VIN (17 znaków). Numer VIN jest obowiązkowy.'
            if (!VIN_REGEX.test(form.vin)) return 'Numer VIN zawiera niedozwolone znaki. VIN składa się z cyfr i liter A-H, J-N, P-Z.'
        }
    }
    // Step 5: Opis i cena
    if (step === 5) {
        if (!form.price || form.price <= 0) return 'Podaj cenę pojazdu (musi być większa od 0).'
        if (form.price > 10_000_000) return 'Cena wydaje się nieprawidłowa (>10 000 000 zł).'
        if (!form.region) return 'Wybierz województwo.'
        if (!form.city?.trim()) return 'Podaj miasto.'
        if (!form.description?.trim()) return 'Dodaj opis ogłoszenia.'
        if (form.description.trim().length < 30) return 'Opis jest za krótki — opisz pojazd dokładniej (minimum 30 znaków).'
    }
    return null
}

function goNext() {
    const err = validateStep(currentStep.value)
    if (err) {
        stepError.value = err
        setTimeout(() => { stepError.value = '' }, 4000)
        return
    }
    stepError.value = ''
    currentStep.value++
}

async function compressImage(file: File, maxPx = 1920, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(url)
            let { width, height } = img
            if (width > maxPx || height > maxPx) {
                const ratio = Math.min(maxPx / width, maxPx / height)
                width = Math.round(width * ratio)
                height = Math.round(height * ratio)
            }
            const canvas = document.createElement('canvas')
            canvas.width = width; canvas.height = height
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0, width, height)
            // CARIZO watermark — bottom-right, semi-transparent
            const fontSize = Math.max(14, Math.round(width * 0.032))
            const pad = Math.round(width * 0.018)
            ctx.save()
            ctx.globalAlpha = 0.6
            ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`
            ctx.textAlign = 'right'
            ctx.textBaseline = 'bottom'
            ctx.shadowColor = 'rgba(0,0,0,0.75)'
            ctx.shadowBlur = 5
            ctx.fillStyle = '#ffffff'
            ctx.fillText('CARIZO', width - pad, height - pad)
            ctx.restore()
            canvas.toBlob(
                (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
                'image/jpeg', quality
            )
        }
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
        img.src = url
    })
}

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_SIZE_MB = 20

async function onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    const remaining = 50 - selectedFiles.value.length
    if (!files.length) return
    const rejected = files.filter(f => !ALLOWED_PHOTO_TYPES.includes(f.type) || f.size > MAX_PHOTO_SIZE_MB * 1024 * 1024)
    if (rejected.length) {
        const { warning } = useToast()
        warning(`${rejected.length} plik(ów) odrzucono — dozwolone: JPEG, PNG, WebP do ${MAX_PHOTO_SIZE_MB} MB.`)
    }
    const valid = files.filter(f => ALLOWED_PHOTO_TYPES.includes(f.type) && f.size <= MAX_PHOTO_SIZE_MB * 1024 * 1024)
    if (!valid.length) { input.value = ''; return }
    photoUploading.value = true
    for (const file of valid.slice(0, remaining)) {
        const compressed = await compressImage(file)
        selectedFiles.value.push(compressed)
        previews.value.push(URL.createObjectURL(compressed))
    }
    input.value = ''
    photoUploading.value = false
}

function removeImage(index: number) {
    const url = previews.value[index]
    if (url) URL.revokeObjectURL(url)
    selectedFiles.value.splice(index, 1)
    previews.value.splice(index, 1)
}

function reorderPhoto(toIdx: number) {
    const from = dragSrcIdx.value
    if (from === null || from === toIdx) return
    const files = [...selectedFiles.value]
    const prvs = [...previews.value]
    const [f] = files.splice(from, 1)
    const [p] = prvs.splice(from, 1)
    files.splice(toIdx, 0, f)
    prvs.splice(toIdx, 0, p)
    selectedFiles.value = files
    previews.value = prvs
    dragSrcIdx.value = null
    dragOverIdx.value = null
}

async function onGridDrop(e: DragEvent) {
    gridDragOver.value = false
    const allDropped = Array.from(e.dataTransfer?.files ?? [])
    const valid = allDropped.filter(f => ALLOWED_PHOTO_TYPES.includes(f.type) && f.size <= MAX_PHOTO_SIZE_MB * 1024 * 1024)
    const rejected = allDropped.length - valid.length
    if (rejected > 0) {
        const { warning } = useToast()
        warning(`${rejected} plik(ów) odrzucono — dozwolone: JPEG, PNG, WebP do ${MAX_PHOTO_SIZE_MB} MB.`)
    }
    if (!valid.length) return
    const remaining = 50 - selectedFiles.value.length - existingImages.value.length
    if (remaining <= 0) return
    photoUploading.value = true
    for (const file of valid.slice(0, remaining)) {
        const compressed = await compressImage(file)
        selectedFiles.value.push(compressed)
        previews.value.push(URL.createObjectURL(compressed))
    }
    photoUploading.value = false
}

async function onPdfSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') { pdfUploadError.value = 'Dozwolony tylko plik PDF.'; return }
    if (file.size > 25 * 1024 * 1024) { pdfUploadError.value = 'Plik PDF przekracza limit 25 MB.'; return }
    pdfUploadError.value = ''
    pdfUploading.value = true
    try {
        if (isEdit.value && editId.value) {
            const fd = new FormData()
            fd.append('file', file)
            const res = await $fetch<{ url: string }>(`/api/advert/${editId.value}/pdf`, { method: 'POST', body: fd })
            form.pdfBrochureUrl = res.url
        } else {
            form.pdfBrochureUrl = '__pending__'
        }
        pdfFileName.value = file.name
        pdfPendingFile.value = file
    } catch (err: any) {
        pdfUploadError.value = err?.data?.message ?? err?.message ?? 'Błąd uploadu PDF.'
    } finally {
        pdfUploading.value = false
    }
}

async function removePdf() {
    if (isEdit.value && editId.value && form.pdfBrochureUrl && form.pdfBrochureUrl !== '__pending__') {
        await $fetch(`/api/advert/${editId.value}/pdf`, { method: 'DELETE' }).catch(() => {})
    }
    form.pdfBrochureUrl = ''
    pdfFileName.value = ''
    pdfPendingFile.value = null
}

async function loadContextFeatures() {
    featuresLoaded.value = false
    try {
        const cats = await fetchFeatureCategoriesByContext(
            selectedCategory.value?.id ?? null,
            form.brandId,
            form.modelId
        )
        allFeatures.value = cats.flatMap(cat =>
            cat.features.map(f => ({ id: f.id, name: f.name, category: { id: cat.id, name: cat.name, vehicleCategoryId: cat.vehicleCategoryId } }))
        )
    } catch { /* keep existing features */ } finally {
        featuresLoaded.value = true
    }
}

function resetEngineLocks() {
    for (const k of Object.keys(engineLocked) as (keyof typeof engineLocked)[])
        engineLocked[k] = false
}

let _brandSeq = 0
let _modelSeq = 0
async function onBrand() {
    const seq = ++_brandSeq
    form.modelId = null; form.generationId = null; form.trimId = null; form.engineVersionId = null
    models.value = []; generations.value = []; trims.value = []; engines.value = []
    if (form.brandId) {
        const result = await fetchModels(form.brandId)
        if (seq === _brandSeq) models.value = result
    }
    if (seq !== _brandSeq) return
    resetEngineLocks()
    await loadContextFeatures()
}
async function onModel() {
    const seq = ++_modelSeq
    form.generationId = null; form.trimId = null; form.engineVersionId = null
    generations.value = []; trims.value = []; engines.value = []
    if (form.modelId) {
        const result = await fetchGenerations(form.modelId)
        if (seq === _modelSeq) generations.value = result
    }
    if (seq !== _modelSeq) return
    resetEngineLocks()
    await loadContextFeatures()
}
async function onGen() {
    form.trimId = null; form.engineVersionId = null; trims.value = []; engines.value = []
    if (form.generationId) {
        const [loadedTrims, loadedEngines] = await Promise.all([
            fetchTrims(form.generationId),
            fetchEngines(form.generationId),
        ])
        trims.value = loadedTrims
        engines.value = loadedEngines
    }
    resetEngineLocks()
}

async function onTrimChange(trimId: number | null) {
    form.engineVersionId = null
    engineSpecs.value = null
    engines.value = []
    engineLocked.fuelType = false; engineLocked.power = false; engineLocked.capacity = false; engineLocked.consumptionCity = false; engineLocked.consumptionHwy = false; engineLocked.consumptionMix = false
    engineLocked.torque = false; engineLocked.co2Emission = false; engineLocked.euroNorm = false; engineLocked.acceleration = false; engineLocked.fuelConsumptionCombined = false
    if (trimId) {
        const trimEngines = await fetchEnginesByTrim(trimId)
        if (trimEngines.length > 0) {
            engines.value = trimEngines
        } else if (form.generationId) {
            engines.value = await fetchEngines(form.generationId)
        }
    }
}

async function onEngineVersionChange(engineVersionId: number | null) {
    engineSpecs.value = null
    if (engineVersionId) {
        const specs = await fetchEngineSpecs(engineVersionId)
        if (specs) {
            engineSpecs.value = specs
            if (specs.powerHP) { form.power = specs.powerHP; engineLocked.power = true }
            if (specs.displacement) { form.engineCapacity = specs.displacement; engineLocked.capacity = true }
            if (specs.torqueNm) { extras.torque = specs.torqueNm; engineLocked.torque = true }
            if (specs.co2EmissionGkm) { extras.co2 = specs.co2EmissionGkm; engineLocked.co2Emission = true }
            if (specs.euroNorm) { extras.euroNorm = specs.euroNorm; engineLocked.euroNorm = true }
            if (specs.acceleration0100) { engineLocked.acceleration = true }
            if (specs.avgConsumptionL) { extras.fuelConsumptionMix = specs.avgConsumptionL; engineLocked.fuelConsumptionCombined = true }
            if (specs.fuelTypeId) { form.fuelTypeId = specs.fuelTypeId; engineLocked.fuelType = true }
        }
    }
}

async function onVehicleCategoryChange(categoryId: number | null) {
    form.vehicleSubtypeId = null
    vehicleSubtypes.value = []
    if (categoryId) {
        vehicleSubtypes.value = await fetchVehicleSubtypes(categoryId)
    }
}

async function onPartCategoryChange(categoryId: number | null) {
    form.partSubcategoryId = null
    partSubcategories.value = []
    if (categoryId) {
        partSubcategories.value = await fetchPartSubcategories(categoryId)
    }
}

watch(() => form.engineVersionId, (newId) => {
    if (!newId) { resetEngineLocks(); return }
    const engine = engines.value.find((e: any) => e.id === newId) as any
    if (!engine) return

    // ── Core fields ──────────────────────────────────────────────────────────
    if (engine.fuelTypeId) { form.fuelTypeId = engine.fuelTypeId; engineLocked.fuelType = true }
    const hp = engine.powerHP ?? engine.horsepower
    if (hp) { form.power = hp; engineLocked.power = true }
    if (engine.displacement) { form.engineCapacity = engine.displacement; engineLocked.capacity = true }

    // ── Fuel consumption ─────────────────────────────────────────────────────
    if (engine.fuelConsumptionCity != null)     { extras.fuelConsumptionCity = engine.fuelConsumptionCity; engineLocked.consumptionCity = true }
    if (engine.fuelConsumptionHighway != null)   { extras.fuelConsumptionHwy  = engine.fuelConsumptionHighway; engineLocked.consumptionHwy  = true }
    if (engine.fuelConsumptionCombined != null)  { extras.fuelConsumptionMix  = engine.fuelConsumptionCombined; engineLocked.consumptionMix  = true }

    // ── Extended factory specs ───────────────────────────────────────────────
    if (engine.torqueNm != null)      { extras.torque      = engine.torqueNm;      engineLocked.torque      = true }
    if (engine.co2EmissionGkm != null){ extras.co2         = engine.co2EmissionGkm; engineLocked.co2         = true }
    if (engine.euroNorm)              { extras.euroNorm    = engine.euroNorm;       engineLocked.euroNorm    = true }
    if (engine.acceleration0100 != null) { extras.acceleration = engine.acceleration0100; engineLocked.acceleration = true }
    if (engine.topSpeedKmh != null)   { extras.topSpeed    = engine.topSpeedKmh;   engineLocked.topSpeed    = true }
    if (engine.driveType)             { extras.driveType   = engine.driveType;      engineLocked.driveType   = true }
    if (engine.gearboxType)           { extras.gearboxType = engine.gearboxType;    engineLocked.gearboxType = true }
    if (engine.cylinders != null)     { extras.cylinders   = engine.cylinders;      engineLocked.cylinders   = true }
})

function generateAiDescription() {
    aiDescLoading.value = true
    aiDescError.value = ''

    const brand = brandName.value || brandTextInput.value || ''
    const model = modelName.value || modelTextInput.value || ''
    const gen = generations.value.find((g: any) => g.id === form.generationId)?.name ?? ''
    const year = form.year
    const mileage = form.mileage
    const fuel = fuelTypeName.value || ''
    const power = form.power
    const capacity = form.engineCapacity
    const gearbox = (gearboxes.value.find((g: any) => g.id === form.gearboxId)?.name ?? '') as string
    const owners = history.ownersCount
    const serviceBook = history.hasServiceBook
    const fullHistory = history.hasFullServiceHistory
    const featCount = form.featureIds.length

    const parts: string[] = []

    // Intro
    const carLabel = [brand, model, gen, year ? `(${year})` : ''].filter(Boolean).join(' ')
    if (carLabel) {
        parts.push(`Sprzedam ${carLabel}.`)
    }

    // Technical block
    const techParts: string[] = []
    if (fuel) techParts.push(`silnik ${fuel.toLowerCase()}`)
    if (capacity) techParts.push(`${capacity} cm³`)
    if (power) techParts.push(`${power} KM`)
    const gearboxLower = gearbox.toLowerCase()
    if (gearboxLower) {
        const gearLabel = gearboxLower.includes('automat') || gearboxLower.includes('auto') ? 'skrzynia automatyczna' : 'skrzynia manualna'
        techParts.push(gearLabel)
    }
    if (techParts.length) {
        parts.push(`Pojazd wyposażony w ${techParts.join(', ')}.`)
    }

    // Mileage
    if (mileage != null && mileage > 0) {
        parts.push(`Przebieg wynosi ${mileage.toLocaleString('pl-PL')} km.`)
    }

    // Service history
    if (fullHistory) {
        parts.push('Samochód posiada pełną udokumentowaną historię serwisową — wszystkie przeglądy wykonywane terminowo w autoryzowanym serwisie.')
    } else if (serviceBook) {
        parts.push('Do pojazdu dołączona jest książka serwisowa z wpisami.')
    }

    // Owners
    if (owners != null && owners > 0) {
        const ownerLabel = owners === 1 ? 'jednego właściciela' : `${owners} właścicieli`
        parts.push(`Auto było w rękach ${ownerLabel}.`)
    }

    // Equipment
    if (featCount > 0) {
        parts.push(`Pojazd posiada ${featCount} pozycji wyposażenia dodatkowego — pełna lista widoczna w ogłoszeniu.`)
    }

    // Closing
    parts.push('Samochód do jazdy, bez ukrytych wad. Możliwość oględzin i jazdy próbnej po wcześniejszym umówieniu. Cena do negocjacji.')

    form.description = parts.join(' ')
    aiDescLoading.value = false
}

// Serialize category extras + history + seller info into description
function buildDescription(): string {
    const sections: string[] = []
    // Technical data from extra fields
    const ef = categoryConfig.value.extraFields ?? []
    const techLines: string[] = []
    for (const field of ef) {
        const val = extras[field.key]
        if (val === null || val === undefined || val === '' || val === false) continue
        if (field.type === 'boolean') techLines.push(`✓ ${field.label}`)
        else if (field.type === 'radio' || field.type === 'select') {
            const optLabel = field.options?.find(o => o.value === val)?.label ?? val
            techLines.push(`${field.label}: ${optLabel}`)
        } else techLines.push(`${field.label}: ${val}${field.unit ? ' ' + field.unit : ''}`)
    }
    if (techLines.length) sections.push(`📋 Dane techniczne:\n${techLines.join('\n')}`)
    // History
    const histLines: string[] = []
    if (history.ownersCount !== null) histLines.push(`Liczba właścicieli: ${history.ownersCount}`)
    if (history.isImported) histLines.push(`Import: ${history.importCountry || 'Tak'}`)
    if (history.firstRegDate) histLines.push(`Pierwsza rejestracja: ${history.firstRegDate}`)
    if (history.registrationCountry && history.registrationCountry !== 'PL') histLines.push(`Kraj rejestracji: ${history.registrationCountry}`)
    if (history.hasServiceBook) histLines.push('✓ Książka serwisowa')
    if (history.hasFullServiceHistory) histLines.push('✓ Pełna historia serwisowa ASO')
    if (history.nextInspection) histLines.push(`Następny przegląd: ${history.nextInspection}`)
    if (history.hasDamage) {
        histLines.push('⚠ Pojazd po szkodzie')
        if (history.damageDesc) histLines.push(`Opis szkody: ${history.damageDesc}`)
    }
    if (history.hasWarranty) histLines.push(`✓ Gwarancja do: ${history.warrantyUntil || 'aktywna'}`)
    if (histLines.length) sections.push(`🔍 Historia pojazdu:\n${histLines.join('\n')}`)
    // For text-mode brand/model categories, include brand/model as text
    if (categoryConfig.value.brandFieldType === 'text') {
        const bmLines: string[] = []
        if (brandTextInput.value) bmLines.push(`Producent: ${brandTextInput.value}`)
        if (modelTextInput.value) bmLines.push(`Model: ${modelTextInput.value}`)
        if (bmLines.length) sections.unshift(bmLines.join('\n'))
    }
    // Seller & price info
    const infoLines: string[] = []
    if (form.sellerType === 'dealer') infoLines.push('Sprzedawca: Dealer / Firma')
    if (form.isNegotiable) infoLines.push('💬 Cena do negocjacji')
    if (infoLines.length) sections.push(infoLines.join('\n'))
    // User description
    const userDesc = form.description?.trim() ?? ''
    if (userDesc) sections.push(userDesc)
    return sections.filter(Boolean).join('\n\n')
}

const ALLOWED_PAYMENT_HOSTS = ['secure.imoje.pl', 'imoje.ing.pl', 'imoje.pl']

function validatePaymentUrl(url: string): URL {
    let parsed: URL
    try { parsed = new URL(url) } catch { throw new Error('Invalid payment URL') }
    if (parsed.protocol !== 'https:') throw new Error('Payment URL must use HTTPS')
    if (!ALLOWED_PAYMENT_HOSTS.includes(parsed.hostname)) throw new Error(`Untrusted payment host: ${parsed.hostname}`)
    return parsed
}

function submitImojeForm(result: { paymentUrl: string, formFields?: Record<string, string> }) {
    let parsed: URL
    try { parsed = validatePaymentUrl(result.paymentUrl) } catch (e) {
        console.error('[payment] Rejected unsafe redirect:', e)
        useToast().error('Wystąpił błąd płatności. Skontaktuj się z pomocą techniczną.')
        return
    }
    if (result.formFields && Object.keys(result.formFields).length) {
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = parsed.toString()
        for (const [key, value] of Object.entries(result.formFields)) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value
            form.appendChild(input)
        }
        document.body.appendChild(form)
        form.submit()
    } else {
        window.location.href = parsed.toString()
    }
}

async function submit() {
    for (const stepIdx of [4, 5]) {
        const err = validateStep(stepIdx)
        if (err) {
            stepError.value = err
            currentStep.value = stepIdx
            setTimeout(() => { stepError.value = '' }, 4000)
            return
        }
    }
    error.value = ''
    limitError.value = null
    loading.value = true
    if (!isEdit.value) form.title = form.title || suggestedTitle.value || previewTitle.value || 'Ogłoszenie'

    try {
        if (isEdit.value && editId.value) {
            // ── Edit mode: update existing advert ──
            const rawEdit = { ...form }
            const cleanEdit: Record<string, unknown> = {}
            for (const [k, v] of Object.entries(rawEdit)) {
                if (v === null || v === '' || k === 'categoryId') continue
                cleanEdit[k] = v
            }
            cleanEdit.featureIds = (form.featureIds?.length ? form.featureIds : [])
            cleanEdit.description = buildDescription() || form.description || ''
            // Map renamed fields
            if (form.power) cleanEdit.powerHP = form.power
            if (form.engineCapacity) cleanEdit.engineSize = form.engineCapacity
            delete cleanEdit.power
            delete cleanEdit.engineCapacity
            // Map extras → structured API fields
            if (extras.condition) cleanEdit.condition = extras.condition
            if (extras.doors) cleanEdit.doorCount = Number(extras.doors)
            if (extras.driveType) {
                const dt = driveTypes.value.find(d => d.slug === extras.driveType)
                if (dt) cleanEdit.driveTypeId = dt.id
            }
            if (extras.color) {
                if (typeof extras.color === 'number') {
                    cleanEdit.colorId = extras.color
                } else {
                    const col = colors.value.find(c => c.name.toLowerCase() === String(extras.color).toLowerCase())
                    if (col) cleanEdit.colorId = col.id
                }
            }
            // New specialized DB fields from extras
            if (extras.gvw != null) cleanEdit.grossWeight = Number(extras.gvw)
            if (extras.payload != null) cleanEdit.payload = Number(extras.payload)
            if (extras.axles != null) cleanEdit.axleCount = Number(extras.axles)
            if (extras.loadingLength != null) cleanEdit.cargoLength = Number(extras.loadingLength)
            if (extras.length != null) cleanEdit.cargoLength = Number(extras.length)
            if (extras.hasTachograph != null) cleanEdit.hasTachograph = Boolean(extras.hasTachograph)
            if (extras.hasRetarder != null) cleanEdit.hasRetarder = Boolean(extras.hasRetarder)
            if (extras.bodyVariant) cleanEdit.bodySubtype = extras.bodyVariant
            if (extras.trailerType) cleanEdit.bodySubtype = extras.trailerType
            if (extras.machineType) cleanEdit.bodySubtype = extras.machineType
            if (extras.truckType) cleanEdit.bodySubtype = extras.truckType
            if (extras.partCategory) cleanEdit.bodySubtype = extras.partCategory
            if (extras.partNumber) cleanEdit.catalogNumber = extras.partNumber
            if (extras.compatibility) cleanEdit.compatibility = extras.compatibility
            if (extras.seatsCount != null) cleanEdit.seatsCount = Number(extras.seatsCount)
            if (extras.torque != null) cleanEdit.torque = Number(extras.torque)
            if (extras.co2 != null) cleanEdit.co2Emission = Number(extras.co2)
            if (extras.fuelConsumptionCity != null) cleanEdit.fuelConsumptionCity = Number(extras.fuelConsumptionCity)
            if (extras.fuelConsumptionHwy != null) cleanEdit.fuelConsumptionHighway = Number(extras.fuelConsumptionHwy)
            if (extras.fuelConsumptionMix != null) cleanEdit.fuelConsumptionCombined = Number(extras.fuelConsumptionMix)
            if (extras.euroNorm) cleanEdit.euroNorm = extras.euroNorm
            if (extras.colorFinish) cleanEdit.colorFinish = extras.colorFinish
            // Subtype and subtype-specific fields
            if (form.vehicleSubtypeId != null) cleanEdit.vehicleSubtypeId = form.vehicleSubtypeId
            if (extras.operatingWeight != null) cleanEdit.operatingWeightKg = extras.operatingWeight
            if (extras.workingWidth != null) cleanEdit.workingWidthCm = extras.workingWidth
            if (extras.maxDiggingDepth != null) cleanEdit.maxDiggingDepthM = extras.maxDiggingDepth
            if (extras.bucketCapacity != null) cleanEdit.bucketCapacityL = extras.bucketCapacity
            if (extras.tankCapacity != null) cleanEdit.tankCapacityL = extras.tankCapacity
            // Vehicle history fields
            if (history.ownersCount !== null) cleanEdit.ownersCount = history.ownersCount
            cleanEdit.isImported = history.isImported
            if (history.importCountry) cleanEdit.importCountry = history.importCountry
            if (history.firstRegDate) cleanEdit.firstRegistrationDate = history.firstRegDate
            if (history.registrationCountry) cleanEdit.registrationCountry = history.registrationCountry
            cleanEdit.hasServiceBook = history.hasServiceBook
            cleanEdit.hasFullServiceHistory = history.hasFullServiceHistory
            if (typeof history.nextInspection === 'string' && history.nextInspection.trim()) cleanEdit.nextInspection = history.nextInspection.length === 7 ? `${history.nextInspection}-01` : history.nextInspection
            cleanEdit.hasDamage = history.hasDamage
            if (history.damageDesc) cleanEdit.damageDescription = history.damageDesc
            cleanEdit.hasWarranty = history.hasWarranty
            if (history.warrantyUntil) cleanEdit.warrantyUntil = history.warrantyUntil.length === 7 ? `${history.warrantyUntil}-01` : history.warrantyUntil
            // Premium history fields
            cleanEdit.isFirstOwner = history.isFirstOwner
            cleanEdit.isServicedAtASO = history.servicedAtASO
            cleanEdit.isGaraged = history.isGaraged
            if (history.keyCount !== null) cleanEdit.keyCount = history.keyCount
            if (history.insuranceUntil) cleanEdit.insuranceUntil = history.insuranceUntil.length === 7 ? `${history.insuranceUntil}-01` : history.insuranceUntil
            // Premium form fields
            if (form.gearCount) cleanEdit.gearCount = form.gearCount
            if (form.maxTrailerWeight) cleanEdit.maxTrailerWeight = form.maxTrailerWeight
            if (form.youtubeUrl) cleanEdit.youtubeUrl = form.youtubeUrl
            if (form.pdfBrochureUrl) cleanEdit.pdfBrochureUrl = form.pdfBrochureUrl
            await $fetch(`/api/proxy/api/listings/${editId.value}`, {
                method: 'PUT',
                body: cleanEdit,
            })
            let imgEditErrors = 0
            for (const file of selectedFiles.value) {
                const fd = new FormData()
                fd.append('file', file)
                try {
                    await $fetch(`/api/proxy/api/listings/${editId.value}/images`, { method: 'POST', body: fd })
                } catch {
                    imgEditErrors++
                }
            }
            if (imgEditErrors > 0) {
                error.value = `${imgEditErrors} z ${selectedFiles.value.length} zdjęć nie zostało przesłanych. Możesz je dodać w edycji ogłoszenia.`
            }
            await navigateTo('/my-adverts')
        } else {
            // ── Create mode: new advert ──
            // Only include fields known by CreateCarAdvertDto
            const ADVERT_FIELDS = [
                'brandId', 'modelId', 'generationId', 'trimId', 'engineVersionId',
                'fuelTypeId', 'gearboxId', 'bodyTypeId',
                'year', 'mileage', 'price', 'title', 'vin',
                'city', 'region', 'isNegotiable', 'sellerType',
                'doorCount', 'seatsCount',
                'trimId', 'vehicleSubtypeId', 'partCategoryId', 'partSubcategoryId',
                'oemNumber', 'manufacturerPartNumber', 'partManufacturer',
                'registrationPlate', 'hasVatInvoice', 'isLeasingPossible',
                'isCreditPossible', 'isExchangePossible', 'metallicPaint',
            ]
            const cleanBody: Record<string, unknown> = {}
            if (form.categoryId) cleanBody.vehicleCategoryId = form.categoryId
            for (const key of ADVERT_FIELDS) {
                const v = (form as any)[key]
                if (v === null || v === undefined || v === '') continue
                cleanBody[key] = v
            }
            cleanBody.featureIds = form.featureIds?.length ? form.featureIds : []
            cleanBody.description = buildDescription() || form.description || ''
            // Map renamed fields
            if (form.power) cleanBody.powerHP = form.power
            if (form.engineCapacity) cleanBody.engineSize = form.engineCapacity
            // Map extras → structured API fields
            if (extras.condition) cleanBody.condition = extras.condition
            if (extras.doors) cleanBody.doorCount = Number(extras.doors)
            if (extras.driveType) {
                const dt = driveTypes.value.find(d => d.slug === extras.driveType)
                if (dt) cleanBody.driveTypeId = dt.id
            }
            if (extras.color) {
                if (typeof extras.color === 'number') {
                    cleanBody.colorId = extras.color
                } else {
                    const col = colors.value.find(c => c.name.toLowerCase() === String(extras.color).toLowerCase())
                    if (col) cleanBody.colorId = col.id
                }
            }
            // New specialized DB fields from extras
            if (extras.gvw != null) cleanBody.grossWeight = Number(extras.gvw)
            if (extras.payload != null) cleanBody.payload = Number(extras.payload)
            if (extras.axles != null) cleanBody.axleCount = Number(extras.axles)
            if (extras.loadingLength != null) cleanBody.cargoLength = Number(extras.loadingLength)
            if (extras.length != null) cleanBody.cargoLength = Number(extras.length)
            if (extras.hasTachograph != null) cleanBody.hasTachograph = Boolean(extras.hasTachograph)
            if (extras.hasRetarder != null) cleanBody.hasRetarder = Boolean(extras.hasRetarder)
            if (extras.bodyVariant) cleanBody.bodySubtype = extras.bodyVariant
            if (extras.trailerType) cleanBody.bodySubtype = extras.trailerType
            if (extras.machineType) cleanBody.bodySubtype = extras.machineType
            if (extras.truckType) cleanBody.bodySubtype = extras.truckType
            if (extras.partCategory) cleanBody.bodySubtype = extras.partCategory
            if (extras.partNumber) cleanBody.catalogNumber = extras.partNumber
            if (extras.compatibility) cleanBody.compatibility = extras.compatibility
            if (extras.seatsCount != null) cleanBody.seatsCount = Number(extras.seatsCount)
            if (extras.torque != null) cleanBody.torque = Number(extras.torque)
            if (extras.co2 != null) cleanBody.co2Emission = Number(extras.co2)
            if (extras.fuelConsumptionCity != null) cleanBody.fuelConsumptionCity = Number(extras.fuelConsumptionCity)
            if (extras.fuelConsumptionHwy != null) cleanBody.fuelConsumptionHighway = Number(extras.fuelConsumptionHwy)
            if (extras.fuelConsumptionMix != null) cleanBody.fuelConsumptionCombined = Number(extras.fuelConsumptionMix)
            if (extras.euroNorm) cleanBody.euroNorm = extras.euroNorm
            if (extras.colorFinish) cleanBody.colorFinish = extras.colorFinish
            // Subtype and subtype-specific fields
            if (form.vehicleSubtypeId != null) cleanBody.vehicleSubtypeId = form.vehicleSubtypeId
            if (extras.operatingWeight != null) cleanBody.operatingWeightKg = extras.operatingWeight
            if (extras.workingWidth != null) cleanBody.workingWidthCm = extras.workingWidth
            if (extras.maxDiggingDepth != null) cleanBody.maxDiggingDepthM = extras.maxDiggingDepth
            if (extras.bucketCapacity != null) cleanBody.bucketCapacityL = extras.bucketCapacity
            if (extras.tankCapacity != null) cleanBody.tankCapacityL = extras.tankCapacity
            // Vehicle history fields
            if (history.ownersCount !== null) cleanBody.ownersCount = history.ownersCount
            cleanBody.isImported = history.isImported
            if (history.importCountry) cleanBody.importCountry = history.importCountry
            if (history.firstRegDate) cleanBody.firstRegistrationDate = history.firstRegDate
            if (history.registrationCountry) cleanBody.registrationCountry = history.registrationCountry
            cleanBody.hasServiceBook = history.hasServiceBook
            cleanBody.hasFullServiceHistory = history.hasFullServiceHistory
            if (typeof history.nextInspection === 'string' && history.nextInspection.trim()) cleanBody.nextInspection = history.nextInspection.length === 7 ? `${history.nextInspection}-01` : history.nextInspection
            cleanBody.hasDamage = history.hasDamage
            if (history.damageDesc) cleanBody.damageDescription = history.damageDesc
            cleanBody.hasWarranty = history.hasWarranty
            if (history.warrantyUntil) cleanBody.warrantyUntil = history.warrantyUntil.length === 7 ? `${history.warrantyUntil}-01` : history.warrantyUntil
            // Premium history fields
            cleanBody.isFirstOwner = history.isFirstOwner
            cleanBody.isServicedAtASO = history.servicedAtASO
            cleanBody.isGaraged = history.isGaraged
            if (history.keyCount !== null) cleanBody.keyCount = history.keyCount
            if (history.insuranceUntil) cleanBody.insuranceUntil = history.insuranceUntil.length === 7 ? `${history.insuranceUntil}-01` : history.insuranceUntil
            // Premium form fields
            if (form.gearCount) cleanBody.gearCount = form.gearCount
            if (form.maxTrailerWeight) cleanBody.maxTrailerWeight = form.maxTrailerWeight
            if (form.youtubeUrl) cleanBody.youtubeUrl = form.youtubeUrl
            if (form.pdfBrochureUrl) cleanBody.pdfBrochureUrl = form.pdfBrochureUrl
            const created = await $fetch<any>('/api/proxy/api/listings', {
                method: 'POST',
                body: cleanBody,
            })
            const id: number = created?.id ?? created?.advertId ?? created
            if (!id) throw new Error('Brak ID ogłoszenia w odpowiedzi: ' + JSON.stringify(created))

            let imageErrors = 0
            for (const file of selectedFiles.value) {
                const fd = new FormData()
                fd.append('file', file)
                try {
                    await $fetch(`/api/proxy/api/listings/${id}/images`, { method: 'POST', body: fd })
                } catch {
                    imageErrors++
                }
            }
            // Upload pending PDF if selected
            if (pdfPendingFile.value) {
                try {
                    const fd = new FormData()
                    fd.append('file', pdfPendingFile.value)
                    await $fetch(`/api/advert/${id}/pdf`, { method: 'POST', body: fd })
                } catch { /* non-critical */ }
            }

            localStorage.removeItem(draftKey.value)

            await $fetch(`/api/proxy/api/listings/${id}/publish`, { method: 'POST', body: {} }).catch(() => {})

            if (promoSelected.value === 'free') {
                publishedAdvertId.value = id
                showSuccess.value = true
                if (imageErrors > 0) {
                    error.value = `${imageErrors} z ${selectedFiles.value.length} zdjęć nie zostało przesłanych. Możesz je dodać w edycji ogłoszenia.`
                }
            } else if (imageErrors > 0) {
                loading.value = false
                publishedAdvertId.value = id
                error.value = `Ogłoszenie zostało zapisane (ID ${id}), ale ${imageErrors} z ${selectedFiles.value.length} zdjęć nie zostało przesłanych — błąd serwera. Możesz dodać zdjęcia później w panelu edycji.`
            } else {
                try {
                    loading.value = false
                    paying.value = true
                    const body: Record<string, unknown> = {
                        advertId: id,
                        serviceType: promoSelected.value,
                        durationDays: promoDays.value,
                    }
                    if (couponResult.value?.isValid && couponCode.value) body.couponCode = couponCode.value
                    const result = await $fetch<{ paymentUrl: string, formFields?: Record<string, string> }>('/api/proxy/api/Payment/initiate', { method: 'POST', body })
                    submitImojeForm(result)
                } catch (payErr: any) {
                    paying.value = false
                    publishedAdvertId.value = id
                    showSuccess.value = true
                    const payMsg = (payErr?.data?.message ?? payErr?.statusMessage ?? payErr?.message ?? '') as string
                    error.value = `Ogłoszenie zostało opublikowane! Nie udało się zainicjować płatności${payMsg ? ` (${payMsg})` : ''}. Możesz opłacić promocję z panelu „Moje ogłoszenia".`
                    if (imageErrors > 0) {
                        error.value += ` Ponadto ${imageErrors} zdjęcie(a) nie zostało przesłane.`
                    }
                }
            }
        }
    } catch (e: any) {
        const bd = e?.data
        let msg = ''
        if (bd?.errors && typeof bd.errors === 'object') {
            msg = Object.entries(bd.errors as Record<string, string[]>)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join('; ')
        } else {
            msg = bd?.message ?? bd?.title ?? bd?.detail ?? ''
        }
        const errCode = bd?.error as string | undefined
        if (errCode === 'private_limit_yearly' || errCode === 'private_limit_active') {
            limitError.value = errCode
            error.value = ''
        } else {
            limitError.value = null
            error.value = msg || e?.message || 'Błąd podczas zapisywania ogłoszenia.'
        }
    } finally {
        loading.value = false
        paying.value = false
    }
}

async function deleteExistingImage(imageId: number) {
    deletingImageId.value = imageId
    try {
        await $fetch(`/api/proxy/api/listings/${editId.value}/images/${imageId}`, { method: 'DELETE' })
        existingImages.value = existingImages.value.filter(img => img.id !== imageId)
    } catch {
        const { error: toastError } = useToast()
        toastError('Nie udało się usunąć zdjęcia. Spróbuj ponownie.')
    }
    finally { deletingImageId.value = null }
}

const isDirty = computed(() => !isEdit.value && (
    !!form.title || !!form.brandId || !!form.price ||
    selectedFiles.value.length > 0 || selectedFeatureIds.value.size > 0
))

function onBeforeUnload(e: BeforeUnloadEvent) {
    if (isDirty.value) {
        e.preventDefault()
        e.returnValue = ''
    }
}

onMounted(async () => {
    window.addEventListener('beforeunload', onBeforeUnload)
    ;[brands.value, fuelTypes.value, gearboxes.value, bodyTypes.value, driveTypes.value, colors.value, allFeatures.value, advertCategories.value, partCategories.value] = await Promise.all([
        fetchBrands(), fetchFuelTypes(), fetchGearboxes(), fetchBodyTypes(), fetchDriveTypes(), fetchColors(), fetchFeatures(), fetchCategories(), fetchPartCategories()
    ])
    await loadContextFeatures()

    if (isEdit.value && editId.value) {
        try {
            const advert = await $fetch<CarAdvert>(`/api/proxy/api/listings/${editId.value}`)
            form.title = advert.title ?? ''
            form.description = advert.description ?? ''
            form.price = advert.price ?? null
            form.brandId = advert.brand?.id ?? null
            form.modelId = advert.model?.id ?? null
            form.generationId = advert.generation?.id ?? null
            form.trimId = (advert as any).trimId ?? null
            form.engineVersionId = advert.engineVersion?.id ?? null
            form.fuelTypeId = advert.fuelType?.id ?? null
            form.gearboxId = advert.gearbox?.id ?? null
            form.bodyTypeId = advert.bodyType?.id ?? null
            form.year = advert.year ?? null
            form.mileage = advert.mileage ?? null
            form.featureIds = advert.features?.map(f => f.id) ?? []
            form.engineCapacity = (advert as any).engineCapacity ?? advert.engineVersion?.displacement ?? null
            form.power = (advert as any).power ?? advert.engineVersion?.horsepower ?? null
            form.vin = advert.vin ?? ''
            form.city = advert.city ?? ''
            form.region = advert.region ?? null
            form.isNegotiable = advert.isNegotiable ?? false
            form.sellerType = advert.sellerType ?? 'private'
            form.power = advert.powerHP ?? null
            form.engineCapacity = advert.engineSize ?? null
            // Restore extras from structured fields
            if (advert.condition) extras.condition = advert.condition
            if (advert.bodySubtype && selectedCategory.value?.slug === 'czesci') extras.partCategory = advert.bodySubtype
            if (advert.catalogNumber) extras.partNumber = advert.catalogNumber
            if (advert.compatibility) extras.compatibility = advert.compatibility
            if (advert.doorCount) extras.doors = String(advert.doorCount)
            if (advert.driveType) extras.driveType = advert.driveType.slug
            if (advert.color) extras.color = advert.color.id ?? advert.color.name
            // Restore history
            if (advert.ownersCount !== undefined) history.ownersCount = advert.ownersCount ?? null
            history.isImported = advert.isImported ?? false
            history.importCountry = advert.importCountry ?? ''
            history.firstRegDate = advert.firstRegistrationDate ?? ''
            history.registrationCountry = advert.registrationCountry ?? 'PL'
            history.hasServiceBook = advert.hasServiceBook ?? false
            history.hasFullServiceHistory = advert.hasFullServiceHistory ?? false
            history.nextInspection = advert.nextInspection ? String(advert.nextInspection).substring(0, 7) : ''
            history.hasDamage = advert.hasDamage ?? false
            history.damageDesc = advert.damageDescription ?? ''
            history.hasWarranty = advert.hasWarranty ?? false
            history.warrantyUntil = advert.warrantyUntil ? String(advert.warrantyUntil).substring(0, 7) : ''
            // Premium fields restore
            history.isFirstOwner = (advert as any).isFirstOwner ?? false
            history.servicedAtASO = (advert as any).isServicedAtASO ?? false
            history.isGaraged = (advert as any).isGaraged ?? false
            history.keyCount = (advert as any).keyCount ?? null
            history.insuranceUntil = (advert as any).insuranceUntil ? String((advert as any).insuranceUntil).substring(0, 7) : ''
            if ((advert as any).registrationPlate) form.registrationPlate = (advert as any).registrationPlate
            form.hasVatInvoice = (advert as any).hasVatInvoice ?? false
            form.isLeasingPossible = (advert as any).isLeasingPossible ?? false
            form.isCreditPossible = (advert as any).isCreditPossible ?? false
            form.isExchangePossible = (advert as any).isExchangePossible ?? false
            form.gearCount = (advert as any).gearCount ?? null
            form.metallicPaint = (advert as any).metallicPaint ?? false
            form.maxTrailerWeight = (advert as any).maxTrailerWeight ?? null
            if ((advert as any).youtubeUrl) form.youtubeUrl = (advert as any).youtubeUrl
            if ((advert as any).pdfBrochureUrl) form.pdfBrochureUrl = (advert as any).pdfBrochureUrl
            existingImages.value = advert.images ?? []
            if (form.brandId) models.value = await fetchModels(form.brandId)
            if (form.modelId) generations.value = await fetchGenerations(form.modelId)
            if (form.generationId) {
                const [loadedTrims, loadedEngines] = await Promise.all([
                    fetchTrims(form.generationId),
                    fetchEngines(form.generationId),
                ])
                trims.value = loadedTrims
                engines.value = loadedEngines
            }
        } catch {
            error.value = 'Nie udało się załadować danych ogłoszenia.'
        }
    } else {
        // Load user profile to get user-specific draft key and pre-fill location
        try {
            const profile = await $fetch<{ id: number; city?: string; region?: string }>('/api/proxy/api/User/me')
            draftKey.value = `carizo_advert_draft_${profile.id}`
            loadDraft()
            if (!form.city && profile.city) form.city = profile.city
            if (!form.region && profile.region) form.region = profile.region
        } catch {
            loadDraft()
        }
        const queries = promoPlans.flatMap(p => p.days.map(d => ({ key: p.key, days: d })))
        await Promise.allSettled(queries.map(async ({ key, days }) => {
            try {
                const r = await getPrice(key, days)
                promoApiPrices.value[`${key}-${days}`] = r.price
            } catch {}
        }))
    }
})

// Autosave draft every 60 seconds while the form is open (only for new adverts)
let autosaveTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
    if (!isEdit.value) {
        autosaveTimer = setInterval(() => {
            saveDraft()
        }, 60_000)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
    if (autosaveTimer) clearInterval(autosaveTimer)
})
</script>

<style lang="scss" scoped>
// ── Page shell ────────────────────────────────────────────────────────────────
.add-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $bg;
    color: $text;
    font-family: 'Inter', sans-serif;
    overflow: hidden;

    @media (max-width: 768px) {
        height: auto;
        min-height: 100vh;
        overflow: visible;
    }
}

// ── Top bar ───────────────────────────────────────────────────────────────────
.top-bar {
    height: 56px;
    min-height: 56px;
    border-bottom: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: $bg;
    z-index: 10;
}

.top-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.tl-logo {
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 4px;
    color: $text;
    span { color: $red; }
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: $text-dim;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s;
    &:hover { color: $text; }
}

.top-center {
    font-size: 14px;
    font-weight: 600;
    color: $text-muted;
}

.top-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-draft {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 14px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-close {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid $border;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dim;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

// ── Mobile step progress bar ──────────────────────────────────────────────────
.mobile-step-bar {
    display: none;
    flex-direction: column;
    gap: 6px;
    padding: 10px 16px;
    border-bottom: 1px solid $border;
    background: #070707;

    @media (max-width: 768px) {
        display: flex;
    }
}

.mobile-step-label {
    font-size: 12px;
    color: $text-dim;
    font-weight: 500;
}

.mobile-step-track {
    height: 3px;
    background: $border;
    border-radius: 2px;
    overflow: hidden;
}

.mobile-step-fill {
    height: 100%;
    background: $red;
    border-radius: 2px;
    transition: width 0.3s ease;
}

// ── Page body ─────────────────────────────────────────────────────────────────
.page-body {
    flex: 1;
    display: flex;
    overflow: hidden;

    @media (max-width: 768px) {
        overflow: visible;
        flex-direction: column;
    }
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
.left-sidebar {
    width: 240px;
    min-width: 240px;
    border-right: 1px solid $border;
    background: #070707;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    @media (max-width: 768px) {
        display: none;
    }
}

.steps-nav {
    flex: 1;
    padding: 20px 0;
}

.step-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 20px;
    cursor: default;
    transition: background 0.15s;

    &.step-active {
        background: rgba($red, 0.08);
        .step-num { background: $red; border-color: $red; color: white; }
        .step-name { color: $text; }
    }

    &.step-done {
        cursor: pointer;
        .step-num { background: rgba($red, 0.15); border-color: rgba($red, 0.3); color: $red; }
        &:hover { background: rgba(255,255,255,0.02); }
    }
}

.step-num {
    width: 28px;
    height: 28px;
    min-width: 28px;
    border-radius: 50%;
    border: 1.5px solid $border;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: $text-dark;
    margin-top: 1px;
}

.step-info { min-width: 0; }

.step-name {
    font-size: 13px;
    font-weight: 600;
    color: $text-muted;
    margin-bottom: 2px;
}

.step-desc {
    font-size: 11px;
    color: $text-dark;
}

.sidebar-help {
    margin: 16px;
    padding: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: $r-md;
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.help-icon { color: $text-dark; flex-shrink: 0; margin-top: 2px; }

.help-title {
    font-size: 12px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 4px;
}

.help-sub {
    font-size: 11px;
    color: $text-dark;
    line-height: 1.5;
    margin-bottom: 8px;
}

.help-link {
    font-size: 12px;
    font-weight: 600;
    color: $red;
    &:hover { opacity: 0.8; }
}

// ── Center area ───────────────────────────────────────────────────────────────
.center-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.form-hero {
    min-height: 160px;
    background:
        linear-gradient(to right, rgba(5,5,5,0.92) 40%, rgba(5,5,5,0.5)),
        url('/hero-car.jpg') center / cover;
    display: flex;
    align-items: center;
    padding: 32px 40px;
    flex-shrink: 0;

    @media (max-width: 768px) {
        min-height: 100px;
        padding: 20px 16px;
    }
}

.form-hero-text {
    h1 {
        font-size: 30px;
        font-weight: 900;
        color: $text;
        margin-bottom: 6px;
    }
    p {
        font-size: 14px;
        color: $text-muted;
    }
}

// ── Progress track ────────────────────────────────────────────────────────────
.progress-track {
    display: flex;
    align-items: center;
    padding: 20px 40px;
    border-bottom: 1px solid $border;
    background: #070707;
    flex-shrink: 0;
}

.progress-node {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;

    &.pn-done {
        .pn-icon { background: rgba($red, 0.15); border-color: rgba($red, 0.4); color: $red; }
        .pn-label { color: $text-muted; }
        .pn-line { background: rgba($red, 0.3); }
    }

    &.pn-active {
        .pn-icon { background: $red; border-color: $red; color: white; }
        .pn-label { color: $text; font-weight: 600; }
    }
}

.pn-icon {
    width: 34px;
    height: 34px;
    min-width: 34px;
    border-radius: 50%;
    border: 1.5px solid $border;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dark;
    transition: all 0.2s;
}

.pn-label {
    font-size: 13px;
    color: $text-dark;
    white-space: nowrap;
}

.pn-line {
    flex: 1;
    height: 1px;
    background: $border;
    margin: 0 14px 0 14px;
}

// ── Form content ──────────────────────────────────────────────────────────────
.form-content {
    padding: 32px 40px 24px;
    flex: 1;

    @media (max-width: 768px) {
        padding: 20px 16px 24px;
    }
}

.form-section-head {
    margin-bottom: 28px;

    h2 {
        font-size: 22px;
        font-weight: 800;
        color: $text;
        margin-bottom: 4px;
    }

    p {
        font-size: 13px;
        color: $text-dim;
    }
}

.fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.flabel {
    font-size: 12px;
    font-weight: 600;
    color: $text-dim;
    letter-spacing: 0.2px;
}

.req { color: $red; }

.fselect, .finput {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;

    &:focus { border-color: rgba($red, 0.5); }
    &::placeholder { color: $text-dark; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.fselect { cursor: pointer; padding-right: 36px; }

.input-ok { border-color: rgba(45, 122, 58, 0.6) !important; }

.vin-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
}

.vin-input { flex: 1; width: auto !important; min-width: 0; }

.btn-vin-lookup {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 18px;
    background: rgba($red, 0.15);
    border: 1px solid rgba($red, 0.4);
    border-radius: $r-sm;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s, border-color 0.2s;

    &:hover:not(:disabled) { background: rgba($red, 0.25); border-color: rgba($red, 0.7); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.vin-error {
    display: flex;
    align-items: center;
    gap: 5px;
    color: $red;
    font-size: 12px;
    margin-top: 6px;
}

.vin-hint {
    color: $text-dark;
    font-size: 12px;
    margin-top: 6px;
}

.finput-price {
    border-color: rgba($red, 0.4);
    &:focus { border-color: $red; }
}

.field-locked-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 600;
    color: #8B0D1D;
    background: rgba(139, 13, 29, 0.12);
    border: 1px solid rgba(139, 13, 29, 0.25);
    border-radius: 4px;
    padding: 1px 6px;
    margin-left: 8px;
    vertical-align: middle;
}

.finput--locked {
    opacity: 0.75;
    cursor: not-allowed;
    background: rgba(255,255,255,0.03);
}

.finput--error {
    border-color: rgba($red, 0.6) !important;
    &:focus { border-color: $red !important; }
}

.extras-section-divider {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 4px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;

    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
    }
}

.field-error {
    display: flex;
    align-items: center;
    gap: 5px;
    color: $red;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
}

.desc-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    .flabel { margin-bottom: 0; }
}

.btn-ai-desc {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #8B0D1D, #b01424);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    padding: 7px 14px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    white-space: nowrap;
    &:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.ai-desc-error {
    background: rgba(139, 13, 29, 0.12);
    border: 1px solid rgba(139, 13, 29, 0.3);
    border-radius: 6px;
    color: #e07070;
    font-size: 12px;
    padding: 8px 12px;
    margin-bottom: 8px;
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; display: inline-block; }

.select-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.sel-arrow {
    position: absolute;
    right: 12px;
    color: $text-dim;
    pointer-events: none;
}

.input-icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.input-prefix {
    position: absolute;
    left: 12px;
    color: $text-dim;
    pointer-events: none;
    z-index: 1;

    &.in-select { z-index: 1; }
}

.finput.has-prefix,
.fselect.has-prefix {
    padding-left: 36px;
}

// ── VIN bar ───────────────────────────────────────────────────────────────────
.vin-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 16px 20px;
}

.vin-doc-icon { color: $text-dark; flex-shrink: 0; }

.vin-text { flex: 1; min-width: 0; }

.vin-title {
    font-size: 13px;
    font-weight: 600;
    color: $text;
    margin-bottom: 2px;
}

.vin-sub {
    font-size: 12px;
    color: $text-dark;
}

.vin-input {
    width: 180px;
    background: rgba(255,255,255,0.04);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 9px 12px;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    outline: none;
    letter-spacing: 1px;
    transition: border-color 0.2s;
    &::placeholder { color: $text-dark; letter-spacing: 0; }
    &:focus { border-color: rgba($red, 0.5); }
}

.vin-btn {
    background: transparent;
    border: 1px solid rgba($red, 0.5);
    border-radius: $r-sm;
    color: $red;
    font-size: 13px;
    font-weight: 600;
    padding: 9px 18px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    transition: background 0.2s;
    &:hover:not(:disabled) { background: rgba($red, 0.08); }
    &:disabled { opacity: 0.4; cursor: default; }
}

.vin-error {
    font-size: 12px; color: #f87171; margin-top: 8px; padding: 0 20px;
}

.btn-draft--saved { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }

.preview-modal-overlay {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
}

.preview-modal {
    background: #0d0d0d; border: 1px solid $border;
    border-radius: $r-lg; width: 100%; max-width: 680px; max-height: 90vh;
    overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.8);
}

.pm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid $border;
}

.pm-title { font-size: 15px; font-weight: 700; color: $text; }

.pm-close {
    background: transparent; border: none; color: $text-dim; cursor: pointer;
    transition: color 0.2s; &:hover { color: $text; }
}

.pm-body { padding: 24px; }

.pm-img-wrap {
    position: relative; aspect-ratio: 16/9; border-radius: $r-md; overflow: hidden;
    background: #111; margin-bottom: 20px;
}

.pm-img { width: 100%; height: 100%; object-fit: cover; }

.pm-img-count {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(0,0,0,0.7); color: white;
    font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
}

.pm-brand { font-size: 12px; color: $red; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.pm-name { font-size: 24px; font-weight: 900; color: $text; margin-bottom: 10px; }
.pm-meta {
    display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; color: $text-dim; margin-bottom: 12px;
}
.pm-price { font-size: 28px; font-weight: 900; color: $red; margin-bottom: 16px; }
.pm-desc { font-size: 14px; color: $text-muted; line-height: 1.7; white-space: pre-wrap; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-section-subhead {
    font-size: 13px; font-weight: 700; color: $text-muted; text-transform: uppercase;
    letter-spacing: 0.5px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid $border;
}

.photo-count-bar {
    display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500;
    padding: 8px 14px; border-radius: $r-sm; margin-bottom: 16px;
    &.pc-ok { color: #4caf50; background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.2); }
    &.pc-warn { color: #ff9800; background: rgba(255,152,0,0.08); border: 1px solid rgba(255,152,0,0.2); }
}

// ── Form actions ──────────────────────────────────────────────────────────────
.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-top: 1px solid $border;
    background: $bg;
    flex-shrink: 0;
}

.form-actions-left { display: flex; align-items: center; gap: 14px; }

.step-error {
    display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ff9800;
}

.fade-err-enter-active, .fade-err-leave-active { transition: opacity 0.3s; }
.fade-err-enter-from, .fade-err-leave-to { opacity: 0; }

.btn-cancel {
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 14px;
    font-weight: 500;
    padding: 11px 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

.btn-next {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $red;
    border: none;
    border-radius: $r-sm;
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 11px 28px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    &:hover { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── Bottom strip ──────────────────────────────────────────────────────────────
.bottom-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border-top: 1px solid $border;
    flex-shrink: 0;
}

.strip-feat {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 18px 20px;
    border-right: 1px solid $border;

    &:last-child { border-right: none; }
}

.strip-icon { color: $red; flex-shrink: 0; margin-top: 2px; }

.strip-title {
    font-size: 12px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 3px;
}

.strip-desc {
    font-size: 11px;
    color: $text-dark;
    line-height: 1.4;
}

// ── Right panel ───────────────────────────────────────────────────────────────
.right-panel {
    width: 268px;
    min-width: 268px;
    border-left: 1px solid $border;
    background: #070707;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;

    @media (max-width: 960px) {
        display: none;
    }
}

.score-card {
    padding: 22px 20px;
    border-bottom: 1px solid $border;
}

.score-card-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 16px;
}

.score-circle-area {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
}

.score-num {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    line-height: 1;
}

.score-val {
    display: block;
    font-size: 30px;
    font-weight: 900;
    color: $text;
}

.score-denom {
    display: block;
    font-size: 12px;
    color: $text-dim;
    margin-top: 2px;
}

.score-label {
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 16px;
    &.sl-great { color: #4caf50; }
    &.sl-good  { color: #e67e22; }
    &.sl-poor  { color: lighten($red, 15%); }
}

.score-factors { margin-bottom: 12px; }

.score-tips {
    border-top: 1px solid $border;
    padding-top: 12px;
    margin-top: 4px;
}

.st-heading {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.st-icon { color: #f39c12; }

.st-tip {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.55;
    padding: 6px 8px;
    background: rgba(255,255,255,0.025);
    border-left: 2px solid rgba($red, 0.4);
    border-radius: 0 4px 4px 0;
    margin-bottom: 6px;
}

.sf-heading {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
}

.sf-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
    font-size: 12px;
    color: $text-dark;

    &.sf-done {
        color: $text-muted;
        .sf-check-box { background: rgba(45, 122, 58, 0.2); border-color: rgba(45, 122, 58, 0.5); color: #4caf50; }
    }
}

.sf-check-box {
    width: 16px;
    height: 16px;
    min-width: 16px;
    border-radius: 50%;
    border: 1.5px solid $border;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
}

// ── Preview card ──────────────────────────────────────────────────────────────
.preview-card {
    padding: 20px;
}

.preview-card-title {
    font-size: 13px;
    font-weight: 700;
    color: $text;
    margin-bottom: 14px;
}

.preview-img-wrap {
    border-radius: $r-md;
    overflow: hidden;
    margin-bottom: 12px;
    img {
        width: 100%;
        height: 130px;
        object-fit: cover;
        display: block;
    }
}

.preview-details { margin-bottom: 14px; }

.preview-car-name {
    font-size: 14px;
    font-weight: 700;
    color: $text;
    margin-bottom: 4px;
}

.preview-meta-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: $text-dim;
    margin-bottom: 6px;
    flex-wrap: wrap;
}

.dot { color: $text-dark; }

.preview-price {
    font-size: 18px;
    font-weight: 800;
    color: $red;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.preview-nego {
    font-size: 10px;
    font-weight: 600;
    background: rgba($red, 0.12);
    color: rgba($red, 0.75);
    padding: 2px 8px;
    border-radius: 20px;
}

.preview-full-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text-muted;
    font-size: 12px;
    font-weight: 500;
    padding: 9px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

// ── Photos step ───────────────────────────────────────────────────────────────
.img-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
    position: relative;

    &--dragover { outline: 2px dashed $red; outline-offset: 4px; border-radius: $r-md; }
}

.img-thumb {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: $r-md;
    overflow: hidden;
    border: 1px solid $border;
    cursor: grab;
    transition: opacity 0.15s, transform 0.15s;
    img { width: 100%; height: 100%; object-fit: cover; display: block; }

    &--drag-src { opacity: 0.4; }
    &--drag-over { outline: 2px solid $red; outline-offset: 2px; transform: scale(1.03); }
}

.img-drag-hint {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: rgba(0,0,0,0.55);
    border-radius: 4px;
    padding: 2px 4px;
    color: rgba(255,255,255,0.7);
    line-height: 1;
    pointer-events: none;
}

.img-drop-hint {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px;
    color: $text-muted;
    font-size: 13px;
    opacity: 0.6;
}

.img-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: rgba(0,0,0,0.9); }
}

.img-main-badge {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: $red;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
}

.img-add {
    aspect-ratio: 4/3;
    border-radius: $r-md;
    border: 2px dashed $border;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    color: $text-dark;
    font-size: 12px;
    font-weight: 500;
    transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $red; color: $red; }
    &--loading { border-color: rgba($red, 0.4); color: $text-muted; cursor: wait; }
}

// ── Details step ──────────────────────────────────────────────────────────────
.ftextarea {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: $r-sm;
    color: $text;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    padding: 12px 14px;
    outline: none;
    resize: vertical;
    transition: border-color 0.2s;
    &:focus { border-color: rgba($red, 0.5); }
    &::placeholder { color: $text-dark; }
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
}

.cat-choice-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 16px 18px;
    border: 2px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    background: rgba(255,255,255,0.02);
    color: $text-dim;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
    text-align: center;
    min-height: 110px;

    .ccb-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        color: $text-dim;
    }
    .ccb-name { font-size: 13px; font-weight: 600; color: $text-dim; line-height: 1.2; }
    .ccb-count { font-size: 10px; color: $text-dark; }

    &:hover {
        border-color: rgba($red, 0.3);
        background: rgba($red, 0.04);
        .ccb-icon-wrap { background: rgba($red, 0.12); color: $red; }
        .ccb-name { color: $text; }
    }

    &.active {
        border-color: $red;
        background: rgba($red, 0.08);
        .ccb-icon-wrap { background: $red; color: white; }
        .ccb-name { color: $text; font-weight: 700; }
    }
}

.equip-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.equip-ctrl-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 1px solid $border;
    border-radius: 6px;
    color: $text-dim;
    font-size: 11px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 5px 12px;
    cursor: pointer;
    transition: all 0.15s;
    &:hover { border-color: rgba($red, 0.3); color: $text; }
}

.feat-group { margin-bottom: 4px; }

.feat-group-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: 8px;
    padding: 10px 14px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s, border-color 0.15s;
    margin-bottom: 0;

    &:hover { background: rgba(255,255,255,0.04); border-color: rgba($red, 0.2); }

    &.fgh-open {
        border-color: rgba($red, 0.25);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom-color: transparent;
    }

    .fgh-arrow {
        color: $text-dark;
        transition: transform 0.2s;
        flex-shrink: 0;
    }
    &.fgh-open .fgh-arrow { transform: rotate(180deg); }
}

.fgh-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .v-icon { color: $text-dim; }
}

.fgh-name {
    font-size: 12px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.feat-group-count {
    font-size: 10px;
    font-weight: 600;
    color: $text-dark;
    background: rgba(255,255,255,0.05);
    border-radius: 20px;
    padding: 1px 7px;

    &.fgc-has { color: $red; background: rgba($red, 0.1); }
}

.feat-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border: 1px solid rgba($red, 0.22);
    border-top: none;
    border-radius: 0 0 10px 10px;
    padding: 14px 14px 16px;
    margin-bottom: 4px;
}

// Accordion collapse transition
.equip-collapse-enter-active,
.equip-collapse-leave-active {
    transition: max-height 0.22s ease, opacity 0.18s ease;
    max-height: 800px;
    overflow: hidden;
    opacity: 1;
}
.equip-collapse-enter-from,
.equip-collapse-leave-to {
    max-height: 0;
    opacity: 0;
}

.feat-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 15px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.04);
    color: #888;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    white-space: nowrap;

    &:hover {
        border-color: rgba(255,255,255,0.22);
        background: rgba(255,255,255,0.07);
        color: #ccc;
    }

    &--on {
        border-color: $red;
        background: rgba($red, 0.15);
        color: #fff;

        .feat-badge-icon { color: $red; }
    }
}

.feat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    color: $text-dim;
    gap: 12px;
}

.feat-summary-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    background: rgba($red, 0.08);
    border: 1px solid rgba($red, 0.2);
    color: $red;
    font-size: 13px;
    font-weight: 600;
    margin-top: 16px;
}

.feat-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid rgba($red, 0.35);
    border-radius: 12px;
    color: rgba($red, 0.7);
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    padding: 2px 10px;
    cursor: pointer;
    margin-left: auto;
    transition: all 0.15s;
    &:hover { background: rgba($red, 0.1); color: $red; }
}

.feat-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: #0d0d0d;
    border: 1px solid $border;
    border-radius: 8px;
    padding: 0 12px;
    margin-bottom: 20px;
    transition: border-color 0.2s;
    &:focus-within { border-color: rgba($red, 0.4); }
}

.feat-search-icon { color: $text-dark; flex-shrink: 0; }

.feat-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: $text;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    padding: 10px 8px;
    &::placeholder { color: $text-dim; }
}

.feat-search-clear {
    background: transparent;
    border: none;
    color: $text-dark;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    &:hover { color: $red; }
}

:deep(.feat-hl) {
    background: rgba($red, 0.25);
    color: $text;
    border-radius: 2px;
    padding: 0 1px;
}

.photo-hints {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
}

.photo-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;

    &.ph-ok    { background: rgba(#4ade80, 0.08); border: 1px solid rgba(#4ade80, 0.2); color: #4ade80; }
    &.ph-warn  { background: rgba(#facc15, 0.08); border: 1px solid rgba(#facc15, 0.2); color: #facc15; }
    &.ph-error { background: rgba($red, 0.08);    border: 1px solid rgba($red, 0.2);    color: $red;     }
}

.submit-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(220,50,50,0.08);
    border: 1px solid rgba(220,50,50,0.22);
    border-radius: $r-sm;
    padding: 12px 16px;
    font-size: 13px;
    color: #e55;
    margin-bottom: 16px;
    .v-icon { flex-shrink: 0; }
}

.submit-error-inline {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #e55;
    max-width: 300px;
    .v-icon { flex-shrink: 0; }
}

.limit-error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 160, 0, 0.08);
    border: 1px solid rgba(255, 160, 0, 0.3);
    border-radius: $r-sm;
    padding: 12px 16px;
    flex: 1;
    margin-right: 12px;
    .v-icon { color: #f59e0b; flex-shrink: 0; }
}

.limit-error-text {
    flex: 1;
    strong { display: block; font-size: 13px; color: #f59e0b; margin-bottom: 2px; }
    span { font-size: 12px; color: $text-dim; line-height: 1.4; }
}

.limit-error-cta {
    flex-shrink: 0;
    padding: 8px 16px;
    background: #f59e0b;
    color: #000;
    border-radius: $r-sm;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    &:hover { opacity: 0.88; }
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

// ── Promo step ────────────────────────────────────────────────────────────────
.promo-step { padding-bottom: 0; }

.promo-plans-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 700px) { grid-template-columns: 1fr 1fr; }
}

.pp-card {
    background: #0a0a0a;
    border: 1.5px solid $border;
    border-radius: 12px;
    padding: 18px 16px;
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s, transform 0.15s;
    display: flex;
    flex-direction: column;
    gap: 8px;
    &:hover { border-color: rgba($red, 0.35); transform: translateY(-2px); }
    &.pp-selected { border-color: $red; background: rgba($red, 0.04); }
    &.pp-popular { border-color: rgba($red, 0.4); }
}

.pp-popular-badge {
    position: absolute; top: -9px; left: 50%; transform: translateX(-50%);
    background: $red; color: white; font-size: 9px; font-weight: 800;
    padding: 2px 8px; border-radius: 20px; white-space: nowrap; letter-spacing: 0.5px;
}

.pp-header { display: flex; align-items: center; gap: 8px; }
.pp-icon { color: $red; flex-shrink: 0; }
.pp-name { font-size: 14px; font-weight: 800; color: $text; }
.pp-badge-free {
    font-size: 9px; font-weight: 800; color: #4caf50;
    background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.3);
    padding: 2px 7px; border-radius: 20px; margin-left: auto;
}
.pp-price { font-size: 18px; font-weight: 900; color: $red; strong { font-size: 22px; } }
.pp-desc { font-size: 11px; color: $text-dim; line-height: 1.5; }
.pp-feats {
    list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 5px; flex: 1;
    li { display: flex; align-items: center; gap: 6px; font-size: 11px; color: $text-muted;
        .v-icon { color: #4caf50; flex-shrink: 0; }
    }
    .pp-feat-no { color: $text-dark; .v-icon { color: $text-dark; } }
}
.pp-days { display: flex; gap: 5px; margin-top: 4px; flex-wrap: wrap; }
.pp-day-btn {
    background: transparent; border: 1px solid $border; border-radius: 6px;
    color: $text-dim; font-size: 11px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 4px 10px; cursor: pointer; transition: all 0.15s;
    &.active { border-color: $red; background: rgba($red, 0.12); color: $text; }
    &:hover:not(.active) { border-color: $text-dim; color: $text; }
}
.pp-sel-bar {
    height: 3px; border-radius: 3px; background: transparent; margin-top: auto;
    .pp-selected & { background: $red; }
}

.promo-summary {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.ps-free-info {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #4caf50; font-weight: 500;
}

.ps-paid-info { display: flex; flex-direction: column; gap: 2px; }
.ps-plan-name { font-size: 13px; font-weight: 700; color: $text; }
.ps-plan-price { font-size: 20px; font-weight: 900; color: $red; }
.ps-original { text-decoration: line-through; color: $text-dim; font-size: 14px; font-weight: 400; margin-right: 6px; }
.ps-coupon-ok { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #4caf50; }

.ps-coupon-row { display: flex; flex-direction: column; gap: 5px; }
.ps-coupon-wrap { display: flex; gap: 6px; }
.ps-coupon-input {
    flex: 1; min-width: 0;
    background: #0d0d0d; border: 1px solid $border; border-radius: 8px;
    color: $text; font-size: 13px; font-family: 'Inter', sans-serif;
    padding: 8px 13px; outline: none;
    &::placeholder { color: $text-dark; }
    &:focus { border-color: rgba($red, 0.4); }
    &:disabled { opacity: 0.5; }
}
.ps-coupon-btn {
    background: transparent; border: 1px solid $border; border-radius: 8px;
    color: $text-muted; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
    padding: 8px 14px; cursor: pointer; white-space: nowrap; transition: all 0.15s;
    &:hover:not(:disabled) { border-color: $red; color: $text; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
}
.ps-coupon-error { font-size: 12px; color: #e55; }

// ── Smart form additions ──────────────────────────────────────────────────────
.cat-context-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba($red, 0.07);
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-sm;
    padding: 8px 14px;
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 20px;

    strong { color: $text; }
}

.ccb-icon { color: $red; flex-shrink: 0; }

.ccb-count {
    margin-left: auto;
    font-size: 11px;
    color: $text-dark;
}

.cat-note-bar {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: rgba(#f5a623, 0.06);
    border: 1px solid rgba(#f5a623, 0.2);
    border-radius: $r-sm;
    padding: 9px 14px;
    font-size: 12px;
    color: rgba(#f5a623, 0.9);
    margin-bottom: 20px;
    line-height: 1.5;
}

.cnb-icon { color: #f5a623; flex-shrink: 0; margin-top: 1px; }

.field-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-dark;
    margin-top: 5px;
    .v-icon { color: $text-dark; flex-shrink: 0; }
}

// ── Engine specs preview ───────────────────────────────────────────────────────
.engine-specs-preview {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: $r-sm;
    padding: 10px 14px;
    margin-top: 4px;
}

.esp-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $text-dark;
    margin-bottom: 8px;
    .v-icon { flex-shrink: 0; }
}

.esp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.esp-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;

    &--primary {
        background: rgba($red, 0.12);
        color: $red;
        border: 1px solid rgba($red, 0.25);
    }

    &--secondary {
        background: rgba(255,255,255,0.05);
        color: $text-muted;
        border: 1px solid rgba(255,255,255,0.1);
    }

    &--success {
        background: rgba(#4ade80, 0.1);
        color: #4ade80;
        border: 1px solid rgba(#4ade80, 0.2);
    }
}

.ai-hints {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}
.ai-hints-label {
    font-size: 11px;
    color: $text-dark;
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
    .v-icon { color: $red; }
}
.ai-hint-chip {
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    padding: 3px 10px;
    border-radius: 100px;
    border: 1px solid rgba($red, 0.4);
    background: rgba($red, 0.06);
    color: $text;
    cursor: pointer;
    transition: all 0.15s;
    &:hover {
        border-color: $red;
        background: rgba($red, 0.15);
        color: $text;
    }
}

.title-suggest-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #0a0a0a;
    border: 1px solid rgba($red, 0.2);
    border-radius: $r-md;
    padding: 14px 18px;
    margin-top: 16px;
    margin-bottom: 4px;
}

.tsc-left {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 1;
    min-width: 0;
}

.tsc-icon { color: $red; flex-shrink: 0; margin-top: 2px; }

.tsc-label {
    font-size: 11px;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 3px;
}

.tsc-title {
    font-size: 14px;
    font-weight: 700;
    color: $text;
}

.tsc-use-btn {
    background: rgba($red, 0.12);
    border: 1px solid rgba($red, 0.35);
    border-radius: $r-sm;
    color: $red;
    font-size: 12px;
    font-weight: 700;
    padding: 7px 16px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    transition: all 0.15s;
    &:hover { background: rgba($red, 0.22); border-color: rgba($red, 0.6); }
}

.tsc-used {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #4caf50;
    white-space: nowrap;
    .v-icon { color: #4caf50; }
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
.img-thumb--existing { opacity: 1; }

.edit-summary {
    background: #0a0a0a;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
}

.edit-summary-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.es-icon { color: $red; flex-shrink: 0; margin-top: 2px; }
.es-label { font-size: 11px; color: $text-dim; text-transform: uppercase; letter-spacing: 0.4px; }
.es-val { font-size: 15px; font-weight: 700; color: $text; margin-top: 2px; }

.btn-publish-free {
    display: flex; align-items: center; gap: 8px;
    background: #2d7a3a; border: none; border-radius: $r-sm;
    color: white; font-size: 14px; font-weight: 700;
    padding: 11px 28px; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-pay {
    display: flex; align-items: center; gap: 8px;
    background: $red; border: none; border-radius: $r-sm;
    color: white; font-size: 14px; font-weight: 700;
    padding: 11px 28px; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── Extra fields ──────────────────────────────────────────────────────────────
.extra-fields-wrap { margin-top: 8px; }

.full-width { grid-column: 1 / -1; }

// Color picker (extraField type: color-picker)
.ef-color-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    color: $text-dim;
    letter-spacing: 0.2px;
}

.ef-color-name {
    font-size: 10px;
    font-weight: 500;
    color: $red;
    text-transform: none;
    letter-spacing: 0;
}

.ef-color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    padding: 4px 0;
}

.ef-color-swatch {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: transform 0.12s, border-color 0.12s, box-shadow 0.12s;
    outline: none;

    &:hover { transform: scale(1.18); }

    &.active {
        border-color: $red;
        box-shadow: 0 0 0 2px rgba($red, 0.35);
        transform: scale(1.12);
    }

    &--clear {
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-dim;

        &.active {
            border-color: $red;
            color: $red;
            box-shadow: 0 0 0 2px rgba($red, 0.35);
        }

        &:hover { transform: scale(1.1); color: $text; }
    }
}

.radio-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.radio-opt {
    display: flex;
    align-items: center;
    padding: 9px 18px;
    background: rgba(255,255,255,0.03);
    border: 1.5px solid $border;
    border-radius: $r-sm;
    font-size: 13px;
    font-weight: 500;
    color: $text-muted;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;

    &:hover { border-color: rgba($red, 0.3); color: $text; }
    &.active { background: rgba($red, 0.1); border-color: rgba($red, 0.5); color: $red; font-weight: 700; }
}

.input-unit-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.input-unit-badge {
    position: absolute;
    right: 12px;
    font-size: 12px;
    font-weight: 600;
    color: $text-dark;
    pointer-events: none;
    background: #0c0c0c;
    padding-left: 4px;
}

.field--bool { display: flex; align-items: center; }

.bool-check {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 13px;
    color: $text-muted;
    padding: 8px 0;
    user-select: none;

    &.active { color: $text; }
}

.bool-box {
    width: 18px;
    height: 18px;
    min-width: 18px;
    border-radius: 4px;
    border: 1.5px solid $border;
    background: #0c0c0c;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    .v-icon { color: $red; }

    .bool-check.active & { border-color: $red; background: rgba($red, 0.1); }
}

.bool-stack {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

// ── Title input ───────────────────────────────────────────────────────────────
.title-input-wrap {
    position: relative;
}

.title-char-count {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: $text-dark;
    pointer-events: none;
    background: #0c0c0c;
    padding-left: 4px;

    &.warn { color: #f5a623; }
}

.flabel-opt {
    font-size: 10px;
    font-weight: 400;
    color: $text-dark;
    margin-left: 6px;
    text-transform: none;
    letter-spacing: 0;
}

// ── Negotiable price toggle ───────────────────────────────────────────────────
.nego-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    cursor: pointer;
    font-size: 12px;
    color: $text-dark;
    user-select: none;
    transition: color 0.15s;

    &.active { color: $text-muted; }
}

.nego-box {
    width: 16px;
    height: 16px;
    min-width: 16px;
    border-radius: 3px;
    border: 1.5px solid $border;
    background: #0c0c0c;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    .v-icon { color: $red; }

    .nego-toggle.active & { border-color: $red; background: rgba($red, 0.1); }
}

// ── Description area ─────────────────────────────────────────────────────────
.desc-wrap {
    position: relative;
}

.desc-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #0a0a0a;
    border: 1px solid $border;
    border-top: none;
    border-radius: 0 0 $r-sm $r-sm;
    margin-top: -1px;
}

.desc-tips {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.desc-tip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-dark;
}

.tip-icon { color: rgba($red, 0.5); }

.desc-counter {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: $text-dark;
    white-space: nowrap;

    &.poor { color: #e55; }
    &.ok { color: #f5a623; }
    &.good { color: #60a5fa; }
    &.great { color: #4ade80; }
}

.desc-max { font-weight: 400; color: $text-dark; font-size: 11px; }

.desc-qlabel {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(255,255,255,0.04);

    .desc-counter.poor & { background: rgba(#e55, 0.12); color: #e55; }
    .desc-counter.ok & { background: rgba(#f5a623, 0.12); color: #f5a623; }
    .desc-counter.good & { background: rgba(#60a5fa, 0.12); color: #60a5fa; }
    .desc-counter.great & { background: rgba(#4ade80, 0.12); color: #4ade80; }
}

.desc-wrap .ftextarea {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

// ── Writing tips panel ────────────────────────────────────────────────────────
.writing-tips {
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: $r-sm;
    padding: 14px 18px;
    margin-bottom: 20px;
}

.wt-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 10px;
    .v-icon { color: #f5a623; }
}

.wt-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}

.wt-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: $text-dark;
    .v-icon { color: rgba($red, 0.5); flex-shrink: 0; }
}

// ── History step ──────────────────────────────────────────────────────────────
.hist-section {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 20px 20px 16px;
    margin-bottom: 16px;
}

.hist-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    .v-icon { color: $red; }
}

.hist-quality-tip {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: rgba(45, 122, 58, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.15);
    border-radius: $r-md;
    padding: 16px 20px;
    margin-top: 4px;
}

.hq-icon { color: #4ade80; flex-shrink: 0; margin-top: 2px; }
.hq-title { font-size: 13px; font-weight: 700; color: $text; margin-bottom: 4px; }
.hq-sub { font-size: 12px; color: $text-dark; line-height: 1.5; }

// ── Publish summary card ──────────────────────────────────────────────────────
.pub-summary-card {
    background: #080808;
    border: 1px solid $border;
    border-radius: $r-md;
    padding: 20px;
    margin-bottom: 24px;
}

.psc-title {
    font-size: 13px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

.psc-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.psc-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
}

.psc-icon { color: $red; flex-shrink: 0; }

.psc-label {
    color: $text-dark;
    min-width: 90px;
    flex-shrink: 0;
}

.psc-val {
    color: $text;
    font-weight: 600;
    flex: 1;
}

.psc-price { color: $red; }

.psc-nego {
    display: inline-block;
    margin-left: 8px;
    font-size: 11px;
    font-weight: 600;
    background: rgba($red, 0.12);
    color: rgba($red, 0.8);
    padding: 1px 8px;
    border-radius: 20px;
}

.psc-vin {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    letter-spacing: 0.5px;
    color: $text-muted;
}

.psc-score {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.psc-score-bar {
    height: 5px;
    background: #1a1a1a;
    border-radius: 3px;
    overflow: hidden;
}

.psc-score-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;

    &.fill-great { background: #4ade80; }
    &.fill-good { background: #60a5fa; }
    &.fill-poor { background: $red; }
}

.psc-score-label {
    font-size: 12px;
    color: $text-dark;
}

.col-great { color: #4ade80; font-weight: 700; }
.col-good { color: #60a5fa; font-weight: 700; }
.col-poor { color: $red; font-weight: 700; }

// ── Success screen ────────────────────────────────────────────────────────────
.success-screen {
    position: fixed;
    inset: 0;
    background: $bg;
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    overflow-y: auto;
}

.success-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
    max-width: 520px;
    width: 100%;
    position: relative;
    animation: success-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes success-pop {
    from { opacity: 0; transform: scale(0.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);     }
}

.success-confetti {
    position: absolute;
    inset: -40px;
    pointer-events: none;
    overflow: hidden;
}

.confetti-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    opacity: 0;
    animation: confetti-fall 1.8s ease-out calc(var(--i) * 0.08s) both;

    &:nth-child(1)  { left:  8%; background: $red;      top: -10px; transform: rotate(20deg); }
    &:nth-child(2)  { left: 20%; background: #ffd700;   top: -10px; transform: rotate(-30deg); border-radius: 50%; }
    &:nth-child(3)  { left: 35%; background: #4caf50;   top: -10px; transform: rotate(45deg); }
    &:nth-child(4)  { left: 50%; background: $red;      top: -10px; border-radius: 50%; }
    &:nth-child(5)  { left: 65%; background: #2196f3;   top: -10px; transform: rotate(-20deg); }
    &:nth-child(6)  { left: 80%; background: #ffd700;   top: -10px; transform: rotate(60deg); }
    &:nth-child(7)  { left: 92%; background: $red;      top: -10px; border-radius: 50%; }
    &:nth-child(8)  { left: 14%; background: #e040fb;   top: -10px; transform: rotate(-45deg); }
    &:nth-child(9)  { left: 28%; background: #ff5722;   top: -10px; }
    &:nth-child(10) { left: 58%; background: #26c6da;   top: -10px; border-radius: 50%; }
    &:nth-child(11) { left: 72%; background: #ec407a;   top: -10px; transform: rotate(30deg); }
    &:nth-child(12) { left: 44%; background: #66bb6a;   top: -10px; transform: rotate(-15deg); border-radius: 50%; }
}

@keyframes confetti-fall {
    0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
    100% { opacity: 0; transform: translateY(200px) rotate(720deg) scale(0.5); }
}

.success-logo {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: 6px;
    color: $text;
    span { color: $red; }
}

.success-icon-wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: rgba(76,175,80,0.1);
    border: 2px solid rgba(76,175,80,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: icon-pulse 2s ease-in-out infinite;
}

.success-icon { color: #4caf50; }

@keyframes icon-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.25); }
    50%       { box-shadow: 0 0 0 16px rgba(76,175,80,0); }
}

.success-title {
    font-size: 28px;
    font-weight: 900;
    color: $text;
    line-height: 1.2;
    margin: 0;

    @include respond-to(sm) { font-size: 22px; }
}

.success-desc {
    font-size: 15px;
    color: $text-muted;
    line-height: 1.8;
    margin: 0;
    max-width: 420px;
}

.success-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 380px;
}

.sact-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 15px 24px;
    border-radius: $r-md;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s, border-color 0.2s, color 0.2s;

    &--primary {
        background: $red;
        color: white;
        border: none;
        &:hover { opacity: 0.88; }
    }
    &--secondary {
        background: transparent;
        color: $text;
        border: 1px solid rgba(255,255,255,0.15);
        &:hover { border-color: rgba(255,255,255,0.3); }
    }
    &--ghost {
        background: transparent;
        color: $text-dim;
        border: 1px solid rgba(255,255,255,0.06);
        font-size: 14px;
        font-weight: 500;
        padding: 12px 20px;
        &:hover { color: $text-muted; }
    }
}

.success-tip {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: $text-dim;
    background: rgba($red, 0.06);
    border: 1px solid rgba($red, 0.15);
    border-radius: $r-md;
    padding: 10px 16px;
    max-width: 380px;
    width: 100%;
    text-align: left;
}

.tip-icon { color: rgba($red, 0.7); flex-shrink: 0; }

.tip-link {
    color: $red;
    font-weight: 600;
    &:hover { text-decoration: underline; }
}

// Transition for success screen
.success-fade-enter-active { transition: opacity 0.3s ease; }
.success-fade-leave-active { transition: opacity 0.2s ease; }
.success-fade-enter-from,
.success-fade-leave-to { opacity: 0; }

// ── Vehicle history step ───────────────────────────────────────────────────────
.verified-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @include respond-to(sm) { grid-template-columns: 1fr; }
}

.verified-item {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 20px;
    transition: border-color 0.2s;

    &--filled {
        border-color: rgba($red, 0.3);
        background: rgba($red, 0.03);
    }
}

.vi-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.vi-icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dim;
    flex-shrink: 0;
    transition: all 0.2s;

    &--done {
        background: rgba($red, 0.15);
        border-color: rgba($red, 0.3);
        color: $red;
    }
}

.vi-texts { flex: 1; }
.vi-title { font-size: 14px; font-weight: 600; color: $text; }
.vi-desc { font-size: 12px; color: $text-dim; margin-top: 3px; line-height: 1.4; }

.vi-badge {
    font-size: 10px;
    font-weight: 700;
    color: $red;
    background: rgba($red, 0.1);
    border: 1px solid rgba($red, 0.2);
    border-radius: 5px;
    padding: 2px 7px;
    white-space: nowrap;
    flex-shrink: 0;
}

.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.toggle-label {
    font-size: 13px;
    color: $text-dim;
}

.toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &.active {
        background: $red;
        border-color: $red;
        .toggle-knob { transform: translateX(20px); }
    }
}

.toggle-knob {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
}

.cverified-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    background: linear-gradient(135deg, rgba($red, 0.06) 0%, rgba($red, 0.02) 100%);
    border: 1px solid rgba($red, 0.2);
    border-radius: 14px;
    padding: 18px 24px;
}

.cvs-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba($red, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $red;
    flex-shrink: 0;
}

.cvs-title { font-size: 14px; font-weight: 700; color: $text; letter-spacing: 1px; text-transform: uppercase; }
.cvs-desc { font-size: 12px; color: $text-dim; margin-top: 2px; }

.cvs-score {
    margin-left: auto;
    font-size: 28px;
    font-weight: 900;
    color: $red;
}

// ── Premium score panel (right sidebar) ───────────────────────────────────────
.score-panel {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
}

.sp-ring-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 12px;
}

.sp-ring {
    width: 80px;
    height: 80px;
    transform: rotate(-90deg);
}

.sp-track {
    fill: none;
    stroke: rgba(255,255,255,0.08);
    stroke-width: 8;
}

.sp-fill {
    fill: none;
    stroke: $red;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 214;
    transition: stroke-dashoffset 0.5s ease;
}

.sp-num {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 900;
    color: $text;
}

.sp-label {
    text-align: center;
    font-size: 11px;
    color: $text-dim;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
}

.sp-tier {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 6px;
    margin-bottom: 16px;

    &--gold   { background: rgba(#ffd700, 0.12); color: #ffd700; border: 1px solid rgba(#ffd700, 0.25); }
    &--silver { background: rgba($red, 0.10); color: $red; border: 1px solid rgba($red, 0.2); }
    &--bronze { background: rgba(255,255,255,0.05); color: $text-dim; border: 1px solid rgba(255,255,255,0.1); }
}

.sp-tips {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.sp-tip {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-dim;

    .v-icon { color: rgba($red, 0.7); }
}

.sp-missing {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.07);
}
.sp-missing-title {
    font-size: 10px;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}
.sp-missing-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $text-muted;
    padding: 3px 0;
}
.sp-premium-verified {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #FFD700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

// ── Preview card (step 7) ──────────────────────────────────────────────────────
.form-content .preview-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    overflow: hidden;
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    padding: 0;

    @include respond-to(sm) { flex-direction: column; }
}

.prev-img-wrap {
    width: 45%;
    flex-shrink: 0;
    position: relative;

    @include respond-to(sm) { width: 100%; }
}

.prev-main-img {
    width: 100%;
    height: 100%;
    min-height: 280px;
    object-fit: cover;
    display: block;
}

.prev-img-placeholder {
    width: 100%;
    min-height: 280px;
    background: rgba(255,255,255,0.02);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: $text-dark;
    font-size: 13px;
}

.prev-img-count {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
}

.prev-body {
    flex: 1;
    padding: 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.prev-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.prev-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 3px 9px;
    border-radius: 4px;
    text-transform: uppercase;

    &--dealer { background: rgba(#4fc3f7, 0.15); color: #4fc3f7; }
    &--cat { background: rgba($red, 0.12); color: $red; border: 1px solid rgba($red, 0.2); }
}

.prev-title {
    font-size: 22px;
    font-weight: 800;
    color: $text;
    line-height: 1.2;
}

.prev-price {
    font-size: 28px;
    font-weight: 900;
    color: $red;
    letter-spacing: -0.5px;
}

.prev-nego {
    font-size: 12px;
    color: $text-dim;
    margin-top: -6px;
}

.prev-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    span {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: $text-dim;
        .v-icon { color: $red; }
    }
}

.prev-desc {
    font-size: 13px;
    color: $text-dim;
    line-height: 1.6;
}

.prev-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
}

.prev-feat-tag {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 3px 9px;
    font-size: 11px;
    color: $text-dim;

    &--more { color: $red; border-color: rgba($red, 0.2); }
}

.preview-publish-row {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 0;
}

.ppr-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.ppr-score-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: conic-gradient($red calc(var(--score) * 1%), rgba(255,255,255,0.05) 0);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        background: $bg;
    }
}

.ppr-score-num {
    position: relative;
    z-index: 1;
    font-size: 16px;
    font-weight: 900;
    color: $text;
}

.ppr-score-label {
    font-size: 12px;
    color: $text-dim;
    margin-top: 4px;
}

.ppr-score-tier {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-top: 4px;
    padding: 2px 8px;
    border-radius: 4px;

    &.tier--gold { background: rgba(234,179,8,0.15); color: #eab308; }
    &.tier--silver { background: rgba(148,163,184,0.15); color: #94a3b8; }
    &.tier--bronze { background: rgba(180,83,9,0.12); color: #b45309; }
}

.summary-checklist {
    margin-top: 20px;
    padding: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid $border;
    border-radius: 10px;
}

.summary-checklist-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $text;
    margin-bottom: 12px;
}

.summary-factor {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    font-size: 13px;
    color: $text-muted;
    border-bottom: 1px solid rgba(255,255,255,0.04);

    &:last-child { border-bottom: none; }
    &--done { color: $text; }
}

.summary-tips {
    margin-top: 12px;
    padding: 14px 16px;
    background: rgba(234,179,8,0.06);
    border: 1px solid rgba(234,179,8,0.15);
    border-radius: 10px;
}

.summary-tips-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #eab308;
    margin-bottom: 10px;
}

.summary-tip-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    color: $text-muted;
    padding: 4px 0;
}

// ── AI Photo Quality Analysis ─────────────────────────────────────────────────
.photo-ai-section {
    margin-top: 16px;
    padding: 12px;
    background: rgba(var(--v-theme-surface-variant, 148, 163, 184), 0.12);
    border-radius: 10px;
    border: 1px solid rgba(var(--v-theme-primary, 99, 102, 241), 0.15);
}

.photo-ai-title {
    font-size: 12px;
    font-weight: 600;
    color: $text-dim;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.photo-ai-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);

    &:last-child {
        border-bottom: none;
    }
}

.photo-ai-thumb {
    position: relative;
    flex-shrink: 0;
    width: 52px;
    height: 40px;
    border-radius: 6px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.photo-ai-num {
    position: absolute;
    bottom: 2px;
    right: 3px;
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    background: rgba(0,0,0,0.55);
    border-radius: 3px;
    padding: 1px 3px;
}

.photo-ai-content {
    flex: 1;
    min-width: 0;
}

.photo-ai-loading {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $text-dim;
    margin-bottom: 4px;
}

.photo-ai-score-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.photo-ai-label {
    font-size: 11px;
    color: $text-dim;
}

.photo-ai-summary {
    font-size: 11px;
    color: $text-dim;
    margin: 0 0 4px;
    line-height: 1.4;
}

.photo-ai-issues {
    font-size: 11px;
    color: #f87171;
    padding-left: 14px;
    margin: 0 0 4px;

    li {
        margin-bottom: 2px;
    }
}

.photo-ai-btn {
    margin-top: 4px;
    font-size: 11px !important;
}

// ── "Inne" (Other) Category Custom Form ──────────────────────────────────────
.other-param-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    align-items: center;
}

.other-param-remove {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #f87171;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;

    &:hover {
        background: rgba(248, 113, 113, 0.12);
    }
}

.other-param-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    background: none;
    border: 1px dashed rgba(255,255,255,0.2);
    border-radius: 6px;
    padding: 6px 12px;
    cursor: pointer;
    color: $text-dim;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: rgba(99, 102, 241, 0.5);
        color: $text;
    }
}

.other-cat-success {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: rgba(74, 222, 128, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.2);
    border-radius: 8px;
    color: #4ade80;
}

.bool-checks-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .bool-check {
        padding: 7px 14px;
        border: 1.5px solid $border;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        transition: border-color 0.15s, background 0.15s;

        &.active {
            border-color: rgba($red, 0.5);
            background: rgba($red, 0.08);
            color: $text;
        }
    }
}

.yt-preview {
    margin-top: 12px;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: #000;

    .yt-iframe {
        width: 100%;
        height: 100%;
        display: block;
    }
}

.desc-phone-warn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    margin-top: 8px;
    background: rgba(234, 179, 8, 0.08);
    border: 1px solid rgba(234, 179, 8, 0.25);
    border-radius: 8px;
    color: #eab308;
    font-size: 12px;
}

// ── PDF Brochure ──────────────────────────────────────────────────────────────
.pdf-section {
    margin-top: 20px;
    padding: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid $border;
    border-radius: 10px;
}

.pdf-section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $text;
    margin-bottom: 4px;
}

.pdf-section-desc {
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 12px;
}

.pdf-uploaded {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(229,62,62,0.06);
    border: 1px solid rgba(229,62,62,0.2);
    border-radius: 8px;
}

.pdf-info {
    flex: 1;
    min-width: 0;
}

.pdf-name {
    font-size: 13px;
    color: $text;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pdf-view-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: $red;
    text-decoration: none;
    margin-top: 2px;
    &:hover { text-decoration: underline; }
}

.pdf-pending-label {
    font-size: 11px;
    color: $text-muted;
    margin-top: 2px;
}

.pdf-remove-btn {
    background: none;
    border: none;
    color: $text-muted;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    &:hover { color: $text; background: rgba(255,255,255,0.06); }
}

.pdf-upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border: 1.5px dashed $border;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: $text-muted;
    transition: border-color 0.15s, color 0.15s;
    &:hover { border-color: rgba($red, 0.4); color: $text; }
    &--loading { opacity: 0.6; pointer-events: none; }
}

.pdf-error {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 12px;
    color: #f87171;
}
</style>
