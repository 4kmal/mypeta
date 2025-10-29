import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PrivyProvider } from "@privy-io/react-auth";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ['twitter'],
        appearance: {
          theme: 'light',
          accentColor: '#3b82f6',
        },
      }}
    >
      <ThemeProvider>
        <DataProvider>
          <Component {...pageProps} />
        </DataProvider>
      </ThemeProvider>
    </PrivyProvider>
  );
}
