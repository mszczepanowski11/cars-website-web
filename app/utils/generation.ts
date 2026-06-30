export function generationLabel(g: { name: string; yearFrom?: number | null; yearTo?: number | null } | null | undefined): string {
    if (!g) return ''
    if (!g.yearFrom) return g.name
    return g.yearTo ? `${g.yearFrom} – ${g.yearTo}` : `od ${g.yearFrom}`
}
