
import { useRef, useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Activity } from "lucide-react";
import { useNervous } from "../../nervous-system/NervousCore";

function EventStream() {
  const { events } = useNervous();

  return (
    <div className="space-y-2">
      <div className="text-nexus-accent font-bold mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" /> LIVE_SPINAL_CORD_STREAM
      </div>
      {events.map((event, idx) => (
        <motion.div 
          key={event.eventId || idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-l-2 border-nexus-accent/30 pl-3 py-1 bg-nexus-dark/30 rounded-r"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-nexus-subtle uppercase">{event.type}</span>
            <span className="text-[9px] text-nexus-muted line-clamp-1 opacity-50">{new Date(event.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="text-[10px] text-nexus-log break-all line-clamp-2">
            SOURCE: <span className="text-white">{event.source}</span> | DATA: {JSON.stringify(event.data)}
          </div>
          {event.correlationId && (
            <div className="text-[8px] text-nexus-muted mt-1 opacity-40">
              CORR_ID: {event.correlationId}
            </div>
          )}
        </motion.div>
      )).reverse()}
      {events.length === 0 && (
        <div className="text-center py-10 text-nexus-muted animate-pulse">
           AWAITING_NEURAL_ACTIVITY...
        </div>
      )}
    </div>
  );
}

export function TerminalCore({ activeModule }: { activeModule: string }) {
  const { messages, sendMessage, isProcessing, addAssistantMessage } = useNervous();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div id="terminal-core" className="col-span-full lg:col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative">
      {useNervous().marketData?.systemStatus === 'HALTED' && (
        <div className="bg-red-500/20 border-b border-red-500/50 py-1.5 text-[10px] text-center text-red-500 font-bold uppercase tracking-widest animate-pulse">
           CRITICAL_SYSTEM_HALT: RISK_PARAMETERS_EXCEEDED
        </div>
      )}
      {useNervous().marketData?.systemStatus === 'CAUTION' && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 py-1.5 text-[10px] text-center text-amber-500 font-bold uppercase tracking-widest">
           SYSTEM_CAUTION: ELEVATED_INSTABILITY
        </div>
      )}
      <div className="px-5 py-4 border-b border-nexus-border flex justify-between items-center bg-nexus-surface/50">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-nexus-subtle uppercase tracking-widest">{activeModule.replace(' ', '_')}</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-nexus-dark border border-nexus-border text-nexus-muted">v1.1.0</span>
          <span className={`w-2 h-2 rounded-full ${useNervous().marketData?.systemStatus === 'HALTED' ? 'bg-red-500 animate-pulse' : useNervous().marketData?.systemStatus === 'CAUTION' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        </div>
        <div className="flex gap-4 text-[10px] text-nexus-muted font-mono">
          <span>FILTER: ALL</span>
          <span className="hover:text-nexus-accent cursor-pointer transition-colors" onClick={() => addAssistantMessage("EXPORTING_SYSTEM_DATA_OBJECT...")}>EXPORT_LOG</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth font-mono text-[11px]"
      >
        {activeModule === "Nervous System" ? (
          <EventStream />
        ) : (
          <>
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
          </>
        )}
      </div>

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
  );
}
