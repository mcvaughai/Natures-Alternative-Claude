const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

export const getCustomerSession = () => {
  try { const s = localStorage.getItem('customer_session'); return s ? JSON.parse(s) : null } catch { return null }
}
export const getSellerSession = () => {
  try { const s = localStorage.getItem('seller_session'); return s ? JSON.parse(s) : null } catch { return null }
}
export const getAdminSession = () => {
  try { const s = localStorage.getItem('admin_session'); return s ? JSON.parse(s) : null } catch { return null }
}
export const getAuthHeaders = (accessToken: string) => ({
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
})
