import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Ad = Database['public']['Tables']['ads']['Row'];
type AdInsert = Database['public']['Tables']['ads']['Insert'];
type AdUpdate = Database['public']['Tables']['ads']['Update'];

// Buscar anúncios ativos por posição
export const getActiveAdsByPosition = async (position: 'sidebar' | 'banner' | 'inline') => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('position', position)
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Ad[];
};

// Buscar todos os anúncios (admin)
export const getAllAds = async () => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Ad[];
};

// Criar anúncio (admin)
export const createAd = async (ad: AdInsert) => {
  const { data, error } = await supabase
    .from('ads')
    .insert(ad)
    .select()
    .single();

  if (error) throw error;
  return data as Ad;
};

// Atualizar anúncio (admin)
export const updateAd = async (id: string, ad: AdUpdate) => {
  const { data, error } = await supabase
    .from('ads')
    .update(ad)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Ad;
};

// Deletar anúncio (admin)
export const deleteAd = async (id: string) => {
  const { error } = await supabase
    .from('ads')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
