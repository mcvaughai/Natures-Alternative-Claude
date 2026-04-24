"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  { id: 1, name: "Pancake Mix",        farm: "Example Farms",     price: "$6.00"  },
  { id: 2, name: "Fresh Eggs (12)",    farm: "Example Farms",     price: "$8.00"  },
  { id: 3, name: "Raw Honey 16oz",     farm: "Blue Ridge Honey",  price: "$12.00" },
  { id: 4, name: "Heritage Tomatoes",  farm: "Green Valley Farm", price: "$5.50"  },
  { id: 5, name: "Herb Bundle",        farm: "Sunrise Organics",  price: "$4.00"  },
  { id: 6, name: "Grass-Fed Beef",     farm: "Heritage Acres",    price: "$18.00" },
  { id: 7, name: "Artisan Cheese",     farm: "Sunrise Organics",  price: "$14.00" },
  { id: 8, name: "Wildflower Honey",   farm: "Blue Ridge Honey",  price: "$10.00" },
];

const FREQUENCY_OPTIONS = [
  { label: "Every Week",     value: "every-week"     },
  { label: "Every 2 Weeks",  value: "every-2-weeks"  },
  { label: "Every Month",    value: "every-month"    },
  { label: "Every 6 Weeks",  value: "every-6-weeks"  },
  { label: "Every 2 Months", value: "every-2-months" },
  { label: "Custom",         value: "custom"         },
];

