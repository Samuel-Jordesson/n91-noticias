import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database['public']['Tables']['categories']['Row'];

// Buscar todas as categorias
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Category[];
};

// Buscar categoria por slug
export const getCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Category;
};

// Criar categoria
export const createCategory = async (name: string) => {
  const { generateSlug } = await import('@/lib/utils');
  const slug = generateSlug(name);
  
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug })
    .select()
    .single();

  if (error) throw error;
  return data as Category;
};

// Atualizar categoria
export const updateCategory = async (id: string, name: string) => {
  const { generateSlug } = await import('@/lib/utils');
  const slug = generateSlug(name);
  
  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
};

// Deletar categoria
export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
