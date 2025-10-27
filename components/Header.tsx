import { motion } from 'framer-motion';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';

const Header = () => {
  return (
    <>
      <h1 className='text-4xl lg:text-8xl font-bold text-center mb-4 text-zinc-800'>
        Data Malaysia
      </h1>
      <div className='mb-12'>
        <motion.div className="relative mx-4 my-4 flex items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0">
          <LayoutTextFlip
            text="Visualizing data in a"
            words={["Better", "Easier", "Faster", "Smarter"]}
          />
        </motion.div>
      </div>
    </>
  );
};

export default Header;