const SUBSTITUTION_OPTIONS = [
  {
    value: "substitute",
    label: "Substitute with similar product",
    desc:  "We will find the closest match if your item is unavailable",
  },
  {
    value: "skip",
    label: "Skip out of stock items",
    desc:  "Skip unavailable items and charge for what is available",
  },
  {
    value: "pause",
    label: "Pause order and notify me",
    desc:  "We will notify you and pause this order if any item is unavailable",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddedItem {
  id: number; name: string; farm: string; price: string; qty: number;
}

interface Props {
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePrice(p: string) {
  return parseFloat(p.replace("$", "")) || 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateAutoHarvestModal({ onClose }: Props) {
  const [step, setStep]       = useState(1);
  const [success, setSuccess] = useState(false);

  // Step 1
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems]   = useState<AddedItem[]>([]);

  // Step 3
  const [frequency, setFrequency]             = useState("every-2-weeks");
  const [startDate, setStartDate]             = useState("");
  const [endDate, setEndDate]                 = useState("");
  const [noEndDate, setNoEndDate]             = useState(true);
  const [fulfillment, setFulfillment]         = useState("Farm Pickup");
  const [substitution, setSubstitution]       = useState("substitute");
  const [notifyBefore, setNotifyBefore]       = useState(true);
  const [notifyConfirmed, setNotifyConfirmed] = useState(true);
  const [notifyReady, setNotifyReady]         = useState(true);

  // Derived
  const filteredProducts = searchQuery.trim()
    ? MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const estimatedTotal = addedItems.reduce(
    (sum, item) => sum + item.qty * parsePrice(item.price),
    0
  );

  const freqLabel =
    FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label ?? frequency;

  // ── Handlers ────────────────────────────────────────────────────────────────

  function addProduct(product: (typeof MOCK_PRODUCTS)[0]) {
    if (addedItems.find((i) => i.id === product.id)) return;
    setAddedItems((prev) => [...prev, { ...product, qty: 1 }]);
  }

  function removeItem(id: number) {
    setAddedItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: number, delta: number) {
    setAddedItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a4a2e] mb-2">Auto Harvest Activated! 🌾</h2>
          <p className="text-gray-600 mb-1">Your first order is scheduled for December 28, 2024</p>
          <p className="text-sm text-gray-400 mb-7">Estimated total: $45.20</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/account/auto-harvest"
              onClick={onClose}
              className="block w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center"
            >
              View My Auto Harvest Lists
            </Link>
            <Link
              href="/explore"
              onClick={onClose}
              className="block w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Modal ────────────────────────────────────────────────────────────────────

  const STEP_LABELS = ["Name List", "Add Products", "Schedule", "Review"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create New Auto Harvest List</h2>
            <p className="text-xs text-gray-500 mt-0.5">Step {step} of 4 — {STEP_LABELS[step - 1]}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-[#1a4a2e]" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium ${i + 1 <= step ? "text-[#1a4a2e]" : "text-gray-400"}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  List Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weekly Essentials, Monthly Bulk Order"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. My regular weekly groceries"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products to add..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>

              {/* Search results */}
              {filteredProducts.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {filteredProducts.map((p) => {
                    const alreadyAdded = !!addedItems.find((i) => i.id === p.id);
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs text-[#1a4a2e]">{p.farm}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 tabular-nums shrink-0">{p.price}</span>
                        <button
                          onClick={() => addProduct(p)}
                          disabled={alreadyAdded}
                          className="text-xs font-semibold bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          {alreadyAdded ? "Added" : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Added items */}
              {addedItems.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Added Products ({addedItems.length})
                  </p>
                  <div className="space-y-2">
                    {addedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-[#f5f0e8] rounded-xl px-4 py-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-[#1a4a2e]">{item.farm}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 tabular-nums shrink-0">{item.price}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-white transition-colors font-bold text-base leading-none"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-semibold text-gray-800 tabular-nums">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-white transition-colors font-bold text-base leading-none"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right">
                    <span className="text-sm font-medium text-gray-600">
                      Estimated total:{" "}
                      <span className="font-bold text-[#1a4a2e]">${estimatedTotal.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              )}

              {addedItems.length === 0 && !searchQuery && (
                <p className="text-sm text-gray-400 text-center py-8">
                  Search for products above to add them to your list
                </p>
              )}
            </div>
          )}

          {/* ── STEP 3 ─────────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Frequency */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">How often should this order be placed?</p>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={`text-sm font-medium px-3 py-3 rounded-xl border-2 transition-colors text-center ${
                        frequency === opt.value
                          ? "border-[#1a4a2e] bg-[#1a4a2e]/5 text-[#1a4a2e]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {frequency === "custom" && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Every</span>
                    <input
                      type="number"
                      min={1}
                      defaultValue={3}
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-[#1a4a2e] focus:border-[#1a4a2e]"
                    />
                    <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a4a2e] appearance-none bg-white">
                      <option>days</option>
                      <option>weeks</option>
                      <option>months</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={noEndDate}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noEndDate}
                      onChange={(e) => setNoEndDate(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#1a4a2e]"
                    />
                    <span className="text-xs text-gray-600">No end date (runs indefinitely)</span>
                  </label>
                </div>
              </div>

              {/* Fulfillment */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Fulfillment Preference</p>
                <div className="space-y-2">
                  {["Farm Pickup", "Local Delivery", "Shipping"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="ah-fulfillment"
                        value={opt}
                        checked={fulfillment === opt}
                        onChange={() => setFulfillment(opt)}
                        className="w-4 h-4 accent-[#1a4a2e]"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Substitution */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">If an item is out of stock…</p>
                <div className="space-y-2">
                  {SUBSTITUTION_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex gap-3 cursor-pointer border-2 rounded-xl p-3.5 transition-colors ${
                        substitution === opt.value
                          ? "border-[#1a4a2e] bg-[#1a4a2e]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ah-substitution"
                        value={opt.value}
                        checked={substitution === opt.value}
                        onChange={() => setSubstitution(opt.value)}
                        className="w-4 h-4 accent-[#1a4a2e] mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</p>
                <div className="space-y-3">
                  {(
                    [
                      [notifyBefore,    setNotifyBefore,    "Notify me 3 days before each order is placed"         ],
                      [notifyConfirmed, setNotifyConfirmed, "Notify me when order is confirmed by farm"            ],
                      [notifyReady,     setNotifyReady,     "Notify me when order is ready for pickup / delivery"  ],
                    ] as [boolean, (v: boolean) => void, string][]
                  ).map(([state, setter, label]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-700">{label}</span>
                      <button
                        type="button"
                        onClick={() => setter(!state)}
                        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${state ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
                        aria-label={state ? "Disable notification" : "Enable notification"}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${state ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4 ─────────────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-gray-900">Review Your Auto Harvest List</h3>

              {/* Summary card */}
              <div className="bg-[#f5f0e8] rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1a4a2e] text-base">{name || "My Auto Harvest List"}</p>
                    {description && (
                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    )}
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full shrink-0">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <span className="font-semibold text-gray-800 ml-1.5">{addedItems.length} products</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Estimated total:</span>
                    <span className="font-bold text-[#1a4a2e] ml-1.5">${estimatedTotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Schedule:</span>
                    <span className="font-semibold text-gray-800 ml-1.5">
                      {freqLabel}{startDate ? ` starting ${startDate}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fulfillment:</span>
                    <span className="font-semibold text-gray-800 ml-1.5">{fulfillment}</span>
                  </div>
                </div>
                {addedItems.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Products:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {addedItems.map((item) => (
                        <span key={item.id} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {item.name} ×{item.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500 tracking-wide">
                      VISA
                    </div>
                    <span className="text-sm text-gray-700">Visa ending in 4242</span>
                  </div>
                  <button className="text-sm font-semibold text-[#1a4a2e] hover:underline">
                    Change
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Important: </span>
                  Your card will be charged automatically on each scheduled date. You can pause, skip, or cancel at any time from your account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center px-6 py-4 border-t border-gray-100 shrink-0 ${step === 1 ? "justify-end" : "justify-between"}`}>
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="border border-gray-300 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !name.trim()}
              className="bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setSuccess(true)}
              className="flex items-center gap-2 bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              <span>🌾</span>
              Activate Auto Harvest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
