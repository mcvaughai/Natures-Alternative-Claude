"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

type PayoutStatus = "Paid" | "Pending" | "Processing";

interface Payout {
  id: number; farm: string; period: string; gross: string;
  fee: string; net: string; status: PayoutStatus;
}

const ALL_PAYOUTS: Payout[] = [
  { id:1, farm:"Example Farms",    period:"Nov 2024", gross:"$1,050.00", fee:"$84.00",  net:"$966.00",  status:"Paid"       },
  { id:2, farm:"Green Valley Farm",period:"Nov 2024", gross:"$775.00",   fee:"$62.00",  net:"$713.00",  status:"Paid"       },
  { id:3, farm:"Blue Ridge Honey", period:"Nov 2024", gross:"$450.00",   fee:"$36.00",  net:"$414.00",  status:"Paid"       },
  { id:4, farm:"Example Farms",    period:"Dec 2024", gross:"$440.00",   fee:"$35.20",  net:"$404.80",  status:"Processing" },
  { id:5, farm:"Green Valley Farm",period:"Dec 2024", gross:"$320.00",   fee:"$25.60",  net:"$294.40",  status:"Pending"    },
  { id:6, farm:"Sunrise Organics", period:"Dec 2024", gross:"$185.00",   fee:"$14.80",  net:"$170.20",  status:"Pending"    },
];

const STATUS_STYLES: Record<PayoutStatus, string> = {
  Paid:       "bg-green-100 text-green-700",
  Pending:    "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
};

export default function PayoutsPage() {
  const [fee, setFee] = useState("8");
  const [saved, setSaved] = useState(false);

  const handleSaveFee = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalPaid     = "$2,093.00";
  const pendingPayout = "$465.20";
  const platformRev   = "$257.60";

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">
        <h1 className="text-xl font-bold text-gray-900">Payouts Management</h1>

        {/* Stripe banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">Stripe Connect Integration Coming Soon</p>
            <p className="text-xs text-blue-700 mt-0.5">Automated payouts will be powered by Stripe in the backend phase. Currently showing placeholder payout data for UI development.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Total Paid Out",      value: totalPaid,    color:"text-green-700" },
            { label:"Pending Payouts",     value: pendingPayout,color:"text-yellow-600"},
            { label:"Platform Revenue (Fees)", value: platformRev, color:"text-[#1a4a2e]"},
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Payouts table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Payout History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Farm Name","Period","Gross Sales","Platform Fee (8%)","Net Payout","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ALL_PAYOUTS.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{p.farm}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{p.period}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 tabular-nums">{p.gross}</td>
                    <td className="px-4 py-3.5 text-red-500 tabular-nums">-{p.fee}</td>
                    <td className="px-4 py-3.5 font-bold text-[#1a4a2e] tabular-nums">{p.net}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {p.status === "Pending" && (
                          <button className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">Process Payout</button>
                        )}
                        <button className="text-xs font-semibold border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">View Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fee settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Fee Structure</h2>
          <div className="max-w-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform Transaction Fee (%)</label>
              <div className="relative">
                <input type="number" value={fee} onChange={e => setFee(e.target.value)} min="0" max="100" step="0.5"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"/>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
              </div>
            </div>
            <button onClick={handleSaveFee}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white"}`}>
              {saved ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Saved!
                </>
              ) : "Save Fee Settings"}
            </button>
            <p className="text-xs text-gray-400">Changes apply to all future transactions. Current sellers will be notified of any fee changes.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
