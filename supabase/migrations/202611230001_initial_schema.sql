-- WARMCONNECT initial schema. Apply with: supabase db push
-- Public profile columns intentionally contain no email address or private verification data.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role text not null default 'student' check (role in ('student', 'alumni', 'admin')),
  avatar_url text,
  department text check (department is null or char_length(department) <= 40),
  graduation_year integer check (graduation_year is null or graduation_year between 1950 and 2100),
  bio text not null default '' check (char_length(bio) <= 2000),
  location text not null default '' check (char_length(location) <= 120),
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alumni_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_title text check (current_title is null or char_length(current_title) <= 120),
  company text check (company is null or char_length(company) <= 120),
  degree text check (degree is null or char_length(degree) <= 160),
  experience_years integer not null default 0 check (experience_years between 0 and 70),
  mentorship_topics text[] not null default '{}',
  available_for_mentorship boolean not null default false,
  professional_links jsonb not null default '{}'::jsonb check (jsonb_typeof(professional_links) = 'object'),
  past_milestones jsonb not null default '[]'::jsonb check (jsonb_typeof(past_milestones) = 'array'),
  advice_snippet text not null default '' check (char_length(advice_snippet) <= 600),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alumni_verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_path text not null check (char_length(document_path) <= 500),
  notes text check (notes is null or char_length(notes) <= 1500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 1500),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index alumni_verification_one_pending_per_user
  on public.alumni_verification_submissions(user_id) where status = 'pending';

create table public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  alumni_id uuid not null references public.alumni_profiles(user_id) on delete cascade,
  topic text not null check (char_length(topic) between 2 and 120),
  message text not null check (char_length(message) between 20 and 2500),
  preferred_cadence text not null default 'One-time 30-min strategy session' check (char_length(preferred_cadence) <= 120),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentorship_request_distinct_parties check (student_id <> alumni_id)
);

create unique index mentorship_requests_one_pending_pair
  on public.mentorship_requests(student_id, alumni_id)
  where status = 'pending';
create index mentorship_requests_student_created_idx on public.mentorship_requests(student_id, created_at desc);
create index mentorship_requests_alumni_created_idx on public.mentorship_requests(alumni_id, created_at desc);

