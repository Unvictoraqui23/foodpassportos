import React from 'react';
import { Invoice, OrderItem } from '../types';

interface PrinterTemplateProps {
  data: Invoice | null;
  format: 'A4' | '80mm';
}

const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

const PrinterTemplate: React.FC<PrinterTemplateProps> = ({ data, format }) => {
  if (!data) return null;

  const isThermal = format === '80mm';

  return (
    <div id="printable-area" className={`bg-white text-black p-4 ${isThermal ? 'w-[80mm] text-[10px]' : 'w-[210mm] min-h-[297mm] text-sm mx-auto'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: ${isThermal ? '80mm' : '210mm'};
          }
          @page {
            size: ${isThermal ? '80mm auto' : 'A4'};
            margin: 0;
          }
        }
      `}} />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">FOOD PASSPORT OS</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-1">Gastro-Control Premium</p>
        <div className="mt-4 border-t border-b border-black py-2">
          <p className="font-bold uppercase text-xs">MESA {data.mesa_numero}</p>
          <p className="text-[9px]">FACTURA: {data.id} · {data.fecha_ISO}</p>
          <p className="text-[9px]">HORA: {data.hora}</p>
        </div>
      </div>

      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="border-b border-black text-left uppercase text-[9px]">
            <th className="py-2">CANT</th>
            <th className="py-2">DESCRIPCIÓN</th>
            <th className="py-2 text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100 text-[10px]">
              <td className="py-2">{item.cantidad}</td>
              <td className="py-2 uppercase">{item.nombre}</td>
              <td className="py-2 text-right">{formatCOP.format(item.precio_COP * item.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-right border-t border-black pt-4">
        <div className="flex justify-between font-mono text-[10px]">
          <span>SUBTOTAL:</span>
          <span>{formatCOP.format(data.subtotal_COP)}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span>IVA/INC (8%):</span>
          <span>{formatCOP.format(data.tax_COP)}</span>
        </div>
        <div className="flex justify-between font-mono text-[10px]">
          <span>SERVICIO ({data.tip_percentage}%):</span>
          <span>{formatCOP.format(data.tip_COP)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-black uppercase tracking-tighter">
          <span>TOTAL:</span>
          <span>{formatCOP.format(data.total_COP)}</span>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[9px] uppercase tracking-[0.3em] font-bold">Gracias por su visita</p>
        <p className="text-[7px] text-gray-500 mt-2">vHrod.dev Digital Menu & Control</p>
        {isThermal && <div className="h-20" />} {/* Spacer for thermal paper tear-off */}
      </div>
    </div>
  );
};

export default PrinterTemplate;
