-- Execute este SQL para tornar o campo image_url opcional
-- Se você já criou a tabela, execute este comando:

ALTER TABLE public.posts 
ALTER COLUMN image_url DROP NOT NULL;