create table public.saved_alumni (
  student_id uuid not null references public.profiles(id) on delete cascade,
  alumni_id uuid not null references public.alumni_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, alumni_id),
  constraint saved_alumni_distinct_users check (student_id <> alumni_id)
);
create index saved_alumni_alumni_idx on public.saved_alumni(alumni_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  company text not null check (char_length(company) between 2 and 120),
  description text not null check (char_length(description) between 20 and 5000),
  opportunity_type text not null check (opportunity_type in ('Internship', 'Full-Time', 'Research', 'Mentorship Cohort')),
  department text not null default 'All' check (char_length(department) <= 80),
  location text not null default 'Not specified' check (char_length(location) <= 120),
  compensation text not null default 'Not specified' check (char_length(compensation) <= 120),
  application_deadline date not null,
  application_url text check (application_url is null or (char_length(application_url) <= 1000 and application_url ~* '^https?://')),
  skills text[] not null default '{}',
  posted_by uuid not null references public.alumni_profiles(user_id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index opportunities_status_deadline_idx on public.opportunities(status, application_deadline);
create index opportunities_posted_by_idx on public.opportunities(posted_by);

create table public.referral_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  alumni_id uuid not null references public.alumni_profiles(user_id) on delete cascade,
  message text check (message is null or char_length(message) <= 1500),
  status text not null default 'pending' check (status in ('pending', 'acknowledged', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, opportunity_id),
  constraint referral_request_distinct_parties check (student_id <> alumni_id)
);
create index referral_requests_alumni_created_idx on public.referral_requests(alumni_id, created_at desc);
create index referral_requests_student_created_idx on public.referral_requests(student_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null check (char_length(notification_type) <= 80),
  title text not null check (char_length(title) between 1 and 160),
  message text not null check (char_length(message) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);

-- Role lookup for RLS policies. Security definer avoids recursive profiles policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to anon, authenticated;

-- Public visitors can discover only approved alumni; student profiles are visible only
-- to their owner, an administrator, or a user who has an existing request relationship.
create or replace function public.can_read_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    target_user_id = (select auth.uid())
    or public.is_admin()
    or exists (
      select 1 from public.profiles p
      join public.alumni_profiles ap on ap.user_id = p.id
      where p.id = target_user_id and p.role = 'alumni' and ap.verification_status = 'approved'
    )
    or exists (
      select 1 from public.mentorship_requests mr
      where (mr.student_id = target_user_id and mr.alumni_id = (select auth.uid()))
         or (mr.alumni_id = target_user_id and mr.student_id = (select auth.uid()))
    )
    or exists (
      select 1 from public.referral_requests rr
      where (rr.student_id = target_user_id and rr.alumni_id = (select auth.uid()))
         or (rr.alumni_id = target_user_id and rr.student_id = (select auth.uid()))
    );
$$;
revoke all on function public.can_read_profile(uuid) from public;
grant execute on function public.can_read_profile(uuid) to anon, authenticated;

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and not public.is_admin() and new.role is distinct from old.role then
    raise exception 'Profile roles can only be changed by an administrator';
  end if;
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_privileges();
create trigger alumni_profiles_updated_at before update on public.alumni_profiles
  for each row execute function public.set_updated_at();
create trigger mentorship_requests_updated_at before update on public.mentorship_requests
  for each row execute function public.set_updated_at();
create trigger opportunities_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();
create trigger referral_requests_updated_at before update on public.referral_requests
  for each row execute function public.set_updated_at();

create or replace function public.guard_alumni_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.verification_status is distinct from old.verification_status
       or new.verified_at is distinct from old.verified_at then
      raise exception 'Alumni verification can only be changed by an administrator';
    end if;
  end if;
  return new;
end;
$$;
create trigger alumni_profiles_guard_verification before update on public.alumni_profiles
  for each row execute function public.guard_alumni_verification_fields();

create or replace function public.guard_verification_submission()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.user_id is distinct from old.user_id
       or new.document_path is distinct from old.document_path
       or new.status is distinct from old.status
       or new.review_note is distinct from old.review_note
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at then
      raise exception 'Verification submissions can only be reviewed by an administrator';
    end if;
  end if;
  return new;
end;
$$;
create trigger verification_submission_guard before update on public.alumni_verification_submissions
  for each row execute function public.guard_verification_submission();

create or replace function public.apply_verification_decision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_at := now();
    new.reviewed_by := auth.uid();
    update public.alumni_profiles
      set verification_status = new.status,
          verified_at = case when new.status = 'approved' then now() else null end
      where user_id = new.user_id;
    if new.status <> 'approved' then
      update public.opportunities set status = 'closed'
      where posted_by = new.user_id and status = 'published';
    end if;
  end if;
  return new;
end;
$$;
create trigger verification_submission_apply_decision before update on public.alumni_verification_submissions
  for each row execute function public.apply_verification_decision();

create or replace function public.guard_mentorship_status_transition()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.student_id <> old.student_id or new.alumni_id <> old.alumni_id then
    raise exception 'Mentorship request parties cannot be changed';
  end if;
  if new.status is distinct from old.status then
    if old.status <> 'pending' then
      raise exception 'Only pending mentorship requests can change status';
    elsif (select auth.uid()) = old.student_id and new.status <> 'withdrawn' then
      raise exception 'Students may only withdraw their own pending requests';
    elsif (select auth.uid()) = old.alumni_id and new.status not in ('accepted', 'declined') then
      raise exception 'Alumni may only accept or decline incoming requests';
    elsif (select auth.uid()) is null and not public.is_admin() then
      raise exception 'A signed-in participant must change this request';
    elsif (select auth.uid()) not in (old.student_id, old.alumni_id) and not public.is_admin() then
      raise exception 'You are not a participant in this request';
    end if;
  end if;
  return new;
end;
$$;
create trigger mentorship_request_status_guard before update on public.mentorship_requests
  for each row execute function public.guard_mentorship_status_transition();

create or replace function public.guard_referral_status_transition()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.student_id <> old.student_id or new.alumni_id <> old.alumni_id or new.opportunity_id <> old.opportunity_id then
    raise exception 'Referral request parties and opportunity cannot be changed';
  end if;
  if new.status is distinct from old.status then
    if old.status <> 'pending' then
      raise exception 'Only pending referral inquiries can change status';
    elsif (select auth.uid()) = old.student_id and new.status <> 'withdrawn' then
      raise exception 'Students may only withdraw their own referral inquiries';
    elsif (select auth.uid()) = old.alumni_id and new.status not in ('acknowledged', 'declined') then
      raise exception 'Alumni may only acknowledge or decline referral inquiries';
    elsif (select auth.uid()) is null and not public.is_admin() then
      raise exception 'A signed-in participant must change this referral inquiry';
    elsif (select auth.uid()) not in (old.student_id, old.alumni_id) and not public.is_admin() then
      raise exception 'You are not a participant in this referral inquiry';
    end if;
  end if;
  return new;
end;
$$;
create trigger referral_request_status_guard before update on public.referral_requests
  for each row execute function public.guard_referral_status_transition();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  requested_role text;
  graduation_year_value integer;
  degree_value text;
begin
  requested_role := case when new.raw_user_meta_data ->> 'role' = 'alumni' then 'alumni' else 'student' end;
  degree_value := nullif(left(coalesce(new.raw_user_meta_data ->> 'degree', ''), 160), '');
  graduation_year_value := case
    when coalesce(new.raw_user_meta_data ->> 'graduation_year', '') ~ '^\d{4}$'
      then (new.raw_user_meta_data ->> 'graduation_year')::integer
    else null
  end;

  insert into public.profiles (id, full_name, role, department, graduation_year)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    requested_role,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'department', ''), 40), ''),
    case when graduation_year_value between 1950 and 2100 then graduation_year_value else null end
  ) on conflict (id) do nothing;

  if requested_role = 'alumni' then
    insert into public.alumni_profiles (user_id, degree, current_title, company)
    values (
      new.id,
      degree_value,
      nullif(left(coalesce(new.raw_user_meta_data ->> 'current_title', ''), 120), ''),
      nullif(left(coalesce(new.raw_user_meta_data ->> 'company', ''), 120), '')
    ) on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

