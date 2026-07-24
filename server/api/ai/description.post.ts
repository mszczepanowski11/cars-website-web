export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    rateLimit(event, 'ai-description', 10, 60 * 60_000) // 10 per hour per IP

    const body = await readBody(event)
    if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid body' })

    // Category-agnostic shape: `categoryName` says what's being sold ("Opony", "Łodzie i jachty",
    // "Auta osobowe", ...), `details` is a flat label->value map the caller already resolved from
    // whatever fields apply to THAT category (brand/model/year for cars, producent/rozmiar for
    // opony, hullMaterial/lengthM for boats, ...). Nothing here assumes "vehicle" - that was the bug
    // reported: picking "Opony" and generating a description still talked about selling a car.
    const categoryName = typeof body.categoryName === 'string' ? body.categoryName.slice(0, 100) : ''
    const itemLabel = typeof body.itemLabel === 'string' ? body.itemLabel.slice(0, 150) : ''
    const rawDetails = body.details && typeof body.details === 'object' ? body.details as Record<string, unknown> : {}
    const details: Record<string, string> = {}
    for (const [key, value] of Object.entries(rawDetails).slice(0, 30)) {
        if (value === null || value === undefined || value === '') continue
        details[String(key).slice(0, 60)] = String(value).slice(0, 200)
    }
    const history = typeof body.history === 'string' ? body.history.slice(0, 500) : ''

    const detailLines = Object.entries(details).map(([label, value]) => `${label}: ${value}`)

    const config = useRuntimeConfig()
    const apiKey = (config as any).anthropicApiKey || process.env.ANTHROPIC_API_KEY || ''
    if (!apiKey) {
        return { description: generateTemplate(categoryName, itemLabel, detailLines) }
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: `Napisz profesjonalny, przekonujący opis ogłoszenia sprzedaży po polsku (300-500 słów).
Kategoria ogłoszenia: ${categoryName || 'nieznana'}${itemLabel ? `\nPrzedmiot: ${itemLabel}` : ''}
${detailLines.length ? detailLines.join('\n') : 'Brak dodatkowych danych.'}
${history ? `Historia/dodatkowe informacje: ${history}` : ''}

Ważne: opis musi pasować do TEJ konkretnej kategorii i tych danych - nie zakładaj, że to samochód,
chyba że kategoria lub dane na to wyraźnie wskazują (np. "Opony"/"Felgi" to części, nie pojazd;
"Łodzie i jachty" to łódź, nie auto; itd.). Nie używaj nawiasów kwadratowych ani placeholderów.`
                }]
            })
        })
        const data = await response.json()
        return { description: data.content?.[0]?.text ?? generateTemplate(categoryName, itemLabel, detailLines) }
    } catch {
        return { description: generateTemplate(categoryName, itemLabel, detailLines) }
    }
})

function generateTemplate(categoryName: string, itemLabel: string, detailLines: string[]): string {
    const subject = itemLabel || categoryName || 'przedmiot'
    const detailsBlock = detailLines.length ? `\n\n${detailLines.join('\n')}` : ''
    return `Oferuję na sprzedaż: ${subject}.${detailsBlock}

Stan bardzo dobry, zgodny z opisem. Możliwość oględzin przed zakupem. Cena do negocjacji dla poważnych kupujących.

Kontakt telefoniczny lub przez wiadomość na portalu.`
}
