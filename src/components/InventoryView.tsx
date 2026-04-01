import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';

interface InventoryViewProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const CATEGORIES = ['Entradas', 'Fuertes', 'Vinos', 'Postres', 'Café'];

export default function InventoryView({ menuItems, setMenuItems }: InventoryViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ nombre: '', categoria: 'Entradas', precio_COP: 0, descripcion: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newItem.nombre || newItem.precio_COP <= 0) return;
    const item: MenuItem = {
      id: `m${Date.now()}`,
      ...newItem
    };
    setMenuItems(prev => [...prev, item]);
    setNewItem({ nombre: '', categoria: 'Entradas', precio_COP: 0, descripcion: '' });
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    if (confirm('¿ELIMINAR ESTE PRODUCTO DE LA CARTA?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleUpdate = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pl-24">
      <header className="p-6 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[9px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-2">ADMINISTRACIÓN DE CARTA</h1>
          <h2 className="text-2xl font-semibold tracking-tight uppercase">INVENTARIO DE PRODUCTOS</h2>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-6 py-3 bg-brand-gold text-brand-bg text-[9px] font-bold tracking-[0.3em] uppercase hover:opacity-90 transition-all rounded-none"
        >
          <Plus size={14} />
          AGREGAR PRODUCTO
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {isAdding && (
          <div className="mb-8 p-6 border border-brand-gold/30 bg-stone-900/20 space-y-6">
            <h3 className="text-[10px] font-bold tracking-[0.3em] text-brand-gold uppercase">NUEVO PRODUCTO</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[8px] font-bold tracking-widest text-stone-600 uppercase">NOMBRE</label>
                <input 
                  type="text" 
                  value={newItem.nombre}
                  onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value.toUpperCase() })}
                  className="w-full bg-transparent border-b border-stone-800 py-2 text-xs focus:outline-none focus:border-brand-gold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-bold tracking-widest text-stone-600 uppercase">CATEGORÍA</label>
                <select 
                  value={newItem.categoria}
                  onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                  className="w-full bg-transparent border-b border-stone-800 py-2 text-xs focus:outline-none focus:border-brand-gold transition-all appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-brand-bg">{cat.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-bold tracking-widest text-stone-600 uppercase">PRECIO COP</label>
                <input 
                  type="number" 
                  value={newItem.precio_COP}
                  onChange={(e) => setNewItem({ ...newItem, precio_COP: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent border-b border-stone-800 py-2 text-xs focus:outline-none focus:border-brand-gold transition-all"
                />
              </div>
              <div className="flex items-end gap-3">
                <button 
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-brand-gold text-brand-bg text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all rounded-none"
                >
                  GUARDAR
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-3 border border-stone-800 text-stone-600 hover:text-white transition-all rounded-none"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {CATEGORIES.map(category => (
            <section key={category} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-stone-500 uppercase">{category}</h3>
                <div className="flex-1 h-[0.5px] bg-stone-900" />
              </div>
              
              <div className="grid grid-cols-1 gap-1">
                {menuItems.filter(item => item.categoria === category).map(item => (
                  <div key={item.id} className="group flex items-center justify-between py-3 border-b border-stone-900/50 hover:bg-stone-900/10 transition-all px-2">
                    <div className="flex-1 grid grid-cols-[2fr_1fr_1fr] gap-6 items-center">
                      {editingId === item.id ? (
                        <input 
                          type="text" 
                          value={item.nombre}
                          onChange={(e) => handleUpdate(item.id, 'nombre', e.target.value.toUpperCase())}
                          className="bg-transparent border-b border-brand-gold/50 text-xs py-1 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-medium tracking-wide uppercase text-stone-300">{item.nombre}</span>
                      )}
                      
                      <span className="text-[10px] font-bold tracking-widest text-stone-600 uppercase">{item.categoria}</span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-brand-gold text-[10px]">$</span>
                        <input 
                          type="number" 
                          value={item.precio_COP}
                          onChange={(e) => handleUpdate(item.id, 'precio_COP', parseInt(e.target.value) || 0)}
                          className="bg-transparent border-b border-stone-800 text-xs py-1 w-24 focus:outline-none focus:border-brand-gold transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        className="text-stone-600 hover:text-brand-gold transition-all"
                      >
                        {editingId === item.id ? <Save size={14} /> : <Edit3 size={14} />}
                      </button>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-stone-800 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
