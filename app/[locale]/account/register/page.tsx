'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

const inputClass =
  'w-full border border-gray-300 px-3 py-2.5 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('account');
  const { locale } = useLocaleContext();
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { alert(t('passwords_mismatch')); return; }
    setIsLoading(true);
    try {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-gray-50 w-full max-w-sm px-8 py-10" style={FONT}>

        {/* Logo */}
        <div className="text-center mb-7">
          <span className="text-lg font-bold" style={LOGO}>VIOGI</span>
        </div>

        {/* Titles */}
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5">{t('register_title')}</p>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-5">{t('register_subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="firstName" placeholder={t('first_name')} required value={formData.firstName} onChange={handleChange} className={inputClass} />
            <input type="text" name="lastName" placeholder={t('last_name')} required value={formData.lastName} onChange={handleChange} className={inputClass} />
          </div>

          <input type="text" name="username" placeholder={t('username_placeholder')} required value={formData.username} onChange={handleChange} className={inputClass} autoComplete="username" />
          <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} className={inputClass} />

          <div>
            <input type="password" name="password" placeholder="Password" required minLength={8} value={formData.password} onChange={handleChange} className={inputClass} />
            <p className="text-[10px] text-gray-400 mt-0.5">{t('min_chars')}</p>
          </div>

          <input type="password" name="confirmPassword" placeholder={t('confirm_password')} required minLength={8} value={formData.confirmPassword} onChange={handleChange} className={inputClass} />

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleChange}
              className="w-3 h-3 mt-0.5 border border-gray-300 rounded-sm checked:bg-black checked:border-black focus:ring-0 focus:outline-none flex-shrink-0"
            />
            <span className="text-[10px] text-gray-400">{t('newsletter_label')}</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2.5 text-[11px] uppercase tracking-wide font-medium hover:opacity-75 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? t('register_submitting') : t('register_submit')}
          </button>
        </form>

        {/* Sign in link */}
        <div className="mt-5 text-center">
          <Link
            href={`/${locale}/account`}
            className="text-[10px] text-gray-400 hover:text-black transition-colors"
          >
            {t('already_account')} {t('sign_in')}
          </Link>
        </div>
      </div>
    </div>
  );
}
