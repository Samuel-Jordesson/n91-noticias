-- Execute este SQL para criar a função que incrementa likes de comentários
-- Isso permite que qualquer usuário possa curtir comentários sem violar RLS

CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.comments
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir que qualquer um possa executar esta função
GRANT EXECUTE ON FUNCTION increment_comment_likes(UUID) TO anon, authenticated;
