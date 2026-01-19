-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO public.settings (key, value) 
VALUES ('site_logo', '/imagens/Logo.png')
ON CONFLICT (key) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler configurações
CREATE POLICY "Settings are viewable by everyone"
  ON public.settings FOR SELECT
  USING (true);

-- Política: Apenas admins podem atualizar configurações
CREATE POLICY "Settings are updatable by admins only"
  ON public.settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política: Apenas admins podem inserir configurações
CREATE POLICY "Settings are insertable by admins only"
  ON public.settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
