import { motion } from 'framer-motion';
import { Zap, Play, Square, ChevronDown, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  isGenerating: boolean;
  onStartGeneration: () => void;
  onStopGeneration: () => void;
  grammar: string;
  onGrammarChange: (grammar: string) => void;
  model: string;
  onModelChange: (model: string) => void;
}

const grammars = [
  { value: 'json', label: 'JSON (RFC 8259)', icon: '{ }' },
  { value: 'python', label: 'Python (PEP 8)', icon: '🐍' },
  { value: 'sql', label: 'SQL (SELECT)', icon: '📊' },
  { value: 'custom', label: 'Custom CFG', icon: '⚙️' },
];

const models = [
  { value: 'gpt2-small', label: 'GPT-2 Small (124M)' },
  { value: 'gpt2-medium', label: 'GPT-2 Medium (355M)' },
  { value: 'llama2-7b', label: 'LLaMA-2 7B (GPU)' },
];

export const Header = ({
  isGenerating,
  onStartGeneration,
  onStopGeneration,
  grammar,
  onGrammarChange,
  model,
  onModelChange,
}: HeaderProps) => {
  const currentGrammar = grammars.find(g => g.value === grammar);
  const currentModel = models.find(m => m.value === model);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-lg gradient-border bg-card"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-xl font-display font-bold gradient-text-glow">
              Grammar-Constrained LLM Engine
            </h1>
            <p className="text-sm text-muted-foreground">
              Hallucination-Free Generation through Automata Theory
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Start/Stop Button */}
          {isGenerating ? (
            <Button
              onClick={onStopGeneration}
              variant="destructive"
              className="gap-2 glow-error"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          ) : (
            <Button
              onClick={onStartGeneration}
              className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 glow-primary"
            >
              <Play className="w-4 h-4" />
              Start Generation
            </Button>
          )}

          {/* Grammar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                <span className="flex items-center gap-2">
                  <span>{currentGrammar?.icon}</span>
                  <span>{currentGrammar?.label}</span>
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel border-border/50">
              {grammars.map((g) => (
                <DropdownMenuItem
                  key={g.value}
                  onClick={() => onGrammarChange(g.value)}
                  className={grammar === g.value ? 'bg-primary/10 text-primary' : ''}
                >
                  <span className="mr-2">{g.icon}</span>
                  {g.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Model Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  <span>{currentModel?.label}</span>
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel border-border/50">
              {models.map((m) => (
                <DropdownMenuItem
                  key={m.value}
                  onClick={() => onModelChange(m.value)}
                  className={model === m.value ? 'bg-primary/10 text-primary' : ''}
                >
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};
