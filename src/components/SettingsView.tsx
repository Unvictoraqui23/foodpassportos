import React, { useState } from 'react';
import { StaffMember, AppConfig } from '../types';
import { Shield, Users, Save, Lock, Smartphone, Plus, Edit2, Trash2, X, LayoutGrid, Tag } from 'lucide-react';

interface SettingsViewProps {
  adminPin: string;
  setAdminPin: (pin: string) => void;
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  appConfig: AppConfig;
  setAppConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onClearHistory?: () => void;
}


export default function SettingsView({ 
  adminPin, 
  setAdminPin, 
  staff, 
  setStaff,
  categories,
  setCategories,
  appConfig,
  setAppConfig,
  onClearHistory
}: SettingsViewProps) {


  const [newAdminPin, setNewAdminPin] = useState(adminPin);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSaveAdminPin = () => {
    if (newAdminPin.length !== 4 || isNaN(Number(newAdminPin))) {
      alert('EL PIN DEBE SER DE 4 DÍGITOS NUMÉRICOS');
      return;
    }
    setAdminPin(newAdminPin);
    setSuccessMsg('PIN DE ADMINISTRADOR ACTUALIZADO');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUpdateStaffPin = (id: string, newPin: string) => {
    if (newPin.length > 4) newPin = newPin.slice(0, 4);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, pin: newPin } : s));
  };

  const handleAddStaff = () => {
    const nombre = prompt('NOMBRE DEL NUEVO MESERO:');
    if (nombre) {
      const rol = prompt('ROL (MESERO, CAPITÁN, ETC):') || 'MESERO';
      const pin = prompt('PIN DE 4 DÍGITOS PARA ESTE USUARIO:') || '0000';
      const newMember: StaffMember = {
        id: `s${Date.now()}`,
        nombre: nombre.toUpperCase(),
        rol: rol.toUpperCase(),
        pin: pin.slice(0, 4).replace(/\D/g, '')
      };
      setStaff(prev => [...prev, newMember]);
    }
  };

  const handleEditStaffName = (id: string) => {
    const member = staff.find(s => s.id === id);
    if (!member) return;
    const nuevoNombre = prompt('EDITAR NOMBRE:', member.nombre);
    if (nuevoNombre) {
      const nuevoRol = prompt('EDITAR ROL:', member.rol) || member.rol;
      setStaff(prev => prev.map(s => s.id === id ? { ...s, nombre: nuevoNombre.toUpperCase(), rol: nuevoRol.toUpperCase() } : s));
    }
  };

  const handleRemoveStaff = (id: string) => {
    if (confirm('¿ESTÁ SEGURO DE ELIMINAR A ESTE MIEMBRO DEL EQUIPO?')) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddCategory = () => {
    const name = prompt('NOMBRE DE LA NUEVA CATEGORÍA:');
    if (name && !categories.includes(name.toUpperCase())) {
      setCategories(prev => [...prev, name.toUpperCase()]);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    if (confirm(`¿ELIMINAR CATEGORÍA "${cat}"? LOS PRODUCTOS ASOCIADOS NO SE BORRARÁN PERO NO TENDRÁN CATEGORÍA ASIGNADA.`)) {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  const updateConfig = (field: keyof AppConfig, value: string | number) => {
    setAppConfig(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pt-16 md:pt-0 md:pl-24">
      <header className="p-6 lg:p-12 border-b border-stone-800">
        <div>
          <h1 className="text-[10px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-3">SISTEMA & SEGURIDAD</h1>
          <h2 className="text-2xl lg:text-4xl font-semibold tracking-tight uppercase">CONFIGURACIÓN</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-16 no-scrollbar pb-32">
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 text-emerald-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">
            {successMsg}
          </div>
        )}

        {/* Admin PIN Section */}
        <section className="max-w-2xl space-y-8 text-white">
          <div className="flex items-center gap-4">
            <Shield className="text-brand-gold" size={24} />
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase">ACCESO ADMINISTRADOR</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end bg-stone-950/50 border border-stone-900 p-8 shadow-2xl">
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">NUEVO PIN MAESTRO</label>
              <input 
                type="password" 
                maxLength={4}
                value={newAdminPin}
                onChange={(e) => setNewAdminPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-2xl font-mono text-brand-gold tracking-[1em] focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
              />
            </div>
            <button 
              onClick={handleSaveAdminPin}
              className="flex items-center justify-center gap-3 bg-brand-gold text-brand-bg px-8 py-5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all rounded-none shadow-lg"
            >
              <Save size={16} />
              ACTUALIZAR SEGURIDAD
            </button>
          </div>
        </section>

        {/* Staff Management Section */}
        <section className="max-w-4xl space-y-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Users className="text-stone-500" size={24} />
              <h3 className="text-sm font-bold tracking-[0.3em] uppercase">GESTIÓN DE EQUIPO (MESEROS)</h3>
            </div>
            <button 
              onClick={handleAddStaff}
              className="px-6 py-3 bg-stone-900 border border-stone-800 text-brand-gold text-[10px] font-bold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-bg transition-all flex items-center gap-3"
            >
              <Plus size={14} />
              AGREGAR MIEMBRO
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {staff.map(member => (
               <div 
                key={member.id} 
                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 border border-stone-900 bg-stone-950/20 hover:bg-stone-950/40 hover:border-stone-700 transition-all gap-6"
               >
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-stone-900 border border-stone-800 flex items-center justify-center text-[11px] font-bold text-brand-gold group-hover:border-brand-gold/40 transition-colors">
                        {member.nombre.split(' ').map(n => n[0]).join('')}
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-bold tracking-widest uppercase text-white">{member.nombre}</p>
                          <button onClick={() => handleEditStaffName(member.id)} className="text-stone-700 hover:text-brand-gold transition-colors">
                            <Edit2 size={12} />
                          </button>
                        </div>
                        <p className="text-[8px] text-stone-600 tracking-[0.2em] uppercase mt-1">{member.rol}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="space-y-2">
                       <label className="text-[7px] font-bold tracking-widest text-stone-700 uppercase block ml-1">PIN DE ACCESO</label>
                       <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={12} />
                        <input 
                          type="text" 
                          maxLength={4}
                          value={member.pin || ''}
                          onChange={(e) => handleUpdateStaffPin(member.id, e.target.value.replace(/\D/g, ''))}
                          className="bg-stone-900/50 border border-stone-800 pl-10 pr-4 py-3 text-sm font-mono text-stone-200 w-36 focus:outline-none focus:border-brand-gold/40 transition-all rounded-none"
                        />
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveStaff(member.id)}
                      className="w-10 h-10 flex items-center justify-center text-stone-800 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
               </div>
             ))}

             {staff.length === 0 && (
               <div className="p-16 text-center border border-stone-900 border-dashed bg-stone-950/10 shadow-inner">
                 <p className="text-[10px] text-stone-700 uppercase tracking-[0.4em] mb-2">No hay equipo configurado</p>
                 <p className="text-[8px] text-stone-800 uppercase tracking-widest">Use el botón superior para agregar personal</p>
               </div>
             )}
          </div>
        </section>

        {/* Global Configuration Section */}
        <section className="max-w-4xl space-y-8 text-white">
          <div className="flex items-center gap-4">
            <LayoutGrid className="text-stone-500" size={24} />
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase">ENTORNO Y SALÓN</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-stone-950/30 border border-stone-900 p-8">
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">NOMBRE DEL ESTABLECIMIENTO</label>
              <input 
                type="text" 
                value={appConfig.restaurantName}
                onChange={(e) => updateConfig('restaurantName', e.target.value.toUpperCase())}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">NIT / Identificación</label>
              <input 
                type="text" 
                value={appConfig.nit || ''}
                onChange={(e) => updateConfig('nit', e.target.value.toUpperCase())}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
                placeholder="EJ: 900.123.456-1"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">Dirección</label>
              <input 
                type="text" 
                value={appConfig.direccion || ''}
                onChange={(e) => updateConfig('direccion', e.target.value.toUpperCase())}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">Ciudad</label>
              <input 
                type="text" 
                value={appConfig.ciudad || ''}
                onChange={(e) => updateConfig('ciudad', e.target.value.toUpperCase())}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-950/30 border border-stone-900 p-8">
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">CANTIDAD DE MESAS</label>
              <input 
                type="number" 
                min={1}
                max={100}
                value={appConfig.tableCount}
                onChange={(e) => updateConfig('tableCount', parseInt(e.target.value) || 1)}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-bold tracking-[0.2em] text-stone-500 uppercase">IMPUESTO AL CONSUMO (%)</label>
              <input 
                type="number" 
                value={appConfig.taxPercentage}
                onChange={(e) => updateConfig('taxPercentage', parseInt(e.target.value) || 0)}
                className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-white focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
              />
            </div>
          </div>

        </section>

        {/* Danger Zone */}
        <section className="space-y-10 pt-10 border-t border-red-900/30">
          <div className="flex items-center gap-4 text-red-500">
            <Trash2 size={20} />
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase">ZONA DE PELIGRO / MANTENIMIENTO</h3>
          </div>

          <div className="bg-red-950/10 border border-red-900/20 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-widest text-red-200 uppercase text-center md:text-left">BORRAR TODO EL HISTORIAL DE VENTAS</p>
              <p className="text-[9px] text-red-900 font-medium uppercase tracking-[0.2em] text-center md:text-left">
                ESTA ACCIÓN ES IRREVERSIBLE. SE ELIMINARÁN TODAS LAS FACTURAS GUARDADAS EN LA BASE DE DATOS LOCAL.
              </p>
            </div>
            <button 
              onClick={() => {
                if (confirm('¿ESTÁ TOTALMENTE SEGURO? ESTA ACCIÓN ELIMINARÁ TODA LA DATA HISTÓRICA DEFINITIVAMENTE.')) {
                  onClearHistory?.();
                }
              }}
              className="px-8 py-4 bg-red-600 text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-red-500 transition-all rounded-none shrink-0"
            >
              ELIMINAR FACTURAS
            </button>
          </div>
        </section>

        {/* Categories Section */}

        <section className="max-w-4xl space-y-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Tag className="text-stone-500" size={24} />
              <h3 className="text-sm font-bold tracking-[0.3em] uppercase">CATEGORÍAS DE MENÚ</h3>
            </div>
            <button 
              onClick={handleAddCategory}
              className="px-6 py-3 bg-stone-900 border border-stone-800 text-brand-gold text-[10px] font-bold tracking-widest uppercase hover:bg-brand-gold hover:text-brand-bg transition-all flex items-center gap-3"
            >
              <Plus size={14} />
              AÑADIR CATEGORÍA
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
             {categories.map(cat => (
               <div key={cat} className="flex items-center gap-4 bg-stone-900/50 border border-stone-800 px-6 py-3 group">
                  <span className="text-[10px] font-bold tracking-widest text-stone-300">{cat}</span>
                  <button onClick={() => handleRemoveCategory(cat)} className="text-stone-700 hover:text-red-500 transition-colors">
                    <X size={12} />
                  </button>
               </div>
             ))}
          </div>
        </section>


        <section className="pt-12 border-t border-stone-900/50 max-w-2xl">
           <div className="flex items-start gap-6 opacity-40">
              <Smartphone size={24} className="text-stone-600 shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-[9px] font-bold tracking-[0.3em] text-stone-500 uppercase">Sincronización Multi-Dispositivo</p>
                <p className="text-[8px] tracking-widest font-medium text-stone-600 uppercase leading-relaxed">
                  Todos los cambios en el equipo y niveles de acceso se propagan instantáneamente a través de FPOS Sync a todas las terminales.
                </p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
