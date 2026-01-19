import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, getSetting, upsertSetting, uploadLogo } from "@/services/settings";

// Hook para buscar todas as configurações
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar uma configuração específica
export const useSetting = (key: string) => {
  return useQuery({
    queryKey: ["settings", key],
    queryFn: () => getSetting(key),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para atualizar uma configuração
export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      upsertSetting(key, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
    },
  });
};

// Hook para fazer upload de logo
export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  const updateSetting = useUpdateSetting();

  return useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadLogo(file);
      await upsertSetting('site_logo', url);
      return url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings", "site_logo"] });
    },
  });
};
