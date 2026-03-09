import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          socialButtonsBlockButton: "h-12 !w-full",
          socialButtonsBlockButtonText: "flex-1",
          socialButtonsProviderIcon: "flex-shrink-0",
          socialButtonsIconButton: "h-12 !w-full",
          socialButtons: "!flex !flex-col !gap-2 !w-full",
        },
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "blockButton",
        },
      }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <UserProfileProvider>
            <DataProvider>
              <Component {...pageProps} />
              <Toaster />
              <Analytics />
            </DataProvider>
          </UserProfileProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
