/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { Table, OrderItem, MenuItem, UserRole } from './types';
import AuthScreen from './components/AuthScreen';
import AutoLock from './components/AutoLock';
import TableGrid from './components/TableGrid';
import OrderSidebar from './components/OrderSidebar';
import MenuCategorySelector from './components/MenuCategorySelector';
import MenuItemCard from './components/MenuItemCard';
import PreInvoiceModal from './components/PreInvoiceModal';
import SideNav from './components/SideNav';
import HistoryView from './components/HistoryView';
import StaffView from './components/StaffView';
import KitchenView from './components/KitchenView';
import BillingView from './components/BillingView';
import InventoryView from './components/InventoryView';
import ZReportView from './components/ZReportView';
import PrintPreviewModal from './components/PrintPreviewModal';
import PrinterTemplate from './components/PrinterTemplate';
import PinAuthModal from './components/PinAuthModal';
import { AppView, StaffMember, Invoice } from './types';
import { X } from 'lucide-react';

// Mock Data
const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  numero: i + 1,
  estado: 'libre',
}));

const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', nombre: 'CARLOS MENDOZA', rol: 'MESERO SENIOR' },
  { id: 's2', nombre: 'ANA GARCÍA', rol: 'MESERA' },
  { id: 's3', nombre: 'LUIS TORRES', rol: 'MESERO' },
];

const MENU_CATEGORIES = ['Entradas', 'Fuertes', 'Vinos', 'Postres', 'Café'];

const MOCK_MENU: MenuItem[] = [
  { id: 'm1', nombre: 'Carpaccio de Res', descripcion: 'Láminas finas de solomillo, alcaparras, parmesano y aceite de trufa.', precio_COP: 42000, categoria: 'Entradas' },
  { id: 'm2', nombre: 'Pulpo a la Brasa', descripcion: 'Tentáculo de pulpo, puré de papa criolla y pimentón de la vera.', precio_COP: 58000, categoria: 'Entradas' },
  { id: 'm3', nombre: 'Risotto de Hongos', descripcion: 'Arroz arborio, variedad de setas silvestres y aceite de trufa blanca.', precio_COP: 65000, categoria: 'Fuertes' },
  { id: 'm4', nombre: 'Salmón en Costra', descripcion: 'Filete de salmón con costra de pistacho y espárragos trigueros.', precio_COP: 72000, categoria: 'Fuertes' },
  { id: 'm5', nombre: 'Malbec Reserva', descripcion: 'Copa de vino tinto con notas de frutos rojos y roble.', precio_COP: 35000, categoria: 'Vinos' },
];

function genLineId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `l-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function migrateOrderLineIds(items: OrderItem[]): OrderItem[] {
  return items.map((it, i) => ({
    ...it,
    lineId:
      it.lineId ??
      `legacy-${it.tableId}-${it.id}-${i}-${it.status}-${it.comandaId ?? 'x'}`,
  }));
}

const SYNC_URL = `http://${window.location.hostname}:3001/api`;

