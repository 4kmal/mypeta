import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer flex items-center gap-2 px-3 py-3 md:p-2 rounded-lg shadow-md bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-700 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6 flex-shrink-0">
        {/* Sun Icon */}
        <motion.svg
          className="absolute inset-0 w-6 h-6 text-yellow-400 dark:text-zinc-400"
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
          className="absolute inset-0 w-6 h-6 text-zinc-500 dark:text-blue-400"
          fill="none"
          strokeWidth={1.5}
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
      <span className="md:hidden font-semibold text-zinc-500 dark:text-zinc-300">
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
