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

        <!-- ── Top bar ──────────────────────────────────────────────────────── -->
        <div class="top-bar">
            <div class="top-left">
                <img src="/carizo-logo.svg" alt="CARIZO" class="tl-logo" />
                <button class="back-btn" @click="navigateTo('/dashboard')">
                    <v-icon icon="mdi-arrow-left" size="16" />
                    Wróć do panelu
                </button>
            </div>
            <div class="top-center">
                <span class="tc-label">{{ isEdit ? 'Edytuj ogłoszenie' : 'Dodaj ogłoszenie' }}</span>
                <span class="tc-step">Krok {{ currentStep + 1 }} z {{ steps.length }}</span>
            </div>
            <div class="top-right">
                <button class="btn-draft" :class="{ 'btn-draft--saved': draftSaved }" @click="saveDraft">
                    <v-icon :icon="draftSaved ? 'mdi-check' : 'mdi-content-save-outline'" size="16" />
                    {{ draftSaved ? 'Zapisano!' : 'Szkic' }}
                </button>
                <button class="btn-close" @click="navigateTo('/my-adverts')">
                    <v-icon icon="mdi-close" size="18" />
                </button>
            </div>
        </div>

        <!-- ── Page body ─────────────────────────────────────────────────────── -->
        <div class="page-body">

            <!-- ── Left sidebar ──────────────────────────────────────────────── -->
            <aside class="left-sidebar">

                <!-- Steps nav -->
                <nav class="steps-nav">
                    <div v-for="(step, i) in steps" :key="i"
                        class="step-item"
                        :class="{ 'step-active': currentStep === i, 'step-done': currentStep > i }"
                        @click="currentStep > i && (currentStep = i)">
                        <div class="step-num">
                            <v-icon v-if="currentStep > i" icon="mdi-check" size="12" />
                            <span v-else>{{ i + 1 }}</span>
                        </div>
                        <div class="step-info">
                            <div class="step-name">{{ step.name }}</div>
                            <div class="step-desc">{{ step.desc }}</div>
                        </div>
                        <div v-if="currentStep > i" class="step-done-line" />
                    </div>
                </nav>

                <!-- Premium Score panel -->
                <div class="score-panel">
                    <div class="score-panel-head">
                        <v-icon icon="mdi-chart-arc" size="14" class="sp-head-icon" />
                        <span>Premium Score</span>
                    </div>
                    <div class="score-circle-wrap">
                        <svg viewBox="0 0 120 120" width="110" height="110">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="9" />
                            <circle cx="60" cy="60" r="52" fill="none"
                                :stroke="adScore >= 80 ? '#22c55e' : adScore >= 55 ? '#f59e0b' : '#8B0D1D'"
                                stroke-width="9"
                                stroke-linecap="round"
                                :stroke-dasharray="`${scoreArc} 326.7`"
                                transform="rotate(-90 60 60)"
                                style="transition: stroke-dasharray 0.6s ease" />
                        </svg>
                        <div class="score-num-wrap">
                            <span class="score-val">{{ adScore }}</span>
                            <span class="score-denom">/100</span>
                        </div>
                    </div>
                    <div class="score-badge" :class="adScore >= 80 ? 'sb-great' : adScore >= 55 ? 'sb-ok' : 'sb-low'">
                        {{ adScore >= 80 ? 'Doskonałe' : adScore >= 55 ? 'Dobre' : 'Uzupełnij dane' }}
                    </div>
                    <div class="score-checklist">
                        <div v-for="sf in scoreFactors" :key="sf.label" class="sc-row" :class="{ 'sc-done': sf.done }">
                            <v-icon :icon="sf.done ? 'mdi-check-circle' : 'mdi-circle-outline'" size="13" class="sc-icon" />
                            <span>{{ sf.label }}</span>
                        </div>
                    </div>
                    <div v-if="scoreTips.length" class="score-tips">
                        <div v-for="tip in scoreTips" :key="tip" class="st-tip">
                            <v-icon icon="mdi-lightbulb-on-outline" size="12" class="st-icon" />
                            {{ tip }}
                        </div>
                    </div>
                </div>

            </aside>

            <!-- ── Center: step content ───────────────────────────────────────── -->
            <main class="center-area">

                <!-- Error banner -->
                <transition name="fade-err">
                    <div v-if="stepError" class="step-error-banner">
                        <v-icon icon="mdi-alert-circle-outline" size="16" />
                        {{ stepError }}
                    </div>
                </transition>
                <transition name="fade-err">
                    <div v-if="error" class="step-error-banner step-error-banner--hard">
                        <v-icon icon="mdi-alert-circle" size="16" />
                        {{ error }}
                        <button class="seb-close" @click="error = ''"><v-icon icon="mdi-close" size="14" /></button>
                    </div>
                </transition>

                <!-- ── Step panels ──────────────────────────────────────────── -->
                <transition name="step-fade" mode="out-in">

                <!-- ══ Step 0 — Kategoria ═══════════════════════════════════════ -->
                <div v-if="currentStep === 0" key="s0" class="step-panel">
                    <div class="step-head">
                        <h2>Wybierz kategorię</h2>
                        <p>Zaznacz typ pojazdu — formularz dostosuje się automatycznie.</p>
                    </div>
                    <div class="cat-grid">
                        <button
                            v-for="cat in advertCategories" :key="cat.id"
                            type="button"
                            class="cat-card"
                            :class="{ 'cat-card--active': form.categoryId === cat.id }"
                            @click="onCategory(cat.id)">
                            <div class="cat-card-icon">
                                <v-icon :icon="cat.iconName || 'mdi-car-outline'" size="28" />
                            </div>
                            <div class="cat-card-name">{{ cat.name }}</div>
                            <div class="cat-card-count">{{ cat.advertCount?.toLocaleString('pl') ?? '0' }} ogłoszeń</div>
                            <div v-if="form.categoryId === cat.id" class="cat-card-check">
                                <v-icon icon="mdi-check" size="14" />
                            </div>
                        </button>
                    </div>
                    <transition name="fade-err">
                        <div v-if="selectedCategory && categoryConfig.categoryNote" class="cat-note">
                            <v-icon icon="mdi-lightbulb-outline" size="14" />
                            {{ categoryConfig.categoryNote }}
                        </div>
                    </transition>
                </div>

                <!-- ══ Step 1 — Dane pojazdu ═════════════════════════════════════ -->
                <div v-else-if="currentStep === 1" key="s1" class="step-panel">
                    <div class="step-head">
                        <h2>Dane pojazdu</h2>
                        <p>Podaj dane techniczne i identyfikacyjne pojazdu.</p>
                    </div>

                    <div class="glass-card">
                        <div class="gc-section-title">Identyfikacja</div>
                        <div class="fields-grid">

                            <!-- Brand -->
                            <div v-if="isFieldVisible('brand')" class="field">
                                <label class="flabel">
                                    {{ categoryConfig.brandLabel ?? 'Marka' }}
                                    <span v-if="isFieldRequired('brand')" class="req">*</span>
                                </label>
                                <template v-if="categoryConfig.brandFieldType === 'text'">
                                    <input v-model="brandTextInput" type="text" class="finput"
                                        :placeholder="`Wpisz ${(categoryConfig.brandLabel ?? 'markę').toLowerCase()}`" />
                                </template>
                                <template v-else>
                                    <SmartSelect v-model="form.brandId" :options="brandOptions"
                                        :placeholder="`Wybierz ${categoryConfig.brandLabel ?? 'markę'}`"
                                        search-placeholder="marki" prefix-icon="mdi-car-outline" @change="onBrand" />
                                </template>
                                <div v-if="categoryConfig.brandHint" class="field-hint">
                                    <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.brandHint }}
                                </div>
                            </div>

                            <!-- Model -->
                            <div v-if="isFieldVisible('model')" class="field">
                                <label class="flabel">
                                    {{ categoryConfig.modelLabel ?? 'Model' }}
                                    <span v-if="isFieldRequired('model')" class="req">*</span>
                                </label>
                                <template v-if="categoryConfig.brandFieldType === 'text'">
                                    <input v-model="modelTextInput" type="text" class="finput"
                                        :placeholder="`Wpisz ${(categoryConfig.modelLabel ?? 'model').toLowerCase()}`" />
                                </template>
                                <template v-else>
                                    <SmartSelect v-model="form.modelId" :options="modelOptions"
                                        :placeholder="`Wybierz ${categoryConfig.modelLabel ?? 'model'}`"
                                        search-placeholder="modele" :disabled="!form.brandId" @change="onModel" />
                                    <div class="field-hint">
                                        <template v-if="!form.brandId">
                                            <v-icon icon="mdi-arrow-up-left" size="12" />Najpierw wybierz {{ categoryConfig.brandLabel ?? 'markę' }}
                                        </template>
                                        <template v-else-if="models.length">
                                            <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.modelHint ?? `${models.length} modeli dla ${brandName}` }}
                                        </template>
                                    </div>
                                </template>
                            </div>

                            <!-- Generation -->
                            <div v-if="isFieldVisible('generation') && generations.length" class="field">
                                <label class="flabel">Generacja / wersja</label>
                                <SmartSelect v-model="form.generationId" :options="generationOptions"
                                    placeholder="Wybierz generację (opcjonalnie)"
                                    search-placeholder="generacji" :disabled="!form.modelId" @change="onGen" />
                            </div>

                            <!-- Engine version -->
                            <div v-if="isFieldVisible('generation') && engines.length" class="field">
                                <label class="flabel">Wersja silnika</label>
                                <SmartSelect v-model="form.engineVersionId" :options="engineOptions"
                                    placeholder="Wybierz wersję silnika (opcjonalnie)"
                                    prefix-icon="mdi-engine-outline" search-placeholder="wersji silnika" />
                            </div>

                            <!-- Year -->
                            <div class="field">
                                <label class="flabel">{{ categoryConfig.yearLabel ?? 'Rok produkcji' }} <span class="req">*</span></label>
                                <div class="input-icon-wrap">
                                    <v-icon icon="mdi-calendar-outline" class="input-prefix" size="16" />
                                    <input v-model.number="form.year" type="number" class="finput has-prefix"
                                        placeholder="np. 2020" min="1900" :max="new Date().getFullYear()" />
                                </div>
                            </div>

                            <!-- Fuel type -->
                            <div v-if="isFieldVisible('fuelType')" class="field">
                                <label class="flabel">Rodzaj paliwa <span v-if="isFieldRequired('fuelType')" class="req">*</span></label>
                                <SmartSelect v-model="form.fuelTypeId" :options="fuelTypeOptions"
                                    placeholder="Wybierz rodzaj paliwa" prefix-icon="mdi-gas-station-outline" />
                            </div>

                            <!-- Engine capacity -->
                            <div v-if="isFieldVisible('engine')" class="field">
                                <label class="flabel">{{ categoryConfig.engineLabel ?? 'Pojemność silnika (cm³)' }}</label>
                                <input v-model.number="form.engineCapacity" type="number" class="finput"
                                    :placeholder="categoryConfig.engineHint ?? 'np. 1995'" />
                                <div v-if="categoryConfig.engineHint" class="field-hint">
                                    <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.engineHint }}
                                </div>
                            </div>

                            <!-- Power -->
                            <div v-if="isFieldVisible('power')" class="field">
                                <label class="flabel">{{ categoryConfig.powerLabel ?? 'Moc (KM)' }}</label>
                                <input v-model.number="form.power" type="number" class="finput" placeholder="np. 150" />
                            </div>

                            <!-- Gearbox -->
                            <div v-if="isFieldVisible('gearbox')" class="field">
                                <label class="flabel">Skrzynia biegów</label>
                                <SmartSelect v-model="form.gearboxId" :options="gearboxOptions"
                                    placeholder="Wybierz skrzynię biegów" prefix-icon="mdi-car-shift-pattern" />
                            </div>

                            <!-- Mileage -->
                            <div v-if="isFieldVisible('mileage')" class="field">
                                <label class="flabel">
                                    {{ categoryConfig.mileageLabel ?? 'Przebieg (km)' }}
                                    <span v-if="isFieldRequired('mileage')" class="req">*</span>
                                </label>
                                <div class="input-icon-wrap">
                                    <v-icon :icon="categoryConfig.mileageLabel?.includes('mth') ? 'mdi-timer-outline' : 'mdi-speedometer'"
                                        class="input-prefix" size="16" />
                                    <input v-model.number="form.mileage" type="number" class="finput has-prefix"
                                        :placeholder="categoryConfig.mileageLabel?.includes('mth') ? 'np. 5 000' : 'np. 100 000'" />
                                </div>
                                <div v-if="categoryConfig.mileageHint" class="field-hint">
                                    <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.mileageHint }}
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Category-specific extra fields -->
                    <transition name="fade-err">
                        <div v-if="categoryConfig.extraFields?.length" class="glass-card" style="margin-top:16px">
                            <div class="gc-section-title">Szczegóły kategorii</div>
                            <div class="fields-grid">
                                <template v-for="ef in categoryConfig.extraFields" :key="ef.key">
                                    <div v-if="ef.type === 'radio'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <div class="radio-group">
                                            <label v-for="opt in ef.options" :key="opt.value" class="radio-opt"
                                                :class="{ active: extras[ef.key] === opt.value }">
                                                <input type="radio" :name="ef.key" :value="opt.value" v-model="extras[ef.key]" hidden />
                                                {{ opt.label }}
                                            </label>
                                        </div>
                                    </div>
                                    <div v-else-if="ef.type === 'select'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <SmartSelect :model-value="extras[ef.key]" @update:model-value="extras[ef.key] = $event"
                                            :options="(ef.options ?? []).map(o => ({ value: o.value, label: o.label }))"
                                            :placeholder="`Wybierz ${ef.label.toLowerCase()}`" />
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>
                                    <div v-else-if="ef.type === 'number'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <div class="input-unit-wrap">
                                            <input v-model.number="extras[ef.key]" type="number" class="finput" :placeholder="ef.placeholder ?? ''" />
                                            <span v-if="ef.unit" class="input-unit-badge">{{ ef.unit }}</span>
                                        </div>
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>
                                    <div v-else-if="ef.type === 'text'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <label class="flabel">{{ ef.label }} <span v-if="ef.required" class="req">*</span></label>
                                        <input v-model="extras[ef.key]" type="text" class="finput" :placeholder="ef.placeholder ?? ''" />
                                        <div v-if="ef.hint" class="field-hint"><v-icon icon="mdi-information-outline" size="12" />{{ ef.hint }}</div>
                                    </div>
                                    <div v-else-if="ef.type === 'color-picker'" :class="['field', ef.fullWidth ? 'full-width' : '']">
                                        <div class="ef-color-label">
                                            <span>{{ ef.label }}</span>
                                            <span v-if="extras[ef.key]" class="ef-color-name">{{ colors.find(c => c.id === extras[ef.key])?.name }}</span>
                                        </div>
                                        <div class="ef-color-swatches">
                                            <button class="ef-color-swatch ef-color-swatch--clear" :class="{ active: !extras[ef.key] }"
                                                title="Nie określono" type="button" @click="extras[ef.key] = null">
                                                <v-icon icon="mdi-close" size="10" />
                                            </button>
                                            <button v-for="col in colors" :key="col.id" class="ef-color-swatch"
                                                :class="{ active: extras[ef.key] === col.id }"
                                                :style="{ background: col.hexCode || '#888' }" :title="col.name" type="button"
                                                @click="extras[ef.key] = extras[ef.key] === col.id ? null : col.id" />
                                        </div>
                                    </div>
                                    <div v-else-if="ef.type === 'boolean'" :class="['field field--bool', ef.fullWidth ? 'full-width' : '']">
                                        <label class="bool-check" :class="{ active: extras[ef.key] }">
                                            <input type="checkbox" v-model="extras[ef.key]" hidden />
                                            <span class="bool-box"><v-icon v-if="extras[ef.key]" icon="mdi-check" size="12" /></span>
                                            {{ ef.label }}
                                        </label>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- ══ Step 2 — Historia pojazdu ═══════════════════════════════ -->
                <div v-else-if="currentStep === 2" key="s2" class="step-panel">
                    <div class="step-head">
                        <h2>Historia pojazdu</h2>
                        <p>Kompletna historia buduje zaufanie i przyspiesza sprzedaż nawet o 40%.</p>
                    </div>

                    <!-- CARIZO VERIFIED banner -->
                    <div class="verified-banner">
                        <div class="vb-icon-wrap">
                            <v-icon icon="mdi-shield-check" size="28" class="vb-icon" />
                        </div>
                        <div class="vb-text">
                            <div class="vb-title">CARIZO VERIFIED</div>
                            <div class="vb-sub">Uzupełnij dane historyczne pojazdu i zdobądź odznakę zweryfikowanego sprzedawcy</div>
                        </div>
                    </div>

                    <!-- VIN section -->
                    <div class="glass-card">
                        <div class="gc-section-title"><v-icon icon="mdi-barcode-scan" size="15" style="margin-right:6px" />Numer VIN</div>
                        <div class="vin-row">
                            <input v-model="form.vin" class="finput vin-input" placeholder="Wpisz 17-znakowy numer VIN" maxlength="17"
                                :class="{ 'input-ok': form.vin.length === 17 }" />
                            <button type="button" class="btn-vin-lookup"
                                :disabled="form.vin.length !== 17 || vinLoading" @click="lookupVin">
                                <v-icon v-if="vinLoading" icon="mdi-loading" size="15" class="spin" />
                                <v-icon v-else icon="mdi-magnify" size="15" />
                                {{ vinLoading ? 'Sprawdzam...' : 'Sprawdź VIN' }}
                            </button>
                        </div>
                        <transition name="fade-err">
                            <span v-if="vinError" class="vin-error"><v-icon icon="mdi-alert-circle-outline" size="13" />{{ vinError }}</span>
                        </transition>
                        <p class="field-hint" style="margin-top:8px"><v-icon icon="mdi-information-outline" size="12" />VIN pozwala automatycznie uzupełnić dane i buduje zaufanie kupujących</p>
                        <div class="fields-grid" style="margin-top:16px">
                            <div class="field">
                                <label class="flabel">Pierwsza data rejestracji</label>
                                <input v-model="history.firstRegDate" type="date" class="finput" />
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

                    <!-- Ownership & import -->
                    <div class="glass-card" style="margin-top:16px">
                        <div class="gc-section-title"><v-icon icon="mdi-account-multiple-outline" size="15" style="margin-right:6px" />Właściciele i import</div>
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
                                <label class="flabel">Import z zagranicy?</label>
                                <div class="radio-group">
                                    <label class="radio-opt" :class="{ active: !history.isImported }">
                                        <input type="radio" :value="false" v-model="history.isImported" hidden />Nie, krajowy
                                    </label>
                                    <label class="radio-opt" :class="{ active: history.isImported }">
                                        <input type="radio" :value="true" v-model="history.isImported" hidden />Tak, import
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

                    <!-- Service & inspection -->
                    <div class="glass-card" style="margin-top:16px">
                        <div class="gc-section-title"><v-icon icon="mdi-wrench-outline" size="15" style="margin-right:6px" />Serwis i przeglądy</div>
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

                    <!-- Damage & warranty -->
                    <div class="glass-card" style="margin-top:16px">
                        <div class="gc-section-title"><v-icon icon="mdi-shield-outline" size="15" style="margin-right:6px" />Szkody i gwarancja</div>
                        <div class="fields-grid">
                            <div class="field">
                                <label class="flabel">Stan po szkodzie?</label>
                                <div class="radio-group">
                                    <label class="radio-opt" :class="{ active: !history.hasDamage }">
                                        <input type="radio" :value="false" v-model="history.hasDamage" hidden />
                                        <v-icon icon="mdi-check-circle-outline" size="13" style="color:#22c55e;margin-right:4px" />Bezwypadkowy
                                    </label>
                                    <label class="radio-opt" :class="{ active: history.hasDamage }">
                                        <input type="radio" :value="true" v-model="history.hasDamage" hidden />
                                        <v-icon icon="mdi-alert-outline" size="13" style="color:#fb923c;margin-right:4px" />Po szkodzie
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
                                <label class="flabel">Gwarancja</label>
                                <label class="bool-check" :class="{ active: history.hasWarranty }">
                                    <input type="checkbox" v-model="history.hasWarranty" hidden />
                                    <span class="bool-box"><v-icon v-if="history.hasWarranty" icon="mdi-check" size="12" /></span>
                                    Gwarancja aktywna
                                </label>
                                <transition name="fade-err">
                                    <div v-if="history.hasWarranty" style="margin-top:8px">
                                        <label class="flabel" style="font-size:11px;margin-bottom:4px">Ważna do</label>
                                        <input v-model="history.warrantyUntil" type="month" class="finput" />
                                    </div>
                                </transition>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ══ Step 3 — Zdjęcia ══════════════════════════════════════════ -->
                <div v-else-if="currentStep === 3" key="s3" class="step-panel">
                    <div class="step-head">
                        <h2>Zdjęcia</h2>
                        <p v-if="!isEdit">Dodaj minimum <strong>3 zdjęcia</strong>. Pierwsze zdjęcie będzie zdjęciem głównym.</p>
                        <p v-else>Możesz usunąć istniejące zdjęcia lub dodać nowe.</p>
                    </div>

                    <!-- Quality meter -->
                    <div class="photo-quality-bar">
                        <div class="pqb-labels">
                            <span>Jakość galerii</span>
                            <span class="pqb-pct">{{ photoQualityPct }}%</span>
                        </div>
                        <div class="pqb-track">
                            <div class="pqb-fill" :style="{ width: photoQualityPct + '%' }"
                                :class="photoQualityPct >= 80 ? 'pqb-great' : photoQualityPct >= 40 ? 'pqb-ok' : 'pqb-low'" />
                        </div>
                        <div class="pqb-hint">{{ photoQualityPct >= 80 ? 'Doskonała galeria!' : photoQualityPct >= 40 ? 'Dobre. Zalecamy 10+ zdjęć.' : 'Dodaj więcej zdjęć dla lepszej widoczności.' }}</div>
                    </div>

                    <!-- Photo grid -->
                    <div class="img-grid">
                        <div v-for="img in existingImages" :key="`ex-${img.id}`" class="img-thumb img-thumb--existing">
                            <img :src="`/img/${img.url.split('/uploads/').pop()}`" />
                            <button type="button" class="img-remove" :disabled="deletingImageId === img.id"
                                @click="deleteExistingImage(img.id)">
                                <v-icon v-if="deletingImageId === img.id" icon="mdi-loading" size="14" class="spin" />
                                <v-icon v-else icon="mdi-close" size="14" />
                            </button>
                            <span v-if="img.isMain" class="img-main-badge">Główne</span>
                        </div>
                        <div v-for="(preview, i) in previews" :key="`new-${i}`" class="img-thumb">
                            <img :src="preview" />
                            <button type="button" class="img-remove" @click="removeImage(i)">
                                <v-icon icon="mdi-close" size="14" />
                            </button>
                            <span v-if="!existingImages.length && i === 0" class="img-main-badge">Główne</span>
                        </div>
                        <label v-if="(existingImages.length + selectedFiles.length) < 20" class="img-add"
                            :class="{ 'img-add--loading': photoUploading }">
                            <input type="file" multiple accept="image/jpeg,image/png,image/webp"
                                @change="onFilesSelected" :disabled="photoUploading" hidden />
                            <v-icon v-if="photoUploading" icon="mdi-loading" size="32" class="spin" />
                            <v-icon v-else icon="mdi-camera-plus-outline" size="32" />
                            <span>{{ photoUploading ? 'Przetwarzanie...' : 'Dodaj zdjęcia' }}</span>
                            <small>JPG, PNG, WEBP · maks. 20</small>
                        </label>
                    </div>

                    <!-- Feedback -->
                    <div class="photo-hints">
                        <div class="photo-hint" :class="photoFeedback.mainOk ? 'ph-ok' : 'ph-warn'">
                            <v-icon :icon="photoFeedback.mainOk ? 'mdi-check-circle' : 'mdi-alert-circle-outline'" size="14" />
                            {{ photoFeedback.mainOk ? 'Zdjęcie główne ustawione' : 'Brak zdjęcia głównego' }}
                        </div>
                        <div class="photo-hint" :class="photoFeedback.countClass">
                            <v-icon :icon="photoFeedback.countIcon" size="14" />{{ photoFeedback.countMsg }}
                        </div>
                    </div>
                </div>

                <!-- ══ Step 4 — Wyposażenie ══════════════════════════════════════ -->
                <div v-else-if="currentStep === 4" key="s4" class="step-panel">
                    <div class="step-head">
                        <h2>Wyposażenie</h2>
                        <p>Zaznacz wyposażenie. Ogłoszenia z kompletnym wyposażeniem sprzedają się <strong>2× szybciej</strong>.</p>
                    </div>

                    <!-- Body type (cars) -->
                    <div v-if="isFieldVisible('bodyType')" class="glass-card" style="margin-bottom:16px">
                        <div class="gc-section-title">Typ nadwozia</div>
                        <SmartSelect v-model="form.bodyTypeId" :options="bodyTypeOptions"
                            placeholder="Wybierz typ nadwozia" prefix-icon="mdi-car-outline" />
                    </div>

                    <div v-if="!allFeatures.length" class="feat-empty">
                        <v-icon icon="mdi-format-list-checkbox" size="40" />
                        <p>Ładowanie wyposażenia...</p>
                    </div>
                    <div v-else-if="!Object.keys(featureGroups).length" class="feat-empty">
                        <v-icon icon="mdi-check-circle-outline" size="36" style="color:#22c55e" />
                        <p>Ta kategoria nie wymaga listy wyposażenia.</p>
                    </div>
                    <template v-else>
                        <!-- Search -->
                        <div class="feat-search-wrap">
                            <v-icon icon="mdi-magnify" size="16" class="feat-search-icon" />
                            <input v-model="featSearch" type="text" class="feat-search"
                                placeholder="Szukaj wyposażenia..." />
                            <span class="feat-count-badge">{{ form.featureIds.length }} wybrano</span>
                        </div>

                        <!-- Equipment groups as pill tags -->
                        <div v-for="(feats, catName) in filteredFeatureGroups" :key="catName" class="feat-group">
                            <button type="button" class="feat-group-header" @click="toggleFeatGroup(catName)">
                                <v-icon :icon="featureGroupIcon(catName)" size="15" class="fgh-icon" />
                                <span>{{ catName }}</span>
                                <span class="fgh-count">{{ feats.filter(f => form.featureIds.includes(f.id)).length }}/{{ feats.length }}</span>
                                <v-icon :icon="openFeatGroups.has(catName) ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" class="fgh-arrow" />
                            </button>
                            <transition name="feat-slide">
                                <div v-if="openFeatGroups.has(catName)" class="feat-pills">
                                    <button
                                        v-for="feat in feats" :key="feat.id"
                                        type="button"
                                        class="feat-pill"
                                        :class="{ 'feat-pill--on': form.featureIds.includes(feat.id) }"
                                        @click="form.featureIds.includes(feat.id)
                                            ? form.featureIds.splice(form.featureIds.indexOf(feat.id), 1)
                                            : form.featureIds.push(feat.id)">
                                        <v-icon v-if="form.featureIds.includes(feat.id)" icon="mdi-check" size="12" class="pill-check" />
                                        <span v-html="highlightSearch(feat.name)" />
                                    </button>
                                </div>
                            </transition>
                        </div>

                        <div class="feat-actions">
                            <button type="button" class="feat-expand-btn" @click="expandAllEquip">Rozwiń wszystkie</button>
                            <button type="button" class="feat-expand-btn" @click="collapseAllEquip">Zwiń wszystkie</button>
                        </div>
                    </template>
                </div>

                <!-- ══ Step 5 — Opis ══════════════════════════════════════════════ -->
                <div v-else-if="currentStep === 5" key="s5" class="step-panel">
                    <div class="step-head">
                        <h2>Tytuł i opis</h2>
                        <p>Dobry opis sprzedaje. Napisz co wyróżnia Twój pojazd.</p>
                    </div>

                    <div class="glass-card">
                        <div class="gc-section-title">Tytuł ogłoszenia</div>
                        <input v-model="form.title" type="text" class="finput finput--lg"
                            :placeholder="suggestedTitle || 'np. BMW 3 seria 2020 diesel – stan idealny'"
                            maxlength="120" />
                        <div class="field-hint" style="margin-top:6px">
                            <v-icon icon="mdi-information-outline" size="12" />
                            Zostaw puste, aby użyć automatycznego tytułu: <strong>{{ suggestedTitle || previewTitle }}</strong>
                        </div>
                    </div>

                    <div class="glass-card" style="margin-top:16px">
                        <div class="gc-section-title-row">
                            <span class="gc-section-title" style="margin-bottom:0">Opis ogłoszenia <span class="req">*</span></span>
                            <button type="button" class="btn-ai" :disabled="aiGenerating" @click="generateAiDescription">
                                <v-icon v-if="aiGenerating" icon="mdi-loading" size="14" class="spin" />
                                <v-icon v-else icon="mdi-creation-outline" size="14" />
                                {{ aiGenerating ? 'Generuję...' : 'Generuj z AI' }}
                            </button>
                        </div>
                        <textarea v-model="form.description" class="ftextarea ftextarea--tall"
                            placeholder="Opisz stan pojazdu, historię serwisową, wyposażenie, powód sprzedaży..."
                            rows="10" />
                        <div class="desc-meta">
                            <span class="desc-chars" :class="descQuality === 'great' ? 'dc-great' : descQuality === 'good' ? 'dc-good' : descQuality === 'ok' ? 'dc-ok' : 'dc-poor'">
                                {{ descCharCount }} znaków
                            </span>
                            <span class="desc-quality-label">
                                {{ descQuality === 'great' ? 'Doskonały opis!' : descQuality === 'good' ? 'Dobry opis' : descQuality === 'ok' ? 'Krótki — rozbuduj' : 'Za krótki opis' }}
                            </span>
                        </div>
                        <div class="desc-tips">
                            <span class="dt-item" :class="{ 'dt-done': descCharCount >= 50 }">
                                <v-icon :icon="descCharCount >= 50 ? 'mdi-check-circle' : 'mdi-circle-outline'" size="12" />50 znaków
                            </span>
                            <span class="dt-item" :class="{ 'dt-done': descCharCount >= 200 }">
                                <v-icon :icon="descCharCount >= 200 ? 'mdi-check-circle' : 'mdi-circle-outline'" size="12" />200 znaków
                            </span>
                            <span class="dt-item" :class="{ 'dt-done': descCharCount >= 500 }">
                                <v-icon :icon="descCharCount >= 500 ? 'mdi-check-circle' : 'mdi-circle-outline'" size="12" />500 znaków
                            </span>
                        </div>
                    </div>
                </div>

                <!-- ══ Step 6 — Cena i lokalizacja ═════════════════════════════ -->
                <div v-else-if="currentStep === 6" key="s6" class="step-panel">
                    <div class="step-head">
                        <h2>Cena i lokalizacja</h2>
                        <p>Ustal cenę i podaj gdzie się znajduje pojazd.</p>
                    </div>

                    <div class="glass-card">
                        <div class="gc-section-title">Cena</div>
                        <div class="price-row">
                            <div class="field" style="flex:1">
                                <label class="flabel">{{ categoryConfig.priceLabel ?? 'Cena (zł)' }} <span class="req">*</span></label>
                                <div class="input-icon-wrap">
                                    <span class="input-prefix-text">zł</span>
                                    <input v-model.number="form.price" type="number" class="finput has-prefix-text finput--price"
                                        placeholder="np. 45 000" min="0" />
                                </div>
                                <div v-if="categoryConfig.priceHint" class="field-hint">
                                    <v-icon icon="mdi-information-outline" size="12" />{{ categoryConfig.priceHint }}
                                </div>
                            </div>
                        </div>
                        <div class="price-opts">
                            <label class="bool-check" :class="{ active: form.isNegotiable }">
                                <input type="checkbox" v-model="form.isNegotiable" hidden />
                                <span class="bool-box"><v-icon v-if="form.isNegotiable" icon="mdi-check" size="12" /></span>
                                Cena do negocjacji
                            </label>
                            <div class="seller-type-toggle">
                                <label class="stt-opt" :class="{ active: form.sellerType === 'private' }">
                                    <input type="radio" value="private" v-model="form.sellerType" hidden />
                                    <v-icon icon="mdi-account-outline" size="15" />Osoba prywatna
                                </label>
                                <label class="stt-opt" :class="{ active: form.sellerType === 'dealer' }">
                                    <input type="radio" value="dealer" v-model="form.sellerType" hidden />
                                    <v-icon icon="mdi-domain" size="15" />Dealer / firma
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card" style="margin-top:16px">
                        <div class="gc-section-title">Lokalizacja</div>
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

                    <!-- Promotion plans (create mode) -->
                    <div v-if="!isEdit" class="glass-card" style="margin-top:16px">
                        <div class="gc-section-title">Promocja ogłoszenia</div>
                        <p class="promo-intro">Opcjonalnie wyróżnij ogłoszenie i sprzedaj szybciej.</p>
                        <div class="promo-grid">
                            <!-- Free -->
                            <div class="promo-card" :class="{ 'promo-card--active': promoSelected === 'free' }"
                                @click="promoSelected = 'free'">
                                <div class="pc-name">Bezpłatne</div>
                                <div class="pc-price">0 zł</div>
                                <div class="pc-desc">Standardowe ogłoszenie</div>
                            </div>
                            <div v-for="plan in promoPlans" :key="plan.key"
                                class="promo-card" :class="{ 'promo-card--active': promoSelected === plan.key, 'promo-card--popular': plan.popular }"
                                @click="promoSelected = plan.key; promoDays = plan.defaultDays">
                                <div v-if="plan.popular" class="pc-popular-badge">Popularne</div>
                                <v-icon :icon="plan.icon" size="18" class="pc-icon" />
                                <div class="pc-name">{{ plan.name }}</div>
                                <div class="pc-price">od {{ getPromoPriceFrom(plan.key, plan.priceFrom).toFixed(2) }} zł</div>
                                <div class="pc-desc">{{ plan.desc }}</div>
                                <div v-if="promoSelected === plan.key" class="pc-days-row">
                                    <button v-for="d in plan.days" :key="d"
                                        type="button" class="pc-day-btn" :class="{ active: promoDays === d }"
                                        @click.stop="promoDays = d">
                                        {{ d }}d — {{ getPromoDisplayPrice(plan.key, d).toFixed(2) }} zł
                                    </button>
                                </div>
                            </div>
                        </div>
                        <!-- Coupon -->
                        <div v-if="promoSelected !== 'free'" class="promo-coupon">
                            <div class="promo-coupon-row">
                                <input v-model="couponCode" type="text" class="finput" placeholder="Kod rabatowy (opcjonalnie)" />
                                <button class="btn-coupon" :disabled="!couponCode || couponLoading" @click="applyCoupon">
                                    <v-icon v-if="couponLoading" icon="mdi-loading" size="13" class="spin" />
                                    <span v-else>Zastosuj</span>
                                </button>
                            </div>
                            <div v-if="couponError" class="ps-coupon-error">{{ couponError }}</div>
                            <div v-if="couponResult?.isValid" class="ps-coupon-ok">
                                <v-icon icon="mdi-tag-outline" size="13" /> Kupon zastosowany — {{ couponResult.discountDescription }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ══ Step 7 — Publikacja ══════════════════════════════════════ -->
                <div v-else-if="currentStep === 7" key="s7" class="step-panel">
                    <div class="step-head">
                        <h2>Podgląd i publikacja</h2>
                        <p>Sprawdź ogłoszenie przed publikacją. Po opublikowaniu pojawi się w wyszukiwarce CARIZO.</p>
                    </div>

                    <!-- Preview card -->
                    <div class="preview-advert-card">
                        <div class="pac-img-wrap">
                            <img :src="previews[0] ?? '/car-placeholder.svg'" class="pac-img" alt="Podgląd" />
                            <div v-if="previews.length > 1" class="pac-photo-count">
                                <v-icon icon="mdi-image-multiple-outline" size="14" />{{ previews.length }} zdjęć
                            </div>
                        </div>
                        <div class="pac-info">
                            <div class="pac-category">{{ selectedCategory?.name ?? '' }}</div>
                            <h3 class="pac-title">{{ form.title || suggestedTitle || previewTitle }}</h3>
                            <div class="pac-specs">
                                <span v-if="form.year">{{ form.year }}</span>
                                <span v-if="fuelTypeName" class="pac-dot">·</span>
                                <span v-if="fuelTypeName">{{ fuelTypeName }}</span>
                                <span v-if="form.mileage" class="pac-dot">·</span>
                                <span v-if="form.mileage">{{ Number(form.mileage).toLocaleString('pl') }} km</span>
                                <span v-if="form.power" class="pac-dot">·</span>
                                <span v-if="form.power">{{ form.power }} KM</span>
                            </div>
                            <div class="pac-price">
                                {{ form.price ? Number(form.price).toLocaleString('pl') + ' zł' : '— zł' }}
                                <span v-if="form.isNegotiable" class="pac-nego">do negocjacji</span>
                            </div>
                            <div v-if="form.city || form.region" class="pac-location">
                                <v-icon icon="mdi-map-marker-outline" size="13" />
                                {{ [form.city, form.region].filter(Boolean).join(', ') }}
                            </div>
                            <p v-if="form.description" class="pac-desc">{{ form.description.slice(0, 200) }}{{ form.description.length > 200 ? '...' : '' }}</p>
                        </div>
                    </div>

                    <!-- Summary stats -->
                    <div class="pub-summary-grid">
                        <div class="psg-item">
                            <v-icon icon="mdi-image-outline" size="20" class="psg-icon" />
                            <div class="psg-val">{{ selectedFiles.length + existingImages.length }}</div>
                            <div class="psg-label">zdjęć</div>
                        </div>
                        <div class="psg-item">
                            <v-icon icon="mdi-format-list-checkbox" size="20" class="psg-icon" />
                            <div class="psg-val">{{ form.featureIds.length }}</div>
                            <div class="psg-label">wyposażenia</div>
                        </div>
                        <div class="psg-item">
                            <v-icon icon="mdi-text-box-outline" size="20" class="psg-icon" />
                            <div class="psg-val">{{ descCharCount }}</div>
                            <div class="psg-label">znaków opisu</div>
                        </div>
                        <div class="psg-item" :class="adScore >= 80 ? 'psg-great' : adScore >= 55 ? 'psg-ok' : 'psg-low'">
                            <v-icon icon="mdi-chart-arc" size="20" class="psg-icon" />
                            <div class="psg-val">{{ adScore }}/100</div>
                            <div class="psg-label">jakość</div>
                        </div>
                    </div>

                    <!-- Publish actions -->
                    <div class="publish-actions">
                        <template v-if="isEdit">
                            <button class="btn-publish-main" :disabled="loading" @click="submit">
                                <v-icon v-if="loading" icon="mdi-loading" size="18" class="spin" />
                                <v-icon v-else icon="mdi-content-save-outline" size="18" />
                                {{ loading ? 'Zapisywanie...' : 'Zapisz zmiany' }}
                            </button>
                        </template>
                        <template v-else>
                            <button v-if="promoSelected === 'free'" class="btn-publish-main" :disabled="loading" @click="submit">
                                <v-icon v-if="loading" icon="mdi-loading" size="18" class="spin" />
                                <v-icon v-else icon="mdi-rocket-launch-outline" size="18" />
                                {{ loading ? 'Publikowanie...' : 'Opublikuj ogłoszenie' }}
                            </button>
                            <button v-else class="btn-publish-main btn-publish-pay" :disabled="loading || paying" @click="submit">
                                <v-icon v-if="loading || paying" icon="mdi-loading" size="18" class="spin" />
                                <v-icon v-else icon="mdi-credit-card-outline" size="18" />
                                {{ loading ? 'Tworzę ogłoszenie...' : paying ? 'Przekierowuję...' : `Zapłać i opublikuj — ${finalPromoPrice.toFixed(2)} zł` }}
                            </button>
                        </template>
                        <div class="pub-disclaimer">
                            <v-icon icon="mdi-lock-outline" size="13" />
                            Ogłoszenie będzie widoczne natychmiast po opublikowaniu.
                        </div>
                    </div>
                </div>

                </transition>

                <!-- ── Navigation ────────────────────────────────────────────── -->
                <div class="nav-row">
                    <button class="btn-prev" @click="currentStep > 0 ? currentStep-- : navigateTo('/my-adverts')">
                        <v-icon icon="mdi-arrow-left" size="16" />
                        {{ currentStep > 0 ? 'Wstecz' : 'Anuluj' }}
                    </button>
                    <button v-if="currentStep < steps.length - 1" class="btn-next-main" @click="goNext">
                        Dalej: {{ steps[currentStep + 1]?.name }}
                        <v-icon icon="mdi-arrow-right" size="16" />
                    </button>
                </div>

            </main>

        </div>
    </div>
</template>
<script setup lang="ts">
import type { TaxonomyItem, Generation, EngineVersion, Feature, DriveType, CarColor, CouponValidation, CarAdvert, AdvertImage, CategoryWithCount, SelectOption } from '~/types'

definePageMeta({ middleware: 'auth' })

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

const route = useRoute()
const editId = computed(() => route.query.edit ? Number(route.query.edit) : null)
const isEdit = computed(() => !!editId.value)

const { fetchBrands, fetchBrandsByCategory, fetchModels, fetchGenerations, fetchEngines, fetchFuelTypes, fetchGearboxes, fetchBodyTypes, fetchDriveTypes, fetchColors, fetchFeatures } = useTaxonomy()
const { validateCoupon } = useCoupons()
const { getPrice } = usePayment()
const { fetchCategories } = useCategories()

const brands = ref<TaxonomyItem[]>([])
const models = ref<TaxonomyItem[]>([])
const generations = ref<Generation[]>([])
const engines = ref<EngineVersion[]>([])
const fuelTypes = ref<TaxonomyItem[]>([])
const gearboxes = ref<TaxonomyItem[]>([])
const bodyTypes = ref<TaxonomyItem[]>([])
const driveTypes = ref<DriveType[]>([])
const colors = ref<CarColor[]>([])
const allFeatures = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')
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
const aiGenerating = ref(false)

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
        if (typeof saved.step === 'number' && saved.step >= 0 && saved.step < 8) currentStep.value = saved.step
    } catch {}
}

