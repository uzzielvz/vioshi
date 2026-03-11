'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

const logoStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
};

const inputClass =
  'w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 placeholder:uppercase placeholder:tracking-wide';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('account');
  const { locale } = useLocaleContext();
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  const [formData, setFormData] = useState({
    username: '',
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
      alert(t('passwords_mismatch'));
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement registration API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (mountedRef.current) router.push(`/${locale}/account`);
    } catch (error) {
      console.error('Registration error:', error);
      if (mountedRef.current) alert(t('error_register'));
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[320px] mx-auto px-4 md:px-6 py-8 md:py-12 min-h-[calc(100vh-4rem)] flex flex-col">
      <h1
        className="text-base font-bold text-black mb-6 self-center uppercase tracking-wide"
        style={logoStyle}
      >
        {t('create_account')}
      </h1>

      <div className="bg-white border border-gray-200 p-5 flex-1">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="firstName"
              placeholder={t('first_name')}
              required
              value={formData.firstName}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="lastName"
              placeholder={t('last_name')}
              required
              value={formData.lastName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <input
            type="text"
            name="username"
            placeholder={t('username_placeholder')}
            required
            value={formData.username}
            onChange={handleChange}
            className={inputClass}
            autoComplete="username"
          />

          <input
            type="email"
            name="email"
            placeholder={t('email_placeholder_upper')}
            required
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />

          <div>
            <input
              type="password"
              name="password"
              placeholder={t('password_placeholder')}
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              {t('min_chars')}
            </p>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder={t('confirm_password')}
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputClass}
          />

          <label className="flex items-start cursor-pointer gap-2">
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
              className="w-3 h-3 mt-0.5 border border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-black flex-shrink-0"
            />
            <span className="text-[10px] text-gray-400">
              {t('newsletter_label')}
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 text-xs uppercase tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            {isLoading ? t('register_submitting') : t('register_submit')}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-200">
          <p className="text-center text-[10px] uppercase tracking-wide text-gray-500 mb-2">
            {t('or')}
          </p>
          <Link
            href={`/${locale}/account`}
            className="block w-full border border-black py-2 text-xs uppercase tracking-wide text-center hover:bg-black hover:text-white transition-colors"
          >
            {t('sign_in')}
          </Link>
        </div>
      </div>

      <p
        className="mt-8 pt-6 text-center text-[10px] uppercase tracking-wide text-gray-600 border-t border-gray-100"
        style={logoStyle}
      >
        {t('register_terms')}{' '}
        <Link
          href={`/${locale}/pages/legal`}
          className="underline hover:text-black"
        >
          {t('terms_and_conditions')}
        </Link>
        {' '}{t('and')}{' '}
        <Link
          href={`/${locale}/pages/legal`}
          className="underline hover:text-black"
        >
          {t('privacy_policy')}
        </Link>
      </p>
    </div>
  );
}
