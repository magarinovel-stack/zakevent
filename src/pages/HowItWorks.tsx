import { useTranslation } from "react-i18next";
import { 
  Users, Store, ShieldCheck, 
  CreditCard, MessageCircle, Star,
  HelpCircle, ChevronRight
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <div className="pt-40 pb-32 px-8 max-w-7xl mx-auto space-y-32 bg-[var(--color-background-alt)]">
      <div className="space-y-10 max-w-3xl">
         <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">Processus</span>
         <h1 className="text-6xl md:text-8xl font-extralight tracking-tight text-[var(--color-foreground)]">
           Comment ça <span className="italic font-serif">marche ?</span>
         </h1>
         <p className="text-[var(--color-muted)] text-xl font-light leading-relaxed">
           ZAKEVENTS simplifie l'organisation de vos événements en connectant les meilleurs talents algériens aux clients exigeants.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
        <div className="space-y-16">
           <div className="flex items-center gap-6 border-b border-[var(--color-border)] pb-10">
              <Users className="w-8 h-8 text-[var(--color-foreground)]" />
              <h2 className="text-3xl font-light tracking-tight text-[var(--color-foreground)]">Pour les Clients</h2>
           </div>
           <div className="space-y-16">
              <Step idx="01" title="Définissez votre besoin" desc="Utilisez notre planificateur intelligent ou explorez les catégories pour trouver ce que vous cherchez." />
              <Step idx="02" title="Comparez & Réservez" desc="Consultez les portfolios, les avis vérifiés et les tarifs transparents avant de réserver en un clic." />
              <Step idx="03" title="Paiement Sécurisé" desc="Payez via Chargily Pay. Votre argent est en séquestre et n'est libéré qu'après le bon déroulement de l'événement." />
              <Step idx="04" title="Célébrez l'esprit tranquille" desc="Le jour J, votre prestataire est là. Vous n'avez plus qu'à profiter de votre moment." />
           </div>
           <Link to="/register/client" className="inline-block pt-8">
              <Button className="rounded-none bg-[var(--color-foreground)] text-white h-14 px-12 text-xs tracking-wide-caps">Créer mon compte client</Button>
           </Link>
        </div>

        <div className="space-y-16">
           <div className="flex items-center gap-6 border-b border-[var(--color-border)] pb-10">
              <Store className="w-8 h-8 text-[var(--color-foreground)]" />
              <h2 className="text-3xl font-light tracking-tight text-[var(--color-foreground)]">Pour les Prestataires</h2>
           </div>
           <div className="space-y-16">
              <Step idx="01" title="Inscrivez-vous gratuitement" desc="Créez votre vitrine professionnelle, ajoutez vos photos et vos tarifs." />
              <Step idx="02" title="Soyez vérifié" desc="Notre équipe vérifie votre identité pour renforcer la confiance des clients." />
              <Step idx="03" title="Recevez des demandes" desc="Répondez aux demandes, gérez vos disponibilités et discutez via notre messagerie." />
              <Step idx="04" title="Soyez payé rubis sur l'ongle" desc="Fini les retards de paiement. Recevez votre dû directement sur votre compte après l'événement." />
           </div>
           <Link to="/register/prestataire" className="inline-block pt-8">
              <Button variant="outline" className="rounded-none border-[var(--color-foreground)] text-[var(--color-foreground)] h-14 px-12 text-xs tracking-wide-caps">S'inscrire comme partenaire</Button>
           </Link>
        </div>
      </div>

      <section className="bg-white p-12 md:p-24 border border-[var(--color-border)] space-y-20">
        <div className="text-center space-y-4">
           <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">Assistance</span>
           <h2 className="text-4xl md:text-5xl font-extralight tracking-tight">Questions <span className="italic font-serif">fréquentes</span></h2>
        </div>
        <Accordion className="w-full max-w-3xl mx-auto">
           <FaqItem 
              q="ZAKEVENTS est-il gratuit ?" 
              a="La création de compte et l'exploration sont gratuites. Nous prélevons une commission de 10% sur les transactions pour assurer le fonctionnement et la sécurité de la plateforme." 
           />
           <FaqItem 
              q="Comment fonctionne le paiement sécurisé ?" 
              a="Grâce à notre partenaire Chargily Pay, nous supportons EDAHABIA et CIB. Le paiement est bloqué sur un compte de séquestre sécurisé et transféré au prestataire seulement 48h après l'événement, sauf en cas de litige." 
           />
           <FaqItem 
              q="Que faire en cas de problème avec un prestataire ?" 
              a="Vous pouvez ouvrir un litige depuis votre tableau de bord. Notre équipe d'administration interviendra pour arbitrer et procéder à un remboursement total ou partiel si nécessaire." 
           />
           <FaqItem 
              q="Comment devenir un prestataire 'Vérifié' ?" 
              a="Il suffit de télécharger votre pièce d'identité et/ou votre registre de commerce lors de l'inscription. Nos modérateurs valideront votre dossier sous 48h." 
           />
        </Accordion>
      </section>

      <div className="bg-[var(--color-foreground)] text-white p-16 md:p-32 space-y-12 text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-20" />
         <h2 className="text-4xl md:text-7xl font-extralight tracking-tight relative z-10 leading-tight">Prêt à <span className="italic font-serif text-[var(--color-primary)]">commencer ?</span></h2>
         <p className="text-white/40 text-lg font-light max-w-xl mx-auto relative z-10">Rejoignez des milliers d'Algériens qui font confiance à ZAKEVENTS pour leurs moments les plus précieux.</p>
         <div className="flex flex-wrap justify-center gap-8 relative z-10 pt-4">
            <Link to="/search">
               <Button className="rounded-none bg-white text-[var(--color-foreground)] h-14 px-12 text-xs tracking-wide-caps hover:bg-[var(--color-border)] transition-all">Explorer le catalogue</Button>
            </Link>
            <Link to="/organiser-mon-evenement">
               <Button variant="outline" className="rounded-none border-white/20 text-white h-14 px-12 text-xs tracking-wide-caps hover:bg-white hover:text-[var(--color-foreground)] transition-all">Planifier un pack</Button>
            </Link>
         </div>
      </div>
    </div>
  );
}

function Step({ idx, title, desc }: { idx: string, title: string, desc: string }) {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium text-[var(--color-muted)] tracking-[0.3em] font-mono">{idx}</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
       </div>
       <div className="space-y-3">
          <h4 className="text-xl font-light tracking-tight text-[var(--color-foreground)]">{title}</h4>
          <p className="text-[var(--color-muted)] text-sm leading-relaxed font-light">{desc}</p>
       </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <AccordionItem value={q} className="border-b border-[var(--color-border)] py-4">
       <AccordionTrigger className="text-left font-light text-xl hover:no-underline hover:opacity-60 transition-all py-6">
          {q}
       </AccordionTrigger>
       <AccordionContent className="text-[var(--color-muted)] pb-10 text-lg font-light leading-relaxed">
          {a}
       </AccordionContent>
    </AccordionItem>
  );
}
