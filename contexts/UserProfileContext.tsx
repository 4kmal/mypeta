import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
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
  const { user, authenticated } = usePrivy();
  const [selectedState, setSelectedStateInternal] = useState<string | null>(null);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  // Load user data from Supabase
  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_or_create_user', {
          p_privy_user_id: user.id,
          p_username: user.twitter?.username || user.email?.address?.split('@')[0],
          p_email: user.email?.address,
          p_profile_picture_url: user.twitter?.profilePictureUrl
        });

      if (error) {
        console.error('Error loading user data:', error);
        return;
      }

      const userData = data[0];
      setInternalUserId(userData.user_id);
      setSelectedStateInternal(userData.selected_state);
      setStats({
        points: userData.points,
        exp: userData.exp
      });

      // Show state selector if no state selected (for new users)
      if (!userData.selected_state && userData.is_new_user) {
        setShowStateSelector(true);
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  };

  // Load user data when authenticated
  useEffect(() => {
    if (authenticated && user) {
      loadUserData();
    } else {
      setSelectedStateInternal(null);
      setShowStateSelector(false);
      setStats(null);
      setInternalUserId(null);
    }
  }, [authenticated, user]);

  const setSelectedState = async (state: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('update_user_state', { 
          p_state_id: state,
          p_privy_user_id: user.id
        });

      if (error) {
        console.error('Error updating state:', error);
        return;
      }

      setSelectedStateInternal(state);
      setShowStateSelector(false);
    } catch (error) {
      console.error('Error in setSelectedState:', error);
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

