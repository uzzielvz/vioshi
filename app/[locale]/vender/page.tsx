'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { brand } from '@/lib/brand';
import EmptyState from '@/components/ui/EmptyState';
import { ChevronIcon, SellIcon } from '@/components/ui/icons';
import {
  buttonClass,
  hintClass,
  inputClass,
  labelClass,
  screenTitleClass,
  sectionLabelClass,
  textLinkClass,
} from '@/components/ui/styles';
import { submitSellerApplication } from './actions';

// The action returns codes, not copy; the message follows the active locale.
const ERROR_KEYS = {
  invalid:      'error_invalid',
  rate_limited: 'error_rate_limited',
  failed:       'error_failed',
} as const;

// Stored values stay as they were; only the labels changed.
const PRODUCT_TYPES = ['streetwear', 'accesorios', 'calzado', 'joyeria', 'otro'] as const;
const EXPERIENCE = [
  { value: 'nueva', label: 'exp_nueva' },
  { value: '1-2', label: 'exp_1_2' },
  { value: '3-5', label: 'exp_3_5' },
  { value: '5+', label: 'exp_5_plus' },
] as const;

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={clsx(inputClass, 'cursor-pointer appearance-none pr-9')} />
      <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted" />
    </div>
  );
}

export default function VenderPage() {
  const { locale } = useLocaleContext();
  const t = useTranslations('ui.sell');
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
    setSubmitError('');
    try {
      // Leaves a `pending` row. Approving it is an admin act, not this form's job.
      const result = await submitSellerApplication(formData);
      if (!mountedRef.current) return;

      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(t(ERROR_KEYS[result.code]));
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (mountedRef.current) setSubmitError(t('error_failed'));
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <EmptyState icon={<SellIcon />} title={t('sent_title')} body={t('sent_body')} className="py-20">
        <Link href={`/${locale}`} className={buttonClass('primary')}>
          {t('back_home')}
        </Link>
      </EmptyState>
    );
  }

  const steps = [
    { title: t('step1_title', { brand: brand.name }), body: t('step1_body'), note: t('step_now'), now: true },
    { title: t('step2_title'), body: t('step2_body', { brand: brand.name }), note: t('step_later'), now: false },
    { title: t('step3_title', { brand: brand.name }), body: t('step3_body'), note: null, now: false },
  ];

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-12 pt-5 md:pt-10">
      <h1 className={screenTitleClass}>{t('title', { brand: brand.name })}</h1>
      <p className="mt-1.5 text-[14px] leading-[1.45] text-muted">{t('lead', { brand: brand.name })}</p>

      <ol className="mt-5 grid gap-2.5">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={clsx(
              'grid grid-cols-[28px_1fr] gap-3 rounded-btn border p-3.5',
              step.now ? 'border-ink' : 'border-line'
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                'grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold',
                step.now ? 'bg-ink text-paper' : 'bg-carton text-ink'
              )}
            >
              {i + 1}
            </span>
            <div className="grid gap-0.5">
              <b className="text-[14px] font-semibold text-ink">{step.title}</b>
              <span className="text-[13px] leading-[1.45] text-muted">{step.body}</span>
              {step.note && (
                <span className={clsx('text-[12px] font-semibold', step.now ? 'text-accent' : 'text-muted')}>
                  {step.note}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-3.5">
        <h2 className="text-[17px] font-bold text-ink">{t('form_title')}</h2>

        <h3 className={clsx(sectionLabelClass, 'pt-1')}>{t('about_you')}</h3>
        <Field id="fullName" label={t('full_name')}>
          <input id="fullName" name="fullName" type="text" autoComplete="name" required value={formData.fullName} onChange={handleChange} className={inputClass} />
        </Field>
        <div className="grid gap-3.5 md:grid-cols-2 md:gap-2.5">
          <Field id="email" label={t('email')}>
            <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputClass} />
          </Field>
          <Field id="phone" label={t('phone')}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" required value={formData.phone} onChange={handleChange} className={inputClass} />
          </Field>
        </div>

        <h3 className={clsx(sectionLabelClass, 'pt-3')}>{t('about_shop')}</h3>
        <Field id="brandName" label={t('shop_name')}>
          <input id="brandName" name="brandName" type="text" required value={formData.brandName} onChange={handleChange} className={inputClass} />
        </Field>
        <div className="grid gap-3.5 md:grid-cols-2 md:gap-2.5">
          <Field id="instagram" label={t('instagram')}>
            <input id="instagram" name="instagram" type="text" placeholder={t('instagram_placeholder')} value={formData.instagram} onChange={handleChange} className={inputClass} />
          </Field>
          <Field id="website" label={t('website')}>
            <input id="website" name="website" type="url" placeholder="https://" value={formData.website} onChange={handleChange} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-3.5 md:grid-cols-2 md:gap-2.5">
          <Field id="productType" label={t('product_type')}>
            <Select id="productType" name="productType" required value={formData.productType} onChange={handleChange}>
              <option value="">{t('choose')}</option>
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`type_${type}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="experience" label={t('experience')}>
            <Select id="experience" name="experience" required value={formData.experience} onChange={handleChange}>
              <option value="">{t('choose')}</option>
              {EXPERIENCE.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field id="message" label={t('message')} hint={t('message_hint')}>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={clsx(inputClass, 'h-auto resize-none py-2.5 leading-[1.45]')}
          />
        </Field>

        {submitError && (
          <p role="alert" className="rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className={buttonClass('primary', 'md', 'w-full')}>
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink">
        {t.rich('questions', {
          link: (chunks) => (
            <Link href={`/${locale}/pages/customer-support`} className={textLinkClass}>
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
