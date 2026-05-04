-- =============================================================================
-- VIOGI — Trigger: auto-crear public.profiles al insertar en auth.users
-- =============================================================================
--
-- Cuando Supabase Auth crea un usuario (vía signUp, OAuth, magic link, etc.),
-- esta función inserta automáticamente la fila correspondiente en public.profiles.
--
-- security definer permite bypassear RLS, ya que la función corre como owner
-- de la base de datos. Esto es necesario porque en el momento del INSERT en
-- auth.users la sesión del usuario aún no existe (especialmente con email
-- confirmation activado).
--
-- search_path = public es una mitigación de seguridad: evita que un atacante
-- pueda crear funciones homónimas en otro schema y secuestrar la ejecución.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      new.email
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
