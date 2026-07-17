-- سامانه خودمراقبتی — initial schema, enums, RLS
-- Synthetic demo data only; never store real clinical or identity data in seeds.

create extension if not exists "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type public.source_type as enum (
  'user_entered',
  'care_team',
  'integrated_system',
  'imported_document'
);

create type public.verification_status as enum (
  'self_reported',
  'pending_review',
  'verified',
  'rejected'
);

create type public.user_role as enum (
  'citizen',
  'care_team',
  'admin',
  'provider'
);

create type public.appointment_mode as enum (
  'in_person',
  'video',
  'phone',
  'home_care'
);

create type public.record_status as enum (
  'active',
  'resolved',
  'inactive',
  'scheduled',
  'completed',
  'cancelled',
  'pending'
);

create type public.relationship_type as enum (
  'spouse',
  'child',
  'parent',
  'sibling',
  'guardian',
  'other'
);

create type public.consent_scope as enum (
  'full_record',
  'medications',
  'appointments',
  'lab_results',
  'emergency_only'
);

create type public.reminder_type as enum (
  'medication',
  'appointment',
  'screening',
  'lab_followup',
  'vaccination',
  'custom'
);

create type public.center_category as enum (
  'hospital',
  'clinic',
  'pharmacy',
  'laboratory',
  'imaging',
  'dental',
  'rehabilitation',
  'mental_health',
  'maternal',
  'emergency'
);

create type public.risk_level as enum (
  'low',
  'moderate',
  'high',
  'critical'
);

create type public.audit_action as enum (
  'create',
  'read',
  'update',
  'delete',
  'verify',
  'reject',
  'export',
  'login',
  'logout'
);

-- ─── Core identity ───────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  role public.user_role not null default 'citizen',
  first_name text not null,
  last_name text not null,
  full_name text generated always as (first_name || ' ' || last_name) stored,
  national_id_hash text,
  birth_date date,
  gender text check (gender in ('male', 'female', 'other')),
  phone text,
  email text,
  blood_type text,
  preferred_language text not null default 'fa',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  relationship public.relationship_type not null,
  relationship_label text not null,
  has_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, patient_id)
);

create table public.user_relationships (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles (id) on delete cascade,
  to_profile_id uuid not null references public.profiles (id) on delete cascade,
  relationship public.relationship_type not null,
  created_at timestamptz not null default now(),
  unique (from_profile_id, to_profile_id, relationship)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  grantor_id uuid not null references public.profiles (id) on delete cascade,
  grantee_id uuid not null references public.profiles (id) on delete cascade,
  family_member_id uuid references public.family_members (id) on delete cascade,
  scope public.consent_scope not null,
  is_active boolean not null default true,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.health_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  center_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.health_team_members (
  id uuid primary key default gen_random_uuid(),
  health_team_id uuid not null references public.health_teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (health_team_id, profile_id)
);

create table public.care_relationships (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  health_team_id uuid not null references public.health_teams (id) on delete cascade,
  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_id, health_team_id)
);

-- Shared medical record columns via convention on each table

create table public.conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'active',
  provider text,
  attachment text,
  icd_code text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'active',
  provider text,
  attachment text,
  dosage text,
  frequency text,
  route text,
  start_date date,
  end_date date,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.allergies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'active',
  provider text,
  attachment text,
  allergen text not null,
  reaction text,
  severity text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.immunizations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'completed',
  provider text,
  attachment text,
  vaccine_name text not null,
  dose_number int,
  route text,
  lot_number text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'completed',
  provider text,
  attachment text,
  observation_type text not null,
  value numeric,
  unit text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'completed',
  provider text,
  attachment text,
  test_name text not null,
  value text,
  unit text,
  reference_range text,
  flag text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.imaging_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  date date,
  status public.record_status not null default 'completed',
  provider text,
  attachment text,
  modality text,
  body_part text,
  findings_summary text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  description text,
  disclaimer text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.screening_answers (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  screening_id uuid not null references public.screenings (id) on delete cascade,
  question_id text not null,
  answer jsonb not null,
  created_at timestamptz not null default now()
);

