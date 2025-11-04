import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Zap, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface UserStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  points: number;
  level: number;
  exp: number;
}

const UserStatsDialog = ({ open, onOpenChange, points, level, exp }: UserStatsDialogProps) => {
  // Translations
  const statsTitle = useTranslation({ en: 'Stats Info', ms: 'Maklumat Statistik' });
  const statsDescription = useTranslation({ 
    en: 'Learn how to earn points, level up, and gain experience', 
    ms: 'Ketahui cara untuk dapatkan mata, naik tahap, dan pengalaman' 
  });
  const pointsTitle = useTranslation({ en: 'Points', ms: 'Mata' });
  const pointsDesc1 = useTranslation({ en: 'Earn +10 points per vote', ms: 'Dapat +10 mata setiap undi' });
  const pointsDesc2 = useTranslation({ en: 'Creating a poll costs 200 points', ms: 'Mencipta undian memerlukan 200 mata' });
  const levelTitle = useTranslation({ en: 'Level', ms: 'Tahap' });
  const levelDesc1 = useTranslation({ 
    en: 'Your current level based on total EXP', 
    ms: 'Tahap semasa anda berdasarkan jumlah EXP' 
  });
  const levelDesc2 = useTranslation({ en: 'Level up every 1,000 EXP', ms: 'Naik tahap setiap 1,000 EXP' });
  const expTitle = useTranslation({ en: 'Experience Points', ms: 'Mata Pengalaman' });
  const expDesc1 = useTranslation({ en: 'Earn +10 EXP per vote', ms: 'Dapat +10 EXP setiap undi' });
  const expDesc2 = useTranslation({ en: 'Earn +200 EXP per poll created', ms: 'Dapat +200 EXP setiap undian dicipta' });
  const currentStatsText = useTranslation({ en: 'Current Stats', ms: 'Statistik Semasa' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{statsTitle}</DialogTitle>
          <DialogDescription>
            {statsDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Current Stats Display */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-3">{currentStatsText}</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Coins className="h-6 w-6 text-emerald-600 dark:text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{points}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{pointsTitle}</p>
              </div>
              <div className="text-center">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{level}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{levelTitle}</p>
              </div>
              <div className="text-center">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{exp}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">EXP</p>
              </div>
            </div>
          </div>

          {/* Points Info */}
          <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{pointsTitle}</h3>
            </div>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {pointsDesc1}</li>
              <li>• {pointsDesc2}</li>
            </ul>
          </div>

          {/* Level Info */}
          <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{levelTitle}</h3>
            </div>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {levelDesc1}</li>
              <li>• {levelDesc2}</li>
            </ul>
          </div>

          {/* EXP Info */}
          <div className="bg-white dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{expTitle}</h3>
            </div>
            <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>• {expDesc1}</li>
              <li>• {expDesc2}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserStatsDialog;

