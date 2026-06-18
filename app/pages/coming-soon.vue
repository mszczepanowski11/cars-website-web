<template>
  <div class="cs-root">
    <div class="cs-content">
      <img src="/carizo-logo.svg" alt="CARIZO" class="cs-logo" />
      <h1 class="cs-title">Już wkrótce</h1>
      <p class="cs-sub">Pracujemy nad czymś wyjątkowym. Wróć niebawem.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cs-root {
  min-height: 100vh;
  background: #050505;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cs-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.cs-logo {
  width: 160px;
  opacity: 0.9;
}

.cs-title {
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  margin: 0;
}

.cs-sub {
  font-size: 16px;
  color: #666;
  margin: 0;
}
</style>
