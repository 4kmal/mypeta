import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer relative p-2 rounded-lg shadow-md bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-900 dark:hover:bg-zinc-300 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-yellow-400 dark:text-zinc-800"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          initial={false}
          animate={{
            opacity: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : 180,
            scale: theme === 'dark' ? 1 : 0.8
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 0v3M12 21v3M3.5 3.5l2.12 2.12M18.38 18.38l2.12 2.12M0 12h3M21 12h3M3.5 20.5l2.12-2.12M18.38 5.62l2.12-2.12" />
        </motion.svg>

        {/* Moon Icon */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-zinc-200 dark:text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={false}
          animate={{
            opacity: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : -180,
            scale: theme === 'light' ? 1 : 0.8
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </motion.svg>
      </div>
    </button>
  );
};

export default ThemeToggleButton;
