/**
 * Food Passport OS - Core Types
 */

export type TableStatus = 'libre' | 'ocupada' | 'reservada' | 'lista';

export interface Table {
  id: string;
  numero: number;
  estado: TableStatus;
  cuenta_id?: string;
}

export interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio_COP: number;
  categoria: string;
}

export type OrderItemStatus = 'draft' | 'sent' | 'ready' | 'delivered';

export interface OrderItem extends MenuItem {
  cantidad: number;
  status: OrderItemStatus;
  comandaId?: string;
  tableId: string;
  /** Identificador único por línea (ajustes en caja, migración desde datos sin lineId) */
  lineId?: string;
}

export type OrderStatus = 'pendiente' | 'enviado' | 'completado';

export type AppView = 'mesas' | 'cocina' | 'facturacion' | 'meseros' | 'historial' | 'cierre' | 'inventario';

export type UserRole = 'admin' | 'mesero';

export interface Invoice {
  id: string;
  mesa_numero: number;
  hora: string;
  fecha_ISO?: string;
  items: OrderItem[];
  subtotal_COP: number;
  tax_COP: number;
  tip_COP: number;
  tip_percentage: number;
  total_COP: number;
  estado: 'PAGADO' | 'ANULADO';
}

export interface StaffMember {
  id: string;
  nombre: string;
  rol: string;
}

export interface Order {
  id: string;
  mesa_id: string;
  items: OrderItem[];
  total_COP: number;
  estado: OrderStatus;
}
