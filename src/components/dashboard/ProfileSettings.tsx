import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Camera, Save, User as UserIcon, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CITIES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileSettings({ type }: { type: "client" | "provider" }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: type === "client" ? `${profile?.firstName || ""} ${profile?.lastName || ""}` : (profile?.businessName || ""),
    bio: profile?.description || profile?.bio || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    avatarUrl: profile?.avatarUrl || profile?.coverPhotoUrl || "",
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const table = type === "client" ? "users" : "providers";
      const matchCol = type === "client" ? "auth_id" : "user_id";

      const updateData: Record<string, string> = {
        phone: formData.phone,
        city: formData.city,
      };

      if (type === "client") {
        const [firstName, ...lastNameParts] = formData.username.split(" ");
        updateData.full_name = `${firstName} ${lastNameParts.join(" ")}`.trim();
      } else {
        updateData.business_name = formData.username;
        updateData.description = formData.bio;
      }

      await supabase.from(table).update(updateData).eq(matchCol, user.id);
      toast.success(t("toast.profileUpdated"));
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-extralight tracking-tight text-[var(--color-foreground)]">{t("profile.settingsTitle")}</h1>
        <p className="text-[var(--color-muted)] font-light uppercase tracking-[0.2em] text-xs">{t("profile.settingsSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <Card className="rounded-none border-[var(--color-border)] shadow-none bg-white col-span-1">
          <CardHeader className="border-b border-[var(--color-border)] pb-6">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)]">{t("profile.photo")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-10 flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full border border-[var(--color-border)] bg-[var(--color-background-alt)] flex items-center justify-center overflow-hidden transition-all group-hover:opacity-50">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-[var(--color-border)]" />
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-[var(--color-foreground)]" />
              </div>
              <input type="file" className="hidden" accept="image/*" />
            </div>
            <p className="mt-6 text-[10px] text-[var(--color-muted)] uppercase tracking-wider text-center">{t("profile.photoFormat")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-[var(--color-border)] shadow-none bg-white md:col-span-2">
          <CardHeader className="border-b border-[var(--color-border)] pb-6">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)]">{t("profile.generalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-foreground)]">
                  {type === "client" ? t("profile.fullName") : t("profile.businessName")}
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <Input 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="pl-10 h-12 bg-[var(--color-background-alt)] border-[var(--color-border)] rounded-none focus-visible:ring-[var(--color-foreground)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-foreground)]">{t("profile.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10 h-12 bg-[var(--color-background-alt)] border-[var(--color-border)] rounded-none focus-visible:ring-[var(--color-foreground)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-foreground)]">{t("profile.city")}</Label>
              <Select 
                value={formData.city || ""} 
                onValueChange={(val) => setFormData({...formData, city: val || ""})}
              >
                <SelectTrigger className="h-12 bg-[var(--color-background-alt)] border-[var(--color-border)] rounded-none focus:ring-0">
                  <SelectValue placeholder={t("components.locationPicker.placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {CITIES.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-foreground)]">{t("profile.bio")}</Label>
              <Textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder={t("profile.bioPlaceholder")}
                className="min-h-[150px] bg-[var(--color-background-alt)] border-[var(--color-border)] rounded-none focus-visible:ring-[var(--color-foreground)] text-sm font-light leading-relaxed"
              />
              <p className="text-[10px] text-[var(--color-muted)] font-light">{t("profile.bioHint")}</p>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)] flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="rounded-[var(--radius-sm)] bg-[var(--color-foreground)] text-white px-10 h-12 text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--color-secondary-light)] transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
