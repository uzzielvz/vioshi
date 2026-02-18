'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement registration API call
      console.log('Registering user:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to account page after successful registration
      router.push('/account');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold uppercase tracking-wider">
              Crear Cuenta
            </h1>
            <p className="text-gray-600 text-sm">
              Únete a la familia VIOGI
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="NOMBRE"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="APELLIDO"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="EMAIL"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="CONTRASEÑA"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres
              </p>
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="CONFIRMAR CONTRASEÑA"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="w-4 h-4 mt-1 border-2 border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                />
                <span className="ml-3 text-sm">
                  Quiero recibir novedades, ofertas exclusivas y contenido de
                  VIOGI
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creando Cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            Al crear una cuenta, aceptas nuestros{' '}
            <Link href="/pages/legal" className="underline">
              Términos y Condiciones
            </Link>{' '}
            y{' '}
            <Link href="/pages/legal" className="underline">
              Política de Privacidad
            </Link>
            .
          </p>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wider">
                O
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/account"
                className="underline font-medium text-black hover:opacity-60 transition-opacity"
              >
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
