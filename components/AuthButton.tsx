import { usePrivy, useLoginWithOAuth } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// X (Twitter) Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const AuthButton = () => {
  const { ready, authenticated, logout, user } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = async () => {
    try {
      await initOAuth({ provider: 'twitter' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!ready) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2"
      >
        <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }

  if (authenticated && user) {
    // Get user's X/Twitter account info
    const twitterAccount = user.twitter;
    const profilePicture = twitterAccount?.profilePictureUrl || null;
    const displayName = twitterAccount?.username || twitterAccount?.name || user.email?.address?.split('@')[0] || "User";
    const email = user.email?.address || null;

    return (
      <>

        <button
          onClick={() => setShowProfile(true)}
          className="cursor-pointer relative p-2 rounded-lg shadow-md bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-900 dark:hover:bg-zinc-300 transition-colors duration-200"
          aria-label="View profile"
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={displayName}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <User className="h-6 w-6 text-white dark:text-zinc-800" />
          )}
        </button>


        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
              <DialogDescription>
                You are signed in with X (Twitter)
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              {profilePicture && (
                <img
                  src={profilePicture}
                  alt={displayName}
                  className="h-20 w-20 rounded-full"
                />
              )}
              <div className="text-center">
                <p className="font-semibold text-lg">{displayName}</p>
                {email && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {email}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => logout()}
                className="gap-2 w-full"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="cursor-pointer flex items-center px-4 py-2 rounded-lg gap-1.5 bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-800 dark:hover:bg-zinc-300 shadow-md hover:shadow-lg transition-all"
    >
      <span className="font-medium">Sign in with</span>
      <XLogo className="h-4 w-4" />
    </button>
  );
};

export default AuthButton;

