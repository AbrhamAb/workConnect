"use client";

import { useState } from "react";
import { Bell, Check, Globe2, LockKeyhole, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";

const settingsTabs = [
  { label: "General", icon: SlidersHorizontal },
  { label: "Notifications", icon: Bell },
  { label: "Security", icon: LockKeyhole },
];

const initialPreferences = {
  maintenanceMode: false,
  workerVerification: true,
  emailNotifications: true,
  weeklySummary: false,
};

function SettingToggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 shrink-0 accent-emerald-700" />
    </label>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saved, setSaved] = useState(false);

  const updatePreference = (key) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  };

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Workspace controls</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage platform preferences, notifications, and access controls.</p></div>
          <button type="button" onClick={saveSettings} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#133729] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c241b]">{saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved ? "Settings saved" : "Save changes"}</button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="rounded-3xl border border-slate-100 bg-white p-2 shadow-sm" aria-label="Settings sections">
          {settingsTabs.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setActiveTab(label)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === label ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon className="h-4 w-4" />{label}</button>)}
        </nav>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          {activeTab === "General" && <><div className="flex items-start gap-4 border-b border-slate-100 pb-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Globe2 className="h-5 w-5" /></div><div><h2 className="text-lg font-bold text-slate-900">General preferences</h2><p className="mt-1 text-sm text-slate-500">Choose how WorkConnect should operate for your team.</p></div></div><div className="mt-6 space-y-3"><SettingToggle checked={preferences.maintenanceMode} onChange={() => updatePreference("maintenanceMode")} label="Maintenance mode" description="Temporarily pause new customer requests while you make platform updates." /><SettingToggle checked={preferences.workerVerification} onChange={() => updatePreference("workerVerification")} label="Require worker verification" description="Keep new worker profiles hidden until an administrator approves them." /></div></>}
          {activeTab === "Notifications" && <><div className="flex items-start gap-4 border-b border-slate-100 pb-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Bell className="h-5 w-5" /></div><div><h2 className="text-lg font-bold text-slate-900">Notification preferences</h2><p className="mt-1 text-sm text-slate-500">Stay informed about activity that needs an administrator&apos;s attention.</p></div></div><div className="mt-6 space-y-3"><SettingToggle checked={preferences.emailNotifications} onChange={() => updatePreference("emailNotifications")} label="Email notifications" description="Receive alerts for new verification applications and reported requests." /><SettingToggle checked={preferences.weeklySummary} onChange={() => updatePreference("weeklySummary")} label="Weekly summary" description="Get a weekly overview of users, requests, and platform activity." /></div></>}
          {activeTab === "Security" && <><div className="flex items-start gap-4 border-b border-slate-100 pb-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="text-lg font-bold text-slate-900">Security controls</h2><p className="mt-1 text-sm text-slate-500">Review the protections applied to administrator accounts.</p></div></div><div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-slate-900">Admin session timeout</p><p className="mt-1 text-sm text-slate-500">Sessions expire after 30 minutes of inactivity.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Enabled</span></div><div className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold text-slate-900">Role-based access</p><p className="mt-1 text-sm text-slate-500">Admin routes are restricted to approved administrator accounts.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span></div></div></>}
        </section>
      </div>
    </div>
  );
}
