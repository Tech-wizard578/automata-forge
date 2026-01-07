import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Play, BarChart3, History, Check, X, AlertCircle } from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface GenerationPanelProps {
  isGenerating: boolean;
  generatedText: string;
  tokens: Array<{ text: string; probability: number; valid: boolean }>;
  progress: number;
  elapsedTime: number;
  nextValidTokens: number;
}

const syntaxHighlight = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;
    
    // Match JSON patterns
    const patterns = [
      { regex: /^(\s*)/, className: '' },
      { regex: /("[^"]*")(\s*:)/, className: 'syntax-key', suffix: 'syntax-punctuation' },
      { regex: /"[^"]*"/, className: 'syntax-string' },
      { regex: /\b\d+\.?\d*\b/, className: 'syntax-number' },
      { regex: /[{}\[\]]/, className: 'syntax-bracket' },
      { regex: /[:,]/, className: 'syntax-punctuation' },
      { regex: /\b(true|false|null)\b/, className: 'syntax-number' },
    ];

    while (remaining.length > 0) {
      let matched = false;
      
      for (const pattern of patterns) {
        const match = remaining.match(pattern.regex);
        if (match && match.index === 0) {
          if (pattern.suffix) {
            // Handle key:value pattern
            const keyMatch = remaining.match(/("[^"]*")(\s*:)/);
            if (keyMatch) {
              parts.push(
                <span key={keyIndex++} className={pattern.className}>{keyMatch[1]}</span>
              );
              parts.push(
                <span key={keyIndex++} className={pattern.suffix}>{keyMatch[2]}</span>
              );
              remaining = remaining.slice(keyMatch[0].length);
              matched = true;
              break;
            }
          } else {
            parts.push(
              <span key={keyIndex++} className={pattern.className}>{match[0]}</span>
            );
            remaining = remaining.slice(match[0].length);
            matched = true;
            break;
          }
        }
      }
      
      if (!matched) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }
    
    return (
      <div key={lineIndex} className="leading-6">
        {parts}
      </div>
    );
  });
};

const TokenProbabilityBar = ({ token }: { token: { text: string; probability: number; valid: boolean } }) => {
  const width = Math.max(token.probability * 100, 5);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      <span className={cn(
        "font-mono w-20 truncate",
        token.valid ? "text-foreground" : "text-destructive line-through"
      )}>
        "{token.text}"
      </span>
      <div className="flex-1 h-4 bg-muted/30 rounded-sm overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.3 }}
          className={cn(
            "h-full rounded-sm",
            token.valid 
              ? "bg-gradient-to-r from-primary to-secondary" 
              : "bg-destructive/50"
          )}
        />
      </div>
      <span className="font-mono text-xs w-14 text-right text-muted-foreground">
        {(token.probability * 100).toFixed(1)}%
      </span>
      <span className={cn(
        "w-6 flex justify-center",
        token.valid ? "text-success" : "text-destructive"
      )}>
        {token.valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      </span>
    </motion.div>
  );
};

const mockHistory = [
  { time: '12:34:56', prompt: 'User Profile JSON', success: true, tokens: 156 },
  { time: '12:32:11', prompt: 'API Response', success: true, tokens: 89 },
  { time: '12:28:45', prompt: 'Database Query', success: false, tokens: 42 },
  { time: '12:25:33', prompt: 'Config File', success: true, tokens: 234 },
];

