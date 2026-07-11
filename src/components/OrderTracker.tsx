import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, Clock, Package, MapPin, Phone, HelpCircle, FileCheck, ShoppingBag, XCircle } from 'lucide-react';
import { Order } from '../types';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function OrderTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearched(true);
    setErrorMsg(null);
    setOrders([]);

    try {
      const q = searchQuery.trim();
      
      if (q.toLowerCase().startsWith('ped-')) {
        // Search by exact order ID in Firestore
        const docRef = doc(db, 'orders', q.toUpperCase());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Order;
          setOrders([data]);
        } else {
          // Try exact match as typed (case-insensitive fallback)
          const docSnapLower = await getDoc(doc(db, 'orders', q));
          if (docSnapLower.exists()) {
            setOrders([docSnapLower.data() as Order]);
          } else {
            setOrders([]);
          }
        }
      } else {
        // Assume search is by phone number
        const ordersRef = collection(db, 'orders');
        const qSnap = await getDocs(ordersRef);
        const allOrders = qSnap.docs.map(d => d.data() as Order);
        
        // Filter orders that match phone number (exact or partial)
        const matched = allOrders.filter(o => 
          o.customerPhone.includes(q) || 
          o.customerPhone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
        );
        // Sort newest first
        matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(matched);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al buscar tu pedido. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Pendiente': return 0;
      case 'En proceso': return 1;
      case 'Listo para entrega': return 2;
      case 'Entregado': return 3;
      case 'Cancelado': return -1;
      default: return 0;
    }
  };

  const getStatusTextAndDesc = (status: Order['status']) => {
    switch (status) {
      case 'Pendiente':
        return {
          title: "Pedido Recibido",
          desc: "Hemos registrado tu pedido en la base de datos de manera exitosa. Un operador lo revisará en los próximos minutos para ingresarlo a las máquinas de impresión.",
          colorClass: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-5 h-5 text-amber-500 shrink-0" />
        };
      case 'En proceso':
        return {
          title: "En Impresión / Producción",
          desc: "Tu documento está siendo procesado en nuestras impresoras digitales de alta gama. Estamos cuidando la calibración de color y acabados especificados.",
          colorClass: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Loader2 className="w-5 h-5 text-blue-500 shrink-0 animate-spin" />
        };
      case 'Listo para entrega':
        return {
          title: "¡Listo para Entrega!",
          desc: "¡Tu pedido ha sido completado con éxito! Ha pasado el control de calidad y ya está empaquetado. Puedes pasar a recogerlo y realizar tu pago.",
          colorClass: "bg-pink-55 text-pink-700 border-pink-200 bg-pink-50/50",
          icon: <CheckCircle2 className="w-5 h-5 text-pink-600 shrink-0" />
        };
      case 'Entregado':
        return {
          title: "Entregado y Liquidado",
          desc: "Este pedido ya fue entregado al cliente e indica pago completado. ¡Muchas gracias por tu confianza en Copias & Impresiones!",
          colorClass: "bg-green-50 text-green-700 border-green-200",
          icon: <FileCheck className="w-5 h-5 text-green-500 shrink-0" />
        };
      case 'Cancelado':
        return {
          title: "Pedido Cancelado",
          desc: "Este pedido ha sido cancelado por el operador o por solicitud del cliente. No se realizará ningún cobro ni impresión.",
          colorClass: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />
        };
    }
  };

  return (
    <div className="py-6" id="order-tracker-container">
      {/* Intro section */}
      <div className="text-center mb-10">
        <span className="text-pink-600 font-bold tracking-wider text-xs uppercase px-3 py-1 bg-pink-100 rounded-full">
          Rastreador de Impresiones
        </span>
        <h2 className="text-3xl md:text-4xl font-sans font-bold text-slate-800 mt-2">
          Consulta el estado de tu pedido
        </h2>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto font-light text-sm md:text-base">
          Introduce tu número de pedido (ej. <strong className="text-pink-600 font-mono">PED-9102</strong>) o el número telefónico de contacto registrado para ver el avance en tiempo real.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2.5 bg-white p-2 rounded-2xl shadow-sm border border-pink-100/60">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingresa tu ID de Pedido o tu Teléfono"
              className="w-full h-12 pl-12 pr-4 bg-transparent rounded-xl outline-none text-slate-800 text-base placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition shadow flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Buscar"
            )}
          </button>
        </form>

        {/* Search advice */}
        <p className="text-center text-slate-400 text-xs mt-3 flex items-center justify-center gap-1.5 font-light">
          <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
          Tip: Si buscas por teléfono, ingresa los 10 dígitos sin espacios ni guiones.
        </p>
      </div>

      {/* Search Results Display */}
      <div className="max-w-4xl mx-auto space-y-8" id="tracker-results">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
            <p className="font-semibold text-slate-600 text-base">Consultando base de datos de pedidos...</p>
            <p className="text-xs mt-1">Buscando coincidencias de forma segura...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-2xl text-center space-y-2">
            <XCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h4 className="font-bold text-base">Error de conexión</h4>
            <p className="text-sm font-light max-w-md mx-auto">{errorMsg}</p>
          </div>
        ) : searched && orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-pink-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto text-pink-400 mb-4 border border-pink-100/50">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No encontramos ningún pedido</h3>
            <p className="text-slate-500 text-sm font-light mt-2 max-w-md mx-auto">
              No se hallaron coincidencias para "<span className="font-semibold font-mono text-slate-700">{searchQuery}</span>". Por favor, verifica que el folio o teléfono esté bien escrito.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('PED-9102');
                  setSearched(false);
                }}
                className="px-4 py-2 text-xs bg-pink-50 text-pink-600 rounded-full font-bold hover:bg-pink-100 transition"
              >
                Ver pedido de prueba (PED-9102)
              </button>
            </div>
          </div>
        ) : searched && orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusInfo = getStatusTextAndDesc(order.status);
              const stepIndex = getStatusStepIndex(order.status);

              return (
                <div key={order.id} className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden" id={`tracked-card-${order.id}`}>
                  
                  {/* Card Header Banner */}
                  <div className="bg-gradient-to-r from-pink-50 to-pink-100/40 p-6 md:p-8 border-b border-pink-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-pink-600 font-bold uppercase tracking-widest font-mono">
                        Folio de Seguimiento
                      </span>
                      <h3 className="text-2xl font-black font-sans text-slate-800 flex items-center gap-2 mt-0.5">
                        {order.id}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Registrado: {new Date(order.createdAt).toLocaleString('es-MX')}
                      </p>
                    </div>

                    {/* Cost Badge */}
                    <div className="text-right md:text-right flex flex-row md:flex-col justify-between items-center md:items-end">
                      <span className="text-xs text-slate-400 font-light">Total a liquidar</span>
                      <p className="text-2xl font-black text-pink-600 font-sans flex items-center gap-0.5">
                        ${order.totalPrice.toFixed(2)} <span className="text-xs text-slate-500 font-bold ml-1">MXN</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-8">
                    {/* Status Alert block */}
                    <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${statusInfo.colorClass}`}>
                      <div className="flex items-start gap-3">
                        {statusInfo.icon}
                        <div>
                          <h4 className="font-bold text-sm md:text-base leading-tight">{statusInfo.title}</h4>
                          <p className="text-xs md:text-sm mt-1 leading-relaxed font-light">{statusInfo.desc}</p>
                        </div>
                      </div>
                      <div className="shrink-0 flex justify-end">
                        <a
                          href={`https://wa.me/524433383043?text=${encodeURIComponent(
                            `*¡Hola, Copias & Impresiones Queréndaro!* 🌸\nQuiero consultar sobre mi pedido.\n\n*Detalles del Pedido:*\n• *Folio:* ${order.id}\n• *Cliente:* ${order.customerName}\n• *Servicio:* ${order.serviceType}\n• *Total:* $${order.totalPrice.toFixed(2)} MXN\n• *Estatus Actual:* ${order.status}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md shadow-green-500/10 transition-all hover:scale-[1.02]"
                        >
                          <Phone className="w-3.5 h-3.5 fill-white text-green-500 shrink-0" />
                          Consultar por WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Stepper Progress (Not displayed for cancelled orders) */}
                    {order.status !== 'Cancelado' && (
                      <div className="pt-2">
                        {/* Desktop Stepper */}
                        <div className="relative flex justify-between items-center max-w-3xl mx-auto">
                          {/* Connection bar background */}
                          <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 rounded-full -z-10" />
                          
                          {/* Filled progress bar connection */}
                          <div 
                            className="absolute top-4 left-0 h-1 bg-pink-500 rounded-full -z-10 transition-all duration-1000 ease-out" 
                            style={{ width: `${(stepIndex / 3) * 100}%` }}
                          />

                          {/* Step 1: Received */}
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                              stepIndex >= 0 
                                ? 'bg-pink-600 text-white border-pink-600 scale-105 shadow' 
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              1
                            </div>
                            <span className={`text-[10px] md:text-xs font-semibold mt-2 ${stepIndex >= 0 ? 'text-pink-600 font-bold' : 'text-slate-400'}`}>
                              Recibido
                            </span>
                          </div>

                          {/* Step 2: In process */}
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                              stepIndex >= 1 
                                ? 'bg-pink-600 text-white border-pink-600 scale-105 shadow' 
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              2
                            </div>
                            <span className={`text-[10px] md:text-xs font-semibold mt-2 ${stepIndex >= 1 ? 'text-pink-600 font-bold' : 'text-slate-400'}`}>
                              En Proceso
                            </span>
                          </div>

                          {/* Step 3: Ready */}
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                              stepIndex >= 2 
                                ? 'bg-pink-600 text-white border-pink-600 scale-105 shadow' 
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              3
                            </div>
                            <span className={`text-[10px] md:text-xs font-semibold mt-2 ${stepIndex >= 2 ? 'text-pink-600 font-bold' : 'text-slate-400'}`}>
                              Listo para Entrega
                            </span>
                          </div>

                          {/* Step 4: Completed */}
                          <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                              stepIndex >= 3 
                                ? 'bg-pink-600 text-white border-pink-600 scale-105 shadow' 
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              4
                            </div>
                            <span className={`text-[10px] md:text-xs font-semibold mt-2 ${stepIndex >= 3 ? 'text-pink-600 font-bold' : 'text-slate-400'}`}>
                              Entregado
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Technical specifications */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-pink-500" />
                          Especificaciones Técnicas
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5 text-xs text-slate-600 font-light">
                          <div className="flex justify-between">
                            <span>Servicio Solicitado:</span>
                            <span className="font-bold text-slate-800">{order.serviceType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cantidad de juegos:</span>
                            <span className="font-bold text-slate-800">{order.options.copies}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tamaño de papel:</span>
                            <span className="font-bold text-slate-800">{order.options.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Papel / soporte:</span>
                            <span className="font-bold text-slate-800">{order.options.paperType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Caras impresas:</span>
                            <span className="font-bold text-slate-800">{order.options.sides}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Modo de Color:</span>
                            <span className="font-bold text-slate-800">{order.options.colorMode}</span>
                          </div>
                          {order.fileName && (
                            <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-200">
                              <span>Archivo cargado:</span>
                              <span className="font-bold text-pink-600 truncate max-w-[140px]">{order.fileName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Store details and Pickup Location */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-pink-500" />
                          Ubicación de Entrega
                        </h4>
                        
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 text-xs text-slate-600 font-light">
                          <div className="flex gap-3">
                            <MapPin className="w-5 h-5 text-pink-500 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">Copias & Impresiones Queréndaro</p>
                              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                                Av. del Trabajo S/N, Queréndaro, Michoacán, México.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2.5 border-t border-dashed border-slate-200">
                            <Phone className="w-5 h-5 text-pink-500 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">Contacto Directo</p>
                              <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                                WhatsApp: 443 338 3043
                              </p>
                            </div>
                          </div>

                          {order.options.instructions && (
                            <div className="pt-2.5 border-t border-dashed border-slate-200 text-[11px]">
                              <p className="font-semibold text-slate-800">Instrucciones especiales dadas:</p>
                              <p className="italic text-slate-500 mt-1">"{order.options.instructions}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Initial State */
          <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto text-pink-400 mb-4 border border-pink-100/50">
              <Search className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">¿Tienes un pedido en curso?</h3>
            <p className="text-slate-500 text-sm font-light mt-2 max-w-md mx-auto">
              Introduce el número de folio impreso en tu comprobante o tu teléfono arriba para verificar si ya está impreso y listo para recoger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
