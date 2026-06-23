export interface PhotoAnalysisResult {
  score: number
  issues: string[]
  suggestions: string[]
  summary: string
}

export function usePhotoAnalysis() {
  async function analyzePhoto(file: File): Promise<PhotoAnalysisResult> {
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        const maxSize = 400
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(img.width * scale)
        canvas.height = Math.floor(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const { data: pixels } = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // 1. Resolution
        const megapixels = (img.width * img.height) / 1_000_000
        const resScore = Math.min(10, (megapixels / 0.48) * 10)

        // 2. Brightness (luminance)
        let totalLum = 0
        const gray: number[] = []
        for (let i = 0; i < pixels.length; i += 4) {
          const lum = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114
          totalLum += lum
          gray.push(lum)
        }
        const avgLum = totalLum / gray.length
        const brightScore =
          avgLum < 40 ? 2 : avgLum < 75 ? 5 : avgLum < 195 ? 10 : avgLum < 225 ? 6 : 3

        // 3. Sharpness via Laplacian variance
        const w = canvas.width
        const h = canvas.height
        let lapSum = 0
        let lapCount = 0
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x
            const lap =
              -gray[idx - w - 1] - gray[idx - w] - gray[idx - w + 1]
              - gray[idx - 1] + 8 * gray[idx] - gray[idx + 1]
              - gray[idx + w - 1] - gray[idx + w] - gray[idx + w + 1]
            lapSum += lap * lap
            lapCount++
          }
        }
        const lapVariance = lapCount > 0 ? lapSum / lapCount : 0
        const sharpScore = Math.min(10, Math.sqrt(lapVariance) / 8)

        // 4. File size
        const sizeKB = file.size / 1024
        const sizeScore = sizeKB < 80 ? 2 : sizeKB < 250 ? 5 : sizeKB < 500 ? 8 : 10

        // 5. Aspect ratio
        const ratio = img.width / img.height
        const aspectScore = ratio < 0.5 || ratio > 3.2 ? 4 : 10

        // Weighted total
        const raw =
          resScore * 0.25 +
          brightScore * 0.30 +
          sharpScore * 0.30 +
          sizeScore * 0.10 +
          aspectScore * 0.05
        const score = Math.max(1, Math.min(10, Math.round(raw)))

        // Feedback
        const issues: string[] = []
        const suggestions: string[] = []

        if (megapixels < 0.5) {
          issues.push('Zbyt niska rozdzielczość')
          suggestions.push('Użyj aparatu min. 5 MP lub zrób zdjęcie z bliska')
        }
        if (avgLum < 60) {
          issues.push('Zdjęcie jest za ciemne')
          suggestions.push('Fotografuj w dziennym świetle lub użyj lampy błyskowej')
        }
        if (avgLum > 215) {
          issues.push('Zdjęcie jest prześwietlone')
          suggestions.push('Unikaj fotografowania pod słońce lub w mocnym backlight')
        }
        if (sharpScore < 3.5) {
          issues.push('Zdjęcie jest rozmyte')
          suggestions.push('Upewnij się, że aparat jest nieruchomy — użyj statywu lub oparcia')
        }
        if (sizeKB < 150) {
          issues.push('Bardzo mały rozmiar pliku — niska jakość')
          suggestions.push('Eksportuj zdjęcie w wyższej jakości (JPEG min. 80%)')
        }
        if (ratio < 0.5 || ratio > 3.2) {
          issues.push('Nietypowe proporcje kadru')
          suggestions.push('Fotografuj w orientacji poziomej (16:9 lub 4:3)')
        }

        if (issues.length === 0) {
          suggestions.push('Świetne zdjęcie! Dla efektu WOW fotografuj o wschodzie lub zachodzie słońca')
        }

        const summary =
          score >= 8 ? 'Bardzo dobra jakość — zdjęcie przyciągnie uwagę'
          : score >= 6 ? 'Dobra jakość, możliwe drobne poprawki'
          : score >= 4 ? 'Przeciętna jakość — warto poprawić przed publikacją'
          : 'Niska jakość — zalecamy nowe, lepsze zdjęcie'

        URL.revokeObjectURL(objectUrl)
        resolve({ score, issues, suggestions, summary })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({
          score: 5,
          issues: [],
          suggestions: ['Nie udało się przetworzyć zdjęcia'],
          summary: 'Analiza niedostępna'
        })
      }

      img.src = objectUrl
    })
  }

  return { analyzePhoto }
}
