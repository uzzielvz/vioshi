"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Array<{
    char: string;
    x: number;
    y: number;
    speed: number;
    opacity: number;
  }>>([]);

  // Generar caracteres flotantes
  useEffect(() => {
    const chars = 'VIOGI2025STREETWEAR';
    const newCharacters = Array.from({ length: 30 }, (_, i) => ({
      char: chars[Math.floor(Math.random() * chars.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.2 + Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.3
    }));
    setCharacters(newCharacters);
  }, []);

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleEnter = () => {
    // En móvil → /collections/all (VER TODO)
    // En desktop → /collections/new (NUEVO DROP)
    const destination = isMobile ? '/collections/all' : '/collections/new';
    router.push(destination);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden"
    >
      {/* Caracteres flotantes en mosaico */}
      <div className="absolute inset-0">
        {characters.map((item, index) => (
          <div
            key={index}
            className="absolute animate-float"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              opacity: item.opacity,
              animation: `float ${20 / item.speed}s linear infinite`,
              animationDelay: `${-index * 0.5}s`,
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 800,
              color: '#000000',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      {/* Contenido central */}
      <div className="relative z-10 text-center px-8">
        {/* Logo principal */}
        <div 
          className="mb-12"
          style={{
            animation: 'fadeInScale 1.2s ease-out forwards'
          }}
        >
          <h1 
            className="text-black mb-4"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: 'clamp(5rem, 15vw, 12rem)',
              fontWeight: 800,
              letterSpacing: '0.02em',
              lineHeight: 0.9
            }}
          >
            VIOGI
          </h1>
          <div 
            className="h-[2px] w-32 bg-black mx-auto mb-4"
            style={{
              animation: 'expandWidth 0.8s ease-out 0.5s forwards',
              width: 0
            }}
          />
          <p 
            className="text-black/60 tracking-[0.3em] uppercase"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              animation: 'fadeIn 1s ease-out 0.8s forwards',
              opacity: 0
            }}
          >
            Streetwear Collection
          </p>
        </div>

        {/* Botón Enter */}
        <button
          onClick={handleEnter}
          className="group relative overflow-hidden"
          style={{
            animation: 'fadeInUp 1s ease-out 1s forwards',
            opacity: 0
          }}
        >
          <div 
            className="px-16 py-5 border-2 border-black transition-all duration-300 group-hover:bg-black"
          >
            <span 
              className="text-black group-hover:text-white transition-colors duration-300 uppercase tracking-[0.25em]"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              Enter
            </span>
          </div>
        </button>

        {/* Hint texto */}
        <p 
          className="mt-8 text-black/40 text-xs"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            animation: 'fadeIn 1s ease-out 1.3s forwards',
            opacity: 0
          }}
        >
          Click para explorar la colección
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -15px) rotate(5deg);
          }
          50% {
            transform: translate(-5px, -30px) rotate(-3deg);
          }
          75% {
            transform: translate(-15px, -15px) rotate(7deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 8rem;
          }
        }
      `}</style>
    </div>
  );
}

