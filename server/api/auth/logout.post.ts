export default defineEventHandler(async (event) => {
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'auth_status')
    deleteCookie(event, 'auth_expiry')
    return { success: true }
})
