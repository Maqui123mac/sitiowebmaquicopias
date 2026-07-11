import { Printer, Image as ImageIcon, Layers, Tag, Copy, IdCard } from 'lucide-react';
import { Service } from '../types';

interface CatalogProps {
  onSelectService: (service: Service) => void;
}

export const servicesData: Service[] = [
  {
    id: 'color-print',
    name: 'Impresiones a Color',
    description: 'Nitidez absoluta para tus documentos, reportes y trabajos escolares en resolución ultra-HD.',
    basePrice: 5.0,
    icon: 'Printer',
    paperOptions: ['Normal 75g', 'Opalina 125g', 'Opalina 225g'],
    sizeOptions: ['Carta', 'Oficio', 'A4'],
    colorOptions: ['Color', 'Blanco y Negro'],
    sideOptions: ['Una cara', 'Ambas caras']
  },
  {
    id: 'photo-print',
    name: 'Impresiones Fotográficas',
    description: 'Impresión de alta fidelidad en papel fotográfico premium brillante o mate con colores vibrantes y duraderos.',
    basePrice: 30.0,
    icon: 'ImageIcon',
    paperOptions: ['Fotográfico Brillante', 'Fotográfico Mate'],
    sizeOptions: ['4x6 pulgadas', '5x7 pulgadas', 'Carta'],
    colorOptions: ['Color', 'Blanco y Negro'],
    sideOptions: ['Una cara']
  },
  {
    id: 'opalina-print',
    name: 'Impresiones Opalina',
    description: 'Soporte rígido de alta densidad (125g o 225g), ideal para invitaciones, diplomas, portadas y certificados.',
    basePrice: 12.0,
    icon: 'Layers',
    paperOptions: ['Opalina 125g', 'Opalina 225g'],
    sizeOptions: ['Carta', 'Oficio'],
    colorOptions: ['Color', 'Blanco y Negro'],
    sideOptions: ['Una cara', 'Ambas caras']
  },
  {
    id: 'label-print',
    name: 'Impresión de Etiquetas',
    description: 'Etiquetas personalizadas impresas en papel autoadhesivo brillante o mate, listas para recortar y pegar.',
    basePrice: 20.0,
    icon: 'Tag',
    paperOptions: ['Adhesivo Brillante', 'Adhesivo Mate'],
    sizeOptions: ['Carta', 'A4'],
    colorOptions: ['Color', 'Blanco y Negro'],
    sideOptions: ['Una cara']
  },
  {
    id: 'copies',
    name: 'Copias e Impresión B/N',
    description: 'Fotocopiado rápido y económico de documentos en volumen, con excelente contraste y nitidez.',
    basePrice: 1.0,
    icon: 'Copy',
    paperOptions: ['Normal 75g'],
    sizeOptions: ['Carta', 'Oficio'],
    colorOptions: ['Blanco y Negro', 'Color'],
    sideOptions: ['Una cara', 'Ambas caras']
  },
  {
    id: 'business-cards',
    name: 'Tarjetas de Presentación',
    description: 'Tu carta de presentación con corte perfecto y papel opalina premium de 225g. Diseño profesional.',
    basePrice: 1.8,
    icon: 'IdCard',
    paperOptions: ['Opalina 225g', 'Opalina 225g Texturizada'],
    sizeOptions: ['9x5 cm (tarjeta)'],
    colorOptions: ['Color', 'Blanco y Negro'],
    sideOptions: ['Ambas caras', 'Una cara']
  }
];

export default function Catalog({ onSelectService }: CatalogProps) {
  
  const renderIcon = (iconName: string) => {
    const classStyle = "w-8 h-8 text-pink-500 transition-transform duration-300 group-hover:scale-110";
    switch (iconName) {
      case 'Printer':
        return <Printer className={classStyle} />;
      case 'ImageIcon':
        return <ImageIcon className={classStyle} />;
      case 'Layers':
        return <Layers className={classStyle} />;
      case 'Tag':
        return <Tag className={classStyle} />;
      case 'Copy':
        return <Copy className={classStyle} />;
      case 'IdCard':
        return <IdCard className={classStyle} />;
      default:
        return <Printer className={classStyle} />;
    }
  };

  return (
    <div className="py-10" id="services-catalog">
      <div className="text-center mb-12">
        <span className="text-pink-600 font-bold tracking-wider text-xs uppercase px-3 py-1 bg-pink-100 rounded-full">
          Nuestros Servicios
        </span>
        <h2 className="text-3xl md:text-4xl font-sans font-bold text-slate-800 mt-2">
          ¿Qué deseas imprimir hoy?
        </h2>
        <p className="text-slate-500 mt-3 max-w-2xl mx-auto font-light text-sm md:text-base">
          Selecciona cualquiera de nuestros servicios especializados para abrir la calculadora de precios interactiva, cotizar y enviar tu pedido directo a producción.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesData.map((service) => (
          <div
            key={service.id}
            id={`service-card-${service.id}`}
            onClick={() => onSelectService(service)}
            className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-pink-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Background pink glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

            <div>
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-5 border border-pink-100 group-hover:bg-pink-100/60 transition-colors duration-300">
                {renderIcon(service.icon)}
              </div>

              <h3 className="text-xl font-bold text-pink-800 group-hover:text-pink-600 transition-colors duration-300">
                {service.name}
              </h3>
              
              <p className="text-pink-900/70 font-light text-sm mt-2.5 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-pink-50 flex items-center justify-between">
              <span className="text-xs text-pink-400 font-mono">
                Desde <strong className="text-sm font-sans font-semibold text-pink-600">${service.basePrice.toFixed(2)} MXN</strong>
              </span>
              <button className="text-xs font-bold px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-all duration-300 shadow-sm cursor-pointer">
                Cotizar Pedido
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
