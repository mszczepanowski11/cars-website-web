export default defineEventHandler(async (event) => {
    deleteCookie(event, 'auth_token')
    deleteCookie(event, 'auth_status')
    return { success: true }
})