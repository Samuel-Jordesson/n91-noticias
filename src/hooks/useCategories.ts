import { useQuery } from "@tanstack/react-query";
import { getCategories, getCategoryBySlug } from "@/services/categories";

// Hook para buscar todas as categorias
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hook para buscar categoria por slug
export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  });
};
