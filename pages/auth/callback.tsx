import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (!router.isReady || handled.current) return;
    handled.current = true;

    const supabase = createClient();

    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // For hash-fragment flow (implicit grant), the Supabase client
      // auto-detects tokens in the URL hash on creation. Just wait
      // briefly for the session to be established, then redirect.
      if (!code) {
        // Give the client a moment to process any hash fragment
        const { data: { session } } = await supabase.auth.getSession();
        const next = url.searchParams.get("next") || "/";
        const safeNext = next.startsWith("/") ? next : "/";
        router.replace(safeNext);
        return;
      }

      // PKCE / code flow
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[AuthCallback] Error:", error);
        router.replace(
          `/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
        );
        return;
      }

      const next = url.searchParams.get("next") || "/";
      const safeNext = next.startsWith("/") ? next : "/";
      router.replace(safeNext);
    };

    handleCallback();
  }, [router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#111114]">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">Signing you in...</p>
      </div>
    </div>
  );
}
