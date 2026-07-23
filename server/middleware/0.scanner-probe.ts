import { defineEventHandler, getRequestURL, setResponseStatus } from 'h3'

// This site has no routes at any of these paths — they're the well-known scanner
// signature for exposed config/credential files and debug endpoints (config.js,
// .aws/config, phpinfo.php, /_debugbar, wp-login.php, ...). Reject them here, before
// the maintenance gate, page rendering, or Vue Router try to match them — matching them
// on the client just produces "No match found for location" console warnings for traffic
// that was never going anywhere.
const SCANNER_PROBE_PREFIXES = [
    '/_debugbar', '/debugbar', '/debug', '/info.php', '/phpinfo.php', '/test.php',
    '/aws-config.js', '/aws.config.js', '/aws-credentials', '/aws.json', '/.aws/',
    '/.s3cfg', '/.git/', '/.svn/', '/.env', '/wp-admin', '/wp-login.php', '/xmlrpc.php',
]

export default defineEventHandler((event) => {
    const path = getRequestURL(event).pathname

    if (SCANNER_PROBE_PREFIXES.some(p => path.toLowerCase().startsWith(p))) {
        setResponseStatus(event, 404)
        return ''
    }
})
