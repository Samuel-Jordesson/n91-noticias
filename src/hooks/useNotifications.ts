import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllNotifications,
  getUnreadNotifications,
  getUnreadCount,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
  uploadNotificationImage,
} from "@/services/notifications";
import { useProfile } from "./useAuth";
import { toast } from "sonner";

// Buscar todas as notificações
export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
  });
};

// Buscar notificações não lidas
export const useUnreadNotifications = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["notifications", "unread", profile?.id],
    queryFn: () => {
      if (!profile?.id) return [];
      return getUnreadNotifications(profile.id);
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

// Contar notificações não lidas
export const useUnreadCount = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["notifications", "unread-count", profile?.id],
    queryFn: () => {
      if (!profile?.id) return 0;
      return getUnreadCount(profile.id);
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

// Criar notificação
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar notificação");
    },
  });
};

// Marcar como lida
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: (notificationId: string) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");
      return markNotificationAsRead(notificationId, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao marcar notificação como lida");
    },
  });
};

// Deletar notificação
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("Notificação deletada!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar notificação");
    },
  });
};

// Upload de imagem
export const useUploadNotificationImage = () => {
  return useMutation({
    mutationFn: uploadNotificationImage,
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer upload da imagem");
    },
  });
};
