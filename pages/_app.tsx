import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <UserProfileProvider>
          <DataProvider>
            <Component {...pageProps} />
            <Toaster />
          </DataProvider>
        </UserProfileProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
