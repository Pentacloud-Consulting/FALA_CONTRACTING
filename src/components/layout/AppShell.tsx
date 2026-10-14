"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PublicHomePage from "@/components/home/PublicHomePage";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  const pathname = usePathname();

  // If on the home page and not authenticated, render public full-screen landing page directly
  if (!isAuthenticated && pathname === "/") {
    return <>{children}</>;
  }

  // If on an internal route and not authenticated, show public home with login prompt
  if (!isAuthenticated && pathname !== "/") {
    return <PublicHomePage />;
  }

  // When authenticated, render full enterprise ERP layout
  return (
    <div className="flex h-full flex-col min-h-screen bg-white print:block print:h-auto print:min-h-0">
      <Header />
      <div className="flex flex-1 overflow-hidden bg-white print:block print:overflow-visible">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white p-3.5 sm:p-4 lg:p-4.5 print:p-0 print:m-0 print:w-full print:max-w-none print:overflow-visible">
          <div className="max-w-[1680px] mx-auto space-y-3 print:max-w-none print:m-0 print:p-0 print:space-y-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
