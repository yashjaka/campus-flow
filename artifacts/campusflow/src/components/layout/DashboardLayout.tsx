import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { GradientBackground } from "./GradientBackground";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <GradientBackground>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 flex-col glass-sidebar z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-30">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </GradientBackground>
  );
}
