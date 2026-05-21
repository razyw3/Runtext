/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";

type AppState = {
  initialized: boolean;
};

export default function App() {
  const [state, setState] = useState<AppState>({
    initialized: false,
  });

  useEffect(() => {
    const init = async () => {
      try {
        // tunggu DOM benar-benar siap (React render complete)
        await new Promise((r) => setTimeout(r, 0));

        // fallback safety: pastikan DOM sudah ada
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            window.dispatchEvent(new Event("DOMContentLoaded"));
          });
        } else {
          window.dispatchEvent(new Event("DOMContentLoaded"));
        }

        setState({ initialized: true });
      } catch (err) {
        console.error("App init error:", err);
      }
    };

    init();
  }, []);

  if (!state.initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading application...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* App Shell */}
      <header className="border-b bg-white px-4 py-3">
        <h1 className="text-sm font-semibold tracking-wide">
          Running Text Generator
        </h1>
      </header>

      <main className="p-4">
        <div className="rounded-xl border bg-white p-6 text-center text-slate-400">
          App ready. Canvas engine running via legacy script.js
        </div>
      </main>
    </div>
  );
}