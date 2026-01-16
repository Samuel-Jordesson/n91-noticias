import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  signIn,
  signUp,
  signOut,
  getCurrentProfile,
  isAdmin,
  isEditor,
  updateProfile,
} from "@/services/auth";
import type { User } from "@supabase/supabase-js";

// Hook para autenticação
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

// Hook para perfil do usuário
export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: getCurrentProfile,
    enabled: !!user && !authLoading,
    staleTime: 0, // Sempre buscar dados frescos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Remover refetchInterval para evitar requisições desnecessárias
    // O refetch será feito quando necessário (login, etc)
  });
};

// Hook para verificar se é admin
export const useIsAdmin = () => {
  const { data: profile } = useProfile();
  return profile?.role === 'admin';
};

// Hook para verificar se é editor
export const useIsEditor = () => {
  const { data: profile } = useProfile();
  return profile?.role === 'admin' || profile?.role === 'editor';
};

// Hook para login
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: async (data) => {
      // Invalidar e refetch o perfil após login
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Forçar refetch do perfil para garantir dados atualizados
      if (data?.user) {
        await queryClient.refetchQueries({ queryKey: ["profile", data.user.id] });
      }
    },
  });
};

// Hook para registro
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      signUp(email, password, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Hook para logout
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Hook para atualizar perfil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
