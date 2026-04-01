import React, { useState } from 'react';
import { Invoice, UserRole } from '../types';
import { Search, Calendar, ChevronRight, Printer } from 'lucide-react';
import PreInvoiceModal from './PreInvoiceModal';

interface HistoryViewProps {
  historial: Invoice[];
  userRole: UserRole;
}

const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

export default function HistoryView({ historial, userRole }: HistoryViewProps) {
  const [filter, setFilter] = useState<'HOY' | 'AYER'>('HOY');
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredHistorial = historial.filter(inv => 
    inv.id.includes(search.toUpperCase()) || 
    inv.mesa_numero.toString().includes(search)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pl-24">
      {/* Header */}
      <header className="p-6 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[9px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-2">BITÁCORA DE OPERACIONES</h1>
          <h2 className="text-2xl font-semibold tracking-tight uppercase">HISTORIAL DE FACTURAS</h2>
        </div>
        
        <div className="flex gap-4">
          <div className="flex border border-stone-800 rounded-none overflow-hidden">
            <button 
              onClick={() => setFilter('HOY')}
              className={`px-6 py-2 text-[9px] font-bold tracking-[0.3em] uppercase transition-all duration-300 ${filter === 'HOY' ? 'bg-brand-gold text-brand-bg' : 'text-stone-600 hover:text-white'}`}
            >
              HOY
            </button>
            <button 
              onClick={() => setFilter('AYER')}
              className={`px-6 py-2 text-[9px] font-bold tracking-[0.3em] uppercase transition-all duration-300 ${filter === 'AYER' ? 'bg-brand-gold text-brand-bg' : 'text-stone-600 hover:text-white'}`}
            >
              AYER
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-700" size={12} />
            <input 
              type="text" 
              placeholder="BUSCAR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-stone-900/30 border border-stone-800 pl-10 pr-4 py-2 text-[9px] font-bold tracking-[0.2em] uppercase text-white placeholder:text-stone-800 focus:outline-none focus:border-brand-gold w-56 rounded-none transition-all"
            />
          </div>
        </div>
      </header>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="max-w-5xl mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1.2fr_1fr_0.8fr] gap-6 pb-4 border-b border-stone-800 mb-6">
            <span className="text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase"># ID</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase">MESA</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase">HORA</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase">TOTAL</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase">ESTADO</span>
            <span className="text-[9px] font-bold tracking-[0.4em] text-stone-700 uppercase text-right">ACCIÓN</span>
          </div>

          {/* Table Body */}
          <div className="space-y-0">
            {filteredHistorial.length === 0 ? (
              <div className="py-12 text-center border border-stone-900/50">
                <p className="text-[9px] font-light tracking-[0.4em] uppercase text-stone-700">
                  SIN REGISTROS
                </p>
              </div>
            ) : (
              filteredHistorial.map((invoice) => (
                <div key={invoice.id} className="group hover:bg-stone-900/10 transition-all border-b border-dotted border-stone-800/30">
                  <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1.2fr_1fr_0.8fr] gap-6 items-center py-4">
                    <span className="text-xs font-semibold tracking-widest uppercase text-brand-gold">
                      {invoice.id}
                    </span>
                    <span className="text-xs font-light tracking-widest uppercase text-stone-400">
                      MESA {invoice.mesa_numero}
                    </span>
                    <span className="text-[10px] font-light text-stone-600 font-mono">
                      {invoice.hora}
                    </span>
                    <div className="text-sm font-semibold tracking-tight text-stone-200">
                      {formatCOP.format(invoice.total_COP)}
                    </div>
                    <div>
                      <span className={`text-[8px] font-bold tracking-[0.2em] px-3 py-1 border rounded-none ${invoice.estado === 'PAGADO' ? 'border-green-900/20 text-green-600 bg-green-900/5' : 'border-red-900/20 text-red-600 bg-red-900/5'}`}>
                        {invoice.estado}
                      </span>
                    </div>
                    <div className="text-right">
                      {userRole === 'admin' && (
                        <button 
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-[8px] font-bold tracking-[0.2em] uppercase border-b border-stone-800 hover:border-brand-gold hover:text-brand-gold transition-all py-1"
                        >
                          REIMPRIMIR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <PreInvoiceModal 
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onConfirm={() => {}} // No action needed on confirm for reprint
          selectedTable={{ id: '0', numero: selectedInvoice.mesa_numero, estado: 'ocupada' }}
          orderItems={[]} // Not used in reprint mode
          reprintInvoice={selectedInvoice}
        />
      )}
    </div>
  );
}
