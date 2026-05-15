import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const STEPS = ["created", "confirmed", "completed"] as const;

export default function TimelinePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const currentStep = 1; // Would come from booking data

  return (
    <div className="pt-32 pb-24 px-6 max-w-2xl mx-auto">
      <Helmet><title>{t("pages.timeline.title")} | ZAKEVENTS</title></Helmet>
      <h1 className="text-2xl font-light mb-12">{t("pages.timeline.title")}</h1>

      <div className="relative ps-8">
        <div className="absolute start-3 top-0 bottom-0 w-px bg-[var(--color-border)]" />
        {STEPS.map((step, i) => (
          <div key={step} className="relative pb-10 last:pb-0">
            <div className="absolute start-[-20px] top-1">
              {i <= currentStep ? <CheckCircle2 className="w-6 h-6 text-[var(--color-primary)]" /> : <Circle className="w-6 h-6 text-[var(--color-border)]" />}
            </div>
            <div className="ps-4">
              <p className={`font-medium ${i <= currentStep ? "text-[var(--color-foreground)]" : "text-[var(--color-muted)]"}`}>
                {t(`pages.timeline.${step}`)}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {i <= currentStep ? new Date().toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
