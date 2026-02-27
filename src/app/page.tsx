"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDesignStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import AuthGate from "@/components/AuthGate";
import DesignInput from "@/components/DesignInput";
import DesignResult from "@/components/DesignResult";

/* ── Leaf SVG logo ── */
function LeafLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M16 2C10 8 4 16 4 22c0 5 4 8 8 8 2 0 3-1 4-2 1 1 2 2 4 2 4 0 8-3 8-8 0-6-6-14-12-20z"
        fill="#2D6A4F"
      />
      <path
        d="M16 10v16M16 14c-3 2-5 5-5 8M16 18c3-2 5-4 5-6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppContent() {
  const router = useRouter();
  const { step, user, setUser } = useDesignStore();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 navbar-blur ${
          scrolled ? "navbar-scrolled" : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LeafLogo className="w-9 h-9" />
            <div>
              <h1
                className={`text-xl font-bold leading-tight transition-colors ${
                  scrolled || step === 2 ? "text-forest" : "text-white"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                Vatika.AI
              </h1>
              <p
                className={`text-[10px] leading-tight transition-colors ${
                  scrolled || step === 2 ? "text-muted" : "text-white/60"
                }`}
              >
                by KarmYog
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Catalog link (visible on scroll) */}
            {scrolled && (
              <button
                className="hidden sm:block text-sm font-medium text-forest hover:text-forest-light transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Home
              </button>
            )}

            {/* Hamburger menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    scrolled || step === 2
                      ? "hover:bg-gray-100 text-forest"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-gray-100 w-56 z-40 overflow-hidden animate-fade-up">
                      <div className="px-4 py-3 bg-sage/30 border-b border-gray-100">
                        <p className="text-sm font-semibold text-forest">{user.name}</p>
                        {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { setShowMenu(false); router.push("/my-designs"); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                          <span className="text-gray-700 font-medium">My Designs</span>
                        </button>
                        <button
                          onClick={() => { setShowMenu(false); useDesignStore.getState().setStep(1); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          <span className="text-gray-700 font-medium">New Design</span>
                        </button>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
                              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            <span className="text-red-500 font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════ HERO SECTION (Step 1 only) ═══════════════════ */}
      {step === 1 && (
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background — deep forest gradient with botanical pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest-dark via-forest to-forest-light" />
          {/* Subtle leaf pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-5 6-12 14-12 20 0 5 4 8 8 8 2 0 3-1 4-2 1 1 2 2 4 2 4 0 8-3 8-8 0-6-7-14-12-20z' fill='white' fill-opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Radial glow */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 py-32 text-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80 text-sm font-medium">AI-Powered Design Studio</span>
              </div>
            </div>

            <h2
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-up-d1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Dream Green Space,
              <br />
              <span className="text-gold">Built by AI</span>
            </h2>

            <p className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto mb-8 animate-fade-up-d2" style={{ fontFamily: "var(--font-sans)" }}>
              Upload a photo. Set a budget. Watch your space come alive with real products from our curated catalog.
            </p>

            <div className="animate-fade-up-d3">
              <button
                onClick={() => {
                  const el = document.getElementById("design-studio");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-forest-dark font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Designing
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-up-d4">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                500+ Spaces Transformed
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                4.9/5 Rating
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8l4 2.5v4L16 16" />
                </svg>
                Ships from Kolkata
              </div>
            </div>

            {/* Scroll arrow */}
            <div className="mt-16 animate-bounce-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="mx-auto opacity-40">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ HOW IT WORKS (Step 1 only) ═══════════════════ */}
      {step === 1 && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <h3
              className="text-3xl sm:text-4xl font-bold text-forest text-center mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Choose Your Space",
                  desc: "Balcony, living room, or terrace — pick your canvas.",
                  icon: (
                    <svg viewBox="0 0 48 48" className="w-14 h-14">
                      <rect x="8" y="12" width="32" height="28" rx="4" fill="#E8F5E9" stroke="#2D6A4F" strokeWidth="2" />
                      <path d="M8 20h32" stroke="#2D6A4F" strokeWidth="2" />
                      <circle cx="24" cy="32" r="6" fill="#2D6A4F" opacity="0.2" />
                      <path d="M24 28v8M20 32h8" stroke="#2D6A4F" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  step: "2",
                  title: "Upload a Photo",
                  desc: "Snap your space as it is. Our AI sees the potential.",
                  icon: (
                    <svg viewBox="0 0 48 48" className="w-14 h-14">
                      <rect x="6" y="10" width="36" height="28" rx="4" fill="#E8F5E9" stroke="#2D6A4F" strokeWidth="2" />
                      <circle cx="24" cy="24" r="8" fill="none" stroke="#2D6A4F" strokeWidth="2" />
                      <circle cx="24" cy="24" r="4" fill="#2D6A4F" opacity="0.3" />
                      <rect x="20" y="8" width="8" height="4" rx="1" fill="#2D6A4F" />
                    </svg>
                  ),
                },
                {
                  step: "3",
                  title: "Get AI Design",
                  desc: "Watch your space come alive with real planters and plants.",
                  icon: (
                    <svg viewBox="0 0 48 48" className="w-14 h-14">
                      <path d="M24 6c-8 8-16 16-16 24 0 6 5 12 12 12 3 0 5-1 4-4 1 3 1 4 4 4 7 0 12-6 12-12 0-8-8-16-16-24z" fill="#E8F5E9" stroke="#2D6A4F" strokeWidth="2" />
                      <path d="M24 16v20M24 22c-4 3-6 7-6 10M24 26c4-3 6-5 6-8" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="36" cy="14" r="4" fill="#C8A45A" opacity="0.6" />
                      <path d="M34 12l2 2 4-4" stroke="#C8A45A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <div className="step-circle step-circle-pending mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="text-lg font-bold text-forest mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </h4>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            {/* Connecting vine line on desktop */}
            <div className="hidden sm:block relative -mt-[180px] mb-[120px] pointer-events-none">
              <div className="absolute left-[22%] right-[22%] top-1/2 border-t-2 border-dashed border-sage-dark" />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <main
        id="design-studio"
        className={`max-w-4xl mx-auto px-4 pb-16 ${
          step === 1 ? "pt-12" : "pt-20"
        }`}
      >
        {step === 1 && <DesignInput />}
        {step === 2 && <DesignResult />}
      </main>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-forest-dark text-white/70 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LeafLogo className="w-8 h-8" />
              <div>
                <div className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  Vatika.AI
                </div>
                <div className="text-white/40 text-xs">by KarmYog</div>
              </div>
            </div>

            <div className="text-center text-sm">
              <p>NatureLink Education Network Pvt. Ltd.</p>
              <p className="text-white/40 text-xs mt-1">
                Biophilic design solutions for urban spaces &middot; Kolkata, India
              </p>
            </div>

            <div className="flex items-center gap-4 text-white/40 text-sm">
              <a href="https://www.instagram.com/karmyogvatika" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Instagram
              </a>
              <a href="https://www.plantlibrary.net" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Plant Library
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGate>
      <AppContent />
    </AuthGate>
  );
}
