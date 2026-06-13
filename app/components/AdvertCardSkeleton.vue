<template>
    <div class="skel-card">
        <div class="skel-img" />
        <div class="skel-body">
            <div class="skel-line skel-title" />
            <div class="skel-meta">
                <div class="skel-line skel-chip" />
                <div class="skel-line skel-chip" />
                <div class="skel-line skel-chip" />
            </div>
            <div class="skel-line skel-price" />
            <div class="skel-line skel-footer" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes skeleton-pulse {
    0%   { opacity: 0.5; }
    50%  { opacity: 1; }
    100% { opacity: 0.5; }
}

.skel-card {
    @include card;
    overflow: hidden;
    animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skel-img {
    width: 100%;
    height: 200px;
    background: #181818;
}

.skel-body { padding: 16px; }

.skel-line {
    background: #1c1c1c;
    border-radius: 6px;
}

.skel-title {
    height: 18px;
    width: 80%;
    margin-bottom: 12px;
}

.skel-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}

.skel-chip {
    height: 13px;
    width: 60px;
    border-radius: 4px;
}

.skel-price {
    height: 24px;
    width: 45%;
    margin-bottom: 12px;
}

.skel-footer {
    height: 12px;
    width: 55%;
}
</style>
