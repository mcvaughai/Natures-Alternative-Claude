const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

export const logoutCustomer = async () => {
  const session = JSON.parse(localStorage.getItem('customer_session') || '{}')
  if (session.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
    }).catch(() => {})
  }
  localStorage.removeItem('customer_session')
  window.location.href = '/login'
}

export const logoutSeller = async () => {
  const session = JSON.parse(localStorage.getItem('seller_session') || '{}')
  if (session.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
    }).catch(() => {})
  }
  localStorage.removeItem('seller_session')
  window.location.href = '/seller/login'
}

export const logoutAdmin = async () => {
  const session = JSON.parse(localStorage.getItem('admin_session') || '{}')
  if (session.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${session.access_token}` }
    }).catch(() => {})
  }
  localStorage.removeItem('admin_session')
  window.location.href = '/admin/login'
}
