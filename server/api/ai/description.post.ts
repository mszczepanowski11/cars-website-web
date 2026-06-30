export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    rateLimit(event, 'ai-description', 10, 60 * 60_000) // 10 per hour per IP

    const body = await readBody(event)
    if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
    const brand = typeof body.brand === 'string' ? body.brand.slice(0, 100) : ''
    const model = typeof body.model === 'string' ? body.model.slice(0, 100) : ''
    const year = typeof body.year === 'number' ? body.year : null
    const fuel = typeof body.fuel === 'string' ? body.fuel.slice(0, 50) : ''
    const mileage = typeof body.mileage === 'number' ? body.mileage : null
    const power = typeof body.power === 'number' ? body.power : null
    const features = Array.isArray(body.features) ? (body.features as string[]).slice(0, 10).map(f => String(f).slice(0, 60)) : []
    const history = typeof body.history === 'string' ? body.history.slice(0, 500) : ''

    const config = useRuntimeConfig()
    const apiKey = (config as any).anthropicApiKey || process.env.ANTHROPIC_API_KEY || ''
    if (!apiKey) {
        return { description: generateTemplate(brand, model, year, fuel, mileage, power) }
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
                    content: `Napisz profesjonalny opis ogłoszenia sprzedaży pojazdu po polsku (300-500 słów):
Marka: ${brand || 'nieznana'}
Model: ${model || 'nieznany'}
Rok: ${year || 'nieznany'}
Paliwo: ${fuel || 'nieznane'}
Przebieg: ${mileage ? mileage + ' km' : 'nieznany'}
Moc: ${power ? power + ' KM' : 'nieznana'}
Wyposażenie: ${features?.slice(0, 10).join(', ') || 'standardowe'}
Historia: ${history || 'brak danych'}

Napisz przekonujący, szczery opis który zachęci kupujących. Nie używaj nawiasów kwadratowych ani szablonów.`
                }]
            })
        })
        const data = await response.json()
        return { description: data.content?.[0]?.text ?? generateTemplate(brand, model, year, fuel, mileage, power) }
    } catch {
        return { description: generateTemplate(brand, model, year, fuel, mileage, power) }
    }
})

function generateTemplate(brand: string, model: string, year: number, fuel: string, mileage: number, power: number): string {
    return `Oferuję na sprzedaż ${brand || 'pojazd'} ${model || ''} z ${year || 'roku'}. Pojazd jest w bardzo dobrym stanie technicznym i wizualnym.

${mileage ? `Przebieg wynosi ${mileage.toLocaleString('pl')} km.` : ''} ${fuel ? `Napęd: ${fuel}.` : ''} ${power ? `Moc silnika: ${power} KM.` : ''}

Pojazd był regularnie serwisowany i dbany. Możliwość oglądania i jazdy próbnej. Cena do negocjacji dla poważnych kupujących.

Kontakt telefoniczny lub przez wiadomość na portalu.`
}
