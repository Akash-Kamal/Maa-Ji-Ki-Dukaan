import React from "react";
import { CustomerNavbar } from "@/components/layout/CustomerNavbar";
import { CustomerFooter } from "@/components/layout/CustomerFooter";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <CustomerNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <CustomerFooter />
    </div>
  );
}