const INITIAL_SYNC_URL = `http://${window.location.hostname}:3001/api`;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('mesero');
  const [currentView, setCurrentView] = useState<AppView>('mesas');
  const [syncUrl, setSyncUrl] = useState(() => {
    return localStorage.getItem('pos_sync_url') || INITIAL_SYNC_URL;
  });
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'error'>('offline');
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState(false);
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [allOrderItems, setAllOrderItems] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('pos_orders');
    if (!saved) return [];
    return migrateOrderLineIds(JSON.parse(saved) as OrderItem[]);
  });
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [historial, setHistorial] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('pos_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('pos_menu');
    return saved ? JSON.parse(saved) : MOCK_MENU;
  });
  const [activeCategory, setActiveCategory] = useState('Entradas');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [tableTips, setTableTips] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pos_tips');
    return saved ? JSON.parse(saved) : {};
  });
  const [pendingCaja, setPendingCaja] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('pos_pending_caja');
    return saved ? JSON.parse(saved) : {};
  });
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);
  const [printQueue, setPrintQueue] = useState<Invoice | null>(null);
  const [printFormat, setPrintFormat] = useState<'A4' | '80mm'>('A4');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAuthZModalOpen, setIsAuthZModalOpen] = useState(false);
  const [lastServerUpdate, setLastServerUpdate] = useState(0);
  // Refs para evitar closures stale en los efectos de sync
  const lastServerUpdateRef = useRef(0);
  const tablesRef = useRef(tables);
  const allOrderItemsRef = useRef(allOrderItems);
  const historialRef = useRef(historial);
  const tableTipsRef = useRef(tableTips);
  const pendingCajaRef = useRef(pendingCaja);
  const syncUrlRef = useRef(syncUrl);

  // Mantener refs sincronizados
  React.useEffect(() => { tablesRef.current = tables; }, [tables]);
  React.useEffect(() => { allOrderItemsRef.current = allOrderItems; }, [allOrderItems]);
  React.useEffect(() => { historialRef.current = historial; }, [historial]);
  React.useEffect(() => { tableTipsRef.current = tableTips; }, [tableTips]);
  React.useEffect(() => { pendingCajaRef.current = pendingCaja; }, [pendingCaja]);
  React.useEffect(() => { syncUrlRef.current = syncUrl; }, [syncUrl]);
  React.useEffect(() => { lastServerUpdateRef.current = lastServerUpdate; }, [lastServerUpdate]);

  // Initial Load from Server with Local Fallback
  React.useEffect(() => {
    const initSync = async () => {
      try {
        const res = await fetch(`${syncUrl}/state`);
        if (!res.ok) { setSyncStatus('error'); return; }
        const data = await res.json();
        setSyncStatus('online');
        
        // Only override if server actually has a record
        if (data && data.lastUpdate > 0) {
          console.log('%c[SYNC] Syncing initial state from server...', 'color: #C5A059');
          setTables(data.tables || INITIAL_TABLES);
          setAllOrderItems(data.orders || []);
          setHistorial(data.history || []);
          setTableTips(data.tips || {});
          setPendingCaja(data.pendingCaja || {});
          setLastServerUpdate(data.lastUpdate);
        } else {
          console.log('[SYNC] Server is empty. Ready for local data.');
        }
      } catch (e) {
        setSyncStatus('error');
        console.warn('Sync server not reachable.');
      }
    };
    initSync();
  }, [syncUrl]);

  // Push local changes to server - usa refs para siempre tener el estado más reciente
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performPush = useCallback(async () => {
    try {
      console.log('[SYNC] Pushing local state to server...');
      const res = await fetch(`${syncUrlRef.current}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tables: tablesRef.current, 
          orders: allOrderItemsRef.current, 
          history: historialRef.current, 
          tips: tableTipsRef.current, 
          pendingCaja: pendingCajaRef.current,
          // Enviamos nuestro TS para que el servidor detecte pushes desactualizados
          clientLastUpdate: lastServerUpdateRef.current,
        })
      });

      if (res.status === 409) {
        // El servidor tiene datos más recientes — absorber su estado
        const data = await res.json();
        if (data.serverState) {
          console.warn('%c[SYNC] Conflicto detectado — absorbiendo estado del servidor', 'color:#f39c12');
          const srv = data.serverState;
          lastServerUpdateRef.current = srv.lastUpdate;
          setTables(srv.tables ?? []);
          setAllOrderItems(migrateOrderLineIds(srv.orders ?? []));
          setHistorial(srv.history ?? []);
          setTableTips(srv.tips ?? {});
          setPendingCaja(srv.pendingCaja ?? {});
          setLastServerUpdate(srv.lastUpdate);
          setSyncStatus('online');
        }
        return;
      }

      if (res.ok) {
        const data = await res.json();
        lastServerUpdateRef.current = data.lastUpdate;
        setLastServerUpdate(data.lastUpdate);
        setSyncStatus('online');
      }
    } catch (e) {
      setSyncStatus('error');
    }
  }, []); // Sin dependencias — siempre lee de refs

  React.useEffect(() => {
    // Guardar localmente
    localStorage.setItem('pos_tables', JSON.stringify(tables));
    localStorage.setItem('pos_orders', JSON.stringify(allOrderItems));
    localStorage.setItem('pos_history', JSON.stringify(historial));
    localStorage.setItem('pos_tips', JSON.stringify(tableTips));
    localStorage.setItem('pos_pending_caja', JSON.stringify(pendingCaja));

    // Debounce Sync Push (800ms para respuesta más rápida)
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(performPush, 800);
    
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [tables, allOrderItems, historial, tableTips, pendingCaja, syncUrl, performPush]);

  // Polling para recibir actualizaciones — usa ref para lastServerUpdate y evita recrear el intervalo
  React.useEffect(() => {
    const pollId = setInterval(async () => {
      try {
        const res = await fetch(`${syncUrlRef.current}/state`);
        if (!res.ok) { setSyncStatus('error'); return; }
        const data = await res.json();
        
        // Comparar contra el ref (siempre actualizado), no el estado del closure
        if (data && data.lastUpdate > lastServerUpdateRef.current) {
          console.log('%c[SYNC] Nueva actualización entrante detectada!', 'color: #2ecc71', `TS: ${data.lastUpdate}`);
          lastServerUpdateRef.current = data.lastUpdate;
          setTables(data.tables ?? []);
          setAllOrderItems(migrateOrderLineIds(data.orders ?? []));
          setHistorial(data.history ?? []);
          setTableTips(data.tips ?? {});
          setPendingCaja(data.pendingCaja ?? {});
          setLastServerUpdate(data.lastUpdate);
          setSyncStatus('online');
        } else if (data) {
          setSyncStatus('online');
        }
      } catch (e) {
        setSyncStatus('error');
      }
    }, 1500); // Polling más frecuente: 1.5s
    return () => clearInterval(pollId);
  }, []); // Sin dependencias — siempre opera desde refs

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView('mesas');
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleLogin} />;
  }

  // Derived state for the selected table
  const currentTableOrders = allOrderItems.filter(item => item.tableId === selectedTable?.id);

  const handleAddItem = (item: MenuItem) => {
    if (!selectedTable) return;

    setAllOrderItems(prev => {
      const existingDraft = prev.find(i => i.id === item.id && i.status === 'draft' && i.tableId === selectedTable.id);
      if (existingDraft) {
        return prev.map(i => (i.id === item.id && i.status === 'draft' && i.tableId === selectedTable.id) ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...item, cantidad: 1, status: 'draft', tableId: selectedTable.id, lineId: genLineId() }];
    });

    if (selectedTable.estado === 'libre') {
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, estado: 'ocupada' } : t));
      setSelectedTable(prev => prev ? { ...prev, estado: 'ocupada' } : null);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setAllOrderItems(prev => prev.map(item => {
      if (item.id === id && item.status === 'draft' && item.tableId === selectedTable?.id) {
        const newQty = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setAllOrderItems(prev => prev.filter(item => !(item.id === id && item.status === 'draft' && item.tableId === selectedTable?.id)));
  };

  const handleSendOrder = () => {
    if (!selectedTable) return;
    const comandaId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const tableId = selectedTable.id;

    setAllOrderItems(prev => prev.map(item => 
      (item.status === 'draft' && item.tableId === tableId) ? { ...item, status: 'sent', comandaId } : item
    ));
    
    // Auto-marcar en cola de caja para todos los roles al confirmar
    setPendingCaja(prev => ({ ...prev, [tableId]: true }));
    
    setIsMobileOrderOpen(false);

    // Push inmediato — sin esperar el debounce de 800ms
    // Usamos un microtask para que los setStates anteriores ya hayan actualizado los refs
    setTimeout(() => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      performPush();
    }, 50);
  };

  const handleMarkReady = (comandaId: string) => {
    const tableId = allOrderItems.find(i => i.comandaId === comandaId)?.tableId;
    if (!tableId) return;

    setAllOrderItems(prev => prev.map(item => 
      item.comandaId === comandaId ? { ...item, status: 'ready' } : item
    ));

    setTables(prev => prev.map(t => t.id === tableId ? { ...t, estado: 'lista' } : t));
  };

  const handleReleaseTable = (tableId: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, estado: 'libre' } : t));
    setAllOrderItems(prev => prev.filter(item => item.tableId !== tableId));
    setTableTips(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    setPendingCaja(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    if (selectedTable?.id === tableId) setSelectedTable(null);
  };

  const handleSendToCashRegister = () => {
    if (!selectedTable) return;
    const tid = selectedTable.id;
    const items = allOrderItems.filter(i => i.tableId === tid);
    const hasKitchen = items.some(i => i.status === 'sent' || i.status === 'ready');
    if (!hasKitchen) return;
    setPendingCaja(prev => ({ ...prev, [tid]: true }));
    alert('Cuenta enviada a caja principal. Aparece en el menú CAJA PRINCIPAL.');
  };

  const handleCobroCompletoEnCaja = (tableId: string) => {
    handleReleaseTable(tableId);
    // Push inmediato para que todos los dispositivos vean la mesa libre al instante
    setTimeout(() => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      performPush();
    }, 50);
  };

  const releaseEmptyTableIfNeeded = (tableId: string, items: OrderItem[]) => {
    if (items.some(i => i.tableId === tableId)) return;
    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, estado: 'libre' } : t)));
    setPendingCaja(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    setTableTips(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    setSelectedTable(cur => (cur?.id === tableId ? null : cur));
  };

  const handleBillingLineQuantityDelta = (lineId: string, delta: number) => {
    setAllOrderItems(prev => {
      const next = prev
        .map(item => {
          if (item.lineId !== lineId) return item;
          const q = item.cantidad + delta;
          if (q < 1) return null;
          return { ...item, cantidad: q };
        })
        .filter((x): x is OrderItem => x !== null);
      const victim = prev.find(i => i.lineId === lineId);
      if (victim && !next.some(i => i.tableId === victim.tableId)) {
        const tid = victim.tableId;
        queueMicrotask(() => releaseEmptyTableIfNeeded(tid, next));
      }
      return next;
    });
  };

  const handleBillingRemoveLine = (lineId: string) => {
    setAllOrderItems(prev => {
      const victim = prev.find(i => i.lineId === lineId);
      const next = prev.filter(i => i.lineId !== lineId);
      if (victim && !next.some(i => i.tableId === victim.tableId)) {
        const tid = victim.tableId;
        queueMicrotask(() => releaseEmptyTableIfNeeded(tid, next));
      }
      return next;
    });
  };

  const finalizarYCerrarMesa = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const tableOrders = allOrderItems.filter(item => item.tableId === tableId);
    if (tableOrders.length === 0) return;

    const subtotal = tableOrders.reduce((acc, item) => acc + item.precio_COP * item.cantidad, 0);
    const tax = subtotal * 0.08;
    const tipPercentage = tableTips[tableId] || 0;
    const tip = subtotal * (tipPercentage / 100);
    const total = subtotal + tax + tip;

    const invoice: Invoice = {
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      mesa_numero: table.numero,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fecha_ISO: new Date().toISOString().split('T')[0],
      items: [...tableOrders],
      subtotal_COP: subtotal,
      tax_COP: tax,
      tip_COP: tip,
      tip_percentage: tipPercentage,
      total_COP: total,
      estado: 'PAGADO',
    };

    setHistorial(prev => [invoice, ...prev]);
    handleReleaseTable(tableId);
    alert(`MESA ${table.numero} FINALIZADA Y CERRADA`);
  };

  const handleAddInvoice = (invoice: Invoice) => {
    setHistorial(prev => [invoice, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm('¿ESTÁ SEGURO DE QUE DESEA REALIZAR EL CIERRE? SE ELIMINARÁ EL HISTORIAL DE HOY.')) {
      console.log('--- GENERANDO REPORTE Z ---');
      console.log('FECHA:', new Date().toLocaleString());
      console.log('TRANSACCIONES:', historial.length);
      console.log('TOTAL:', historial.reduce((acc, inv) => acc + inv.total_COP, 0));
      console.log('---------------------------');
      
      setHistorial([]);
      alert('CIERRE DE CAJA EXITOSO. EL HISTORIAL HA SIDO REINICIADO.');
    }
  };

  const handleTriggerPrint = (invoice: Invoice) => {
    setPrintQueue(invoice);
    setIsPrintModalOpen(true);
  };

  const handlePrintInvoiceDirect = () => {
    if (!selectedTable) return;
    
    const subtotal = currentTableOrders.reduce((acc, item) => acc + item.precio_COP * item.cantidad, 0);
    const tax = subtotal * 0.08;
    const tipPercentage = tableTips[selectedTable.id] ?? 0;
    const tip = subtotal * (tipPercentage / 100);
    const total = subtotal + tax + tip;

    const invoice: Invoice = {
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      mesa_numero: selectedTable.numero,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fecha_ISO: new Date().toISOString().split('T')[0],
      items: [...currentTableOrders],
      subtotal_COP: subtotal,
      tax_COP: tax,
      tip_COP: tip,
      tip_percentage: tipPercentage,
      total_COP: total,
      estado: 'PAGADO',
    };

    // Finalizar: agregar a historial + liberar mesa
    handleAddInvoice(invoice);
    handleReleaseTable(selectedTable.id);
    handleTriggerPrint(invoice);
    // Push inmediato para propagar a todos los dispositivos
    setTimeout(() => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      performPush();
    }, 50);
  };

  const handlePreAuthZReport = () => {
    setIsAuthZModalOpen(true);
  };

  const handlePrintZReportDirect = () => {
    if (historial.length === 0) {
      alert('Sin historial para reporte');
      return;
    }
    const totalVentas = historial.reduce((acc, inv) => acc + inv.total_COP, 0);
    const zInvoice: Invoice = {
      id: `Z-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
      mesa_numero: 0,
      hora: new Date().toLocaleTimeString(),
      fecha_ISO: new Date().toISOString().split('T')[0],
      items: [
        { id: 'z1', nombre: 'REPORTE Z ACUMULADO', descripcion: 'Ventas del día', precio_COP: totalVentas, categoria: 'ADMIN', cantidad: 1, status: 'ready', tableId: '0' }
      ],
      subtotal_COP: totalVentas / 1.08,
      tax_COP: totalVentas - (totalVentas / 1.08),
      tip_COP: 0,
      tip_percentage: 0,
      total_COP: totalVentas,
      estado: 'PAGADO',
    };
    setPrintQueue(zInvoice);
    setIsPrintModalOpen(true);
  };

  const handleExecutePrint = (format: 'A4' | '80mm') => {
    setPrintFormat(format);
    setIsPrintModalOpen(false);
    // Give time for template to render before printing
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleViewTableHistory = () => {
    setCurrentView('historial');
  };

  const renderView = () => {
    switch (currentView) {
      case 'mesas':
        return (
          <main className="flex-1 flex flex-col overflow-hidden pl-24">
            <header className="p-6 lg:p-12 border-b border-stone-800 flex justify-between items-end gap-4 overflow-x-auto no-scrollbar">
              <div className="shrink-0 min-w-max">
                <h1 className="text-[10px] font-bold tracking-[0.6em] text-stone-600 uppercase mb-3">GESTIÓN DE SALÓN</h1>
                <h2 className="text-2xl lg:text-4xl font-semibold tracking-tight uppercase">
                  {selectedTable ? `MESA ${selectedTable.numero}` : 'SALÓN PRINCIPAL'}
                </h2>
              </div>
              <div className="flex gap-4 lg:gap-6 shrink-0">
                {selectedTable && (
                  <button 
                    onClick={() => setSelectedTable(null)}
                    className="px-4 lg:px-8 py-2.5 lg:py-3 border border-stone-800 text-stone-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.3em] hover:text-white hover:border-brand-gold transition-all rounded-none"
                  >
                    VOLVER
                  </button>
                )}
                <button 
                  onClick={() => setIsAuthenticated(false)}
                  className="px-4 lg:px-8 py-2.5 lg:py-3 border border-stone-800 text-stone-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.3em] hover:text-white hover:border-brand-gold transition-all rounded-none"
                >
                  SALIR
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {!selectedTable ? (
                <TableGrid 
                  tables={tables} 
                  onTableSelect={setSelectedTable}
                  selectedTableId={selectedTable?.id}
                  pendingCajaByTable={pendingCaja}
                  allOrderItems={allOrderItems}
                />
              ) : (
                <div className="flex flex-col h-full">
                  <MenuCategorySelector 
                    categories={MENU_CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8 p-6 lg:p-12">
                    {menuItems.filter(item => item.categoria === activeCategory).map(item => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        onAdd={handleAddItem} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        );
      case 'historial':
        return userRole === 'admin' ? <HistoryView historial={historial} userRole={userRole} /> : null;
      case 'meseros':
        return userRole === 'admin' ? <StaffView staff={staff} setStaff={setStaff} /> : null;
      case 'cocina':
        return <KitchenView allOrderItems={allOrderItems} onMarkReady={handleMarkReady} />;
      case 'facturacion':
        return (
          <BillingView 
            tables={tables} 
            allOrderItems={allOrderItems} 
            onAddInvoice={handleAddInvoice}
            userRole={userRole}
            pendingCajaByTable={pendingCaja}
            tableTips={tableTips}
            onCobroCompleto={handleCobroCompletoEnCaja}
            onBillingLineQuantityDelta={handleBillingLineQuantityDelta}
            onBillingRemoveLine={handleBillingRemoveLine}
            historial={historial}
            onPrintInvoice={handleTriggerPrint}
          />
        );
      case 'cierre':
        return userRole === 'admin' ? <ZReportView historial={historial} onClearHistory={handlePreAuthZReport} /> : null;
      case 'inventario':
        return userRole === 'admin' ? <InventoryView menuItems={menuItems} setMenuItems={setMenuItems} /> : null;
      default:
        return null;
    }
  };

  return (
    <AutoLock 
      isAuthenticated={isAuthenticated} 
      userRole={userRole} 
      onReAuthenticate={handleLogin}
      lockTimeSeconds={60}
    >
      <div className="flex h-screen bg-brand-bg overflow-hidden font-sans text-white">
        <SideNav 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          userRole={userRole}
        />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {renderView()}

          {currentView === 'mesas' && selectedTable && (
            <aside className={`
              lg:w-[380px] lg:h-full lg:flex-shrink-0 lg:border-l lg:border-stone-900 bg-brand-bg transition-all duration-300
              ${isMobileOrderOpen ? 'fixed inset-0 z-[60] flex flex-col' : 'hidden lg:block'}
            `}>
              <div className="lg:hidden p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                 <div>
                   <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-brand-gold">MESA {selectedTable.numero}</h2>
                   <p className="text-[8px] text-stone-600 uppercase tracking-widest mt-1">REVISIÓN DE PEDIDO</p>
                 </div>
                 <button 
                  onClick={() => setIsMobileOrderOpen(false)}
                  className="w-10 h-10 border border-stone-800 flex items-center justify-center text-stone-500 rounded-none overflow-hidden"
                 >
                   <X size={18} />
                 </button>
              </div>

              <div className="flex-1 h-full overflow-hidden">
                <OrderSidebar 
                  selectedTable={selectedTable}
                  orderItems={currentTableOrders}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onSendOrder={handleSendOrder}
                  onRequestInvoice={() => setIsInvoiceOpen(true)}
                  onPrintInvoice={handlePrintInvoiceDirect}
                  onFinalize={() => finalizarYCerrarMesa(selectedTable.id)}
                  onViewHistory={handleViewTableHistory}
                  onSendToCashRegister={handleSendToCashRegister}
                  pendingCaja={!!pendingCaja[selectedTable.id]}
                  userRole={userRole}
                />
              </div>
            </aside>
          )}

          {currentView === 'mesas' && selectedTable && !isMobileOrderOpen && currentTableOrders.some(i => i.status === 'draft') && (
            <button
              onClick={() => setIsMobileOrderOpen(true)}
              className="lg:hidden fixed bottom-8 right-8 z-40 bg-brand-gold text-brand-bg px-6 py-4 font-bold text-[10px] tracking-[0.4em] uppercase shadow-2xl flex items-center gap-4"
            >
              VER PEDIDO ({currentTableOrders.filter(i => i.status === 'draft').length})
            </button>
          )}
        </div>

        {selectedTable && currentView === 'mesas' && userRole === 'admin' && (
          <PreInvoiceModal 
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            onConfirm={(invoice) => {
              setTableTips(prev => ({ ...prev, [selectedTable.id]: invoice.tip_percentage }));
              setIsInvoiceOpen(false);
              // Finalizar la mesa: agregar al historial de facturas y liberarla
              // Sin esto, la mesa quedaba ocupada indefinidamente tras imprimir por esta vía
              handleAddInvoice(invoice);
              handleReleaseTable(selectedTable.id);
              setPrintQueue(invoice);
              setIsPrintModalOpen(true);
              // Push inmediato para propagar a todos los dispositivos
              setTimeout(() => {
                if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
                performPush();
              }, 50);
            }}
            selectedTable={selectedTable}
            orderItems={currentTableOrders}
            reprintInvoice={null}
          />
        )}

        {/* Print, Auth and Sync Modals */}
        <PrintPreviewModal 
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          onConfirm={handleExecutePrint}
          data={printQueue}
        />

        <PinAuthModal 
          isOpen={isAuthZModalOpen}
          onClose={() => setIsAuthZModalOpen(false)}
          onAuthenticated={handlePrintZReportDirect}
          requiredPin="1234"
          title="AUTORIZAR REPORTE Z"
        />

        {isSyncSettingsOpen && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="w-full max-w-sm bg-stone-950 border border-stone-800 p-10 space-y-8 rounded-none">
             <div className="space-y-1">
               <h2 className="text-[10px] font-bold tracking-[0.4em] text-brand-gold uppercase">AJUSTES DE RED</h2>
               <h3 className="text-xl font-semibold tracking-tight uppercase text-white">SINCRONIZACIÓN FPOS</h3>
             </div>
             
             <div className="space-y-4 text-white">
               <div className="space-y-2">
                 <label className="text-[8px] font-bold tracking-[0.2em] text-stone-600 uppercase">SERVIDOR IP / URL</label>
                 <input 
                   type="text" 
                   value={syncUrl}
                   onChange={(e) => setSyncUrl(e.target.value)}
                   className="w-full bg-stone-900 border border-stone-800 p-4 text-xs font-mono text-stone-200 focus:outline-none focus:border-brand-gold/60 transition-all rounded-none"
                   placeholder="http://192.168.1.3:3001/api"
                 />
               </div>
               <p className="text-[8px] text-stone-700 leading-relaxed tracking-widest uppercase">
                 Ingrese la dirección IP de la computadora principal. 
               </p>
             </div>

             <div className="flex gap-4 pt-4 text-white">
               <button 
                 onClick={() => {
                   performPush();
                   setIsSyncSettingsOpen(false);
                 }}
                 className="flex-1 py-3 bg-brand-gold text-brand-bg text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all rounded-none"
               >
                 SINCRONIZAR AHORA
               </button>
               <button 
                 onClick={() => setSyncUrl(INITIAL_SYNC_URL)}
                 className="px-6 py-3 border border-stone-800 text-stone-600 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-white transition-all rounded-none"
               >
                 RESET
               </button>
             </div>
           </div>
         </div>
        )}

        {/* Sync Status Overlay/Bubble */}
        <div 
          onClick={() => setIsSyncSettingsOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] cursor-pointer group flex items-center gap-3 bg-black/40 backdrop-blur-md border border-stone-800 p-2 lg:p-3 hover:border-brand-gold transition-all duration-500 rounded-none overflow-hidden"
        >
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            syncStatus === 'online' ? 'bg-emerald-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'
          }`} />
          <span className="text-[8px] font-bold tracking-[0.4em] text-stone-500 group-hover:text-white uppercase transition-colors hidden lg:block">
            {syncStatus === 'online' ? 'RED: ONLINE' : syncStatus === 'error' ? 'RED: ERROR' : 'RED: CONECTANDO...'}
          </span>
        </div>
        
        <div id="printable-area" className="fixed opacity-0 pointer-events-none -z-50 invisible print:visible print:opacity-100 print:fixed print:inset-0 print:bg-white print:text-black print:z-[200]">
          <PrinterTemplate 
            data={printQueue}
            format={printFormat}
          />
        </div>
      </div>
    </AutoLock>
  );
}
