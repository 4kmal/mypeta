import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCodeError() {
  const router = useRouter();
  const errorMessage =
    (router.query.error as string) || "An authentication error occurred.";

  return (
    <>
      <Head>
        <title>Auth Error - Peta Malaysia</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#111114] px-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            Authentication Error
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {errorMessage}
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
