import { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("[AuthCallback] Error:", error);
        router.replace(
          `/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
        );
        return;
      }

      // Redirect to the `next` param or home
      const next = (router.query.next as string) || "/";
      // Prevent open redirect
      const safeNext = next.startsWith("/") ? next : "/";
      router.replace(safeNext);
    };

    // Only run when the URL has the code parameter
    if (router.isReady) {
      handleCallback();
    }
  }, [router, router.isReady]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#111114]">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">Signing you in...</p>
      </div>
    </div>
  );
}
