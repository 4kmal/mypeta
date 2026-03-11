import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  selected_state: string | null;
  points: number;
  exp: number;
  level: number;
  status: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseContextType {
  // Auth state
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  signInWithOAuth: (provider: "github" | "google") => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;

  // Profile actions
  refreshProfile: () => Promise<void>;
  setSelectedState: (state: string) => Promise<void>;
  addPoints: (amount: number) => Promise<void>;
  addExp: (amount: number) => Promise<boolean>;
  addPointsAndExp: (points: number, exp: number) => Promise<boolean>;
  deductPoints: (amount: number) => Promise<boolean>;
  getLevel: () => number;
  getExpForNextLevel: () => number;
  getExpProgress: () => number;

  // Login modal
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // State selector
  showStateSelector: boolean;
  setShowStateSelector: (show: boolean) => void;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

// ── Helpers ────────────────────────────────────────────────────────────────

const calculateLevel = (exp: number): number => Math.floor(exp / 1000) + 1;

const getExpForNextLevelValue = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  return currentLevel * 1000;
};

const getExpProgressValue = (currentExp: number): number => {
  const currentLevel = calculateLevel(currentExp);
  const expForCurrentLevel = (currentLevel - 1) * 1000;
  const expInCurrentLevel = currentExp - expForCurrentLevel;
  return (expInCurrentLevel / 1000) * 100;
};

