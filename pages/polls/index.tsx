import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Poll } from '@/data/polls';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, CheckCircle, AlertCircle, Plus, Coins, Zap, Star, Clock, Calendar, Info, HelpCircle, Share2, X, Download, ArrowUpFromLine, Copy, Share, Send } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { useTranslation, useTranslations } from '@/hooks/useTranslation';
import { usePollTranslation } from '@/hooks/usePollTranslation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface VoteData {
  [pollId: string]: {
    selectedOption: number;
    state: string;
    timestamp: number;
  };
}

interface PollResults {
  [pollId: string]: {
    votes: number[];
    totalVotes: number;
    stateBreakdown: {
      [state: string]: number[];
    };
  };
}

interface IndividualVote {
  userId: string;
  pollId: string;
  optionIndex: number;
  state: string;
  timestamp: number;
}

// 60 most used emojis globally
const POLL_EMOJIS = [
  // Numbers (for poll options)
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
  // Top emotions & faces (most used globally)
  '😂', '❤️', '🥰', '😍', '😊', '😘', '😭', '😔', '😩', '😡',
  '🤔', '😅', '🙄', '😳', '🥺', '😎', '🤗', '🤩', '😱', '🤯',
  // Hand gestures & reactions
  '👍', '👎', '👏', '🙏', '💪', '✌️', '🤝', '👌', '🙌', '🤞',
  // Hearts & symbols
  '💔', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤',
  // Popular symbols & objects
  '🔥', '✨', '⭐', '💯', '✅', '❌', '⚠️', '💥', '🎉', '🎊'
];

