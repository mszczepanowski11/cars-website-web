export const useShare = () => {
    const copied = ref(false)

    function shareNative(url: string, title: string, text?: string): boolean {
        if (typeof navigator === 'undefined' || !navigator.share) return false
        navigator.share({ title, text: text ?? title, url }).catch(() => {})
        return true
    }

    function shareOnFacebook(url: string) {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400,noreferrer')
    }

    function shareOnX(url: string, text: string) {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400,noreferrer')
    }

    function shareOnWhatsApp(url: string, text: string) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank', 'noreferrer')
    }

    function shareOnMessenger(url: string) {
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=&redirect_uri=${encodeURIComponent(url)}`, '_blank', 'noreferrer')
    }

    async function copyLink(url: string): Promise<void> {
        await navigator.clipboard.writeText(url)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    }

    return { copied, shareNative, shareOnFacebook, shareOnX, shareOnWhatsApp, shareOnMessenger, copyLink }
}
