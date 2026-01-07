import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Layers, BookOpen, Shield, Zap, Trash2 } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AutomataViewerProps {
  currentState: string;
  stack: string[];
  activeRules: string[];
  logs: Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>;
  metrics: {
    tokensPerSec: number;
    latency: number;
    grammarChecks: number;
    masksApplied: number;
  };
}

const PDAVisualization = ({ currentState }: { currentState: string }) => {
  const states = ['q0', 'q1', 'q2', 'q3'];
  const activeIndex = states.indexOf(currentState);

  return (
    <div className="relative h-32 flex items-center justify-center">
      <svg viewBox="0 0 300 100" className="w-full h-full">
        {/* Connection lines */}
        <motion.path
          d="M 50 50 Q 100 20 150 50"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d="M 150 50 Q 200 20 250 50"
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <motion.path
          d="M 50 50 Q 100 80 150 50"
          fill="none"
          stroke="hsl(var(--secondary) / 0.3)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />

        {/* States */}
        {states.slice(0, 3).map((state, i) => {
          const x = 50 + i * 100;
          const isActive = i === activeIndex;
          
          return (
            <g key={state}>
              <motion.circle
                cx={x}
                cy={50}
                r={isActive ? 22 : 18}
                fill={isActive ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--card))'}
                stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={isActive ? 3 : 1}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
              />
              {isActive && (
                <motion.circle
                  cx={x}
                  cy={50}
                  r={28}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <text
                x={x}
                y={55}
                textAnchor="middle"
                className={cn(
                  "text-xs font-mono fill-current",
                  isActive ? 'fill-primary' : 'fill-muted-foreground'
                )}
              >
                {state}
              </text>
            </g>
          );
        })}

        {/* Transition labels */}
        <text x="100" y="28" textAnchor="middle" className="text-[8px] fill-primary/60 font-mono">{'"{"'}</text>
        <text x="200" y="28" textAnchor="middle" className="text-[8px] fill-primary/60 font-mono">{'"key"'}</text>
      </svg>
    </div>
  );
};

const StackVisualization = ({ stack }: { stack: string[] }) => {
  return (
    <div className="space-y-1">
      <AnimatePresence>
        {stack.map((item, i) => (
          <motion.div
            key={`${item}-${i}`}
            initial={{ opacity: 0, x: -20, rotateX: -15 }}
            animate={{ opacity: 1, x: 0, rotateX: 0 }}
            exit={{ opacity: 0, x: 20, rotateX: 15 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "stack-item px-3 py-2 rounded font-mono text-sm text-center",
              i === 0 
                ? "bg-primary/20 border border-primary/30 text-primary" 
                : "bg-muted/50 border border-border/50"
            )}
            style={{
              transform: `perspective(500px) translateZ(${(stack.length - i) * 2}px)`,
            }}
          >
            <span className="mr-2 text-xs text-muted-foreground">
              {i === 0 ? '← TOP' : ''}
            </span>
            '{item}'
            {i === stack.length - 1 && (
              <span className="ml-2 text-xs text-muted-foreground">(bottom)</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {stack.length === 0 && (
        <p className="text-sm text-muted-foreground italic text-center py-4">
          Stack is empty
        </p>
      )}
    </div>
  );
};

const MetricBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
};

export const AutomataViewer = ({
  currentState,
  stack,
  activeRules,
  logs,
  metrics,
}: AutomataViewerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pl-2"
    >
      {/* PDA State Machine */}
      <GlassPanel className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-primary/10">
            <RefreshCw className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-sm">PDA State Machine</h3>
        </div>
        <PDAVisualization currentState={currentState} />
        <div className="mt-2 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current State:</span>
            <span className="font-mono text-primary">{currentState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Next Valid:</span>
            <span className="font-mono text-success">{'key, }, ]'}</span>
          </div>
        </div>
      </GlassPanel>

      {/* Stack Visualization */}
      <GlassPanel className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-secondary/10">
              <Layers className="w-4 h-4 text-secondary" />
            </div>
            <h3 className="font-display font-semibold text-sm">PDA Stack</h3>
          </div>
          <span className="text-xs text-muted-foreground">Depth: {stack.length}</span>
        </div>
        <StackVisualization stack={stack} />
      </GlassPanel>

      {/* Active Grammar Rules */}
      <GlassPanel className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-warning/10">
            <BookOpen className="w-4 h-4 text-warning" />
          </div>
          <h3 className="font-display font-semibold text-sm">Active CFG Rules</h3>
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          {activeRules.map((rule, i) => (
            <motion.div
              key={rule}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "px-2 py-1.5 rounded",
                i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              {rule}
            </motion.div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Currently matching: <span className="text-primary font-mono">pair</span>
        </div>
      </GlassPanel>

      {/* Constraint Enforcement Log */}
      <GlassPanel className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-success/10">
              <Shield className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-display font-semibold text-sm">Constraint Log</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
        <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar font-mono text-xs">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={`${log.time}-${i}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-2",
                  log.type === 'success' && "text-success",
                  log.type === 'error' && "text-destructive",
                  log.type === 'info' && "text-primary"
                )}
              >
                <span className="opacity-60">{log.type === 'success' ? '✅' : log.type === 'error' ? '❌' : '🎯'}</span>
                <span className="opacity-50">{log.time}</span>
                <span>{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {logs.length === 0 && (
            <p className="text-muted-foreground italic">Logs will appear here...</p>
          )}
        </div>
      </GlassPanel>

      {/* Performance Metrics */}
      <GlassPanel className="p-4" glow>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-sm">Performance</h3>
        </div>
        <div className="space-y-3">
          <MetricBar label="Tokens/sec" value={metrics.tokensPerSec} max={50} color="bg-gradient-to-r from-primary to-secondary" />
          <MetricBar label="Latency (ms)" value={metrics.latency} max={100} color="bg-success" />
          <MetricBar label="Grammar checks" value={metrics.grammarChecks} max={200} color="bg-warning" />
          <MetricBar label="Masks applied" value={metrics.masksApplied} max={50} color="bg-destructive" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Speedup: <span className="text-success font-mono">2.3x</span> with speculative decoding
        </p>
      </GlassPanel>
    </motion.div>
  );
};
