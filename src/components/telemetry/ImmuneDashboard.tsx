import { Shield, Lock, Activity, AlertTriangle, Cpu, ShieldAlert, Database, Hexagon, Power } from "lucide-react";
import React, { ReactNode } from "react";
import { useNervous, db } from "../../nervous-system/NervousCore";

export function ImmuneDashboard() {
  const { marketData, events, sendCommand, addAssistantMessage } = useNervous();
  
  const status = marketData?.systemStatus || 'NOMINAL';
  const killSwitch = marketData?.killSwitchActive;
  const instability = marketData?.quantumInstability || 0;

  const immuneEvents = events.filter(e => 
    ['SYSTEM_ALERT', 'STATE_TRANSITION', 'KILL_SWITCH_TRIGGERED', 'HEARTBEAT_STALLED', 'HEARTBEAT_RESUMED'].includes(e.type)
  ).slice(0, 10);

  const statusConfig = {
    NOMINAL: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    CAUTION: { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
    HALTED: { color: 'text-red-500 animate-pulse', bg: 'bg-red-500/20 border-red-500/50' },
    COOLDOWN: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
  };
  const activeStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.NOMINAL;

  const handleManualKill = () => {
    addAssistantMessage("DISPATCHING_MANUAL_HALT_OVERRIDE...");
    // Assuming command endpoint supports this, which we'd add if true backend
    sendCommand("KILL_SWITCH", { reason: "MANUAL_OPERATOR_OVERRIDE" });
  };

  return (
    <div className="col-span-full bg-nexus-surface border border-nexus-border rounded-lg flex flex-col p-6 h-full gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-nexus-dark border border-nexus-border rounded flex items-center justify-center">
            {killSwitch ? <ShieldAlert className="w-6 h-6 text-red-500" /> : <Shield className="w-6 h-6 text-nexus-accent" />}
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-1">Immune Architecture</h2>
            <p className="text-xs text-nexus-muted font-mono uppercase tracking-widest">
              State Engine & Replay Verification
            </p>
          </div>
        </div>
        
        <div className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-2 ${activeStatus.bg} ${activeStatus.color}`}>
          <div className={`w-2 h-2 rounded-full ${status === 'HALTED' ? 'bg-red-500' : 'bg-current shadow-[0_0_8px_currentColor]'} ${status !== 'HALTED' ? 'animate-pulse' : ''}`} />
          STATUS: {status}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Core Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-nexus-dark p-6 rounded border border-nexus-border space-y-6">
             <div className="text-center space-y-2">
               <p className="text-[10px] text-nexus-muted uppercase tracking-widest">System Instability</p>
               <p className="text-4xl font-mono text-white font-bold">{(instability * 100).toFixed(2)}%</p>
             </div>
             <div className="h-2 bg-black border border-nexus-border rounded-full overflow-hidden">
                <div 
                  className={`h-full shadow-[0_0_10px_currentColor] transition-all duration-1000 ${instability > 0.7 ? 'bg-red-500 text-red-500' : instability > 0.4 ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'}`} 
                  style={{ width: `${instability * 100}%` }}
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <MetricBox label="Mutation Lock" value={killSwitch ? "SECURED" : "ACTIVE"} icon={<Lock className="w-4 h-4" />} alert={killSwitch} />
             <MetricBox label="Temporal DB" value="SYNCED" icon={<Database className="w-4 h-4" />} />
             <div onClick={() => {
                addAssistantMessage("DISPATCHING_REPLAY_VALIDATION_SEQUENCE...");
                sendCommand("REPLAY_STATE");
             }} className="cursor-pointer hover:border-nexus-accent/50 transition-all">
               <MetricBox label="Replay Node" value="TRIGGER" icon={<Hexagon className="w-4 h-4" />} />
             </div>
             <MetricBox label="Heartbeat" value="NOMINAL" icon={<Activity className="w-4 h-4" />} />
          </div>

          <button 
            onClick={handleManualKill}
            disabled={killSwitch}
            className={`w-full py-3 rounded text-xs font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${killSwitch ? 'bg-nexus-dark text-nexus-muted border-nexus-border cursor-not-allowed' : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'}`}
          >
            <Power className="w-4 h-4" />
            {killSwitch ? "SYSTEM HALTED" : "MANUAL KILL SWITCH"}
          </button>
        </div>

        {/* Right Col: Event Lineage Log */}
        <div className="lg:col-span-8 bg-nexus-dark border border-nexus-border rounded flex flex-col">
          <div className="p-3 border-b border-nexus-border bg-black/40">
             <h3 className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest flex items-center gap-2">
               <Activity className="w-3 h-3" /> Immutable Audit Lineage
             </h3>
          </div>
          
          <div className="px-4 py-2 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
             {immuneEvents.map((evt, idx) => (
                <div key={idx} className="flex gap-4 items-start border-l-2 border-nexus-border pl-3 font-mono text-[10px]">
                   <span className="text-nexus-subtle w-24 shrink-0">
                     {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}
                   </span>
                   
                   <div>
                     <span className={`px-1.5 py-0.5 rounded mr-2 ${
                       evt.type === 'SYSTEM_ALERT' ? 'bg-amber-500/10 text-amber-500' : 
                       evt.type === 'STATE_TRANSITION' ? 'bg-blue-500/10 text-blue-400' :
                       evt.type === 'HEARTBEAT_STALLED' || evt.type === 'KILL_SWITCH_TRIGGERED' ? 'bg-red-500/10 text-red-500' :
                       'bg-emerald-500/10 text-emerald-500'
                     }`}>
                       {evt.type}
                     </span>
                     
                     <span className="text-nexus-muted mt-1 inline-block">
                       {evt.type === 'STATE_TRANSITION' 
                         ? `${evt.data.from} -> ${evt.data.to} ${evt.data.reason ? `(${evt.data.reason})` : ''}` 
                         : evt.data.message || JSON.stringify(evt.data)}
                     </span>
                     
                     <div className="text-[9px] text-[#4a5568] mt-1 space-x-2">
                       {evt.correlationId && <span>CORR: {evt.correlationId}</span>}
                       {evt.causationId && <span>CAUSE: {evt.causationId}</span>}
                     </div>
                   </div>
                </div>
             ))}
             {immuneEvents.length === 0 && <p className="text-[10px] text-nexus-muted italic mt-4 text-center">No recent causal activity...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon, alert }: { label: string, value: string, icon: ReactNode, alert?: boolean }) {
  return (
    <div className={`p-4 border rounded flex flex-col gap-2 ${alert ? 'bg-red-500/10 border-red-500/30' : 'bg-nexus-dark/50 border-nexus-border'}`}>
       <div className={`flex items-center gap-2 ${alert ? 'text-red-500' : 'text-nexus-muted'}`}>
         {icon}
         <span className="text-[9px] uppercase tracking-widest font-bold">{label}</span>
       </div>
       <div className={`font-mono text-xs ${alert ? 'text-red-400 font-bold' : 'text-white'}`}>
         {value}
       </div>
    </div>
  );
}
