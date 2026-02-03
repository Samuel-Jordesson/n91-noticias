import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProfiles,
  createUser,
  updateUserProfile,
  deleteUser,
  getProfileById,
  uploadUserAvatar,
} from "@/services/users";

// Hook para buscar todos os perfis (admin)
export const useAllProfiles = () => {
  return useQuery({
    queryKey: ["profiles", "all"],
    queryFn: getAllProfiles,
  });
};

// Hook para criar usuário (admin)
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name, role }: { email: string; password: string; name: string; role?: 'admin' | 'editor' | 'user' | 'dev' }) =>
      createUser(email, password, name, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

// Hook para atualizar perfil de usuário (admin)
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      updateUserProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

// Hook para deletar usuário (admin)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

// Hook para buscar perfil por ID
export const useProfileById = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfileById(userId!),
    enabled: !!userId,
  });
};

// Hook para upload de avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadUserAvatar(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
