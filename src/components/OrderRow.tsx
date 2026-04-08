import React from 'react';
import { OrderItem } from '../types';
import { Minus, Plus, Trash2, StickyNote } from 'lucide-react';

interface OrderRowProps {
  item: OrderItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
}


const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

const OrderRow: React.FC<OrderRowProps> = ({ item, onUpdateQuantity, onRemoveItem, onUpdateNotes }) => {

  const isLocked = item.status === 'sent' || item.status === 'ready';

  return (
    <div className={`group relative transition-all duration-500 pb-4 mb-4 border-b border-stone-900 last:border-0 last:mb-0 last:pb-0 ${isLocked ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[10px] font-bold tracking-widest uppercase truncate">{item.nombre}</h4>
            {item.status === 'sent' && (
              <span className="text-[7px] font-bold text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 border border-brand-gold/20 flex items-center gap-1 tracking-widest uppercase">
                COCINA
              </span>
            )}
            {item.status === 'ready' && (
              <span className="text-[7px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20 flex items-center gap-1 tracking-widest uppercase">
                LISTO
              </span>
            )}
          </div>
          <p className="text-[8px] text-stone-600 font-mono tracking-wider">
            {formatCOP.format(item.precio_COP)} / U
          </p>
          {item.notes && (
            <p className="text-[8px] italic text-brand-gold/60 mt-1 uppercase tracking-widest bg-brand-gold/5 px-2 py-1 border-l border-brand-gold/30">
              "{item.notes}"
            </p>
          )}
        </div>

        
        {!isLocked && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const n = prompt('NOTA PARA COCINA:', item.notes || '');
                if (n !== null) onUpdateNotes?.(item.id, n.toUpperCase());
              }}
              className="text-stone-700 hover:text-brand-gold transition-colors p-1"
              title="Añadir nota"
            >
              <StickyNote size={11} />
            </button>
            <button 
              onClick={() => onRemoveItem(item.id)}
              className="text-stone-800 hover:text-red-500/80 transition-colors p-1"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      
      <div className="flex justify-between items-center bg-stone-950/30 p-2 border border-stone-900/50">
        <div className="flex items-center">
          <button 
            disabled={isLocked}
            onClick={() => onUpdateQuantity(item.id, -1)}
            className={`w-8 h-8 flex items-center justify-center transition-all ${
              isLocked ? 'text-stone-900 cursor-not-allowed' : 'text-stone-600 hover:text-brand-gold hover:bg-brand-gold/5'
            }`}
          >
            <Minus size={12} />
          </button>
          <div className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold font-mono ${
            isLocked ? 'text-stone-800' : 'text-stone-300'
          }`}>
            {item.cantidad}
          </div>
          <button 
            disabled={isLocked}
            onClick={() => onUpdateQuantity(item.id, 1)}
            className={`w-8 h-8 flex items-center justify-center transition-all ${
              isLocked ? 'text-stone-900 cursor-not-allowed' : 'text-stone-600 hover:text-brand-gold hover:bg-brand-gold/5'
            }`}
          >
            <Plus size={12} />
          </button>
        </div>
        <span className={`text-[10px] font-bold tracking-wider font-mono ${isLocked ? 'text-stone-600' : 'text-brand-gold'}`}>
          {formatCOP.format(item.precio_COP * item.cantidad)}
        </span>
      </div>
    </div>
  );
};

export default OrderRow;
