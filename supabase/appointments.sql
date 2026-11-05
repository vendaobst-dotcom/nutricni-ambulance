create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  title text not null default 'Konzultace',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_starts_at_idx on public.appointments (starts_at);
create index if not exists appointments_patient_id_idx on public.appointments (patient_id);

alter table public.appointments enable row level security;

drop policy if exists "appointments_authenticated_all" on public.appointments;
create policy "appointments_authenticated_all"
  on public.appointments
  for all
  to authenticated
  using (true)
  with check (true);
