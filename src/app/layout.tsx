import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Fala Road Contracting — CRM + ERP Platform",
  description:
    "Unified multi-entity enterprise ERP & CRM demonstration for Fala Road Contracting and infrastructure conglomerate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white antialiased" suppressHydrationWarning>
      <body
        className="h-full flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900"
        suppressHydrationWarning
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
