-- Criar tabela de notificações internas do admin
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para rastrear quais usuários leram quais notificações
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
-- Todos os admins, editores e devs podem ver notificações
CREATE POLICY "Admins, Editores e Devs podem ver notificações" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor', 'dev')
    )
  );

-- Apenas devs podem criar notificações
CREATE POLICY "Apenas devs podem criar notificações" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'dev'
    )
  );

-- Apenas devs podem atualizar notificações
CREATE POLICY "Apenas devs podem atualizar notificações" ON public.notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'dev'
    )
  );

-- Apenas devs podem deletar notificações
CREATE POLICY "Apenas devs podem deletar notificações" ON public.notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'dev'
    )
  );

-- Políticas para notification_reads
-- Usuários podem ver seus próprios reads
CREATE POLICY "Usuários podem ver seus próprios reads" ON public.notification_reads
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios reads (marcar como lida)
CREATE POLICY "Usuários podem criar seus próprios reads" ON public.notification_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON public.notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON public.notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
