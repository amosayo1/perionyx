"use client";

import { SessionProvider } from "next-auth/react";
import { A11yStyles } from "@/accessibility/a11y-styles";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <A11yStyles />
      {children}
    </SessionProvider>
  );
}
