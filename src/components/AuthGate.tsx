"use client";

import { supabase } from "@/lib/supabase";
import { useDesignStore } from "@/lib/store";
import { useState, useEffect } from "react";

/* ── Access Control ── */
const APP_PASSWORD = "kenwilber"; // case-insensitive
const ALLOWED_PHONES = ["9830067217", "9830024611", "9167719898", "9820889081"];
const PHONE_PASSWORD = "123456";

function LeafLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <path d="M16 2C10 8 4 16 4 22c0 5 4 8 8 8 2 0 3-1 4-2 1 1 2 2 4 2 4 0 8-3 8-8 0-6-6-14-12-20z" fill="#2D6A4F" />
      <path d="M16 10v16M16 14c-3 2-5 5-5 8M16 18c3-2 5-4 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════
   STEP 1: App-level password gate
   ══════════════════════════════════════════════ */
function AppPasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = () => {
    if (pw.trim().toLowerCase() === APP_PASSWORD) {
      // Store in sessionStorage so refresh doesn't re-ask within same tab
      sessionStorage.setItem("vatika-access", "granted");
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center px-4">
      <div className={`max-w-sm w-full ${shaking ? "animate-shake" : ""}`}>
        <div className="text-center mb-8">
          <LeafLogo className="w-20 h-20 mx-auto mb-4" />
          <h1
            className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Vatika.AI
          </h1>
          <p className="text-white/50 text-sm">Private Access</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <label className="block text-white/70 text-sm font-medium mb-2">
            Enter access code
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Access code"
            className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white placeholder-white/30 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-gold transition-all ${
              error ? "border-red-400 bg-red-500/10" : "border-white/20 focus:border-gold"
            }`}
            autoFocus
          />
          {error && (
            <p className="text-red-300 text-xs mt-2 text-center">
              Invalid access code. Contact the team for access.
            </p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full mt-4 py-3 rounded-xl bg-gold hover:bg-gold-light text-forest-dark font-bold text-sm transition-all hover:scale-[1.02]"
          >
            Enter
          </button>
        </div>

        <p className="text-center text-white/30 text-[10px] mt-6">
          Vatika.AI &mdash; NatureLink Education Network Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STEP 2: Phone + password login (restricted)
   ══════════════════════════════════════════════ */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useDesignStore();
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Check if app password was already entered this session
  useEffect(() => {
    if (sessionStorage.getItem("vatika-access") === "granted") {
      setAppUnlocked(true);
    }
  }, []);

  // Check existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Verify this user's phone is in allowed list
        const userPhone = session.user.user_metadata?.phone;
        if (userPhone && ALLOWED_PHONES.includes(userPhone)) {
          setUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.name ||
              session.user.user_metadata?.full_name ||
              "User",
            phone: userPhone,
          });
        } else {
          // Phone not allowed — sign them out
          supabase.auth.signOut();
          setUser(null);
        }
      }
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userPhone = session.user.user_metadata?.phone;
        if (userPhone && ALLOWED_PHONES.includes(userPhone)) {
          setUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.name ||
              session.user.user_metadata?.full_name ||
              "User",
            phone: userPhone,
          });
        } else {
          supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  // Convert phone to email for Supabase email auth
  const phoneToEmail = (p: string) => {
    const digits = p.replace(/\D/g, "").slice(-10);
    return `${digits}@vatikastudio.app`;
  };

  const handlePhoneAuth = async () => {
    const digits = phone.replace(/\D/g, "").slice(-10);

    if (!digits || digits.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    // Check if phone is in allowed list
    if (!ALLOWED_PHONES.includes(digits)) {
      setError("This number is not authorized. Contact the Vatika.AI team for access.");
      return;
    }

    // Check password
    if (password !== PHONE_PASSWORD) {
      setError("Incorrect password");
      return;
    }

    setLoading(true);
    setError(null);
    const email = phoneToEmail(phone);

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim(), phone: digits },
        },
      });
      if (err) {
        if (err.message.includes("already registered")) {
          setError("This number is already registered. Please login instead.");
        } else {
          setError(err.message);
        }
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        if (err.message.includes("Invalid login")) {
          setError("Number not registered yet. Please sign up first.");
        } else {
          setError(err.message);
        }
      }
    }
    setLoading(false);
  };

  // ── Gate 1: App password ──
  if (!appUnlocked) {
    return <AppPasswordGate onUnlock={() => setAppUnlocked(true)} />;
  }

  // ── Loading ──
  if (initializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <LeafLogo className="w-12 h-12 mx-auto mb-3 animate-pulse" />
          <div className="text-forest text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // ── Gate 2: If logged in, show the app ──
  if (user) return <>{children}</>;

  // ── Login/Signup form (phone numbers restricted) ──
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <LeafLogo className="w-16 h-16 mx-auto mb-3" />
          <h1
            className="text-2xl font-bold text-forest"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Vatika.AI
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            by KarmYog &middot; Biophilic Design Studio
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-forest mb-1 text-center">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-xs text-gray-400 text-center mb-5">
            Authorized team members only
          </p>

          {/* Name (signup only) */}
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm mb-3 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
            />
          )}

          {/* Phone */}
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(null); }}
            placeholder="Mobile number (10 digits)"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm mb-3 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
          />

          {/* Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm mb-3 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePhoneAuth();
            }}
          />

          {/* Error */}
          {error && (
            <p className="text-red-600 text-xs mb-3 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handlePhoneAuth}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-forest text-white font-semibold hover:bg-forest-light disabled:opacity-50 transition-colors text-sm"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-xs text-gray-500 mt-4">
            {mode === "login" ? (
              <>
                First time?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(null); }}
                  className="text-forest font-semibold hover:underline"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  onClick={() => { setMode("login"); setError(null); }}
                  className="text-forest font-semibold hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          Vatika.AI &mdash; NatureLink Education Network Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
