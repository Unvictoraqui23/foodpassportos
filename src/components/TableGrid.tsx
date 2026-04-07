import React from 'react';
import { Table, UserRole } from '../types';

interface TableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
  selectedTableId?: string;
  pendingCajaByTable?: Record<string, boolean>;
  allOrderItems: any[];
  userRole: UserRole;
  onCancelOrder: (tableId: string) => void;
}

export default function TableGrid({ tables, onTableSelect, selectedTableId, pendingCajaByTable, allOrderItems, userRole, onCancelOrder }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6 p-6">
      {tables.map((table) => {
        const isOccupied = table.estado === 'ocupada';
        const isLista = table.estado === 'lista';
        const isReserved = table.estado === 'reservada';
        const isSelected = selectedTableId === table.id;
        const enColaCaja = pendingCajaByTable?.[table.id];
        
        return (
          <div key={table.id} className="relative group/table aspect-square">
            <button
              onClick={() => onTableSelect(table)}
              className={`
                w-full h-full flex flex-col items-center justify-center border-[0.5px] transition-all duration-500 rounded-none
                ${isOccupied 
                  ? 'bg-stone-900 border-brand-gold text-brand-gold' 
                  : isLista
                  ? 'bg-brand-gold/10 border-brand-gold text-brand-gold animate-pulse'
                  : isReserved
                  ? 'bg-amber-950/20 border-amber-600/50 text-amber-500 shadow-[inset_0_0_20px_rgba(217,119,6,0.05)]'
                  : 'bg-transparent border-stone-800 text-stone-600 hover:border-stone-500'}
                ${isSelected ? 'border-brand-gold ring-[0.5px] ring-brand-gold ring-offset-2 ring-offset-brand-bg z-10' : ''}
              `}
            >
              <span className={`text-2xl lg:text-3xl font-bold tracking-tighter ${isSelected ? 'text-brand-gold' : ''}`}>
                {table.numero}
              </span>
              <span className={`text-[8px] font-bold uppercase mt-1 tracking-[0.2em] opacity-70 leading-tight text-center px-1 ${isReserved ? 'text-amber-500/80 animate-pulse' : ''}`}>
                {enColaCaja ? `${table.estado} · caja` : table.estado}
              </span>

              {(isOccupied || isLista || enColaCaja) && (
                <div className="mt-2 text-center overflow-hidden">
                  <p className="text-[8px] font-bold tracking-widest text-brand-gold/70">
                    {allOrderItems.filter(i => i.tableId === table.id).length} ITEMS
                  </p>
                  <p className="text-[7px] font-medium text-stone-500 font-mono mt-0.5">
                    {Math.round(allOrderItems.filter(i => i.tableId === table.id).reduce((acc, i) => acc + (i.precio_COP * i.cantidad), 0) / 1000)}K
                  </p>
                </div>
              )}
            </button>

            {/* Cancel Order Button Overlay for Admin */}
            {userRole === 'admin' && (isOccupied || isLista || isReserved) && !enColaCaja && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelOrder(table.id);
                }}
                className="absolute top-2 right-2 bg-red-600/20 text-red-500 text-[6px] font-black px-1.5 py-0.5 rounded-none border border-red-500/30 opacity-60 group-hover/table:opacity-100 transition-all hover:bg-red-600 hover:text-white tracking-widest uppercase"
              >
                CANCELAR
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
