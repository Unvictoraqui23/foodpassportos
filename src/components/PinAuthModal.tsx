import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete } from 'lucide-react';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  requiredPin: string;
  title: string;
}

const PinAuthModal: React.FC<PinAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthenticated, 
  requiredPin,
  title
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

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
    if (pin === requiredPin) {
      onAuthenticated();
      onClose();
    } else {
      setError(true);
      setPin('');
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(validatePin, 300);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[320px] bg-stone-950 border border-stone-800 p-8 space-y-10 animate-in zoom-in-95 duration-500 rounded-none relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-700 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <header className="text-center space-y-2">
          <h1 className="text-[10px] font-bold tracking-[0.6em] text-brand-gold uppercase opacity-60">
            AUTORIZACIÓN REQUERIDA
          </h1>
          <h2 className="text-xl font-semibold tracking-tight uppercase text-white">
            {title}
          </h2>
        </header>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i}
              animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-3 h-3 rounded-full border ${
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
        <div className="grid grid-cols-3 gap-px bg-stone-800/20 border border-stone-800/30">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="aspect-square bg-stone-950 text-xl font-bold text-white hover:bg-brand-gold hover:text-black transition-all active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div className="bg-stone-950" />
          <button
            onClick={() => handleNumberClick('0')}
            className="aspect-square bg-stone-950 text-xl font-bold text-white hover:bg-brand-gold hover:text-black transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="aspect-square bg-stone-950 flex items-center justify-center text-stone-700 hover:text-brand-gold transition-all active:scale-95"
          >
            <Delete size={20} />
          </button>
        </div>

        {error && (
          <p className="text-center text-[10px] font-bold tracking-widest text-red-500 uppercase animate-bounce">
            PIN INCORRECTO
          </p>
        )}
      </div>
    </div>
  );
};

export default PinAuthModal;
