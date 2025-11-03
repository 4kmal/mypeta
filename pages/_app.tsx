import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <LanguageProvider>
          <UserProfileProvider>
            <DataProvider>
              <Component {...pageProps} />
              <Toaster />
            </DataProvider>
          </UserProfileProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