// ── Provider ───────────────────────────────────────────────────────────────

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showStateSelector, setShowStateSelector] = useState(false);

  // ── Fetch profile from profiles table ──────────────────────────────────

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Profile might not exist yet (trigger delay) — retry once after 500ms
        if (error.code === "PGRST116") {
          await new Promise((r) => setTimeout(r, 500));
          const { data: retryData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
          if (retryData) {
            setProfile(retryData as Profile);
            if (!retryData.selected_state) setShowStateSelector(true);
            return;
          }
        }
        console.error("[SupabaseContext] Error fetching profile:", error);
        return;
      }

      setProfile(data as Profile);
      if (!data.selected_state) setShowStateSelector(true);
    },
    [supabase]
  );

  // ── Initialize session ─────────────────────────────────────────────────

  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    // Safety timeout — if INITIAL_SESSION never fires, unblock the UI
    const safetyTimer = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) console.warn("[SupabaseContext] Safety timeout: forcing isLoading=false");
        return false;
      });
    }, 5000);

    // Use onAuthStateChange as the single source of truth.
    // INITIAL_SESSION fires immediately with the current session,
    // so there's no need for a separate getSession() call.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      const newUserId = newSession?.user?.id ?? null;
      const previousUserId = lastUserId.current;

      // Always update session/user state
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === "INITIAL_SESSION") {
        clearTimeout(safetyTimer);
        try {
          if (newSession?.user) {
            lastUserId.current = newSession.user.id;
            await fetchProfile(newSession.user.id);
          }
        } catch (err) {
          console.error("[SupabaseContext] Error during INITIAL_SESSION:", err);
        } finally {
          setIsLoading(false);
        }
      } else if (event === "SIGNED_IN" && newUserId && newUserId !== previousUserId) {
        // New sign-in (not a token refresh disguised as SIGNED_IN)
        lastUserId.current = newUserId;
        try {
          await fetchProfile(newSession!.user.id);
        } catch (err) {
          console.error("[SupabaseContext] Error fetching profile on SIGNED_IN:", err);
        }
        setIsLoginModalOpen(false);
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        lastUserId.current = null;
        setProfile(null);
        setShowStateSelector(false);
      }
      // TOKEN_REFRESHED — session/user already updated above, no extra work needed
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // ── Real-time profile subscription ─────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id]);

  // ── Auth actions ───────────────────────────────────────────────────────

  const signInWithOAuth = useCallback(
    async (provider: "github" | "google") => {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`;
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
    },
    [supabase]
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[SupabaseContext] Sign out error:", error);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setShowStateSelector(false);
    // Force reload to clear all auth state
    window.location.href = "/";
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const updatePasswordFn = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  // ── Profile actions ────────────────────────────────────────────────────

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  const setSelectedState = useCallback(
    async (state: string) => {
      if (!user) return;

      const { error } = await supabase.rpc("update_user_state_v2", {
        p_state_id: state,
      });

      if (error) {
        console.error("[SupabaseContext] Error updating state:", error);
        return;
      }

      setProfile((prev) =>
        prev ? { ...prev, selected_state: state } : prev
      );
      setShowStateSelector(false);
    },
    [supabase, user]
  );

  const addPoints = useCallback(
    async (amount: number) => {
      if (!user || !profile) return;

      // Optimistic update
      setProfile((prev) =>
        prev ? { ...prev, points: prev.points + amount } : prev
      );

      const { data, error } = await supabase.rpc("award_gamification", {
        p_user_id: user.id,
        p_points: amount,
        p_exp: 0,
        p_reason: "points",
      });

      if (error) {
        console.error("[SupabaseContext] Error updating points:", error);
        // Revert
        setProfile((prev) =>
          prev ? { ...prev, points: prev.points - amount } : prev
        );
      } else if (data) {
        setProfile((prev) =>
          prev
            ? { ...prev, points: data.points, exp: data.exp, level: data.level }
            : prev
        );
      }
    },
    [supabase, user, profile]
  );

  const addExp = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!user || !profile) return false;

      const oldLevel = calculateLevel(profile.exp);

      // Optimistic update
      setProfile((prev) =>
        prev ? { ...prev, exp: prev.exp + amount } : prev
      );

      const { data, error } = await supabase.rpc("award_gamification", {
        p_user_id: user.id,
        p_points: 0,
        p_exp: amount,
        p_reason: "exp",
      });

      if (error) {
        console.error("[SupabaseContext] Error updating exp:", error);
        setProfile((prev) =>
          prev ? { ...prev, exp: prev.exp - amount } : prev
        );
        return false;
      }

      if (data) {
        setProfile((prev) =>
          prev
            ? { ...prev, points: data.points, exp: data.exp, level: data.level }
            : prev
        );
        return data.level_up ?? false;
      }

      return calculateLevel(profile.exp + amount) > oldLevel;
    },
    [supabase, user, profile]
  );

  const addPointsAndExp = useCallback(
    async (pointsAmount: number, expAmount: number): Promise<boolean> => {
      if (!user || !profile) return false;

      const oldLevel = calculateLevel(profile.exp);

      // Optimistic update
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              points: prev.points + pointsAmount,
              exp: prev.exp + expAmount,
            }
          : prev
      );

      const { data, error } = await supabase.rpc("award_gamification", {
        p_user_id: user.id,
        p_points: pointsAmount,
        p_exp: expAmount,
        p_reason: "points_and_exp",
      });

      if (error) {
        console.error(
          "[SupabaseContext] Error updating points and exp:",
          error
        );
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: prev.points - pointsAmount,
                exp: prev.exp - expAmount,
              }
            : prev
        );
        return false;
      }

      if (data) {
        setProfile((prev) =>
          prev
            ? { ...prev, points: data.points, exp: data.exp, level: data.level }
            : prev
        );
        return data.level_up ?? false;
      }

      return calculateLevel(profile.exp + expAmount) > oldLevel;
    },
    [supabase, user, profile]
  );

  const deductPoints = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!user || !profile) return false;
      if (profile.points < amount) return false;

      // Optimistic update
      setProfile((prev) =>
        prev ? { ...prev, points: prev.points - amount } : prev
      );

      const { data, error } = await supabase.rpc("award_gamification", {
        p_user_id: user.id,
        p_points: -amount,
        p_exp: 0,
        p_reason: "deduct",
      });

      if (error) {
        console.error("[SupabaseContext] Error deducting points:", error);
        setProfile((prev) =>
          prev ? { ...prev, points: prev.points + amount } : prev
        );
        return false;
      }

      if (data) {
        setProfile((prev) =>
          prev
            ? { ...prev, points: data.points, exp: data.exp, level: data.level }
            : prev
        );
      }

      return true;
    },
    [supabase, user, profile]
  );

  const getLevel = useCallback((): number => {
    if (!profile) return 1;
    return calculateLevel(profile.exp);
  }, [profile]);

  const getExpForNextLevel = useCallback((): number => {
    if (!profile) return 1000;
    return getExpForNextLevelValue(profile.exp);
  }, [profile]);

  const getExpProgress = useCallback((): number => {
    if (!profile) return 0;
    return getExpProgressValue(profile.exp);
  }, [profile]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo<SupabaseContextType>(
    () => ({
      supabase,
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: !!session?.user,

      signInWithOAuth,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updatePassword: updatePasswordFn,

      refreshProfile,
      setSelectedState,
      addPoints,
      addExp,
      addPointsAndExp,
      deductPoints,
      getLevel,
      getExpForNextLevel,
      getExpProgress,

      isLoginModalOpen,
      openLoginModal: () => setIsLoginModalOpen(true),
      closeLoginModal: () => setIsLoginModalOpen(false),

      showStateSelector,
      setShowStateSelector,
    }),
    [
      supabase,
      user,
      session,
      profile,
      isLoading,
      isLoginModalOpen,
      showStateSelector,
      signInWithOAuth,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updatePasswordFn,
      refreshProfile,
      setSelectedState,
      addPoints,
      addExp,
      addPointsAndExp,
      deductPoints,
      getLevel,
      getExpForNextLevel,
      getExpProgress,
    ]
  );

  return (
    <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
