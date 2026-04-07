import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, StaffMember } from '../types';
import { Delete, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (role: UserRole) => void;
  isLocked?: boolean;
  staff?: StaffMember[];
  syncStatus?: 'online' | 'offline' | 'error';
  onOpenSyncSettings?: () => void;
  adminPin: string;
}

export default function AuthScreen({ onAuthenticated, isLocked = false, staff = [], syncStatus = 'offline', onOpenSyncSettings, adminPin }: AuthScreenProps) {
  const [selectedUser, setSelectedUser] = useState<StaffMember | 'ADMIN' | null>(null);
  const [showStaffList, setShowStaffList] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const validatePin = () => {
    if (selectedUser === 'ADMIN') {
      if (pin === adminPin) {
        onAuthenticated('admin');
        return;
      }
    } else if (selectedUser && typeof selectedUser === 'object') {
      if (pin === selectedUser.pin) {
        onAuthenticated('mesero');
        return;
      }
    }

    setError(true);
    setPin('');
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(validatePin, 200);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const handleBack = () => {
    if (pin.length > 0) {
      setPin('');
      setError(false);
    } else if (selectedUser) {
      setSelectedUser(null);
    } else if (showStaffList) {
      setShowStaffList(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black ${isLocked ? 'backdrop-blur-xl bg-black/80' : ''}`}
    >
      <div className="w-full max-w-[320px] space-y-12">
        <header className="text-center space-y-2 relative">
          {(selectedUser || showStaffList) && (
            <button 
              onClick={handleBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white group transition-colors"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          {/* Sync Status Overlay/Bubble */}
          <div 
             onClick={onOpenSyncSettings}
             className="absolute -top-16 left-1/2 -translate-x-1/2 cursor-pointer group flex items-center gap-2 bg-stone-900/50 border border-stone-800/50 px-3 py-1.5 hover:border-brand-gold transition-all duration-500 rounded-none overflow-hidden"
          >
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              syncStatus === 'online' ? 'bg-emerald-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'
            }`} />
            <span className="text-[7px] font-bold tracking-[0.4em] text-stone-600 group-hover:text-white uppercase transition-colors">
              {syncStatus === 'online' ? 'RED: OK' : syncStatus === 'error' ? 'RED: ERROR' : 'RED: CONECTANDO...'}
            </span>
          </div>

          <h1 className="text-[10px] font-bold tracking-[0.8em] text-brand-gold uppercase opacity-60">
            {isLocked ? 'SESIÓN PROTEGIDA' : 'FOOD PASSPORT OS'}
          </h1>
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-white font-sans">
            {selectedUser ? 'INGRESE PIN' : (showStaffList ? 'SELECCIONAR STAFF' : 'SELECCIONAR USUARIO')}
          </h2>
          {selectedUser && (
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2">
              {selectedUser === 'ADMIN' ? 'ADMINISTRADOR' : (selectedUser as StaffMember).nombre}
            </p>
          )}
        </header>

        {!selectedUser ? (
          <div className="space-y-4">
            {!showStaffList && !isMobile ? (
              <>
                <button
                  onClick={() => setSelectedUser('ADMIN')}
                  className="w-full p-6 border border-brand-gold/30 hover:border-brand-gold bg-stone-900/50 hover:bg-stone-900 transition-all rounded-none text-left flex justify-between items-center group"
                >
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-white">ADMINISTRADOR</p>
                    <p className="text-[8px] text-brand-gold tracking-[0.2em] uppercase mt-1">ACCESO COMPLETO</p>
                  </div>
                </button>
                <button
                  onClick={() => setShowStaffList(true)}
                  className="w-full p-6 border border-stone-800 hover:border-brand-gold bg-stone-900/20 hover:bg-stone-900/50 transition-all rounded-none text-left flex justify-between items-center group"
                >
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-stone-300 group-hover:text-white">PERFIL MESEROS</p>
                    <p className="text-[8px] text-stone-600 tracking-[0.2em] uppercase mt-1 group-hover:text-brand-gold/80">ACCESO LIMITADO</p>
                  </div>
                </button>
              </>
            ) : (!showStaffList && isMobile) ? (
               <button
                  onClick={() => setShowStaffList(true)}
                  className="w-full p-8 border border-stone-800 hover:border-brand-gold bg-stone-900/20 hover:bg-stone-900/50 transition-all rounded-none text-left flex justify-between items-center group"
                >
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-stone-300 group-hover:text-white">ENTRAR COMO STAFF</p>
                    <p className="text-[8px] text-stone-600 tracking-[0.2em] uppercase mt-1 group-hover:text-brand-gold/80">SELECCIONAR MESERO</p>
                  </div>
                </button>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                {staff.length > 0 ? (
                  staff.map(member => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedUser(member)}
                      className="w-full p-4 border border-stone-800 hover:border-stone-500 bg-stone-900/10 hover:bg-stone-900/40 transition-all rounded-none text-left group"
                    >
                      <p className="text-xs font-bold tracking-widest uppercase text-stone-400 group-hover:text-white">{member.nombre}</p>
                      <p className="text-[8px] text-stone-700 tracking-[0.2em] uppercase mt-1 group-hover:text-stone-500">
                        {member.rol} {member.pin ? '' : '(SIN PIN)'}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center border border-stone-800/50">
                    <p className="text-[9px] text-stone-600 uppercase tracking-widest">No hay meseros configurados</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex justify-center gap-6">
              {[...Array(4)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`w-3 h-3 rounded-full border-[0.5px] ${
                    error 
                      ? 'border-red-500 bg-red-500' 
                      : pin.length > i 
                        ? 'border-brand-gold bg-brand-gold' 
                        : 'border-stone-800'
                  } transition-all duration-200`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-px bg-brand-gold/20 border-[0.5px] border-brand-gold/30">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="aspect-square bg-black text-2xl font-bold text-white hover:bg-brand-gold hover:text-black transition-all active:scale-95 flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <div className="bg-black" />
              <button
                onClick={() => handleNumberClick('0')}
                className="aspect-square bg-black text-2xl font-bold text-white hover:bg-brand-gold hover:text-black transition-all active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="aspect-square bg-black flex items-center justify-center text-stone-600 hover:text-brand-gold transition-all active:scale-95"
              >
                <Delete size={24} />
              </button>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[10px] font-bold tracking-widest text-red-500 uppercase"
              >
                ACCESO DENEGADO
              </motion.p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
