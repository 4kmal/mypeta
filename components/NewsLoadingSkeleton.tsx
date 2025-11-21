import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const NewsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full">
            <CardContent className="p-0">
              {/* Image skeleton */}
              <Skeleton className="w-full h-48 rounded-none" />

              {/* Content skeleton */}
              <div className="p-5 space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />

                {/* Description */}
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default NewsLoadingSkeleton;

