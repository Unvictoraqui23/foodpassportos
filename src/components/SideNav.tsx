import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { LayoutGrid, Utensils, Receipt, Power, Users, History, Menu, X, Settings, Calendar } from 'lucide-react';

interface SideNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  userRole: UserRole;
  syncStatus?: 'online' | 'offline' | 'error';
  onOpenSyncSettings?: () => void;
}

const NAV_ITEMS: { id: AppView; label: string; meseroLabel?: string; icon: any }[] = [
  { id: 'mesas', label: 'MESAS', icon: LayoutGrid },
  { id: 'reservas', label: 'RESERVAS', icon: Calendar },
  { id: 'cocina', label: 'COCINA', icon: Utensils },
  { id: 'facturacion', label: 'FACTURACIÓN', meseroLabel: 'CAJA PRINCIPAL', icon: Receipt },
  { id: 'cierre', label: 'REPORTE Z', icon: Power },
  { id: 'inventario', label: 'INVENTARIO', icon: Menu },
  { id: 'historial', label: 'HISTORIAL', icon: History },
  { id: 'configuracion', label: 'CONFIGURACIÓN', icon: Settings },
];

export default function SideNav({ currentView, onViewChange, userRole, syncStatus = 'offline', onOpenSyncSettings }: SideNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (userRole === 'mesero') {
      return item.id === 'mesas' || item.id === 'reservas';
    }
    return true;
  });

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-stone-800 z-[50] flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="p-2 text-brand-gold hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-[9px] font-bold tracking-[0.4em] text-brand-gold uppercase opacity-80">FOOD PASSPORT</h1>
            <h2 className="text-xs font-semibold tracking-tight uppercase text-white">OS</h2>
          </div>
        </div>
      </div>

      {/* Drawer Trigger Button (Desktop) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex fixed top-8 left-8 z-[60] w-12 h-12 bg-[#0A0A0A] border-[0.5px] border-stone-800 flex-col items-center justify-center gap-1.5 hover:border-brand-gold transition-all duration-300 rounded-none group"
      >
        {isOpen ? (
          <X size={20} className="text-brand-gold" />
        ) : (
          <>
            <div className="w-5 h-[1px] bg-brand-gold group-hover:w-6 transition-all" />
            <div className="w-5 h-[1px] bg-brand-gold" />
            <div className="w-5 h-[1px] bg-brand-gold group-hover:w-4 transition-all" />
          </>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-80 bg-[#0A0A0A] border-r-[0.5px] border-brand-gold/30 flex flex-col rounded-none z-[55] transition-transform duration-500 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-12 pt-32 mb-8">
          <h1 className="text-[10px] font-bold tracking-[0.6em] text-brand-gold uppercase opacity-50 mb-3">FOOD PASSPORT</h1>
          <h2 className="text-2xl font-semibold tracking-tight uppercase text-white">SISTEMA DE GESTIÓN GASTRONÓMICA</h2>
        </div>

        <nav className="flex-1 px-6 space-y-4 overflow-y-auto custom-scrollbar pb-6">
          {filteredNavItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-6 px-6 py-5 transition-all duration-300 rounded-none group relative
                  ${isActive ? 'text-brand-gold' : 'text-stone-500 hover:text-white'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-brand-gold' : 'text-stone-700 group-hover:text-stone-400'} />
                <span className="text-[11px] font-semibold tracking-[0.4em] uppercase">
                  {userRole === 'mesero' && item.meseroLabel ? item.meseroLabel : item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 w-[2px] h-6 bg-brand-gold" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-12 border-t border-stone-900/50 space-y-6">
          <div 
             onClick={onOpenSyncSettings}
             className="cursor-pointer group flex items-center gap-3 bg-stone-900/20 border border-stone-800/40 p-3 hover:border-brand-gold transition-all duration-500 rounded-none overflow-hidden"
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              syncStatus === 'online' ? 'bg-emerald-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'
            }`} />
            <span className="text-[8px] font-bold tracking-[0.4em] text-stone-600 group-hover:text-white uppercase transition-colors">
              {syncStatus === 'online' ? 'RED: ONLINE' : syncStatus === 'error' ? 'RED: ERROR' : 'RED: CONECTANDO...'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-stone-900 border border-stone-800 flex items-center justify-center text-[11px] font-bold text-brand-gold">
              {userRole === 'admin' ? 'AD' : 'ME'}
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-white">
                {userRole === 'admin' ? 'V. RODRIGUEZ' : 'MESERO TABLET'}
              </p>
              <p className="text-[9px] text-stone-600 uppercase tracking-widest">
                {userRole === 'admin' ? 'ADMINISTRADOR' : 'MESERO'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
