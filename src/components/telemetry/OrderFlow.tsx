import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Order {
  id: string;
  symbol: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  time: string;
}

export function OrderFlow() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const symbols = ['BTC', 'ETH', 'SOL', 'DOT'];
    const interval = setInterval(() => {
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        price: 20000 + Math.random() * 60000,
        size: Math.random() * 2,
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setOrders(prev => [newOrder, ...prev].slice(0, 50));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="col-span-full lg:col-span-8 bg-nexus-surface border border-nexus-border rounded-lg flex flex-col overflow-hidden relative">
      <div className="px-8 py-6 border-b border-nexus-border flex justify-between items-center bg-nexus-dark/50">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-nexus-accent">Real-Time Order Flow</h2>
          <p className="text-[9px] text-nexus-log font-mono mt-1">STREAMING_AGGREGATED_TAPE</p>
        </div>
        <div className="flex gap-6">
          <StatBox label="Net_Delta" value="+4.2M" trend="up" />
          <StatBox label="Buy_Pressure" value="62%" trend="up" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex">
         <div className="flex-1 overflow-y-auto p-4 space-y-1 scroll-hide font-mono text-[10px]">
           <div className="grid grid-cols-5 px-4 py-2 border-b border-nexus-border text-nexus-subtle font-bold sticky top-0 bg-nexus-surface z-10">
             <span>TIME</span>
             <span>SYMBOL</span>
             <span>SIDE</span>
             <span className="text-right">PRICE</span>
             <span className="text-right">SIZE</span>
           </div>
           <AnimatePresence initial={false}>
             {orders.map((order) => (
               <motion.div 
                 key={order.id}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="grid grid-cols-5 px-4 py-1.5 hover:bg-white/5 transition-colors items-center"
               >
                 <span className="text-nexus-log">{order.time}</span>
                 <span className="font-bold text-white">{order.symbol}/USDT</span>
                 <span className={order.side === 'BUY' ? 'text-emerald-500' : 'text-red-500'}>
                   {order.side}
                 </span>
                 <span className="text-right">${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 <span className="text-right font-bold">{order.size.toFixed(4)}</span>
               </motion.div>
             ))}
           </AnimatePresence>
         </div>

         <div className="w-48 border-l border-nexus-border bg-nexus-dark/30 p-4">
            <h3 className="text-[10px] font-bold uppercase text-nexus-subtle tracking-widest mb-4">Depth Overview</h3>
            <div className="space-y-4">
              <DepthBar label="Ask" value={65} color="bg-red-500" />
              <DepthBar label="Bid" value={35} color="bg-emerald-500" />
            </div>
         </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, trend }: { label: string, value: string, trend: 'up' | 'down' }) {
  return (
    <div className="text-right">
      <p className="text-[9px] uppercase text-nexus-muted tracking-tight">{label}</p>
      <p className={`text-sm font-bold font-mono ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{value}</p>
    </div>
  );
}

function DepthBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-mono text-nexus-log uppercase">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-nexus-border rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
