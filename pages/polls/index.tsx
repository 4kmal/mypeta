import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { POLLS_DATA, Poll } from '@/data/polls';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import FooterBranding from '@/components/FooterBranding';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, CheckCircle, AlertCircle, Plus, Coins, Zap, Star, Clock, Calendar, Info, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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

const PollsPage = () => {
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
  const [userVotes, setUserVotes] = useState<VoteData>({});
  const [pollResults, setPollResults] = useState<PollResults>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allPolls, setAllPolls] = useState<Poll[]>(POLLS_DATA);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    description: '',
    category: 'food' as Poll['category'],
    options: [{ label: '', emoji: '' }, { label: '', emoji: '' }],
    endDate: '',
  });
  const [selectedPollForDetails, setSelectedPollForDetails] = useState<Poll | null>(null);

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

  // Load poll results from Supabase
  const loadPollResults = async () => {
    if (allPolls.length === 0) return;

    try {
      const results: PollResults = {};

      for (const poll of allPolls) {
        // Get vote counts per option
        const { data: voteCounts } = await supabase
          .from('votes')
          .select('option_index')
          .eq('poll_id', poll.id);

        const votes = new Array(poll.options.length).fill(0);
        voteCounts?.forEach(v => {
          votes[v.option_index]++;
        });

        // Get state breakdown
        const { data: stateBreakdown } = await supabase
          .from('vote_state_breakdown')
          .select('*')
          .eq('poll_id', poll.id);

        const stateBreakdownMap: Record<string, number[]> = {};
        stateBreakdown?.forEach(sb => {
          if (!stateBreakdownMap[sb.state_id]) {
            stateBreakdownMap[sb.state_id] = new Array(poll.options.length).fill(0);
          }
          stateBreakdownMap[sb.state_id][sb.option_index] = sb.vote_count;
        });

        results[poll.id] = {
          votes,
          totalVotes: votes.reduce((a, b) => a + b, 0),
          stateBreakdown: stateBreakdownMap
        };
      }

      setPollResults(results);
    } catch (error) {
      console.error('Error loading poll results:', error);
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
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pollsError) {
        console.error('Error loading polls:', pollsError);
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
    } catch (error) {
      console.error('Error in loadPolls:', error);
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

      // 5. Sync with server in background (don't await)
      Promise.all([
        loadPollResults(),
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
    ? allPolls 
    : allPolls.filter(poll => poll.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Topics', emoji: '🗳️' },
    { id: 'food', label: 'Food', emoji: '🍜' },
    { id: 'politics', label: 'Politics', emoji: '🏛️' },
    { id: 'culture', label: 'Culture', emoji: '🎭' },
    { id: 'economy', label: 'Economy', emoji: '💰' },
    { id: 'social', label: 'Social', emoji: '👥' },
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
        options: [{ label: '', emoji: '' }, { label: '', emoji: '' }],
        endDate: '',
      });
      setShowCreatePoll(false);

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
    }
  };


  return (
    <>
      <Head>
        <title>Malaysian Polls - My Peta</title>
        <meta name="description" content="Vote on viral and controversial topics about Malaysia" />
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-12">
        <PageHeader showDataButton={true} />

        <div className="max-w-6xl mx-auto px-4 pt-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
              <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                Malaysian Polls
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Vote on viral and controversial topics about Malaysia. Your voice matters! 
              {!selectedState && isSignedIn && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500 font-medium">
                  ⚠️ Select your state to start voting
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
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`cursor-pointer shadow-md px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
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
                  className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    !stats || stats.points < 200
                      ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Plus className="h-5 w-5" />
                  Create Poll {stats && stats.points < 200 && `(Need ${200 - stats.points} more points)`}
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

                        <input
                          type="datetime-local"
                          value={newPoll.endDate}
                          onChange={(e) => setNewPoll({ ...newPoll, endDate: e.target.value })}
                          placeholder="Optional end date"
                          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Optional: Set when this poll should end. Leave empty for no end date.
                        </p>

                      <div className="space-y-4 mt-4">
                        {newPoll.options.map((option, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              Poll Option {index + 1}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={option.emoji}
                                onChange={(e) => {
                                  const newOptions = [...newPoll.options];
                                  newOptions[index].emoji = e.target.value;
                                  setNewPoll({ ...newPoll, options: newOptions });
                                }}
                                placeholder="Emoji"
                                maxLength={2}
                                className="w-20 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
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

                    {/* Separator */}
                    <Separator className="bg-zinc-300 dark:bg-zinc-700" />

                    {/* Preview Section */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                        Preview
                      </h4>
                      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                        {/* Poll Header Preview */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex-1">
                              {newPoll.question || 'Your poll question will appear here'}
                            </h3>
                            {newPoll.endDate && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                new Date(newPoll.endDate) > new Date()
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                                {new Date(newPoll.endDate) > new Date() ? 'Live' : 'Ended'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            {newPoll.description && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {newPoll.description}
                              </p>
                            )}
                            {newPoll.endDate && (
                              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 ml-2 flex-shrink-0">
                                <Calendar className="h-3 w-3" />
                                <span>Ends: {formatEndDate(newPoll.endDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Options Preview */}
                        <div className="space-y-3">
                          {newPoll.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="w-full rounded-lg border-2 border-zinc-300 dark:border-zinc-700 transition-all"
                            >
                              <div className="px-4 py-3 flex items-center gap-3">
                                <span className="text-2xl">{option.emoji || '❓'}</span>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                  {option.label || `Option ${optionIndex + 1} label`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className='mb-4'>
                    <button
                      onClick={() => setShowCreatePoll(false)}
                      className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePoll}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Poll (Cost: 200 points)
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Polls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredPolls.map((poll, index) => {
              const hasVoted = userVotes[poll.id];
              const results = pollResults[poll.id];
              const isPollEnded = !isPollLive(poll);

              return (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-shadow"
                >
                  {/* Poll Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex-1">
                        {poll.question}
                      </h3>
                      <div className="flex items-center gap-2">
                        {poll.endDate ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isPollLive(poll)
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {isPollLive(poll) ? 'Live' : 'Ended'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            Live
                          </span>
                        )}
                        {hasVoted && (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {poll.description}
                      </p>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(poll.createdAt)}</span>
                        </div>
                        {poll.endDate && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">
                              {isPollLive(poll) ? 'Ends' : 'Ended'}: {formatEndDate(poll.endDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {poll.options.map((option, optionIndex) => {
                      const percentage = getVotePercentage(poll.id, optionIndex);
                      const isSelected = hasVoted?.selectedOption === optionIndex;
                      const isEnded = !isPollLive(poll);
                      const showResults = hasVoted || isEnded;

                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleVote(poll.id, optionIndex)}
                          disabled={!!hasVoted || isEnded}
                          className={`w-full relative overflow-hidden rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-emerald-600 dark:border-emerald-500'
                              : hasVoted || isEnded
                              ? 'border-zinc-200 dark:border-zinc-700'
                              : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-600'
                          } ${hasVoted || isEnded ? 'cursor-default' : 'cursor-pointer hover:shadow-md'} ${
                            isEnded && !hasVoted ? 'opacity-60' : ''
                          }`}
                        >
                          {/* Progress Bar */}
                          {showResults && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={`absolute inset-0 ${
                                isSelected
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
                              <span className={`font-medium ${
                                isSelected
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
                                <span className={`text-sm font-bold ${
                                  isEnded && !hasVoted
                                    ? 'text-zinc-500 dark:text-zinc-400'
                                    : 'text-zinc-700 dark:text-zinc-300'
                                }`}>
                                  {percentage.toFixed(1)}%
                                </span>
                                <span className={`text-xs ${
                                  isEnded && !hasVoted
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
                    })}
                  </div>

                  {/* Total Votes and Details Button */}
                  {(hasVoted || isPollEnded) && results && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-center gap-3">
                        <p className={`text-sm text-center ${
                          isPollEnded && !hasVoted
                            ? 'text-zinc-500 dark:text-zinc-500'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}>
                          Total votes: <span className="font-bold">{results.totalVotes}</span>
                        </p>
                        {results.totalVotes > 0 && (
                          <button
                            onClick={() => setSelectedPollForDetails(poll)}
                            className={`cursor-pointer flex items-center gap-1 text-xs font-medium transition-colors ${
                              isPollEnded && !hasVoted
                                ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                            }`}
                          >
                            <Info className="h-3 w-3" />
                            See Details
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

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
          {/* <FooterBranding /> */}
        </div>
      </div>
    </>
  );
};

export default PollsPage;

