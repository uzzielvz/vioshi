'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Address {
  id: string;
  name: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    street: 'Av. Insurgentes Sur 1234',
    apartment: 'Depto 301',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '03100',
    country: 'México',
    phone: '+52 55 1234 5678',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Juan Pérez',
    street: 'Av. Juárez 567',
    city: 'Guadalajara',
    state: 'Jalisco',
    zipCode: '44100',
    country: 'México',
    phone: '+52 33 9876 5432',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [isAdding, setIsAdding] = useState(false);

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
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
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-bold uppercase tracking-wider">
              Mis Direcciones
            </h1>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-black text-white px-6 py-3 rounded uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {isAdding ? 'Cancelar' : 'Nueva Dirección'}
            </button>
          </div>
        </div>

        {/* Add Address Form */}
        {isAdding && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
              Nueva Dirección
            </h2>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="NOMBRE COMPLETO"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
                <input
                  type="tel"
                  placeholder="TELÉFONO"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
              </div>
              <input
                type="text"
                placeholder="CALLE Y NÚMERO"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
              />
              <input
                type="text"
                placeholder="APARTAMENTO, SUITE, ETC. (OPCIONAL)"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
              />
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="CIUDAD"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
                <input
                  type="text"
                  placeholder="ESTADO"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
                <input
                  type="text"
                  placeholder="CP"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-wider"
                />
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-2 border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                />
                <span className="ml-3 text-sm">
                  Establecer como dirección predeterminada
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 rounded uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Guardar Dirección
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 border-2 border-gray-300 text-black py-3 rounded uppercase tracking-wider text-sm font-medium hover:border-black transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-wider">
                  No Tienes Direcciones
                </h2>
                <p className="text-gray-600">
                  Agrega una dirección para hacer tus compras más rápido
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white border border-gray-200 rounded-lg p-6 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-black text-white rounded-full text-xs font-medium uppercase tracking-wider">
                    Predeterminada
                  </span>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                    {address.apartment && (
                      <p className="text-sm text-gray-600">{address.apartment}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                    <p className="text-sm text-gray-600 mt-2">{address.phone}</p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button className="flex-1 border border-gray-300 text-black py-2 rounded text-xs uppercase tracking-wider font-medium hover:border-black transition-colors">
                      Editar
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1 border border-gray-300 text-black py-2 rounded text-xs uppercase tracking-wider font-medium hover:border-black transition-colors"
                      >
                        Predeterminar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="border border-red-300 text-red-600 px-3 py-2 rounded text-xs uppercase tracking-wider font-medium hover:border-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
