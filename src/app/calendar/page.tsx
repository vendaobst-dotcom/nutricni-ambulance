"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Heart, Loader2, LogOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import AppointmentCalendar from "@/components/AppointmentCalendar";
import ClinicNav from "@/components/ClinicNav";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Patient {
  id: string;
  name: string;
  birth_number?: string;
  deleted_at?: string | null;
}

export default function CalendarPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (!session) router.replace("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.replace("/");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("patients")
      .select("id, name, birth_number, deleted_at")
      .is("deleted_at", null)
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (data) setPatients(data);
      });
  }, [session]);

  const logAction = async (actionType: string, description: string) => {
    if (!session?.user?.email) return;
    await supabase.from("audit_logs").insert([
      { user_email: session.user.email, action_type: actionType, description }
    ]);
  };

  const handleLogout = async () => {
    await logAction("ODHLÁŠENÍ", "Uživatel se odhlásil ze systému.");
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (authLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-[#1F2937] text-white border-b border-teal-600/30 px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-[#0D9488] p-2.5 rounded-xl text-white shadow-inner">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-teal-400">Nutriční Ambulance</h1>
            <p className="text-xs text-gray-300">Klinická výživa & Metabolická diagnostika</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-gray-800/80 text-gray-300 text-xs px-3.5 py-1.5 rounded-xl border border-gray-700">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium">{currentTime.toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "long" })}</span>
            <span className="text-teal-400 font-bold font-mono">{currentTime.toLocaleTimeString("cs-CZ")}</span>
          </div>
          <span className="inline-flex items-center gap-2 bg-teal-950 text-teal-300 text-xs px-3.5 py-1.5 rounded-full border border-teal-800 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {session.user.email}
          </span>
          <button onClick={handleLogout} className="bg-gray-800 hover:bg-red-900/40 text-gray-300 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5">
            <LogOut className="w-4 h-4" /> Odhlásit
          </button>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClinicNav current="calendar" />
        <AppointmentCalendar
          supabase={supabase}
          patients={patients}
          userEmail={session.user.email}
          onLogAction={logAction}
        />
      </div>
    </div>
  );
}
