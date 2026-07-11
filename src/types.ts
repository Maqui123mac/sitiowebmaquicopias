export interface OrderOptions {
  copies: number;
  paperType: string;
  size: string;
  colorMode: 'Color' | 'Blanco y Negro';
  sides: 'Una cara' | 'Ambas caras';
  instructions?: string;
}

export interface Order {
  id: string; // e.g. PED-101
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  options: OrderOptions;
  fileName?: string;
  fileSize?: string;
  totalPrice: number;
  status: 'Pendiente' | 'En proceso' | 'Listo para entrega' | 'Entregado' | 'Cancelado';
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  paperOptions: string[];
  sizeOptions: string[];
  colorOptions: ('Color' | 'Blanco y Negro')[];
  sideOptions: ('Una cara' | 'Ambas caras')[];
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProcessOrders: number;
  readyOrders: number;
  completedOrders: number;
  totalRevenue: number;
}
