import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowRight, ArrowLeft, Gem, Sparkles, 
  MapPin, Calendar, Heart, Users,
  CheckCircle2, AlertCircle, TrendingUp, Star, ShieldCheck as ShieldIcon
} from "lucide-react";
import { CATEGORIES, CITIES, EVENT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function SmartPlanner() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    city: "Alger",
    date: "",
    guests: 100,
    budget: 350000,
    services: ["photographe", "salle-des-fetes"] as string[]
  });

  const [aiPackage, setAiPackage] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const nextStep = async () => {
    if (step === 1) {
      await generatePackage();
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const generatePackage = async () => {
    setLoading(true);
    const matchedItems: Record<string, unknown>[] = [];
    let currentTotal = 0;

    try {
      for (const serviceId of formData.services) {
        const catId = CATEGORIES.find(c => c.id === serviceId)?.id;
        if (!catId) continue;

        const { data } = await supabase
          .from("providers")
          .select("*")
          .eq("category", catId)
          .contains("cities", [formData.city])
          .eq("status", "APPROVED")
          .order("rating_average", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const provider = data[0];
          matchedItems.push({ ...provider, allocatedPrice: provider.min_price });
          currentTotal += provider.min_price;
        }
      }
      setAiPackage(matchedItems);
      setTotalPrice(currentTotal);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    // In production, this would call /api/payments/create-checkout
    alert("Redirection vers la plateforme de paiement sécurisée Chargily...");
    window.location.href = "https://pay.chargily.net/test/checkout/simulated";
  };

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <Helmet>
        <title>Planificateur Intelligent IA | ZAKEVENTS</title>
        <meta name="description" content="Laissez notre IA concevoir le pack parfait pour votre mariage ou événement en Algérie." />
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Progress header */}
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-4">
             <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", step >= 1 ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]")}>1</div>
             <div className={cn("h-px w-12 bg-[var(--color-border)]", step >= 2 && "bg-[var(--color-primary)]")} />
             <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", step >= 2 ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]")}>2</div>
             <div className={cn("h-px w-12 bg-[var(--color-border)]", step >= 3 && "bg-[var(--color-primary)]")} />
             <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all", step >= 3 ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]")}>3</div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-foreground)]">
              {step === 1 && "Décrivez votre événement"}
              {step === 2 && "Votre pack événement personnalisé"}
              {step === 3 && "Confirmation du pack"}
            </h1>
            <p className="text-[var(--color-muted)]">
               {step === 1 && "Entrez vos détails pour que notre IA puisse vous proposer le meilleur pack."}
               {step === 2 && `Basé sur votre budget de ${formData.budget.toLocaleString()} DA pour ${formData.type} à ${formData.city}.`}
               {step === 3 && "Vérifiez les détails et procédez à la réservation sécurisée."}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {EVENT_TYPES.map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.label })}
                    className={cn(
                      "p-8 rounded-[var(--radius-xl)] border-2 transition-all flex flex-col items-center text-center gap-4 group",
                      formData.type === type.label ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                    )}
                  >
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all", formData.type === type.label ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-background-alt)] text-[var(--color-primary)]")}>
                       {type.id === 'wedding' && <Heart className="w-8 h-8" />}
                       {type.id === 'birthday' && <Sparkles className="w-8 h-8" />}
                       {type.id === 'corporate' && <TrendingUp className="w-8 h-8" />}
                    </div>
                    <h3 className="font-bold text-lg">{type.label}</h3>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[var(--radius-xl)] border border-[var(--color-border)]">
                 <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">Ville de l'événement</label>
                    <select 
                      className="w-full h-12 bg-[var(--color-background-alt)] border-[var(--color-border)] rounded-[var(--radius-xl)] px-4 focus:ring-[var(--color-primary)]"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="">Sélectionnez une ville</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">Date prévue</label>
                    <Input 
                      type="date" 
                      className="h-12 bg-[var(--color-background-alt)] border-[var(--color-border)] rounded-[var(--radius-xl)]"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">Nombre d'invités</label>
                       <span className="font-bold text-[var(--color-primary)]">{formData.guests} invités</span>
                    </div>
                    <Slider 
                      value={[formData.guests]} 
                      max={1000} 
                      step={10} 
                      onValueChange={(val) => setFormData({ ...formData, guests: Array.isArray(val) ? val[0] : val })}
                    />
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">Budget Total (DA)</label>
                       <span className="font-bold text-[var(--color-primary)]">{formData.budget.toLocaleString()} DA</span>
                    </div>
                    <Slider 
                      value={[formData.budget]} 
                      max={2000000} 
                      min={50000}
                      step={5000}
                      onValueChange={(val) => setFormData({ ...formData, budget: Array.isArray(val) ? val[0] : val })}
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xl font-bold font-serif">Services souhaités</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-3 rtl:space-x-reverse bg-white p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)]">
                         <Checkbox 
                           id={`svc-${cat.id}`} 
                           checked={formData.services.includes(cat.id)}
                           onCheckedChange={(checked) => {
                              if (checked) setFormData({ ...formData, services: [...formData.services, cat.id] })
                              else setFormData({ ...formData, services: formData.services.filter(s => s !== cat.id) })
                           }}
                         />
                         <label htmlFor={`svc-${cat.id}`} className="text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{cat.label}</label>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end">
                 <Button 
                   onClick={nextStep}
                   disabled={!formData.type || !formData.city || !formData.date || formData.services.length === 0}
                   className="bg-[var(--color-primary)] text-white h-14 px-8 rounded-[var(--radius-lg)] text-lg shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-[var(--shadow-md)])] transition-all"
                 >
                   Générer mon pack <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                 </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-12"
            >
               {/* Budget Tracker */}
               <Card className="rounded-[var(--radius-xl)] border-none bg-white p-8 shadow-[var(--shadow-sm)]">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">
                        <span>Allocation du budget</span>
                        <span>{formData.budget.toLocaleString()} DA</span>
                     </div>
                     <div className="flex h-3 rounded-full overflow-hidden bg-[var(--color-background-alt)] border border-[var(--color-border)]">
                        <div className="bg-[var(--color-primary)] h-full w-[40%]" title="Salle" />
                        <div className="bg-[var(--color-success)] h-full w-[25%]" title="Photo" />
                        <div className="bg-[var(--color-accent)] h-full w-[20%]" title="Déco" />
                        <div className="bg-[var(--color-foreground)] h-full w-[10%]" title="Gâteaux" />
                        <div className="bg-[var(--color-border)] h-full w-[5%]" />
                     </div>
                     <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-widest">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" /> Salle (80k)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--color-success)]" /> Photo (45k)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" /> Déco (30k)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--color-foreground)]" /> Pâtisserie (15k)</span>
                     </div>
                  </div>
               </Card>

               <div className="space-y-6">
                  {loading ? (
                    <div className="py-20 text-center animate-pulse font-serif text-xl italic text-[var(--color-muted)]">Conception de votre pack idéal...</div>
                  ) : aiPackage.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed rounded-[var(--radius-xl)] text-[var(--color-muted)]">
                       Aucun prestataire ne correspond exactement à tous vos critères de ville et catégorie. 
                       Essayez d'élargir votre recherche.
                    </div>
                  ) : (
                    aiPackage.map((item, idx) => {
                      return (
                         <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all group overflow-hidden">
                            <div className="w-20 h-20 bg-[var(--color-background-alt)] rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform overflow-hidden">
                               {item.coverPhotoUrl ? (
                                 <img src={item.coverPhotoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <Gem className="w-8 h-8" />
                               )}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-1">
                               <Badge variant="outline" className="text-[10px] border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-none uppercase tracking-widest">{item.category}</Badge>
                               <h4 className="text-xl font-bold font-sans tracking-tight">{item.businessName}</h4>
                               <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest">
                                  <span className="flex items-center"><Star className="w-3 h-3 mr-1 fill-[var(--color-primary)] text-[var(--color-primary)]" /> {item.ratingAverage || 5.0}</span>
                                  <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-[var(--color-accent)]" /> {formData.city}</span>
                               </div>
                            </div>
                            <div className="text-center md:text-right space-y-2">
                               <p className="text-2xl font-light tracking-tighter text-[var(--color-foreground)] font-sans">{item.allocatedPrice?.toLocaleString()} DA</p>
                               <Link to={`/prestataires/${item.id}`} className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors">Détails →</Link>
                            </div>
                         </div>
                      );
                    })
                  )}
               </div>

               <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[var(--color-border)]">
                  <div className="text-center md:text-left">
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]">Estimation du Pack</p>
                     <p className="text-4xl font-extralight tracking-tighter text-[var(--color-foreground)]">{totalPrice.toLocaleString()} DA</p>
                     {totalPrice <= formData.budget ? (
                       <p className="text-[10px] text-[var(--color-success)] font-bold uppercase tracking-widest mt-1">✓ En dessous de votre limite ({formData.budget.toLocaleString()} DA)</p>
                     ) : (
                       <p className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-widest mt-1">⚠ Dépassement de budget ({formData.budget.toLocaleString()} DA)</p>
                     )}
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                     <Button variant="outline" onClick={prevStep} className="flex-1 md:flex-initial h-14 px-8 rounded-none border-[var(--color-foreground)] text-[var(--color-foreground)] uppercase text-xs font-bold tracking-widest">Retour</Button>
                     <Button 
                       onClick={nextStep} 
                       disabled={aiPackage.length === 0}
                       className="flex-1 md:flex-initial bg-[var(--color-foreground)] text-white h-14 px-12 rounded-none text-xs uppercase font-bold tracking-widest hover:bg-[var(--color-primary)] transition-all"
                     >
                       Vérifier le pack →
                     </Button>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
               key="step3"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-12"
            >
               <Card className="rounded-[var(--radius-xl)] border-none bg-white p-12 text-center space-y-8 shadow-[var(--shadow-[var(--shadow-md)])]">
                  <div className="w-24 h-24 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--color-success)]">
                     <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-3xl font-serif font-bold">Presque terminé !</h2>
                     <p className="text-[var(--color-muted)] max-w-md mx-auto">Veuillez vérifier le récapitulatif de votre événement avant de procéder au paiement sécurisé via Chargily Pay.</p>
                  </div>

                  <div className="bg-[var(--color-background-alt)] p-10 rounded-none border border-[var(--color-border)] space-y-8 text-left">
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Événement</span>
                           <p className="text-xl font-light tracking-tight text-[var(--color-foreground)]">{formData.type}</p>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Ville & Date</span>
                           <p className="text-xl font-light tracking-tight text-[var(--color-foreground)]">{formData.city}, {formData.date}</p>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Invités</span>
                           <p className="text-xl font-light tracking-tight text-[var(--color-foreground)]">{formData.guests} personnes</p>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Prestataires</span>
                           <p className="text-xl font-light tracking-tight text-[var(--color-foreground)]">{aiPackage.length} sélectionnés</p>
                        </div>
                     </div>
                     <div className="pt-8 border-t border-[var(--color-border)] flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-foreground)]">Total à régler</span>
                        <span className="text-4xl font-extralight tracking-tighter text-[var(--color-foreground)]">{totalPrice.toLocaleString()} DA</span>
                     </div>
                  </div>

                  <div className="space-y-6 pt-4">
                     <Button 
                        onClick={handleCheckout}
                        className="w-full h-20 bg-[var(--color-foreground)] text-white text-xs uppercase font-bold tracking-[0.4em] rounded-none shadow-[var(--shadow-[var(--shadow-md)])] hover:bg-[var(--color-primary)] transition-all"
                     >
                        Payer avec Chargily Pay (EDAHABIA / CIB)
                     </Button>
                     <p className="text-[10px] text-[var(--color-muted)] flex items-center justify-center gap-3 font-bold uppercase tracking-widest italic">
                        <ShieldIcon className="w-4 h-4 text-[var(--color-success)]" /> 
                        Cryptage SSL 256 bits · Séquestre Garanti ZAKEVENTS
                     </p>
                  </div>
               </Card>
               <Button variant="ghost" onClick={prevStep} className="w-full text-[var(--color-muted)]">Modifier mon choix</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
