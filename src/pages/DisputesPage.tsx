import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import type { Dispute } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]",
  OPEN: "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]",
  IN_REVIEW: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  RESOLVED: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  REJECTED: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
};

export default function DisputesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [user]);

  async function fetchDisputes() {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("disputes")
        .select("*")
        .or(`client_id.eq.${user.id},provider_id.eq.${user.id},filed_by.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setDisputes((data as unknown as Dispute[]) || []);
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!bookingId || reason.length < 10) {
      toast.error(t("validation.required"));
      return;
    }
    setSubmitting(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const { api } = await import('@/lib/api');
      const res = await api("/api/disputes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          booking_id: bookingId,
          reason,
          evidence_urls: evidenceUrl ? [evidenceUrl] : [],
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(t("toast.disputeFiled"));
      setShowForm(false);
      setReason("");
      setBookingId("");
      setEvidenceUrl("");
      fetchDisputes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    }
    setSubmitting(false);
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <Helmet><title>{t("pages.disputes.title")} | ZAKEVENTS</title></Helmet>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light">{t("pages.disputes.title")}</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-[var(--color-primary)]">
          <Plus className="w-4 h-4 me-1" />{t("pages.disputes.fileDispute")}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-[var(--color-primary)]">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder={t("pages.disputes.bookingId")}
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
            <textarea
              className="w-full h-24 border border-[var(--color-border)] p-3 text-sm rounded"
              placeholder={t("pages.disputes.reason")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Input
              placeholder={t("pages.disputes.evidence")}
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
            <Button
              className="bg-[var(--color-primary)]"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
              {t("common.submit")}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--color-muted)]" /></div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">{t("pages.disputes.noDisputes")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card key={d.id} className="border-[var(--color-border)]">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{d.reason.slice(0, 80)}{d.reason.length > 80 ? "..." : ""}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">{new Date(d.created_at).toLocaleDateString()}</p>
                  {d.resolution && <p className="text-xs mt-1 text-[var(--color-success)]">{t("pages.disputes.resolution")}: {d.resolution}</p>}
                </div>
                <Badge className={STATUS_COLORS[d.status] || STATUS_COLORS.PENDING}>
                  {t(`pages.disputes.${d.status.toLowerCase()}`)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
