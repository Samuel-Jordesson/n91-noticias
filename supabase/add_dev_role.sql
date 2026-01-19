-- Adicionar role 'dev' ao CHECK constraint da tabela profiles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'editor', 'user', 'dev'));

-- Atualizar políticas RLS para incluir 'dev' onde tem 'admin'
-- Devs têm os mesmos privilégios que admins

-- Políticas para categories (devs podem gerenciar)
DROP POLICY IF EXISTS "Apenas admins podem gerenciar categorias" ON public.categories;
CREATE POLICY "Apenas admins e devs podem gerenciar categorias" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Políticas para posts (devs podem deletar)
DROP POLICY IF EXISTS "Apenas admins podem deletar posts" ON public.posts;
CREATE POLICY "Apenas admins e devs podem deletar posts" ON public.posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Políticas para comments (devs podem moderar)
DROP POLICY IF EXISTS "Apenas admins podem moderar comentários" ON public.comments;
CREATE POLICY "Apenas admins e devs podem moderar comentários" ON public.comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

DROP POLICY IF EXISTS "Apenas admins podem deletar comentários" ON public.comments;
CREATE POLICY "Apenas admins e devs podem deletar comentários" ON public.comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Políticas para ads (devs podem gerenciar)
DROP POLICY IF EXISTS "Apenas admins podem gerenciar anúncios" ON public.ads;
CREATE POLICY "Apenas admins e devs podem gerenciar anúncios" ON public.ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dev')
    )
  );

-- Políticas para settings (devs podem gerenciar)
DROP POLICY IF EXISTS "Settings are updatable by admins only" ON public.settings;
CREATE POLICY "Settings are updatable by admins and devs" ON public.settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dev')
    )
  );

DROP POLICY IF EXISTS "Settings are insertable by admins only" ON public.settings;
CREATE POLICY "Settings are insertable by admins and devs" ON public.settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dev')
    )
  );
