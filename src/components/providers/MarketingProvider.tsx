"use client";

import { createContext, useContext } from "react";
import { useMarketingData, type MarketingData } from "@/hooks/useMarketingData";

const MarketingContext = createContext<MarketingData | null>(null);

export function MarketingProvider({ children }: { children: React.ReactNode }) {
  const data = useMarketingData();
  return (
    <MarketingContext.Provider value={data}>{children}</MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error("useMarketing must be used within MarketingProvider");
  return ctx;
}
