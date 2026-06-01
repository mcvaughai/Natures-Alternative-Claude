'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AccountSidebar from '@/components/account/AccountSidebar'

const SUPABASE_URL = 'https://ezryfycxfmtffobyfjfa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs'

export default function AutoHarvestPage() {
  const [session, setSession]     = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [lists, setLists]         = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'lists' | 'upcoming' | 'history'>('lists')

  useEffect(() => {
    const sessionStr = localStorage.getItem('customer_session')
    if (!sessionStr) {
      window.location.href = '/login'
      return
    }
    const sess = JSON.parse(sessionStr)
    setSession(sess)
    fetchAutoHarvestLists(sess)
  }, [])

  const fetchAutoHarvestLists = async (sess: any) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/auto_harvest_lists?user_id=eq.${sess.user_id}&select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${sess.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await res.json()
      setLists(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching auto harvest lists:', err)
      setLists([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

            <AccountSidebar />

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">

                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="font-raleway text-2xl font-bold text-gray-900">
                      Auto Harvest
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Set up recurring orders from your favorite farms
                    </p>
                  </div>
                  <button
                    className="px-5 py-2.5 rounded-full text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#053D2D' }}
                    onClick={() => alert('Create Auto Harvest List coming soon!')}
                  >
                    + New Auto Harvest List
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200">
                  {[
                    { key: 'lists',    label: 'My Lists'         },
                    { key: 'upcoming', label: 'Upcoming Orders'  },
                    { key: 'history',  label: 'Order History'    },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2"
                      style={{
                        borderColor: activeTab === tab.key ? '#053D2D' : 'transparent',
                        color:       activeTab === tab.key ? '#053D2D' : '#6b7280',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab: My Lists */}
                {activeTab === 'lists' && (
                  <div>
                    {lists.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-5xl mb-4">🌾</div>
                        <h3 className="font-raleway font-bold text-gray-700 text-xl mb-2">
                          No Auto Harvest Lists Yet
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                          Create a recurring order list and get fresh farm products
                          delivered automatically on your schedule.
                        </p>
                        <button
                          className="inline-block px-6 py-3 rounded-full text-white font-medium"
                          style={{ backgroundColor: '#053D2D' }}
                          onClick={() => alert('Create Auto Harvest List coming soon!')}
                        >
                          Create Your First List
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lists.map((list: any) => (
                          <div
                            key={list.id}
                            className="bg-white border border-gray-200 rounded-2xl p-5"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-raleway font-bold text-gray-900">
                                  {list.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {list.frequency} · Next order:{' '}
                                  {list.next_order_date
                                    ? new Date(list.next_order_date).toLocaleDateString()
                                    : 'Not scheduled'}
                                </p>
                              </div>
                              <span
                                className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                                style={{
                                  backgroundColor: list.status === 'active' ? '#dcfce7' : '#f3f4f6',
                                  color:           list.status === 'active' ? '#15803d' : '#6b7280',
                                }}
                              >
                                {list.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Upcoming Orders */}
                {activeTab === 'upcoming' && (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className="font-raleway font-bold text-gray-700 text-xl mb-2">
                      No Upcoming Orders
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Upcoming auto harvest orders will appear here
                    </p>
                  </div>
                )}

                {/* Tab: Order History */}
                {activeTab === 'history' && (
                  <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="font-raleway font-bold text-gray-700 text-xl mb-2">
                      No Order History
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Completed auto harvest orders will appear here
                    </p>
                  </div>
                )}

                {/* How It Works */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0fdf4' }}>
                  <h3 className="font-raleway font-bold text-green-900 mb-4">
                    🌾 How Auto Harvest Works
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        icon: '📝',
                        title: 'Create a List',
                        description: 'Add your favorite products from local farms to a recurring list',
                      },
                      {
                        icon: '⏰',
                        title: 'Set Your Schedule',
                        description: 'Choose weekly, bi-weekly or monthly delivery frequency',
                      },
                      {
                        icon: '🚗',
                        title: 'Auto Delivered',
                        description: 'Orders are placed automatically and farms are notified',
                      },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <p className="font-semibold text-green-900 text-sm mb-1">{item.title}</p>
                        <p className="text-green-700 text-xs">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
