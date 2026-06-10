"use client";

import { useState, useEffect, useCallback } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { getValidSellerSession } from "@/lib/sessionHelper";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

// ── Types ─────────────────────────────────────────────────────────────────────

type PickupTab = "hours" | "announcements" | "general";
type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface DaySchedule {
  open: boolean;
  start: string;
  end: string;
  label: string;
}
type WeekSchedule = Record<DayKey, DaySchedule>;

interface Announcement {
  id: string;
  seller_id: string;
  title: string;
  recurrence: string;
  days: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_KEYS: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday:    { open: false, start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
  tuesday:   { open: false, start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
  wednesday: { open: false, start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
  thursday:  { open: true,  start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
  friday:    { open: true,  start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
  saturday:  { open: true,  start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
  sunday:    { open: true,  start: "11:00am", end: "3:00pm", label: "Farm Pickup" },
};

function generateTimeOptions(): string[] {
  const opts: string[] = [];
  for (let h = 5; h <= 22; h++) {
    const ampm = h < 12 ? "am" : "pm";
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    opts.push(`${h12}:00${ampm}`);
    if (h < 22) opts.push(`${h12}:30${ampm}`);
  }
  return opts;
}
const TIME_OPTIONS = generateTimeOptions();

const WEEK_DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RECURRENCE_OPTIONS = ["Once", "Weekly", "Biweekly", "Monthly"];
const RECURRENCE_BADGE: Record<string, string> = {
  Once:     "bg-gray-100 text-gray-600",
  Weekly:   "bg-blue-100 text-blue-700",
  Biweekly: "bg-purple-100 text-purple-700",
  Monthly:  "bg-amber-100 text-amber-700",
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053D2D]/30 focus:border-[#053D2D] transition";

const compactSelectCls =
  "border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#053D2D] focus:border-[#053D2D] appearance-none cursor-pointer";

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-[#053D2D]" : "bg-gray-300"}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SmallToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${on ? "bg-[#053D2D]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FulfillmentPage() {
  const [session, setSession]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");

  // Fulfillment method toggles
  const [offersPickup, setOffersPickup]     = useState(false);
  const [offersDelivery, setOffersDelivery] = useState(false);
  const [offersShipping, setOffersShipping] = useState(false);

  // Farm Pickup tabs
  const [pickupTab, setPickupTab] = useState<PickupTab>("hours");

  // Tab 1 — Hours & Days
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);

  // Tab 2 — Announcements
  const [announcements, setAnnouncements]           = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn]                 = useState(false);
  const [newTitle, setNewTitle]                     = useState("");
  const [newRecurrence, setNewRecurrence]           = useState("Weekly");
  const [newDays, setNewDays]                       = useState<string[]>([]);
  const [newStartDate, setNewStartDate]             = useState("");
  const [newEndDate, setNewEndDate]                 = useState("");
  const [savingAnn, setSavingAnn]                   = useState(false);
  const [annMsg, setAnnMsg]                         = useState("");

  // Tab 3 — General Settings
  const [pickupAddress, setPickupAddress]             = useState("");
  const [pickupHours, setPickupHours]                 = useState("");
  const [pickupInstructions, setPickupInstructions]   = useState("");

  // Local Delivery (UI-only)
  const [deliveryRadius, setDeliveryRadius] = useState("15");
  const [deliveryFee, setDeliveryFee]       = useState("5.00");
  const [deliveryMin, setDeliveryMin]       = useState("25.00");
  const [deliveryDays, setDeliveryDays]     = useState("Wed, Fri");

  // Shipping (UI-only)
  const [carrier, setCarrier]           = useState("USPS");
  const [shippingMin, setShippingMin]   = useState("35.00");
  const [freeThreshold, setFreeThreshold] = useState("75.00");

  // ── Auth headers helper ──
  const hdrs = (token: string) => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  });

  // ── Fetch announcements ──
  const fetchAnnouncements = useCallback(async (sess: { access_token: string; seller_id: string }) => {
    setLoadingAnn(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/seller_announcements?seller_id=eq.${sess.seller_id}&select=*&order=created_at.desc`,
        { headers: hdrs(sess.access_token) }
      );
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Announcements fetch error:", e);
    } finally {
      setLoadingAnn(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch seller fulfillment data ──
  async function fetchFulfillmentData(sess: { access_token: string; seller_id: string }) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sellers?id=eq.${sess.seller_id}&select=fulfillment,pickup_address,pickup_hours,pickup_instructions,pickup_schedule`,
        { headers: hdrs(sess.access_token) }
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const s = data[0];
        const arr: string[] = Array.isArray(s.fulfillment) ? s.fulfillment : [];
        setOffersPickup(arr.includes("Farm Pickup"));
        setOffersDelivery(arr.includes("Local Delivery"));
        setOffersShipping(arr.includes("Shipping"));
        setPickupAddress(s.pickup_address || "");
        setPickupHours(s.pickup_hours || "");
        setPickupInstructions(s.pickup_instructions || "");
        if (s.pickup_schedule && typeof s.pickup_schedule === "object") {
          setSchedule({ ...DEFAULT_SCHEDULE, ...s.pickup_schedule });
        }
      }
    } catch (e) {
      console.error("Fulfillment fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getValidSellerSession().then((sess) => {
      if (!sess) return;
      setSession(sess);
      fetchFulfillmentData(sess);
      fetchAnnouncements(sess);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAnnouncements]);

  // ── Save (tab-aware) ──
  async function saveFulfillmentSettings() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const sess = session || (await getValidSellerSession());
      if (!sess) { setError("Not logged in"); return; }

      const fulfillmentArray: string[] = [];
      if (offersPickup)   fulfillmentArray.push("Farm Pickup");
      if (offersDelivery) fulfillmentArray.push("Local Delivery");
      if (offersShipping) fulfillmentArray.push("Shipping");

      const body: Record<string, unknown> = {
        fulfillment:  fulfillmentArray,
        updated_at:   new Date().toISOString(),
      };

      if (pickupTab === "hours") {
        body.pickup_schedule = schedule;
      } else if (pickupTab === "general") {
        body.pickup_address      = pickupAddress;
        body.pickup_hours        = pickupHours;
        body.pickup_instructions = pickupInstructions;
      }
      // announcements tab: only saves fulfillment toggle state

      const res = await fetch(`${SUPABASE_URL}/rest/v1/sellers?id=eq.${sess.seller_id}`, {
        method: "PATCH",
        headers: { ...hdrs(sess.access_token), "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(body),
      });

      if (!res.ok) { setError("Save failed: " + await res.text()); return; }
      setSuccess("Settings saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Announcement actions ──
  async function addAnnouncement() {
    if (!newTitle.trim())  { setAnnMsg("Please enter a title."); return; }
    if (!newStartDate)     { setAnnMsg("Please select a start date."); return; }
    const sess = session || (await getValidSellerSession());
    if (!sess) return;
    setSavingAnn(true);
    setAnnMsg("");
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/seller_announcements`, {
        method: "POST",
        headers: { ...hdrs(sess.access_token), "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({
          seller_id:  sess.seller_id,
          title:      newTitle.trim(),
          recurrence: newRecurrence,
          days:       newDays,
          start_date: newStartDate,
          end_date:   newEndDate || null,
          is_active:  true,
        }),
      });
      if (!res.ok) { setAnnMsg("Error: " + await res.text()); return; }
      setAnnMsg("Announcement added!");
      setNewTitle(""); setNewRecurrence("Weekly"); setNewDays([]); setNewStartDate(""); setNewEndDate("");
      await fetchAnnouncements(sess);
      setTimeout(() => setAnnMsg(""), 3000);
    } catch (e: any) {
      setAnnMsg("Error: " + e.message);
    } finally {
      setSavingAnn(false);
    }
  }

  async function toggleAnnouncement(id: string, current: boolean) {
    const sess = session || (await getValidSellerSession());
    if (!sess) return;
    await fetch(`${SUPABASE_URL}/rest/v1/seller_announcements?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...hdrs(sess.access_token), "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const sess = session || (await getValidSellerSession());
    if (!sess) return;
    await fetch(`${SUPABASE_URL}/rest/v1/seller_announcements?id=eq.${id}`, {
      method: "DELETE",
      headers: hdrs(sess.access_token),
    });
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }

  function updateDay(day: DayKey, field: keyof DaySchedule, value: string | boolean) {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  function toggleNewDay(d: string) {
    setNewDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  // ── Loading spinner ──
  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center py-24">
          <svg className="w-6 h-6 animate-spin text-[#053D2D]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-5 max-w-3xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Fulfillment Settings</h1>
          <button onClick={saveFulfillmentSettings} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all bg-[#053D2D] hover:bg-[#2d6b47] disabled:opacity-60 text-white">
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {saving ? "Saving..." : "Save Fulfillment Settings"}
          </button>
        </div>

        {/* ── Toasts ── */}
        {success && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FARM PICKUP
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toggle header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#053D2D]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#053D2D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Farm Pickup</p>
                <p className="text-xs text-gray-500">Customers pick up orders directly from your farm</p>
              </div>
            </div>
            <Toggle on={offersPickup} onToggle={() => setOffersPickup(v => !v)} />
          </div>

          {offersPickup && (
            <>
              {/* Tab bar */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {(["hours", "announcements", "general"] as PickupTab[]).map(tab => (
                  <button key={tab} onClick={() => setPickupTab(tab)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      pickupTab === tab
                        ? "border-[#053D2D] text-[#053D2D] bg-white"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab === "hours" ? "Hours & Days" : tab === "announcements" ? "Announcements" : "General Settings"}
                  </button>
                ))}
              </div>

              {/* ── TAB 1: Hours & Days ── */}
              {pickupTab === "hours" && (
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-4">
                    Set your pickup schedule for each day of the week. Days toggled open will appear on your store.
                  </p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {DAY_KEYS.map((key, i) => {
                      const day = schedule[key];
                      return (
                        <div key={key}
                          className={`flex items-center gap-3 px-4 py-3 ${i < DAY_KEYS.length - 1 ? "border-b border-gray-100" : ""} ${day.open ? "bg-green-50/40" : ""}`}>
                          {/* Day name */}
                          <span className="w-24 text-sm font-medium text-gray-700 shrink-0">
                            {DAY_LABELS[key]}
                          </span>
                          {/* Open/closed toggle */}
                          <Toggle on={day.open} onToggle={() => updateDay(key, "open", !day.open)} />
                          {/* Content */}
                          {day.open ? (
                            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                              <select value={day.start} onChange={e => updateDay(key, "start", e.target.value)}
                                className={compactSelectCls + " w-24"}>
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <span className="text-xs text-gray-400">to</span>
                              <select value={day.end} onChange={e => updateDay(key, "end", e.target.value)}
                                className={compactSelectCls + " w-24"}>
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <input
                                type="text"
                                maxLength={30}
                                value={day.label}
                                onChange={e => updateDay(key, "label", e.target.value)}
                                placeholder="e.g. Farm Pickup, Farmers Market"
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#053D2D] focus:border-[#053D2D] min-w-0 w-44"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Closed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Changes are saved when you click <strong>Save Fulfillment Settings</strong> above.
                  </p>
                </div>
              )}

              {/* ── TAB 2: Announcements ── */}
              {pickupTab === "announcements" && (
                <div className="p-5 space-y-5">

                  {/* Existing announcements */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Active Announcements
                    </p>
                    {loadingAnn ? (
                      <div className="flex justify-center py-6">
                        <svg className="w-5 h-5 animate-spin text-[#053D2D]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      </div>
                    ) : announcements.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                        <p className="text-sm text-gray-400">No announcements yet</p>
                        <p className="text-xs text-gray-300 mt-0.5">Add one below to display on your store during specific pickup windows</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {announcements.map(ann => (
                          <div key={ann.id} className="rounded-xl border border-gray-100 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RECURRENCE_BADGE[ann.recurrence] ?? "bg-gray-100 text-gray-600"}`}>
                                    {ann.recurrence}
                                  </span>
                                  {Array.isArray(ann.days) && ann.days.map(d => (
                                    <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{d}</span>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-400">
                                  From {ann.start_date}
                                  {ann.end_date ? ` · ends ${ann.end_date}` : " · No end date"}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-xs font-medium ${ann.is_active ? "text-green-600" : "text-gray-400"}`}>
                                  {ann.is_active ? "Active" : "Inactive"}
                                </span>
                                <SmallToggle on={ann.is_active} onToggle={() => toggleAnnouncement(ann.id, ann.is_active)} />
                                <button onClick={() => deleteAnnouncement(ann.id)}
                                  className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add announcement form */}
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Add Announcement</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
                        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                          placeholder="e.g. Raw Milk Pickup Week" className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Recurrence</label>
                          <div className="relative">
                            <select value={newRecurrence} onChange={e => setNewRecurrence(e.target.value)}
                              className={inputCls + " appearance-none"}>
                              {RECURRENCE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Applies to days</label>
                          <div className="flex flex-wrap gap-1.5">
                            {WEEK_DAYS_SHORT.map(d => (
                              <button key={d} type="button" onClick={() => toggleNewDay(d)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                                  newDays.includes(d)
                                    ? "bg-[#053D2D] border-[#053D2D] text-white"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}>
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date <span className="text-red-400">*</span></label>
                          <input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">End date <span className="text-gray-400 font-normal">(optional)</span></label>
                          <input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className={inputCls} />
                          <p className="text-xs text-gray-400 mt-1">Leave blank for ongoing</p>
                        </div>
                      </div>
                      {annMsg && (
                        <p className={`text-sm font-medium ${annMsg.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
                          {annMsg}
                        </p>
                      )}
                      <button onClick={addAnnouncement} disabled={savingAnn}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                        style={{ backgroundColor: "#053D2D" }}>
                        {savingAnn && (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        )}
                        {savingAnn ? "Adding..." : "Add Announcement"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: General Settings ── */}
              {pickupTab === "general" && (
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Address</label>
                    <input type="text" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)}
                      placeholder="123 Farm Lane, City, State 00000" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Hours</label>
                    <input type="text" value={pickupHours} onChange={e => setPickupHours(e.target.value)}
                      placeholder="e.g. Mon–Fri, 8am–4pm" className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">
                      Note: Day-by-day hours are now managed in the <button className="underline text-[#053D2D]" onClick={() => setPickupTab("hours")}>Hours &amp; Days</button> tab above.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
                    <textarea rows={2} value={pickupInstructions} onChange={e => setPickupInstructions(e.target.value)}
                      placeholder="Directions, parking tips, etc." className={inputCls + " resize-none"} />
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-600">
                    <span className="font-semibold">Tip:</span> Include directions and a phone number so customers can easily find you.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LOCAL DELIVERY — unchanged
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Local Delivery</p>
                <p className="text-xs text-gray-500">You deliver orders within a set radius</p>
              </div>
            </div>
            <Toggle on={offersDelivery} onToggle={() => setOffersDelivery(v => !v)} />
          </div>
          {offersDelivery && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Radius (miles)</label>
                  <input type="number" value={deliveryRadius} onChange={e => setDeliveryRadius(e.target.value)} min="1" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Fee ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={deliveryMin} onChange={e => setDeliveryMin(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Days</label>
                  <input type="text" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} placeholder="e.g. Mon, Wed, Fri" className={inputCls} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SHIPPING — unchanged
        ══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Shipping</p>
                <p className="text-xs text-gray-500">Ship orders nationwide via carrier</p>
              </div>
            </div>
            <Toggle on={offersShipping} onToggle={() => setOffersShipping(v => !v)} />
          </div>
          {offersShipping && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Carrier</label>
                <div className="relative">
                  <select value={carrier} onChange={e => setCarrier(e.target.value)} className={inputCls + " appearance-none"}>
                    <option>USPS</option>
                    <option>UPS</option>
                    <option>FedEx</option>
                    <option>DHL</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={shippingMin} onChange={e => setShippingMin(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} min="0" step="0.50" className={inputCls + " pl-7"} />
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                <span className="font-semibold">Note:</span> Shipping is best suited for non-perishable products. Make sure your packaging can withstand transit.
              </div>
            </div>
          )}
          {!offersShipping && (
            <div className="px-5 py-4 text-sm text-gray-400 italic">Enable shipping to configure settings.</div>
          )}
        </div>

        {/* ── Active methods summary — unchanged ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Active Fulfillment Methods</h2>
          <div className="flex flex-wrap gap-2">
            {offersPickup && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#053D2D]/10 text-[#053D2D] px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#053D2D]" />Pickup
              </span>
            )}
            {offersDelivery && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />Local Delivery
              </span>
            )}
            {offersShipping && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />Shipping
              </span>
            )}
            {!offersPickup && !offersDelivery && !offersShipping && (
              <span className="text-xs text-gray-400 italic">No fulfillment methods enabled</span>
            )}
          </div>
        </div>

        {/* ── Bottom save button — unchanged ── */}
        <div className="flex justify-end pb-4">
          <button onClick={saveFulfillmentSettings} disabled={saving}
            className="bg-[#053D2D] hover:bg-[#2d6b47] disabled:opacity-60 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors">
            {saving ? "Saving..." : "Save Fulfillment Settings"}
          </button>
        </div>

      </div>
    </SellerLayout>
  );
}
