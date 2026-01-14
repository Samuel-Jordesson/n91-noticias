import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

// Buscar comentários de um post
export const getPostComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Comment[];
};

// Criar comentário
export const createComment = async (comment: CommentInsert) => {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
};

// Curtir comentário
export const likeComment = async (id: string) => {
  // Usar RPC para incrementar likes de forma segura
  const { error } = await supabase.rpc('increment_comment_likes', { comment_id: id });
  
  if (error) {
    // Se a função RPC não existir, tentar update direto (pode falhar por RLS)
    const { data } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', id)
      .single();

    if (data) {
      const { error: updateError } = await supabase
        .from('comments')
        .update({ likes: (data.likes || 0) + 1 })
        .eq('id', id);

      if (updateError) throw updateError;
    }
  }
};

// Buscar todos os comentários (admin)
export const getAllComments = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      posts (title, id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Aprovar/rejeitar comentário (admin)
export const moderateComment = async (id: string, isApproved: boolean) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ is_approved: isApproved })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Deletar comentário (admin)
export const deleteComment = async (id: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
