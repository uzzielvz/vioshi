import { getTranslations } from 'next-intl/server';
import UnderlineTabs from '@/components/ui/UnderlineTabs';
import { screenTitleClass } from '@/components/ui/styles';

export type HelpTab = 'help' | 'shipping' | 'sizes' | 'points' | 'legal' | 'a11y';

const TABS: { key: HelpTab; path: string }[] = [
  { key: 'help', path: 'customer-support' },
  { key: 'shipping', path: 'shipping-payments-returns' },
  { key: 'sizes', path: 'size-guide' },
  { key: 'points', path: 'locaciones' },
  { key: 'legal', path: 'legal' },
  { key: 'a11y', path: 'accessibility' },
];

// Shared frame for the help and policy pages («Cómo funciona rail» in the prototype).
export default async function HelpLayout({
  locale,
  active,
  title,
  lead,
  children,
}: {
  locale: string;
  active: HelpTab;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  const t = await getTranslations('ui.help');

  return (
    <div className="pb-12">
      <UnderlineTabs
        label={t('nav_label')}
        tabs={TABS.map((tab) => ({
          href: `/${locale}/pages/${tab.path}`,
          label: t(`tab_${tab.key}`),
          active: tab.key === active,
        }))}
      />
      <article className="mx-auto w-full max-w-[680px] px-4 pt-6 md:pt-10">
        <h1 className={screenTitleClass}>{title}</h1>
        {lead && <p className="mt-2 text-[15px] leading-[1.5] text-muted">{lead}</p>}
        <div className="mt-6 grid gap-6">{children}</div>
      </article>
    </div>
  );
}

export function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2 border-t border-line pt-5 text-[14px] leading-[1.55] text-ink">
      <h2 className="text-[16px] font-bold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  );
}

export function HelpList({ items, ordered = false }: { items: React.ReactNode[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List className={ordered ? 'grid list-decimal gap-1 pl-5' : 'grid list-disc gap-1 pl-5'}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </List>
  );
}
