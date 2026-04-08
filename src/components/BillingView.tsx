import React, { useState } from 'react';
import { Table, OrderItem, Invoice, UserRole } from '../types';
import { Receipt, Printer, Minus, Plus, Trash2, Banknote, CreditCard, Smartphone } from 'lucide-react';


interface BillingViewProps {
  tables: Table[];
  allOrderItems: OrderItem[];
  onAddInvoice: (invoice: Invoice) => void;
  userRole: UserRole;
  pendingCajaByTable: Record<string, boolean>;
  tableTips: Record<string, number>;
  onCobroCompleto?: (tableId: string) => void;
  onBillingLineQuantityDelta?: (lineId: string, delta: number) => void;
  onBillingRemoveLine?: (lineId: string) => void;
  historial: Invoice[];
  onPrintInvoice: (invoice: Invoice) => void;
  onVoidInvoice?: (invoiceId: string) => void;
}

const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

function statusLabel(status: OrderItem['status']): string {
  if (status === 'draft') return 'BORRADOR';
  if (status === 'sent') return 'COCINA';
  if (status === 'ready') return 'LISTO';
  return status.toUpperCase();
}

export default function BillingView({
  tables,
  allOrderItems,
  onAddInvoice,
  userRole,
  pendingCajaByTable,
  tableTips,
  onCobroCompleto,
  onBillingLineQuantityDelta,
  onBillingRemoveLine,
  historial,
  onPrintInvoice,
  onVoidInvoice
}: BillingViewProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'history'>('active');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [discountPct, setDiscountPct] = useState(0);
  const [splitCount, setSplitCount] = useState(1);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());

  const occupiedTables = tables.filter(t => t.estado === 'ocupada' || t.estado === 'lista');

  const sortedForAdmin = [...occupiedTables].sort((a, b) => {
    const pa = pendingCajaByTable[a.id] ? 1 : 0;
    const pb = pendingCajaByTable[b.id] ? 1 : 0;
    return pb - pa;
  });

  const meseroQueue = occupiedTables.filter(t => pendingCajaByTable[t.id]);

  const listTables = userRole === 'mesero' ? meseroQueue : sortedForAdmin;
  
  const filteredHistory = historial.filter(inv => inv.fecha_ISO === searchDate);

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const tableItems = allOrderItems.filter(item => item.tableId === selectedTableId);

  const selectedInvoice = historial.find(inv => inv.id === selectedInvoiceId);

  const tipPct = selectedTable ? tableTips[selectedTable.id] ?? 10 : 10;
  const subtotal = tableItems.reduce((acc, item) => acc + item.precio_COP * item.cantidad, 0);
  const tax = subtotal * 0.08;
  const tip = subtotal * (tipPct / 100);
  const discount = (subtotal + tax) * (discountPct / 100);
  const total = subtotal + tax + tip - discount;


  const handlePrint = (metodo: Invoice['metodoPago']) => {
    if (!selectedTable || userRole !== 'admin' || !onCobroCompleto) return;

    const itemsToPay = selectionMode 
      ? tableItems.filter(it => it.lineId && selectedLines.has(it.lineId))
      : tableItems;

    if (itemsToPay.length === 0) {
      alert('SELECCIONE ARTÍCULOS PARA COBRAR');
      return;
    }

    const currentSubtotal = itemsToPay.reduce((acc, item) => acc + item.precio_COP * item.cantidad, 0);
    const currentTax = currentSubtotal * 0.08;
    const currentTip = currentSubtotal * (tipPct / 100);
    const currentDiscount = (currentSubtotal + currentTax) * (discountPct / 100);
    const currentTotal = currentSubtotal + currentTax + currentTip - currentDiscount;

    const invoice: Invoice = {
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      mesa_numero: selectedTable.numero,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fecha_ISO: new Date().toISOString().split('T')[0],
      items: itemsToPay,
      subtotal_COP: currentSubtotal,
      tax_COP: currentTax,
      tip_COP: currentTip,
      tip_percentage: tipPct,
      discount_percentage: discountPct,
      discount_COP: currentDiscount,
      total_COP: currentTotal,
      estado: 'PAGADO',
      metodoPago: metodo,
    };

    onAddInvoice(invoice);

    if (selectionMode && itemsToPay.length < tableItems.length) {
      // Partial payment - remove items from table but don't release table
      itemsToPay.forEach(it => {
        if (it.lineId && onBillingRemoveLine) {
          onBillingRemoveLine(it.lineId);
        }
      });
      setSelectedLines(new Set());
      setSelectionMode(false);
    } else {
      // Full payment
      onCobroCompleto(selectedTable.id);
      setSelectedTableId(null);
    }
    
    onPrintInvoice(invoice);
  };

  const toggleLineSelection = (lineId: string) => {
    const next = new Set(selectedLines);
    if (next.has(lineId)) next.delete(lineId);
    else next.add(lineId);
    setSelectedLines(next);
  };

  const headerTitle = userRole === 'mesero' ? 'COLA ENVIADA POR MESEROS' : 'MESAS ACTIVAS';
  const headerSubtitle = userRole === 'mesero' ? 'CAJA PRINCIPAL (VISTA MESERO)' : 'FACTURACIÓN';

  const canEditLines =
    userRole === 'admin' && onBillingLineQuantityDelta && onBillingRemoveLine;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-brand-bg pt-16 md:pt-0 md:pl-24">
      <div className="w-full h-1/3 lg:h-auto lg:w-1/4 border-b lg:border-b-0 lg:border-r border-stone-800 flex flex-col shrink-0">
        <header className="p-6 border-b border-stone-800 space-y-6">
          <div>
            <h1 className="text-[9px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-2">{headerSubtitle}</h1>
            <h2 className="text-xl font-semibold tracking-tight uppercase">CAJA PRINCIPAL</h2>
          </div>
          
          {userRole === 'admin' && (
            <div className="flex bg-stone-900/50 p-1 rounded-none border border-stone-800/50">
              <button
                onClick={() => setView('active')}
                className={`flex-1 py-2 text-[8px] font-bold tracking-widest uppercase transition-all ${view === 'active' ? 'bg-brand-gold text-brand-bg' : 'text-stone-500 hover:text-stone-300'}`}
              >
                MESAS
              </button>
              <button
                onClick={() => setView('history')}
                className={`flex-1 py-2 text-[8px] font-bold tracking-widest uppercase transition-all ${view === 'history' ? 'bg-brand-gold text-brand-bg' : 'text-stone-500 hover:text-stone-300'}`}
              >
                HISTORIAL
              </button>
            </div>
          )}

          {view === 'history' && (
            <div className="space-y-2 pt-2">
               <label className="text-[7px] font-bold tracking-[0.3em] text-stone-600 uppercase">BUSCAR POR DÍA</label>
               <input 
                type="date" 
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 p-3 text-[10px] font-mono text-brand-gold focus:outline-none focus:border-brand-gold/50 transition-all rounded-none"
               />
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar custom-scrollbar">
          {view === 'active' ? (
            listTables.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[9px] font-light tracking-[0.4em] uppercase text-stone-700">
                  {userRole === 'mesero'
                    ? 'NINGUNA MESA EN COLA DE CAJA'
                    : 'NO HAY MESAS OCUPADAS'}
                </p>
              </div>
            ) : (
              listTables.map(table => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    setSelectedTableId(table.id);
                    setSelectedInvoiceId(null);
                  }}
                  className={`w-full p-4 border transition-all duration-300 flex justify-between items-center rounded-none animate-in fade-in slide-in-from-left-2 duration-300 ${selectedTableId === table.id ? 'border-brand-gold bg-stone-900/40' : 'border-stone-900 hover:border-stone-700'}`}
                >
                  <div className="text-left">
                    <p className="text-[8px] font-bold tracking-[0.3em] text-stone-600 uppercase mb-0.5">MESA</p>
                    <p className="text-xl font-bold tracking-tight">{table.numero}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {pendingCajaByTable[table.id] && (
                      <span className="text-[7px] font-bold tracking-widest bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 uppercase border border-emerald-800/50">
                        EN COLA
                      </span>
                    )}
                    {table.estado === 'lista' && (
                      <span className="text-[7px] font-bold tracking-widest bg-brand-gold text-brand-bg px-1.5 py-0.5 uppercase">LISTA</span>
                    )}
                  </div>
                </button>
              ))
            )
          ) : (
            filteredHistory.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[9px] font-light tracking-[0.4em] uppercase text-stone-700">
                  SIN REGISTROS PARA ESTE DÍA
                </p>
              </div>
            ) : (
              filteredHistory.map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => {
                    setSelectedInvoiceId(inv.id);
                    setSelectedTableId(null);
                  }}
                  className={`w-full p-4 border transition-all duration-300 flex justify-between items-center rounded-none animate-in fade-in slide-in-from-left-2 duration-300 ${selectedInvoiceId === inv.id ? 'border-brand-gold bg-stone-900/40' : 'border-stone-900 hover:border-stone-700'} ${inv.estado === 'ANULADO' ? 'opacity-50 line-through grayscale' : ''}`}
                >
                  <div className="text-left">
                    <p className="text-[8px] font-bold tracking-[0.3em] uppercase mb-0.5 flex gap-2 items-center">
                      <span className="text-stone-600">{inv.id}</span>
                      {inv.estado === 'ANULADO' && <span className="text-[7px] text-red-500 tracking-widest bg-red-500/10 px-1 py-0.5">ANULADA</span>}
                    </p>
                    <p className="text-lg font-bold tracking-tight">MESA {inv.mesa_numero}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] font-bold font-mono ${inv.estado === 'ANULADO' ? 'text-stone-500' : 'text-brand-gold'}`}>{formatCOP.format(inv.total_COP)}</p>
                    <p className="text-[7px] text-stone-600 font-mono mt-1">{inv.hora}</p>
                  </div>
                </button>
              ))
            )
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedTable || selectedInvoice ? (
          <>
            <header className="p-6 border-b border-stone-800 flex justify-between items-end">
              <div>
                <h1 className="text-[9px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-2">
                  {selectedInvoice ? 'REVISIÓN DE ARCHIVO' : 'VISTA PREVIA'}
                </h1>
                <h2 className="text-2xl font-semibold tracking-tight uppercase">
                  {selectedInvoice ? `FACTURA ${selectedInvoice.id}` : `CUENTA MESA ${selectedTable?.numero}`}
                </h2>
                {userRole === 'admin' && !selectedInvoice && (
                  <p className="text-[8px] text-stone-600 mt-2 tracking-widest uppercase max-w-md">
                    Ajuste cantidades o elimine líneas antes de cobrar. Es el único lugar donde se modifican comandas ya enviadas.
                  </p>
                )}
                {selectedInvoice && (
                  <p className="text-[8px] text-brand-gold mt-2 tracking-widest uppercase font-bold">
                    DOCUMENTO ARCHIVADO · {selectedInvoice.fecha_ISO} {selectedInvoice.hora}
                  </p>
                )}
              </div>
              {userRole === 'admin' && !selectedInvoice && (
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionMode(!selectionMode);
                        setSelectedLines(new Set());
                        setSplitCount(1);
                      }}
                      className={`px-6 py-3 border font-bold text-[8px] tracking-[0.2em] uppercase transition-all rounded-none ${selectionMode ? 'bg-brand-gold text-brand-bg border-brand-gold' : 'border-stone-800 text-stone-500 hover:text-white'}`}
                    >
                      {selectionMode ? 'MODO: SELECCIÓN' : 'DIVIDIR POR ITEMS'}
                    </button>
                    {!selectionMode && (
                      <div className="flex border border-stone-800 h-10">
                        <button 
                          onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                          className="w-10 flex items-center justify-center text-stone-500 hover:text-white border-r border-stone-800"
                        >
                          <Minus size={12} />
                        </button>
                        <div className="w-12 flex items-center justify-center bg-stone-900/30">
                          <span className="text-xs font-bold font-mono text-brand-gold">{splitCount}</span>
                        </div>
                        <button 
                          onClick={() => setSplitCount(splitCount + 1)}
                          className="w-10 flex items-center justify-center text-stone-500 hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="h-20 w-[1px] bg-stone-800 mx-2" />

                  <button
                    type="button"
                    onClick={() => handlePrint('EFECTIVO')}
                    disabled={selectionMode && selectedLines.size === 0}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-emerald-600 text-white text-[8px] font-bold tracking-[0.2em] uppercase hover:bg-emerald-500 transition-all rounded-none shrink-0 disabled:opacity-30"
                  >
                    <Banknote size={16} />
                    EFECTIVO
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrint('TARJETA')}
                    disabled={selectionMode && selectedLines.size === 0}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-blue-600 text-white text-[8px] font-bold tracking-[0.2em] uppercase hover:bg-blue-500 transition-all rounded-none shrink-0 disabled:opacity-30"
                  >
                    <CreditCard size={16} />
                    TARJETA
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrint('TRANSFERENCIA')}
                    disabled={selectionMode && selectedLines.size === 0}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-brand-gold text-brand-bg text-[8px] font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all rounded-none shrink-0 disabled:opacity-30"
                  >
                    <Smartphone size={16} />
                    TRANSF
                  </button>
                </div>
              )}

              {selectedInvoice && (
                <div className="flex items-center gap-3">
                  {userRole === 'admin' && selectedInvoice.estado !== 'ANULADO' && onVoidInvoice && !selectedInvoice.id.startsWith('Z-') && (
                    <button
                      type="button"
                      onClick={() => onVoidInvoice(selectedInvoice.id)}
                      className="flex items-center gap-3 px-6 py-3 border border-red-500/30 text-red-500 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-red-500 hover:text-white transition-all rounded-none shrink-0"
                    >
                      <Trash2 size={14} />
                      ANULAR
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onPrintInvoice(selectedInvoice)}
                    className="flex items-center gap-3 px-6 py-3 border border-brand-gold/30 text-brand-gold text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-brand-gold hover:text-brand-bg transition-all rounded-none shrink-0"
                  >
                    <Printer size={14} />
                    RE-IMPRIMIR
                  </button>
                </div>
              )}
            </header>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar custom-scrollbar">
              <div className="max-w-xl mx-auto bg-stone-900/10 border border-stone-900 p-8 space-y-8">
                {/* Desglose de Items */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase border-b border-stone-800 pb-3">
                    <span>DESCRIPCIÓN</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="space-y-4">
                    {(selectedInvoice ? selectedInvoice.items : tableItems).map((item, idx) => {
                      const isSelected = item.lineId ? selectedLines.has(item.lineId) : false;
                      return (
                        <div 
                          key={item.lineId ?? idx} 
                          className={`flex flex-col gap-3 border-b border-stone-900/60 pb-4 last:border-0 transition-all ${selectionMode ? 'cursor-pointer' : ''}`}
                          onClick={() => selectionMode && item.lineId && toggleLineSelection(item.lineId)}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 flex gap-3">
                              {selectionMode && item.lineId && (
                                <div className={`w-5 h-5 border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-brand-gold border-brand-gold text-brand-bg' : 'border-stone-700 text-transparent'}`}>
                                  {isSelected && <span className="text-[10px] font-bold">✓</span>}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[7px] font-bold tracking-widest text-stone-600 uppercase border border-stone-800 px-1 py-0.5">
                                    {selectedInvoice ? 'PAGADO' : statusLabel(item.status)}
                                  </span>
                                  <span className={`text-xs font-light uppercase tracking-widest transition-colors ${selectionMode && !isSelected ? 'text-stone-600' : 'text-stone-300'}`}>{item.nombre}</span>
                                </div>
                                {item.notes && (
                                  <p className="text-[7px] italic text-stone-500 mt-1 uppercase tracking-widest pl-2 border-l border-stone-800">"{item.notes}"</p>
                                )}
                                <p className="text-[9px] text-stone-600 font-mono mt-1">{item.cantidad} x {formatCOP.format(item.precio_COP)}</p>
                              </div>
                            </div>
  
                            <span className={`text-xs font-medium transition-colors ${selectionMode && !isSelected ? 'text-stone-600' : ''}`}>{formatCOP.format(item.precio_COP * item.cantidad)}</span>
                          </div>
                          
                          {!selectedInvoice && canEditLines && item.lineId && !selectionMode && (
                             <div className="flex items-center justify-between gap-4 mt-2">
                              <div className="flex border border-stone-800">
                                <button onClick={() => onBillingLineQuantityDelta!(item.lineId!, -1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white"><Minus size={12} /></button>
                                <div className="w-8 h-8 flex items-center justify-center text-[10px] font-bold font-mono border-x border-stone-800">{item.cantidad}</div>
                                <button onClick={() => onBillingLineQuantityDelta!(item.lineId!, 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white"><Plus size={12} /></button>
                              </div>
                              <button onClick={() => onBillingRemoveLine!(item.lineId!)} className="text-[8px] font-bold tracking-widest uppercase text-stone-600 hover:text-red-500 transition-colors">Eliminar</button>
                             </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totales */}
                <div className="pt-8 border-t border-stone-800 space-y-3">
                  {!selectedInvoice && userRole === 'admin' && (
                    <div className="flex-1 space-y-2 mb-4">
                      <label className="text-[7px] font-bold tracking-widest text-stone-700 uppercase block ml-1">DESCUENTO %</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={discountPct}
                          onChange={(e) => setDiscountPct(parseInt(e.target.value) || 0)}
                          className="w-full bg-stone-900 border border-stone-800 p-3 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase mt-2">
                       <span>DESCUENTO ({discountPct}%)</span>
                       <span>- {formatCOP.format(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[10px] font-light tracking-widest text-stone-600 uppercase">
                    <span>SUBTOTAL</span>
                    <span className="font-mono">{formatCOP.format(selectedInvoice ? selectedInvoice.subtotal_COP : subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-light tracking-widest text-stone-600 uppercase">
                    <span>IVA / CONSUMO (8%)</span>
                    <span className="font-mono">{formatCOP.format(selectedInvoice ? selectedInvoice.tax_COP : tax)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-light tracking-widest text-stone-600 uppercase">
                    <span>PROVINA ({selectedInvoice ? selectedInvoice.tip_percentage : tipPct}%)</span>
                    <span className="font-mono">{formatCOP.format(selectedInvoice ? selectedInvoice.tip_COP : tip)}</span>
                  </div>
                  <div className="pt-6 flex justify-between items-baseline border-t border-brand-gold/20">
                    <span className="text-[10px] font-bold tracking-[0.4em] text-brand-gold uppercase">TOTAL DOCUMENTO</span>
                    <span className="text-3xl font-bold tracking-tighter text-brand-gold">{formatCOP.format(selectedInvoice ? selectedInvoice.total_COP : total)}</span>
                  </div>

                  {!selectedInvoice && splitCount > 1 && (
                    <div className="pt-4 mt-4 border-t border-dashed border-stone-800 animate-in fade-in slide-in-from-top-2">
                       <div className="flex justify-between items-center px-4 py-3 bg-brand-gold/5 border border-brand-gold/10">
                          <div>
                            <p className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">CADA PARTE ({splitCount})</p>
                            <p className="text-xl font-bold tracking-tight text-white">{formatCOP.format(total / splitCount)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">PROPINA POR PARTE</p>
                             <p className="text-xs font-mono text-stone-300">{formatCOP.format(tip / splitCount)}</p>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <Receipt size={48} className="text-stone-900 mb-8" />
            <p className="text-[10px] font-light tracking-[0.4em] uppercase text-stone-600">
              SELECCIONE UNA MESA O FACTURA DEL HISTORIAL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
