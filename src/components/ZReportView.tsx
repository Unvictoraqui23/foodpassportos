import React from 'react';
import { Invoice } from '../types';

interface ZReportViewProps {
  historial: Invoice[];
  onClearHistory: () => void;
}

const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

export default function ZReportView({ historial, onClearHistory }: ZReportViewProps) {
  const totalSubtotal = historial.reduce((acc, inv) => acc + inv.subtotal_COP, 0);
  const totalTax = historial.reduce((acc, inv) => acc + inv.tax_COP, 0);
  const totalTips = historial.reduce((acc, inv) => acc + inv.tip_COP, 0);
  const grandTotal = historial.reduce((acc, inv) => acc + inv.total_COP, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pl-24">
      {/* Header */}
      <header className="p-12 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[10px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-3">CIERRE DE CAJA</h1>
          <h2 className="text-4xl font-semibold tracking-tight uppercase tracking-widest">REPORTE Z</h2>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-stone-600 tracking-widest uppercase mb-1">FECHA DE CORTE</p>
          <p className="text-xs font-medium tracking-wider uppercase">
            {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div>
          <button 
            onClick={onClearHistory}
            className="flex items-center gap-4 px-10 py-4 bg-brand-gold text-brand-bg font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-white transition-all shadow-2xl shadow-brand-gold/10"
          >
            IMPRIMIR Y CERRAR DÍA
          </button>
        </div>
      </header>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-8">
            <div className="border border-stone-800 p-8 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-stone-600 tracking-[0.3em] uppercase mb-2">VENTAS NETAS</p>
                  <h3 className="text-3xl font-light tracking-tight text-stone-200">{formatCOP.format(totalSubtotal)}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-stone-600 tracking-[0.3em] uppercase mb-2">TRANSACCIONES</p>
                  <h3 className="text-xl font-light tracking-tight text-stone-400">{historial.length}</h3>
                </div>
              </div>

              <div className="h-[1px] bg-stone-900" />

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-[9px] font-bold text-stone-600 tracking-[0.3em] uppercase mb-2">IMPUESTO CONSUMO (8%)</p>
                  <p className="text-xl font-light tracking-tight text-stone-300">{formatCOP.format(totalTax)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-stone-600 tracking-[0.3em] uppercase mb-2">PROPINAS RECAUDADAS</p>
                  <p className="text-xl font-light tracking-tight text-brand-gold">{formatCOP.format(totalTips)}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-stone-800 flex justify-between items-baseline">
                <span className="text-[11px] font-bold tracking-[0.5em] text-brand-gold uppercase">GRAN TOTAL</span>
                <span className="text-5xl font-bold tracking-tighter text-brand-gold">
                  {formatCOP.format(grandTotal)}
                </span>
              </div>
            </div>

            {/* Audit Message */}
            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-4 opacity-30">
                <div className="h-[0.5px] w-12 bg-stone-500" />
                <span className="text-[8px] font-medium tracking-[0.4em] text-stone-500 uppercase">FIN DEL REPORTE</span>
                <div className="h-[0.5px] w-12 bg-stone-500" />
              </div>
              <p className="text-[9px] font-medium tracking-[0.2em] text-stone-700 uppercase leading-relaxed max-w-xs mx-auto">
                ESTE REPORTE CONSOLIDA TODA LA OPERACIÓN DEL DÍA ACTUAL SEGÚN LA BITÁCORA DE FACTURACIÓN.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
