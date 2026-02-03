-- Script para corrigir usuários órfãos (existem no auth.users mas não têm perfil em profiles)
-- Execute este script no Supabase SQL Editor para criar perfis para usuários que foram criados
-- mas não têm perfil na tabela profiles

-- Criar perfis para usuários órfãos
INSERT INTO public.profiles (id, name, email, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'Usuário'),
  au.email,
  'user' -- Role padrão, pode ser atualizado depois pelo admin
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verificar quantos usuários órfãos foram corrigidos
SELECT COUNT(*) as usuarios_orfãos_corrigidos
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
