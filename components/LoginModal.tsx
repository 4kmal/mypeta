import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Mail, Lock, ArrowLeft, Github } from "lucide-react";

type ModalView =
  | "login"
  | "signup"
  | "signup-success"
  | "forgot-password"
  | "forgot-password-success";

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, signInWithOAuth, signInWithEmail, signUpWithEmail, resetPassword } =
    useSupabase();
  const [view, setView] = useState<ModalView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setView("login");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
      resetForm();
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await signInWithEmail(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error: err } = await signUpWithEmail(email, password);
    if (err) {
      setError(err);
    } else {
      setView("signup-success");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err);
    } else {
      setView("forgot-password-success");
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setError(null);
    try {
      await signInWithOAuth(provider);
    } catch {
      setError("OAuth sign-in failed. Please try again.");
    }
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === "login" && "Sign In"}
            {view === "signup" && "Create Account"}
            {view === "signup-success" && "Check Your Email"}
            {view === "forgot-password" && "Reset Password"}
            {view === "forgot-password-success" && "Check Your Email"}
          </DialogTitle>
          <DialogDescription>
            {view === "login" && "Sign in to Peta Malaysia"}
            {view === "signup" && "Create your Peta Malaysia account"}
            {view === "signup-success" &&
              "We sent a confirmation link to your email"}
            {view === "forgot-password" &&
              "Enter your email to receive a reset link"}
            {view === "forgot-password-success" &&
              "We sent a password reset link to your email"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Success states */}
          {(view === "signup-success" ||
            view === "forgot-password-success") && (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {view === "signup-success"
                  ? "Please check your email and click the confirmation link to complete your registration."
                  : "Please check your email and click the reset link to update your password."}
              </p>
              <Button variant="outline" onClick={() => setView("login")}>
                Back to Sign In
              </Button>
            </div>
          )}

          {/* Login / Signup form */}
          {(view === "login" || view === "signup") && (
            <>
              {/* OAuth buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleOAuth("github")}
                >
                  <Github className="h-4 w-4" />
                  Continue with GitHub
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleOAuth("google")}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-300 dark:border-zinc-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">
                    or
                  </span>
                </div>
              </div>

              {/* Email/Password form */}
              <form
                onSubmit={
                  view === "login" ? handleEmailSignIn : handleEmailSignUp
                }
                className="flex flex-col gap-3"
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
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading
                    ? "Loading..."
                    : view === "login"
                      ? "Sign In"
                      : "Create Account"}
                </Button>
              </form>

              {/* Toggle login/signup + forgot password */}
              <div className="flex flex-col items-center gap-2 text-sm">
                {view === "login" && (
                  <button
                    type="button"
                    onClick={() => setView("forgot-password")}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Forgot password?
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setView(view === "login" ? "signup" : "login");
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {view === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}

          {/* Forgot password form */}
          {view === "forgot-password" && (
            <>
              <form
                onSubmit={handleForgotPassword}
                className="flex flex-col gap-3"
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

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setView("login");
                }}
                className="flex items-center justify-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
