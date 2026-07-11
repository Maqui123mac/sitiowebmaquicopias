import { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, Loader2, CheckCircle2, DollarSign, ListFilter, 
  Trash2, RefreshCw, Eye, Sparkles, Filter, Search, FileDown, PlusCircle
} from 'lucide-react';
import { Order, DashboardStats } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    console.log("Firestore real-time synchronization is active.");
  };

  useEffect(() => {
    setIsLoading(true);
    const ordersRef = collection(db, 'orders');

    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersList: Order[] = snapshot.docs.map(doc => doc.data() as Order);
      
      // Sort newest first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(ordersList);

      // Compute statistics dynamically
      const computedStats: DashboardStats = {
        totalOrders: ordersList.length,
        pendingOrders: ordersList.filter(o => o.status === 'Pendiente').length,
        inProcessOrders: ordersList.filter(o => o.status === 'En proceso').length,
        readyOrders: ordersList.filter(o => o.status === 'Listo para entrega').length,
        completedOrders: ordersList.filter(o => o.status === 'Entregado').length,
        totalRevenue: ordersList
          .filter(o => o.status !== 'Cancelado')
          .reduce((sum, o) => sum + o.totalPrice, 0)
      };
      setStats(computedStats);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore real-time subscription error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdatingId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(orderRef, updateData);

      // Update local state for selected order immediately if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updateData } : null);
      }

      // Sync to local server backend as backup
      try {
        await fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (syncErr) {
        console.warn('Local backup sync bypassed:', syncErr);
      }
    } catch (err) {
      console.error("Error updating order status in Firestore:", err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este pedido de la base de datos de Firebase?')) {
      return;
    }

    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }

      // Sync to local server backend as backup
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE'
        });
      } catch (syncErr) {
        console.warn('Local backup delete sync bypassed:', syncErr);
      }
    } catch (err) {
      console.error("Error deleting order from Firestore:", err);
    }
  };

  // Create a randomized mock order for testing demo directly in Firebase
  const handleGenerateMockOrder = async () => {
    const mockNames = ["Alejandro Ruiz", "Beatriz Ortiz", "Gerardo Sánchez", "Diana Villarreal", "Roberto Gómez", "Elena Fuentes"];
    const mockPhones = ["4435559988", "4432223344", "4431110022", "4437778899", "4434445566"];
    const mockFiles = ["tesis_final_v2.pdf", "logo_empresa.png", "invitación_boda_ejemplo.pdf", "comprobante_pago.jpg", "foto_perfil.jpg"];
    const mockServices = [
      { name: "Impresiones a Color", base: 5.0, paper: "Normal 75g", size: "Carta" },
      { name: "Impresiones Fotográficas", base: 15.0, paper: "Fotográfico Premium Brillante", size: "4x6 pulgadas" },
      { name: "Impresión Opalina", base: 12.0, paper: "Opalina 225g", size: "Carta" },
      { name: "Copias e Impresión B/N", base: 1.0, paper: "Normal 75g", size: "Carta" }
    ];

    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomPhone = mockPhones[Math.floor(Math.random() * mockPhones.length)];
    const randomService = mockServices[Math.floor(Math.random() * mockServices.length)];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    const copies = Math.floor(Math.random() * 40) + 1;
    const totalPrice = Number((randomService.base * copies * (Math.random() > 0.5 ? 1.7 : 1.0)).toFixed(2));

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `PED-${randomNum}`;
    const createdAt = new Date().toISOString();

    const payload: Order = {
      id,
      customerName: randomName,
      customerPhone: randomPhone,
      customerEmail: `${randomName.toLowerCase().replace(" ", ".")}@example.com`,
      serviceType: randomService.name,
      options: {
        copies,
        paperType: randomService.paper,
        size: randomService.size,
        colorMode: "Color",
        sides: Math.random() > 0.5 ? "Ambas caras" : "Una cara",
        instructions: "Simulación de pedido rápida."
      },
      fileName: randomFile,
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      totalPrice,
      status: "Pendiente",
      createdAt,
      updatedAt: createdAt
    };

    try {
      await setDoc(doc(db, 'orders', id), payload);

      // Sync to local server backend as backup
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (syncErr) {
        console.warn('Local backup write sync bypassed:', syncErr);
      }
    } catch (err) {
      console.error("Error creating mock order in Firestore:", err);
    }
  };

  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-amber-100 text-amber-700 border-amber-200/50';
      case 'En proceso':
        return 'bg-blue-100 text-blue-700 border-blue-200/50';
      case 'Listo para entrega':
        return 'bg-pink-100 text-pink-700 border-pink-200/50';
      case 'Entregado':
        return 'bg-green-100 text-green-700 border-green-200/50';
      case 'Cancelado':
        return 'bg-red-100 text-red-700 border-red-200/50';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.serviceType.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="py-6 space-y-8" id="admin-panel-container">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-pink-600 font-bold tracking-wider text-xs uppercase px-3 py-1 bg-pink-100 rounded-full">
            Panel del Operador
          </span>
          <h2 className="text-3xl font-sans font-bold text-slate-800 mt-2">
            Gestión de Pedidos & Producción
          </h2>
          <p className="text-slate-500 font-light text-sm mt-1">
            Revisa especificaciones, descarga archivos adjuntos y cambia los estados en la base de datos de manera inmediata.
          </p>
        </div>

        {/* Action Header bar */}
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleGenerateMockOrder}
            className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 border border-pink-100 shadow-sm cursor-pointer"
            id="btn-generate-mock"
          >
            <PlusCircle className="w-4 h-4" />
            Simular Pedido
          </button>
          
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Refrescar base de datos"
            id="btn-refresh-db"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-pink-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-stats">
          {/* Total */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-150/60 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 font-light text-xs block leading-none">Total Pedidos</span>
              <span className="text-xl md:text-2xl font-black text-slate-700 block mt-1.5">{stats.totalOrders}</span>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-amber-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 font-light text-xs block leading-none">Pendientes</span>
              <span className="text-xl md:text-2xl font-black text-amber-600 block mt-1.5">{stats.pendingOrders}</span>
            </div>
          </div>

          {/* In process */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-blue-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
              <Loader2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 font-light text-xs block leading-none">En Proceso</span>
              <span className="text-xl md:text-2xl font-black text-blue-600 block mt-1.5">{stats.inProcessOrders}</span>
            </div>
          </div>

          {/* Ready */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-pink-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 font-light text-xs block leading-none">Por Recoger</span>
              <span className="text-xl md:text-2xl font-black text-pink-600 block mt-1.5">{stats.readyOrders}</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-green-100 shadow-sm flex items-center gap-4 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 font-light text-xs block leading-none">Ventas Totales</span>
              <span className="text-xl md:text-2xl font-black text-green-600 block mt-1.5">${stats.totalRevenue.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Filters & Orders Table */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-5 border-b border-pink-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tab filter items */}
          <div className="flex flex-wrap gap-1.5">
            {['todos', 'Pendiente', 'En proceso', 'Listo para entrega', 'Entregado', 'Cancelado'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'todos' ? 'Todos' : status}
              </button>
            ))}
          </div>

          {/* Search box within table */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Folio, Cliente o Teléfono..."
              className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
            />
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-3" />
            <p className="font-semibold text-slate-600">Actualizando tabla...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-light space-y-1">
            <ListFilter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600 text-sm">No se encontraron pedidos</p>
            <p className="text-xs">No hay registros con los filtros seleccionados actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Folio / Fecha</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Servicio</th>
                  <th className="py-4 px-6 text-center">Especificaciones</th>
                  <th className="py-4 px-6">Total</th>
                  <th className="py-4 px-6 text-center">Estado del Pedido</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition">
                    
                    {/* Folio & Date */}
                    <td className="py-4.5 px-6">
                      <span className="font-bold text-slate-800 block text-sm font-mono">{order.id}</span>
                      <span className="text-[10px] text-slate-400 font-light block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('es-MX')} {new Date(order.createdAt).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4.5 px-6">
                      <span className="font-semibold text-slate-800 block">{order.customerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{order.customerPhone}</span>
                      {order.customerEmail && (
                        <span className="text-[10px] text-slate-400 block max-w-[150px] truncate">{order.customerEmail}</span>
                      )}
                    </td>

                    {/* Service */}
                    <td className="py-4.5 px-6">
                      <span className="font-bold text-pink-600 block">{order.serviceType}</span>
                      {order.fileName && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono truncate max-w-[150px]" title={order.fileName}>
                          📎 {order.fileName}
                        </span>
                      )}
                    </td>

                    {/* Specs Summary */}
                    <td className="py-4.5 px-6 text-center">
                      <span className="text-[11px] text-slate-500 font-light block">
                        {order.options.copies} jg • {order.options.size} • {order.options.colorMode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-light block mt-0.5 truncate max-w-[140px]" title={order.options.paperType}>
                        {order.options.paperType}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="py-4.5 px-6">
                      <span className="font-black text-slate-800 block text-sm">${order.totalPrice.toFixed(2)}</span>
                    </td>

                    {/* Status selection cell */}
                    <td className="py-4.5 px-6 text-center">
                      {isUpdatingId === order.id ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-pink-500 font-medium py-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                          className={`px-2.5 py-1.5 text-[11px] font-bold rounded-full border outline-none cursor-pointer transition ${getStatusBadgeStyle(order.status)}`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En proceso">En proceso</option>
                          <option value="Listo para entrega">Listo para entrega</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar de base de datos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-pink-100 max-w-xl w-full overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-50 to-pink-100/40 p-6 border-b border-pink-150 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider font-mono">Ficha de Producción</span>
                <h3 className="text-xl font-bold text-slate-800 mt-0.5">{selectedOrder.id}</h3>
              </div>
              
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Client info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos del Solicitante</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nombre del cliente:</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Teléfono (WhatsApp):</span>
                    <a href={`https://wa.me/52${selectedOrder.customerPhone}`} target="_blank" rel="noreferrer" className="font-bold text-pink-600 block mt-0.5 hover:underline">
                      📲 {selectedOrder.customerPhone}
                    </a>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="col-span-2 pt-2 border-t border-slate-200/50">
                      <span className="text-slate-400 block">Correo electrónico:</span>
                      <span className="font-semibold text-slate-700 block mt-0.5">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Especificaciones de Impresión</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Servicio solicitado:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cantidad de copias:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.options.copies} juegos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tamaño del papel:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.options.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo de papel / soporte:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.options.paperType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Caras de impresión:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.options.sides}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Color / BN:</span>
                    <span className="font-bold text-slate-800">{selectedOrder.options.colorMode}</span>
                  </div>
                  {selectedOrder.fileName && (
                    <div className="flex justify-between pt-2.5 border-t border-slate-200">
                      <span className="text-pink-600 font-bold">Archivo adjunto (Descargable):</span>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert("Simulación de descarga completada."); }} className="font-bold text-pink-600 hover:underline">
                        📥 {selectedOrder.fileName} ({selectedOrder.fileSize})
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {selectedOrder.options.instructions && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instrucciones Especiales</h4>
                  <div className="bg-pink-50/30 p-4 rounded-2xl border border-pink-100/40 text-xs italic text-slate-600">
                    "{selectedOrder.options.instructions}"
                  </div>
                </div>
              )}

              {/* Quick status change in modal */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cambiar estado del pedido</h4>
                <div className="flex flex-wrap gap-2">
                  {['Pendiente', 'En proceso', 'Listo para entrega', 'Entregado', 'Cancelado'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status as any)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                        selectedOrder.status === status
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
              <span className="text-slate-400">Modificado por última vez: {new Date(selectedOrder.updatedAt).toLocaleTimeString('es-MX')}</span>
              <p className="font-black text-pink-600 text-base">Total: ${selectedOrder.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
