import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNervous } from "../../nervous-system/NervousCore";

export function RiskShield() {
  const { marketData, addAssistantMessage } = useNervous();
  const [protocols, setProtocols] = useState({
    encrypted: true,
    flash: true,
    mev: true,
    slippage: false
  });

  const toggleProtocol = (key: keyof typeof protocols, label: string) => {
    const newState = !protocols[key];
    setProtocols(prev => ({ ...prev, [key]: newState }));
    addAssistantMessage(`RISK_SHIELD: ${label.toUpperCase()} ${newState ? 'ENGAGED' : 'DISENGAGED'}.`);
  };

  return (
    <div className="col-span-full lg:col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative p-8">
      <div className="flex justify-between items-start mb-12">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-nexus-accent/20 border border-nexus-accent/40 rounded flex items-center justify-center">
            <Shield className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-1">Risk Shield Protocol</h2>
            <p className="text-xs text-nexus-muted font-mono uppercase">SYSTEM_STABILITY: MAXIMUM</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Protection Core
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8">
         <div className="space-y-6">
           <SecurityOpt label="Encrypted Tunnels" active={protocols.encrypted} onClick={() => toggleProtocol('encrypted', 'Encrypted Tunnels')} />
           <SecurityOpt label="Flash Loan Protection" active={protocols.flash} onClick={() => toggleProtocol('flash', 'Flash Loan Protection')} />
           <SecurityOpt label="MEV Frontrun Guard" active={protocols.mev} onClick={() => toggleProtocol('mev', 'MEV Frontrun Guard')} />
           <SecurityOpt label="Adaptive Slippage Control" active={protocols.slippage} onClick={() => toggleProtocol('slippage', 'Adaptive Slippage Control')} />
         </div>

         <div className="bg-nexus-dark rounded-lg p-6 border border-nexus-border flex flex-col justify-center gap-6">
            <div className="text-center space-y-2">
              <p className="text-[10px] text-nexus-muted uppercase tracking-widest">Quantum Instability</p>
              <p className="text-4xl font-mono text-white font-bold">{((marketData?.quantumInstability || 0) * 100).toFixed(2)}%</p>
            </div>
            <div className="h-2 bg-nexus-border rounded-full overflow-hidden">
               <div 
                 className="h-full bg-nexus-accent shadow-[0_0_10px_#4ade80]" 
                 style={{ width: `${(marketData?.quantumInstability || 0) * 100}%` }}
               />
            </div>
            <p className="text-[9px] text-nexus-log font-mono text-center uppercase">
              Current instability is within safe operational parameters.
            </p>
         </div>
      </div>

      <div className="mt-8 border-t border-nexus-border pt-8 grid grid-cols-4 gap-4">
        <ShieldWidget icon={<Lock className="w-4 h-4" />} label="Auth" value="Verified" />
        <ShieldWidget icon={<Eye className="w-4 h-4" />} label="IDS" value="Monitoring" />
        <ShieldWidget icon={<AlertTriangle className="w-4 h-4" />} label="Threats" value="0 Detected" />
        <ShieldWidget icon={<Shield className="w-4 h-4" />} label="Shield" value="Alpha" />
      </div>
    </div>
  );
}

function SecurityOpt({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex justify-between items-center p-4 bg-nexus-dark/50 border border-nexus-border rounded group hover:border-nexus-accent/50 transition-all cursor-pointer"
    >
      <span className="text-xs font-bold uppercase tracking-widest text-nexus-subtle group-hover:text-white">{label}</span>
      <div className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-nexus-border'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

function ShieldWidget({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-nexus-dark/30 rounded border border-nexus-border">
      <div className="text-nexus-muted">{icon}</div>
      <p className="text-[9px] uppercase text-nexus-muted font-bold tracking-tighter">{label}</p>
      <p className="text-[10px] font-mono text-white">{value}</p>
    </div>
  );
}
