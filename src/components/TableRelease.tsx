import React from 'react';
import { Table } from '../types';
import { Power, CheckCircle2 } from 'lucide-react';

interface TableReleaseProps {
  tables: Table[];
  onRelease: (tableId: string) => void;
}

export default function TableRelease({ tables, onRelease }: TableReleaseProps) {
  const occupiedTables = tables.filter(t => t.estado === 'ocupada' || t.estado === 'lista');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pt-16 md:pt-0 md:pl-24">
      <header className="p-12 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[10px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-3">CIERRE DE OPERACIONES</h1>
          <h2 className="text-4xl font-semibold tracking-tight uppercase">LIBERACIÓN DE MESAS</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
        {occupiedTables.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border border-stone-900/50 p-24">
            <p className="text-[10px] font-light tracking-[0.4em] uppercase text-stone-600">NO HAY MESAS PARA LIBERAR</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {occupiedTables.map((table) => (
              <div key={table.id} className="border border-stone-800 bg-stone-900/10 p-8 flex flex-col gap-8 group hover:border-brand-gold transition-all duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-stone-500 uppercase mb-1">MESA</p>
                    <p className="text-4xl font-bold tracking-tighter">{table.numero}</p>
                  </div>
                  {table.estado === 'lista' && (
                    <CheckCircle2 size={24} className="text-brand-gold" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-stone-600 uppercase">ESTADO ACTUAL</p>
                  <p className={`text-[10px] font-bold tracking-[0.3em] uppercase ${table.estado === 'lista' ? 'text-brand-gold' : 'text-stone-400'}`}>
                    {table.estado === 'lista' ? 'LISTA PARA CIERRE' : 'EN CONSUMO'}
                  </p>
                </div>

                <button
                  onClick={() => onRelease(table.id)}
                  className="w-full py-4 border border-stone-800 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <Power size={14} />
                  LIBERAR MESA
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
