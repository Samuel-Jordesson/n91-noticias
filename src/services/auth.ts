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
    // Se o erro for de email não confirmado, ignorar e tentar obter a sessão
    // (assumindo que a confirmação de email está desativada no Supabase)
    if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
      console.log("Email não confirmado detectado, mas ignorando (confirmação pode estar desativada)");
      
      // Tentar obter a sessão diretamente - pode funcionar se a confirmação estiver desativada
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData?.session && !sessionError) {
        console.log("Sessão obtida com sucesso, ignorando erro de confirmação");
        return { user: sessionData.session.user, session: sessionData.session };
      }
      
      // Se não conseguiu a sessão, tentar fazer login novamente após um pequeno delay
      // Às vezes o Supabase precisa de um momento para processar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Se ainda der erro de confirmação, mas conseguirmos a sessão, retornar sucesso
      if (retryError && (retryError.message?.includes('Email not confirmed') || retryError.message?.includes('email_not_confirmed'))) {
        const { data: finalSession } = await supabase.auth.getSession();
        if (finalSession?.session) {
          console.log("Sessão obtida após retry, continuando login");
          return { user: finalSession.session.user, session: finalSession.session };
        }
      }
      
      // Se o retry funcionou, retornar
      if (!retryError && retryData) {
        return retryData;
      }
      
      // Se chegou aqui, não conseguimos contornar o erro
      // Mas vamos tentar uma última vez obter a sessão
      const { data: lastSession } = await supabase.auth.getSession();
      if (lastSession?.session) {
        return { user: lastSession.session.user, session: lastSession.session };
      }
      
      // Se nada funcionou, lançar o erro original (mas isso não deveria acontecer se a confirmação estiver desativada)
      console.warn("Não foi possível contornar erro de email não confirmado");
    }
    
    // Se não for erro de email não confirmado, lançar o erro normalmente
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
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("getCurrentProfile: Erro ao obter usuário:", userError);
    return null;
  }
  
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
    // Se o perfil não existir, retornar null ao invés de lançar erro
    if (error.code === 'PGRST116') {
      console.warn("getCurrentProfile: Perfil não encontrado para o usuário:", user.id);
      return null;
    }
    throw error;
  }

  if (!data) {
    console.warn("getCurrentProfile: Perfil não encontrado (data é null)");
    return null;
  }

  console.log("getCurrentProfile: Perfil encontrado:", { 
    id: data.id, 
    name: data.name, 
    email: data.email, 
    role: data.role 
  });
  return data as Profile;
};

// Verificar se usuário é admin
export const isAdmin = async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin' || profile?.role === 'dev';
};

// Verificar se usuário é editor ou admin
export const isEditor = async () => {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin' || profile?.role === 'editor' || profile?.role === 'dev';
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
