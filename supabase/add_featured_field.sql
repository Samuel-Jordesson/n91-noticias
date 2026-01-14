-- Execute este SQL para adicionar o campo is_featured na tabela posts
-- Se você já criou a tabela, execute este comando:

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
