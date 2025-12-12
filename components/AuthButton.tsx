import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut, User, MapPin, Coins, Zap, Star } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserStateSelector from "@/components/UserStateSelector";
import UserStatsDialog from "@/components/UserStatsDialog";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { states } from "@/data/states";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper function to get flag image path from state ID
const getFlagImagePath = (stateId: string): string => {
  const flagMapping: Record<string, string> = {
    negerisembilan: "negeri-sembilan",
    malacca: "melaka",
    kualalumpur: "kuala-lumpur",
    penang: "penang",
  };

  const flagName = flagMapping[stateId] || stateId;
  return `/images/flags/${flagName}.png`;
};

const AuthButton = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { signOut, openSignIn } = useClerk();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showStateSelectorDialog, setShowStateSelectorDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { selectedState, stats, getLevel } = useUserProfile();
  const [imageError, setImageError] = useState(false);
  const isMobile = useIsMobile();

  // Reset image error when state changes
  React.useEffect(() => {
    setImageError(false);
  }, [selectedState]);

  const handleLogin = async () => {
    try {
      await openSignIn({
        redirectUrl: window.location.href,
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleProfileClick = () => {
    // On desktop, navigate to profile page
    if (window.innerWidth >= 768) {
      router.push("/profile");
    } else {
      // On mobile, keep the dialog behavior
      setShowProfile(true);
    }
  };

  if (!isLoaded) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }

  if (isSignedIn && user) {
    const profilePicture = user.imageUrl || null;
    const displayName =
      user.username ||
      user.firstName ||
      user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      "User";
    const email = user.emailAddresses[0]?.emailAddress || null;
    const selectedStateData = states.find(
      (state) => state.id === selectedState
    );

    return (
      <>
        {/* Profile Button */}
        <button
          onClick={handleProfileClick}
          className="cursor-pointer flex items-center gap-2 px-3 py-3 md:p-2 rounded-lg shadow-md bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-500 dark:hover:bg-zinc-700 transition-colors duration-200"
          aria-label="View profile"
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={displayName}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <User className="h-6 w-6 text-white dark:text-zinc-400" />
          )}
          <span className="md:hidden font-semibold text-zinc-500 dark:text-zinc-300">
            Profile
          </span>
        </button>

        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Profile</DialogTitle>
              <DialogDescription>Welcome to Peta Malaysia</DialogDescription>
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

              {/* Polls Stats */}
              {stats && (
                <>
                  {isMobile ? (
                    // On mobile, use clickable stats that open a dialog
                    <button
                      onClick={() => setShowStatsDialog(true)}
                      className="w-full flex items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg p-3 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <span>{stats.points} pts</span>
                      </div>

                      <span className="text-zinc-400/30 font-extrabold dark:text-zinc-500/30">
                        |
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <span>LVL {getLevel()}</span>
                      </div>

                      <span className="text-zinc-400/30 font-extrabold dark:text-zinc-500/30">
                        |
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        <span>{stats.exp} EXP</span>
                      </div>
                    </button>
                  ) : (
                    // On desktop, use tooltips
                    <div className="w-full flex items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-help">
                              <Coins className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                              <span>{stats.points} pts</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Points</p>
                            <p className="text-sm">
                              • Earn +10 points per vote
                            </p>
                            <p className="text-sm">
                              • Creating a poll costs 200 points
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <span className="text-zinc-400/30 font-extrabold dark:text-zinc-500/30">
                        |
                      </span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-help">
                              <Zap className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                              <span>LVL {getLevel()}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">Level</p>
                            <p className="text-sm">
                              Your current level based on total EXP
                            </p>
                            <p className="text-sm">
                              • Level up every 1,000 EXP
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <span className="text-zinc-400/30 font-extrabold dark:text-zinc-500/30">
                        |
                      </span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-help">
                              <Star className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                              <span>{stats.exp} EXP</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">
                              Experience Points
                            </p>
                            <p className="text-sm">• Earn +10 EXP per vote</p>
                            <p className="text-sm">
                              • Earn +200 EXP per poll created
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </>
              )}

              {/* Selected State Display */}
              {selectedStateData ? (
                <div className="w-full flex flex-col items-center gap-3">
                  {!imageError ? (
                    <img
                      src={getFlagImagePath(selectedState!)}
                      alt={selectedStateData.name}
                      className="w-full max-h-32 object-contain opacity-90"
                      onError={() => {
                        setImageError(true);
                      }}
                    />
                  ) : (
                    <MapPin className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
                  )}
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedStateData.name}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowProfile(false);
                    setShowStateSelectorDialog(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Select your state</span>
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="gap-2 w-full py-3 flex cursor-pointer justify-center items-center border rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* State Selector Dialog (triggered from profile or auto-show after login) */}
        <UserStateSelector
          isButton={false}
          externalOpen={showStateSelectorDialog || undefined}
          onExternalOpenChange={setShowStateSelectorDialog}
        />

        {/* Stats Info Dialog for Mobile */}
        {stats && (
          <UserStatsDialog
            open={showStatsDialog}
            onOpenChange={setShowStatsDialog}
            points={stats.points}
            level={getLevel()}
            exp={stats.exp}
          />
        )}
      </>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="cursor-pointer flex items-center px-4 py-2 rounded-lg gap-2 bg-zinc-300 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 shadow-md hover:shadow-lg transition-all"
    >
      <User className="h-5 w-5" />
      <span className="font-medium">Sign in</span>
    </button>
  );
};

export default AuthButton;