-- Backfill existing Supabase Auth accounts created before this migration.
insert into public.profiles (id, full_name, role, department, graduation_year)
select
  u.id,
  left(coalesce(u.raw_user_meta_data ->> 'full_name', ''), 120),
  case when u.raw_user_meta_data ->> 'role' = 'alumni' then 'alumni' else 'student' end,
  nullif(left(coalesce(u.raw_user_meta_data ->> 'department', ''), 40), ''),
  case when coalesce(u.raw_user_meta_data ->> 'graduation_year', '') ~ '^\d{4}$'
    then (u.raw_user_meta_data ->> 'graduation_year')::integer else null end
from auth.users u
on conflict (id) do nothing;

insert into public.alumni_profiles (user_id, degree, current_title, company)
select p.id,
  nullif(left(coalesce(u.raw_user_meta_data ->> 'degree', ''), 160), ''),
  nullif(left(coalesce(u.raw_user_meta_data ->> 'current_title', ''), 120), ''),
  nullif(left(coalesce(u.raw_user_meta_data ->> 'company', ''), 120), '')
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'alumni'
on conflict (user_id) do nothing;

create or replace function public.notify_mentorship_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  student_name text;
begin
  if tg_op = 'INSERT' then
    select full_name into student_name from public.profiles where id = new.student_id;
    insert into public.notifications(recipient_id, notification_type, title, message)
    values (new.alumni_id, 'mentorship_request_received', 'New mentorship request', coalesce(student_name, 'A student') || ' sent you a mentorship request about ' || new.topic || '.');
  elsif new.status is distinct from old.status and new.status in ('accepted', 'declined') then
    insert into public.notifications(recipient_id, notification_type, title, message)
    values (new.student_id, 'mentorship_request_updated', 'Mentorship request updated', 'Your mentorship request was ' || new.status || '.');
  end if;
  return new;
end;
$$;
create trigger mentorship_request_notifications
  after insert or update of status on public.mentorship_requests
  for each row execute function public.notify_mentorship_request();

