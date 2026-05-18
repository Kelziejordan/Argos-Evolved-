/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, FormEvent, ReactNode } from "react";
import { 
  Send, 
  Cpu, 
  Activity, 
  Layers, 
  Settings, 
  Terminal, 
  ArrowRight,
  Shield,
  Zap,
  Maximize2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Flame,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface PairState {
  price: number;
  delta: number;
  status: 'bullish' | 'bearish' | 'neutral' | 'volatile';
}

interface MarketState {
  btc: PairState;
  eth: PairState;
  sol: PairState;
  dot: PairState;
  link: PairState;
  ada: PairState;
  xrp: PairState;
  neuralSentiment: number;
  quantumInstability: number;
  activeWhales: number;
  krakenConnected?: boolean;
  activeSignals?: Array<{ id: number; title: string; desc: string; variant: 'emerald' | 'amber' | 'red'; time: string }>;
}

interface Trade {
  id?: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  price: number;
  quantity: number;
  status: string;
  timestamp: any;
  pnl?: number;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "HYPERBOT v2.0 ONLINE. CROSS-CHAIN LIQUIDITY ARBITRAGE ENGINE INITIALIZED. HOW SHALL WE DOMINATE THE MARKETS TODAY?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [activeModule, setActiveModule] = useState("Command Hall");
  const [isAutoBotActive, setIsAutoBotActive] = useState(false);
  const [aggressionMatrix, setAggressionMatrix] = useState({
    risk: 42,
    frequency: 60,
    neuralDepth: 12
  });
  const [marketData, setMarketData] = useState<MarketState | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auth - Track auth state change only
    onAuthStateChanged(auth, setUser);

    // Live Market Data
    const pulseTimer = setInterval(async () => {
      try {
        const res = await fetch("/api/market-pulse");
        if (!res.ok) {
          throw new Error(`Server response failed: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response content type");
        }
        const data = await res.json();
        setMarketData(data);
      } catch (e) {
        console.error("Market pulse failed", e);
      }
    }, 2000);

    return () => clearInterval(pulseTimer);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Live Trade Listeners - Filter for OPEN trades
    const q = query(
      collection(db, "trades"),
      where("userId", "==", user.uid),
      where("status", "==", "OPEN"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      setTrades(tradeList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "trades");
      addAssistantMessage(`NEURAL_LINK_ERROR: ${error.message}. PERSISTENCE_LAYER_DENIED_ACCESS.`);
    });

    return () => unsubscribe();
  }, [user]);

  // Autonomous Bot Effect
  useEffect(() => {
    if (!isAutoBotActive || !user || !marketData) return;

    const autoTradeInterval = setInterval(() => {
      // Logic: If sentiment is very high/low and frequency check passes
      const shouldTrade = Math.random() < (aggressionMatrix.frequency / 1000);
      
      if (shouldTrade) {
        if (marketData.neuralSentiment > 0.8) {
          executeTradeSimulation("BTC/USDT", "LONG");
          addAssistantMessage("AUTO_BOT: HIGH_SENTIMENT_THRESHOLD_TRIPPED. EXECUTING_LONG.");
        } else if (marketData.neuralSentiment < 0.2) {
          executeTradeSimulation("BTC/USDT", "SHORT");
          addAssistantMessage("AUTO_BOT: NEGATIVE_SENTIMENT_SURGE. EXECUTING_SHORT.");
        }
      }
    }, 5000);

    return () => clearInterval(autoTradeInterval);
  }, [isAutoBotActive, user, marketData, aggressionMatrix]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRunningDiagnostics]);

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, {
      role: "assistant",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleShare = () => {
    const reportText = `HYPERBOT Analysis: BTC at $${marketData?.btc.price.toFixed(2)}, Neural Sentiment: ${(marketData?.neuralSentiment || 0 * 100).toFixed(1)}%. Stability Passed.`;
    navigator.clipboard.writeText(reportText).then(() => {
      addAssistantMessage("ANALYSIS_LOG_COPIED_TO_CLIPBOARD. READY FOR EXTERNAL DISTRIBUTION.");
    });
  };

  const handleDiagnostics = async () => {
    if (isRunningDiagnostics) return;
    setIsRunningDiagnostics(true);
    addAssistantMessage("INITIALIZING_FULL_SYSTEM_DIAGNOSTICS... [QUANTUM_FLUX: STABLE]");
    
    // Simulate steps
    setTimeout(() => addAssistantMessage("SCANNING_LIQUIDITY_POOLS... 142/142 OK."), 1000);
    setTimeout(() => addAssistantMessage("VERIFYING_NEURAL_WEIGHTS... PRECISION 0.00042ms."), 2000);
    setTimeout(() => {
      addAssistantMessage("DIAGNOSTICS_COMPLETE. SYSTEM_HEALTH: 99.8%. ALL_CORE_ENGINES_OPTIMAL.");
      setIsRunningDiagnostics(false);
    }, 3000);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      addAssistantMessage("NEURAL_IDENTITY_VERIFIED. WELCOME BACK, OPERATOR.");
    } catch (e: any) {
      console.error("Login failed", e);
      addAssistantMessage(`AUTH_SEQUENCE_FAILED: ${e.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      addAssistantMessage("NEURAL_LINK_TERMINATED. SESSION_SECURED.");
    } catch (e: any) {
      console.error("Logout failed", e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Pseudo-logic: If message looks like a trade command, simulate a firestore entry
      if (input.toLowerCase().includes("buy") || input.toLowerCase().includes("long") || input.toLowerCase().includes("trade")) {
        await executeTradeSimulation();
      }

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeTradeSimulation = async (symbol: string = "BTC/USDT", type: 'LONG' | 'SHORT' = "LONG") => {
    if (!user || !marketData) return;
    
    // Dynamically resolve price from symbol
    const key = symbol.split('/')[0].toLowerCase() as keyof MarketState;
    const assetData = (marketData as any)[key];
    const price = assetData?.price || 0;
    
    try {
      addAssistantMessage(`EXECUTING_${type}_ON_${symbol}_AT_$${price.toFixed(price > 1000 ? 2 : 4)}...`);
      await addDoc(collection(db, "trades"), {
        symbol,
        type,
        price,
        quantity: symbol.includes("BTC") ? 0.05 : (symbol.includes("ETH") ? 0.5 : 10),
        status: "OPEN",
        timestamp: serverTimestamp(),
        userId: user.uid,
        pnl: 0
      });
      setTimeout(() => addAssistantMessage(`ORDER_CONFIRMED. MONITORING_NET_POSITIONS.`), 800);
    } catch (e) {
      console.error("Firebase write error", e);
    }
  };

  const closePosition = async (tradeId: string) => {
    if (!tradeId || !user) return;
    try {
      addAssistantMessage(`TERMINATING_POSITION_${tradeId.slice(0, 8)}...`);
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "trades", tradeId), {
        status: "CLOSED",
        closedAt: serverTimestamp()
      });
      addAssistantMessage(`POSITION_SECURED. GAINS_REALIZED.`);
    } catch (e) {
      console.error("Close position error", e);
    }
  };

  return (
    <div className={`flex h-screen bg-nexus-bg text-white overflow-hidden selection:bg-nexus-accent/30 transition-all duration-1000 ${isRunningDiagnostics ? 'animate-pulse opacity-90' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-nexus-border flex flex-col bg-nexus-surface hidden md:flex">
        <div className="p-6 border-b border-nexus-border bg-nexus-surface">
          <h1 className="text-xs font-bold uppercase tracking-widest text-nexus-accent">HYPERBOT v2.0</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunningDiagnostics ? 'bg-amber-500' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-colors`}></div>
            <span className="text-sm font-medium">{isRunningDiagnostics ? 'Diagnosing...' : 'Neural Core Link'}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Main Core</h3>
            <div className="space-y-1">
              <SidebarItem 
                icon={<Terminal className="w-4 h-4" />} 
                label="Command Hall" 
                active={activeModule === "Command Hall"} 
                onClick={() => setActiveModule("Command Hall")}
              />
              <SidebarItem 
                icon={<Globe className="w-4 h-4" />} 
                label="Global Liquidity" 
                active={activeModule === "Global Liquidity"} 
                onClick={() => setActiveModule("Global Liquidity")}
              />
              <SidebarItem 
                icon={<Activity className="w-4 h-4" />} 
                label="Volatility Index" 
                active={activeModule === "Volatility Index"} 
                onClick={() => setActiveModule("Volatility Index")}
              />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Trading Engine</h3>
            <div className="space-y-1">
              <SidebarItem 
                icon={<BarChart3 className="w-4 h-4" />} 
                label="Order Flow" 
                active={activeModule === "Order Flow"} 
                onClick={() => setActiveModule("Order Flow")}
              />
              <SidebarItem 
                icon={<Flame className="w-4 h-4" />} 
                label="Liquidation Map" 
                active={activeModule === "Liquidation Map"} 
                onClick={() => setActiveModule("Liquidation Map")}
              />
              <SidebarItem 
                icon={<Shield className="w-4 h-4" />} 
                label="Risk Shield" 
                active={activeModule === "Risk Shield"} 
                onClick={() => setActiveModule("Risk Shield")}
              />
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Neural Settings</h3>
            <div className="px-1 space-y-4 pt-1">
              <div className="space-y-1.5 text-[9px] uppercase tracking-wider text-nexus-log font-mono">
                <div className="flex justify-between">
                  <span>Risk Aggression</span>
                  <span>{aggressionMatrix.risk}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={aggressionMatrix.risk}
                  onChange={(e) => setAggressionMatrix({...aggressionMatrix, risk: parseInt(e.target.value)})}
                  className="w-full accent-nexus-accent h-1 bg-nexus-dark rounded-full cursor-pointer" 
                />
              </div>
              <div className="space-y-1.5 text-[9px] uppercase tracking-wider text-nexus-log font-mono">
                <div className="flex justify-between">
                  <span>Neural Depth</span>
                  <span>{aggressionMatrix.neuralDepth} layers</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="64" 
                  value={aggressionMatrix.neuralDepth}
                  onChange={(e) => setAggressionMatrix({...aggressionMatrix, neuralDepth: parseInt(e.target.value)})}
                  className="w-full accent-nexus-accent h-1 bg-nexus-dark rounded-full cursor-pointer" 
                />
              </div>
              <button 
                onClick={() => {
                  setIsAutoBotActive(!isAutoBotActive);
                  addAssistantMessage(isAutoBotActive ? "AUTONOMOUS_MODE: DEACTIVATED." : "AUTONOMOUS_MODE: ACTIVE. NEURAL_BOT_ENGAGED.");
                }}
                className={`w-full py-2 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${isAutoBotActive ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-nexus-accent/10 border-nexus-accent/50 text-nexus-accent hover:bg-nexus-accent/20'}`}
              >
                {isAutoBotActive ? "Kill Bot Switch" : "Activate Auto-Bot"}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-nexus-border/50">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Neural Pairs</h3>
            <div className="space-y-1">
              {marketData ? (
                Object.entries(marketData)
                  .filter(([key]) => ['btc', 'eth', 'sol', 'dot', 'link', 'ada', 'xrp'].includes(key))
                  .map(([key, data]) => {
                    const pairData = data as PairState;
                    return (
                      <AssetRow 
                        key={key}
                        label={`${key.toUpperCase()}/USD`} 
                        value={pairData.price.toFixed(key === 'btc' || key === 'eth' ? 2 : 4)} 
                        delta={pairData.delta} 
                        status={pairData.status}
                      />
                    );
                  })
              ) : (
                <p className="text-[10px] text-nexus-muted px-1">AWAITING_SYNC...</p>
              )}
            </div>
          </div>
        </nav>

        <div className="p-6 text-[10px] text-nexus-log font-mono border-t border-nexus-border">
          AUTH_ID: {user?.uid.slice(0, 8) || "GUEST"}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-nexus-border flex items-center justify-between px-8 bg-nexus-surface z-10">
          <div className="flex items-center gap-6">
            <span className="text-nexus-muted font-mono text-sm tracking-tighter">#BUILD_ID_84221</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] border border-emerald-500/20 uppercase font-bold tracking-wider">Stability Passed</span>
            <span className={`px-2 py-0.5 rounded ${marketData?.krakenConnected ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]'} text-[10px] border uppercase font-bold tracking-wider flex items-center gap-1.5`}>
              <Zap className={`w-3 h-3 ${marketData?.krakenConnected ? 'fill-blue-400' : 'fill-amber-500 animate-pulse'}`} />
              {marketData?.krakenConnected ? 'Kraken Live' : 'Kraken Paper Sim'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!user ? (
              <button 
                onClick={handleLogin}
                className="px-4 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-xs font-semibold rounded text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)] active:scale-95"
              >
                CONNECT NEURAL LINK
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                className="px-4 py-1.5 bg-nexus-border hover:bg-white/10 text-xs font-semibold rounded text-nexus-muted transition-all active:scale-95"
              >
                TERMINATE LINK
              </button>
            )}
            <button 
              onClick={handleShare}
              className="px-4 py-1.5 bg-[#334155] hover:bg-[#475569] text-xs font-semibold rounded text-white transition-colors active:scale-95 text-nowrap"
            >
              Share Analysis
            </button>
            <button 
              onClick={handleDiagnostics}
              disabled={isRunningDiagnostics}
              className="px-4 py-1.5 bg-nexus-accent hover:bg-nexus-accent/80 text-xs font-semibold rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-nowrap"
            >
              {isRunningDiagnostics ? 'Scanning...' : 'Re-Run Diagnostics'}
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
          {/* Summary Metrics (Left Column) */}
          <div className="col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
            <section className="bg-nexus-surface border border-nexus-border rounded-lg p-5">
              <h3 className="text-xs font-bold text-nexus-subtle uppercase mb-4 tracking-widest">Quantum Engine Pulse</h3>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-mono text-nexus-accent">{( (marketData?.neuralSentiment || 0) * 100).toFixed(1)}<span className="text-xl text-nexus-log">%</span></div>
                <div className="mb-1 text-xs text-nexus-accent font-mono uppercase tracking-tighter">Neural_Sentiment</div>
              </div>
              <div className="mt-6 space-y-4">
                <MetricCard 
                  label="Quantum Instability" 
                  value={`${((marketData?.quantumInstability || 0) * 100).toFixed(2)}%`}
                  sub="DELTA VARIANCE"
                  progress={(marketData?.quantumInstability || 0) * 100}
                />
                <MetricCard 
                  label="Order Flow Delta" 
                  value={marketData?.activeWhales ? `+${marketData.activeWhales * 1.5}M` : "0.0M"}
                  sub="NET ACCUMULATION"
                  progress={72}
                />
              </div>
            </section>

            <section className="bg-nexus-surface border border-nexus-border rounded-lg p-5 flex-1 overflow-y-auto">
              <h3 className="text-xs font-bold text-nexus-subtle uppercase mb-4 tracking-widest">Neural Signals</h3>
              <div className="space-y-4">
                {marketData?.activeSignals?.map((signal: any) => (
                  <SignalItem 
                    key={signal.id}
                    title={signal.title}
                    desc={signal.desc}
                    variant={signal.variant}
                    time={signal.time}
                    onClick={() => executeTradeSimulation(`${signal.title.split('_')[0]}/USDT`, Math.random() > 0.5 ? "LONG" : "SHORT")}
                  />
                ))}
                {!marketData?.activeSignals?.length && (
                  <p className="text-[10px] text-nexus-muted font-mono italic">SCANNINING_FOR_OPPORTUNITIES...</p>
                )}
              </div>
            </section>
          </div>

          {/* Detailed Telemetry / Chat (Right Column) */}
          <div className="col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative">
            <div className="px-5 py-4 border-b border-nexus-border flex justify-between items-center bg-nexus-surface/50">
              <h3 className="text-xs font-bold text-nexus-subtle uppercase tracking-widest">{activeModule.replace(' ', '_')}</h3>
              <div className="flex gap-4 text-[10px] text-nexus-muted font-mono">
                <span>FILTER: ALL</span>
                <span className="hover:text-nexus-accent cursor-pointer transition-colors" onClick={() => addAssistantMessage("EXPORTING_SYSTEM_DATA_OBJECT...")}>EXPORT_LOG</span>
              </div>
            </div>
            
            {/* Message History */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth font-mono text-[11px]"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] group relative ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                      <div className={`
                        px-3 py-2 rounded border leading-relaxed
                        ${msg.role === 'user' 
                          ? 'bg-nexus-accent/10 border-nexus-accent/30 text-white' 
                          : 'bg-nexus-dark/50 border-nexus-border text-zinc-300'}
                      `}>
                        <span className={`mr-2 uppercase font-bold ${msg.role === 'user' ? 'text-nexus-accent' : 'text-nexus-subtle'}`}>
                          [{msg.role === 'user' ? 'USER' : 'GATEWAY'}]
                        </span>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isProcessing && (
                <div className="flex justify-start opacity-70">
                  <span className="animate-pulse">[GATEWAY] PROCESSING_NEURAL_REQUEST...</span>
                </div>
              )}
            </div>

            {/* Input Area (Pinned to bottom of this column) */}
            <div className="p-4 border-t border-nexus-border bg-nexus-dark/30">
              <form onSubmit={handleSubmit} className="relative group">
                <div className="relative bg-nexus-dark border border-nexus-border rounded flex items-center px-3 gap-2 focus-within:border-nexus-accent/50 transition-colors">
                  <span className="text-nexus-subtle text-xs pr-1 border-r border-nexus-border">$</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="ENTER COMMAND..."
                    className="flex-1 py-3 bg-transparent outline-none text-[11px] font-mono placeholder:text-nexus-log uppercase"
                  />
                  <button 
                    type="submit"
                    disabled={isProcessing || !input.trim()}
                    className="p-1.5 text-nexus-muted hover:text-nexus-accent transition-all disabled:opacity-30"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <footer className="h-8 bg-nexus-dark border-t border-nexus-border px-4 flex items-center justify-between text-[10px] text-nexus-log font-mono">
          <div className="flex gap-6 uppercase">
            <span className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${isRunningDiagnostics ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div> NODE_ENV: PRODUCTION</span>
            <span>CPU: 42%</span>
            <span>RAM: 4.1GB / 16GB</span>
            <span className="hidden sm:inline">LATENCY: 24MS</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 hover:text-white cursor-help transition-colors" onClick={() => addAssistantMessage("LINK_SECURITY: 512-BIT QUANTUM ENCRYPTION ACTIVE.")}><Shield className="w-3 h-3" /> SECURE_LINK</span>
            <span>LOC: US-EAST-1</span>
          </div>
        </footer>
      </main>

      {/* Stats Overlay (Right) */}
      <aside className="w-80 border-l border-nexus-border p-6 hardware-card hidden lg:block overflow-y-auto">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-6">Neural Telemetry</h3>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-mono text-nexus-log uppercase mb-3">Live Orders</h4>
            <div className="space-y-2">
              {trades.length === 0 ? (
                <p className="text-[10px] text-nexus-muted font-mono italic">No active operations...</p>
              ) : (
                trades.map((trade, idx) => (
                  <TradeRow 
                    key={trade.id || idx} 
                    trade={trade} 
                    currentPrice={marketData ? (marketData as any)[trade.symbol.split('/')[0].toLowerCase()]?.price : null}
                    onClose={() => trade.id && closePosition(trade.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-nexus-border">
            <h4 className="text-[10px] font-mono text-nexus-log uppercase mb-4">Sentiment Map</h4>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-[2px] transition-colors duration-500`}
                  style={{ 
                    backgroundColor: Math.random() > 0.7 ? '#3B82F6' : (Math.random() > 0.4 ? '#1E293B' : '#0F172A'),
                    opacity: 0.3 + Math.random() * 0.7
                  }}
                />
              ))}
            </div>
            <p className="mt-2 text-[9px] text-nexus-muted font-mono text-center">CROSS-EXCHANGE FLOW VARIANCE</p>
          </div>

          <div className="pt-6 border-t border-nexus-border">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-4">Neural Logs</h3>
            <div className="space-y-3 font-mono text-[10px] text-nexus-log">
              <LogEntry time={new Date().toLocaleTimeString()} msg="Handshake verified" />
              <LogEntry time={new Date().toLocaleTimeString()} msg="Sentiment aggregator linked" />
              <LogEntry time={new Date().toLocaleTimeString()} msg="Whale observer active (14 units)" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`
      px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3
      ${active ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30' : 'text-nexus-muted hover:bg-nexus-border hover:text-white'}
    `}>
      {icon}
      {label}
    </div>
  );
}

function SignalItem({ title, desc, variant, time, onClick }: { title: string, desc: string, variant: 'emerald' | 'amber' | 'red', time: string, onClick?: () => void, key?: any }) {
  const colors = {
    emerald: 'border-emerald-500/50 text-emerald-500',
    amber: 'border-amber-500/50 text-amber-500',
    red: 'border-red-500/50 text-red-500'
  };
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 bg-nexus-surface border-l-2 ${colors[variant]} rounded relative group hover:bg-nexus-border/20 transition-all cursor-crosshair active:scale-95`}
    >
      <div className="flex justify-between items-start">
        <div className="text-[10px] font-bold uppercase tracking-wider">{title}</div>
        <div className="text-[9px] font-mono text-nexus-log">{time}</div>
      </div>
      <p className="text-[11px] mt-1.5 leading-relaxed text-nexus-muted font-mono">{desc}</p>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold text-white bg-white/10 px-1 rounded">EXEC_TRADE</div>
    </div>
  );
}


function AssetRow({ label, value, delta, status }: { label: string, value: string, delta: number, status?: string, key?: any }) {
  const statusColors: any = {
    bullish: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    bearish: 'bg-red-500/20 text-red-500 border-red-500/30',
    volatile: 'bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    neutral: 'bg-zinc-500/10 text-nexus-muted border-transparent'
  };

  return (
    <div className={`flex justify-between items-center group cursor-pointer hover:bg-white/5 py-1.5 px-2 rounded-md transition-all border ${status ? statusColors[status] : 'text-nexus-muted'}`}>
      <div className="flex flex-col">
        <span className="text-[10px] font-mono font-bold tracking-tighter">{label}</span>
        <span className="text-[8px] uppercase opacity-60 font-mono">{status || 'SYNCING'}</span>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-mono font-bold">${value}</p>
        <p className={`text-[9px] font-mono flex items-center justify-end gap-1 ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {delta >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
          {delta}%
        </p>
      </div>
    </div>
  );
}

function TradeRow({ trade, currentPrice, onClose }: { trade: Trade; currentPrice: number | null; onClose?: () => void, key?: any }) {
  const livePnl = currentPrice 
    ? (trade.type === 'LONG' 
        ? ((currentPrice - trade.price) / trade.price) * 100 
        : ((trade.price - currentPrice) / trade.price) * 100)
    : 0;

  return (
    <div className="text-[10px] bg-nexus-dark/50 border border-nexus-border rounded-lg p-3 font-mono hover:border-nexus-accent/50 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold flex items-center gap-2">
            <span className={`px-1 rounded-[2px] ${trade.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {trade.type}
            </span>
            <span className="text-white">{trade.symbol}</span>
          </p>
          <p className="text-nexus-log opacity-70 mt-0.5">Entry: ${trade.price.toFixed(trade.price > 1000 ? 2 : 4)}</p>
        </div>
        <div className="text-right">
          <p className={`text-[12px] font-bold ${livePnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {livePnl >= 0 ? '+' : ''}{livePnl.toFixed(2)}%
          </p>
          <p className="text-[9px] text-nexus-log flex items-center gap-1 justify-end">
            <Activity className="w-2 h-2 animate-pulse" />
            LIVE_PNL
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-nexus-border/30">
        <span className="text-[9px] text-nexus-muted">QTY: {trade.quantity}</span>
        <button 
          onClick={onClose}
          className="text-[8px] uppercase bg-nexus-border hover:bg-red-500/20 hover:text-red-500 px-1.5 py-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
        >
          Close Pos
        </button>
      </div>
    </div>
  );
}

function InputAction({ label }: { label: string }) {
  return (
    <button className="text-[9px] uppercase tracking-widest text-nexus-muted hover:text-nexus-accent transition-colors flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-nexus-muted group-hover:bg-nexus-accent" />
      {label}
    </button>
  );
}

function MetricCard({ label, value, sub, progress }: { label: string, value: string, sub: string, progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-nexus-muted uppercase tracking-tight">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <p className="text-[10px] text-nexus-muted font-mono">{sub}</p>
      </div>
      <div className="h-1 bg-nexus-border rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-nexus-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
        />
      </div>
    </div>
  );
}

function LogEntry({ time, msg }: { time: string, msg: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-nexus-accent/60 opacity-60">[{time}]</span>
      <span className="truncate">{msg}</span>
    </div>
  );
}
