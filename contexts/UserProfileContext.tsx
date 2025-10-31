import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

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
  addPoints: (amount: number) => void;
  addExp: (amount: number) => boolean;
  addPointsAndExp: (pointsAmount: number, expAmount: number) => boolean;
  deductPoints: (amount: number) => boolean;
  getLevel: () => number;
  getExpForNextLevel: () => number;
  getExpProgress: () => number;
  internalUserId: string | null;
  refreshUserData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

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

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [selectedState, setSelectedStateInternal] = useState<string | null>(null);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  // Load user data from Supabase
  const loadUserData = async () => {
    if (!user) {
      console.log('[UserProfile] No user object, skipping load');
      return;
    }

    try {
      console.log('[UserProfile] Loading user data for Clerk ID:', user.id);
      
      // Get X/Twitter account from external accounts
      const twitterAccount = user.externalAccounts?.find(account => 
        account.verification?.strategy === 'oauth_twitter' || 
        (account as any).provider === 'oauth_x'
      );
      const username = twitterAccount?.username || user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0];
      const email = user.emailAddresses[0]?.emailAddress;
      const profilePicture = user.imageUrl;

      console.log('[UserProfile] Calling get_or_create_user with:', {
        clerk_id: user.id,
        username,
        email
      });

      const { data, error } = await supabase
        .rpc('get_or_create_user', {
          p_clerk_user_id: user.id,
          p_username: username,
          p_email: email,
          p_profile_picture_url: profilePicture
        });

      if (error) {
        console.error('[UserProfile] Error loading user data:', error);
        console.error('[UserProfile] Error details:', JSON.stringify(error, null, 2));
        return;
      }

      console.log('[UserProfile] RPC response:', data);

      if (!data || data.length === 0) {
        console.error('[UserProfile] No data returned from get_or_create_user');
        return;
      }

      const userData = data[0];
      console.log('[UserProfile] User data loaded:', userData);
      
      setInternalUserId(userData.user_id);
      setSelectedStateInternal(userData.selected_state);
      setStats({
        points: userData.points,
        exp: userData.exp
      });

      console.log('[UserProfile] State set - internalUserId:', userData.user_id, 'selectedState:', userData.selected_state);

      // Show state selector if no state selected (for new users)
      if (!userData.selected_state && userData.is_new_user) {
        console.log('[UserProfile] New user without state, showing selector');
        setShowStateSelector(true);
      }
    } catch (error) {
      console.error('[UserProfile] Exception in loadUserData:', error);
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
      console.error('[UserProfile] Cannot set state - no user');
      return;
    }

    try {
      console.log('[UserProfile] Setting state:', state, 'for Clerk ID:', user.id);
      
      const { error } = await supabase
        .rpc('update_user_state', { 
          p_state_id: state,
          p_clerk_user_id: user.id
        });

      if (error) {
        console.error('[UserProfile] Error updating state:', error);
        console.error('[UserProfile] Error details:', JSON.stringify(error, null, 2));
        return;
      }

      console.log('[UserProfile] State updated successfully');
      setSelectedStateInternal(state);
      setShowStateSelector(false);
      
      // Reload user data to ensure everything is in sync
      await loadUserData();
    } catch (error) {
      console.error('[UserProfile] Exception in setSelectedState:', error);
    }
  };

  const addPoints = (amount: number) => {
    if (!user || !stats) return;
    const userId = user.id;
    setStats(prevStats => {
      if (!prevStats) return prevStats;
      const newStats = { ...prevStats, points: prevStats.points + amount };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_stats_${userId}`, JSON.stringify(newStats));
      }
      return newStats;
    });
  };

  const addExp = (amount: number): boolean => {
    if (!user || !stats) return false;
    const userId = user.id;
    const oldLevel = calculateLevel(stats.exp);
    const newExp = stats.exp + amount;
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > oldLevel;
    
    setStats(prevStats => {
      if (!prevStats) return prevStats;
      const newStats = { ...prevStats, exp: newExp };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_stats_${userId}`, JSON.stringify(newStats));
      }
      return newStats;
    });
    
    return leveledUp;
  };

  const addPointsAndExp = (pointsAmount: number, expAmount: number): boolean => {
    if (!user || !stats) return false;
    const userId = user.id;
    const oldLevel = calculateLevel(stats.exp);
    const newExp = stats.exp + expAmount;
    const newLevel = calculateLevel(newExp);
    const leveledUp = newLevel > oldLevel;
    
    setStats(prevStats => {
      if (!prevStats) return prevStats;
      const newStats = {
        ...prevStats,
        points: prevStats.points + pointsAmount,
        exp: newExp,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_stats_${userId}`, JSON.stringify(newStats));
      }
      return newStats;
    });
    
    return leveledUp;
  };

  const deductPoints = (amount: number): boolean => {
    if (!user || !stats) return false;
    if (stats.points < amount) return false;
    
    const userId = user.id;
    setStats(prevStats => {
      if (!prevStats) return prevStats;
      const newStats = { ...prevStats, points: prevStats.points - amount };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_stats_${userId}`, JSON.stringify(newStats));
      }
      return newStats;
    });
    return true;
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
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${internalUserId}`
        },
        (payload) => {
          const newData = payload.new as any;
          setStats({
            points: newData.points,
            exp: newData.exp
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
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

