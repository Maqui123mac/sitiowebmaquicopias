import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Check, DollarSign, Loader2, AlertCircle, Phone, Mail, User, BookOpen } from 'lucide-react';
import { Service, Order, OrderOptions } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface OrderFormProps {
  service: Service;
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export default function OrderForm({ service, onBack, onOrderSuccess }: OrderFormProps) {
  // Option states
  const [copies, setCopies] = useState<number>(1);
  const [paperType, setPaperType] = useState<string>(service.paperOptions[0] || 'Normal 75g');
  const [size, setSize] = useState<string>(service.sizeOptions[0] || 'Carta');
  const [colorMode, setColorMode] = useState<'Color' | 'Blanco y Negro'>(
    service.colorOptions.includes('Color') ? 'Color' : 'Blanco y Negro'
  );
  const [sides, setSides] = useState<'Una cara' | 'Ambas caras'>(service.sideOptions[0] || 'Una cara');
  const [instructions, setInstructions] = useState<string>('');

  // Client states
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');

  // File Upload states
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // System states
  const [totalPrice, setTotalPrice] = useState<number>(service.basePrice);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate pricing dynamically on option change
  useEffect(() => {
    let unitPrice = service.basePrice;

    // Additive cost by paper type
    if (paperType.includes('Opalina 125g')) unitPrice += 2.0;
    else if (paperType.includes('Opalina 225g')) unitPrice += 4.0;
    else if (paperType.includes('Fotográfico')) unitPrice += 8.0;
    else if (paperType.includes('Adhesivo')) unitPrice += 6.0;

    // Additive cost by size
    if (size === 'Oficio') unitPrice += 2.0;
    else if (size === 'A4') unitPrice += 1.0;
    else if (size === '5x7 pulgadas') unitPrice += 4.0;

    // Cost by color mode
    if (service.id === 'copies' && colorMode === 'Color') {
      unitPrice += 2.0; // Color copy is 3 pesos, B/N copy is 1 peso
    }

    // Cost by double sided
    let duplexMultiplier = 1.0;
    if (sides === 'Ambas caras') {
      duplexMultiplier = 1.7; // 15% discount for printing double sided
    }

    // Multiply by copies
    const finalPrice = unitPrice * duplexMultiplier * copies;
    setTotalPrice(Number(finalPrice.toFixed(2)));
  }, [copies, paperType, size, colorMode, sides, service]);

  // Handle mock file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(files[0].name, files[0].size);
    }
  };

  const simulateUpload = (name: string, sizeInBytes: number) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Convert bytes to readable string
    const sizeStr = sizeInBytes > 1024 * 1024 
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${(sizeInBytes / 1024).toFixed(0)} KB`;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFile({ name, size: sizeStr });
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateUpload(files[0].name, files[0].size);
    }
  };

  // Submit Order to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMsg('Por favor introduce tu nombre completo.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Por favor introduce un número de teléfono de contacto.');
      return;
    }
    if (customerPhone.trim().length < 10) {
      setErrorMsg('El número de teléfono debe tener al menos 10 dígitos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const id = `PED-${randomNum}`;
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      const orderPayload: Order = {
        id,
        customerName,
        customerPhone,
        customerEmail,
        serviceType: service.name,
        options: {
          copies,
          paperType,
          size,
          colorMode,
          sides,
          instructions: instructions || ''
        },
        fileName: file ? file.name : '',
        fileSize: file ? file.size : '',
        totalPrice,
        status: 'Pendiente',
        createdAt,
        updatedAt
      };

      // Write directly to Firebase Firestore
      await setDoc(doc(db, 'orders', id), orderPayload);

      // Backup sync to local Express server
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });
      } catch (syncErr) {
        console.warn('Local storage sync bypassed. Operating in Firebase-only mode:', syncErr);
      }

      onOrderSuccess(orderPayload);
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6" id="order-form-container">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition mb-6 cursor-pointer hover:-translate-x-1 duration-200"
        id="btn-back-catalog"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo de servicios
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-slate-800">
          Configura tu pedido: <span className="text-pink-600">{service.name}</span>
        </h2>
        <p className="text-slate-500 font-light text-sm md:text-base mt-1">
          Ajusta las opciones técnicas abajo. Verás la cotización de precio actualizarse en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Options - Left (Col 7) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100/60 shadow-sm space-y-6">
            
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-pink-50 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              1. Opciones de Impresión
            </h3>

            {/* Copies Counter & Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Copies */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cantidad de copias / juegos
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCopies((prev) => Math.max(1, prev - 1))}
                    className="w-11 h-11 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-600 font-bold text-lg flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-11 text-center font-bold border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCopies((prev) => prev + 1)}
                    className="w-11 h-11 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-100 text-pink-600 font-bold text-lg flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tamaño de papel
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-slate-700"
                >
                  {service.sizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paper Type & Sides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paper Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo de papel / soporte
                </label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-slate-700"
                >
                  {service.paperOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sides (Duplex) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Impresión por carilla
                </label>
                <div className="flex bg-slate-50 p-1 rounded-xl gap-1 border border-slate-100">
                  {service.sideOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSides(opt as any)}
                      className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                        sides === opt
                          ? 'bg-white text-pink-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Mode - Render only if service supports it */}
            {service.colorOptions.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Modo de Color
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {service.colorOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setColorMode(opt as any)}
                      className={`h-11 rounded-xl flex items-center justify-center border font-semibold text-sm transition-all ${
                        colorMode === opt
                          ? 'border-pink-400 bg-pink-50/50 text-pink-600 font-bold'
                          : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        opt === 'Color' 
                          ? 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400' 
                          : 'bg-slate-500'
                      }`} />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Simulator */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subir documento o imagen para imprimir
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-pink-500 bg-pink-50/40 scale-[0.99]'
                    : file
                    ? 'border-pink-300 bg-pink-50/10'
                    : 'border-slate-200 hover:border-pink-300 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload-input"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload-input" className="cursor-pointer">
                  {isUploading ? (
                    <div className="flex flex-col items-center py-2">
                      <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-3" />
                      <p className="text-slate-600 font-medium text-sm">Subiendo archivo simulado...</p>
                      <div className="w-full max-w-[200px] bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                        <div 
                          className="bg-pink-500 h-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : file ? (
                    <div className="flex items-center justify-center gap-4 py-2">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-800 font-bold text-sm max-w-[220px] truncate">{file.name}</p>
                        <p className="text-slate-400 text-xs font-mono">{file.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg ml-4 transition font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-3">
                      <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-3 text-pink-500 border border-pink-100">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-slate-700 font-semibold text-sm">
                        Arrastra tu archivo aquí o <span className="text-pink-600 underline">búscalo</span>
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Soporta PDF, Word, JPG, PNG de hasta 50MB (Simulado)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Instrucciones especiales para el operador (Opcional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ej. Encuadernar, cortar bordes blancos, imprimir con márgenes específicos..."
                rows={3}
                className="w-full p-3 bg-white border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-slate-700 text-sm placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Contact Details - Left (Bottom) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-pink-100/60 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-pink-50 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              2. Datos del Cliente
            </h3>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. María Guadalupe Rodríguez"
                    className="w-full h-11 pl-10 pr-3 bg-white border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-slate-700 text-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Teléfono de Contacto (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej. 4433383043"
                      className="w-full h-11 pl-10 pr-3 bg-white border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-slate-700 text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Correo Electrónico (Opcional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Ej. maria@ejemplo.com"
                      className="w-full h-11 pl-10 pr-3 bg-white border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-slate-700 text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Live Cotización / Summary - Right (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-pink-50 to-white rounded-3xl p-6 border-2 border-pink-100 shadow-sm sticky top-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
              <span>Cotización del Pedido</span>
              <span className="px-2 py-0.5 text-xs bg-pink-100 text-pink-700 rounded-md font-semibold font-mono">
                EN VIVO
              </span>
            </h3>

            {/* Config details list */}
            <div className="bg-white/80 p-4 rounded-2xl border border-pink-100/40 space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-light">Servicio principal</span>
                <span className="font-semibold text-slate-800">{service.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-light">Cantidad</span>
                <span className="font-semibold text-slate-800">{copies} {copies === 1 ? 'juego' : 'juegos'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-light">Tamaño de papel</span>
                <span className="font-semibold text-slate-800">{size}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-light">Papel / soporte</span>
                <span className="font-semibold text-slate-800">{paperType}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-light">Impresión</span>
                <span className="font-semibold text-slate-800">{sides}</span>
              </div>
              {service.colorOptions.length > 1 && (
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-light">Modo de Color</span>
                  <span className="font-semibold text-slate-800">{colorMode}</span>
                </div>
              )}
              {file && (
                <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-dashed border-pink-100">
                  <span className="font-light text-pink-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Archivo cargado
                  </span>
                  <span className="font-semibold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                </div>
              )}
            </div>

            {/* Total display */}
            <div className="border-t border-pink-100 pt-5 text-center">
              <p className="text-slate-400 font-light text-xs uppercase tracking-wider">Total Cotizado (Neto)</p>
              <div className="flex items-center justify-center mt-1.5 text-pink-600 font-sans font-black">
                <DollarSign className="w-6 h-6 -mr-1" />
                <span className="text-4xl md:text-5xl leading-none">{totalPrice.toFixed(2)}</span>
                <span className="text-base font-bold ml-1.5 text-slate-600">MXN</span>
              </div>
              <p className="text-slate-400 font-light text-[11px] mt-2 leading-relaxed">
                *Precios con IVA incluido. Pago directo al recoger el pedido.
              </p>
            </div>

            {/* Alert Error Box */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-600 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Submit CTA */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || isUploading
                  ? 'bg-pink-300 cursor-not-allowed shadow-inner'
                  : 'bg-pink-600 hover:bg-pink-700 hover:scale-[1.01] hover:shadow-lg active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando Pedido...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar e Enviar Pedido
                </>
              )}
            </button>

            {/* Business trust indicator */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-2 border-t border-pink-50">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <span>Recógelo en tienda hoy mismo en 1-2 horas.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
