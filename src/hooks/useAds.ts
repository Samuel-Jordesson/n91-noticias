import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveAdsByPosition,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
} from "@/services/ads";

// Hook para buscar anúncios por posição
export const useAdsByPosition = (position: 'sidebar' | 'banner' | 'inline') => {
  return useQuery({
    queryKey: ["ads", position],
    queryFn: () => getActiveAdsByPosition(position),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para buscar todos os anúncios (admin)
export const useAllAds = () => {
  return useQuery({
    queryKey: ["ads", "all"],
    queryFn: getAllAds,
  });
};

// Hook para criar anúncio (admin)
export const useCreateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

// Hook para atualizar anúncio (admin)
export const useUpdateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ad }: { id: string; ad: any }) => updateAd(id, ad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};

// Hook para deletar anúncio (admin)
export const useDeleteAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
};
