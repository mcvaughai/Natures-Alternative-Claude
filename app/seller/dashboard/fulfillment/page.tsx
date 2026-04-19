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

export default function FulfillmentPage() {
  const [pickup, setPickup]         = useState(true);
  const [delivery, setDelivery]     = useState(true);
  const [shipping, setShipping]     = useState(false);
  const [saved, setSaved]           = useState(false);

  // Pickup settings
  const [pickupAddr, setPickupAddr]     = useState("123 Farm Lane, Asheville, NC 28801");
  const [pickupHours, setPickupHours]   = useState("Tue–Sat, 9am–5pm");
  const [pickupNote, setPickupNote]     = useState("Please bring a cooler for perishables.");

  // Delivery settings
  const [deliveryRadius, setDeliveryRadius] = useState("15");
  const [deliveryFee, setDeliveryFee]       = useState("5.00");
  const [deliveryMin, setDeliveryMin]       = useState("25.00");
  const [deliveryDays, setDeliveryDays]     = useState("Wed, Fri");

  // Shipping settings
  const [carrier, setCarrier]         = useState("USPS");
  const [shippingMin, setShippingMin] = useState("35.00");
  const [freeThreshold, setFreeThreshold] = useState("75.00");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Fulfillment Settings</h1>
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

        {/* Pickup */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a4a2e]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1a4a2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Farm Pickup</p>
                <p className="text-xs text-gray-500">Customers pick up orders directly from your farm</p>
              </div>
            </div>
            <Toggle on={pickup} onToggle={() => setPickup(v => !v)}/>
          </div>
          {pickup && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Address</label>
                <input type="text" value={pickupAddr} onChange={e => setPickupAddr(e.target.value)} className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Hours</label>
                <input type="text" value={pickupHours} onChange={e => setPickupHours(e.target.value)} placeholder="e.g. Mon–Fri, 8am–4pm" className={inputCls}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
                <textarea rows={2} value={pickupNote} onChange={e => setPickupNote(e.target.value)}
                  className={inputCls + " resize-none"} placeholder="Directions, parking tips, etc."/>
              </div>
              <div className="bg-[#f5f0e8] rounded-xl px-4 py-3 text-xs text-gray-600">
                <span className="font-semibold">Tip:</span> Include directions and a phone number so customers can easily find you.
              </div>
            </div>
          )}
        </div>

        {/* Local Delivery */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Local Delivery</p>
                <p className="text-xs text-gray-500">You deliver orders within a set radius</p>
              </div>
            </div>
            <Toggle on={delivery} onToggle={() => setDelivery(v => !v)}/>
          </div>
          {delivery && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Radius (miles)</label>
                  <input type="number" value={deliveryRadius} onChange={e => setDeliveryRadius(e.target.value)} min="1" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Fee ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"}/>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={deliveryMin} onChange={e => setDeliveryMin(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Days</label>
                  <input type="text" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} placeholder="e.g. Mon, Wed, Fri" className={inputCls}/>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Shipping</p>
                <p className="text-xs text-gray-500">Ship orders nationwide via carrier</p>
              </div>
            </div>
            <Toggle on={shipping} onToggle={() => setShipping(v => !v)}/>
          </div>
          {shipping && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Carrier</label>
                <div className="relative">
                  <select value={carrier} onChange={e => setCarrier(e.target.value)}
                    className={inputCls + " appearance-none"}>
                    <option>USPS</option>
                    <option>UPS</option>
                    <option>FedEx</option>
                    <option>DHL</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={shippingMin} onChange={e => setShippingMin(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"}/>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                <span className="font-semibold">Note:</span> Shipping is best suited for non-perishable products. Make sure your packaging can withstand transit.
              </div>
            </div>
          )}
          {!shipping && (
            <div className="px-5 py-4 text-sm text-gray-400 italic">Enable shipping to configure settings.</div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Active Fulfillment Methods</h2>
          <div className="flex flex-wrap gap-2">
            {pickup   && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#1a4a2e]/10 text-[#1a4a2e] px-3 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-[#1a4a2e]"/>Pickup</span>}
            {delivery && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"/>Local Delivery</span>}
            {shipping && <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-purple-600"/>Shipping</span>}
            {!pickup && !delivery && !shipping && <span className="text-xs text-gray-400 italic">No fulfillment methods enabled</span>}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
