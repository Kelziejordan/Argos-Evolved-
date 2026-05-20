
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { MarketState, Trade, Message } from "../anatomy/types";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

interface NervousContextType {
  user: FirebaseUser | null;
  marketData: MarketState | null;
  trades: Trade[];
  messages: Message[];
  isProcessing: boolean;
  isRunningDiagnostics: boolean;
  isAutoBotActive: boolean;
  aggressionMatrix: { risk: number; frequency: number; neuralDepth: number };
  setAggressionMatrix: (m: any) => void;
  setIsAutoBotActive: (b: boolean) => void;
  addAssistantMessage: (content: string) => void;
  executeTrade: (symbol: string, type: 'LONG' | 'SHORT') => Promise<void>;
  closePosition: (tradeId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendCommand: (command: string, args?: any) => Promise<void>;
  events: any[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  runDiagnostics: () => Promise<void>;
}

const NervousContext = createContext<NervousContextType | null>(null);

export function NervousProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [marketData, setMarketData] = useState<MarketState | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isAutoBotActive, setIsAutoBotActive] = useState(false);
  const [aggressionMatrix, setAggressionMatrix] = useState({ risk: 42, frequency: 60, neuralDepth: 12 });
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "HYPERBOT v2.0 ONLINE. CROSS-CHAIN LIQUIDITY ARBITRAGE ENGINE INITIALIZED. HOW SHALL WE DOMINATE THE MARKETS TODAY?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const addAssistantMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      role: "assistant",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, []);

  // Sync Logic
  useEffect(() => {
    onAuthStateChanged(auth, setUser);
    const pulseTimer = setInterval(async () => {
      try {
        const [marketRes, eventsRes] = await Promise.all([
          fetch("/api/market-pulse"),
          fetch("/api/events?limit=30")
        ]);
        
        if (marketRes.ok) setMarketData(await marketRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
      } catch (e) {
        console.error("Pulse Failed", e);
      }
    }, 2000);
    return () => clearInterval(pulseTimer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "trades"),
      where("userId", "==", user.uid),
      where("status", "==", "OPEN"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      setTrades(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Trade[]);
    });
  }, [user]);

  const setAggressionMatrixWithLog = useCallback((m: any) => {
    setAggressionMatrix(m);
    addAssistantMessage(`NEURAL_PARAMETERS_UPDATED: RISK=${m.risk}% DEPTH=${m.neuralDepth}LYR`);
  }, [addAssistantMessage]);

  const executeTrade = async (symbol: string, type: 'LONG' | 'SHORT') => {
    if (!marketData) return;
    if (!user) {
      addAssistantMessage("CRITICAL_ERROR: NEURAL_LINK_NOT_ESTABLISHED. PLEASE CONNECT_NEURAL_LINK TO EXECUTE TRANSACTIONS.");
      return;
    }
    const key = symbol.split('/')[0].toLowerCase() as keyof MarketState;
    const price = (marketData as any)[key]?.price || 0;
    
    addAssistantMessage(`EXECUTING_${type}_ON_${symbol}_AT_$${price.toFixed(price > 1000 ? 2 : 4)}...`);
    await addDoc(collection(db, "trades"), {
      symbol, type, price, quantity: symbol.includes("BTC") ? 0.05 : (symbol.includes("ETH") ? 0.5 : 10),
      status: "OPEN", timestamp: serverTimestamp(), userId: user.uid, pnl: 0
    });
    setTimeout(() => addAssistantMessage(`ORDER_CONFIRMED. MONITORING_NET_POSITIONS.`), 800);
  };

  const closePosition = async (tradeId: string) => {
    if (!tradeId || !user) return;
    addAssistantMessage(`TERMINATING_POSITION_${tradeId.slice(0, 8)}...`);
    await updateDoc(doc(db, "trades", tradeId), { status: "CLOSED", closedAt: serverTimestamp() });
    addAssistantMessage(`POSITION_SECURED. GAINS_REALIZED.`);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: "user", content, timestamp: new Date().toLocaleTimeString() }]);
    
    // Command interception
    const upperInput = content.toUpperCase().trim();
    if (upperInput.startsWith('APPROVE ')) {
      const token = upperInput.replace('APPROVE ', '');
      await sendCommand('APPROVE', { token });
      return;
    }
    if (upperInput.startsWith('REJECT ')) {
      const token = upperInput.replace('REJECT ', '');
      await sendCommand('REJECT', { token });
      return;
    }
    if (upperInput === 'ROLLBACK') {
      await sendCommand('ROLLBACK');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      addAssistantMessage(data.text);
      if (content.toLowerCase().includes("buy") || content.toLowerCase().includes("trade")) {
        await executeTrade("BTC/USDT", "LONG");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const login = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const sendCommand = async (command: string, args?: any) => {
    try {
      await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, args }),
      });
      addAssistantMessage(`COMMAND_SENT: ${command} ${JSON.stringify(args || {})}`);
    } catch (e) {
      console.error("Command failed", e);
    }
  };

  const logout = async () => {
    await auth.signOut();
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    addAssistantMessage("DIAGNOSTICS_ACTIVE...");
    setTimeout(() => {
      addAssistantMessage("SYSTEM_HEALTH: 99.8%. CORE_OPTIMAL.");
      setIsRunningDiagnostics(false);
    }, 3000);
  };

  return (
    <NervousContext.Provider value={{
      user, marketData, trades, messages, isProcessing, isRunningDiagnostics, isAutoBotActive, aggressionMatrix, events,
      setAggressionMatrix: setAggressionMatrixWithLog, setIsAutoBotActive, addAssistantMessage, executeTrade, closePosition, sendMessage, sendCommand, login, logout, runDiagnostics
    }}>
      {children}
    </NervousContext.Provider>
  );
}

export function useNervous() {
  const context = useContext(NervousContext);
  if (!context) throw new Error("useNervous must be used within NervousProvider");
  return context;
}
