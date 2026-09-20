"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Eye,
  EyeOff,
  Footprints,
  Lock,
  Map,
  Mountain,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await signIn(username.trim(), password);
    setLoading(false);

    if (res.success) {
      Swal.fire({
        title: "Welcome back!",
        text: "You have signed in successfully.",
        icon: "success",
        confirmButtonColor: "#366644",
        background: "#fbfaf3",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      if (res.role === "ranger") {
        router.push("/ranger/dashboard");
      } else {
        router.push("/home");
      }
    } else {
      setError(res.error ?? "Invalid credentials.");
      Swal.fire({
        title: "Sign In Failed",
        text: res.error ?? "Invalid credentials.",
        icon: "error",
        confirmButtonColor: "#b5511f",
        background: "#fbfaf3",
      });
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
          <span className="text-white text-xl font-bold font-display">Mapanuepe Trail</span>
        </div>

        <div>
          <h1 className="text-white text-5xl font-extrabold tracking-tight leading-tight font-display">
            Explore the
            <br />
            Beauty of
            <br />
            Mapanuepe Lake
          </h1>
          <p className="text-canopy-300 text-lg mt-6 max-w-md leading-7">
            Trek through the scenic trails of San Marcelino, Zambales. Register
            your journey and explore safely.
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
            <span className="text-bark-900 text-xl font-bold font-display">Mapanuepe Trail</span>
          </div>

          <h2 className="text-bark-900 text-3xl font-extrabold mb-2 font-display">
            Welcome back
          </h2>
          <p className="text-bark-500 text-sm mb-8">
            Sign in to continue your journey
          </p>

          {error && (
            <div className="bg-rust-100/50 border border-rust-100 rounded-xl p-3 mb-4">
              <p className="text-rust-600 text-xs font-semibold">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-bark-500 text-xs font-semibold uppercase tracking-widest mb-2 block">
              Username
            </label>
            <div className="flex items-center bg-parchment-100 border border-bark-100 rounded-xl px-4 gap-3 focus-within:border-canopy-500 transition-colors">
              <User size={16} className="text-bark-300" />
              <input
                className="flex-1 py-3.5 text-bark-900 text-sm bg-transparent outline-none"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-bark-500 text-xs font-semibold uppercase tracking-widest mb-2 block">
              Password
            </label>
            <div className="flex items-center bg-parchment-100 border border-bark-100 rounded-xl px-4 gap-3 focus-within:border-canopy-500 transition-colors">
              <Lock size={16} className="text-bark-300" />
              <input
                className="flex-1 py-3.5 text-bark-900 text-sm bg-transparent outline-none"
                placeholder="••••••••"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
              <button
                onClick={() => setShowPw((p) => !p)}
                className="cursor-pointer"
              >
                {showPw ? (
                  <EyeOff size={16} className="text-bark-300" />
                ) : (
                  <Eye size={16} className="text-bark-300" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <span className="text-canopy-600 text-sm font-semibold cursor-pointer hover:text-canopy-700">
              Forgot password?
            </span>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full rounded-xl py-4 flex items-center justify-center mb-4 bg-canopy-700 text-white text-sm font-bold tracking-wide hover:bg-canopy-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>

          <div className="flex justify-center items-center gap-1">
            <span className="text-bark-500 text-sm">
              {"Don't have an account?"}
            </span>
            <Link
              href="/sign-up"
              className="text-canopy-600 text-sm font-bold hover:text-canopy-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}