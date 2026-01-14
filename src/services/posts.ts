import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

export interface PostWithCategory extends Post {
  categories: {
    name: string;
    slug: string;
  } | null;
  profiles: {
    name: string;
    email: string;
  } | null;
}

// Buscar todos os posts (admin - inclui não publicados)
export const getAllPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PostWithCategory[];
};

// Buscar todos os posts publicados
export const getPublishedPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data as PostWithCategory[];
};

// Buscar post por ID
export const getPostById = async (id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as PostWithCategory;
};

// Buscar posts por categoria
export const getPostsByCategory = async (categorySlug: string) => {
  // Primeiro buscar a categoria pelo slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .eq('is_published', true)
    .eq('category_id', category.id)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data as PostWithCategory[];
};

// Buscar posts mais visualizados
export const getMostViewedPosts = async (limit: number = 5) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as PostWithCategory[];
};

// Buscar posts destacados
export const getFeaturedPosts = async (limit: number = 4) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as PostWithCategory[];
};

// Criar novo post
export const createPost = async (post: PostInsert) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...post,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Atualizar post
export const updatePost = async (id: string, post: PostUpdate) => {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Deletar post
export const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Incrementar visualizações
export const incrementPostViews = async (id: string) => {
  const { error } = await supabase.rpc('increment_views', { post_id: id });
  if (error) {
    // Se a função não existir, fazer update manual
    const { data } = await supabase
      .from('posts')
      .select('views')
      .eq('id', id)
      .single();

    if (data) {
      await supabase
        .from('posts')
        .update({ views: data.views + 1 })
        .eq('id', id);
    }
  }
};
