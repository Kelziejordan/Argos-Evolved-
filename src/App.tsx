/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { NervousProvider, useNervous } from "./nervous-system/NervousCore";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { StatusBar } from "./components/layout/StatusBar";
import { TerminalCore } from "./components/terminal/Terminal";
import { MarketPulse } from "./components/telemetry/MarketPulse";
import { TelemetryOverlay } from "./components/telemetry/TelemetryOverlay";
import { GlobalLiquidity } from "./components/telemetry/GlobalLiquidity";
import { VolatilityModule } from "./components/telemetry/VolatilityModule";
import { OrderFlow } from "./components/telemetry/OrderFlow";
import { LiquidationMap } from "./components/telemetry/LiquidationMap";
import { ImmuneDashboard } from "./components/telemetry/ImmuneDashboard";

function OrganismShell() {
  const [activeModule, setActiveModule] = useState("Command Hall");
  const { isRunningDiagnostics, marketData, addAssistantMessage } = useNervous();

  const handleShare = () => {
    const reportText = `HYPERBOT Analysis: BTC at $${marketData?.btc.price.toFixed(2)}, Neural Sentiment: ${(marketData?.neuralSentiment || 0 * 100).toFixed(1)}%. Stability Passed.`;
    navigator.clipboard.writeText(reportText).then(() => {
      addAssistantMessage("ANALYSIS_LOG_COPIED_TO_CLIPBOARD. READY FOR EXTERNAL DISTRIBUTION.");
    });
  };

  const handleSetModule = (module: string) => {
    setActiveModule(module);
    addAssistantMessage(`INITIALIZING_${module.replace(' ', '_').toUpperCase()}_SUBSYSTEM...`);
  };

  return (
    <div className={`flex h-screen bg-nexus-bg text-white overflow-hidden selection:bg-nexus-accent/30 transition-all duration-1000 ${isRunningDiagnostics ? 'animate-pulse opacity-90' : ''}`}>
      <Sidebar activeModule={activeModule} setActiveModule={handleSetModule} />
      
      <main className="flex-1 flex flex-col relative">
        <Header onShare={handleShare} />

        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
          <MarketPulse />
          
          {activeModule === "Command Hall" && <TerminalCore activeModule={activeModule} />}
          {activeModule === "Nervous System" && <TerminalCore activeModule={activeModule} />}
          {activeModule === "Global Liquidity" && <GlobalLiquidity />}
          {activeModule === "Volatility Index" && <VolatilityModule />}
          {activeModule === "Order Flow" && <OrderFlow />}
          {activeModule === "Liquidation Map" && <LiquidationMap />}
          {activeModule === "Immune System" && <ImmuneDashboard />}
        </div>

        <StatusBar />
      </main>

      <TelemetryOverlay />
    </div>
  );
}

export default function App() {
  return (
    <NervousProvider>
      <OrganismShell />
    </NervousProvider>
  );
}