create table public.screening_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  screening_id uuid not null references public.screenings (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'self_reported',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  screening_title text not null,
  summary text not null,
  risk_level public.risk_level,
  score numeric,
  recommended_action text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  source_type public.source_type not null default 'user_entered',
  verification_status public.verification_status not null default 'pending_review',
  created_by uuid references public.profiles (id),
  verified_by uuid references public.profiles (id),
  title text not null,
  description text,
  specialty text,
  provider_name text,
  center_name text,
  mode public.appointment_mode not null default 'in_person',
  status public.record_status not null default 'scheduled',
  scheduled_at timestamptz not null,
  duration_minutes int not null default 20,
  location text,
  reason text,
  notes text,
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  type public.reminder_type not null,
  title text not null,
  description text,
  due_at timestamptz not null,
  completed_at timestamptz,
  is_completed boolean not null default false,
  snoozed_until timestamptz,
  notify boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.health_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.center_category not null,
  address text not null,
  phone text,
  latitude double precision,
  longitude double precision,
  is_24h boolean not null default false,
  accepts_insurance boolean not null default true,
  is_accessible boolean not null default false,
  services text[] not null default '{}',
  working_hours jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_teams
  add constraint health_teams_center_id_fkey
  foreign key (center_id) references public.health_centers (id) on delete set null;

create table public.health_services (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.health_centers (id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.educational_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.article_categories (id) on delete set null,
  title text not null,
  summary text not null,
  body text not null,
  author_or_reviewer text not null,
  reviewed_at date,
  source text,
  reading_time_minutes int not null default 5,
  related_topics text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_articles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  article_id uuid not null references public.educational_articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, article_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  action_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.health_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  body text not null,
  priority text not null default 'normal',
  is_read boolean not null default false,
  read_at timestamptz,
  thread_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  patient_id uuid references public.profiles (id) on delete set null,
  action public.audit_action not null,
  resource_type text not null,
  resource_id uuid,
  purpose text,
  section_accessed text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─── updated_at trigger ──────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','family_members','consents','health_teams','conditions','medications',
    'allergies','immunizations','observations','lab_results','imaging_records',
    'screenings','screening_results','appointments','reminders','health_centers',
    'educational_articles','health_messages'
  ]
  loop
    execute format(
      'create trigger trg_%s_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;


-- ─── Helper functions (private schema) ───────────────────────────────────────

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

create or replace function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function private.can_access_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.profiles p
      where p.id = target_patient_id and p.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.family_members fm
      join public.consents c on c.family_member_id = fm.id and c.is_active = true
      where fm.patient_id = target_patient_id
        and fm.owner_id = private.current_profile_id()
    )
    or exists (
      select 1
      from public.care_relationships cr
      join public.health_team_members htm on htm.health_team_id = cr.health_team_id
      where cr.patient_id = target_patient_id
        and cr.is_active = true
        and htm.profile_id = private.current_profile_id()
        and htm.is_active = true
    );
$$;


-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.user_relationships enable row level security;
alter table public.consents enable row level security;
alter table public.health_teams enable row level security;
alter table public.health_team_members enable row level security;
alter table public.care_relationships enable row level security;
alter table public.conditions enable row level security;
alter table public.medications enable row level security;
alter table public.allergies enable row level security;
alter table public.immunizations enable row level security;
alter table public.observations enable row level security;
alter table public.lab_results enable row level security;
alter table public.imaging_records enable row level security;
alter table public.screenings enable row level security;
alter table public.screening_answers enable row level security;
alter table public.screening_results enable row level security;
alter table public.appointments enable row level security;
alter table public.reminders enable row level security;
alter table public.health_centers enable row level security;
alter table public.health_services enable row level security;
alter table public.article_categories enable row level security;
alter table public.educational_articles enable row level security;
alter table public.saved_articles enable row level security;
alter table public.notifications enable row level security;
alter table public.health_messages enable row level security;
alter table public.audit_events enable row level security;

-- Profiles: own profile; family/care access via helper for read
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (user_id = auth.uid() or private.can_access_patient(id) or private.is_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy family_members_owner on public.family_members
  for all to authenticated
  using (owner_id = private.current_profile_id())
  with check (owner_id = private.current_profile_id());

create policy consents_parties on public.consents
  for all to authenticated
  using (
    grantor_id = private.current_profile_id()
    or grantee_id = private.current_profile_id()
  )
  with check (grantor_id = private.current_profile_id());

-- Medical records: patient self + consented family + assigned care team
do $$
declare
  medical_table text;
begin
  foreach medical_table in array array[
    'conditions','medications','allergies','immunizations','observations',
    'lab_results','imaging_records','screening_results','appointments','reminders',
    'screening_answers'
  ]
  loop
    execute format(
      'create policy %I_select on public.%I for select to authenticated
       using (private.can_access_patient(patient_id))',
      medical_table, medical_table
    );
    execute format(
      'create policy %I_insert on public.%I for insert to authenticated
       with check (private.can_access_patient(patient_id))',
      medical_table, medical_table
    );
    execute format(
      'create policy %I_update on public.%I for update to authenticated
       using (private.can_access_patient(patient_id))
       with check (private.can_access_patient(patient_id))',
      medical_table, medical_table
    );
  end loop;
end $$;

-- Admins manage catalog but NOT automatic clinical content access
create policy screenings_public_read on public.screenings
  for select to authenticated, anon
  using (is_published = true or private.is_admin());

create policy screenings_admin_write on public.screenings
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy centers_public_read on public.health_centers
  for select to authenticated, anon
  using (is_published = true or private.is_admin());

create policy centers_admin_write on public.health_centers
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy services_public_read on public.health_services
  for select to authenticated, anon
  using (
    exists (
      select 1 from public.health_centers c
      where c.id = center_id and (c.is_published or private.is_admin())
    )
  );

create policy articles_public_read on public.educational_articles
  for select to authenticated, anon
  using (is_published = true or private.is_admin());

create policy articles_admin_write on public.educational_articles
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy article_categories_public_read on public.article_categories
  for select to authenticated, anon
  using (true);

create policy saved_articles_own on public.saved_articles
  for all to authenticated
  using (profile_id = private.current_profile_id())
  with check (profile_id = private.current_profile_id());

create policy notifications_own on public.notifications
  for all to authenticated
  using (profile_id = private.current_profile_id())
  with check (profile_id = private.current_profile_id());

create policy messages_participants on public.health_messages
  for all to authenticated
  using (
    sender_id = private.current_profile_id()
    or recipient_id = private.current_profile_id()
  )
  with check (
    sender_id = private.current_profile_id()
  );

create policy care_relationships_select on public.care_relationships
  for select to authenticated
  using (
    patient_id = private.current_profile_id()
    or exists (
      select 1 from public.health_team_members htm
      where htm.health_team_id = care_relationships.health_team_id
        and htm.profile_id = private.current_profile_id()
    )
    or private.is_admin()
  );

create policy health_teams_select on public.health_teams
  for select to authenticated
  using (true);

create policy health_team_members_select on public.health_team_members
  for select to authenticated
  using (true);

-- Audit: actors can insert; patients can read their own access history; admins can read non-clinical ops logs
create policy audit_insert on public.audit_events
  for insert to authenticated
  with check (actor_id = private.current_profile_id());

create policy audit_select_patient on public.audit_events
  for select to authenticated
  using (
    patient_id = private.current_profile_id()
    or actor_id = private.current_profile_id()
    or private.is_admin()
  );

-- Indexes
create index idx_conditions_patient on public.conditions (patient_id);
create index idx_medications_patient on public.medications (patient_id);
create index idx_allergies_patient on public.allergies (patient_id);
create index idx_appointments_patient_time on public.appointments (patient_id, scheduled_at);
create index idx_reminders_patient_due on public.reminders (patient_id, due_at);
create index idx_audit_patient on public.audit_events (patient_id, created_at desc);
create index idx_centers_category on public.health_centers (category);
create index idx_messages_recipient on public.health_messages (recipient_id, created_at desc);
