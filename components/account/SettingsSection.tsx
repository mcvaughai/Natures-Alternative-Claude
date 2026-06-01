"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = "https://ezryfycxfmtffobyfjfa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnlmeWN4Zm10ZmZvYnlmamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjQ1MDEsImV4cCI6MjA5MjQwMDUwMX0.woObRrj3MMUf6eAFVbkvDNUsQfQ-elmlDqPADBT9aZs";

const getHeaders = (token: string) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// ── Shared primitives ─────────────────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition";

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-900 mb-5">{children}</h2>;
}
function Field({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ id, placeholder, value, onChange }: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " pr-11"}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-4.364l-14.728 14.728" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 ${checked ? "bg-[#1a4a2e]" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ── Profile Card ──────────────────────────────────────────────────────────────
function ProfileCard({ session }: { session: any }) {
  const [profile, setProfile]         = useState({ first_name: "", last_name: "", email: "", phone: "", zip_code: "" });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [successMessage, setSuccess]  = useState("");

  useEffect(() => {
    if (!session) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchProfile() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user_id}&select=*`,
        { headers: getHeaders(session.access_token) }
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const p = data[0];
        setProfile({
          first_name: p.first_name || "",
          last_name:  p.last_name  || "",
          email:      p.email      || session.email || "",
          phone:      p.phone      || "",
          zip_code:   p.zip_code   || "",
        });
      } else {
        setProfile((prev) => ({ ...prev, email: session.email || "" }));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user_id}`,
        {
          method: "PATCH",
          headers: { ...getHeaders(session.access_token), Prefer: "return=representation" },
          body: JSON.stringify({
            first_name:  profile.first_name,
            last_name:   profile.last_name,
            phone:       profile.phone,
            zip_code:    profile.zip_code,
            updated_at:  new Date().toISOString(),
          }),
        }
      );
      if (res.ok) {
        setSuccess("Profile saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        alert("Failed to save profile.");
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <CardShell>
      <CardTitle>Profile Information</CardTitle>
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-4">
          ✅ {successMessage}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a4a2e] flex items-center justify-center text-white font-bold text-xl shrink-0">
              {profile.first_name?.charAt(0) || profile.email?.charAt(0) || "?"}
            </div>
            <button className="text-sm font-semibold text-[#1a4a2e] border border-[#1a4a2e] px-4 py-2 rounded-xl hover:bg-[#1a4a2e]/5 transition-colors">
              Change Photo
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" id="firstName">
              <input id="firstName" type="text" value={profile.first_name} onChange={set("first_name")} className={inputCls} />
            </Field>
            <Field label="Last Name" id="lastName">
              <input id="lastName" type="text" value={profile.last_name} onChange={set("last_name")} className={inputCls} />
            </Field>
          </div>
          <Field label="Email Address" id="email">
            <input id="email" type="email" value={profile.email} readOnly className={inputCls + " bg-gray-50 cursor-not-allowed"} />
          </Field>
          <Field label="Phone Number" id="phone">
            <input id="phone" type="tel" value={profile.phone} onChange={set("phone")} placeholder="(555) 123-4567" className={inputCls} />
          </Field>
          <Field label="Zip Code" id="zip">
            <input id="zip" type="text" value={profile.zip_code} onChange={set("zip_code")} maxLength={10} placeholder="77001" className={inputCls} />
          </Field>
          <div className="pt-1">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </CardShell>
  );
}

// ── Password Card ─────────────────────────────────────────────────────────────
function PasswordCard({ session }: { session: any }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [updating, setUpdating]   = useState(false);
  const [success, setSuccess]     = useState("");

  async function updatePassword() {
    if (!newPw || newPw !== confirmPw) {
      alert("New passwords do not match");
      return;
    }
    if (newPw.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: getHeaders(session.access_token),
        body: JSON.stringify({ password: newPw }),
      });
      if (res.ok) {
        setSuccess("Password updated successfully!");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const err = await res.json();
        alert("Failed to update password: " + (err.message ?? "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <CardShell>
      <CardTitle>Change Password</CardTitle>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm mb-4">
          ✅ {success}
        </div>
      )}
      <div className="space-y-4">
        <Field label="Current Password" id="currentPassword">
          <PasswordInput id="currentPassword" placeholder="Enter current password" value={currentPw} onChange={setCurrentPw} />
        </Field>
        <Field label="New Password" id="newPassword">
          <PasswordInput id="newPassword" placeholder="Create new password" value={newPw} onChange={setNewPw} />
        </Field>
        <Field label="Confirm New Password" id="confirmPassword">
          <PasswordInput id="confirmPassword" placeholder="Re-enter new password" value={confirmPw} onChange={setConfirmPw} />
        </Field>
        <div className="pt-1">
          <button
            onClick={updatePassword}
            disabled={updating || !session}
            className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60"
          >
            {updating ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </CardShell>
  );
}

// ── Notifications Card ────────────────────────────────────────────────────────
const NOTIFICATION_PREFS = [
  { key: "orderConfirmations",   label: "Order confirmations",              defaultOn: true  },
  { key: "orderStatusUpdates",   label: "Order status updates",             defaultOn: true  },
  { key: "newsletter",           label: "Newsletter and promotions",        defaultOn: false },
  { key: "newProductsFromFarms", label: "New products from followed farms", defaultOn: true  },
  { key: "specialDeals",         label: "Special deals and discounts",      defaultOn: false },
];

function NotificationsCard() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, p.defaultOn]))
  );
  return (
    <CardShell>
      <CardTitle>Notification Preferences</CardTitle>
      <div className="space-y-4">
        {NOTIFICATION_PREFS.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">{pref.label}</span>
            <Toggle
              checked={prefs[pref.key]}
              onChange={(v) => setPrefs((prev) => ({ ...prev, [pref.key]: v }))}
            />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ── Membership Card ───────────────────────────────────────────────────────────
function MembershipCard() {
  return (
    <CardShell>
      <CardTitle>Membership</CardTitle>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Current Plan</p>
          <span className="inline-flex items-center px-2.5 py-0.5 bg-[#1a4a2e] text-white text-xs font-bold rounded-full">
            Free Member
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
        Upgrade to get exclusive deals, early access to products and more.
      </p>
      <button className="bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
        Upgrade Membership
      </button>
      <p className="text-xs text-gray-400 mt-3">Membership pricing coming soon.</p>
    </CardShell>
  );
}

// ── Danger Zone Card ──────────────────────────────────────────────────────────
function DangerZoneCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
      <h2 className="text-base font-bold text-red-600 mb-4">Danger Zone</h2>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-800">Delete Account</p>
          <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone.</p>
        </div>
        <button className="text-sm font-semibold text-red-500 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shrink-0">
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function SettingsSection() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("customer_session");
    if (sessionStr) setSession(JSON.parse(sessionStr));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>
      <ProfileCard session={session} />
      <PasswordCard session={session} />
      <NotificationsCard />
      <MembershipCard />
      <DangerZoneCard />
    </div>
  );
}
