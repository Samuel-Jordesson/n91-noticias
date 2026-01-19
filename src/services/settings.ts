import { supabase } from "@/integrations/supabase/client";

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

// Buscar todas as configurações
export const getSettings = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Erro ao buscar configurações:', error);
    return {};
  }

  const settings: Record<string, string> = {};
  data?.forEach((setting) => {
    settings[setting.key] = setting.value || '';
  });

  return settings;
};

// Buscar uma configuração específica
export const getSetting = async (key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error(`Erro ao buscar configuração ${key}:`, error);
    return null;
  }

  return data?.value || null;
};

// Atualizar ou criar uma configuração
export const upsertSetting = async (key: string, value: string): Promise<void> => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    console.error(`Erro ao salvar configuração ${key}:`, error);
    throw new Error(`Erro ao salvar configuração: ${error.message}`);
  }
};

// Upload de imagem para o Supabase Storage
export const uploadLogo = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `logo.${fileExt}`;
  const filePath = `logos/${fileName}`;

  // Verificar se o bucket existe, se não, usar 'public' ou criar
  // Primeiro, tentar fazer upload no bucket 'images'
  let uploadError;
  let uploadData;
  
  try {
    const result = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    uploadError = result.error;
    uploadData = result.data;
  } catch (error) {
    // Se o bucket não existir, tentar usar o bucket padrão ou fazer upload local
    console.warn('Bucket images não encontrado, usando URL local');
    // Criar uma URL local temporária
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (uploadError) {
    console.error('Erro ao fazer upload da logo:', uploadError);
    // Se falhar, usar data URL como fallback
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
};
