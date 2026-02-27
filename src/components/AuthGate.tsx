"use client";

import { supabase } from "@/lib/supabase";
import { useDesignStore } from "@/lib/store";
import { useState, useEffect } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useDesignStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          phone: session.user.user_metadata?.phone,
        });
      }
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name:
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
          phone: session.user.user_metadata?.phone,
        });
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
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
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
          data: { name: name.trim(), phone: phone.replace(/\D/g, "").slice(-10) },
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
          setError("Wrong password or number not registered. Try signing up.");
        } else {
          setError(err.message);
        }
      }
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (err) setError(err.message);
    setLoading(false);
  };

  // Show loading while checking session
  if (initializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-forest text-lg">Loading...</div>
      </div>
    );
  }

  // If logged in, show the app
  if (user) return <>{children}</>;

  // Login/Signup form
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg viewBox="0 0 32 32" className="w-16 h-16 mx-auto mb-3" fill="none">
            <path d="M16 2C10 8 4 16 4 22c0 5 4 8 8 8 2 0 3-1 4-2 1 1 2 2 4 2 4 0 8-3 8-8 0-6-6-14-12-20z" fill="#2D6A4F" />
            <path d="M16 10v16M16 14c-3 2-5 5-5 8M16 18c3-2 5-4 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h1 className="text-2xl font-bold text-forest" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Vatika.AI</h1>
          <p className="text-sm text-gray-500 mt-1">
            by KarmYog &middot; Biophilic Design Studio
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-forest mb-4 text-center">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or use mobile number</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number (10 digits)"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm mb-3 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
          />

          {/* Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
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
                New here?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="text-forest font-semibold hover:underline"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-forest font-semibold hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          KarmYog Vatika Design Studio — NatureLink Education Network Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
