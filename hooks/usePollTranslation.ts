import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateText } from '@/lib/translation';
import { Poll } from '@/data/polls';

/**
 * Hook for translating poll data (questions, descriptions, options)
 * Caches translations to avoid repeated API calls
 */
export function usePollTranslation(polls: Poll[]): Poll[] {
  const { language } = useLanguage();
  const [translatedPolls, setTranslatedPolls] = useState<Poll[]>(polls);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // If language is English, return original polls
    if (language === 'en') {
      setTranslatedPolls(polls);
      return;
    }

    // If no polls, return empty array
    if (!polls || polls.length === 0) {
      setTranslatedPolls([]);
      return;
    }

    const translatePolls = async () => {
      setIsTranslating(true);
      
      try {
        // Collect all texts to translate in one batch
        const textsToTranslate: string[] = [];
        const textMap: Array<{ pollIndex: number; field: 'question' | 'description'; optionIndex?: number }> = [];

        polls.forEach((poll, pollIndex) => {
          // Add question
          textsToTranslate.push(poll.question);
          textMap.push({ pollIndex, field: 'question' });

          // Add description if exists
          if (poll.description) {
            textsToTranslate.push(poll.description);
            textMap.push({ pollIndex, field: 'description' });
          }

          // Add option labels
          poll.options.forEach((option, optionIndex) => {
            textsToTranslate.push(option.label);
            textMap.push({ pollIndex, field: 'question', optionIndex });
          });
        });

        // Translate all texts in one API call
        const translatedTexts = await translateText(textsToTranslate, {
          source: 'en',
          target: language,
        }) as string[];

        // Map translated texts back to polls
        const newPolls = polls.map((poll, pollIndex) => ({
          ...poll,
          options: poll.options.map(opt => ({ ...opt }))
        }));

        translatedTexts.forEach((translatedText, index) => {
          const mapping = textMap[index];
          const poll = newPolls[mapping.pollIndex];

          if (mapping.field === 'question' && mapping.optionIndex === undefined) {
            poll.question = translatedText;
          } else if (mapping.field === 'description') {
            poll.description = translatedText;
          } else if (mapping.optionIndex !== undefined) {
            poll.options[mapping.optionIndex].label = translatedText;
          }
        });

        setTranslatedPolls(newPolls);
      } catch (error) {
        console.error('Error translating polls:', error);
        // Fall back to original polls on error
        setTranslatedPolls(polls);
      } finally {
        setIsTranslating(false);
      }
    };

    translatePolls();
  }, [polls, language]);

  return translatedPolls;
}

