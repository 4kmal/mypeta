import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { updatePassword, session, isLoading } = useSupabase();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // Check if user has a valid recovery session
  useEffect(() => {
    if (!isLoading && !session) {
      setInvalidLink(true);
    }
  }, [isLoading, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      // Redirect home after 3 seconds
      setTimeout(() => router.push("/"), 3000);
    }
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#111114]">
        <div className="h-8 w-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Update Password - Peta Malaysia</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#111114] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
            {invalidLink ? (
              <div className="text-center py-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                  Invalid or Expired Link
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </p>
                <Link href="/auth/forgot-password">
                  <Button>Request New Link</Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                  Password Updated
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Your password has been updated. Redirecting you home...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                    Update Password
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    Enter your new password
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="New password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