async function lookupVin() {
    if (form.vin.length !== 17) return
    vinLoading.value = true
    vinError.value = ''
    try {
        const data = await $fetch<Partial<typeof form>>(`/api/proxy/api/Advert/vin/${form.vin}`)
        if (data.brandId) form.brandId = data.brandId
        if (data.modelId) form.modelId = data.modelId
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
})

const extras = reactive<Record<string, any>>({})
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
})

const steps = [
    { name: 'Kategoria',    desc: 'Typ pojazdu',             icon: 'mdi-apps' },
    { name: 'Dane pojazdu', desc: 'Marka, model, parametry', icon: 'mdi-car-outline' },
    { name: 'Historia',     desc: 'VIN i historia',          icon: 'mdi-shield-check-outline' },
    { name: 'Zdjęcia',      desc: 'Galeria pojazdu',         icon: 'mdi-image-outline' },
    { name: 'Wyposażenie',  desc: 'Opcje i pakiety',         icon: 'mdi-format-list-checkbox' },
    { name: 'Opis',         desc: 'Tytuł i opis',            icon: 'mdi-text-box-outline' },
    { name: 'Cena',         desc: 'Cena i lokalizacja',      icon: 'mdi-currency-usd' },
    { name: 'Publikacja',   desc: 'Przejrzyj i opublikuj',   icon: 'mdi-check-circle-outline' },
]

