import React from 'react';
import { OrderItem } from '../types';

interface KitchenViewProps {
  allOrderItems: OrderItem[];
  onMarkReady: (comandaId: string) => void;
}

export default function KitchenView({ allOrderItems, onMarkReady }: KitchenViewProps) {
  // Group items by comandaId for orders that are 'sent'
  const sentOrders = allOrderItems.reduce((acc, item) => {
    if (item.status === 'sent' && item.comandaId) {
      if (!acc[item.comandaId]) {
        acc[item.comandaId] = {
          id: item.comandaId,
          tableId: item.tableId,
          items: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Mocking timestamp for now
        };
      }
      acc[item.comandaId].items.push(item);
    }
    return acc;
  }, {} as Record<string, { id: string; tableId: string; items: OrderItem[]; timestamp: string }>);

  const ordersArray = Object.values(sentOrders);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pt-16 md:pt-0 md:pl-24">
      <header className="p-6 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[9px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-2">MONITOR DE PRODUCCIÓN</h1>
          <h2 className="text-2xl font-semibold tracking-tight uppercase">COCINA</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {ordersArray.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border border-stone-900/50 p-12">
            <p className="text-[9px] font-light tracking-[0.4em] uppercase text-stone-600">SIN COMANDAS PENDIENTES</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordersArray.map((order) => (
              <div key={order.id} className="border border-stone-800 bg-stone-900/20 p-6 rounded-none flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-brand-gold">{order.id}</h3>
                    <p className="text-[9px] font-bold tracking-[0.3em] text-stone-600 uppercase mt-0.5">MESA {order.tableId}</p>
                  </div>
                  <span className="text-[9px] font-mono text-stone-600">{order.timestamp}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-stone-800/50 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <span className="text-brand-gold font-bold text-xs">{item.cantidad}x</span>
                          <span className="text-xs font-medium uppercase tracking-wider text-stone-300">{item.nombre}</span>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-[9px] italic text-brand-gold/80 bg-brand-gold/5 px-2 py-1 uppercase tracking-widest border-l-2 border-brand-gold">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onMarkReady(order.id)}
                  className="w-full py-3 border border-brand-gold/20 text-[9px] font-bold tracking-[0.4em] uppercase hover:bg-brand-gold hover:text-brand-bg transition-all duration-300 rounded-none"
                >
                  MARCAR COMO LISTO
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
