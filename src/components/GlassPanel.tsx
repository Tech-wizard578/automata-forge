import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  delay?: number;
  header?: ReactNode;
}

export const GlassPanel = ({ children, className, glow = false, delay = 0, header }: GlassPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        glow ? 'glass-panel-glow' : 'glass-panel',
        'flex flex-col',
        className
      )}
    >
      {header && (
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};
