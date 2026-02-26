"use client";

import { useState } from "react";
import { useDesignStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import AuthGate from "@/components/AuthGate";
import DesignInput from "@/components/DesignInput";
import DesignResult from "@/components/DesignResult";
import MyDesigns from "@/components/MyDesigns";

function AppContent() {
  const { step, user, setUser } = useDesignStore();
  const [showMyDesigns, setShowMyDesigns] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-sage-dark sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-forest leading-tight">
                KarmYog Vatika
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Design Studio
              </p>
            </div>
          </div>

          {/* Right side: hamburger menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 w-56 z-40 overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 bg-sage/30 border-b border-gray-100">
                      <p className="text-sm font-semibold text-forest">
                        {user.name}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-gray-400">{user.phone}</p>
                      )}
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowMyDesigns(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        <span className="text-gray-700 font-medium">
                          My Designs
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          // Go to step 1 to create new design
                          useDesignStore.getState().setStep(1);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-forest">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span className="text-gray-700 font-medium">
                          New Design
                        </span>
                      </button>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                          </svg>
                          <span className="text-red-500 font-medium">
                            Logout
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-12">
        {step === 1 && <DesignInput />}
        {step === 2 && <DesignResult />}
      </main>

      {/* Footer */}
      <footer className="bg-forest-dark text-white/60 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>
            KarmYog Vatika Design Studio — NatureLink Education Network Pvt.
            Ltd.
          </p>
          <p className="mt-1 text-xs">
            Biophilic design solutions for urban spaces | Kolkata, India
          </p>
        </div>
      </footer>

      {/* My Designs Panel */}
      {showMyDesigns && (
        <MyDesigns onClose={() => setShowMyDesigns(false)} />
      )}
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
