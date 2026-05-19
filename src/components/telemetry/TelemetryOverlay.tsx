
import { Shield } from "lucide-react";
import { useNervous } from "../../nervous-system/NervousCore";
import { TradeRow } from "../ui/TradeRow";

export function TelemetryOverlay() {
  const { trades, marketData, closePosition, addAssistantMessage } = useNervous();

  return (
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
