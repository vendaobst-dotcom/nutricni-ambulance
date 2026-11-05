"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2, Plus, Trash2, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CalendarPatient {
  id: string;
  name: string;
  birth_number?: string;
  deleted_at?: string | null;
}

interface Appointment {
  id: string;
  patient_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  notes?: string | null;
  created_by?: string | null;
}

interface AppointmentCalendarProps {
  supabase: SupabaseClient;
  patients: CalendarPatient[];
  userEmail?: string;
  onLogAction?: (actionType: string, description: string) => Promise<void> | void;
}

type CalendarView = "week" | "day";

const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 56;
const TITLE_OPTIONS = [
  "Konzultace",
  "Vstupní vyšetření",
  "Kontrola",
  "InBody / bioimpedance",
  "Nutriční plán",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function combineLocal(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function hoursList() {
  return Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
}

export default function AppointmentCalendar({ supabase, patients, userEmail, onLogAction }: AppointmentCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [setupHint, setSetupHint] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [form, setForm] = useState({
    patient_id: "",
    title: "Konzultace",
    date: toDateInput(new Date()),
    time: "09:00",
    duration: "45",
    notes: "",
  });

  const activePatients = useMemo(
    () => patients.filter((p) => !p.deleted_at),
    [patients]
  );

  const filteredPatients = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return activePatients;
    return activePatients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.birth_number && p.birth_number.includes(q))
    );
  }, [activePatients, patientSearch]);

  const weekStart = useMemo(() => startOfWeek(anchorDate), [anchorDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dayDate = useMemo(() => {
    const d = new Date(anchorDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [anchorDate]);

  const rangeStart = view === "week" ? weekStart : dayDate;
  const rangeEnd = addDays(rangeStart, view === "week" ? 7 : 1);

  const fetchAppointments = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .gte("starts_at", rangeStart.toISOString())
      .lt("starts_at", rangeEnd.toISOString())
      .order("starts_at", { ascending: true });

    if (error) {
      const missing = /could not find the table|relation .* does not exist|schema cache/i.test(error.message);
      setSetupHint(missing);
      setErrorMsg(missing
        ? "Tabulka schůzek v Supabase ještě neexistuje. Spusťte SQL ze souboru supabase/appointments.sql v SQL Editoru."
        : "Nepodařilo se načíst schůzky: " + error.message);
      setAppointments([]);
    } else {
      setSetupHint(false);
      setAppointments((data as Appointment[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, rangeStart.getTime(), rangeEnd.getTime()]);

  const patientName = (id: string) => activePatients.find((p) => p.id === id)?.name || patients.find((p) => p.id === id)?.name || "Pacient";

  const openModal = (date: Date, hour?: number, minute = 0) => {
    const d = new Date(date);
    if (hour !== undefined) d.setHours(hour, minute, 0, 0);
    else if (d.getHours() < START_HOUR) d.setHours(9, 0, 0, 0);
    setForm({
      patient_id: activePatients[0]?.id || "",
      title: "Konzultace",
      date: toDateInput(d),
      time: toTimeInput(d),
      duration: "45",
      notes: "",
    });
    setPatientSearch("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) {
      setErrorMsg("Vyberte pacienta ze seznamu.");
      return;
    }
    const start = combineLocal(form.date, form.time);
    const end = new Date(start.getTime() + parseInt(form.duration, 10) * 60 * 1000);
    setSaving(true);
    setErrorMsg("");

    const payload = {
      patient_id: form.patient_id,
      title: form.title,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      notes: form.notes || null,
      created_by: userEmail || "Neznámý",
    };

    const { error } = await supabase.from("appointments").insert([payload]);
    setSaving(false);

    if (error) {
      const missing = /could not find the table|relation .* does not exist|schema cache/i.test(error.message);
      setSetupHint(missing);
      setErrorMsg(missing
        ? "Tabulka schůzek v Supabase ještě neexistuje. Spusťte SQL ze souboru supabase/appointments.sql."
        : "Schůzku se nepodařilo uložit: " + error.message);
      return;
    }

    const patient = patientName(form.patient_id);
    await onLogAction?.("KALENDÁŘ", `Naplánována schůzka "${form.title}" s pacientem ${patient} (${form.date} ${form.time}).`);
    setModalOpen(false);
    fetchAppointments();
  };

  const handleDelete = async (appt: Appointment) => {
    if (!window.confirm("Opravdu smazat tuto schůzku?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", appt.id);
    if (!error) {
      await onLogAction?.("KALENDÁŘ", `Smazána schůzka "${appt.title}" (${patientName(appt.patient_id)}).`);
      fetchAppointments();
    }
  };

  const heading = view === "week"
    ? `${weekDays[0].toLocaleDateString("cs-CZ", { day: "numeric", month: "long" })} – ${weekDays[6].toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}`
    : dayDate.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const shift = (dir: number) => {
    setAnchorDate((prev) => addDays(prev, dir * (view === "week" ? 7 : 1)));
  };

  const appointmentsOnDay = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.starts_at), day));

  const eventStyle = (appt: Appointment) => {
    const start = new Date(appt.starts_at);
    const end = new Date(appt.ends_at);
    const minutes = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
    const top = Math.max((minutes / 60) * HOUR_HEIGHT, 0);
    const durationMin = Math.max((end.getTime() - start.getTime()) / 60000, 30);
    const height = (durationMin / 60) * HOUR_HEIGHT;
    return { top: `${top}px`, height: `${height}px` };
  };

  const gridHours = hoursList();
  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-teal-50 text-[#0D9488] p-2 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Kalendář schůzek</h2>
            <p className="text-xs text-gray-500 capitalize">{heading}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${view === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Týden
            </button>
            <button
              type="button"
              onClick={() => setView("day")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${view === "day" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Den
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => shift(-1)} className="p-2 rounded-xl border bg-white hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setAnchorDate(new Date())} className="px-3 py-2 text-xs font-bold rounded-xl border bg-white hover:bg-teal-50">
              Dnes
            </button>
            <button type="button" onClick={() => shift(1)} className="p-2 rounded-xl border bg-white hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openModal(view === "week" ? weekStart : dayDate, 9)}
            className="flex items-center gap-1.5 bg-[#0D9488] hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nová schůzka
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
          {errorMsg}
          {setupHint && (
            <pre className="mt-2 p-3 bg-white border rounded-lg text-[10px] overflow-x-auto whitespace-pre-wrap font-mono text-gray-700">
{`create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null default 'Konzultace',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  created_by text,
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create policy "appointments_authenticated_all" on public.appointments for all to authenticated using (true) with check (true);`}
            </pre>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : view === "week" ? (
          <div className="overflow-x-auto">
            <div className="min-w-[860px] grid grid-cols-[64px_repeat(7,1fr)]">
              <div className="border-b bg-gray-50 p-2" />
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setAnchorDate(day); setView("day"); }}
                    className={`border-b border-l p-2 text-center ${isToday ? "bg-teal-50" : "bg-gray-50"}`}
                  >
                    <div className="text-[10px] font-bold uppercase text-gray-500">{DAY_LABELS[i]}</div>
                    <div className={`text-sm font-bold ${isToday ? "text-[#0D9488]" : "text-gray-900"}`}>{day.getDate()}</div>
                  </button>
                );
              })}

              <div className="relative">
                {gridHours.map((hour) => (
                  <div key={hour} className="border-b text-[10px] text-gray-400 pr-2 text-right font-mono" style={{ height: HOUR_HEIGHT }}>
                    {pad(hour)}:00
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIdx) => (
                <div key={dayIdx} className="relative border-l">
                  {gridHours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => openModal(day, hour)}
                      className="w-full border-b hover:bg-teal-50/60 transition-colors"
                      style={{ height: HOUR_HEIGHT }}
                      aria-label={`Přidat schůzku ${toDateInput(day)} ${pad(hour)}:00`}
                    />
                  ))}
                  {appointmentsOnDay(day).map((appt) => (
                    <div
                      key={appt.id}
                      className="absolute left-1 right-1 bg-[#0D9488] text-white rounded-lg px-1.5 py-1 shadow-sm overflow-hidden z-10 group"
                      style={eventStyle(appt)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold truncate">{patientName(appt.patient_id)}</div>
                          <div className="text-[9px] opacity-90 truncate">{appt.title}</div>
                          <div className="text-[9px] font-mono opacity-80">
                            {toTimeInput(new Date(appt.starts_at))}–{toTimeInput(new Date(appt.ends_at))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(appt); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-teal-800"
                          aria-label="Smazat schůzku"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[72px_1fr]">
            <div />
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 capitalize">
                {dayDate.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <span className="text-[10px] text-gray-500">{appointmentsOnDay(dayDate).length} schůzek</span>
            </div>
            {gridHours.map((hour) => {
              const slotStart = new Date(dayDate);
              slotStart.setHours(hour, 0, 0, 0);
              const slotEnd = new Date(slotStart);
              slotEnd.setHours(hour + 1);
              const slotAppts = appointmentsOnDay(dayDate).filter((a) => {
                const s = new Date(a.starts_at);
                return s >= slotStart && s < slotEnd;
              });
              return (
                <React.Fragment key={hour}>
                  <div className="border-b text-[10px] text-gray-400 pr-2 pt-2 text-right font-mono" style={{ minHeight: HOUR_HEIGHT }}>
                    {pad(hour)}:00
                  </div>
                  <button
                    type="button"
                    onClick={() => openModal(dayDate, hour)}
                    className="border-b border-l text-left p-2 hover:bg-teal-50/50 min-h-[56px]"
                  >
                    {slotAppts.length === 0 ? (
                      <span className="text-[10px] text-gray-300">Volno — kliknutím přidáte schůzku</span>
                    ) : (
                      <div className="space-y-1.5">
                        {slotAppts.map((appt) => (
                          <div
                            key={appt.id}
                            className="bg-[#0D9488] text-white rounded-xl px-3 py-2 flex items-start justify-between gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div>
                              <div className="text-xs font-bold">{patientName(appt.patient_id)}</div>
                              <div className="text-[11px] opacity-90">{appt.title}</div>
                              <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5 opacity-80">
                                <Clock className="w-3 h-3" />
                                {toTimeInput(new Date(appt.starts_at))}–{toTimeInput(new Date(appt.ends_at))}
                              </div>
                              {appt.notes && <div className="text-[10px] mt-1 opacity-80">{appt.notes}</div>}
                            </div>
                            <button type="button" onClick={() => handleDelete(appt)} className="p-1 rounded hover:bg-teal-800">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border relative">
            <button type="button" onClick={() => setModalOpen(false)} className="absolute right-4 top-4 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nová schůzka</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Pacient *</label>
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Hledat jméno nebo RČ..."
                  className="w-full border p-2 rounded-xl mb-1.5"
                />
                <select
                  required
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full border p-2.5 rounded-xl font-semibold bg-gray-50"
                >
                  {filteredPatients.length === 0 && <option value="">Žádný pacient</option>}
                  {filteredPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.birth_number ? ` (RČ: ${p.birth_number})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Typ schůzky</label>
                <select
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border p-2.5 rounded-xl bg-gray-50"
                >
                  {TITLE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="font-bold block mb-1">Datum</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border p-2 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Čas</label>
                  <input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border p-2 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Délka</label>
                  <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full border p-2 rounded-xl bg-gray-50">
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Poznámka</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border p-2 rounded-xl" placeholder="Volitelná poznámka..." />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-500">Zrušit</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-[#0D9488] text-white font-bold rounded-xl flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Uložit schůzku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
