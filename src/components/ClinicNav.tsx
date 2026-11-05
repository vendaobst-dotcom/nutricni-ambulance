"use client";

import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  FolderOpen,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

export type ClinicTab =
  | "patients"
  | "calendar"
  | "reports"
  | "progress"
  | "examinations"
  | "hours"
  | "receipts"
  | "documents"
  | "audit";

const tabClass = (active: boolean) =>
  `flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
    active
      ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
      : "border-transparent text-gray-500 hover:text-gray-700"
  }`;

const HOME_TABS: { id: ClinicTab; href: string; label: string; icon: typeof Users }[] = [
  { id: "patients", href: "/", label: "Kartotéka Pacientů", icon: Users },
  { id: "reports", href: "/?tab=reports", label: "Dekurzy & Kalkulačka", icon: FileText },
  { id: "progress", href: "/?tab=progress", label: "Vývoj & Grafy", icon: TrendingUp },
  { id: "examinations", href: "/?tab=examinations", label: "Harmonogram & SMS", icon: ClipboardList },
  { id: "hours", href: "/?tab=hours", label: "Ordinační hodiny", icon: Clock },
  { id: "receipts", href: "/?tab=receipts", label: "Účtenky", icon: Receipt },
  { id: "documents", href: "/?tab=documents", label: "Dokumenty", icon: FolderOpen },
  { id: "audit", href: "/?tab=audit", label: "Audit log", icon: ShieldCheck },
];

interface ClinicNavProps {
  current: ClinicTab | "";
  onSelectHomeTab?: (tab: ClinicTab) => void;
}

export default function ClinicNav({ current, onSelectHomeTab }: ClinicNavProps) {
  const onCalendar = current === "calendar";

  return (
    <div className="flex flex-wrap border-b border-gray-200 mb-8 gap-2 print:hidden">
      {HOME_TABS.slice(0, 1).map((tab) => {
        const Icon = tab.icon;
        const active = current === tab.id;
        if (onCalendar) {
          return (
            <Link key={tab.id} href={tab.href} className={tabClass(false)}>
              <Icon className="w-4 h-4" /> {tab.label}
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectHomeTab?.(tab.id)}
            className={tabClass(active)}
          >
            <Icon className="w-4 h-4" /> {tab.label}
          </button>
        );
      })}

      <Link href="/calendar" className={tabClass(onCalendar)}>
        <Calendar className="w-4 h-4" /> Kalendář & Diář
      </Link>

      {HOME_TABS.slice(1).map((tab) => {
        const Icon = tab.icon;
        const active = current === tab.id;
        if (onCalendar) {
          return (
            <Link key={tab.id} href={tab.href} className={tabClass(false)}>
              <Icon className="w-4 h-4" /> {tab.label}
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectHomeTab?.(tab.id)}
            className={tabClass(active)}
          >
            <Icon className="w-4 h-4" /> {tab.label}
          </button>
        );
      })}
    </div>
  );
}
