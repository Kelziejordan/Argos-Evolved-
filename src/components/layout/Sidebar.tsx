
import React, { ReactNode } from "react";
import { Terminal, Globe, Activity, BarChart3, Flame, Shield } from "lucide-react";
import { useNervous } from "../../nervous-system/NervousCore";
import { AssetRow } from "../ui/AssetRow";
import { PairState } from "../../anatomy/types";

export function Sidebar({ activeModule, setActiveModule }: { activeModule: string, setActiveModule: (s: string) => void }) {
  const { marketData, user, aggressionMatrix, setAggressionMatrix, isAutoBotActive, setIsAutoBotActive, addAssistantMessage } = useNervous();

  return (
    <aside className="w-64 border-r border-nexus-border flex flex-col bg-nexus-surface hidden md:flex">
      <div className="p-6 border-b border-nexus-border bg-nexus-surface">
        <h1 className="text-xs font-bold uppercase tracking-widest text-nexus-accent">HYPERBOT v2.0</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span className="text-sm font-medium">Neural Core Link</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        <SidebarGroup title="Main Core">
          <SidebarItem id="command-hall-nav" icon={<Terminal className="w-4 h-4" />} label="Command Hall" active={activeModule === "Command Hall"} onClick={() => setActiveModule("Command Hall")} />
          <SidebarItem id="global-liquidity-nav" icon={<Globe className="w-4 h-4" />} label="Global Liquidity" active={activeModule === "Global Liquidity"} onClick={() => setActiveModule("Global Liquidity")} />
          <SidebarItem id="volatility-index-nav" icon={<Activity className="w-4 h-4" />} label="Volatility Index" active={activeModule === "Volatility Index"} onClick={() => setActiveModule("Volatility Index")} />
        </SidebarGroup>

        <SidebarGroup title="Trading Engine">
          <SidebarItem icon={<BarChart3 className="w-4 h-4" />} label="Order Flow" active={activeModule === "Order Flow"} onClick={() => setActiveModule("Order Flow")} />
          <SidebarItem icon={<Flame className="w-4 h-4" />} label="Liquidation Map" active={activeModule === "Liquidation Map"} onClick={() => setActiveModule("Liquidation Map")} />
          <SidebarItem 
            id="risk-shield-nav"
            icon={<Shield className="w-4 h-4" />} 
            label="Risk Shield" 
            active={activeModule === "Risk Shield"} 
            onClick={() => setActiveModule("Risk Shield")} 
            className="border-[#8fa2bc]"
          />
        </SidebarGroup>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Neural Settings</h3>
          <div className="px-1 space-y-4 pt-1">
            <MetricSlider label="Risk Aggression" value={aggressionMatrix.risk} unit="%" onChange={(v) => setAggressionMatrix({...aggressionMatrix, risk: v})} />
            <MetricSlider label="Neural Depth" value={aggressionMatrix.neuralDepth} unit="layers" min={1} max={64} onChange={(v) => setAggressionMatrix({...aggressionMatrix, neuralDepth: v})} />
            
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
                      onClick={() => addAssistantMessage(`FOCUSED_NEURAL_SIGHT: ${key.toUpperCase()}/USD. MONITORING_DRIFT...`)}
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
  );
}

function SidebarGroup({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, id, className = "" }: { icon: ReactNode, label: string, active: boolean, onClick: () => void, id?: string, className?: string }) {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 ${active ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30' : 'text-nexus-muted hover:bg-nexus-border hover:text-white'} ${className}`}
    >
      {icon}
      {label}
    </div>
  );
}

function MetricSlider({ label, value, unit, min = 0, max = 100, onChange }: { label: string, value: number, unit: string, min?: number, max?: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5 text-[9px] uppercase tracking-wider text-nexus-log font-mono">
      <div className="flex justify-between">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-nexus-accent h-1 bg-nexus-dark rounded-full cursor-pointer" 
      />
    </div>
  );
}
