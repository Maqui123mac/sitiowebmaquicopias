import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Printer, Sparkles, Layers } from 'lucide-react';

const imgHero = "https://copyimpresmaqui.netlify.app/src/assets/images/anime_girl_printing_1783665874151.jpg";
const imgPrinting = "https://copyimpresmaqui.netlify.app/src/assets/images/anime_photo_print_1783665032007.jpg";
const imgCards = "https://copyimpresmaqui.netlify.app/src/assets/images/anime_cards_print_1783665043165.jpg";

interface CarouselSlide {
  image: string;
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
}

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: CarouselSlide[] = [
    {
      image: imgHero,
      title: "Copias & Impresiones de Alta Calidad",
      description: "Donde tus mejores ideas cobran vida con nitidez excepcional y colores vibrantes. Equipamiento de última generación para entregas impecables y rápidas en Queréndaro.",
      badge: "Estudio Profesional",
      icon: <Printer className="w-5 h-5 text-pink-500" />
    },
    {
      image: imgPrinting,
      title: "Impresión Fotográfica & Formato Especial",
      description: "Inmortaliza tus recuerdos más preciados con definición profesional de galería. Colores asombrosos y acabados de lujo sobre papel premium mate o brillante.",
      badge: "Calidad de Exhibición",
      icon: <Sparkles className="w-5 h-5 text-pink-500" />
    },
    {
      image: imgCards,
      title: "Tarjetas de Presentación & Opalina",
      description: "Diseña una primera impresión verdaderamente memorable. Acabados elegantes y corte milimétrico sobre opalina premium para destacar tu marca personal.",
      badge: "Imagen Profesional",
      icon: <Layers className="w-5 h-5 text-pink-500" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000); // changes slides every 6 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden rounded-3xl shadow-md border border-pink-100" id="carousel-banner">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
            index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-black/20 to-transparent z-10" />
          
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20 text-white flex flex-col items-start max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-pink-600 mb-3 shadow-md border border-pink-100">
              {slide.icon}
              {slide.badge}
            </span>
            <h1 className="text-2xl md:text-5xl font-sans font-bold tracking-tight mb-3 text-white drop-shadow">
              {slide.title}
            </h1>
            <p className="text-sm md:text-lg text-pink-50/90 font-light leading-relaxed mb-4 drop-shadow-sm">
              {slide.description}
            </p>
          </div>
        </div>
      ))}

      {/* Control Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/90 text-pink-600 hover:bg-pink-50 hover:text-pink-700 hover:scale-105 transition shadow-lg border border-pink-100"
        aria-label="Anterior"
        id="btn-carousel-prev"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/90 text-pink-600 hover:bg-pink-50 hover:text-pink-700 hover:scale-105 transition shadow-lg border border-pink-100"
        aria-label="Siguiente"
        id="btn-carousel-next"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 right-6 md:right-12 z-30 flex gap-2" id="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-pink-500 w-8 shadow-md'
                : 'bg-white/60 hover:bg-white'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
