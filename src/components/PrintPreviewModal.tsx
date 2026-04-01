import React from 'react';
import { X, Printer, Printer as PrinterIcon } from 'lucide-react';
import { Invoice } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (format: 'A4' | '80mm') => void;
  data: Invoice | null;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  data 
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-stone-900 border border-brand-gold/30 p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold tracking-[0.4em] text-brand-gold uppercase">FORMATO DE IMPRESIÓN</h2>
            <h3 className="text-xl font-semibold tracking-tight uppercase">MESA {data.mesa_numero} · {data.id}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-600 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onConfirm('A4')}
            className="group flex flex-col items-center justify-center gap-6 p-10 border border-stone-800 hover:border-brand-gold transition-all duration-500 bg-stone-950/20"
          >
            <div className="w-16 h-20 border-[3px] border-stone-700 group-hover:border-brand-gold/60 transition-all flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-widest text-stone-700 group-hover:text-brand-gold/60">A4</span>
            </div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-stone-500 group-hover:text-brand-gold">PAPEL ESTÁNDAR</p>
          </button>

          <button
            onClick={() => onConfirm('80mm')}
            className="group flex flex-col items-center justify-center gap-6 p-10 border border-stone-800 hover:border-brand-gold transition-all duration-500 bg-stone-950/20"
          >
            <div className="w-12 h-16 bg-stone-800/40 border border-stone-700 group-hover:border-brand-gold/60 transition-all p-2 flex flex-col gap-1 overflow-hidden">
               <div className="h-[2px] w-full bg-stone-700 group-hover:bg-brand-gold/30 rounded-full" />
               <div className="h-[2px] w-4/5 bg-stone-700 group-hover:bg-brand-gold/30 rounded-full" />
               <div className="h-[2px] w-full bg-stone-700 group-hover:bg-brand-gold/30 rounded-full" />
               <div className="h-[2px] w-1/2 bg-stone-700 group-hover:bg-brand-gold/30 rounded-full" />
            </div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-stone-500 group-hover:text-brand-gold">TÉRMICO 80mm</p>
          </button>
        </div>

        <div className="pt-2 border-t border-stone-800">
           <p className="text-[8px] text-stone-600 text-center leading-relaxed tracking-widest uppercase">
             Seleccione el tamaño para previsualizar y enviar a la impresora predeterminada de su sistema.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
