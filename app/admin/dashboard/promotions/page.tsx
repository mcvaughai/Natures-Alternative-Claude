"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const FARM_OPTIONS = ["Example Farms","Green Valley Farm","Sunrise Organics","Heritage Acres","Blue Ridge Honey"];
const PRODUCT_OPTIONS = ["Pancakes Mix","Fresh Eggs (12)","Raw Honey 16oz","Grass-Fed Beef","Heritage Tomatoes","Herb Bundle"];

interface Deal {
  id: number; name: string; discount: string; start: string; end: string; scope: string;
}

const INITIAL_DEALS: Deal[] = [
  { id:1, name:"Holiday Season Sale",  discount:"15%", start:"Dec 1, 2024",  end:"Dec 31, 2024", scope:"All Products"    },
  { id:2, name:"New Year Special",     discount:"10%", start:"Jan 1, 2025",  end:"Jan 7, 2025",  scope:"Specific Farms"  },
];

const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

export default function PromotionsPage() {
  const [featuredFarms, setFeaturedFarms]       = useState(["Example Farms","Green Valley Farm","Blue Ridge Honey","Heritage Acres"]);
  const [addFarm, setAddFarm]                   = useState("");
  const [featuredProducts, setFeaturedProducts] = useState(["Pancakes Mix","Raw Honey 16oz","Grass-Fed Beef"]);
  const [addProduct, setAddProduct]             = useState("");
  const [deals, setDeals]                       = useState<Deal[]>(INITIAL_DEALS);

  // Deal form state
  const [dealName, setDealName]     = useState("");
  const [discount, setDiscount]     = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [scope, setScope]           = useState("All Products");

  const [savedFarms, setSavedFarms]     = useState(false);
  const [savedProducts, setSavedProducts] = useState(false);

  const saveFarms = () => { setSavedFarms(true); setTimeout(() => setSavedFarms(false), 2000); };
  const saveProducts = () => { setSavedProducts(true); setTimeout(() => setSavedProducts(false), 2000); };

  const addFeaturedFarm = () => {
    if (addFarm && !featuredFarms.includes(addFarm)) {
      setFeaturedFarms(prev => [...prev, addFarm]);
      setAddFarm("");
    }
  };
  const addFeaturedProduct = () => {
    if (addProduct && !featuredProducts.includes(addProduct)) {
      setFeaturedProducts(prev => [...prev, addProduct]);
      setAddProduct("");
    }
  };
  const createDeal = () => {
    if (!dealName || !discount || !startDate || !endDate) return;
    setDeals(prev => [...prev, { id: Date.now(), name: dealName, discount: discount + "%", start: startDate, end: endDate, scope }]);
    setDealName(""); setDiscount(""); setStartDate(""); setEndDate(""); setScope("All Products");
  };

  const SaveBtn = ({ saved, onClick }: { saved: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-[#1a4a2e] hover:bg-[#2d6b47] text-white"}`}>
      {saved ? (<><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Saved!</>) : "Save"}
    </button>
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <h1 className="text-xl font-bold text-gray-900">Promotions &amp; Featured Listings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Featured Farms */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Featured Farms</h2>
              <SaveBtn saved={savedFarms} onClick={saveFarms}/>
            </div>
            <div className="space-y-2">
              {featuredFarms.map(f => (
                <div key={f} className="flex items-center justify-between bg-[#f5f0e8] rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a4a2e] shrink-0"/>
                    <span className="text-sm text-gray-800 font-medium">{f}</span>
                  </div>
                  <button onClick={() => setFeaturedFarms(prev => prev.filter(x => x !== f))}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={addFarm} onChange={e => setAddFarm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none">
                <option value="">Select a farm...</option>
                {FARM_OPTIONS.filter(f => !featuredFarms.includes(f)).map(f => <option key={f}>{f}</option>)}
              </select>
              <button onClick={addFeaturedFarm} className="text-sm font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-4 py-2 rounded-xl transition-colors">Add</button>
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Featured Products</h2>
              <SaveBtn saved={savedProducts} onClick={saveProducts}/>
            </div>
            <div className="space-y-2">
              {featuredProducts.map(p => (
                <div key={p} className="flex items-center justify-between bg-[#f5f0e8] rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a4a2e] shrink-0"/>
                    <span className="text-sm text-gray-800 font-medium">{p}</span>
                  </div>
                  <button onClick={() => setFeaturedProducts(prev => prev.filter(x => x !== p))}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={addProduct} onChange={e => setAddProduct(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition appearance-none">
                <option value="">Select a product...</option>
                {PRODUCT_OPTIONS.filter(p => !featuredProducts.includes(p)).map(p => <option key={p}>{p}</option>)}
              </select>
              <button onClick={addFeaturedProduct} className="text-sm font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] text-white px-4 py-2 rounded-xl transition-colors">Add</button>
            </div>
          </div>
        </div>

        {/* Special Deals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Special Deals</h2>

          {/* Create form */}
          <div className="bg-[#f5f0e8] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Create New Deal</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={dealName} onChange={e => setDealName(e.target.value)} placeholder="Deal name" className={inputCls}/>
              <div className="relative">
                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Discount" min="1" max="100" className={inputCls + " pr-8"}/>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls}/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls}/>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Apply To</label>
              <select value={scope} onChange={e => setScope(e.target.value)}
                className={inputCls + " appearance-none"}>
                <option>All Products</option>
                <option>Specific Farms</option>
                <option>Specific Products</option>
              </select>
            </div>
            <button onClick={createDeal} className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Create Deal
            </button>
          </div>

          {/* Active deals table */}
          {deals.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Deal Name","Discount","Starts","Ends","Scope",""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deals.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                      <td className="px-4 py-3"><span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{d.discount} off</span></td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.start}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.end}</td>
                      <td className="px-4 py-3 text-gray-500">{d.scope}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeals(prev => prev.filter(x => x.id !== d.id))}
                          className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Banner Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Homepage Banners</h2>
          <div className="space-y-3">
            {["Banner Slot 1 (Primary)", "Banner Slot 2", "Banner Slot 3"].map((slot, i) => (
              <div key={slot}>
                <p className="text-xs text-gray-500 font-medium mb-1.5">{slot}</p>
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1a4a2e]/50 hover:bg-[#1a4a2e]/5 transition-colors">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-xs text-gray-400">{i === 0 ? "1200 × 400px recommended" : "1200 × 300px recommended"}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden"/>
                </label>
              </div>
            ))}
          </div>
          <button className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
            Save Banners
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
