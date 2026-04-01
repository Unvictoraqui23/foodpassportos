import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { Delete } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (role: UserRole) => void;
  isLocked?: boolean;
}

const ADMIN_PIN = '1234';
const WAITER_PIN = '0000';

export default function AuthScreen({ onAuthenticated, isLocked = false }: AuthScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

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
    if (pin === ADMIN_PIN) {
      onAuthenticated('admin');
    } else if (pin === WAITER_PIN) {
      onAuthenticated('mesero');
    } else {
      setError(true);
      setPin('');
      // Haptic feedback simulation
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(validatePin, 200);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black ${isLocked ? 'backdrop-blur-xl bg-black/80' : ''}`}
    >
      <div className="w-full max-w-[320px] space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-[10px] font-bold tracking-[0.8em] text-brand-gold uppercase opacity-60">
            {isLocked ? 'SESIÓN PROTEGIDA' : 'FOOD PASSPORT OS'}
          </h1>
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-white font-sans">
            INGRESE PIN
          </h2>
        </header>

        {/* PIN Indicators */}
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

        {/* Numeric Keypad */}
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
    </motion.div>
  );
}
