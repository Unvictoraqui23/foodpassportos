import React from 'react';
import { MenuItem } from '../types';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd }) => {
  const isOutOfStock = item.stock !== undefined && item.stock <= 0;

  return (
    <div className={`bg-black border-[0.5px] border-stone-800 p-4 flex flex-col justify-between group hover:border-brand-gold transition-colors duration-500 rounded-none ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white group-hover:text-brand-gold transition-colors">
            {item.nombre}
          </h3>
          <span className="text-[10px] font-semibold text-brand-gold">
            ${item.precio_COP.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-stone-500 font-normal leading-relaxed tracking-wide line-clamp-2">
          {item.descripcion}
        </p>
        
        {item.stock !== undefined && (
          <p className={`text-[8px] font-bold tracking-widest uppercase mt-3 px-2 py-0.5 border inline-block ${isOutOfStock ? 'border-red-500 text-red-500' : (item.stock < 5 ? 'border-amber-500 text-amber-500' : 'border-stone-800 text-stone-600')}`}>
            {isOutOfStock ? 'AGOTADO' : `DISP: ${item.stock} UND`}
          </p>
        )}
      </div>
      
      <button
        disabled={isOutOfStock}
        onClick={() => onAdd(item)}
        className={`mt-4 self-end w-7 h-7 flex items-center justify-center border-[0.5px] border-stone-800 text-stone-600 transition-all duration-300 rounded-none ${isOutOfStock ? 'cursor-not-allowed border-stone-900 text-stone-900' : 'hover:border-brand-gold hover:text-brand-gold'}`}
      >
        <Plus size={12} />
      </button>
    </div>
  );
};


export default MenuItemCard;
