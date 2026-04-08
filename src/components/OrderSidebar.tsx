import React from 'react';
import { Table, OrderItem, UserRole } from '../types';
import OrderRow from './OrderRow';

interface OrderSidebarProps {
  selectedTable: Table | null;
  orderItems: OrderItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onSendOrder: () => void;
  onRequestInvoice: () => void;
  onPrintInvoice: () => void;
  onFinalize: () => void;
  onViewHistory: () => void;
  onSendToCashRegister?: () => void;
  pendingCaja?: boolean;
  userRole: UserRole;
  onCancelOrder?: (tableId: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
}


const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

export default function OrderSidebar({ 
  selectedTable, 
  orderItems, 
  onUpdateQuantity,
  onRemoveItem, 
  onSendOrder,
  onRequestInvoice,
  onPrintInvoice,
  onFinalize,
  onViewHistory,
  onSendToCashRegister,
  pendingCaja = false,
  userRole,
  onCancelOrder,
  onUpdateNotes
}: OrderSidebarProps) {

  const isMesero = userRole === 'mesero';

  const draftItems = orderItems.filter(item => item.status === 'draft');
  const hasDraftItems = draftItems.length > 0;
  const hasKitchenOrReadyItems = orderItems.some(
    item => item.status === 'sent' || item.status === 'ready'
  );

  const rounds: { [key: string]: OrderItem[] } = {};
  orderItems.forEach(item => {
    if ((item.status === 'sent' || item.status === 'ready') && item.comandaId) {
      if (!rounds[item.comandaId]) rounds[item.comandaId] = [];
      rounds[item.comandaId].push(item);
    }
  });

  const totalsSource = orderItems;
  const subtotal = totalsSource.reduce((acc, item) => acc + item.precio_COP * item.cantidad, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const showMeseroHiddenNotice =
    isMesero && hasKitchenOrReadyItems && !hasDraftItems && orderItems.length > 0;

  const listEmptyForMesero = isMesero && draftItems.length === 0;

  return (
    <div className="h-full flex flex-col bg-brand-bg border-l border-stone-800">
      <div className="p-5 border-b border-stone-800 flex justify-between items-start">
        <div>
          <h2 className="text-[10px] font-medium tracking-[0.3em] text-stone-500 uppercase mb-1">
            {selectedTable ? `MESA ${selectedTable.numero}` : 'SELECCIÓN'}
          </h2>
          <h3 className="text-lg font-semibold tracking-wide uppercase">
            {selectedTable ? (isMesero ? 'NUEVA RONDA' : 'DETALLE DE ORDEN') : 'ESPERANDO MESA'}
          </h3>
        </div>
        {selectedTable && userRole === 'admin' && (
          <button 
            onClick={onViewHistory}
            className="text-[9px] font-bold tracking-widest text-brand-gold uppercase hover:underline underline-offset-4"
          >
            Ver Historial
          </button>
        )}
      </div>

      <div className="flex-1 h-0 min-h-0 overflow-y-auto p-5 space-y-10 custom-scrollbar pb-10">
        {isMesero && (
          <div className="border border-stone-800/80 bg-stone-900/30 p-4 space-y-2">
            <p className="text-[8px] font-bold tracking-[0.25em] text-stone-500 uppercase">
              VISTA DE MESERO
            </p>
            <p className="text-[9px] text-stone-400 leading-relaxed tracking-wide">
              Utilice <span className="text-brand-gold">CONFIRMAR ORDEN</span> para nuevas rondas. Una vez confirmada, 
              se envía automáticamente a <span className="text-brand-gold">COCINA</span> y <span className="text-brand-gold">CAJA</span>, 
              quedando registrada en el historial activo.
            </p>
          </div>
        )}

        {orderItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 min-h-[200px]">
            <div className="border border-stone-800/30 p-8 text-center bg-stone-950/20">
              <p className="text-[8px] font-light tracking-[0.5em] uppercase text-stone-700 leading-relaxed">
                SIN PRODUCTOS<br />SELECCIONADOS
              </p>
            </div>
          </div>
        ) : listEmptyForMesero && !showMeseroHiddenNotice ? (
          <div className="h-full flex flex-col items-center justify-center p-6 min-h-[200px]">
            <div className="border border-stone-800/30 p-8 text-center bg-stone-950/20">
              <p className="text-[8px] font-light tracking-[0.5em] uppercase text-stone-700 leading-relaxed">
                AGREGUE PRODUCTOS<br />A LA NUEVA RONDA
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {showMeseroHiddenNotice && (
              <div className="border border-stone-800/50 p-5 bg-stone-950/50">
                <p className="text-[8px] font-bold tracking-[0.3em] text-stone-500 uppercase mb-2">
                  CONSUMO ACTIVO
                </p>
                <p className="text-[9px] text-stone-600 leading-relaxed">
                  Las comandas ya enviadas se gestionan desde la caja principal.
                </p>
              </div>
            )}

            {Object.entries(rounds).length > 0 && (
              <div className="space-y-8">
                {Object.entries(rounds).map(([comandaId, items]) => {
                  const allReady = items.length > 0 && items.every(i => i.status === 'ready');
                  return (
                    <div key={comandaId} className="space-y-5">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-bold tracking-[0.4em] uppercase ${allReady ? 'text-emerald-500' : 'text-brand-gold/40'}`}>
                          {isMesero ? `ACTIVA ${comandaId}` : `COMANDA ${comandaId}`}{allReady ? ' · LISTA' : ''}
                        </span>
                        <div className="flex-1 h-[0.5px] bg-stone-900" />
                      </div>
                      <div className="space-y-1">
                        {items.map((item, idx) => (
                          <OrderRow 
                            key={`${comandaId}-${item.lineId ?? item.id}-${idx}`} 
                            item={item} 
                            onUpdateQuantity={onUpdateQuantity} 
                            onRemoveItem={onRemoveItem} 
                            onUpdateNotes={onUpdateNotes}
                          />

                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {draftItems.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-bold tracking-[0.4em] text-stone-600 uppercase">
                    {isMesero ? 'NUEVA RONDA (BORRADOR)' : 'NUEVA RONDA'}
                  </span>
                  <div className="flex-1 h-[0.5px] bg-stone-900" />
                </div>
                <div className="space-y-1">
                  {draftItems.map(item => (
                    <OrderRow 
                      key={item.lineId ?? item.id} 
                      item={item} 
                      onUpdateQuantity={onUpdateQuantity} 
                      onRemoveItem={onRemoveItem} 
                      onUpdateNotes={onUpdateNotes}
                    />

                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-stone-950 border-t border-brand-gold/10 space-y-6">
        <div className="space-y-2.5">
          {isMesero && hasDraftItems && (
            <p className="text-[7px] text-stone-600 tracking-[0.2em] uppercase mb-1">
              Totales de la ronda actual
            </p>
          )}
          <div className="flex justify-between text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">
            <span>SUBTOTAL</span>
            <span className="font-mono">{formatCOP.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">
            <span>IMPOCONSUMO (8%)</span>
            <span className="font-mono">{formatCOP.format(tax)}</span>
          </div>
          <div className="pt-3 flex justify-between items-end border-t border-stone-900">
            <span className="text-[9px] font-bold tracking-[0.3em] text-brand-gold uppercase leading-none mb-1">TOTAL</span>
            <span className="text-3xl font-bold tracking-tighter text-brand-gold leading-none">
              {formatCOP.format(total)}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            disabled={!selectedTable || !hasDraftItems}
            onClick={onSendOrder}
            className={`
              w-full py-4 font-bold text-[10px] tracking-[0.4em] uppercase transition-all duration-500 rounded-none border
              ${hasDraftItems 
                ? 'bg-brand-gold text-brand-bg border-brand-gold hover:bg-transparent hover:text-brand-gold shadow-[0_0_20px_rgba(196,160,84,0.1)]' 
                : 'border-stone-900 text-stone-800 opacity-30 cursor-not-allowed'}
            `}
          >
            {isMesero ? 'CONFIRMAR ORDEN' : 'ENVIAR A COCINA'}
          </button>

          {hasKitchenOrReadyItems && (
            <div className="pt-4 border-t border-stone-900 space-y-3">
              {isMesero ? (
                <>
                  {pendingCaja && (
                    <p className="text-[7px] font-bold tracking-[0.4em] text-emerald-500/80 uppercase text-center bg-emerald-500/5 py-2 border border-emerald-500/10">
                      ACTIVA EN CAJA PRINCIPAL
                    </p>
                  )}
                  {/* Automated flow: Enviar a caja is now part of Confirmar Orden */}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-[7px] font-bold tracking-[0.3em] text-stone-600 uppercase text-center mb-1">GESTIÓN ADMINISTRATIVA</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={onRequestInvoice}
                      className="w-full py-3 border border-stone-800 text-stone-500 font-bold text-[8px] tracking-[0.3em] uppercase hover:text-white hover:border-stone-600 transition-all rounded-none"
                    >
                      SOLICITAR CUENTA
                    </button>
                    <button
                      onClick={onPrintInvoice}
                      className="w-full py-3 border border-stone-800 text-stone-500 font-bold text-[8px] tracking-[0.3em] uppercase hover:text-white hover:border-stone-600 transition-all rounded-none"
                    >
                      IMPRIMIR PRE-FACTURA
                    </button>
                    <button
                      onClick={() => onCancelOrder?.(selectedTable?.id || '')}
                      className="w-full py-3 border border-red-900/30 text-red-700 font-bold text-[8px] tracking-[0.3em] uppercase hover:text-red-500 hover:border-red-600 transition-all rounded-none"
                    >
                      CANCELAR ORDEN / MESA
                    </button>
                    <button
                      onClick={onFinalize}
                      className="w-full py-4 bg-transparent border border-brand-gold/30 text-brand-gold font-bold text-[9px] tracking-[0.3em] uppercase hover:bg-brand-gold hover:text-brand-bg transition-all rounded-none"
                    >
                      CERRAR MESA & COBRAR
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
