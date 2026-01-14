import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

// Login com email e senha
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Ignorar erro de email não confirmado se a confirmação estiver desativada
    if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
      // Se o erro for apenas de confirmação, mas o usuário existe, tentar obter a sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        return { user: sessionData.session.user, session: sessionData.session };
      }
    }
    throw error;
  }
  return data;
};

// Registrar novo usuário
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  // Criar perfil após registro
  if (data.user) {
    await createProfile(data.user.id, name, email);
  }

  return data;
};

// Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Criar perfil
export const createProfile = async (userId: string, name: string, email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name,
      email,
      role: 'user',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

// Buscar perfil do usuário atual
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log("getCurrentProfile: Nenhum usuário autenticado");
    return null;
  }

  console.log("getCurrentProfile: Buscando perfil para usuário:", user.id, user.email);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("getCurrentProfile: Erro ao buscar perfil:", error);
    throw error;
  }

  console.log("getCurrentProfile: Perfil encontrado:", { name: data?.name, email: data?.email });
  return data as Profile;
};

// Verificar se usuário é admin
export const isAdmin = async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
};

// Verificar se usuário é editor ou admin
export const isEditor = async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin' || profile?.role === 'editor';
};

// Atualizar perfil
export const updateProfile = async (updates: Partial<Profile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};
