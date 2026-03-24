'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocaleContext } from '@/hooks/useLocaleContext';

const fontStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function VenderPage() {
  const { locale } = useLocaleContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    brandName: '',
    website: '',
    instagram: '',
    productType: '',
    experience: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: Send application to backend (Phase 2)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (mountedRef.current) setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      if (mountedRef.current) setSubmitError('Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white" style={fontStyle}>
        <div className="max-w-2xl mx-auto px-6 py-24">
          <div className="text-center space-y-6">
            <p style={{ fontSize: '32px', fontWeight: 300, color: '#000' }}>✓</p>
            <div className="space-y-2">
              <h1 className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
                Solicitud Enviada
              </h1>
              <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
                Gracias por tu interés en vender con VIOGI. Revisaremos tu
                solicitud y nos pondremos en contacto contigo pronto.
              </p>
            </div>
            <Link
              href={`/${locale}`}
              className="inline-block bg-black text-white px-8 py-2.5 uppercase hover:opacity-75 transition-opacity"
              style={{ fontSize: '11px', letterSpacing: '0.05em' }}
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="uppercase tracking-wide mb-3" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
            Vende con VIOGI
          </h1>
          <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto' }}>
            Únete a nuestra comunidad de marcas y diseñadores. Comparte tu
            creatividad con miles de personas que buscan streetwear único y auténtico.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 border-t border-b border-gray-200 py-8">
          <div className="text-center space-y-2">
            <p className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
              Audiencia Global
            </p>
            <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
              Acceso a una comunidad apasionada por el streetwear
            </p>
          </div>
          <div className="text-center space-y-2">
            <p className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
              Comisiones Justas
            </p>
            <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
              Comisiones competitivas y pagos puntuales
            </p>
          </div>
          <div className="text-center space-y-2">
            <p className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
              Soporte Dedicado
            </p>
            <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
              Equipo de apoyo para ayudarte a crecer
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div className="border border-gray-200 p-8">
          <h2 className="uppercase tracking-wide mb-6 pb-4 border-b border-gray-200" style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
            Solicitud de Vendedor
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Info */}
            <div>
              <p className="uppercase tracking-wide mb-4" style={{ fontSize: '10px', fontWeight: 500, color: '#999' }}>
                Información Personal
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  name="fullName"
                  placeholder="NOMBRE COMPLETO"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                  style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                    style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="TELÉFONO"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                    style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                  />
                </div>
              </div>
            </div>

            {/* Brand Info */}
            <div>
              <p className="uppercase tracking-wide mb-4" style={{ fontSize: '10px', fontWeight: 500, color: '#999' }}>
                Información de Marca
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  name="brandName"
                  placeholder="NOMBRE DE LA MARCA"
                  required
                  value={formData.brandName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                  style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="url"
                    name="website"
                    placeholder="SITIO WEB (OPCIONAL)"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                    style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                  />
                  <input
                    type="text"
                    name="instagram"
                    placeholder="INSTAGRAM (@USERNAME)"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                    style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                  />
                </div>
                <select
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-black transition-colors appearance-none bg-white"
                  style={{
                    fontSize: '11px',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">TIPO DE PRODUCTOS</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="calzado">Calzado</option>
                  <option value="joyeria">Joyería</option>
                  <option value="otro">Otro</option>
                </select>
                <select
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2.5 focus:outline-none focus:border-black transition-colors appearance-none bg-white"
                  style={{
                    fontSize: '11px',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">EXPERIENCIA VENDIENDO</option>
                  <option value="nueva">Nueva marca / Sin experiencia</option>
                  <option value="1-2">1-2 años</option>
                  <option value="3-5">3-5 años</option>
                  <option value="5+">Más de 5 años</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="uppercase tracking-wide mb-4" style={{ fontSize: '10px', fontWeight: 500, color: '#999' }}>
                Cuéntanos sobre tu marca
              </p>
              <textarea
                name="message"
                placeholder="Describe tu marca, tu visión y por qué quieres vender en VIOGI..."
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none bg-transparent"
                style={{ fontSize: '11px' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-2.5 uppercase hover:opacity-75 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontSize: '11px', letterSpacing: '0.05em' }}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
            {submitError && (
              <p className="text-[10px] text-red-500 mt-2">{submitError}</p>
            )}
          </form>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center">
          <p style={{ fontSize: '11px', color: '#666' }}>
            ¿Tienes preguntas?{' '}
            <Link
              href={`/${locale}/pages/customer-support`}
              className="underline hover:opacity-60 transition-opacity"
              style={{ color: '#000' }}
            >
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
