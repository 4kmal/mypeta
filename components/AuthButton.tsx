import { usePrivy, useLoginWithOAuth } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfile(true)}
            className="gap-2"
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{displayName}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>

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
    <Button
      variant="default"
      size="sm"
      onClick={handleLogin}
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      <span>Log in with X</span>
    </Button>
  );
};

export default AuthButton;