export const GenerationPanel = ({
  isGenerating,
  generatedText,
  tokens,
  progress,
  elapsedTime,
  nextValidTokens,
}: GenerationPanelProps) => {
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [generatedText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col h-full"
    >
      <Tabs defaultValue="live" className="flex-1 flex flex-col">
        <GlassPanel className="mb-4 p-1">
          <TabsList className="w-full bg-transparent grid grid-cols-3">
            <TabsTrigger value="live" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2">
              <Play className="w-3.5 h-3.5" />
              Live Generation
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2">
              <History className="w-3.5 h-3.5" />
              History
            </TabsTrigger>
          </TabsList>
        </GlassPanel>

        <TabsContent value="live" className="flex-1 flex flex-col gap-4 mt-0">
          {/* Live Generation Display */}
          <GlassPanel 
            className={cn(
              "flex-1 p-4",
              isGenerating && "pulse-glow"
            )} 
            glow={isGenerating}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isGenerating ? "bg-success animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-sm font-medium">
                {isGenerating ? 'LIVE GENERATION' : 'READY'}
              </span>
            </div>
            
            <div 
              ref={codeRef}
              className="font-mono text-sm bg-background/50 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar"
            >
              {generatedText ? (
                <div className={isGenerating ? "typing-cursor" : ""}>
                  {syntaxHighlight(generatedText)}
                </div>
              ) : (
                <span className="text-muted-foreground italic">
                  Output will appear here...
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tokens.length} tokens</span>
                <span>{elapsedTime.toFixed(1)}s elapsed</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="flex items-center gap-2 text-xs">
                <span className={isGenerating ? "status-info" : "text-muted-foreground"}>
                  {isGenerating ? `🟢 Generating...` : 'Ready'}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">
                  Next valid tokens: <span className="text-primary font-mono">{nextValidTokens}</span>
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Token Probability Heatmap */}
          <GlassPanel className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Next Token Probabilities (Top 10)</span>
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {tokens.slice(-10).map((token, i) => (
                  <TokenProbabilityBar key={`${token.text}-${i}`} token={token} />
                ))}
              </AnimatePresence>
              {tokens.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Token probabilities will appear during generation...
                </p>
              )}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-success" /> Allowed
              </span>
              <span className="flex items-center gap-1">
                <X className="w-3 h-3 text-destructive" /> Masked by PDA
              </span>
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="comparison" className="flex-1 mt-0">
          <GlassPanel className="h-full p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Without Constraints */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-destructive">
                  <X className="w-4 h-4" />
                  <span className="font-medium text-sm">WITHOUT CONSTRAINTS</span>
                </div>
                <div className="flex-1 bg-background/50 rounded-lg p-4 font-mono text-sm border border-destructive/20">
                  <div className="syntax-bracket">{'{'}</div>
                  <div className="ml-4">
                    <span className="syntax-key">"name"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-string">"John Doe"</span>
                    <span className="syntax-punctuation">,</span>
                  </div>
                  <div className="ml-4">
                    <span className="syntax-key">"age"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-number">30</span>
                    <span className="syntax-punctuation">,</span>
                  </div>
                  <div className="ml-4">
                    <span className="syntax-key">"email"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-string">"test</span>
                  </div>
                  <div className="mt-4 text-destructive text-xs">
                    ← BROKEN! Missing closing quotes and braces
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                  <X className="w-3.5 h-3.5" />
                  Syntax Error - Parser Failed
                </div>
              </div>

              {/* With Constraints */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-success">
                  <Check className="w-4 h-4" />
                  <span className="font-medium text-sm">WITH CONSTRAINTS</span>
                </div>
                <div className="flex-1 bg-background/50 rounded-lg p-4 font-mono text-sm border border-success/20">
                  <div className="syntax-bracket">{'{'}</div>
                  <div className="ml-4">
                    <span className="syntax-key">"name"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-string">"John Doe"</span>
                    <span className="syntax-punctuation">,</span>
                  </div>
                  <div className="ml-4">
                    <span className="syntax-key">"age"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-number">30</span>
                    <span className="syntax-punctuation">,</span>
                  </div>
                  <div className="ml-4">
                    <span className="syntax-key">"email"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-string">"john@example.com"</span>
                    <span className="syntax-punctuation">,</span>
                  </div>
                  <div className="ml-4">
                    <span className="syntax-key">"city"</span>
                    <span className="syntax-punctuation">: </span>
                    <span className="syntax-string">"New York"</span>
                  </div>
                  <div className="syntax-bracket">{'}'}</div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-success">
                  <Check className="w-3.5 h-3.5" />
                  Validated ✓ All constraints satisfied
                </div>
              </div>
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0">
          <GlassPanel className="h-full p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-medium mb-4">Recent Generations</h3>
            <div className="space-y-2">
              {mockHistory.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 cursor-pointer transition-colors"
                >
                  <span className="font-mono text-xs text-muted-foreground">[{item.time}]</span>
                  <span className="flex-1 text-sm">{item.prompt}</span>
                  <span className={cn(
                    "text-xs",
                    item.success ? "text-success" : "text-destructive"
                  )}>
                    {item.success ? '✅' : '❌'}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{item.tokens} tokens</span>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
