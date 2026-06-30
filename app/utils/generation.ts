export function generationLabel(g: { name: string; yearFrom?: number | null; yearTo?: number | null } | null | undefined): string {
    if (!g) return ''
    // If the name already embeds a year range like "(2012–2019)" or "(2012–)", use it as-is
    if (/\(\d{4}[–\-]/.test(g.name)) return g.name
    if (!g.yearFrom) return g.name
    const range = g.yearTo ? `${g.yearFrom}–${g.yearTo}` : `${g.yearFrom}–`
    return `${g.name} (${range})`
}
