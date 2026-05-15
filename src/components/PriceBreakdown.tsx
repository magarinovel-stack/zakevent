import { useTranslation } from "react-i18next";

interface Props { basePrice: number; packageName: string; }

export function PriceBreakdown({ basePrice, packageName }: Props) {
  const { t } = useTranslation();
  const commission = Math.round(basePrice * 0.1);
  const total = basePrice + commission;

  return (
    <div className="border border-[var(--color-border)] p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-muted)]">{t("components.priceBreakdown.package")}: {packageName}</span>
        <span>{basePrice.toLocaleString()} {t("components.priceBreakdown.currency")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-muted)]">{t("components.priceBreakdown.commission")}</span>
        <span>{commission.toLocaleString()} {t("components.priceBreakdown.currency")}</span>
      </div>
      <div className="border-t border-[var(--color-border)] pt-3 flex justify-between font-medium">
        <span>{t("components.priceBreakdown.total")}</span>
        <span className="text-[var(--color-primary)]">{total.toLocaleString()} {t("components.priceBreakdown.currency")}</span>
      </div>
    </div>
  );
}
