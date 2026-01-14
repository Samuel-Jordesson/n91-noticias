-- Execute este SQL para criar/atualizar o perfil do admin
-- Substitua os valores se necessário

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
  name = COALESCE(EXCLUDED.name, profiles.name, 'Admin'),
  email = COALESCE(EXCLUDED.email, profiles.email, 'samueljordessonjogo@gmail.com');
