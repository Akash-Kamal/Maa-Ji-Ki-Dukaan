import React from "react";
import { CustomerNavbar } from "@/components/layout/CustomerNavbar";
import { CustomerFooter } from "@/components/layout/CustomerFooter";
import { BeveragePatternBackground } from "@/components/ui/BeveragePatternBackground";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-white overflow-x-hidden">
      <BeveragePatternBackground variant="page" />
      <CustomerNavbar />
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <CustomerFooter />
    </div>
  );
}
