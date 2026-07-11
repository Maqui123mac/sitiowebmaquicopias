import { useState } from 'react';
import { Printer, MapPin, Phone, Clock, ShoppingBag, Eye, Heart, HelpCircle, Layers, ClipboardList, Menu, X } from 'lucide-react';
import Carousel from './components/Carousel';
import Catalog from './components/Catalog';
import OrderForm from './components/OrderForm';
import OrderTracker from './components/OrderTracker';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';
import { Service, Order } from './types';

type ViewType = 'inicio' | 'rastrear' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('inicio');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setRecentOrder(order);
    setSelectedService(null);
    setCurrentView('rastrear');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-pink-50/40 flex flex-col md:flex-row" id="app-root">

      {/* 1. DESKTOP NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex md:w-72 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex-col justify-between p-7 shrink-0 z-30 shadow-xl" id="desktop-sidebar">
        <div className="space-y-10">
          {/* Brand Logo & Info */}
          <div 
            onClick={() => {
              setCurrentView('inicio');
              setSelectedService(null);
              setRecentOrder(null);
            }}
            className="flex items-center gap-3.5 cursor-pointer hover:opacity-95 transition group"
            id="brand-logo"
          >
            <div className="w-12 h-12 bg-pink-500 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:rotate-6 transition-transform">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold font-sans text-white tracking-tight leading-tight">
                Copias & Impresiones
              </h1>
              <span className="text-[11px] font-black text-pink-400 uppercase tracking-widest mt-0.5 block">
                QUERÉNDARO
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 animate-fade-in" id="desktop-nav-menu">
            <button
              onClick={() => {
                setCurrentView('inicio');
                setSelectedService(null);
                setRecentOrder(null);
              }}
              className={`w-full px-5 py-4 text-[15px] font-black rounded-2xl transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                currentView === 'inicio' && !selectedService
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('inicio');
                setSelectedService(null);
                setRecentOrder(null);
                setTimeout(() => {
                  const cat = document.getElementById('services-catalog');
                  if (cat) cat.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full px-5 py-4 text-[15px] font-black rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-4 cursor-pointer"
            >
              <Layers className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-pink-400 transition-colors" />
              <span>Servicios</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('inicio');
                setSelectedService(null);
                setRecentOrder(null);
                setTimeout(() => {
                  const footer = document.getElementById('main-footer');
                  if (footer) footer.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full px-5 py-4 text-[15px] font-black rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-4 cursor-pointer"
            >
              <Phone className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-pink-400 transition-colors" />
              <span>Contacto</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Shop Card */}
        <div className="pt-6 border-t border-slate-800 space-y-5">
          <div className="bg-slate-800/40 rounded-[28px] p-5 border border-slate-800/50">
            <span className="text-[11px] font-extrabold text-pink-400 uppercase tracking-widest block mb-1.5">Ubicación Única</span>
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              Av. del Trabajo S/N, Queréndaro, Michoacán.
            </p>
          </div>
          <a 
            href="https://wa.me/524433383043" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3.5 text-slate-300 font-bold font-sans text-[15px] pl-2.5 mt-4 cursor-pointer hover:text-pink-400 transition-colors"
          >
            <Phone className="w-5 h-5 text-pink-500" />
            <span>443 338 3043</span>
          </a>
        </div>
      </aside>

      {/* 2. MOBILE TOP STICKY NAVIGATION HEADER */}
      <header className="md:hidden sticky top-0 bg-white border-b border-pink-100 z-45 shadow-sm px-4 h-16 flex items-center justify-between" id="mobile-header">
        <div 
          onClick={() => {
            setCurrentView('inicio');
            setSelectedService(null);
            setRecentOrder(null);
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Printer className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold font-sans text-slate-800 leading-none">
              Copias & Impresiones
            </h1>
            <span className="text-[8px] font-mono text-pink-500 font-bold uppercase tracking-wider mt-0.5 block">
              Queréndaro
            </span>
          </div>
        </div>

        {/* Hamburger Menu Trigger */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-pink-500 hover:bg-pink-50 rounded-xl transition cursor-pointer"
          aria-label="Abrir menú"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <Menu className="w-6 h-6 stroke-[2.5]" />
          )}
        </button>
      </header>

      {/* 3. MOBILE MENU SLIDE-OUT DRAWER OVERLAY & PANEL */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" id="mobile-menu-drawer">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer Panel */}
          <div className="relative flex flex-col w-4/5 max-w-xs bg-slate-900 h-full p-6 shadow-2xl justify-between animate-fade-in z-50">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-pink-500 rounded-[18px] flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                    <Printer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-sm block">Menú Principal</span>
                    <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest mt-0.5 block">Queréndaro</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentView('inicio');
                    setSelectedService(null);
                    setRecentOrder(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-sm font-bold rounded-2xl transition flex items-center gap-3 cursor-pointer ${
                    currentView === 'inicio' && !selectedService
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md shadow-pink-500/15'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Inicio</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('inicio');
                    setSelectedService(null);
                    setRecentOrder(null);
                    setIsMobileMenuOpen(false);
                    setTimeout(() => {
                      const cat = document.getElementById('services-catalog');
                      if (cat) cat.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full px-4 py-3 text-sm font-bold rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition flex items-center gap-3 cursor-pointer"
                >
                  <Layers className="w-4.5 h-4.5 text-slate-400" />
                  <span>Servicios</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('inicio');
                    setSelectedService(null);
                    setRecentOrder(null);
                    setIsMobileMenuOpen(false);
                    setTimeout(() => {
                      const footer = document.getElementById('main-footer');
                      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full px-4 py-3 text-sm font-bold rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition flex items-center gap-3 cursor-pointer"
                >
                  <Phone className="w-4.5 h-4.5 text-slate-400" />
                  <span>Contacto</span>
                </button>
              </nav>
            </div>

            {/* Drawer Info Footer */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="bg-slate-800/40 rounded-[22px] p-4 border border-slate-800/50">
                <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest block mb-1">Ubicación Única</span>
                <p className="text-slate-200 text-xs font-semibold leading-relaxed">
                  Av. del Trabajo S/N, Queréndaro, Michoacán.
                </p>
              </div>
              <a 
                href="https://wa.me/524433383043" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-slate-300 font-bold font-sans flex items-center gap-2.5 pl-1 hover:text-pink-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-pink-500" />
                <span>WhatsApp: 443 338 3043</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN LAYOUT WORKSPACE AREA */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        
        {/* VIEW: INICIO (CATALOG & CAROUSEL) */}
        {currentView === 'inicio' && (
          <div className="space-y-12 animate-fade-in">
            {/* Render Slide Carousel or Ordering Form */}
            {!selectedService ? (
              <>
                <Carousel />
                <Catalog onSelectService={handleSelectService} />
                
                {/* Visual quick info banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6" id="features-info-strip">
                  <div className="bg-white p-5 rounded-2xl border border-pink-100/50 shadow-sm flex gap-4 items-start">
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Producción en 1 Hora</h4>
                      <p className="text-slate-400 font-light text-xs mt-1">Imprenta digital rápida para que no pierdas tiempo. Recoge hoy mismo.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-pink-100/50 shadow-sm flex gap-4 items-start">
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Notificaciones de Avance</h4>
                      <p className="text-slate-400 font-light text-xs mt-1">Sigue el estatus en línea con tu número de folio en nuestro rastreador.</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-pink-100/50 shadow-sm flex gap-4 items-start">
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Fácil Ubicación</h4>
                      <p className="text-slate-400 font-light text-xs mt-1">Av. del Trabajo S/N, Queréndaro, Michoacán.</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <OrderForm 
                service={selectedService} 
                onBack={() => setSelectedService(null)}
                onOrderSuccess={handleOrderSuccess}
              />
            )}
          </div>
        )}

        {/* VIEW: ORDER TRACKER */}
        {currentView === 'rastrear' && (
          <div className="animate-fade-in space-y-6">
            
            {/* Show success pop-up if they just placed an order */}
            {recentOrder && (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center max-w-2xl mx-auto space-y-4 shadow-sm" id="success-placement-card">
                <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow animate-bounce">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-800">¡Pedido Enviado a Producción!</h3>
                  <p className="text-green-700/80 text-sm font-light mt-1">
                    Tu pedido con folio <strong className="font-mono text-green-900 bg-white px-2 py-0.5 rounded border border-green-200">{recentOrder.id}</strong> ha sido guardado exitosamente en nuestra base de datos.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-green-150 inline-block text-xs font-mono text-slate-600">
                  Guarda tu folio para consultar el estatus cuando desees.
                </div>
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={`https://wa.me/524433383043?text=${encodeURIComponent(
                      `*¡Hola, Copias & Impresiones Queréndaro!* 🌸\nAcabo de realizar un pedido desde el sitio web.\n\n*Detalles del Pedido:*\n• *Folio:* ${recentOrder.id}\n• *Cliente:* ${recentOrder.customerName}\n• *Servicio:* ${recentOrder.serviceType}\n• *Total:* $${recentOrder.totalPrice.toFixed(2)} MXN\n• *Copias:* ${recentOrder.options.copies}\n• *Papel:* ${recentOrder.options.paperType}\n• *Modo:* ${recentOrder.options.colorMode}\n• *Caras:* ${recentOrder.options.sides}\n${recentOrder.options.instructions ? `• *Instrucciones:* ${recentOrder.options.instructions}\n` : ''}${recentOrder.fileName ? `• *Archivo:* ${recentOrder.fileName}\n` : ''}\nPor favor, confírmenme para proceder con el trabajo. ¡Gracias!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 fill-white text-green-500 shrink-0" />
                    Enviar detalles por WhatsApp
                  </a>
                </div>
              </div>
            )}

            <OrderTracker />
          </div>
        )}

        {/* VIEW: ADMIN PANEL */}
        {currentView === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Premium Footer with clean card-based minimalism */}
      <footer className="bg-slate-50 border-t border-pink-100/60 py-16 mt-20 relative overflow-hidden" id="main-footer">
        {/* Subtle abstract soft pink background blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-pink-100/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-rose-100/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Col 1 Brand details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-pink-500/20">
                  <Printer className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="font-black text-slate-800 text-base block leading-none">Copias & Impresiones</span>
                  <span className="text-[11px] font-extrabold text-pink-500 uppercase tracking-widest mt-1 block">Queréndaro</span>
                </div>
              </div>
              <p className="text-slate-500 font-medium text-xs leading-relaxed">
                Tu imprenta digital local de alta fidelidad. Ofrecemos calidad profesional, papel de alta gama y un servicio de entrega rápido en Queréndaro.
              </p>
              <div className="text-slate-400 text-xs flex gap-1.5 items-center font-semibold pt-1">
                <span>Hecho con</span>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                <span>para Queréndaro, Michoacán.</span>
              </div>
            </div>

            {/* Col 2 Quick links */}
            <div className="space-y-5">
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-pink-500">
                Servicios Populares
              </h4>
              <ul className="space-y-3 text-xs text-slate-600 font-medium pt-2">
                <li className="hover:text-pink-600 transition-colors duration-200 cursor-pointer flex items-center gap-2" onClick={() => { setCurrentView('inicio'); setSelectedService(null); }}>
                  <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                  Impresiones a Color
                </li>
                <li className="hover:text-pink-600 transition-colors duration-200 cursor-pointer flex items-center gap-2" onClick={() => { setCurrentView('inicio'); setSelectedService(null); }}>
                  <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                  Impresiones Fotográficas
                </li>
                <li className="hover:text-pink-600 transition-colors duration-200 cursor-pointer flex items-center gap-2" onClick={() => { setCurrentView('inicio'); setSelectedService(null); }}>
                  <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                  Tarjetas de Presentación
                </li>
                <li className="hover:text-pink-600 transition-colors duration-200 cursor-pointer flex items-center gap-2" onClick={() => { setCurrentView('inicio'); setSelectedService(null); }}>
                  <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                  Copias e Impresiones B/N
                </li>
              </ul>
            </div>

            {/* Col 3 Schedule */}
            <div className="space-y-5">
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-pink-500">
                Horario Oficial
              </h4>
              <div className="space-y-3 text-xs pt-2">
                <div className="bg-white border border-pink-100/40 rounded-[22px] p-4.5 space-y-3.5 shadow-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">Lunes a Viernes</span>
                    <strong className="text-slate-800 font-extrabold bg-slate-50 px-2 py-1 rounded-lg">10:00am - 8:30pm</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">Sábados</span>
                    <strong className="text-slate-800 font-extrabold bg-slate-50 px-2 py-1 rounded-lg">9am - 4pm</strong>
                  </div>
                  <div className="flex justify-between items-center text-pink-500">
                    <span className="font-semibold">Domingos</span>
                    <span className="bg-pink-100/60 px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-wider">Cerrado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 4 Contact & Support */}
            <div className="space-y-5">
              <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-8 after:h-0.5 after:bg-pink-500">
                Ubicación Única
              </h4>
              <div className="space-y-4 text-xs text-slate-600 font-medium pt-2">
                <a 
                  href="https://wa.me/524433383043" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex gap-2.5 items-center bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-2xl font-bold transition-all duration-300 shadow-md shadow-green-500/10 group text-center justify-center"
                >
                  <Phone className="w-4 h-4 fill-white text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-sans font-extrabold">WhatsApp: 443 338 3043</span>
                </a>
                <div className="flex gap-3 items-start bg-pink-500/[0.02] border border-pink-100/30 p-4 rounded-2xl">
                  <MapPin className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-slate-700 font-medium">Av. del Trabajo S/N, Queréndaro, Michoacán.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright bar */}
          <div className="border-t border-slate-200/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} Copias & Impresiones Queréndaro. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <span className="hover:text-pink-500 transition-colors cursor-pointer">Ubicación Única</span>
              <span className="hover:text-pink-500 transition-colors cursor-pointer">Soporte</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Chatbot */}
      <Chatbot />

      </div>
    </div>
  );
}
