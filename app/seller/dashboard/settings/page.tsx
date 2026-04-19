"use client";

import { useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-[#1a4a2e]" : "bg-gray-300"}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0"}`}/>
    </button>
  );
}

function PasswordInput({ id, placeholder, label }: { id: string; placeholder?: string; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} placeholder={placeholder ?? "••••••••"}
          className={inputCls + " pr-11"}/>
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-4.364l-14.728 14.728"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SellerSettingsPage() {
  const [saved, setSaved]       = useState(false);
  const [firstName, setFirstName] = useState("Jane");
  const [lastName, setLastName]   = useState("Farmer");
  const [email, setEmail]         = useState("seller@test.com");
  const [phone, setPhone]         = useState("(828) 555-0192");

  // Notification toggles
  const [newOrder, setNewOrder]           = useState(true);
  const [orderUpdate, setOrderUpdate]     = useState(true);
  const [lowStock, setLowStock]           = useState(true);
  const [newsletter, setNewsletter]       = useState(false);
  const [weeklyReport, setWeeklyReport]   = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white"}`}>
            {saved ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Saved!
              </>
            ) : "Save Changes"}
          </button>
        </div>

        {/* Farm Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Account Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a4a2e] flex items-center justify-center text-white font-bold text-2xl shrink-0">J</div>
            <div>
              <button className="text-sm font-semibold text-[#1a4a2e] hover:underline">Change Photo</button>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · Max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls}/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls}/>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Change Password</h2>
          <PasswordInput id="current-pw"  label="Current Password"/>
          <PasswordInput id="new-pw"      label="New Password" placeholder="Min 8 characters"/>
          <PasswordInput id="confirm-pw"  label="Confirm New Password"/>
          <button className="text-sm font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-5 py-2 rounded-xl transition-colors">
            Update Password
          </button>
        </div>

        {/* Payout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Payout Information</h2>
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800">Payouts powered by Stripe</p>
              <p className="text-xs text-blue-700 mt-0.5">Connect your Stripe account to receive direct deposits every 7 days. Natures Alternative takes a 5% platform fee per sale.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            Connect Stripe Account
          </button>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Subscription Plan</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Starter — current */}
            <div className="rounded-xl border-2 border-[#1a4a2e] p-4 relative">
              <span className="absolute -top-2.5 left-4 bg-[#1a4a2e] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Current Plan</span>
              <p className="text-base font-bold text-gray-900 mt-1">Starter</p>
              <p className="text-2xl font-bold text-[#1a4a2e] mt-1">Free</p>
              <ul className="mt-3 space-y-1.5">
                {["Up to 20 products","Basic analytics","Email support"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#1a4a2e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Pro — waitlist */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 opacity-70">
              <p className="text-base font-bold text-gray-900">Pro</p>
              <p className="text-2xl font-bold text-gray-500 mt-1">$19<span className="text-sm font-normal text-gray-400">/mo</span></p>
              <ul className="mt-3 space-y-1.5">
                {["Unlimited products","Advanced analytics","Priority support","Featured listings"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full border border-gray-300 text-gray-500 font-semibold text-xs py-2 rounded-lg cursor-not-allowed" disabled>
                Join Waitlist
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">Pro plan coming soon. Join the waitlist to be notified when it launches.</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-1">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Notification Preferences</h2>
          {[
            { label: "New Order Received",    sub: "Get notified when a customer places an order",   val: newOrder,      set: setNewOrder      },
            { label: "Order Status Updates",  sub: "Alerts when an order status changes",            val: orderUpdate,   set: setOrderUpdate   },
            { label: "Low Stock Alerts",      sub: "Notify when a product stock falls below 5",      val: lowStock,      set: setLowStock      },
            { label: "Natures Alternative Newsletter", sub: "Platform updates and farming tips",     val: newsletter,    set: setNewsletter    },
            { label: "Weekly Sales Report",   sub: "Summary of your weekly performance",             val: weeklyReport,  set: setWeeklyReport  },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{n.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.sub}</p>
              </div>
              <Toggle on={n.val} onToggle={() => n.set((v: boolean) => !v)}/>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Pause Store</p>
              <p className="text-xs text-gray-500 mt-0.5">Temporarily hide your store from buyers and stop accepting orders</p>
            </div>
            <button className="border border-orange-300 text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap">
              Pause Store
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Close Seller Account</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently remove your store and all associated data. This cannot be undone.</p>
            </div>
            <button className="border border-red-300 text-red-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-colors whitespace-nowrap">
              Close Account
            </button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
