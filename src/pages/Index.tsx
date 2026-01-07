import { useState, useEffect, useCallback } from 'react';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Header } from '@/components/Header';
import { ControlPanel } from '@/components/ControlPanel';
import { GenerationPanel } from '@/components/GenerationPanel';
import { AutomataViewer } from '@/components/AutomataViewer';

// Sample JSON to generate character by character
const sampleJSON = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "isActive": true,
  "skills": ["TypeScript", "React", "Python"],
  "address": {
    "city": "New York",
    "zipCode": "10001"
  }
}`;

const tokenProbabilities = [
  { text: 'name', probability: 0.452, valid: true },
  { text: 'user', probability: 0.281, valid: true },
  { text: 'id', probability: 0.123, valid: true },
  { text: '{{', probability: 0.087, valid: false },
  { text: 'data', probability: 0.041, valid: true },
  { text: '<xml>', probability: 0.016, valid: false },
];

const grammarRules = [
  'object → "{" pairs "}"',
  'pairs  → pair ("," pair)*',
  'pair   → string ":" value',
  'value  → string | number | object | array | bool',
  'array  → "[" values "]"',
];

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [grammar, setGrammar] = useState('json');
  const [model, setModel] = useState('gpt2-small');
  
  // Control panel state
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(100);
  const [topP, setTopP] = useState(0.9);
  const [prompt, setPrompt] = useState('Generate a JSON object with user profile information including name, age, email, and skills.');
  const [pdaValidation, setPdaValidation] = useState(true);
  const [realtimeMasking, setRealtimeMasking] = useState(true);
  const [speculativeDecoding, setSpeculativeDecoding] = useState(false);
  
  // Generation state
  const [generatedText, setGeneratedText] = useState('');
  const [tokens, setTokens] = useState<Array<{ text: string; probability: number; valid: boolean }>>([]);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Automata state
  const [currentState, setCurrentState] = useState('q0');
  const [stack, setStack] = useState<string[]>(['$']);
  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>>([]);
  
  // Stats
  const [stats, setStats] = useState({
    validGenerations: 47,
    preventedErrors: 12,
    avgSpeed: 23,
    constraintHitRate: 94,
  });
  
  const [metrics, setMetrics] = useState({
    tokensPerSec: 23,
    latency: 42,
    grammarChecks: 156,
    masksApplied: 23,
  });

  const startGeneration = useCallback(() => {
    setIsGenerating(true);
    setGeneratedText('');
    setTokens([]);
    setProgress(0);
    setElapsedTime(0);
    setLogs([]);
    setStack(['$']);
    setCurrentState('q0');
  }, []);

  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  // Simulate generation
  useEffect(() => {
    if (!isGenerating) return;

    let charIndex = 0;
    const startTime = Date.now();

    const interval = setInterval(() => {
      if (charIndex >= sampleJSON.length) {
        setIsGenerating(false);
        setStats(prev => ({ ...prev, validGenerations: prev.validGenerations + 1 }));
        return;
      }

      const char = sampleJSON[charIndex];
      setGeneratedText(sampleJSON.slice(0, charIndex + 1));
      setProgress((charIndex / sampleJSON.length) * 100);
      setElapsedTime((Date.now() - startTime) / 1000);

      // Update stack based on character
      if (char === '{') {
        setStack(prev => ['{', ...prev]);
        setCurrentState('q1');
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: `Allowed "{"`, type: 'success' }, ...prev.slice(0, 9)]);
      } else if (char === '}') {
        setStack(prev => prev.slice(1));
        setCurrentState(prev => prev === 'q1' ? 'q2' : prev);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: `Allowed "}"`, type: 'success' }, ...prev.slice(0, 9)]);
      } else if (char === '[') {
        setStack(prev => ['[', ...prev]);
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: `Allowed "["`, type: 'success' }, ...prev.slice(0, 9)]);
      } else if (char === ']') {
        setStack(prev => prev.slice(1));
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: `Allowed "]"`, type: 'success' }, ...prev.slice(0, 9)]);
      } else if (char === '"') {
        setStack(prev => prev[0] === '"' ? prev.slice(1) : ['"', ...prev]);
      }

      // Randomly add tokens
      if (Math.random() > 0.7) {
        const randomToken = tokenProbabilities[Math.floor(Math.random() * tokenProbabilities.length)];
        setTokens(prev => [...prev, randomToken].slice(-10));
        
        if (!randomToken.valid) {
          setLogs(prev => [{ time: new Date().toLocaleTimeString(), message: `BLOCKED "${randomToken.text}"`, type: 'error' }, ...prev.slice(0, 9)]);
          setStats(prev => ({ ...prev, preventedErrors: prev.preventedErrors + 1 }));
        }
      }

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        grammarChecks: prev.grammarChecks + 1,
        tokensPerSec: Math.round(20 + Math.random() * 10),
        latency: Math.round(30 + Math.random() * 30),
      }));

      charIndex++;
    }, 50);

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      
      <Header
        isGenerating={isGenerating}
        onStartGeneration={startGeneration}
        onStopGeneration={stopGeneration}
        grammar={grammar}
        onGrammarChange={setGrammar}
        model={model}
        onModelChange={setModel}
      />

      {/* Main Content */}
      <main className="pt-24 px-4 pb-6 relative z-10">
        <div className="max-w-[1800px] mx-auto h-[calc(100vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-3 h-full overflow-hidden">
              <ControlPanel
                temperature={temperature}
                setTemperature={setTemperature}
                maxTokens={maxTokens}
                setMaxTokens={setMaxTokens}
                topP={topP}
                setTopP={setTopP}
                prompt={prompt}
                setPrompt={setPrompt}
                pdaValidation={pdaValidation}
                setPdaValidation={setPdaValidation}
                realtimeMasking={realtimeMasking}
                setRealtimeMasking={setRealtimeMasking}
                speculativeDecoding={speculativeDecoding}
                setSpeculativeDecoding={setSpeculativeDecoding}
                stats={stats}
              />
            </div>

            {/* Center Panel - Generation */}
            <div className="lg:col-span-5 h-full overflow-hidden">
              <GenerationPanel
                isGenerating={isGenerating}
                generatedText={generatedText}
                tokens={tokens}
                progress={progress}
                elapsedTime={elapsedTime}
                nextValidTokens={42}
              />
            </div>

            {/* Right Panel - Automata */}
            <div className="lg:col-span-4 h-full overflow-hidden">
              <AutomataViewer
                currentState={currentState}
                stack={stack}
                activeRules={grammarRules}
                logs={logs}
                metrics={metrics}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
