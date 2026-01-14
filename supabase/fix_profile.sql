-- Script para garantir que o perfil existe
-- Execute este SQL após criar o usuário no Authentication

-- Substitua '1546d56c-5cbc-4393-8015-38a0e24021da' pelo seu User UID
-- Substitua 'samueljordessonjogo@gmail.com' pelo email do usuário

INSERT INTO public.profiles (id, name, email, role)
VALUES (
  '1546d56c-5cbc-4393-8015-38a0e24021da',
  'Admin',
  'samueljordessonjogo@gmail.com',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  name = COALESCE(profiles.name, 'Admin'),
  email = COALESCE(profiles.email, 'samueljordessonjogo@gmail.com');
