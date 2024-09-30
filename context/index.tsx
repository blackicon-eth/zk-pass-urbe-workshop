"use client";
import React, { ReactNode } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";

// Setup queryClient
const queryClient = new QueryClient();

export const config = getDefaultConfig({
  appName: "zkPass Demo App",
  projectId: "f01cf64d877f3cb844fb83114d02d88c",
  chains: [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export function ContextProvider({ children, initialState }: { children: ReactNode; initialState?: State }) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
