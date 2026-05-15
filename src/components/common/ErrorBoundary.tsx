import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import i18n from "@/lib/i18n";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    import("@/services/monitoringService").then(({ monitoringService }) => {
      monitoringService.captureError(error, { componentStack: errorInfo.componentStack });
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-12 bg-[var(--color-background-alt)]">
          <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-full flex items-center justify-center mx-auto border border-[var(--color-error)]/20">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-extralight tracking-tight text-[var(--color-foreground)]">{i18n.t("errorBoundary.title")}</h2>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed italic font-serif">
                {i18n.t("errorBoundary.description")}
              </p>
            </div>
            <div className="pt-4">
               <Button 
                onClick={() => window.location.reload()}
                className="bg-[var(--color-foreground)] text-white rounded-[var(--radius-sm)] px-10 h-14 uppercase text-[10px] font-bold tracking-widest hover:bg-[var(--color-primary)] transition-all flex items-center gap-3 mx-auto"
               >
                 <RefreshCw className="w-4 h-4" /> {i18n.t("errorBoundary.reload")}
               </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
