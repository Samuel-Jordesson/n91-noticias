-- Corrigir políticas RLS para profiles incluindo 'dev' e garantir que admins/devs possam criar perfis

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem criar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem deletar perfis" ON public.profiles;

-- Permitir que admins e devs criem perfis (INSERT)
-- IMPORTANTE: Esta política permite que admins/devs criem perfis para outros usuários
CREATE POLICY "Admins e Devs podem criar perfis" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Permitir que admins e devs atualizem qualquer perfil (UPDATE)
CREATE POLICY "Admins e Devs podem atualizar qualquer perfil" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Permitir que admins e devs deletem perfis (DELETE)
CREATE POLICY "Admins e Devs podem deletar perfis" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Garantir que o trigger handle_new_user funcione corretamente
-- O trigger já está como SECURITY DEFINER, então ele deve funcionar
-- Mas vamos garantir que ele possa criar perfis mesmo sem passar pelas políticas RLS
-- Isso já está configurado no trigger, mas vamos verificar se está correto

-- Verificar e recriar o trigger se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
