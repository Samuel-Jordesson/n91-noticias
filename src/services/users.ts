import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Buscar todos os perfis (admin)
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Profile[];
};

// Criar novo usuário (admin)
export const createUser = async (email: string, password: string, name: string, role: 'admin' | 'editor' | 'user' | 'dev' = 'user') => {
  // Criar usuário no auth
  // IMPORTANTE: Para que o email seja confirmado automaticamente, desative a confirmação de email
  // no Supabase Dashboard: Authentication > Settings > Email Auth > "Enable email confirmations" = OFF
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // Não redirecionar para confirmação
      data: {
        name,
      },
    },
  });

  if (authError) {
    // Tratamento específico para rate limiting
    if (authError.status === 429 || authError.message.includes('rate limit') || authError.message.includes('Too Many Requests')) {
      const errorMessage = authError.message || 'Muitas requisições. Por favor, aguarde alguns segundos antes de tentar novamente.';
      throw new Error(errorMessage);
    }
    throw authError;
  }
  
  if (!authData.user) throw new Error('Erro ao criar usuário');

  // Se a confirmação de email estiver desativada, o usuário já estará confirmado automaticamente
  // Mas se não estiver, vamos tentar confirmar manualmente (requer service_role)
  // Por enquanto, vamos apenas aguardar e continuar

  // Aguardar um pouco para garantir que o trigger de criação de perfil tenha executado
  await new Promise(resolve => setTimeout(resolve, 500));

  // Verificar se o perfil já foi criado pelo trigger
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  let profileData;
  
  if (existingProfile) {
    // Se o perfil já existe (criado pelo trigger), apenas atualizar o role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role, name, email })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    profileData = updatedProfile;
  } else {
    // Se o perfil não existe, criar manualmente
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        role,
      })
      .select()
      .single();

    if (profileError) {
      // Se der erro ao criar perfil, informar sobre RLS
      if (profileError.message?.includes('row-level security') || profileError.message?.includes('RLS')) {
        throw new Error('Erro de permissão: Verifique se as políticas RLS estão configuradas corretamente para admins criarem perfis.');
      }
      throw profileError;
    }
    profileData = newProfile;
  }

  return profileData as Profile;
};

// Atualizar perfil de usuário (admin)
export const updateUserProfile = async (userId: string, updates: ProfileUpdate) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

// Deletar usuário (admin)
export const deleteUser = async (userId: string) => {
  // Deletar perfil primeiro
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;

  // Deletar usuário do auth (requer service role)
  // Nota: Isso precisa ser feito via API do Supabase com service role key
  // Por enquanto, vamos apenas deletar o perfil
  // O usuário ainda existirá no auth.users mas não terá perfil
  return true;
};

// Atualizar senha do usuário (admin)
export const updateUserPassword = async (userId: string, newPassword: string) => {
  // Isso requer service role key, então vamos usar uma abordagem diferente
  // O admin pode resetar a senha via Supabase Dashboard ou criar uma função RPC
  // Por enquanto, vamos retornar um aviso
  throw new Error('Atualização de senha deve ser feita via Supabase Dashboard ou função RPC');
};
