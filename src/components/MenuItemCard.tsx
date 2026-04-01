import React from 'react';
import { MenuItem } from '../types';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAdd }) => {
  return (
    <div className="bg-black border-[0.5px] border-stone-800 p-4 flex flex-col justify-between group hover:border-brand-gold transition-colors duration-500 rounded-none">
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
      </div>
      
      <button
        onClick={() => onAdd(item)}
        className="mt-4 self-end w-7 h-7 flex items-center justify-center border-[0.5px] border-stone-800 text-stone-600 hover:border-brand-gold hover:text-brand-gold transition-all duration-300 rounded-none"
      >
        <Plus size={12} />
      </button>
    </div>
  );
};

export default MenuItemCard;
