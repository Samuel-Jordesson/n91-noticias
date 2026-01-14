import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPostComments,
  createComment,
  likeComment,
  getAllComments,
  moderateComment,
  deleteComment,
} from "@/services/comments";

// Hook para buscar comentários de um post
export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments(postId),
    enabled: !!postId,
  });
};

// Hook para criar comentário
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      // Invalidar comentários do post específico
      queryClient.invalidateQueries({ queryKey: ["comments", variables.post_id] });
      // Também invalidar todos os comentários para garantir atualização
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};

// Hook para curtir comentário
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeComment,
    onSuccess: () => {
      // Invalidar todos os comentários para atualizar os likes
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};

// Hook para buscar todos os comentários (admin)
export const useAllComments = () => {
  return useQuery({
    queryKey: ["comments", "all"],
    queryFn: getAllComments,
  });
};

// Hook para moderar comentário (admin)
export const useModerateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      moderateComment(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};

// Hook para deletar comentário (admin)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};
