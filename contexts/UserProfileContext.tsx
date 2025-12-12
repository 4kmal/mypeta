import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export interface UserStats {
  points: number;
  exp: number;
}

interface UserProfileContextType {
  selectedState: string | null;
  setSelectedState: (state: string) => Promise<void>;
  showStateSelector: boolean;
  setShowStateSelector: (show: boolean) => void;
  stats: UserStats | null;
  addPoints: (amount: number) => Promise<void>;
  addExp: (amount: number) => Promise<boolean>;
  addPointsAndExp: (
    pointsAmount: number,
    expAmount: number
  ) => Promise<boolean>;
  deductPoints: (amount: number) => Promise<boolean>;
  getLevel: () => number;
  getExpForNextLevel: () => number;
  getExpProgress: () => number;
  internalUserId: string | null;
  refreshUserData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

// Calculate level from EXP (level 1 = 0-999 EXP, level 2 = 1000-1999, etc.)
const calculateLevel = (exp: number): number => {
  return Math.floor(exp / 1000) + 1;
};

// Get EXP needed for next level
const getExpForNextLevelValue = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  return currentLevel * 1000;
};

// Get progress percentage to next level
const getExpProgressValue = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  const expForCurrentLevel = (currentLevel - 1) * 1000;
  const expInCurrentLevel = currentExp - expForCurrentLevel;
  const expNeededForNextLevel = 1000;
  return (expInCurrentLevel / expNeededForNextLevel) * 100;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [selectedState, setSelectedStateInternal] = useState<string | null>(
    null
  );
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  // Load user data from Supabase
  const loadUserData = async () => {
    if (!user) {
      return;
    }

    try {
      const username =
        user.username ||
        user.firstName ||
        user.emailAddresses[0]?.emailAddress?.split("@")[0];
      const email = user.emailAddresses[0]?.emailAddress;
      const profilePicture = user.imageUrl;

      const { data, error } = await supabase.rpc("get_or_create_user", {
        p_clerk_user_id: user.id,
        p_username: username,
        p_email: email,
        p_profile_picture_url: profilePicture,
      });

      if (error) {
        console.error("[UserProfile] Error loading user data:", error);
        return;
      }

      if (!data || data.length === 0) {
        console.error("[UserProfile] No data returned from get_or_create_user");
        return;
      }

      const userData = data[0];

      setInternalUserId(userData.user_id);
      setSelectedStateInternal(userData.selected_state);
      setStats({
        points: userData.points,
        exp: userData.exp,
      });

      // Show state selector if no state selected (for new users)
      if (!userData.selected_state && userData.is_new_user) {
        setShowStateSelector(true);
      }
    } catch (error) {
      console.error("[UserProfile] Exception in loadUserData:", error);

      // Show user-friendly error
      if (typeof window !== "undefined") {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error("[UserProfile] Failed to load user profile:", errorMsg);
      }
    }
  };

  // Load user data when authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadUserData();
    } else if (isLoaded && !isSignedIn) {
      setSelectedStateInternal(null);
      setShowStateSelector(false);
      setStats(null);
      setInternalUserId(null);
    }
  }, [isLoaded, isSignedIn, user]);

  const setSelectedState = async (state: string) => {
    if (!user) {
      console.error("[UserProfile] Cannot set state - no user");
      return;
    }

    try {
      const { error } = await supabase.rpc("update_user_state", {
        p_state_id: state,
        p_clerk_user_id: user.id,
      });

      if (error) {
        console.error("[UserProfile] Error updating state:", error);
        return;
      }

      setSelectedStateInternal(state);
      setShowStateSelector(false);

      // Reload user data to ensure everything is in sync
      await loadUserData();
    } catch (error) {
      console.error("[UserProfile] Exception in setSelectedState:", error);
    }
  };

  const addPoints = async (amount: number) => {
    if (!user || !stats) return;

    try {
      // Optimistically update UI
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        return { ...prevStats, points: prevStats.points + amount };
      });

      // Sync to backend
      const { error } = await supabase.rpc("update_user_points_exp", {
        p_clerk_user_id: user.id,
        p_points_delta: amount,
        p_exp_delta: 0,
      });

      if (error) {
        console.error("[UserProfile] Error updating points:", error);
        // Revert on error
        setStats((prevStats) => {
          if (!prevStats) return prevStats;
          return { ...prevStats, points: prevStats.points - amount };
        });
      }
    } catch (error) {
      console.error("[UserProfile] Exception in addPoints:", error);
    }
  };

  const addExp = async (amount: number): Promise<boolean> => {
    if (!user || !stats) return false;

    const oldLevel = calculateLevel(stats.exp);
    const newExp = stats.exp + amount;
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > oldLevel;

    try {
      // Optimistically update UI
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        return { ...prevStats, exp: newExp };
      });

      // Sync to backend
      const { error } = await supabase.rpc("update_user_points_exp", {
        p_clerk_user_id: user.id,
        p_points_delta: 0,
        p_exp_delta: amount,
      });

      if (error) {
        console.error("[UserProfile] Error updating exp:", error);
        // Revert on error
        setStats((prevStats) => {
          if (!prevStats) return prevStats;
          return { ...prevStats, exp: prevStats.exp };
        });
        return false;
      }
    } catch (error) {
      console.error("[UserProfile] Exception in addExp:", error);
      return false;
    }

    return leveledUp;
  };

  const addPointsAndExp = async (
    pointsAmount: number,
    expAmount: number
  ): Promise<boolean> => {
    if (!user || !stats) return false;

    const oldLevel = calculateLevel(stats.exp);
    const newExp = stats.exp + expAmount;
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > oldLevel;

    try {
      // Optimistically update UI
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          points: prevStats.points + pointsAmount,
          exp: newExp,
        };
      });

      // Sync to backend
      const { error } = await supabase.rpc("update_user_points_exp", {
        p_clerk_user_id: user.id,
        p_points_delta: pointsAmount,
        p_exp_delta: expAmount,
      });

      if (error) {
        console.error("[UserProfile] Error updating points and exp:", error);
        // Revert on error
        setStats((prevStats) => {
          if (!prevStats) return prevStats;
          return {
            ...prevStats,
            points: prevStats.points - pointsAmount,
            exp: prevStats.exp,
          };
        });
        return false;
      }
    } catch (error) {
      console.error("[UserProfile] Exception in addPointsAndExp:", error);
      return false;
    }

    return leveledUp;
  };

  const deductPoints = async (amount: number): Promise<boolean> => {
    if (!user || !stats) return false;
    if (stats.points < amount) return false;

    try {
      // Optimistically update UI
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        return { ...prevStats, points: prevStats.points - amount };
      });

      // Sync to backend
      const { error } = await supabase.rpc("update_user_points_exp", {
        p_clerk_user_id: user.id,
        p_points_delta: -amount,
        p_exp_delta: 0,
      });

      if (error) {
        console.error("[UserProfile] Error deducting points:", error);
        // Revert on error
        setStats((prevStats) => {
          if (!prevStats) return prevStats;
          return { ...prevStats, points: prevStats.points + amount };
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("[UserProfile] Exception in deductPoints:", error);
      return false;
    }
  };

  const getLevel = (): number => {
    if (!stats) return 1;
    return calculateLevel(stats.exp);
  };

  const getExpForNextLevel = (): number => {
    if (!stats) return 1000;
    return getExpForNextLevelValue(stats.exp);
  };

  const getExpProgress = (): number => {
    if (!stats) return 0;
    return getExpProgressValue(stats.exp);
  };

  // Subscribe to user data changes (real-time)
  useEffect(() => {
    if (!internalUserId) return;

    const subscription = supabase
      .channel("user-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${internalUserId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setStats({
            points: newData.points,
            exp: newData.exp,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [internalUserId]);

  return (
    <UserProfileContext.Provider
      value={{
        selectedState,
        setSelectedState,
        showStateSelector,
        setShowStateSelector,
        stats,
        addPoints,
        addExp,
        addPointsAndExp,
        deductPoints,
        getLevel,
        getExpForNextLevel,
        getExpProgress,
        internalUserId,
        refreshUserData: loadUserData,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
