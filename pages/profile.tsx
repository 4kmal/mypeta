import Head from 'next/head';
import { useUser } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import UserStatsDialog from '@/components/UserStatsDialog';
import LanguageToggleButton from '@/components/LanguageToggleButton';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { User, MapPin, Trophy, Star, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { SignInButton } from '@clerk/nextjs';
import { useState } from 'react';

const ProfilePage = () => {
  const { user, isSignedIn } = useUser();
  const { selectedState, stats, getLevel, getExpProgress } = useUserProfile();
  const router = useRouter();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { language } = useLanguage();

  // Translations
  const profileTitle = useTranslation({ en: 'Profile', ms: 'Profil' });
  const myProfileText = useTranslation({ en: 'My Profile', ms: 'Profil Saya' });
  const signInText = useTranslation({ en: 'Sign In', ms: 'Log Masuk' });
  const signInToViewText = useTranslation({
    en: 'Sign in to view your profile and track your progress',
    ms: 'Log masuk untuk melihat profil dan jejak kemajuan anda'
  });
  const levelText = useTranslation({ en: 'Level', ms: 'Tahap' });
  const pointsText = useTranslation({ en: 'Points', ms: 'mata' });
  const expText = useTranslation({ en: 'Experience', ms: 'Pengalaman' });
  const homeStateText = useTranslation({ en: 'Home State', ms: 'Negeri Asal' });
  const notSetText = useTranslation({ en: 'Not set', ms: 'Tidak ditetapkan' });
  const editProfileText = useTranslation({ en: 'Edit Profile', ms: 'Edit Profil' });
  const statsText = useTranslation({ en: 'Statistics', ms: 'Statistik' });
  const achievementsText = useTranslation({ en: 'Achievements', ms: 'Pencapaian' });
  const comingSoonText = useTranslation({ en: 'Coming Soon', ms: 'Akan Datang' });
  const settingsText = useTranslation({ en: 'Settings', ms: 'Tetapan' });
  const languageText = useTranslation({ en: 'Language', ms: 'Bahasa' });
  const themeText = useTranslation({ en: 'Theme', ms: 'Tema' });

  // Get state display name - using language context directly to avoid hook order issues
  const getStateDisplayName = (stateId: string | null) => {
    if (!stateId) return notSetText;
    const stateNames: Record<string, { en: string; ms: string }> = {
      'johor': { en: 'Johor', ms: 'Johor' },
      'kedah': { en: 'Kedah', ms: 'Kedah' },
      'kelantan': { en: 'Kelantan', ms: 'Kelantan' },
      'malacca': { en: 'Malacca', ms: 'Melaka' },
      'negerisembilan': { en: 'Negeri Sembilan', ms: 'Negeri Sembilan' },
      'pahang': { en: 'Pahang', ms: 'Pahang' },
      'penang': { en: 'Penang', ms: 'Pulau Pinang' },
      'perak': { en: 'Perak', ms: 'Perak' },
      'perlis': { en: 'Perlis', ms: 'Perlis' },
      'sabah': { en: 'Sabah', ms: 'Sabah' },
      'sarawak': { en: 'Sarawak', ms: 'Sarawak' },
      'selangor': { en: 'Selangor', ms: 'Selangor' },
      'terengganu': { en: 'Terengganu', ms: 'Terengganu' },
      'kualalumpur': { en: 'Kuala Lumpur', ms: 'Kuala Lumpur' },
      'labuan': { en: 'Labuan', ms: 'Labuan' },
      'putrajaya': { en: 'Putrajaya', ms: 'Putrajaya' },
    };
    const stateName = stateNames[stateId] || { en: stateId, ms: stateId };
    return stateName[language];
  };

  // Convert state ID to flag filename (with hyphens for flag files)
  const getStateFlagPath = (stateId: string | null) => {
    if (!stateId) return '';
    const flagMap: Record<string, string> = {
      'negerisembilan': 'negeri-sembilan',
      'kualalumpur': 'kuala-lumpur',
    };
    return flagMap[stateId] || stateId;
  };

  const stateDisplayName = getStateDisplayName(selectedState);
  const stateFlagId = getStateFlagPath(selectedState);

  if (!isSignedIn) {
    return (
      <>
        <Head>
          <title>{profileTitle} - My Peta</title>
          <meta name="description" content="View your profile and track your progress" />
        </Head>

        <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-20">
          <PageHeader showPollsButton showDataButton />

          <div className="max-w-6xl mx-auto px-4 pt-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg max-w-md w-full">
                <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
                  {signInText}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {signInToViewText}
                </p>
                <SignInButton mode="modal">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <LogIn className="h-4 w-4 mr-2" />
                    {signInText}
                  </Button>
                </SignInButton>
              </div>
            </div>
          </div>

          <MobileBottomNav />
        </div>
      </>
    );
  }

  const level = getLevel();
  const expProgress = getExpProgress();

  return (
    <>
      <Head>
        <title>{profileTitle} - My Peta</title>
        <meta name="description" content="View your profile and track your progress" />
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-20">
        <PageHeader showPollsButton showDataButton />

        <div className="max-w-6xl mx-auto px-4 pt-4">
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-6">
            {myProfileText}
          </h1>

          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={user?.imageUrl || '/placeholder-avatar.png'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />

              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {user?.username || user?.firstName || 'User'}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {levelText} {level}
                </p>
              </div>
            </div>

            {/* Experience Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                <span>{expText}</span>
                <span>{Math.round(expProgress)}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <button
              onClick={() => setShowStatsDialog(true)}
              className="w-full grid grid-cols-2 gap-4 mb-6 cursor-pointer"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{pointsText}</span>
                </div>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {stats?.points || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{expText}</span>
                </div>
                <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                  {stats?.exp || 0}
                </p>
              </div>
            </button>

            {/* Home State */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 w-full">
                <MapPin className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{homeStateText}</p>
              </div>
              {selectedState && (
                <img
                  src={`/images/flags/${stateFlagId}.png`}
                  alt={stateDisplayName}
                  className="w-full max-h-32 object-contain opacity-90"
                />
              )}
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {stateDisplayName}
              </p>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
              {achievementsText}
            </h3>
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">{comingSoonText}</p>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
              {statsText}
            </h3>
            <div className="text-center py-12">
              <p className="text-zinc-500 dark:text-zinc-400">{comingSoonText}</p>
            </div>
          </div>

          {/* Settings Section - Mobile Only */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 md:hidden">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
              {settingsText}
            </h3>
            <div className="space-y-4">
              {/* Language Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{languageText}</span>
                <LanguageToggleButton />
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{themeText}</span>
                <ThemeToggleButton />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Info Dialog */}
        {stats && (
          <UserStatsDialog
            open={showStatsDialog}
            onOpenChange={setShowStatsDialog}
            points={stats.points}
            level={level}
            exp={stats.exp}
          />
        )}

        <MobileBottomNav />
      </div>
    </>
  );
};

export default ProfilePage;


