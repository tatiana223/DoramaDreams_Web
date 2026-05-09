import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Header />

      <main>
        {children}
      </main>

      <Footer />
    </div>
  );
}