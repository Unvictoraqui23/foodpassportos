import React from 'react';
import { Invoice } from '../types';
import { TrendingUp, Award, Clock, DollarSign, Banknote, CreditCard, Smartphone, FileText } from 'lucide-react';



interface DashboardViewProps {
  historial: Invoice[];
}

const formatCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

export default function DashboardView({ historial }: DashboardViewProps) {
  // Filtrar solo facturas pagadas (excluir anuladas)
  const paidInvoices = historial.filter(inv => inv.estado === 'PAGADO');

  // Total Ventas
  const totalSales = paidInvoices.reduce((acc, inv) => acc + inv.total_COP, 0);
  
  // Ventas por método de pago
  const salesByMethod = paidInvoices.reduce((acc, inv) => {
    const method = inv.metodoPago || 'EFECTIVO';
    acc[method] = (acc[method] || 0) + inv.total_COP;
    return acc;
  }, {} as Record<string, number>);

  // Top Productos
  const productCounts = paidInvoices.reduce((acc, inv) => {
    inv.items.forEach(item => {
      acc[item.nombre] = (acc[item.nombre] || 0) + item.cantidad;
    });
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-brand-bg pt-16 md:pt-0 md:pl-24 print:bg-white print:text-black print:pl-0">
      <header className="p-6 lg:p-12 border-b border-stone-800 print:border-black">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-[9px] font-bold tracking-[0.5em] text-stone-600 uppercase print:text-gray-500">PANEL DE CONTROL</h1>
            <h2 className="text-xl lg:text-3xl font-bold tracking-tight uppercase text-white print:text-black">INTELIGENCIA DE NEGOCIO</h2>
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-3 px-6 py-3 bg-stone-900 border border-stone-800 text-stone-400 text-[9px] font-bold tracking-[0.2em] uppercase hover:text-brand-gold hover:border-brand-gold transition-all rounded-none print:hidden"
          >
            <FileText size={14} />
            EXPORTAR PDF
          </button>
        </div>
      </header>



      <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-12 no-scrollbar pb-32">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-stone-900/20 border border-stone-800 p-8 space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase text-xs">Ventas Totales</p>
              <TrendingUp size={16} className="text-brand-gold" />
            </div>
            <p className="text-3xl font-bold tracking-tighter text-white">{formatCOP.format(totalSales)}</p>
          </div>

          <div className="bg-stone-900/20 border border-stone-800 p-8 space-y-4">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase text-xs">Transacciones</p>
              <Clock size={16} className="text-stone-500" />
            </div>
            <p className="text-3xl font-bold tracking-tighter text-white">{paidInvoices.length}</p>
          </div>

          <div className="bg-stone-900/20 border border-stone-800 p-8 space-y-4">
            <div className="flex justify-between items-start text-emerald-500 font-bold uppercase text-[10px] tracking-widest">
               <div className="flex items-center gap-2">
                 <Banknote size={14} />
                 <span>Efectivo</span>
               </div>
            </div>
            <p className="text-xl font-bold tracking-tight text-stone-300">
              {formatCOP.format(salesByMethod['EFECTIVO'] || 0)}
            </p>
          </div>

          <div className="bg-stone-900/20 border border-stone-800 p-8 space-y-4">
            <div className="flex justify-between items-start text-blue-500 font-bold uppercase text-[10px] tracking-widest">
               <div className="flex items-center gap-2">
                 <CreditCard size={14} />
                 <span>Tarjetas</span>
               </div>
            </div>
            <p className="text-xl font-bold tracking-tight text-stone-300">
              {formatCOP.format(salesByMethod['TARJETA'] || 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Top Products */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Award className="text-brand-gold" size={20} />
              <h3 className="text-xs font-bold tracking-[0.3em] uppercase underline-offset-8">TOP 5 PRODUCTOS</h3>
            </div>
            <div className="bg-stone-950/40 border border-stone-900 shadow-2xl">
              {topProducts.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between p-6 border-b border-stone-900 last:border-0 hover:bg-stone-900/20 transition-all">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-stone-700">0{i + 1}</span>
                    <p className="text-xs font-bold tracking-widest uppercase text-stone-300">{name}</p>
                  </div>
                  <span className="text-[10px] font-mono text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-none border border-brand-gold/20">
                    {count} VENDIDOS
                  </span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="p-12 text-center text-[10px] text-stone-700 uppercase tracking-widest">
                   Sin datos de ventas registrados
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <DollarSign className="text-stone-500" size={20} />
              <h3 className="text-xs font-bold tracking-[0.3em] uppercase">MÉTODOS DE RECAUDO</h3>
            </div>
            <div className="space-y-2">
               {Object.entries(salesByMethod).map(([method, amount]) => {
                 const pct = totalSales > 0 ? (amount / totalSales) * 100 : 0;
                 return (
                   <div key={method} className="bg-stone-950/20 p-6 space-y-3 border border-stone-900">
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">{method}</p>
                        <p className="text-sm font-bold text-white">{formatCOP.format(amount)}</p>
                      </div>
                      <div className="h-1 bg-stone-900 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${method === 'EFECTIVO' ? 'bg-emerald-500' : (method === 'TARJETA' ? 'bg-blue-500' : 'bg-brand-gold')}`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      <p className="text-[8px] text-stone-700 text-right font-mono">{pct.toFixed(1)}% DEL TOTAL</p>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Footer Insight */}
        <footer className="pt-12 border-t border-stone-900/50">
           <div className="flex items-start gap-6 opacity-40">
              <TrendingUp size={24} className="text-brand-gold shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-[9px] font-bold tracking-[0.3em] text-stone-500 uppercase">Proyección Diaria</p>
                <p className="text-[8px] tracking-widest font-medium text-stone-600 uppercase leading-relaxed max-w-xl">
                  Estos datos reflejan el historial acumulado en el servidor para el día presente. Use el cierre de caja para reiniciar estas métricas cada jornada.
                </p>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
