-- Adicionar campos de biografia e redes sociais ao perfil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Comentário sobre a estrutura do social_links
-- O campo social_links será um JSONB com a seguinte estrutura:
-- {
--   "facebook": "https://facebook.com/usuario",
--   "twitter": "https://twitter.com/usuario",
--   "instagram": "https://instagram.com/usuario",
--   "linkedin": "https://linkedin.com/in/usuario",
--   "youtube": "https://youtube.com/@usuario",
--   "website": "https://site.com"
-- }
-- Máximo de 3 redes sociais podem ser exibidas na página de perfil
