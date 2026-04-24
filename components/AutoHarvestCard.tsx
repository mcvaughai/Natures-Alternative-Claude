"use client";
import { useState } from "react";

export interface AutoHarvestCardProps {
  id:                     string;
  name:                   string;
  initialStatus:          "active" | "paused";
  frequency:              string;
  nextOrder:              string;
  estimatedTotal:         string;
  itemCount:              number;
  extraItems?:            number;
  farms:                  string[];
  substitutionPreference: string;
}

export default function AutoHarvestCard({
  name, initialStatus, frequency, nextOrder, estimatedTotal,
  itemCount, extraItems = 0, farms, substitutionPreference,
}: AutoHarvestCardProps) {
  const [active, setActive] = useState(initialStatus === "active");
  const paused = !active;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${paused ? "opacity-80 border-yellow-200" : "border-gray-100"}`}>

      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1a4a2e]">{name}</h3>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {active ? "Active" : "Paused"}
          </span>
          <button
            onClick={() => setActive((v) => !v)}
            aria-label={active ? "Pause list" : "Activate list"}
            className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none ${active ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Schedule info row */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {frequency}
        </div>
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Next order: {nextOrder}
        </div>
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Estimated total: {estimatedTotal}
        </div>
      </div>

      {/* Product thumbnails */}
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: Math.min(4, itemCount) }).map((_, i) => (
          <div key={i} className="w-11 h-11 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ))}
        {extraItems > 0 && (
          <span className="text-sm text-gray-500 ml-1">+ {extraItems} more items</span>
        )}
        <span className="text-xs text-gray-400 ml-auto">{itemCount} items total</span>
      </div>

      {/* Farm tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {farms.map((farm) => (
          <span key={farm} className="text-xs px-2.5 py-0.5 rounded-full border border-[#1a4a2e]/20 text-[#1a4a2e] font-medium bg-[#1a4a2e]/5">
            {farm}
          </span>
        ))}
      </div>

      {/* Substitution preference */}
      <p className="text-xs text-gray-400 mb-4">
        If out of stock: <span className="text-gray-600">{substitutionPreference}</span>
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button className="text-xs font-semibold border-2 border-[#1a4a2e] text-[#1a4a2e] px-3 py-1.5 rounded-lg hover:bg-[#1a4a2e]/5 transition-colors">
            Edit List
          </button>
          <button className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            Skip Next Order
          </button>
          <button className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            View Order History
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive((v) => !v)}
            className={`text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
              active
                ? "border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                : "border-green-400 text-green-600 hover:bg-green-50"
            }`}
          >
            {active ? "Pause List" : "Activate List"}
          </button>
          <button className="text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            Delete List
          </button>
        </div>
      </div>
    </div>
  );
}
