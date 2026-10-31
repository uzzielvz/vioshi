"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { CONDITIONS, CONDITION_LABELS, CONDITION_LABELS_EN, type Condition } from "@/lib/garments";

// Worst to best, so the bar fills from the left.
const SCALE = [...CONDITIONS].reverse() as Condition[];

// The four-step condition standard, visible on the piece page: where this
// piece sits, what that means, and what the other steps mean on demand.
export default function ConditionScale({
  condition,
  defectNotes,
  locale,
}: {
  condition: Condition;
  defectNotes?: string | null;
  locale: string;
}) {
  const t = useTranslations("ui.product");
  const [open, setOpen] = useState(false);
  const labels = locale === "en" ? CONDITION_LABELS_EN : CONDITION_LABELS;
  const level = SCALE.indexOf(condition);

  return (
    <section aria-label={t("condition")} className="grid gap-2 border-t border-line pt-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{t("condition_title")}</h2>
        <p className="text-[13px] font-semibold text-ink">{labels[condition]}</p>
      </div>

      <ol className="grid grid-cols-4 gap-1">
        {SCALE.map((step, index) => (
          <li key={step} aria-current={step === condition ? "step" : undefined} className="grid gap-1.5">
            <span className={clsx("h-1 rounded-full", index <= level ? "bg-ink" : "bg-line")} />
            <span
              className={clsx(
                "text-[11px] leading-tight",
                step === condition ? "font-semibold text-ink" : "text-muted"
              )}
            >
              {labels[step]}
            </span>
          </li>
        ))}
      </ol>

      <p className="text-[12.5px] leading-relaxed text-muted">{t(`condition_desc_${condition}`)}</p>
      {condition === "con_detalles" && defectNotes && (
        <p className="text-[13px] leading-relaxed text-ink">
          <span className="font-semibold">{t("condition_defect")}</span> {defectNotes}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="-my-1.5 w-fit py-1.5 text-[12.5px] font-semibold text-ink underline decoration-line underline-offset-4"
      >
        {t("condition_help")}
      </button>
      {open && (
        <dl className="grid gap-2 rounded-btn bg-carton p-3 text-[12.5px] leading-relaxed">
          {CONDITIONS.map((step) => (
            <div key={step}>
              <dt className={clsx("font-semibold", step === condition ? "text-ink" : "text-ink/80")}>{labels[step]}</dt>
              <dd className="text-muted">{t(`condition_desc_${step}`)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
