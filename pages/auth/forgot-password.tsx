import Head from "next/head";
import { useState } from "react";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { resetPassword } = useSupabase();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Peta Malaysia</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#111114] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
            {success ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                  Check Your Email
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  We sent a password reset link to{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    {email}
                  </strong>
                </p>
                <Link href="/sign-in">
                  <Button variant="outline">Back to Sign In</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                    Reset Password
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    Enter your email to receive a reset link
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
