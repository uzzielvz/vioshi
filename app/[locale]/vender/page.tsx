'use client';

import { useState } from 'react';

export default function VenderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Send application to backend
      console.log('Vendor application:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold uppercase tracking-wider">
                Solicitud Enviada
              </h1>
              <p className="text-gray-600">
                Gracias por tu interés en vender con VIOGI. Revisaremos tu
                solicitud y nos pondremos en contacto contigo pronto.
              </p>
            </div>
            <a
              href="/"
              className="inline-block bg-black text-white px-8 py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-wider">
            Vende con VIOGI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Únete a nuestra comunidad de marcas y diseñadores. Comparte tu
            creatividad con miles de personas que buscan streetwear único y
            auténtico.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-medium uppercase tracking-wider">
              Audiencia Global
            </h3>
            <p className="text-sm text-gray-600">
              Acceso a una comunidad apasionada por el streetwear
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-medium uppercase tracking-wider">
              Comisiones Justas
            </h3>
            <p className="text-sm text-gray-600">
              Comisiones competitivas y pagos puntuales
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-medium uppercase tracking-wider">
              Soporte Dedicado
            </h3>
            <p className="text-sm text-gray-600">
              Equipo de apoyo para ayudarte a crecer
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-bold uppercase tracking-wider mb-6">
            Solicitud de Vendedor
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">
                Información Personal
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="NOMBRE COMPLETO"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="TELÉFONO"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* Brand Info */}
            <div>
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">
                Información de Marca
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="brandName"
                  placeholder="NOMBRE DE LA MARCA"
                  required
                  value={formData.brandName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    name="website"
                    placeholder="SITIO WEB (OPCIONAL)"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                  />
                  <input
                    type="text"
                    name="instagram"
                    placeholder="INSTAGRAM (@USERNAME)"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                  />
                </div>
                <select
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm appearance-none bg-white"
                  style={{
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
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm appearance-none bg-white"
                  style={{
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
              <h3 className="text-sm uppercase tracking-wider font-medium mb-4">
                Cuéntanos sobre tu marca
              </h3>
              <textarea
                name="message"
                placeholder="Describe tu marca, tu visión y por qué quieres vender en VIOGI..."
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes preguntas?{' '}
            <a
              href="/pages/customer-support"
              className="underline font-medium text-black"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