create or replace function public.notify_referral_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications(recipient_id, notification_type, title, message)
    values (new.alumni_id, 'referral_request_received', 'New referral inquiry', 'A student has requested a referral for an opportunity you posted.');
  elsif new.status is distinct from old.status and new.status in ('acknowledged', 'declined') then
    insert into public.notifications(recipient_id, notification_type, title, message)
    values (new.student_id, 'referral_request_updated', 'Referral inquiry updated', 'Your referral inquiry was ' || new.status || '.');
  end if;
  return new;
end;
$$;
create trigger referral_request_notifications
  after insert or update of status on public.referral_requests
  for each row execute function public.notify_referral_request();

-- Enable RLS on every exposed application table.
alter table public.profiles enable row level security;
alter table public.alumni_profiles enable row level security;
alter table public.alumni_verification_submissions enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.saved_alumni enable row level security;
alter table public.opportunities enable row level security;
alter table public.referral_requests enable row level security;
alter table public.notifications enable row level security;

-- Remove broad default grants, then grant only the operations used by the app.
revoke all on table public.profiles, public.alumni_profiles, public.alumni_verification_submissions,
  public.mentorship_requests, public.saved_alumni, public.opportunities,
  public.referral_requests, public.notifications from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update (full_name, avatar_url, department, graduation_year, bio, location, skills) on public.profiles to authenticated;
grant select on public.alumni_profiles to anon, authenticated;
grant insert (user_id, current_title, company, degree, experience_years, mentorship_topics, available_for_mentorship, professional_links, past_milestones, advice_snippet) on public.alumni_profiles to authenticated;
grant update (current_title, company, degree, experience_years, mentorship_topics, available_for_mentorship, professional_links, past_milestones, advice_snippet) on public.alumni_profiles to authenticated;
grant select on public.alumni_verification_submissions to authenticated;
grant insert (user_id, document_path, notes) on public.alumni_verification_submissions to authenticated;
grant update (status, review_note) on public.alumni_verification_submissions to authenticated;
grant select on public.mentorship_requests to authenticated;
grant insert (student_id, alumni_id, topic, message, preferred_cadence) on public.mentorship_requests to authenticated;
grant update (status) on public.mentorship_requests to authenticated;
grant select, insert, delete on public.saved_alumni to authenticated;
grant select on public.opportunities to anon, authenticated;
grant insert (title, company, description, opportunity_type, department, location, compensation, application_deadline, application_url, skills, posted_by, status) on public.opportunities to authenticated;
grant update (title, company, description, opportunity_type, department, location, compensation, application_deadline, application_url, skills, status) on public.opportunities to authenticated;
grant select on public.referral_requests to authenticated;
grant insert (student_id, opportunity_id, alumni_id, message) on public.referral_requests to authenticated;
grant update (status) on public.referral_requests to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Publicly readable fields contain no email addresses. Only approved alumni are discoverable.
create policy "profiles readable by owner admin approved directory or connection" on public.profiles
  for select to anon, authenticated using (public.can_read_profile(id));
create policy "users update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "admins manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "approved alumni profiles are discoverable" on public.alumni_profiles
  for select to anon, authenticated using (verification_status = 'approved' or user_id = (select auth.uid()) or public.is_admin());
create policy "alumni create their profile details" on public.alumni_profiles
  for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = user_id and p.role = 'alumni'));
create policy "alumni update their own details" on public.alumni_profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "admins manage alumni profiles" on public.alumni_profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read their verification submissions" on public.alumni_verification_submissions
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "alumni submit verification documents" on public.alumni_verification_submissions
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and document_path like ((select auth.uid())::text || '/%')
    and exists (
      select 1 from public.alumni_profiles a
      where a.user_id = alumni_verification_submissions.user_id
        and a.verification_status in ('pending', 'rejected')
    )
  );
create policy "admins review verification submissions" on public.alumni_verification_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "participants read mentorship requests" on public.mentorship_requests
  for select to authenticated using (student_id = (select auth.uid()) or alumni_id = (select auth.uid()) or public.is_admin());
