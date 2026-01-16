-- Tabela de empregos
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  application_link TEXT,
  location TEXT,
  salary TEXT,
  employment_type TEXT, -- Ex: 'CLT', 'PJ', 'Estágio', 'Freelance'
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_jobs_published ON public.jobs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_author ON public.jobs(author_id);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON public.jobs(is_featured, published_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Habilitar RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Políticas para jobs
CREATE POLICY "Empregos publicados são visíveis para todos" ON public.jobs
  FOR SELECT USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "Apenas editores e admins podem criar empregos" ON public.jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Apenas editores e admins podem atualizar empregos" ON public.jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Apenas admins podem deletar empregos" ON public.jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
