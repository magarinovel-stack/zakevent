import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Props { onImageSelect: (file: File) => void; aspectRatio?: number; }

export function ImageCropper({ onImageSelect, aspectRatio = 1 }: Props) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageSelect(file);
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="" className="w-full object-cover rounded" style={{ aspectRatio }} /> {/* ds-ignore */}
          <Button variant="outline" size="sm" className="absolute bottom-2 end-2" onClick={() => inputRef.current?.click()}>
            {t("pages.onboarding.uploadPhotos")}
          </Button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="w-full border-2 border-dashed border-[var(--color-border)] p-12 flex flex-col items-center gap-2 hover:border-[var(--color-primary)] transition-colors">
          <Upload className="w-8 h-8 text-[var(--color-muted)]" />
          <span className="text-sm text-[var(--color-muted)]">{t("pages.onboarding.uploadPhotos")}</span>
        </button>
      )}
    </div>
  );
}
