
import { Activity } from "lucide-react";
import { Trade } from "../../anatomy/types";

export function TradeRow({ trade, currentPrice, onClose }: { trade: Trade; currentPrice: number | null; onClose?: () => void, key?: any }) {
  const livePnl = currentPrice 
    ? (trade.type === 'LONG' 
        ? ((currentPrice - trade.price) / trade.price) * 100 
        : ((trade.price - currentPrice) / trade.price) * 100)
    : 0;

  return (
    <div id={`trade-${trade.id}`} className="text-[10px] bg-nexus-dark/50 border border-nexus-border rounded-lg p-3 font-mono hover:border-nexus-accent/50 transition-colors group">
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
