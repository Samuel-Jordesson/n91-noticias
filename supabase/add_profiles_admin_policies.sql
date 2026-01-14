-- Adicionar políticas RLS para admins gerenciarem perfis de outros usuários

-- Permitir que admins criem perfis (INSERT)
CREATE POLICY "Admins podem criar perfis" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir que admins atualizem qualquer perfil (UPDATE)
CREATE POLICY "Admins podem atualizar qualquer perfil" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir que admins deletem perfis (DELETE)
CREATE POLICY "Admins podem deletar perfis" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Nota: Se as políticas já existirem, você pode precisar dropar as antigas primeiro:
-- DROP POLICY IF EXISTS "Admins podem criar perfis" ON public.profiles;
-- DROP POLICY IF EXISTS "Admins podem atualizar qualquer perfil" ON public.profiles;
-- DROP POLICY IF EXISTS "Admins podem deletar perfis" ON public.profiles;
