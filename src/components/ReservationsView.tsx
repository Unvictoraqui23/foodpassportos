import React, { useState } from 'react';
import { Table, Reservation } from '../types';
import { Calendar, Users, Clock, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ReservationsViewProps {
  tables: Table[];
  reservations: Reservation[];
  onAddReservation: (res: Omit<Reservation, 'id' | 'status'>) => void;
  onUpdateReservationStatus: (id: string, status: Reservation['status']) => void;
  onRemoveReservation: (id: string) => void;
}

export default function ReservationsView({ 
  tables, 
  reservations, 
  onAddReservation, 
  onUpdateReservationStatus, 
  onRemoveReservation 
}: ReservationsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    tableId: '',
    cliente: '',
    personas: 2,
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableId || !formData.cliente) {
      alert('POR FAVOR COMPLETE TODOS LOS CAMPOS');
      return;
    }
    const table = tables.find(t => t.id === formData.tableId);
    onAddReservation({
      ...formData,
      tableNumero: table?.numero || 0
    });
    setIsAdding(false);
    setFormData({
      tableId: '',
      cliente: '',
      personas: 2,
      fecha: new Date().toISOString().split('T')[0],
      hora: '19:00'
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pt-16 md:pt-0 md:pl-24">
      <header className="p-6 lg:p-12 border-b border-stone-800 flex justify-between items-end">
        <div>
          <h1 className="text-[10px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-3">AGENDA GASTRONÓMICA</h1>
          <h2 className="text-2xl lg:text-4xl font-semibold tracking-tight uppercase text-white">RESERVAS</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-gold text-brand-bg px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all flex items-center gap-3"
        >
          <Plus size={16} />
          NUEVA RESERVA
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-12 no-scrollbar pb-32">
        {isAdding && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-stone-950 border border-stone-800 p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-[10px] font-bold tracking-[0.4em] text-brand-gold uppercase">SISTEMA DE RESERVAS</h2>
                  <h3 className="text-xl font-semibold tracking-tight uppercase text-white">RESERVAR MESA</h3>
                </div>
                <button type="button" onClick={() => setIsAdding(false)} className="text-stone-500 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold tracking-[0.2em] text-stone-600 uppercase">CLIENTE</label>
                  <input 
                    type="text" 
                    required
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value.toUpperCase()})}
                    className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-bold text-white focus:outline-none focus:border-brand-gold/60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold tracking-[0.2em] text-stone-600 uppercase">MESA</label>
                  <select 
                    value={formData.tableId}
                    onChange={(e) => setFormData({...formData, tableId: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-bold text-white focus:outline-none focus:border-brand-gold/60 transition-all appearance-none"
                  >
                    <option value="">SELECCIONAR...</option>
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>MESA {t.numero} ({t.estado})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold tracking-[0.2em] text-stone-600 uppercase">PERSONAS</label>
                  <input 
                    type="number" 
                    min={1}
                    value={formData.personas}
                    onChange={(e) => setFormData({...formData, personas: parseInt(e.target.value)})}
                    className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-bold text-white focus:outline-none focus:border-brand-gold/60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold tracking-[0.2em] text-stone-600 uppercase">HORA</label>
                  <input 
                    type="time" 
                    value={formData.hora}
                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-bold text-white focus:outline-none focus:border-brand-gold/60 transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[8px] font-bold tracking-[0.2em] text-stone-600 uppercase">FECHA</label>
                  <input 
                    type="date" 
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-bold text-white focus:outline-none focus:border-brand-gold/60 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-gold text-brand-bg py-5 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all shadow-xl"
              >
                CONFIRMAR RESERVA
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reservations.length === 0 ? (
            <div className="col-span-full py-32 text-center border border-stone-900 border-dashed bg-stone-950/20">
              <p className="text-[10px] text-stone-700 uppercase tracking-[0.5em]">No hay reservas programadas</p>
            </div>
          ) : (
            reservations.sort((a,b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)).map(res => (
              <div 
                key={res.id} 
                className={`p-8 border ${res.status === 'pending' ? 'border-stone-800 bg-stone-950/40' : 'border-stone-900 bg-stone-950/10 opacity-50'} space-y-6 relative group transition-all`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white uppercase">{res.cliente}</h4>
                    <p className="text-[8px] text-brand-gold tracking-[0.3em] uppercase mt-1">MESA {res.tableNumero}</p>
                  </div>
                  <div className={`px-3 py-1 text-[7px] font-black tracking-widest uppercase border ${
                    res.status === 'pending' ? 'border-amber-900/30 text-amber-500 bg-amber-900/5' : 
                    res.status === 'completed' ? 'border-emerald-900/30 text-emerald-500 bg-emerald-900/5' :
                    'border-red-900/30 text-red-500 bg-red-900/5'
                  }`}>
                    {res.status === 'pending' ? 'PENDIENTE' : res.status === 'completed' ? 'LLEGÓ' : 'CANCELADO'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-stone-900 pt-6">
                  <div className="space-y-2">
                    <Calendar className="text-stone-700" size={14} />
                    <p className="text-[9px] font-bold text-stone-500 uppercase">{res.fecha.split('-').reverse().join('/')}</p>
                  </div>
                  <div className="space-y-2">
                    <Clock className="text-stone-700" size={14} />
                    <p className="text-[9px] font-bold text-stone-500 uppercase">{res.hora}</p>
                  </div>
                  <div className="space-y-2">
                    <Users className="text-stone-700" size={14} />
                    <p className="text-[9px] font-bold text-stone-500 uppercase">{res.personas} PERS.</p>
                  </div>
                </div>

                {res.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => onUpdateReservationStatus(res.id, 'completed')}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/10 border border-emerald-600/20 text-emerald-500 py-3 text-[8px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <CheckCircle size={12} /> LLEGÓ
                    </button>
                    <button 
                      onClick={() => onUpdateReservationStatus(res.id, 'cancelled')}
                      className="flex items-center justify-center w-12 bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => onRemoveReservation(res.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-none"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
