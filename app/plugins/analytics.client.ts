export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    // Set default consent state to denied BEFORE any analytics script loads.
    // This satisfies Google Consent Mode v2 requirements — scripts can load but
    // won't send identifying data until the user accepts cookies.
    ;(window as any).dataLayer = (window as any).dataLayer || []
    function gtag(...args: unknown[]) { (window as any).dataLayer.push(args) }
    gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
    })

    function injectScript(src: string, id: string) {
        if (document.getElementById(id)) return
        const s = document.createElement('script')
        s.src = src
        s.async = true
        s.id = id
        document.head.appendChild(s)
    }

    function injectInlineScript(code: string, id: string) {
        if (document.getElementById(id)) return
        const s = document.createElement('script')
        s.innerHTML = code
        s.id = id
        document.head.appendChild(s)
    }

    function loadGTM(id: string) {
        if (!id) return
        injectInlineScript(
            `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`,
            'gtm-script'
        )
        // noscript fallback
        if (!document.getElementById('gtm-noscript')) {
            const ns = document.createElement('noscript')
            ns.id = 'gtm-noscript'
            ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
            document.body.insertBefore(ns, document.body.firstChild)
        }
    }

    function loadGA4(id: string) {
        if (!id) return
        injectScript(`https://www.googletagmanager.com/gtag/js?id=${id}`, 'ga4-script')
        injectInlineScript(
            `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`,
            'ga4-config'
        )
    }

    function loadMetaPixel(id: string) {
        if (!id) return
        injectInlineScript(
            `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`,
            'meta-pixel-script'
        )
    }

    function loadClarity(id: string) {
        if (!id) return
        injectInlineScript(
            `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`,
            'clarity-script'
        )
    }

    function initAll() {
        loadGTM(config.public.gtmId as string)
        loadGA4(config.public.ga4Id as string)
        loadMetaPixel(config.public.metaPixelId as string)
        loadClarity(config.public.clarityId as string)
    }

    const consent = localStorage.getItem('cookieConsent')
    if (consent === 'all') {
        initAll()
    }

    window.addEventListener('cookieConsentAccepted', () => {
        initAll()
    })

    // Push route changes to GTM dataLayer
    const router = useRouter()
    router.afterEach((to) => {
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({ event: 'pageview', page: to.fullPath })
        }
    })
})
