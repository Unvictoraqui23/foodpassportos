import React from 'react';
import { Table } from '../types';

interface TableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
  selectedTableId?: string;
  pendingCajaByTable?: Record<string, boolean>;
  allOrderItems: any[]; // Using any[] for simplicity, but ideally OrderItem[]
}

export default function TableGrid({ tables, onTableSelect, selectedTableId, pendingCajaByTable, allOrderItems }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-6">
      {tables.map((table) => {
        const isOccupied = table.estado === 'ocupada';
        const isLista = table.estado === 'lista';
        const isSelected = selectedTableId === table.id;
        const enColaCaja = pendingCajaByTable?.[table.id];
        
        return (
          <button
            key={table.id}
            onClick={() => onTableSelect(table)}
            className={`
              aspect-square flex flex-col items-center justify-center border-[0.5px] transition-all duration-500 rounded-none
              ${isOccupied 
                ? 'bg-stone-900 border-brand-gold text-brand-gold' 
                : isLista
                ? 'bg-brand-gold/10 border-brand-gold text-brand-gold animate-pulse'
                : 'bg-transparent border-stone-800 text-stone-600 hover:border-stone-500'}
              ${isSelected ? 'border-brand-gold ring-[0.5px] ring-brand-gold ring-offset-2 ring-offset-brand-bg z-10' : ''}
            `}
          >
            <span className={`text-2xl font-bold tracking-tighter ${isSelected ? 'text-brand-gold' : ''}`}>
              {table.numero}
            </span>
            <span className="text-[8px] font-bold uppercase mt-1 tracking-[0.2em] opacity-70 leading-tight text-center px-1">
              {enColaCaja ? `${table.estado} · caja` : table.estado}
            </span>

            {(isOccupied || isLista || enColaCaja) && (
              <div className="mt-2 text-center">
                <p className="text-[8px] font-bold tracking-widest text-brand-gold/70">
                  {allOrderItems.filter(i => i.tableId === table.id).length} ITEMS
                </p>
                <p className="text-[7px] font-medium text-stone-500 font-mono mt-0.5">
                  {Math.round(allOrderItems.filter(i => i.tableId === table.id).reduce((acc, i) => acc + (i.precio_COP * i.cantidad), 0) / 1000)}K
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
