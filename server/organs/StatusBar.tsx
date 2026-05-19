
import { Shield } from "lucide-react";
import { useNervous } from "../../nervous-system/NervousCore";

export function StatusBar() {
  const { isRunningDiagnostics, addAssistantMessage } = useNervous();

  return (
    <footer id="app-status-bar" className="h-8 bg-nexus-dark border-t border-nexus-border px-4 flex items-center justify-between text-[10px] text-nexus-log font-mono">
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
  );
}