const progressSteps = steps

const stripFeats = [
    { icon: 'mdi-lock-outline', title: 'Bezpieczne transakcje', desc: 'Weryfikujemy i dbamy o bezpieczeństwo' },
    { icon: 'mdi-tag-off-outline', title: 'Darmowe ogłoszenia', desc: 'Dodawaj auta bez ukrytych kosztów' },
    { icon: 'mdi-bullhorn-outline', title: 'Promowanie ofert', desc: 'Wyróżnij swoje auto i sprzedaj szybciej' },
    { icon: 'mdi-headset', title: 'Wsparcie 24/7', desc: 'Nasz zespół jest dostępny zawsze' },
]

const brandName = computed(() => brands.value.find(b => b.id === form.brandId)?.name ?? '')
const modelName = computed(() => models.value.find(m => m.id === form.modelId)?.name ?? '')
const fuelTypeName = computed(() => fuelTypes.value.find(f => f.id === form.fuelTypeId)?.name ?? '')

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
    return Math.min(s, 100)
})

const scoreArc = computed(() => (adScore.value / 100) * 326.7)

const photoQualityPct = computed(() =>
    Math.min(100, Math.round((selectedFiles.value.length + existingImages.value.length) / 12 * 100))
)

const scoreFactors = computed(() => {
    const photos = selectedFiles.value.length + existingImages.value.length
    return [
        { label: 'Podstawowe informacje', done: !!(form.brandId && form.modelId && form.year && form.price) },
        { label: `Zdjęcia (${photos}/10)`, done: photos >= 10 },
        { label: `Opis (${descCharCount.value} znaków)`, done: descCharCount.value >= 200 },
        { label: `Wyposażenie (${form.featureIds.length}/5)`, done: form.featureIds.length >= 5 },
        { label: 'Historia pojazdu', done: !!(form.vin || history.hasServiceBook || history.ownersCount !== null) },
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
    return tips.slice(0, 3)
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

const featureGroups = computed(() => {
    const vehicleCatId = selectedCategory.value?.id ?? null
    const g: Record<string, Feature[]> = {}
    for (const f of allFeatures.value) {
        const fvc = f.category?.vehicleCategoryId
        // Exclude features that belong to a different vehicle category
        if (fvc != null && vehicleCatId != null && fvc !== vehicleCatId) continue
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

function highlightSearch(name: string): string {
    const q = featSearch.value.trim()
    if (!q) return name
    const idx = name.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return name
    return name.slice(0, idx) + `<mark class="feat-hl">${name.slice(idx, idx + q.length)}</mark>` + name.slice(idx + q.length)
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
        form.brandId = null; form.modelId = null; form.generationId = null; form.engineVersionId = null
        models.value = []; generations.value = []; engines.value = []
        for (const key of Object.keys(extras)) delete extras[key]
        brandTextInput.value = ''
        modelTextInput.value = ''
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
        for (const ef of (cfg.extraFields ?? [])) {
            if (ef.required && !extras[ef.key] && extras[ef.key] !== false) {
                return `Pole "${ef.label}" jest wymagane.`
            }
        }
    }
    // Step 2: Historia — no required fields (VIN optional)
    // Step 3: Photos
    if (step === 3) {
        if (!isEdit.value && existingImages.value.length === 0 && selectedFiles.value.length < 3) return 'Dodaj minimum 3 zdjęcia.'
    }
    // Step 4: Equipment — no required fields
    // Step 5: Description
    if (step === 5) {
        if (!form.description?.trim()) return 'Dodaj opis ogłoszenia.'
    }
    // Step 6: Price & location
    if (step === 6) {
        if (!form.price) return 'Podaj cenę pojazdu.'
        if (!form.region) return 'Wybierz województwo.'
        if (!form.city?.trim()) return 'Podaj miasto.'
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

async function onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files ?? [])
    const remaining = 20 - selectedFiles.value.length
    if (!files.length) return
    photoUploading.value = true
    for (const file of files.slice(0, remaining)) {
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

async function onBrand() {
    form.modelId = null; form.generationId = null; form.engineVersionId = null
    models.value = []; generations.value = []; engines.value = []
    if (form.brandId) models.value = await fetchModels(form.brandId)
}
async function onModel() {
    form.generationId = null; form.engineVersionId = null
    generations.value = []; engines.value = []
    if (form.modelId) generations.value = await fetchGenerations(form.modelId)
}
async function onGen() {
    form.engineVersionId = null; engines.value = []
    if (form.generationId) engines.value = await fetchEngines(form.generationId)
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

async function generateAiDescription() {
    aiGenerating.value = true
    try {
        const brand = (categoryConfig.value.brandFieldType === 'text' ? brandTextInput.value : brandName.value) || ''
        const model = (categoryConfig.value.brandFieldType === 'text' ? modelTextInput.value : modelName.value) || ''
        const result = await $fetch<{ description: string }>('/api/ai/description', {
            method: 'POST',
            body: { brand, model, year: form.year, fuel: fuelTypeName.value, mileage: form.mileage, power: form.power, condition: extras.condition },
        })
        if (result.description) form.description = result.description
    } catch {}
    finally { aiGenerating.value = false }
}

async function submit() {
    const err = validateStep(6)
    if (err) {
        error.value = err
        return
    }
    error.value = ''
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
            // Vehicle history fields
            if (history.ownersCount !== null) cleanEdit.ownersCount = history.ownersCount
            cleanEdit.isImported = history.isImported
            if (history.importCountry) cleanEdit.importCountry = history.importCountry
            if (history.firstRegDate) cleanEdit.firstRegistrationDate = history.firstRegDate
            if (history.registrationCountry) cleanEdit.registrationCountry = history.registrationCountry
            cleanEdit.hasServiceBook = history.hasServiceBook
            cleanEdit.hasFullServiceHistory = history.hasFullServiceHistory
            if (history.nextInspection) cleanEdit.nextInspection = history.nextInspection
            cleanEdit.hasDamage = history.hasDamage
            if (history.damageDesc) cleanEdit.damageDescription = history.damageDesc
            cleanEdit.hasWarranty = history.hasWarranty
            if (history.warrantyUntil) cleanEdit.warrantyUntil = history.warrantyUntil
            await $fetch(`/api/proxy/api/Advert/${editId.value}`, {
                method: 'PUT',
                body: cleanEdit,
            })
            for (const file of selectedFiles.value) {
                const fd = new FormData()
                fd.append('file', file)
                await $fetch(`/api/advert/${editId.value}/images`, { method: 'POST', body: fd })
            }
            await navigateTo('/my-adverts')
        } else {
            // ── Create mode: new advert ──
            // Only include fields known by CreateCarAdvertDto
            const ADVERT_FIELDS = [
                'brandId', 'modelId', 'generationId', 'engineVersionId',
                'fuelTypeId', 'gearboxId', 'bodyTypeId',
                'year', 'mileage', 'price', 'title', 'vin',
                'city', 'region', 'isNegotiable', 'sellerType',
                'doorCount', 'seatsCount',
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
            // Vehicle history fields
            if (history.ownersCount !== null) cleanBody.ownersCount = history.ownersCount
            cleanBody.isImported = history.isImported
            if (history.importCountry) cleanBody.importCountry = history.importCountry
            if (history.firstRegDate) cleanBody.firstRegistrationDate = history.firstRegDate
            if (history.registrationCountry) cleanBody.registrationCountry = history.registrationCountry
            cleanBody.hasServiceBook = history.hasServiceBook
            cleanBody.hasFullServiceHistory = history.hasFullServiceHistory
            if (history.nextInspection) cleanBody.nextInspection = history.nextInspection
            cleanBody.hasDamage = history.hasDamage
            if (history.damageDesc) cleanBody.damageDescription = history.damageDesc
            cleanBody.hasWarranty = history.hasWarranty
            if (history.warrantyUntil) cleanBody.warrantyUntil = history.warrantyUntil
            console.log('[submit] body →', JSON.stringify(cleanBody))
            const created = await $fetch<any>('/api/proxy/api/Advert', {
                method: 'POST',
                body: cleanBody,
            })
            console.log('[create advert response]', JSON.stringify(created))
            const id: number = created?.id ?? created?.advertId ?? created
            if (!id) throw new Error('Brak ID ogłoszenia w odpowiedzi: ' + JSON.stringify(created))

            for (const file of selectedFiles.value) {
                const fd = new FormData()
                fd.append('file', file)
                await $fetch(`/api/advert/${id}/images`, { method: 'POST', body: fd }).catch(() => {})
            }
            localStorage.removeItem('carizo_advert_draft')

            // Publish advert (endpoint may not exist yet — ignore 404/405)
            await $fetch(`/api/proxy/api/Advert/${id}/publish`, { method: 'POST', body: {} }).catch(() => {})

            if (promoSelected.value === 'free') {
                publishedAdvertId.value = id
                showSuccess.value = true
            } else {
                loading.value = false
                paying.value = true
                const body: Record<string, unknown> = {
                    advertId: id,
                    serviceType: promoSelected.value,
                    durationDays: promoDays.value,
                }
                if (couponResult.value?.isValid && couponCode.value) body.couponCode = couponCode.value
                const result = await $fetch<{ paymentUrl: string }>('/api/proxy/api/Payment/initiate', { method: 'POST', body })
                if (result.paymentUrl) window.location.href = result.paymentUrl
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
        error.value = msg || e?.message || 'Błąd podczas zapisywania ogłoszenia.'
        console.error('[submit] error response:', JSON.stringify(bd ?? e?.message))
    } finally {
        loading.value = false
        paying.value = false
    }
}

async function deleteExistingImage(imageId: number) {
    deletingImageId.value = imageId
    try {
        await $fetch(`/api/proxy/api/Advert/${editId.value}/images/${imageId}`, { method: 'DELETE' })
        existingImages.value = existingImages.value.filter(img => img.id !== imageId)
    } catch {}
    finally { deletingImageId.value = null }
}

onMounted(async () => {
    ;[brands.value, fuelTypes.value, gearboxes.value, bodyTypes.value, driveTypes.value, colors.value, allFeatures.value, advertCategories.value] = await Promise.all([
        fetchBrands(), fetchFuelTypes(), fetchGearboxes(), fetchBodyTypes(), fetchDriveTypes(), fetchColors(), fetchFeatures(), fetchCategories()
    ])

    if (isEdit.value && editId.value) {
        try {
            const advert = await $fetch<CarAdvert>(`/api/proxy/api/Advert/${editId.value}`)
            form.title = advert.title ?? ''
            form.description = advert.description ?? ''
            form.price = advert.price ?? null
            form.brandId = advert.brand?.id ?? null
            form.modelId = advert.model?.id ?? null
            form.generationId = advert.generation?.id ?? null
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
            history.nextInspection = advert.nextInspection ?? ''
            history.hasDamage = advert.hasDamage ?? false
            history.damageDesc = advert.damageDescription ?? ''
            history.hasWarranty = advert.hasWarranty ?? false
            history.warrantyUntil = advert.warrantyUntil ?? ''
            existingImages.value = advert.images ?? []
            if (form.brandId) models.value = await fetchModels(form.brandId)
            if (form.modelId) generations.value = await fetchGenerations(form.modelId)
            if (form.generationId) engines.value = await fetchEngines(form.generationId)
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
    background: rgba(5,5,5,0.95);
    backdrop-filter: blur(12px);
    z-index: 10;
}
.top-left { display: flex; align-items: center; gap: 18px; }
.tl-logo { height: 24px; opacity: 0.9; }
.back-btn {
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: none; color: $text-dim;
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: inherit; transition: color 0.2s;
    &:hover { color: $text; }
}
.top-center {
    display: flex; flex-direction: column; align-items: center; gap: 1px;
    .tc-label { font-size: 13px; font-weight: 600; color: $text-muted; }
    .tc-step { font-size: 11px; color: $text-faint; }
}
.top-right { display: flex; align-items: center; gap: 10px; }
.btn-draft {
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 13px; padding: 6px 12px; cursor: pointer;
    font-family: inherit; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
    &--saved { border-color: rgba(34,197,94,0.4); color: #22c55e; }
}
.btn-close {
    width: 34px; height: 34px; border-radius: 8px;
    background: transparent; border: 1px solid $border;
    display: flex; align-items: center; justify-content: center;
    color: $text-dim; cursor: pointer; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}

// ── Page body ─────────────────────────────────────────────────────────────────
.page-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
.left-sidebar {
    width: 260px;
    min-width: 260px;
    border-right: 1px solid $border;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 24px 0 24px;
    gap: 0;
    background: rgba(13,13,13,0.5);
}

// Steps nav
.steps-nav {
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.step-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 10px;
    border-radius: $r-sm;
    cursor: default;
    transition: background 0.2s;
    position: relative;
    &.step-done {
        cursor: pointer;
        &:hover { background: rgba(255,255,255,0.04); }
    }
    &.step-active { background: rgba(139,13,29,0.12); }
}
.step-num {
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
    background: $border; color: $text-dim;
    .step-active & { background: $red; color: #fff; }
    .step-done & { background: rgba(34,197,94,0.2); color: #22c55e; }
}
.step-info { flex: 1; min-width: 0; }
.step-name {
    font-size: 13px; font-weight: 600; color: $text-muted;
    .step-active & { color: $text; }
    .step-done & { color: $text-dim; }
}
.step-desc {
    font-size: 11px; color: $text-faint;
    .step-active & { color: $text-dim; }
}

// Score panel
.score-panel {
    margin: 20px 16px 0;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: $r-md;
    padding: 16px;
}
.score-panel-head {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: $text-faint; margin-bottom: 14px;
    .sp-head-icon { color: $red; }
}
.score-circle-wrap {
    position: relative; display: flex; justify-content: center;
    align-items: center; margin-bottom: 12px;
    svg { display: block; }
}
.score-num-wrap {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    text-align: center; line-height: 1;
    .score-val { font-size: 26px; font-weight: 800; color: $text; }
    .score-denom { font-size: 11px; color: $text-faint; }
}
.score-badge {
    text-align: center; font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px; margin: 0 auto 14px;
    display: inline-block; width: fit-content;
    &.sb-great { background: rgba(34,197,94,0.15); color: #22c55e; }
    &.sb-ok { background: rgba(245,158,11,0.15); color: #f59e0b; }
    &.sb-low { background: rgba(139,13,29,0.2); color: #f87171; }
}
.score-checklist { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.sc-row {
    display: flex; align-items: center; gap: 7px;
    font-size: 11.5px; color: $text-faint;
    .sc-icon { flex-shrink: 0; color: $text-faint; }
    &.sc-done { color: $text-dim; .sc-icon { color: #22c55e; } }
}
.score-tips { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid $border; padding-top: 10px; }
.st-tip {
    display: flex; align-items: flex-start; gap: 6px;
    font-size: 11px; color: $text-faint; line-height: 1.4;
    .st-icon { flex-shrink: 0; color: #f59e0b; margin-top: 1px; }
}

// ── Center area ───────────────────────────────────────────────────────────────
.center-area {
    flex: 1;
    overflow-y: auto;
    padding: 32px 40px 60px;
    display: flex;
    flex-direction: column;
    gap: 0;
}

// Error banners
.step-error-banner {
    display: flex; align-items: center; gap: 10px;
    background: rgba(139,13,29,0.15); border: 1px solid rgba(139,13,29,0.3);
    border-radius: $r-sm; padding: 12px 16px; font-size: 13.5px;
    color: #fca5a5; margin-bottom: 20px;
    &--hard { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); }
}
.seb-close {
    margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; padding: 0;
}

// ── Step panel ────────────────────────────────────────────────────────────────
.step-panel { display: flex; flex-direction: column; gap: 0; }

.step-head {
    margin-bottom: 28px;
    h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: $text; margin: 0 0 6px; }
    p { font-size: 14px; color: $text-dim; margin: 0; line-height: 1.5; }
}

// ── Glass card (section container) ───────────────────────────────────────────
.glass-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-lg;
    padding: 24px;
    backdrop-filter: blur(10px);
}
.gc-section-title {
    font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: $text-faint; margin-bottom: 18px;
    display: flex; align-items: center;
}
.gc-section-title-row {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
    .gc-section-title { margin-bottom: 0; }
}

// ── Fields grid ───────────────────────────────────────────────────────────────
.fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 20px;
    .full-width { grid-column: 1 / -1; }
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field--bool { justify-content: flex-end; }

.flabel {
    font-size: 12px; font-weight: 600; color: $text-muted; letter-spacing: 0.02em;
    .req { color: $red; margin-left: 2px; }
}
.finput {
    background: rgba(0,0,0,0.3); border: 1px solid $border-alt;
    border-radius: $r-sm; padding: 10px 14px; font-size: 14px;
    color: $text; font-family: inherit; transition: border-color 0.2s;
    outline: none; width: 100%;
    &::placeholder { color: $text-faint; }
    &:focus { border-color: rgba(139,13,29,0.5); }
    &.input-ok { border-color: rgba(34,197,94,0.4); }
    &--lg { font-size: 15px; padding: 12px 14px; }
    &--price { font-size: 22px; font-weight: 700; padding: 12px 14px; }
}
.ftextarea {
    background: rgba(0,0,0,0.3); border: 1px solid $border-alt;
    border-radius: $r-sm; padding: 12px 14px; font-size: 14px;
    color: $text; font-family: inherit; transition: border-color 0.2s;
    outline: none; resize: vertical; width: 100%; line-height: 1.6;
    &::placeholder { color: $text-faint; }
    &:focus { border-color: rgba(139,13,29,0.5); }
    &--tall { min-height: 200px; }
}
.fselect {
    appearance: none; background: rgba(0,0,0,0.3); border: 1px solid $border-alt;
    border-radius: $r-sm; padding: 10px 36px 10px 14px; font-size: 14px;
    color: $text; font-family: inherit; width: 100%; outline: none;
    transition: border-color 0.2s; cursor: pointer;
    &:focus { border-color: rgba(139,13,29,0.5); }
}
.select-wrap { position: relative; }
.sel-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: $text-dim; }

.input-icon-wrap { position: relative; display: flex; align-items: center; }
.input-prefix {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: $text-dim; pointer-events: none;
}
.input-prefix-text {
    position: absolute; left: 14px; font-size: 16px; font-weight: 700;
    color: $text-dim; pointer-events: none; z-index: 1;
}
.has-prefix { padding-left: 36px; }
.has-prefix-text { padding-left: 28px; }

.input-unit-wrap { position: relative; display: flex; align-items: center; }
.input-unit-badge {
    position: absolute; right: 12px; font-size: 12px; color: $text-dim;
    pointer-events: none; font-weight: 600;
}

.field-hint {
    display: flex; align-items: center; gap: 4px;
    font-size: 11.5px; color: $text-faint; line-height: 1.4;
}

.bool-check {
    display: flex; align-items: center; gap: 9px; cursor: pointer;
    font-size: 13.5px; color: $text-muted; padding: 8px 0;
    user-select: none;
    &.active { color: $text; }
    .bool-box {
        width: 18px; height: 18px; border-radius: 5px;
        border: 1.5px solid $border-alt; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background 0.2s, border-color 0.2s;
    }
    &.active .bool-box { background: $red; border-color: $red; }
}
.bool-stack { display: flex; flex-direction: column; gap: 2px; }

.radio-group { display: flex; flex-wrap: wrap; gap: 8px; }
.radio-opt {
    padding: 7px 14px; border-radius: 8px; border: 1px solid $border;
    font-size: 13px; color: $text-muted; cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    display: flex; align-items: center; gap: 4px;
    &.active { border-color: $red; color: $text; background: rgba(139,13,29,0.1); }
}

// Color picker
.ef-color-label { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; color: $text-muted; margin-bottom: 8px; }
.ef-color-name { font-size: 11px; color: $text-dim; }
.ef-color-swatches { display: flex; flex-wrap: wrap; gap: 7px; }
.ef-color-swatch {
    width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;
    transition: border-color 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center;
    &.active { border-color: #fff; transform: scale(1.15); }
    &--clear { background: $border; color: $text-dim; }
}

// ── Category grid ─────────────────────────────────────────────────────────────
.cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
}
.cat-card {
    position: relative; background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07); border-radius: $r-lg;
    padding: 24px 16px 20px; cursor: pointer; text-align: center;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    &:hover { border-color: rgba(139,13,29,0.4); background: rgba(139,13,29,0.06); transform: translateY(-2px); }
    &--active { border-color: $red; background: rgba(139,13,29,0.12); }
}
.cat-card-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;
    color: $text-muted;
    .cat-card--active & { background: rgba(139,13,29,0.2); color: $text; }
}
.cat-card-name { font-size: 14px; font-weight: 700; color: $text; }
.cat-card-count { font-size: 11px; color: $text-faint; }
.cat-card-check {
    position: absolute; top: 10px; right: 10px; width: 20px; height: 20px;
    background: $red; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    color: #fff;
}
.cat-note {
    display: flex; align-items: flex-start; gap: 8px;
    margin-top: 20px; padding: 12px 16px;
    background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2);
    border-radius: $r-sm; font-size: 13px; color: #fcd34d;
}

// ── CARIZO VERIFIED banner ────────────────────────────────────────────────────
.verified-banner {
    display: flex; align-items: center; gap: 16px;
    background: linear-gradient(135deg, rgba(139,13,29,0.15) 0%, rgba(139,13,29,0.05) 100%);
    border: 1px solid rgba(139,13,29,0.3); border-radius: $r-lg;
    padding: 20px 24px; margin-bottom: 20px;
}
.vb-icon-wrap {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(139,13,29,0.2); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    .vb-icon { color: $red; }
}
.vb-title { font-size: 15px; font-weight: 800; letter-spacing: 0.06em; color: $text; margin-bottom: 4px; }
.vb-sub { font-size: 12.5px; color: $text-dim; line-height: 1.4; }

// ── VIN row ───────────────────────────────────────────────────────────────────
.vin-row { display: flex; gap: 10px; align-items: center; }
.vin-input { flex: 1; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; }
.btn-vin-lookup {
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
    background: rgba(139,13,29,0.15); border: 1px solid rgba(139,13,29,0.3);
    border-radius: $r-sm; color: #fca5a5; font-size: 13px; font-weight: 600;
    padding: 10px 16px; cursor: pointer; font-family: inherit; transition: background 0.2s;
    &:hover:not(:disabled) { background: rgba(139,13,29,0.25); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.vin-error { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #fca5a5; margin-top: 4px; }

// ── Photo section ─────────────────────────────────────────────────────────────
.photo-quality-bar {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-lg; padding: 18px 24px; margin-bottom: 20px;
}
.pqb-labels { display: flex; justify-content: space-between; font-size: 12px; color: $text-dim; margin-bottom: 8px; }
.pqb-pct { font-weight: 700; color: $text; }
.pqb-track { height: 6px; background: $border; border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
.pqb-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease;
    &.pqb-great { background: #22c55e; }
    &.pqb-ok { background: #f59e0b; }
    &.pqb-low { background: $red; }
}
.pqb-hint { font-size: 11.5px; color: $text-faint; }

.img-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;
    margin-bottom: 16px;
}
.img-thumb {
    position: relative; aspect-ratio: 4/3; border-radius: $r-sm; overflow: hidden;
    border: 1px solid $border;
    img { width: 100%; height: 100%; object-fit: cover; }
}
.img-remove {
    position: absolute; top: 6px; right: 6px; width: 24px; height: 24px;
    background: rgba(0,0,0,0.7); border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    color: #fff; transition: background 0.2s;
    &:hover { background: rgba(139,13,29,0.8); }
}
.img-main-badge {
    position: absolute; bottom: 6px; left: 6px; background: $red; color: #fff;
    font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.03em;
}
.img-add {
    aspect-ratio: 4/3; border-radius: $r-sm; border: 2px dashed rgba(255,255,255,0.12);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
    cursor: pointer; color: $text-faint; transition: border-color 0.2s, color 0.2s; text-align: center;
    span { font-size: 13px; }
    small { font-size: 10px; }
    &:hover { border-color: rgba(139,13,29,0.4); color: $text-dim; }
    &--loading { opacity: 0.6; cursor: wait; }
}
.photo-hints { display: flex; flex-direction: column; gap: 6px; }
.photo-hint {
    display: flex; align-items: center; gap: 7px; font-size: 12.5px;
    &.ph-ok { color: #86efac; }
    &.ph-warn { color: #fde68a; }
    &.ph-error { color: #fca5a5; }
}

// ── Equipment pills ───────────────────────────────────────────────────────────
.feat-search-wrap {
    position: relative; display: flex; align-items: center; gap: 0;
    margin-bottom: 20px;
}
.feat-search-icon { position: absolute; left: 14px; color: $text-dim; pointer-events: none; }
.feat-search {
    flex: 1; background: rgba(0,0,0,0.3); border: 1px solid $border-alt;
    border-radius: $r-sm; padding: 10px 14px 10px 40px; font-size: 14px;
    color: $text; font-family: inherit; outline: none;
    &::placeholder { color: $text-faint; }
    &:focus { border-color: rgba(139,13,29,0.5); }
}
.feat-count-badge {
    position: absolute; right: 12px; background: rgba(139,13,29,0.15);
    border-radius: 20px; padding: 2px 10px; font-size: 11px;
    font-weight: 700; color: #fca5a5;
}
.feat-group { margin-bottom: 8px; }
.feat-group-header {
    width: 100%; display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
    border-radius: $r-sm; padding: 11px 14px; cursor: pointer;
    font-size: 13px; font-weight: 600; color: $text-muted; font-family: inherit;
    transition: background 0.2s;
    &:hover { background: rgba(255,255,255,0.04); }
    .fgh-icon { color: $red; flex-shrink: 0; }
    .fgh-count { margin-left: auto; font-size: 11px; color: $text-faint; }
    .fgh-arrow { color: $text-faint; }
}
.feat-pills {
    display: flex; flex-wrap: wrap; gap: 8px;
    padding: 14px 4px 8px;
}
.feat-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 20px; cursor: pointer;
    font-size: 12.5px; font-family: inherit; font-weight: 500;
    border: 1px solid $border; color: $text-muted;
    background: rgba(255,255,255,0.02);
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    &:hover { border-color: rgba(139,13,29,0.4); color: $text; }
    &--on { border-color: $red; background: rgba(139,13,29,0.12); color: $text; }
    .pill-check { color: $red; flex-shrink: 0; }
}
.feat-actions {
    display: flex; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid $border;
}
.feat-expand-btn {
    background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-dim; font-size: 12px; padding: 6px 12px; cursor: pointer; font-family: inherit;
    &:hover { border-color: $text-faint; color: $text; }
}
.feat-empty {
    text-align: center; padding: 60px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    color: $text-faint; font-size: 14px;
}

// ── Description / title step ──────────────────────────────────────────────────
.btn-ai {
    display: flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, rgba(139,13,29,0.2), rgba(139,13,29,0.1));
    border: 1px solid rgba(139,13,29,0.3); border-radius: $r-sm;
    color: #fca5a5; font-size: 12px; font-weight: 600; padding: 6px 14px;
    cursor: pointer; font-family: inherit; transition: background 0.2s;
    &:hover:not(:disabled) { background: rgba(139,13,29,0.3); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.desc-meta {
    display: flex; align-items: center; gap: 12px; margin-top: 10px;
    .desc-chars { font-size: 13px; font-weight: 700;
        &.dc-great { color: #22c55e; } &.dc-good { color: #86efac; }
        &.dc-ok { color: #fde68a; } &.dc-poor { color: #fca5a5; }
    }
    .desc-quality-label { font-size: 12px; color: $text-faint; }
}
.desc-tips {
    display: flex; gap: 16px; margin-top: 8px;
    .dt-item {
        display: flex; align-items: center; gap: 5px;
        font-size: 11.5px; color: $text-faint;
        &.dt-done { color: #22c55e; }
    }
}

// ── Price step ────────────────────────────────────────────────────────────────
.price-row { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
.price-opts { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; border-top: 1px solid $border; padding-top: 14px; }
.seller-type-toggle { display: flex; gap: 8px; }
.stt-opt {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: $r-sm; border: 1px solid $border;
    font-size: 13px; color: $text-muted; cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    &.active { border-color: $red; background: rgba(139,13,29,0.1); color: $text; }
}
.promo-intro { font-size: 13px; color: $text-dim; margin-bottom: 16px; }
.promo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 12px; margin-bottom: 16px; }
.promo-card {
    position: relative; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    border-radius: $r-md; padding: 16px; cursor: pointer; transition: border-color 0.2s, background 0.2s;
    &:hover { border-color: rgba(255,255,255,0.14); }
    &--active { border-color: $red; background: rgba(139,13,29,0.1); }
    &--popular { border-color: rgba(245,158,11,0.3); }
    .pc-popular-badge {
        position: absolute; top: -1px; right: 10px;
        background: #f59e0b; color: #000; font-size: 10px; font-weight: 800;
        padding: 2px 8px; border-radius: 0 0 6px 6px; letter-spacing: 0.05em;
    }
    .pc-icon { color: $red; margin-bottom: 8px; display: block; }
    .pc-name { font-size: 14px; font-weight: 700; color: $text; margin-bottom: 4px; }
    .pc-price { font-size: 18px; font-weight: 800; color: $red; margin-bottom: 6px; }
    .pc-desc { font-size: 11.5px; color: $text-faint; line-height: 1.4; }
    .pc-days-row { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
    .pc-day-btn {
        background: rgba(255,255,255,0.04); border: 1px solid $border;
        border-radius: 6px; padding: 5px 10px; font-size: 12px; color: $text-muted;
        cursor: pointer; font-family: inherit; transition: background 0.15s;
        &.active { background: rgba(139,13,29,0.2); border-color: $red; color: $text; }
    }
}
.promo-coupon { border-top: 1px solid $border; padding-top: 14px; }
.promo-coupon-row { display: flex; gap: 10px; }
.btn-coupon {
    background: rgba(255,255,255,0.05); border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 13px; padding: 10px 16px; cursor: pointer; font-family: inherit;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:hover:not(:disabled) { border-color: $text-dim; color: $text; }
}
.ps-coupon-error { font-size: 12px; color: #fca5a5; margin-top: 6px; }
.ps-coupon-ok { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #86efac; margin-top: 6px; }

// ── Publish step ──────────────────────────────────────────────────────────────
.preview-advert-card {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-xl; overflow: hidden; display: flex; gap: 0;
    margin-bottom: 24px;
}
.pac-img-wrap {
    width: 280px; flex-shrink: 0; position: relative;
    img.pac-img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 200px; }
    .pac-photo-count {
        position: absolute; bottom: 10px; right: 10px;
        background: rgba(0,0,0,0.75); color: #fff; font-size: 11px;
        padding: 3px 8px; border-radius: 6px;
        display: flex; align-items: center; gap: 4px;
    }
}
.pac-info { flex: 1; padding: 24px 28px; display: flex; flex-direction: column; gap: 8px; }
.pac-category { font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: $red; }
.pac-title { font-size: 20px; font-weight: 800; color: $text; margin: 0; }
.pac-specs { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; color: $text-dim; }
.pac-dot { color: $text-faint; }
.pac-price { font-size: 26px; font-weight: 800; color: $text; }
.pac-nego { font-size: 13px; font-weight: 500; color: $text-dim; margin-left: 8px; }
.pac-location { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: $text-dim; }
.pac-desc { font-size: 13.5px; color: $text-dim; line-height: 1.6; margin: 0; }

.pub-summary-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px;
}
.psg-item {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
    border-radius: $r-md; padding: 20px 16px; text-align: center;
    .psg-icon { color: $text-faint; margin-bottom: 8px; display: block; }
    .psg-val { font-size: 22px; font-weight: 800; color: $text; }
    .psg-label { font-size: 11px; color: $text-faint; margin-top: 2px; }
    &.psg-great { border-color: rgba(34,197,94,0.3); .psg-icon { color: #22c55e; } .psg-val { color: #22c55e; } }
    &.psg-ok { border-color: rgba(245,158,11,0.3); .psg-icon { color: #f59e0b; } .psg-val { color: #f59e0b; } }
    &.psg-low { border-color: rgba(139,13,29,0.3); .psg-icon { color: $red; } .psg-val { color: #fca5a5; } }
}

.publish-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.btn-publish-main {
    display: flex; align-items: center; gap: 10px;
    background: $red; border: none; border-radius: $r-md;
    color: #fff; font-size: 16px; font-weight: 700; padding: 16px 32px;
    cursor: pointer; font-family: inherit; transition: background 0.2s, transform 0.15s;
    &:hover:not(:disabled) { background: darken(#8B0D1D, 8%); transform: translateY(-1px); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
    &.btn-publish-pay { background: linear-gradient(135deg, #1a1a1a, #2a0a10); border: 1px solid $red; }
}
.pub-disclaimer { display: flex; align-items: center; gap: 6px; font-size: 12px; color: $text-faint; }

// ── Navigation ────────────────────────────────────────────────────────────────
.nav-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 36px; padding-top: 24px; border-top: 1px solid $border;
}
.btn-prev {
    display: flex; align-items: center; gap: 7px;
    background: transparent; border: 1px solid $border; border-radius: $r-sm;
    color: $text-muted; font-size: 13.5px; font-weight: 600; padding: 10px 18px;
    cursor: pointer; font-family: inherit; transition: border-color 0.2s, color 0.2s;
    &:hover { border-color: $text-dim; color: $text; }
}
.btn-next-main {
    display: flex; align-items: center; gap: 8px;
    background: $red; border: none; border-radius: $r-sm;
    color: #fff; font-size: 14px; font-weight: 700; padding: 11px 24px;
    cursor: pointer; font-family: inherit; transition: background 0.2s;
    &:hover { background: darken(#8B0D1D, 8%); }
}

// ── Transitions ───────────────────────────────────────────────────────────────
.step-fade-enter-active, .step-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-fade-enter-from { opacity: 0; transform: translateX(14px); }
.step-fade-leave-to { opacity: 0; transform: translateX(-14px); }

.feat-slide-enter-active, .feat-slide-leave-active { transition: opacity 0.2s, max-height 0.25s; overflow: hidden; max-height: 2000px; }
.feat-slide-enter-from, .feat-slide-leave-to { opacity: 0; max-height: 0; }

.fade-err-enter-active, .fade-err-leave-active { transition: opacity 0.25s; }
.fade-err-enter-from, .fade-err-leave-to { opacity: 0; }

.success-fade-enter-active, .success-fade-leave-active { transition: opacity 0.4s; }
.success-fade-enter-from, .success-fade-leave-to { opacity: 0; }

// ── Success screen ────────────────────────────────────────────────────────────
.success-screen {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(5,5,5,0.96); backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center;
}
.success-card {
    max-width: 520px; width: 90%; text-align: center; padding: 48px 40px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px; position: relative;
}
.success-logo { height: 28px; margin-bottom: 24px; opacity: 0.8; }
.success-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 28px; }
.confetti-dot {
    position: absolute; width: 7px; height: 7px; border-radius: 50%;
    background: $red; opacity: 0;
    top: calc(5% * var(--i)); left: calc(8% * var(--i));
    animation: confetti-pop 1.2s calc(0.08s * var(--i)) ease forwards;
}
@keyframes confetti-pop {
    0% { opacity: 0; transform: translateY(0) scale(0); }
    40% { opacity: 1; transform: translateY(-40px) scale(1.2); }
    100% { opacity: 0; transform: translateY(-80px) scale(0.5); }
}
.success-icon-wrap { margin-bottom: 20px; }
.success-icon { color: #22c55e; }
.success-title { font-size: 24px; font-weight: 800; color: $text; margin: 0 0 12px; }
.success-desc { font-size: 14px; color: $text-dim; line-height: 1.6; margin: 0 0 28px; }
.success-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.sact-btn {
    display: flex; align-items: center; gap: 8px; padding: 12px 24px;
    border-radius: $r-md; font-size: 14px; font-weight: 600; text-decoration: none;
    transition: background 0.2s; width: 100%; justify-content: center; max-width: 340px;
    &--primary { background: $red; color: #fff; &:hover { background: darken(#8B0D1D, 8%); } }
    &--secondary { background: rgba(255,255,255,0.07); color: $text; border: 1px solid $border; &:hover { background: rgba(255,255,255,0.1); } }
    &--ghost { background: transparent; color: $text-dim; &:hover { color: $text; } }
}
.success-tip {
    margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 12.5px; color: $text-faint;
    .tip-link { color: $text-dim; text-decoration: underline; }
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

// feat highlight
:deep(.feat-hl) { background: rgba(139,13,29,0.25); color: $text; border-radius: 2px; padding: 0 2px; }

// ── Responsive ───────────────────────────────────────────────────────────────
@media (max-width: 1100px) {
    .left-sidebar { width: 220px; min-width: 220px; }
    .score-panel { display: none; }
}
@media (max-width: 780px) {
    .left-sidebar { display: none; }
    .center-area { padding: 20px 16px 60px; }
    .fields-grid { grid-template-columns: 1fr; }
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
    .preview-advert-card { flex-direction: column; }
    .pac-img-wrap { width: 100%; }
    .pub-summary-grid { grid-template-columns: repeat(2, 1fr); }
    .promo-grid { grid-template-columns: 1fr; }
}

</style>
