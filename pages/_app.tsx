import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import LoginModal from "@/components/LoginModal";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <LanguageProvider>
          <DataProvider>
            <Component {...pageProps} />
            <LoginModal />
            <Toaster />
          </DataProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
