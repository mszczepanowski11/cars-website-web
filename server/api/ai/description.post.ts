export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const { brand, model, year, fuel, mileage, power, features, history } = body

    const apiKey = process.env.ANTHROPIC_API_KEY
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
