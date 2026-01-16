import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export interface JobWithAuthor extends Job {
  profiles: {
    name: string;
    email: string;
  } | null;
}

// Buscar todos os empregos publicados
export const getPublishedJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:author_id (name, email)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data as JobWithAuthor[];
};

// Buscar todos os empregos (admin - inclui não publicados)
export const getAllJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:author_id (name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as JobWithAuthor[];
};

// Buscar emprego por ID
export const getJobById = async (id: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:author_id (name, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as JobWithAuthor;
};

// Buscar emprego por slug (gerado dinamicamente do título)
export const getJobBySlug = async (slug: string) => {
  // Buscar todos os empregos publicados e encontrar pelo slug gerado
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:author_id (name, email)
    `)
    .eq('is_published', true);

  if (error) throw error;

  // Gerar slug para cada emprego e encontrar o match
  const { generateSlug } = await import('@/lib/utils');
  const job = jobs?.find((j) => {
    const jobSlug = generateSlug(j.title);
    return jobSlug === slug;
  });

  if (!job) {
    throw new Error('Emprego não encontrado');
  }

  return job as JobWithAuthor;
};

// Buscar empregos destacados
export const getFeaturedJobs = async (limit: number = 4) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:author_id (name, email)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as JobWithAuthor[];
};

// Criar novo emprego
export const createJob = async (job: JobInsert) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Se author_id já foi especificado no job, usar ele. Caso contrário, usar o usuário logado
  const authorId = job.author_id || user.id;

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ...job,
      author_id: authorId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Atualizar emprego
export const updateJob = async (id: string, job: JobUpdate) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(job)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Deletar emprego
export const deleteJob = async (id: string) => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Incrementar visualizações
export const incrementJobViews = async (id: string) => {
  const { data } = await supabase
    .from('jobs')
    .select('views')
    .eq('id', id)
    .single();

  if (data) {
    await supabase
      .from('jobs')
      .update({ views: data.views + 1 })
      .eq('id', id);
  }
};
