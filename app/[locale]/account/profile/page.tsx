'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+52 55 1234 5678',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a Mi Cuenta
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-wider mt-4">
            Mi Perfil
          </h1>
        </div>

        {/* Profile Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                Información Personal
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                Información de Contacto
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-black text-white py-3 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-black text-white py-3 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex-1 border-2 border-black text-black py-3 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 mt-6">
          <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
            Contraseña
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Actualiza tu contraseña para mantener tu cuenta segura
          </p>
          <Link
            href="/account/forgot-password"
            className="inline-block border-2 border-black text-black px-6 py-3 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors text-sm"
          >
            Cambiar Contraseña
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Link
            href="/account/orders"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors"
          >
            <h3 className="text-sm uppercase tracking-wider font-medium mb-2">
              Mis Pedidos
            </h3>
            <p className="text-sm text-gray-600">
              Ver historial de compras y tracking
            </p>
          </Link>
          <Link
            href="/account/addresses"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors"
          >
            <h3 className="text-sm uppercase tracking-wider font-medium mb-2">
              Mis Direcciones
            </h3>
            <p className="text-sm text-gray-600">
              Gestiona tus direcciones de envío
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
