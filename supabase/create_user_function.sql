-- Função RPC para criar usuário sem exigir confirmação de email
-- Esta função deve ser executada com service_role (não expor no frontend)

CREATE OR REPLACE FUNCTION public.create_user_without_confirmation(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'user'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Criar usuário usando a extensão auth (requer permissões de service_role)
  -- Nota: Esta função precisa ser chamada via API do Supabase com service_role key
  -- ou via Edge Function
  
  -- Por enquanto, vamos criar apenas o perfil e deixar o usuário criar a conta depois
  -- Ou usar a API Admin do Supabase diretamente no backend
  
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Use a API Admin do Supabase para criar usuários sem confirmação de email'
  );
END;
$$;

-- Alternativa: Criar uma função que atualiza o email_confirmado após criação
-- Mas isso ainda requer que o usuário seja criado primeiro
