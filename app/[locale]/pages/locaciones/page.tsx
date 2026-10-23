import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { formatMxn } from '@/lib/formatters';
import { groupPickupPointsByMunicipality } from '@/lib/pickup';
import { getActivePickupPoints } from '@/lib/pickupPoints';
import HelpLayout, { HelpSection } from '@/components/help/HelpLayout';
import { buttonClass } from '@/components/ui/styles';

export const revalidate = 60;

export default async function LocacionesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const [t, points] = await Promise.all([getTranslations('ui.help'), getActivePickupPoints()]);
  const groups = groupPickupPointsByMunicipality(points);

  return (
    <HelpLayout locale={locale} active="points" title={t('points_title')} lead={t('points_lead')}>
      {groups.length === 0 && <p className="text-[14px] text-muted">{t('points_empty')}</p>}

      {groups.map(([municipio, list]) => (
        <HelpSection key={municipio} title={municipio}>
          <ul className="grid gap-3">
            {list.map((p) => (
              <li key={p.id} className="grid gap-2 rounded-btn border border-line p-3.5">
                <div>
                  <p className="text-[15px] font-semibold">{p.name}</p>
                  <p className="text-[13px] text-muted">
                    {p.address}, {p.city}
                  </p>
                </div>
                <dl className="grid gap-1 text-[13px]">
                  {p.availableHours && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{t('points_hours')}</dt>
                      <dd className="text-right">{p.availableHours}</dd>
                    </div>
                  )}
                  {p.estimatedDays && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{t('points_estimate')}</dt>
                      <dd className="text-right">{p.estimatedDays}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{t('points_cost')}</dt>
                    <dd className="font-semibold tabular-nums">
                      {p.additionalCost > 0 ? formatMxn(p.additionalCost, locale) : t('free')}
                    </dd>
                  </div>
                </dl>
                {p.mapsUrl && (
                  <a
                    href={p.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass('line', 'sm', 'mt-1 w-full')}
                  >
                    {t('points_maps')}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </HelpSection>
      ))}
    </HelpLayout>
  );
}
