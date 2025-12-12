import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { supabase } from "@/lib/supabase";
import Head from "next/head";

export default function DebugAuth() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { selectedState, stats, internalUserId } = useUserProfile();
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
      // Test 1: Clerk loaded
      addResult(
        "Clerk SDK",
        isLoaded ? "pass" : "fail",
        `Clerk SDK loaded: ${isLoaded}`
      );

      // Test 2: User signed in
      addResult(
        "Authentication",
        isSignedIn ? "pass" : "fail",
        `User signed in: ${isSignedIn}`
      );

      if (!isSignedIn || !user) {
        addResult("Tests", "info", "Please sign in to continue tests");
        setLoading(false);
        return;
      }

      // Test 3: User data
      addResult("Clerk User", "info", `User ID: ${user.id}`, {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
        externalAccounts: user.externalAccounts?.length || 0,
      });

      // Test 4: Supabase connection
      try {
        const { data: pingData, error: pingError } = await supabase
          .from("users")
          .select("count")
          .limit(1);

        addResult(
          "Supabase Connection",
          !pingError ? "pass" : "fail",
          !pingError ? "Connected to Supabase" : `Error: ${pingError.message}`
        );
      } catch (error: any) {
        addResult("Supabase Connection", "fail", `Exception: ${error.message}`);
      }

      // Test 5: get_or_create_user function
      try {
        const username =
          user.username ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress?.split("@")[0];
        const email = user.emailAddresses[0]?.emailAddress;
        const profilePicture = user.imageUrl;

        const { data: userData, error: userError } = await supabase.rpc(
          "get_or_create_user",
          {
            p_clerk_user_id: user.id,
            p_username: username,
            p_email: email,
            p_profile_picture_url: profilePicture,
          }
        );

        if (userError) {
          addResult(
            "get_or_create_user",
            "fail",
            `Error: ${userError.message}`,
            userError
          );
        } else if (!userData || userData.length === 0) {
          addResult("get_or_create_user", "fail", "No data returned");
        } else {
          addResult(
            "get_or_create_user",
            "pass",
            "User data retrieved",
            userData[0]
          );
        }
      } catch (error: any) {
        addResult("get_or_create_user", "fail", `Exception: ${error.message}`);
      }

      // Test 6: UserProfileContext state
      addResult(
        "UserProfileContext",
        internalUserId ? "pass" : "fail",
        internalUserId
          ? `Internal User ID: ${internalUserId}`
          : "Internal User ID is null",
        {
          internalUserId,
          selectedState,
          stats,
        }
      );

      // Test 7: Update state test (if user has selected a state)
      if (selectedState) {
        try {
          const { error: stateError } = await supabase.rpc(
            "update_user_state",
            {
              p_state_id: selectedState,
              p_clerk_user_id: user.id,
            }
          );

          addResult(
            "update_user_state",
            !stateError ? "pass" : "fail",
            !stateError
              ? `Successfully called with state: ${selectedState}`
              : `Error: ${stateError.message}`
          );
        } catch (error: any) {
          addResult("update_user_state", "fail", `Exception: ${error.message}`);
        }
      } else {
        addResult("update_user_state", "info", "Skipped - no state selected");
      }
    } catch (error: any) {
      addResult("Test Suite", "fail", `Fatal error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      runTests();
    }
  }, [isLoaded, isSignedIn, user?.id, internalUserId, selectedState]);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "pass":
        return "✅";
      case "fail":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "❓";
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
              🔍 Authentication Debug Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This page tests all authentication and database connections
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
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Refresh Page
            </button>
          </div>

          {testResults.length === 0 && !loading && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Click "Run Tests Again" to start diagnostics
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
                      className={`font-bold text-lg mb-1 ${getStatusColor(
                        result.status
                      )}`}
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
              📊 Current State
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Clerk Loaded:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {isLoaded ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Signed In:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {isSignedIn ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Clerk User ID:
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {user?.id || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Internal User ID:
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {internalUserId || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Selected State:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedState || "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Points:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {stats?.points ?? "null"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  EXP:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {stats?.exp ?? "null"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