const PollsPage = () => {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const {
    selectedState,
    stats,
    addPoints,
    addExp,
    addPointsAndExp,
    deductPoints,
    getLevel,
    getExpProgress,
    internalUserId,
    refreshUserData
  } = useUserProfile();

  // Translations
  const t = useTranslations({
    title: { en: 'Malaysian Polls', ms: 'Tinjauan Pendapat Malaysia' },
    subtitle: { en: 'Vote on viral and controversial topics about Malaysia. Your voice matters!', ms: 'Undi topik viral dan kontroversi tentang Malaysia. Suara anda penting!' },
    selectState: { en: '⚠️ Select your state to start voting', ms: '⚠️ Pilih negeri anda untuk mula mengundi' },
    allTopics: { en: 'All Topics', ms: 'Semua Topik' },
    food: { en: 'Food', ms: 'Makanan' },
    politics: { en: 'Politics', ms: 'Politik' },
    culture: { en: 'Culture', ms: 'Budaya' },
    economy: { en: 'Economy', ms: 'Ekonomi' },
    social: { en: 'Social', ms: 'Sosial' },
    createPoll: { en: 'Create Poll', ms: 'Cipta Tinjauan' },
    needMorePoints: { en: 'Need', ms: 'Perlukan' },
    morePoints: { en: 'more points', ms: 'mata lagi' },
    share: { en: 'Share', ms: 'Kongsi' },
    votes: { en: 'votes', ms: 'undi' },
    live: { en: 'Live', ms: 'Aktif' },
    ended: { en: 'Ended', ms: 'Tamat' },
    ends: { en: 'Ends', ms: 'Tamat' },
  });

  const [userVotes, setUserVotes] = useState<VoteData>({});
  const [pollResults, setPollResults] = useState<PollResults>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allPolls, setAllPolls] = useState<Poll[]>([]);

  // Translate polls based on current language
  const translatedPolls = usePollTranslation(allPolls);

  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    description: '',
    category: 'food' as Poll['category'],
    options: [{ label: '', emoji: '1️⃣' }, { label: '', emoji: '2️⃣' }],
    endDate: '',
  });
  const [hasEndDate, setHasEndDate] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [selectedPollForDetails, setSelectedPollForDetails] = useState<Poll | null>(null);
  const [isLoadingPolls, setIsLoadingPolls] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState<string | null>(null);
  const [generatingImageFor, setGeneratingImageFor] = useState<'download' | 'native' | null>(null);
  const pollImageRef = useRef<HTMLDivElement>(null);

  // Load user votes from Supabase
  const loadUserVotes = async () => {
    if (!isSignedIn || !internalUserId) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('poll_id, option_index, user_state, created_at')
        .eq('user_id', internalUserId);

      if (error) {
        console.error('Error loading votes:', error);
        return;
      }

      const votes: VoteData = {};
      data?.forEach(vote => {
        votes[vote.poll_id] = {
          selectedOption: vote.option_index,
          state: vote.user_state,
          timestamp: new Date(vote.created_at).getTime()
        };
      });

      setUserVotes(votes);
    } catch (error) {
      console.error('Error in loadUserVotes:', error);
    }
  };

  useEffect(() => {
    if (isSignedIn && internalUserId) {
      loadUserVotes();
    } else {
      setUserVotes({}); // Clear votes when logged out
    }
  }, [isSignedIn, internalUserId]);

  // Load poll results from Supabase using optimized function
  const loadPollResults = async (showLoading: boolean = true) => {
    if (allPolls.length === 0) {
      setIsLoadingResults(false);
      return;
    }

    try {
      if (showLoading) {
        setIsLoadingResults(true);
      }

      // Call the optimized PostgreSQL function that returns all results in one query
      const { data, error } = await supabase.rpc('get_all_poll_results');

      if (error) {
        console.error('Error loading poll results:', error);
        // Set empty results for all polls so they show 0 votes instead of loading forever
        const emptyResults: PollResults = {};
        allPolls.forEach(poll => {
          emptyResults[poll.id] = {
            votes: new Array(poll.options.length).fill(0),
            totalVotes: 0,
            stateBreakdown: {}
          };
        });
        setPollResults(emptyResults);
        setIsLoadingResults(false);
        return;
      }

      // Transform the results into our format
      const results: PollResults = {};

      // Initialize results for all polls
      allPolls.forEach(poll => {
        results[poll.id] = {
          votes: new Array(poll.options.length).fill(0),
          totalVotes: 0,
          stateBreakdown: {}
        };
      });

      // Populate with actual data
      data?.forEach((row: any) => {
        // poll_id comes back as UUID string from PostgreSQL
        const pollId = row.poll_id;
        const optionIndex = row.option_index;
        const totalVotes = parseInt(row.total_votes) || 0;
        const stateBreakdown = row.state_breakdown || {};

        if (!results[pollId]) {
          // Poll might have been deleted or not in our list
          console.warn('Poll not found in current list:', pollId);
          return;
        }

        // Update votes for this option
        results[pollId].votes[optionIndex] = totalVotes;
        results[pollId].totalVotes += totalVotes;

        // Parse state breakdown
        Object.entries(stateBreakdown).forEach(([state, votes]) => {
          if (!results[pollId].stateBreakdown[state]) {
            results[pollId].stateBreakdown[state] = new Array(
              results[pollId].votes.length
            ).fill(0);
          }
          results[pollId].stateBreakdown[state][optionIndex] = parseInt(votes as string) || 0;
        });
      });

      setPollResults(results);
      setIsLoadingResults(false);
    } catch (error) {
      console.error('Error loading poll results:', error);
      // Set empty results on error
      const emptyResults: PollResults = {};
      allPolls.forEach(poll => {
        emptyResults[poll.id] = {
          votes: new Array(poll.options.length).fill(0),
          totalVotes: 0,
          stateBreakdown: {}
        };
      });
      setPollResults(emptyResults);
      setIsLoadingResults(false);
    }
  };

  useEffect(() => {
    if (allPolls.length > 0) {
      loadPollResults();
    }
  }, [allPolls]);

  // Load polls from Supabase
  const loadPolls = async () => {
    try {
      setIsLoadingPolls(true);

      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pollsError) {
        console.error('Error loading polls:', pollsError);
        setIsLoadingPolls(false);
        return;
      }

      // Load options for each poll
      const pollsWithOptions = await Promise.all(
        pollsData.map(async (poll) => {
          const { data: options } = await supabase
            .from('poll_options')
            .select('*')
            .eq('poll_id', poll.id)
            .order('option_index');

          return {
            id: poll.id,
            question: poll.question,
            description: poll.description || '',
            category: poll.category as Poll['category'],
            createdAt: new Date(poll.created_at),
            endDate: poll.end_date ? new Date(poll.end_date) : undefined,
            options: options?.map(o => ({ label: o.label, emoji: o.emoji })) || [],
          };
        })
      );

      setAllPolls(pollsWithOptions);
      setIsLoadingPolls(false);
    } catch (error) {
      console.error('Error in loadPolls:', error);
      setIsLoadingPolls(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!isSignedIn) {
      toast.error('Please sign in to vote', {
        icon: <Lock className="h-4 w-4" />,
        description: 'You need to be logged in to participate in polls',
      });
      return;
    }

    if (!selectedState) {
      toast.warning('Please select your state before voting', {
        icon: <AlertCircle className="h-4 w-4" />,
        description: 'Click on your profile to select your state',
        duration: 4000,
      });
      return;
    }

    if (!user || !internalUserId) {
      toast.error('User data not loaded');
      return;
    }

    // Check if poll is still live
    const poll = allPolls.find(p => p.id === pollId);
    if (poll && !isPollLive(poll)) {
      toast.error('This poll has ended', {
        icon: <AlertCircle className="h-4 w-4" />,
        description: 'Voting is no longer available for this poll',
      });
      return;
    }

    if (userVotes[pollId]) {
      toast.info('You have already voted on this poll', {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    try {
      // Get poll option ID
      const { data: optionData } = await supabase
        .from('poll_options')
        .select('id')
        .eq('poll_id', pollId)
        .eq('option_index', optionIndex)
        .single();

      if (!optionData) {
        toast.error('Invalid option');
        return;
      }

      // OPTIMISTIC UPDATE: Update UI immediately before network calls
      // 1. Update user votes
      setUserVotes(prev => ({
        ...prev,
        [pollId]: {
          selectedOption: optionIndex,
          state: selectedState,
          timestamp: Date.now()
        }
      }));

      // 2. Update poll results optimistically
      setPollResults(prev => {
        const currentResults = prev[pollId] || {
          votes: new Array(poll?.options.length || 2).fill(0),
          totalVotes: 0,
          stateBreakdown: {}
        };

        const newVotes = [...currentResults.votes];
        newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;

        const newStateBreakdown = { ...currentResults.stateBreakdown };
        if (!newStateBreakdown[selectedState]) {
          newStateBreakdown[selectedState] = new Array(poll?.options.length || 2).fill(0);
        }
        newStateBreakdown[selectedState][optionIndex] = (newStateBreakdown[selectedState][optionIndex] || 0) + 1;

        return {
          ...prev,
          [pollId]: {
            votes: newVotes,
            totalVotes: currentResults.totalVotes + 1,
            stateBreakdown: newStateBreakdown
          }
        };
      });

      // 3. Show confetti immediately
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
      });

      // Call vote function (handles everything atomically)
      const { data, error } = await supabase
        .rpc('cast_vote', {
          p_poll_id: pollId,
          p_option_id: optionData.id,
          p_option_index: optionIndex,
          p_user_state: selectedState,
          p_clerk_user_id: user.id
        });

      if (error) {
        // Revert optimistic updates on error
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[pollId];
          return newVotes;
        });

        if (error.message.includes('already voted')) {
          toast.info('You have already voted on this poll');
        } else {
          toast.error('Failed to cast vote: ' + error.message);
        }

        // Reload to get accurate data
        loadPollResults();
        return;
      }

      // RPC functions that return TABLE return an array
      const result = (Array.isArray(data) && data.length > 0 ? data[0] : data) as any;

      // 4. Show success message immediately
      if (result.leveled_up) {
        toast.success('Level Up! 🎉', {
          icon: <Star className="h-4 w-4" />,
          description: `Thanks for voting! You reached level ${result.new_level}!`,
          duration: 5000,
        });
      } else {
        toast.success('Thanks for voting! 🎉', {
          icon: <CheckCircle className="h-4 w-4" />,
          description: `You earned +${result.points_earned} points and +${result.exp_earned} EXP!`,
          duration: 4000,
        });
      }

      // 5. Sync with server in background (don't await, no loading state)
      Promise.all([
        loadPollResults(false), // false = don't show loading skeleton
        refreshUserData(),
        loadUserVotes()
      ]).catch(err => console.error('Background sync error:', err));

    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error('Failed to cast vote: ' + error.message);
      // Reload to get accurate data
      loadPollResults();
    }
  };

  const filteredPolls = selectedCategory === 'all'
    ? translatedPolls
    : translatedPolls.filter(poll => poll.category === selectedCategory);

  const categories = [
    { id: 'all', label: t.allTopics, emoji: '🗳️' },
    { id: 'food', label: t.food, emoji: '🍜' },
    { id: 'politics', label: t.politics, emoji: '🏛️' },
    { id: 'culture', label: t.culture, emoji: '🎭' },
    { id: 'economy', label: t.economy, emoji: '💰' },
    { id: 'social', label: t.social, emoji: '👥' },
  ];

  const getVotePercentage = (pollId: string, optionIndex: number): number => {
    const results = pollResults[pollId];
    if (!results || results.totalVotes === 0) return 0;
    return (results.votes[optionIndex] / results.totalVotes) * 100;
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    }
  };

  const isPollLive = (poll: Poll): boolean => {
    if (!poll.endDate) return true; // No end date means poll is always live
    const endDate = poll.endDate instanceof Date ? poll.endDate : new Date(poll.endDate);
    return new Date() < endDate;
  };

  const formatEndDate = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getStateChartData = (poll: Poll, optionIndex: number) => {
    const results = pollResults[poll.id];
    if (!results || !results.stateBreakdown) return [];

    const chartData: { state: string; votes: number; fill: string }[] = [];
    const colors = [
      'var(--color-chart-1)',
      'var(--color-chart-2)',
      'var(--color-chart-3)',
      'var(--color-chart-4)',
      'var(--color-chart-5)',
      'var(--color-chart-6)',
      'var(--color-chart-7)',
      'var(--color-chart-8)',
      'var(--color-chart-9)',
      'var(--color-chart-10)',
      'var(--color-chart-11)',
      'var(--color-chart-12)',
      'var(--color-chart-13)',
      'var(--color-chart-14)',
      'var(--color-chart-15)',
      'var(--color-chart-16)',
    ];

    let colorIndex = 0;
    Object.entries(results.stateBreakdown).forEach(([state, votes]) => {
      const voteCount = votes[optionIndex] || 0;
      if (voteCount > 0) {
        chartData.push({
          state,
          votes: voteCount,
          fill: colors[colorIndex % colors.length],
        });
        colorIndex++;
      }
    });

    return chartData.sort((a, b) => b.votes - a.votes);
  };

  const capitalizeStateName = (stateName: string): string => {
    return stateName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStateChartConfig = (poll: Poll, optionIndex: number): ChartConfig => {
    const results = pollResults[poll.id];
    if (!results || !results.stateBreakdown) return {};

    const config: ChartConfig = {
      votes: {
        label: 'Votes',
      },
    };

    const colors = [
      'var(--color-chart-1)',
      'var(--color-chart-2)',
      'var(--color-chart-3)',
      'var(--color-chart-4)',
      'var(--color-chart-5)',
      'var(--color-chart-6)',
      'var(--color-chart-7)',
      'var(--color-chart-8)',
      'var(--color-chart-9)',
      'var(--color-chart-10)',
      'var(--color-chart-11)',
      'var(--color-chart-12)',
      'var(--color-chart-13)',
      'var(--color-chart-14)',
      'var(--color-chart-15)',
      'var(--color-chart-16)',
    ];

    let colorIndex = 0;
    Object.entries(results.stateBreakdown).forEach(([state, votes]) => {
      const voteCount = votes[optionIndex] || 0;
      if (voteCount > 0) {
        config[state] = {
          label: capitalizeStateName(state),
          color: colors[colorIndex % colors.length],
        };
        colorIndex++;
      }
    });

    return config;
  };

  const handleCreatePoll = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to create a poll', {
        icon: <Lock className="h-4 w-4" />,
      });
      return;
    }

    if (!user || !internalUserId) {
      toast.error('User data not loaded');
      return;
    }

    if (!stats || stats.points < 200) {
      toast.error('Insufficient points', {
        icon: <AlertCircle className="h-4 w-4" />,
        description: 'You need 200 points to create a poll',
      });
      return;
    }

    // Validate poll data
    if (!newPoll.question.trim()) {
      toast.error('Please enter a question', {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    if (!newPoll.options[0].label.trim() || !newPoll.options[1].label.trim()) {
      toast.error('Please enter both options', {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    if (!newPoll.options[0].emoji.trim() || !newPoll.options[1].emoji.trim()) {
      toast.error('Please enter emojis for both options', {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    try {
      setIsCreatingPoll(true);

      const options = newPoll.options.map(o => ({
        label: o.label.trim(),
        emoji: o.emoji.trim()
      }));

      // Call create poll function
      const { data, error } = await supabase
        .rpc('create_poll', {
          p_question: newPoll.question.trim(),
          p_description: newPoll.description.trim() || 'User-created poll',
          p_category: newPoll.category,
          p_options: options,
          p_clerk_user_id: user.id,
          p_end_date: newPoll.endDate ? new Date(newPoll.endDate).toISOString() : null
        });

      if (error) {
        if (error.message.includes('Insufficient points')) {
          toast.error('Insufficient points', {
            description: 'You need 200 points to create a poll'
          });
        } else {
          toast.error('Failed to create poll: ' + error.message);
        }
        setIsCreatingPoll(false);
        return;
      }

      // RPC function returns JSON directly
      const result = data as any;

      // Trigger confetti effect
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
      });

      // Reload polls and user data
      await Promise.all([
        loadPolls(),
        refreshUserData()
      ]);

      // Reset form
      setNewPoll({
        question: '',
        description: '',
        category: 'food',
        options: [{ label: '', emoji: '1️⃣' }, { label: '', emoji: '2️⃣' }],
        endDate: '',
      });
      setHasEndDate(false);
      setShowEmojiPicker(null);
      setShowCreatePoll(false);
      setIsCreatingPoll(false);

      // Show success message
      if (result.leveled_up) {
        toast.success('Poll created! Level Up! 🎉', {
          icon: <Star className="h-4 w-4" />,
          description: `You reached level ${result.new_level}!`,
          duration: 5000,
        });
      } else {
        toast.success('Poll created successfully! 🎉', {
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'You earned +200 EXP!',
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll: ' + error.message);
      setIsCreatingPoll(false);
    }
  };

  // Share functionality
  const getShareUrl = (pollId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/polls?poll=${pollId}`;
    }
    return '';
  };

  const getShareText = (poll: Poll) => {
    return `Vote on: ${poll.question}\n\nWhat do you think? Cast your vote on My Peta! 🇲🇾`;
  };

  const generatePollImage = async (poll: Poll, source: 'download' | 'native'): Promise<Blob | null> => {
    if (!pollImageRef.current) {
      console.error('Poll image ref not available');
      toast.error('Image preview not ready', {
        description: 'Please wait a moment and try again'
      });
      return null;
    }

    try {
      setGeneratingImageFor(source);

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Starting image generation with html2canvas...');

      // Use html2canvas with settings optimized for inline styles
      const canvas = await html2canvas(pollImageRef.current, {
        backgroundColor: null, // Transparent background to preserve gradient
        scale: 2, // 2x for high quality
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging to debug
        windowWidth: pollImageRef.current.scrollWidth,
        windowHeight: pollImageRef.current.scrollHeight,
        onclone: (clonedDoc, element) => {
          // Remove ALL stylesheets to prevent oklch color parsing
          const styleSheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styleSheets.forEach(sheet => sheet.remove());

          // Ensure the cloned element maintains its dimensions and inline styles
          element.style.display = 'block';
          element.style.position = 'relative';

          // Fix text centering in cloned element - apply margin fix only in the clone
          const allSpans = element.querySelectorAll('span[style*="table-cell"]');
          allSpans.forEach((span: any) => {
            // Add the margin fix that works for html2canvas rendering
            span.style.marginTop = '-8px';
            span.style.marginBottom = '8px';
          });
        }
      });

      console.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          setGeneratingImageFor(null);
          if (!blob) {
            console.error('Failed to create blob');
            toast.error('Failed to create image file');
            resolve(null);
            return;
          }
          console.log('Image generated successfully');
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneratingImageFor(null);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  };

  const handleShare = async (poll: Poll, platform: 'twitter' | 'whatsapp' | 'native' | 'download') => {
    const url = getShareUrl(poll.id);
    const text = getShareText(poll);
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    // Handle download separately
    if (platform === 'download') {
      try {
        const imageBlob = await generatePollImage(poll, 'download');
        if (!imageBlob) {
          toast.error('Failed to generate image');
          return;
        }

        const downloadUrl = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `mypeta-poll-${poll.id.substring(0, 8)}.png`;
        document.body.appendChild(a);
        a.click();

        // Small delay before cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }, 100);

        toast.success('Image downloaded!', {
          icon: <Download className="h-4 w-4" />,
          description: 'Now share it on your favorite platform',
        });
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download image');
      }
      return;
    }

    // Handle native share - just share text and URL (no image)
    if (platform === 'native') {
      if (!navigator.share) {
        toast.error('Share not supported on this browser');
        return;
      }

      try {
        await navigator.share({
          title: `Malaysian Poll: ${poll.question}`,
          text: text,
          url: url,
        });
        setShowShareDialog(null);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('User cancelled share');
          return;
        }
        console.error('Share error:', error);
        toast.error('Failed to share', {
          description: 'Try sharing directly from your browser instead'
        });
      }
      return;
    }

    // Platform-specific sharing
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
    }

    setShowShareDialog(null);
  };

  const copyLink = (poll: Poll) => {
    const url = getShareUrl(poll.id);
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!', {
        icon: <CheckCircle className="h-4 w-4" />,
      });
    });
  };


  return (
    <>
      <Head>
        <title>Malaysian Polls - My Peta</title>
        <meta name="description" content="Vote on viral and controversial topics about Malaysia" />

        {/* Dynamic OG tags based on poll parameter */}
        {(() => {
          const pollId = router.query.poll as string;
          const currentPoll = allPolls.find(p => p.id === pollId);

          if (currentPoll) {
            const pollUrl = typeof window !== 'undefined' ? window.location.href : `https://www.mypeta.ai/polls?poll=${pollId}`;
            const ogImage = typeof window !== 'undefined'
              ? `${window.location.origin}/images/og-image.png`
              : 'https://www.mypeta.ai/images/og-image.png';

            return (
              <>
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={pollUrl} />
                <meta property="og:title" content={`${currentPoll.question} - Malaysian Poll`} />
                <meta property="og:description" content={currentPoll.description || 'Vote on this Malaysian poll. Your voice matters! 🇲🇾'} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:site_name" content="My Peta" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={pollUrl} />
                <meta name="twitter:title" content={`${currentPoll.question} - Malaysian Poll`} />
                <meta name="twitter:description" content={currentPoll.description || 'Vote on this Malaysian poll. Your voice matters! 🇲🇾'} />
                <meta name="twitter:image" content={ogImage} />
              </>
            );
          }

          return null;
        })()}
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-20 md:pb-12">
        <PageHeader showDataButton={true} showNewsButton={true} />

        <div className="max-w-6xl mx-auto px-4 pt-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
              <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                {t.title}
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              {t.subtitle}
              {!selectedState && isSignedIn && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500 font-medium">
                  {t.selectState}
                </span>
              )}
            </p>
          </div>

          {/* User Stats Display */}
          {isSignedIn && stats && (
            <div className="mb-8 flex items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 hover:cursor-help">
                      <Coins className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      <span>{stats.points} pts</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Points</p>
                    <p className="text-sm">• Earn +10 points per vote</p>
                    <p className="text-sm">• Creating a poll costs 200 points</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-zinc-400/30 font-extrabold dark:text-zinc-500/30">|</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 hover:cursor-help">
                      <Zap className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      <span>LVL {getLevel()}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Level</p>
                    <p className="text-sm">Your current level based on total EXP</p>
                    <p className="text-sm">• Level up every 1,000 EXP</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-zinc-400/30 font-extrabold dark:text-zinc-500/30">|</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 hover:cursor-help">
                      <Star className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      <span>{stats.exp} EXP</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Experience Points</p>
                    <p className="text-sm">• Earn +10 EXP per vote</p>
                    <p className="text-sm">• Earn +200 EXP per poll created</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}


          {/* Category Filter */}
          <div className="flex md:justify-center overflow-x-auto gap-3 mb-8 pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`cursor-pointer shadow-md px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === category.id
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.label}
              </button>
            ))}
          </div>


          {/* Create Poll Button and Dialog */}
          {isSignedIn && (
            <>
              <div className="mb-6 flex justify-center">
                <button
                  onClick={() => {
                    if (!stats || stats.points < 200) {
                      toast.error('Insufficient points', {
                        icon: <AlertCircle className="h-4 w-4" />,
                        description: 'You need 200 points to create a poll',
                      });
                      return;
                    }
                    setShowCreatePoll(true);
                  }}
                  disabled={!stats || stats.points < 200}
                  className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${!stats || stats.points < 200
                    ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                  <Plus className="h-5 w-5" />
                  {t.createPoll} {stats && stats.points < 200 && `(${t.needMorePoints} ${200 - stats.points} ${t.morePoints})`}
                </button>
              </div>

              <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
                <DialogContent className="w-full max-h-[90vh] overflow-y-auto mx-4 mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                      Create New Poll
                    </DialogTitle>
                    <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                      Create a poll for others to vote on. Cost: 200 points
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Form Section */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newPoll.question}
                        onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                        placeholder="Enter your poll question"
                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />

                      <input
                        type="text"
                        value={newPoll.description}
                        onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                        placeholder="Optional description"
                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />


                      <select
                        value={newPoll.category}
                        onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value as Poll['category'] })}
                        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="food">Food</option>
                        <option value="politics">Politics</option>
                        <option value="culture">Culture</option>
                        <option value="economy">Economy</option>
                        <option value="social">Social</option>
                      </select>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input
                              type="checkbox"
                              checked={hasEndDate}
                              onChange={(e) => {
                                setHasEndDate(e.target.checked);
                                if (!e.target.checked) {
                                  setNewPoll({ ...newPoll, endDate: '' });
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-focus:ring-2 peer-focus:ring-emerald-500/30 transition-all duration-200 flex items-center justify-center group-hover:border-emerald-400 dark:group-hover:border-emerald-500">
                              <svg
                                className={`w-3 h-3 text-white transition-all duration-200 ${hasEndDate ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 -mt-0.5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Set an end date for this poll
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Schedule when voting should automatically close
                            </p>
                          </div>
                        </label>

                        {hasEndDate && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-8"
                          >
                            <div className="space-y-2">
                              <input
                                type="datetime-local"
                                value={newPoll.endDate}
                                onChange={(e) => setNewPoll({ ...newPoll, endDate: e.target.value })}
                                placeholder="Select end date"
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              />
                              <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <span>The poll will automatically close at this date and time.</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-4 mt-4">
                        {newPoll.options.map((option, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                              Poll Option {index + 1}
                            </label>
                            <div className="flex gap-2">
                              {/* Emoji Picker Button */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)}
                                  className="cursor-pointer w-16 h-11 px-3 py-2 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-2xl flex items-center justify-center transition-all"
                                >
                                  {option.emoji || ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || '❓'}
                                </button>

                                {/* Emoji Picker Dropdown */}
                                {showEmojiPicker === index && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute z-50 mt-2 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl w-72 max-h-64 overflow-y-auto"
                                  >
                                    <div className="grid grid-cols-8 gap-1">
                                      {POLL_EMOJIS.map((emoji, emojiIndex) => (
                                        <button
                                          key={emojiIndex}
                                          type="button"
                                          onClick={() => {
                                            const newOptions = [...newPoll.options];
                                            newOptions[index].emoji = emoji;
                                            setNewPoll({ ...newPoll, options: newOptions });
                                            setShowEmojiPicker(null);
                                          }}
                                          className="w-8 h-8 text-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded transition-colors flex items-center justify-center"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowEmojiPicker(null)}
                                      className="cursor-pointer w-full mt-3 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                                    >
                                      Close
                                    </button>
                                  </motion.div>
                                )}
                              </div>

                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => {
                                  const newOptions = [...newPoll.options];
                                  newOptions[index].label = e.target.value;
                                  setNewPoll({ ...newPoll, options: newOptions });
                                }}
                                placeholder={`Option ${index + 1} label`}
                                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className='mb-4'>
                    <button
                      onClick={() => setShowCreatePoll(false)}
                      disabled={isCreatingPoll}
                      className="cursor-pointer px-6 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePoll}
                      disabled={isCreatingPoll}
                      className="cursor-pointer px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingPoll ? 'Creating poll...' : 'Create Poll (Cost: 200 points)'}
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Polls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {isLoadingPolls || isLoadingResults ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              ))
            ) : (
              filteredPolls.map((poll, index) => {
                const hasVoted = userVotes[poll.id];
                const results = pollResults[poll.id];
                const isPollEnded = !isPollLive(poll);

                return (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col justify-between gap-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-shadow"
                  >
                    {/* Poll Header */}
                    <div className="">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-base font-bold tracking-tight leading-[1.2] text-zinc-800 dark:text-zinc-100 flex-1">
                          {poll.question}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 tracking-tight">
                          {poll.description}
                        </p>
                      </div>
                    </div>

                    {/* Options - Single Bar UI */}
                    <div className="space-y-3">
                      {poll.options.length === 2 ? (
                        <div className="space-y-3">
                          {/* Option Labels with Divider - Grid Layout */}
                          <div className="relative grid grid-cols-2 gap-5 items-end">
                            {poll.options.map((option, optionIndex) => {
                              const isSelected = hasVoted?.selectedOption === optionIndex;
                              const isEnded = !isPollLive(poll);

                              return (
                                <div
                                  key={optionIndex}
                                  className={`flex flex-col justify-center ${optionIndex === 0 ? 'items-start' : 'items-end'
                                    }`}
                                >
                                  <div
                                    className={`flex items-center gap-1.5 ${isSelected
                                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                                        : isEnded && !hasVoted
                                          ? 'text-zinc-500 dark:text-zinc-500'
                                          : 'text-zinc-800 dark:text-zinc-200'
                                      }`}
                                  >
                                    <span className="text-xs font-medium tracking-tight">
                                    {option.emoji} {option.label}
                                    </span>
                                    {isSelected && (
                                      <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {/* Separator between the two options */}
                            <div className="absolute left-1/2 -translate-x-1/2 h-6 w-px bg-zinc-300 dark:bg-zinc-700"></div>
                          </div>

                          {/* Percentage Bar with Vote Buttons Overlaid */}
                          <div className="relative flex h-7 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            {poll.options.map((option, optionIndex) => {
                              const percentage = getVotePercentage(poll.id, optionIndex);
                              const isSelected = hasVoted?.selectedOption === optionIndex;
                              const isEnded = !isPollLive(poll);
                              const showResults = hasVoted || isEnded;
                              const flexBasis = showResults ? `${percentage}%` : '50%';

                              return (
                                <motion.div
                                  key={optionIndex}
                                  initial={{ flexBasis: '50%' }}
                                  animate={{ flexBasis: flexBasis }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  className={`relative flex items-center justify-center ${showResults
                                      ? isSelected
                                        ? 'bg-emerald-500 dark:bg-emerald-600'
                                        : 'bg-zinc-300 dark:bg-zinc-700'
                                      : 'bg-zinc-200 dark:bg-zinc-800'
                                    }`}
                                >
                                  <span className={`text-xs font-bold ${showResults
                                      ? isSelected
                                        ? 'text-white'
                                        : 'text-zinc-700 dark:text-zinc-300'
                                      : 'text-zinc-400 dark:text-zinc-500'
                                    }`}>
                                    {showResults ? `${percentage.toFixed(1)}%` : '?%'}
                                  </span>
                                </motion.div>
                              );
                            })}
                            
                            {/* Vote Buttons Overlaid on Top of Bar */}
                            {!hasVoted && !isPollEnded && (
                              <div className="absolute inset-0 flex items-center justify-between px-0 z-10 pointer-events-none">
                                <button
                                  onClick={() => handleVote(poll.id, 0)}
                                  className="h-full pl-4 pr-3 rounded-l-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center pointer-events-auto"
                                >
                                  Vote
                                </button>
                                <button
                                  onClick={() => handleVote(poll.id, 1)}
                                  className="h-full pr-4 pl-3 rounded-r-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center pointer-events-auto"
                                >
                                  Vote
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Fallback for more than 2 options - keep original card style
                        poll.options.map((option, optionIndex) => {
                          const percentage = getVotePercentage(poll.id, optionIndex);
                          const isSelected = hasVoted?.selectedOption === optionIndex;
                          const isEnded = !isPollLive(poll);
                          const showResults = hasVoted || isEnded;

                          return (
                            <button
                              key={optionIndex}
                              onClick={() => handleVote(poll.id, optionIndex)}
                              disabled={!!hasVoted || isEnded}
                              className={`w-full relative overflow-hidden rounded-lg border-2 transition-all ${isSelected
                                ? 'border-emerald-600 dark:border-emerald-500'
                                : hasVoted || isEnded
                                  ? 'border-zinc-200 dark:border-zinc-700'
                                  : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-600'
                                } ${hasVoted || isEnded ? 'cursor-default' : 'cursor-pointer hover:shadow-md'} ${isEnded && !hasVoted ? 'opacity-60' : ''
                                }`}
                            >
                              {/* Progress Bar */}
                              {showResults && (
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5, ease: 'easeOut' }}
                                  className={`absolute inset-0 ${isSelected
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                    : 'bg-zinc-100 dark:bg-zinc-800'
                                    }`}
                                />
                              )}

                              {/* Option Content */}
                              <div className="relative px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`text-2xl ${isEnded && !hasVoted ? 'grayscale' : ''}`}>
                                    {option.emoji}
                                  </span>
                                  <span className={`font-medium ${isSelected
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : isEnded && !hasVoted
                                      ? 'text-zinc-500 dark:text-zinc-500'
                                      : 'text-zinc-800 dark:text-zinc-200'
                                    }`}>
                                    {option.label}
                                  </span>
                                </div>
                                {showResults && (
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${isEnded && !hasVoted
                                      ? 'text-zinc-500 dark:text-zinc-400'
                                      : 'text-zinc-700 dark:text-zinc-300'
                                      }`}>
                                      {percentage.toFixed(1)}%
                                    </span>
                                    <span className={`text-xs ${isEnded && !hasVoted
                                      ? 'text-zinc-400 dark:text-zinc-500'
                                      : 'text-zinc-500 dark:text-zinc-400'
                                      }`}>
                                      ({results?.votes[optionIndex] || 0})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}

                      {/* Bottom Actions - Minimalistic Design */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                        {/* Total Votes and Time - Bottom Left */}
                        <div className="flex items-center gap-3">
                          {/* Live/Ended Badge */}
                          {poll.endDate ? (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${isPollLive(poll)
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                              {isPollLive(poll) ? t.live : t.ended}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              {t.live}
                            </span>
                          )}
                          {/* Total Votes - Always show */}
                          {results && (
                            <p className={`text-xs ${isPollEnded && !hasVoted
                                ? 'text-zinc-500 dark:text-zinc-500'
                                : 'text-zinc-600 dark:text-zinc-400'
                              }`}>
                              <span className="font-bold">{results.totalVotes}</span> {t.votes}
                            </p>
                          )}
                          {/* Time ago */}
                          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(poll.createdAt)}</span>
                          </div>
                          {/* Ended date - show if poll has ended */}
                          {isPollEnded && poll.endDate && (
                            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">{t.ended}: {formatEndDate(poll.endDate)}</span>
                            </div>
                          )}
                        </div>

                          {/* Action Buttons - Bottom Right (Icons Only) */}
                          <div className="flex items-center gap-2">
                            {/* Share Button */}
                            <button
                              onClick={() => setShowShareDialog(poll.id)}
                              className="cursor-pointer p-2 rounded-lg transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:scale-105 active:scale-95"
                              title={t.share}
                            >
                              <Send className="h-4 w-4" />
                            </button>

                            {/* Details Button */}
                            {(hasVoted || isPollEnded) && results && results.totalVotes > 0 && (
                              <button
                                onClick={() => setSelectedPollForDetails(poll)}
                                className={`cursor-pointer p-2 rounded-lg transition-all border hover:scale-105 active:scale-95 ${isPollEnded && !hasVoted
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                                  }`}
                                title="See Details"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>


                  </motion.div>
                );
              })
            )}
          </div>

          {/* Share Dialog */}
          <Dialog open={showShareDialog !== null} onOpenChange={(open) => !open && setShowShareDialog(null)}>
            <DialogContent className="w-full lg:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                  Share Poll
                </DialogTitle>
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  Download the image, then share it on your favorite platform
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4 overflow-x-hidden">
                {showShareDialog && (() => {
                  const poll = allPolls.find(p => p.id === showShareDialog);
                  if (!poll) return null;
                  const results = pollResults[poll.id];

                  return (
                    <>
                      {/* Poll Image Preview for Capture */}
                      <div
                        ref={pollImageRef}
                        style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '12px',
                          padding: '24px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          width: '100%',
                          maxWidth: '100%',
                          minHeight: '300px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        {/* Decorative Background Pattern */}
                        <div style={{
                          position: 'absolute',
                          inset: '0',
                          opacity: 0.1
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '128px',
                            height: '128px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            transform: 'translate(64px, -64px)'
                          }}></div>
                          <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            transform: 'translate(-80px, 80px)'
                          }}></div>
                        </div>

                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 10 }}>
                          {/* Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '16px',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{
                              color: '#ffffff',
                              fontSize: '20px',
                              fontWeight: '600',
                              display: 'table-cell',
                              verticalAlign: 'middle',
                              textAlign: 'center'
                            }}>MYPETA.AI</span>
                            <span style={{
                              color: '#ffffff',
                              fontWeight: '500',
                              fontSize: '12px'
                            }}>🇲🇾 Malaysian Poll by the People</span>
                          </div>
                          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', marginBottom: '16px' }} />

                          {/* Question */}
                          <h3 style={{
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '8px',
                            lineHeight: '1.25',
                            margin: '0 0 8px 0'
                          }}>
                            {poll.question}
                          </h3>

                          {poll.description && (
                            <p style={{
                              fontSize: '14px',
                              marginBottom: '24px',
                              paddingBottom: '15px',
                              color: 'rgba(255, 255, 255, 0.8)',
                              margin: '0 0 24px 0'
                            }}>
                              {poll.description}
                            </p>
                          )}

                          {/* Poll Options */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '24px'
                          }}>
                            {poll.options.map((option, idx) => {
                              const percentage = results ?
                                (results.totalVotes > 0 ? (results.votes[idx] / results.totalVotes) * 100 : 0)
                                : 0;

                              return (
                                <div key={idx} style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  backdropFilter: 'blur(8px)',
                                  borderRadius: '8px',
                                  padding: '12px'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                  }}>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}>
                                      <span style={{
                                        fontSize: '20px',
                                        paddingBottom: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>{option.emoji}</span>
                                      <span style={{
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        color: '#18181b'
                                      }}>
                                        {option.label}
                                      </span>
                                    </div>
                                    {results && results.totalVotes > 0 && (
                                      <span style={{
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: '#10b981'
                                      }}>
                                        {percentage.toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                  {results && results.totalVotes > 0 && (
                                    <div style={{
                                      width: '100%',
                                      borderRadius: '9999px',
                                      height: '6px',
                                      backgroundColor: '#e4e4e7'
                                    }}>
                                      <div style={{
                                        height: '6px',
                                        borderRadius: '9999px',
                                        width: `${percentage}%`,
                                        backgroundColor: '#10b981',
                                        transition: 'all 0.3s'
                                      }}></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            {results && (
                              <span style={{
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'table-cell',
                                verticalAlign: 'middle',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                              }}>
                                {results.totalVotes} Total Votes
                              </span>
                            )}
                            <span style={{
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'table-cell',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                            }}>
                              Cast Your Vote! 🗳️
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Step 1: Download */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                            1
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Download the poll image
                          </h4>
                        </div>
                        <button
                          onClick={() => handleShare(poll, 'download')}
                          disabled={generatingImageFor === 'download'}
                          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="h-5 w-5" />
                          {generatingImageFor === 'download' ? 'Generating Image...' : 'Download Image'}
                        </button>
                      </div>

                      {/* Step 2: Share */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                            2
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                            Share on your favorite platform
                          </h4>
                        </div>

                        {/* Social Share Buttons - Circular */}
                        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap max-w-full">
                          {/* Native Share */}
                          {typeof navigator !== 'undefined' && 'share' in navigator && (
                            <button
                              onClick={() => handleShare(poll, 'native')}
                              className="cursor-pointer group relative"
                              title="Share (Native)"
                            >
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all transform hover:scale-110 shadow-lg">
                                <Share className="w-6 h-6 text-white" />
                              </div>
                            </button>
                          )}

                          {/* Twitter/X */}
                          <button
                            onClick={() => handleShare(poll, 'twitter')}
                            className="cursor-pointer group relative"
                            title="Share on X (Twitter)"
                          >
                            <div className="w-14 h-14 rounded-full bg-zinc-900 hover:bg-[#1a1a1a] flex items-center justify-center transition-all transform hover:scale-110 shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </div>
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => handleShare(poll, 'whatsapp')}
                            className="cursor-pointer group relative"
                            title="Share on WhatsApp"
                          >
                            <div className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center transition-all transform hover:scale-110 shadow-lg">
                              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                            </div>
                          </button>

                          {/* Copy Link */}
                          <button
                            onClick={() => copyLink(poll)}
                            className="cursor-pointer group relative"
                            title="Copy Link"
                          >
                            <div className="w-14 h-14 rounded-full bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center justify-center transition-all transform hover:scale-110 shadow-lg">
                              <Copy className="w-6 h-6 text-white" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </DialogContent>
          </Dialog>

          {/* Poll Details Dialog */}
          {selectedPollForDetails && (
            <Dialog open={!!selectedPollForDetails} onOpenChange={(open) => !open && setSelectedPollForDetails(null)}>
              <DialogContent className="w-full md:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                    {selectedPollForDetails.question}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                    Vote breakdown by state
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {selectedPollForDetails.options.map((option, optionIndex) => {
                    const chartData = getStateChartData(selectedPollForDetails, optionIndex);
                    const chartConfig = getStateChartConfig(selectedPollForDetails, optionIndex);
                    const optionVotes = pollResults[selectedPollForDetails.id]?.votes[optionIndex] || 0;

                    if (chartData.length === 0) {
                      return null;
                    }

                    return (
                      <div key={optionIndex} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{option.emoji}</span>
                          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                            {option.label}
                          </h3>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            ({optionVotes} votes)
                          </span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                          <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-[300px]"
                          >
                            <PieChart>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                              />
                              <Pie
                                data={chartData}
                                dataKey="votes"
                                nameKey="state"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                              />
                            </PieChart>
                          </ChartContainer>

                          {/* Legend with Percentage and Amount */}
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {chartData.map((item) => {
                              const percentage = optionVotes > 0
                                ? ((item.votes / optionVotes) * 100).toFixed(1)
                                : '0';

                              return (
                                <div
                                  key={item.state}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                                >
                                  <div
                                    className="h-4 w-4 rounded-sm shrink-0"
                                    style={{ backgroundColor: item.fill }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                      {capitalizeStateName(item.state)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                      <span className="font-semibold">{percentage}%</span>
                                      <span>•</span>
                                      <span>{item.votes} {item.votes === 1 ? 'vote' : 'votes'}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {selectedPollForDetails.options.every((_, idx) =>
                    getStateChartData(selectedPollForDetails, idx).length === 0
                  ) && (
                      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        No state breakdown data available yet
                      </div>
                    )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Footer />
        </div>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default PollsPage;

