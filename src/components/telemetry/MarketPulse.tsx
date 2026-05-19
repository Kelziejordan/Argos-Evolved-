
import React from "react";
import { MetricCard } from "../ui/MetricCard";
import { SignalItem } from "../ui/SignalItem";
import { useNervous } from "../../nervous-system/NervousCore";

export function MarketPulse() {
  const { marketData, executeTrade } = useNervous();

  return (
    <div className="col-span-full lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
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

      <section id="neural-signals-section" className="bg-nexus-surface border border-nexus-border rounded-lg p-5 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-nexus-subtle uppercase mb-4 tracking-widest">Neural Signals</h3>
        <div className="space-y-4">
          {marketData?.activeSignals?.map((signal) => (
            <SignalItem 
              key={signal.id}
              title={signal.title}
              desc={signal.desc}
              variant={signal.variant}
              time={signal.time}
              onClick={() => executeTrade(`${signal.title.split('_')[0]}/USDT`, Math.random() > 0.5 ? "LONG" : "SHORT")}
            />
          ))}
          {!marketData?.activeSignals?.length && (
            <p className="text-[10px] text-nexus-muted font-mono italic">SCANNINING_FOR_OPPORTUNITIES...</p>
          )}
        </div>
      </section>
    </div>
  );
}
