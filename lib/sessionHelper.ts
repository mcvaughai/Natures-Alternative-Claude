const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

// ── Synchronous session readers ──────────────────────────────────────────────

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

// ── Token-expiry helpers ─────────────────────────────────────────────────────

function isTokenExpiringSoon(accessToken: string): boolean {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    return (payload.exp * 1000) - Date.now() < 5 * 60 * 1000
  } catch {
    return true // treat unparseable tokens as expired
  }
}

// ── Seller token refresh ─────────────────────────────────────────────────────

export const refreshSellerToken = async () => {
  try {
    const sessionStr = localStorage.getItem('seller_session')
    if (!sessionStr) return null
    const session = JSON.parse(sessionStr)

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      localStorage.removeItem('seller_session')
      window.location.href = '/seller/login'
      return null
    }

    const updated = { ...session, access_token: data.access_token, refresh_token: data.refresh_token }
    localStorage.setItem('seller_session', JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Seller token refresh error:', err)
    localStorage.removeItem('seller_session')
    window.location.href = '/seller/login'
    return null
  }
}

export const getValidSellerSession = async () => {
  try {
    const sessionStr = localStorage.getItem('seller_session')
    if (!sessionStr) { window.location.href = '/seller/login'; return null }
    const session = JSON.parse(sessionStr)
    if (isTokenExpiringSoon(session.access_token)) {
      console.log('Seller token expiring soon, refreshing...')
      return await refreshSellerToken()
    }
    return session
  } catch {
    return await refreshSellerToken()
  }
}

// ── Admin token refresh ──────────────────────────────────────────────────────

export const refreshAdminToken = async () => {
  try {
    const sessionStr = localStorage.getItem('admin_session')
    if (!sessionStr) return null
    const session = JSON.parse(sessionStr)

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      localStorage.removeItem('admin_session')
      window.location.href = '/admin/login'
      return null
    }

    const updated = { ...session, access_token: data.access_token, refresh_token: data.refresh_token }
    localStorage.setItem('admin_session', JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Admin token refresh error:', err)
    localStorage.removeItem('admin_session')
    window.location.href = '/admin/login'
    return null
  }
}

export const getValidAdminSession = async () => {
  try {
    const sessionStr = localStorage.getItem('admin_session')
    if (!sessionStr) { window.location.href = '/admin/login'; return null }
    const session = JSON.parse(sessionStr)
    if (isTokenExpiringSoon(session.access_token)) {
      console.log('Admin token expiring soon, refreshing...')
      return await refreshAdminToken()
    }
    return session
  } catch {
    return await refreshAdminToken()
  }
}

// ── Customer token refresh ───────────────────────────────────────────────────

export const refreshCustomerToken = async () => {
  try {
    const sessionStr = localStorage.getItem('customer_session')
    if (!sessionStr) return null
    const session = JSON.parse(sessionStr)

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      localStorage.removeItem('customer_session')
      window.location.href = '/login'
      return null
    }

    const updated = { ...session, access_token: data.access_token, refresh_token: data.refresh_token }
    localStorage.setItem('customer_session', JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Customer token refresh error:', err)
    localStorage.removeItem('customer_session')
    window.location.href = '/login'
    return null
  }
}

export const getValidCustomerSession = async () => {
  try {
    const sessionStr = localStorage.getItem('customer_session')
    if (!sessionStr) { window.location.href = '/login'; return null }
    const session = JSON.parse(sessionStr)
    if (isTokenExpiringSoon(session.access_token)) {
      console.log('Customer token expiring soon, refreshing...')
      return await refreshCustomerToken()
    }
    return session
  } catch {
    return await refreshCustomerToken()
  }
}
