import { useEffect, useState } from "react";
import { useSupabase } from "@/contexts/SupabaseContext";
import Head from "next/head";

export default function DebugAuth() {
  const {
    user,
    session,
    profile,
    isAuthenticated,
    isLoading,
    supabase,
    openLoginModal,
    signOut,
  } = useSupabase();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (
    test: string,
    status: "pass" | "fail" | "info",
    message: string,
    data?: any
  ) => {
    setTestResults((prev) => [
      ...prev,
      { test, status, message, data, timestamp: new Date().toISOString() },
    ]);
  };

  const runTests = async () => {
    setTestResults([]);
    setLoading(true);

    try {
      // Test 1: Supabase client initialized
      addResult(
        "Supabase Client",
        supabase ? "pass" : "fail",
        `Supabase client initialized: ${!!supabase}`
      );

      // Test 2: Auth loading complete
      addResult(
        "Auth Loading",
        !isLoading ? "pass" : "info",
        `Auth loading complete: ${!isLoading}`
      );

      // Test 3: Session status
      addResult(
        "Session",
        isAuthenticated ? "pass" : "info",
        isAuthenticated
          ? `Active session for ${user?.email}`
          : "No active session"
      );

      if (!isAuthenticated || !user) {
        addResult(
          "Tests",
          "info",
          "Sign in to continue with authenticated tests"
        );
        setLoading(false);
        return;
      }

      // Test 4: User data from auth
      addResult("Auth User", "info", `User ID: ${user.id}`, {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
        created_at: user.created_at,
      });

      // Test 5: Profile loaded
      if (profile) {
        addResult("Profile", "pass", "Profile loaded from profiles table", {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          selected_state: profile.selected_state,
          points: profile.points,
          exp: profile.exp,
          level: profile.level,
          status: profile.status,
        });
      } else {
        addResult(
          "Profile",
          "fail",
          "Profile not found — DB trigger may not have fired yet"
        );
      }

      // Test 6: Supabase connection (direct query)
      try {
        const { data: pingData, error: pingError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        addResult(
          "Supabase Query",
          !pingError ? "pass" : "fail",
          !pingError
            ? "Direct query to profiles table succeeded"
            : `Error: ${pingError.message}`
        );
      } catch (error: any) {
        addResult("Supabase Query", "fail", `Exception: ${error.message}`);
      }

      // Test 7: RLS policy check
      try {
        const { data, error: rlsError } = await supabase
          .from("profiles")
          .select("points, exp, level")
          .eq("id", user.id)
          .single();

        if (rlsError) {
          addResult("RLS Policy", "fail", `RLS error: ${rlsError.message}`);
        } else {
          addResult("RLS Policy", "pass", "Can read own profile via RLS", data);
        }
      } catch (error: any) {
        addResult("RLS Policy", "fail", `Exception: ${error.message}`);
      }

      // Test 8: award_gamification RPC (dry run with 0 values)
      try {
        const { data, error: rpcError } = await supabase.rpc(
          "award_gamification",
          {
            p_user_id: user.id,
            p_points: 0,
            p_exp: 0,
            p_reason: "debug_test",
          }
        );

        if (rpcError) {
          addResult(
            "award_gamification RPC",
            "fail",
            `RPC error: ${rpcError.message}`
          );
        } else {
          addResult(
            "award_gamification RPC",
            "pass",
            "RPC callable (0-value test)",
            data
          );
        }
      } catch (error: any) {
        addResult(
          "award_gamification RPC",
          "fail",
          `Exception: ${error.message}`
        );
      }

      // Test 9: update_user_state_v2 RPC (re-set current state)
      if (profile?.selected_state) {
        try {
          const { error: stateError } = await supabase.rpc(
            "update_user_state_v2",
            {
              p_state_id: profile.selected_state,
            }
          );

          addResult(
            "update_user_state_v2 RPC",
            !stateError ? "pass" : "fail",
            !stateError
              ? `Successfully called with state: ${profile.selected_state}`
              : `Error: ${stateError.message}`
          );
        } catch (error: any) {
          addResult(
            "update_user_state_v2 RPC",
            "fail",
            `Exception: ${error.message}`
          );
        }
      } else {
        addResult(
          "update_user_state_v2 RPC",
          "info",
          "Skipped — no state selected"
        );
      }

      // Test 10: Real-time subscription check
      try {
        const channel = supabase
          .channel("debug-test")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${user.id}`,
            },
            () => {}
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              addResult(
                "Real-time",
                "pass",
                "Real-time subscription active"
              );
              supabase.removeChannel(channel);
            }
          });

        // Timeout fallback
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 5000);
      } catch (error: any) {
        addResult("Real-time", "fail", `Exception: ${error.message}`);
      }
    } catch (error: any) {
      addResult("Test Suite", "fail", `Fatal error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      runTests();
    }
  }, [isLoading, isAuthenticated, user?.id, profile?.id]);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "pass":
        return "\u2705";
      case "fail":
        return "\u274C";
      case "info":
        return "\u2139\uFE0F";
      default:
        return "\u2753";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "text-green-600 dark:text-green-400";
      case "fail":
        return "text-red-600 dark:text-red-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <>
      <Head>
        <title>Auth Debug - Peta Malaysia</title>
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Authentication Debug Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tests Supabase Auth, profiles table, RLS policies, and RPCs
            </p>
          </div>

          <div className="mb-6 flex gap-4">
            <button
              onClick={runTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Running Tests..." : "Run Tests Again"}
            </button>
            {!isAuthenticated ? (
              <button
                onClick={openLoginModal}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Refresh Page
            </button>
          </div>

          {testResults.length === 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Click &quot;Run Tests Again&quot; to start diagnostics
            </div>
          )}

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.status === "pass"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : result.status === "fail"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {getStatusEmoji(result.status)}
                  </span>
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg mb-1 ${getStatusColor(result.status)}`}
                    >
                      {result.test}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                          Show Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Current State
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Auth Provider:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Supabase Auth
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Authenticated:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {isAuthenticated ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  User ID:
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {user?.id || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Email:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {user?.email || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Provider:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {user?.app_metadata?.provider || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Selected State:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {profile?.selected_state || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Points:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {profile?.points ?? "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  EXP:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {profile?.exp ?? "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Level:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {profile?.level ?? "null"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              &larr; Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
