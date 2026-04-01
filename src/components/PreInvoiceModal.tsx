import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, OrderItem, Invoice } from '../types';
import { X } from 'lucide-react';

interface PreInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (invoice: Invoice) => void;
  selectedTable: Table;
  orderItems: OrderItem[];
  reprintInvoice?: Invoice | null;
}

const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

export default function PreInvoiceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedTable, 
  orderItems,
  reprintInvoice
}: PreInvoiceModalProps) {
  const [tipPercentage, setTipPercentage] = React.useState(0);

  // Sync tip percentage if reprinting
  React.useEffect(() => {
    if (reprintInvoice) {
      setTipPercentage(reprintInvoice.tip_percentage);
    } else {
      setTipPercentage(0);
    }
  }, [reprintInvoice, isOpen]);
  
  const isReprint = !!reprintInvoice;
  const currentItems = isReprint ? reprintInvoice.items : orderItems;
  const subtotal = isReprint ? reprintInvoice.subtotal_COP : currentItems.reduce((acc, item) => acc + item.precio_COP * item.cantidad, 0);
  const tax = isReprint ? reprintInvoice.tax_COP : subtotal * 0.08;
  const tip = isReprint ? reprintInvoice.tip_COP : subtotal * (tipPercentage / 100);
  const total = isReprint ? reprintInvoice.total_COP : subtotal + tax + tip;

  const handleFinalize = () => {
    if (isReprint) {
      console.log('--- REIMPRIMIENDO FACTURA ---', reprintInvoice.id);
      alert(`REIMPRIMIENDO FACTURA ${reprintInvoice.id}`);
      onClose();
      return;
    }

    const invoice: Invoice = {
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      mesa_numero: selectedTable.numero,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...orderItems],
      subtotal_COP: subtotal,
      tax_COP: tax,
      tip_COP: tip,
      tip_percentage: tipPercentage,
      total_COP: total,
      estado: 'PAGADO',
    };
    onConfirm(invoice);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-brand-bg border-thin border-stone-800 w-full max-w-sm overflow-hidden flex flex-col rounded-none shadow-2xl max-h-[95vh]"
          >
            {/* Modal Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Logo & Header */}
              <div className="text-center space-y-1">
                <h1 className="text-lg font-semibold tracking-[0.5em] uppercase">FOOD PASSPORT OS</h1>
                <div className="flex justify-center items-center gap-4">
                  <div className="h-[0.5px] w-8 bg-stone-800" />
                  <span className="text-[10px] font-medium tracking-[0.3em] text-stone-500 uppercase">
                    {isReprint ? 'COPIA DE FACTURA' : 'PRE-FACTURA'}
                  </span>
                  <div className="h-[0.5px] w-8 bg-stone-800" />
                </div>
              </div>

              {/* Table Info */}
              <div className="flex justify-between items-end border-b border-stone-800 pb-4">
                <div>
                  <p className="text-[9px] font-bold text-stone-600 tracking-widest uppercase mb-1">LOCALIDAD</p>
                  <h2 className="text-xl font-semibold tracking-tight uppercase">
                    MESA {isReprint ? reprintInvoice.mesa_numero : selectedTable.numero}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-stone-600 tracking-widest uppercase mb-1">
                    {isReprint ? 'FACTURA ID' : 'FECHA'}
                  </p>
                  <p className="text-xs font-medium tracking-wider uppercase">
                    {isReprint ? reprintInvoice.id : new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {currentItems.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-2">
                    <div className="flex-shrink-0 text-[10px] font-bold text-stone-500 w-6">
                      {item.cantidad}x
                    </div>
                    <div className="flex-1 text-[10px] font-semibold tracking-[0.15em] uppercase whitespace-nowrap overflow-hidden">
                      {item.nombre}
                    </div>
                    <div className="flex-1 border-b border-dotted border-stone-800 mb-1" />
                    <div className="flex-shrink-0 text-[11px] font-semibold tracking-wider">
                      {formatCOP.format(item.precio_COP * item.cantidad)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Slider */}
              <div className="pt-3 border-t border-stone-800 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold tracking-[0.3em] text-stone-600 uppercase">
                    {isReprint ? 'SERVICIO APLICADO' : 'SERVICIO VOLUNTARIO'}
                  </span>
                  <span className="text-[11px] font-bold text-brand-gold">{tipPercentage}%</span>
                </div>
                {!isReprint && (
                  <button 
                    onClick={() => setTipPercentage(tipPercentage === 10 ? 0 : 10)}
                    className={`w-full py-4 border font-bold text-[9px] tracking-[0.4em] uppercase transition-all duration-300 rounded-none shadow-lg ${
                      tipPercentage === 10 
                        ? 'bg-brand-gold text-brand-bg border-brand-gold' 
                        : 'border-stone-800 text-stone-500 hover:text-white hover:border-stone-600 bg-stone-900/20'
                    }`}
                  >
                    {tipPercentage === 10 ? '✓ SERVICIO 10% AGREGADO' : '+ AGREGAR 10% DE SERVICIO'}
                  </button>
                )}
              </div>

              {/* Totals Section */}
              <div className="space-y-1.5 pt-3 border-t border-stone-800">
                <div className="flex justify-between text-[10px] font-medium tracking-widest text-stone-500 uppercase">
                  <span>SUBTOTAL</span>
                  <span>{formatCOP.format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium tracking-widest text-stone-500 uppercase">
                  <span>IMP. CONSUMO (8%)</span>
                  <span>{formatCOP.format(tax)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium tracking-widest text-stone-500 uppercase italic opacity-80">
                  <span>SERVICIO ({tipPercentage}%)</span>
                  <span>{formatCOP.format(tip)}</span>
                </div>
                
                <div className="pt-3 flex justify-between items-baseline">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-brand-gold uppercase">
                    {isReprint ? 'TOTAL PAGADO' : 'TOTAL FINAL'}
                  </span>
                  <span className="text-xl font-bold tracking-tighter text-brand-gold">
                    {formatCOP.format(total)}
                  </span>
                </div>
              </div>

              {/* Footer Message */}
              <div className="text-center pt-3">
                <p className="text-[9px] font-medium tracking-[0.2em] text-stone-600 uppercase leading-relaxed">
                  {isReprint ? 'DOCUMENTO REIMPRESO' : 'GRACIAS POR VISITARNOS'}<br />
                  {isReprint ? 'PARA FINES INFORMATIVOS' : 'ESTE DOCUMENTO NO ES UNA FACTURA LEGAL'}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-stone-900/50 border-t border-stone-800 grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="py-2.5 border-thin border-stone-800 text-stone-500 font-semibold text-[9px] tracking-[0.3em] uppercase hover:text-white hover:border-stone-600 transition-all rounded-none"
              >
                {isReprint ? 'CERRAR' : 'REGRESAR'}
              </button>
              <button
                onClick={handleFinalize}
                className="py-2.5 bg-brand-gold text-brand-bg font-bold text-[9px] tracking-[0.3em] uppercase hover:bg-white transition-all rounded-none"
              >
                {isReprint ? 'REIMPRIMIR' : 'CONFIRMAR & IMPRIMIR'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
