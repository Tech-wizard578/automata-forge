import { motion } from 'framer-motion';
import { FileText, Bot, Settings, MessageSquare, BarChart3, Upload, Eye, Check, X, Zap, Target } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ControlPanelProps {
  temperature: number;
  setTemperature: (value: number) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  topP: number;
  setTopP: (value: number) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  pdaValidation: boolean;
  setPdaValidation: (value: boolean) => void;
  realtimeMasking: boolean;
  setRealtimeMasking: (value: boolean) => void;
  speculativeDecoding: boolean;
  setSpeculativeDecoding: (value: boolean) => void;
  stats: {
    validGenerations: number;
    preventedErrors: number;
    avgSpeed: number;
    constraintHitRate: number;
  };
}

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-1.5 rounded-md bg-primary/10">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h3 className="font-display font-semibold text-sm">{title}</h3>
  </div>
);

const examplePrompts = [
  { value: 'user-profile', label: 'User Profile JSON' },
  { value: 'api-response', label: 'API Response' },
  { value: 'database-query', label: 'Database Query' },
  { value: 'config-file', label: 'Configuration File' },
];

export const ControlPanel = ({
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  topP,
  setTopP,
  prompt,
  setPrompt,
  pdaValidation,
  setPdaValidation,
  realtimeMasking,
  setRealtimeMasking,
  speculativeDecoding,
  setSpeculativeDecoding,
  stats,
}: ControlPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2"
    >
      {/* Grammar Configuration */}
      <GlassPanel className="p-4">
        <SectionHeader icon={FileText} title="Grammar Definition" />
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Eye className="w-3.5 h-3.5" />
              View Rules
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <Upload className="w-3.5 h-3.5" />
              Upload CFG
            </Button>
          </div>
        </div>
      </GlassPanel>

      {/* LLM Configuration */}
      <GlassPanel className="p-4">
        <SectionHeader icon={Bot} title="Language Model" />
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Temperature</Label>
              <span className="text-xs font-mono text-primary">{temperature.toFixed(2)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={2}
              step={0.01}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Max Tokens</Label>
              <span className="text-xs font-mono text-primary">{maxTokens}</span>
            </div>
            <Slider
              value={[maxTokens]}
              onValueChange={([v]) => setMaxTokens(v)}
              min={10}
              max={500}
              step={10}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Top-p (nucleus)</Label>
              <span className="text-xs font-mono text-primary">{topP.toFixed(2)}</span>
            </div>
            <Slider
              value={[topP]}
              onValueChange={([v]) => setTopP(v)}
              min={0}
              max={1}
              step={0.01}
              className="cursor-pointer"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Constraint Settings */}
      <GlassPanel className="p-4">
        <SectionHeader icon={Settings} title="Constraint Engine" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">PDA Validation</Label>
            <Switch
              checked={pdaValidation}
              onCheckedChange={setPdaValidation}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Real-time Masking</Label>
            <Switch
              checked={realtimeMasking}
              onCheckedChange={setRealtimeMasking}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Speculative Decoding</Label>
            <Switch
              checked={speculativeDecoding}
              onCheckedChange={setSpeculativeDecoding}
            />
          </div>
        </div>
      </GlassPanel>

      {/* Prompt Input */}
      <GlassPanel className="p-4 flex-1">
        <SectionHeader icon={MessageSquare} title="Generation Prompt" />
        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Generate a JSON object with user profile information..."
            className="min-h-[100px] bg-input/50 border-border/50 resize-none"
          />
          <Select>
            <SelectTrigger className="bg-input/50">
              <SelectValue placeholder="Example Prompts" />
            </SelectTrigger>
            <SelectContent className="glass-panel">
              {examplePrompts.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </GlassPanel>

      {/* Quick Stats */}
      <GlassPanel className="p-4" glow>
        <SectionHeader icon={BarChart3} title="Session Statistics" />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-success/20">
              <Check className="w-3.5 h-3.5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valid</p>
              <p className="text-sm font-semibold font-mono">{stats.validGenerations}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-destructive/20">
              <X className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prevented</p>
              <p className="text-sm font-semibold font-mono">{stats.preventedErrors}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-primary/20">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="text-sm font-semibold font-mono">{stats.avgSpeed} tok/s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-secondary/20">
              <Target className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hit Rate</p>
              <p className="text-sm font-semibold font-mono">{stats.constraintHitRate}%</p>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};
