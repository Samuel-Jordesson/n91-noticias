import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPosts,
  getPublishedPosts,
  getPostById,
  getPostBySlug,
  getPostsByCategory,
  getMostViewedPosts,
  getFeaturedPosts,
  createPost,
  updatePost,
  deletePost,
  incrementPostViews,
} from "@/services/posts";

// Hook para buscar todos os posts (admin - inclui não publicados)
export const useAllPosts = () => {
  return useQuery({
    queryKey: ["posts", "all"],
    queryFn: getAllPosts,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar todos os posts publicados
export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getPublishedPosts,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar post por ID
export const usePost = (id: string) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
};

// Hook para buscar post por slug
export const usePostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["post", "slug", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
  });
};

// Hook para buscar posts por categoria
export const usePostsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ["posts", "category", categorySlug],
    queryFn: () => getPostsByCategory(categorySlug),
    enabled: !!categorySlug,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook para posts mais visualizados
export const useMostViewedPosts = (limit: number = 5) => {
  return useQuery({
    queryKey: ["posts", "most-viewed", limit],
    queryFn: () => getMostViewedPosts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para posts destacados
export const useFeaturedPosts = (limit: number = 4) => {
  return useQuery({
    queryKey: ["posts", "featured", limit],
    queryFn: () => getFeaturedPosts(limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para criar post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "all"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "featured"] });
    },
  });
};

// Hook para atualizar post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, post }: { id: string; post: any }) => updatePost(id, post),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "all"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["posts", "featured"] });
    },
  });
};

// Hook para deletar post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "all"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "featured"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "most-viewed"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "category"] });
      // Invalidar também queries individuais de posts
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
};

// Hook para incrementar visualizações
export const useIncrementViews = () => {
  return useMutation({
    mutationFn: incrementPostViews,
  });
};
