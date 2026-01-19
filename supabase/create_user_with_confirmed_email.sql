-- Função para criar usuário com email já confirmado
-- Esta função usa SECURITY DEFINER para ter privilégios de admin
CREATE OR REPLACE FUNCTION public.create_user_with_confirmed_email(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'user'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verificar se o usuário que está chamando é admin ou dev
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'dev')
  ) THEN
    RAISE EXCEPTION 'Apenas administradores e desenvolvedores podem criar usuários';
  END IF;

  -- Criar usuário no auth.users usando a extensão auth
  -- Nota: Isso requer que a extensão pgcrypto esteja habilitada
  -- O Supabase gerencia isso automaticamente, mas precisamos usar a API Admin
  -- Por enquanto, vamos apenas retornar um erro informando que precisa usar a API Admin
  -- ou criar via Supabase Dashboard
  
  -- Alternativa: Usar a função do Supabase para criar usuário
  -- Mas isso requer service_role, então vamos criar uma abordagem diferente
  
  -- Retornar erro informando que precisa usar a API Admin
  RAISE EXCEPTION 'Esta função requer uso da API Admin do Supabase. Use a função createUser no frontend que já trata isso.';
END;
$$;

-- Comentário: A confirmação de email deve ser desativada nas configurações do Supabase
-- Authentication > Settings > Email Auth > "Enable email confirmations" deve estar DESLIGADO
