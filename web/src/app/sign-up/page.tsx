"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Eye,
  EyeOff,
  Footprints,
  Lock,
  Mail,
  Map,
  Mountain,
  Phone,
  Shield,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function InputField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="mb-4">
      <div className="flex flex-row items-center gap-1 mb-2">
        <label className="text-bark-500 text-[11px] font-semibold uppercase tracking-widest">
          {label}
        </label>
        {required && (
          <span className="text-[11px] font-bold text-rust-500">*</span>
        )}
      </div>
      <div className="flex flex-row items-center bg-parchment-100 border border-bark-100 rounded-xl px-4 gap-3 focus-within:border-canopy-500 transition-colors">
        <Icon size={15} color="#a89b84" />
        <input
          className="flex-1 py-3.5 text-[14px] text-bark-900 bg-transparent outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={isPassword ? (show ? "text" : "password") : (type ?? "text")}
        />
        {isPassword && (
          <button onClick={() => setShow((p) => !p)} className="cursor-pointer">
            {show ? (
              <EyeOff size={15} color="#a89b84" />
            ) : (
              <Eye size={15} color="#a89b84" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex flex-row items-center gap-2.5 mt-6 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-canopy-100">
        <Icon size={12} color="#366644" />
      </div>
      <span className="text-[10px] font-bold text-bark-500 tracking-[1.5px] uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-bark-100" />
    </div>
  );
}

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    password: "",
    confirmPassword: "",
  });

  const update = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));
  const passwordsMatch =
    form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleSignUp = async () => {
    if (
      !form.username.trim() ||
      !form.password.trim() ||
      !form.email.trim() ||
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.phone.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await signUp({
      username: form.username,
      password: form.password,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      role: "trekker",
      phone: form.phone,
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_phone: form.emergency_contact_phone,
      offline_maps_downloaded: false,
    });
    setLoading(false);
    if (res.success) {
      router.push("/sign-in");
    } else {
      setError(res.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-expedition flex">
      {/* ── Left Panel (Brand) ───────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-expedition">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Mountain size={24} className="text-canopy-300" />
          </div>
          <span className="text-white text-xl font-bold font-display">
            Mapanuepe Trail
          </span>
        </div>

        <div>
          <h1 className="text-white text-5xl font-extrabold tracking-tight leading-tight font-display">
            Join the
            <br />
            Adventure at
            <br />
            Mapanuepe Lake
          </h1>
          <p className="text-canopy-300 text-lg mt-6 max-w-md leading-7">
            Create your account to register for treks, get your travel QR code,
            and explore the scenic trails of San Marcelino, Zambales.
          </p>

          <div className="flex flex-row gap-3 mt-8">
            {[
              { icon: <Footprints size={14} className="text-canopy-300" />, label: "Travel" },
              { icon: <Map size={14} className="text-canopy-300" />, label: "Navigate" },
              { icon: <Shield size={14} className="text-canopy-300" />, label: "Safe" },
            ].map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10"
              >
                {c.icon}
                <span className="text-canopy-300 text-sm font-medium">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-canopy-300 text-sm">
          © 2026 Mapanuepe Trail · San Marcelino, Zambales
        </p>
      </div>

      {/* ── Right Panel (Form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-topo p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-canopy-700 flex items-center justify-center">
              <Mountain size={24} className="text-canopy-300" />
            </div>
            <span className="text-bark-900 text-xl font-bold font-display">
              Mapanuepe Trail
            </span>
          </div>

          {/* Heading row: Back button + title aligned horizontally */}
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 bg-canopy-700/10 border border-canopy-700/20 px-3 py-2 rounded-xl hover:bg-canopy-700/20 transition-colors shrink-0"
            >
              <ArrowLeft size={16} className="text-canopy-700" />
              <span className="text-canopy-700 text-xs font-bold">Back</span>
            </Link>
            <h2 className="text-bark-900 text-3xl font-extrabold font-display leading-none">
              Create Account
            </h2>
          </div>
          <p className="text-bark-500 text-sm mb-8">
            Register for Mapanuepe Trail
          </p>

          {error && (
            <div className="bg-rust-100/50 border border-rust-100 rounded-xl p-3 mb-4">
              <p className="text-rust-600 text-xs font-semibold">{error}</p>
            </div>
          )}

          <SectionHeader icon={UserPlus} label="Account Information" />
          <InputField
            label="Username"
            icon={AtSign}
            placeholder="e.g. juan_delaCruz"
            value={form.username}
            onChange={(v) => update("username", v)}
            required
          />
          <InputField
            label="First Name"
            icon={User}
            placeholder="Juan"
            value={form.first_name}
            onChange={(v) => update("first_name", v)}
            required
          />
          <InputField
            label="Last Name"
            icon={User}
            placeholder="Dela Cruz"
            value={form.last_name}
            onChange={(v) => update("last_name", v)}
            required
          />
          <InputField
            label="Email Address"
            icon={Mail}
            placeholder="juan@example.com"
            value={form.email}
            onChange={(v) => update("email", v)}
            type="email"
            required
          />
          <InputField
            label="Phone Number"
            icon={Phone}
            placeholder="09171234567"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            type="tel"
            required
          />

          <SectionHeader icon={AlertTriangle} label="Emergency Contact" />
          <InputField
            label="Contact Name"
            icon={Users}
            placeholder="Maria Dela Cruz"
            value={form.emergency_contact_name}
            onChange={(v) => update("emergency_contact_name", v)}
          />
          <InputField
            label="Contact Number"
            icon={Phone}
            placeholder="09987654321"
            value={form.emergency_contact_phone}
            onChange={(v) => update("emergency_contact_phone", v)}
            type="tel"
          />

          <SectionHeader icon={ShieldCheck} label="Security" />
          <InputField
            label="Password"
            icon={Lock}
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={(v) => update("password", v)}
            type="password"
            required
          />
          <InputField
            label="Confirm Password"
            icon={Lock}
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={(v) => update("confirmPassword", v)}
            type="password"
            required
          />

          {form.confirmPassword.length > 0 && (
            <div className="flex flex-row items-center gap-2 -mt-2 mb-3 px-0.5">
              {passwordsMatch ? (
                <ShieldCheck size={13} color="#366644" />
              ) : (
                <AlertTriangle size={13} color="#a3291f" />
              )}
              <span
                className={`text-[12px] font-medium ${passwordsMatch ? "text-canopy-600" : "text-rust-500"}`}
              >
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </span>
            </div>
          )}

          <div className="flex flex-row gap-3 rounded-xl p-4 mt-2 mb-6 bg-amber-50/70 border border-amber-200">
            <AlertTriangle size={14} color="#b45309" className="mt-0.5 shrink-0" />
            <p className="flex-1 text-[12px] text-amber-800 leading-[18px]">
              By registering, you agree to follow all safety guidelines and take
              responsibility for your safety during travelling activities.
            </p>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full rounded-xl py-4 flex items-center justify-center mb-4 bg-canopy-700 text-white text-sm font-bold tracking-wide hover:bg-canopy-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>

          <div className="flex flex-row justify-center items-center gap-1">
            <span className="text-bark-500 text-sm">
              Already registered?
            </span>
            <Link
              href="/sign-in"
              className="text-canopy-600 text-sm font-bold hover:text-canopy-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}