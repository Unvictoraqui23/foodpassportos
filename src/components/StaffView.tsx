import React, { useState } from 'react';
import { StaffMember } from '../types';
import { Plus, MoreVertical, Edit2, Trash2, X } from 'lucide-react';

interface StaffViewProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

export default function StaffView({ staff, setStaff }: StaffViewProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  const handleAddStaff = () => {
    const nombre = prompt('NOMBRE DEL NUEVO MESERO:');
    if (nombre) {
      const rol = prompt('ROL (MESERO, CAPITÁN, ETC):') || 'MESERO';
      const newMember: StaffMember = {
        id: `s${Date.now()}`,
        nombre: nombre.toUpperCase(),
        rol: rol.toUpperCase(),
      };
      setStaff(prev => [...prev, newMember]);
    }
  };

  const handleEditStaff = (id: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;

    const nuevoNombre = prompt('EDITAR NOMBRE:', member.nombre);
    if (nuevoNombre) {
      const nuevoRol = prompt('EDITAR ROL:', member.rol) || member.rol;
      setStaff(prev => prev.map(s => s.id === id ? { ...s, nombre: nuevoNombre.toUpperCase(), rol: nuevoRol.toUpperCase() } : s));
    }
    setSelectedStaff(null);
  };

  const handleRemoveStaff = (id: string) => {
    if (confirm('¿ESTÁ SEGURO DE ELIMINAR A ESTE MIEMBRO DEL EQUIPO?')) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
    setSelectedStaff(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pl-24">
      {/* Header */}
      <header className="p-6 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[9px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-2">GESTIÓN DE PERSONAL</h1>
          <h2 className="text-2xl font-semibold tracking-tight uppercase">EQUIPO DE SERVICIO</h2>
        </div>
        
        <button 
          onClick={handleAddStaff}
          className="w-12 h-12 bg-brand-gold flex items-center justify-center text-brand-bg hover:opacity-90 transition-all rounded-none"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Staff List */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="max-w-3xl space-y-3">
          {staff.map((member) => (
            <div 
              key={member.id}
              className={`
                relative p-5 border transition-all duration-500 rounded-none group flex items-center justify-between
                ${selectedStaff === member.id ? 'border-brand-gold bg-stone-900/40' : 'border-stone-800/50 hover:border-stone-600'}
              `}
              onClick={() => setSelectedStaff(selectedStaff === member.id ? null : member.id)}
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] font-bold text-brand-gold">
                  {member.nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-widest uppercase mb-0.5">{member.nombre}</h3>
                  <p className="text-[9px] font-light tracking-[0.4em] text-stone-600 uppercase">{member.rol}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="h-8 w-[1px] bg-stone-800" />
                <button className="text-stone-700 group-hover:text-stone-400 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Action Overlay */}
              {selectedStaff === member.id && (
                <div className="absolute inset-0 bg-[#0A0A0A]/95 flex items-center justify-end gap-8 px-12 animate-in slide-in-from-right duration-300">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditStaff(member.id); }}
                    className="flex items-center gap-3 hover:text-brand-gold group transition-all"
                  >
                    <Edit2 size={18} className="text-stone-600 group-hover:text-brand-gold" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500 group-hover:text-white">EDITAR</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveStaff(member.id); }}
                    className="flex items-center gap-3 hover:text-red-900 group transition-all"
                  >
                    <Trash2 size={18} className="text-stone-600 group-hover:text-red-500" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-stone-500 group-hover:text-white">ELIMINAR</span>
                  </button>
                  <button 
                    className="ml-8 text-stone-700 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStaff(null);
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
