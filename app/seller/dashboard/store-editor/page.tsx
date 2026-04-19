"use client";

import { useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

export default function StoreEditorPage() {
  const [storeName, setStoreName]     = useState("Example Farms");
  const [tagline, setTagline]         = useState("Fresh from the field to your table");
  const [about, setAbout]             = useState("We are a family-run farm nestled in the rolling hills of the countryside. Our mission is to grow the freshest, most nutritious produce using sustainable farming practices that respect the land and the communities we serve.");
  const [location, setLocation]       = useState("Asheville, NC");
  const [phone, setPhone]             = useState("(828) 555-0192");
  const [website, setWebsite]         = useState("www.examplefarms.com");
  const [instagram, setInstagram]     = useState("@examplefarms");
  const [facebook, setFacebook]       = useState("facebook.com/examplefarms");
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [showBadge, setShowBadge]     = useState(true);
  const [saved, setSaved]             = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Store Editor</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Edit form — left 3 cols */}
          <div className="lg:col-span-3 space-y-5">

            {/* Branding */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Branding</h2>

              {/* Banner upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1a4a2e]/50 hover:bg-[#1a4a2e]/5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-xs text-gray-500">Upload banner image (1200 × 300px recommended)</span>
                  <input type="file" accept="image/*" className="hidden"/>
                </label>
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a4a2e] flex items-center justify-center text-white font-bold text-xl shrink-0">E</div>
                  <label className="cursor-pointer border border-gray-300 text-gray-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    Change Logo
                    <input type="file" accept="image/*" className="hidden"/>
                  </label>
                </div>
              </div>

              {/* Name & tagline */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                  <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="A short phrase that describes your farm" className={inputCls}/>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">About Your Farm</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm Story</label>
                <textarea rows={4} value={about} onChange={e => setAbout(e.target.value)}
                  className={inputCls + " resize-none"}/>
                <p className="text-xs text-gray-400 mt-1">{about.length} / 500 characters</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.yourfarm.com" className={inputCls}/>
              </div>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Social Media</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input type="text" value={instagram.replace("@","")} onChange={e => setInstagram("@" + e.target.value)} className={inputCls + " pl-8"}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} className={inputCls}/>
              </div>
            </div>

            {/* Store settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Store Settings</h2>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">Accept New Orders</p>
                  <p className="text-xs text-gray-500 mt-0.5">Toggle off to temporarily pause your store</p>
                </div>
                <button onClick={() => setAcceptOrders(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${acceptOrders ? "bg-[#1a4a2e]" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${acceptOrders ? "translate-x-5" : "translate-x-0"}`}/>
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Show &quot;Certified Natural&quot; Badge</p>
                  <p className="text-xs text-gray-500 mt-0.5">Display your certification on your public store page</p>
                </div>
                <button onClick={() => setShowBadge(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${showBadge ? "bg-[#1a4a2e]" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${showBadge ? "translate-x-5" : "translate-x-0"}`}/>
                </button>
              </div>
            </div>
          </div>

          {/* Live preview — right 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Live Preview</p>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-br from-[#1a4a2e] to-[#2d6b47] relative">
                  <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 200 80" fill="white" className="w-full h-full">
                      <circle cx="20" cy="20" r="15" opacity="0.5"/>
                      <circle cx="180" cy="60" r="20" opacity="0.4"/>
                      <circle cx="100" cy="10" r="8" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
                {/* Logo */}
                <div className="px-4 pb-4">
                  <div className="flex items-end gap-3 -mt-6 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1a4a2e] border-2 border-white flex items-center justify-center text-white font-bold text-lg shadow">
                      {storeName.charAt(0)}
                    </div>
                    {showBadge && (
                      <span className="mb-1 inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                        Certified Natural
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{storeName || "Store Name"}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 italic">{tagline || "Your tagline"}</p>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{about}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {location || "Location"}
                  </div>
                  {!acceptOrders && (
                    <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700 font-medium">
                      Currently not accepting new orders
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">This is how your store appears to shoppers</p>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
