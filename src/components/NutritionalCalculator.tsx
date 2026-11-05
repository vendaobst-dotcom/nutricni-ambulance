"use client";

import { Calculator } from "lucide-react";

type TemplateType = "redukce" | "setrici" | "sportovec";

interface NutritionalCalculatorProps {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  patientGoal?: string;
  onApplyTemplate: (text: string) => void;
}

export default function NutritionalCalculator({
  bmr,
  tdee,
  targetCalories,
  proteinGrams,
  fatGrams,
  carbGrams,
  patientGoal,
  onApplyTemplate,
}: NutritionalCalculatorProps) {
  const applyTemplate = (templateType: TemplateType) => {
    let text = "";
    if (templateType === "redukce") {
      text = `• Znížit denní energetický příjem na ~${targetCalories || 1800} kcal.\n• Bílkoviny: ${proteinGrams || 110}g/den (kuřecí, krůtí, ryby, tvaroh, vejce).\n• Důraz na dostatek vlákniny (min. 30g/den - zelenina, celozrnné obiloviny).\n• Pitný režim: 2.5 - 3 litry čisté vody / neslazeného čaje denně.\n• Omezit jednoduché cukry a vysoce průmyslově zpracované potraviny.`;
    } else if (templateType === "setrici") {
      text = `• Šetřící dieta bez dráždivého koření a přepalovaných tuků.\n• Příprava stravy vařením nebo dušením.\n• Jíst v menších porcích 5x denně v klidovém režimu.\n• Vyloučit nadýmavou zeleninu, čerstvé kynuté pečivo a kofein.`;
    } else if (templateType === "sportovec") {
      text = `• Navýšení bílkovin na ~${proteinGrams || 140}g/den pro podporu regenerace.\n• Sacharidy před a po tréninku k doplnění glykogenu (${carbGrams || 220}g/den).\n• Suplementace: Omega-3, Vitamín D3 + K2, Hořčík malát večer.`;
    }
    onApplyTemplate(text);
  };

  return (
    <div className="bg-gradient-to-br from-teal-900 to-gray-900 text-white p-5 rounded-2xl shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-teal-700/50 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-teal-300">
          <Calculator className="w-4 h-4" /> Nutriční Kalkulačka (BMR & TDEE)
        </h3>
        <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded font-mono">Mifflin-St Jeor</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
          <span className="text-gray-400 block text-[10px]">Bazální metabolizmus (BMR)</span>
          <strong className="text-base text-teal-400">{bmr ? `${bmr} kcal` : "—"}</strong>
        </div>
        <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700">
          <span className="text-gray-400 block text-[10px]">Celkový výdej (TDEE)</span>
          <strong className="text-base text-amber-400">{tdee ? `${tdee} kcal` : "—"}</strong>
        </div>
      </div>

      <div className="bg-teal-950/80 p-3 rounded-xl border border-teal-800 text-xs space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-teal-200 font-bold">Cílový příjem ({patientGoal || "Redukce"}):</span>
          <strong className="text-sm text-emerald-400">{targetCalories ? `${targetCalories} kcal/den` : "—"}</strong>
        </div>
        <div className="grid grid-cols-3 gap-1 text-center text-[11px] pt-1 border-t border-teal-800/60 font-mono">
          <div><span className="text-gray-400 block text-[9px]">Bílkoviny</span><strong className="text-blue-300">{proteinGrams}g</strong></div>
          <div><span className="text-gray-400 block text-[9px]">Tuky</span><strong className="text-yellow-300">{fatGrams}g</strong></div>
          <div><span className="text-gray-400 block text-[9px]">Sacharidy</span><strong className="text-green-300">{carbGrams}g</strong></div>
        </div>
      </div>

      <div className="pt-2">
        <span className="text-[10px] font-bold text-gray-400 block mb-1">⚡ Rychlé vložení šablony doporučení:</span>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => applyTemplate("redukce")} className="bg-teal-800/60 hover:bg-teal-700 text-teal-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-teal-600/50">Redukční</button>
          <button type="button" onClick={() => applyTemplate("setrici")} className="bg-teal-800/60 hover:bg-teal-700 text-teal-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-teal-600/50">Šetřící</button>
          <button type="button" onClick={() => applyTemplate("sportovec")} className="bg-teal-800/60 hover:bg-teal-700 text-teal-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-teal-600/50">Sportovní</button>
        </div>
      </div>
    </div>
  );
}
