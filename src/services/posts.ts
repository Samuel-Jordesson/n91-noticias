import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { normalizeSlug } from "@/lib/utils";

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
  author_id: string | null;
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

// Buscar post por slug (gerado dinamicamente do título)
export const getPostBySlug = async (slug: string) => {
  // Buscar todos os posts publicados e encontrar pelo slug gerado
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      profiles:author_id (name, email)
    `)
    .eq('is_published', true);

  if (error) throw error;

  // Gerar slug para cada post e encontrar o match
  const { generateSlug } = await import('@/lib/utils');
  const post = posts?.find((p) => {
    const postSlug = generateSlug(p.title);
    return postSlug === slug;
  });

  if (!post) {
    throw new Error('Post não encontrado');
  }

  return post as PostWithCategory;
};

// Buscar posts por categoria
export const getPostsByCategory = async (categorySlug: string) => {
  if (!categorySlug) return [];

  // Normalizar o slug para remover acentos
  const normalizedSlug = normalizeSlug(categorySlug);
  
  if (!normalizedSlug) return [];

  // Primeiro tentar buscar pelo slug exato (caso o slug já esteja normalizado no banco)
  let { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('slug', normalizedSlug)
    .single();

  // Se não encontrou pelo slug exato, buscar todas e comparar normalizado
  if (categoryError || !category) {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug');

    if (categoriesError || !categories || categories.length === 0) {
      console.warn('Nenhuma categoria encontrada no banco de dados');
      return [];
    }

    // Encontrar a categoria que corresponde ao slug normalizado
    category = categories.find(cat => {
      if (!cat.slug) return false;
      return normalizeSlug(cat.slug) === normalizedSlug;
    });

    if (!category) {
      console.warn(`Categoria não encontrada para o slug: ${categorySlug} (normalizado: ${normalizedSlug})`);
      return [];
    }
  }

  // Buscar posts da categoria
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

  if (error) {
    console.error('Erro ao buscar posts por categoria:', error);
    throw error;
  }

  return (data || []) as PostWithCategory[];
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

  // Se author_id já foi especificado no post, usar ele. Caso contrário, usar o usuário logado
  const authorId = post.author_id || user.id;

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...post,
      author_id: authorId,
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
