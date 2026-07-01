// Re-export the lowercase handler so both /api/Payment/webhook and
// /api/payment/webhook resolve to the same logic on case-sensitive Linux filesystems.
export { default } from '../payment/webhook.post'