create policy "students create mentorship requests" on public.mentorship_requests
  for insert to authenticated with check (
    student_id = (select auth.uid())
    and status = 'pending'
    and exists (select 1 from public.profiles p where p.id = student_id and p.role = 'student')
    and exists (select 1 from public.alumni_profiles a where a.user_id = alumni_id and a.verification_status = 'approved' and a.available_for_mentorship)
  );
create policy "students withdraw their pending requests" on public.mentorship_requests
  for update to authenticated using (student_id = (select auth.uid()) and status = 'pending')
  with check (student_id = (select auth.uid()) and status = 'withdrawn');
create policy "alumni respond to incoming requests" on public.mentorship_requests
  for update to authenticated using (alumni_id = (select auth.uid()) and status = 'pending')
  with check (alumni_id = (select auth.uid()) and status in ('accepted', 'declined'));
create policy "admins manage mentorship requests" on public.mentorship_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read their saved alumni" on public.saved_alumni
  for select to authenticated using (student_id = (select auth.uid()));
create policy "students save approved alumni" on public.saved_alumni
  for insert to authenticated with check (
    student_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = student_id and p.role = 'student')
    and exists (select 1 from public.alumni_profiles a where a.user_id = alumni_id and a.verification_status = 'approved')
  );
create policy "students remove saved alumni" on public.saved_alumni
  for delete to authenticated using (student_id = (select auth.uid()));

create policy "approved alumni opportunities are public" on public.opportunities
  for select to anon, authenticated using (
    (status = 'published' and exists (
      select 1 from public.alumni_profiles a where a.user_id = posted_by and a.verification_status = 'approved'
    ))
    or posted_by = (select auth.uid())
    or public.is_admin()
  );
create policy "verified alumni create opportunities" on public.opportunities
  for insert to authenticated with check (
    posted_by = (select auth.uid())
    and exists (select 1 from public.alumni_profiles a where a.user_id = posted_by and a.verification_status = 'approved')
  );
create policy "owners update opportunities" on public.opportunities
  for update to authenticated using (posted_by = (select auth.uid()) or public.is_admin())
  with check (
    public.is_admin()
    or (posted_by = (select auth.uid()) and (
      status <> 'published'
      or exists (select 1 from public.alumni_profiles a where a.user_id = posted_by and a.verification_status = 'approved')
    ))
  );
create policy "referral participants read inquiries" on public.referral_requests
  for select to authenticated using (student_id = (select auth.uid()) or alumni_id = (select auth.uid()) or public.is_admin());
create policy "students create referral inquiries" on public.referral_requests
  for insert to authenticated with check (
    student_id = (select auth.uid())
    and status = 'pending'
    and exists (select 1 from public.profiles p where p.id = student_id and p.role = 'student')
    and exists (
      select 1 from public.opportunities o
      join public.alumni_profiles a on a.user_id = o.posted_by
      where o.id = opportunity_id and o.posted_by = alumni_id and o.status = 'published'
        and a.verification_status = 'approved'
    )
  );
create policy "students withdraw referral inquiries" on public.referral_requests
  for update to authenticated using (student_id = (select auth.uid()) and status = 'pending')
  with check (student_id = (select auth.uid()) and status = 'withdrawn');
create policy "alumni respond to referral inquiries" on public.referral_requests
  for update to authenticated using (alumni_id = (select auth.uid()) and status = 'pending')
  with check (alumni_id = (select auth.uid()) and status in ('acknowledged', 'declined'));
create policy "admins manage referral inquiries" on public.referral_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read their own notifications" on public.notifications
  for select to authenticated using (recipient_id = (select auth.uid()));
create policy "users mark their own notifications read" on public.notifications
  for update to authenticated using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- Private verification document storage. Object names begin with the owner's auth UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('alumni-verification', 'alumni-verification', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg'];

create policy "owners upload their verification files" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'alumni-verification'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "owners and admins read verification files" on storage.objects
  for select to authenticated using (
    bucket_id = 'alumni-verification'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
  );
create policy "owners delete their own unsubmitted verification files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'alumni-verification'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (
      select 1 from public.alumni_verification_submissions submission
      where submission.user_id = (select auth.uid())
        and submission.document_path = storage.objects.name
    )
  );

commit;
