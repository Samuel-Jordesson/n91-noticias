import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllJobs,
  getPublishedJobs,
  getJobById,
  getJobBySlug,
  getFeaturedJobs,
  createJob,
  updateJob,
  deleteJob,
  incrementJobViews,
} from "@/services/jobs";

// Hook para buscar todos os empregos (admin - inclui não publicados)
export const useAllJobs = () => {
  return useQuery({
    queryKey: ["jobs", "all"],
    queryFn: getAllJobs,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar todos os empregos publicados
export const useJobs = () => {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: getPublishedJobs,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para buscar emprego por ID
export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  });
};

// Hook para buscar emprego por slug
export const useJobBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["job", "slug", slug],
    queryFn: () => getJobBySlug(slug),
    enabled: !!slug,
  });
};

// Hook para empregos destacados
export const useFeaturedJobs = (limit: number = 4) => {
  return useQuery({
    queryKey: ["jobs", "featured", limit],
    queryFn: () => getFeaturedJobs(limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para criar emprego
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "all"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "featured"] });
    },
  });
};

// Hook para atualizar emprego
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, job }: { id: string; job: any }) => updateJob(id, job),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "all"] });
      queryClient.invalidateQueries({ queryKey: ["job", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "featured"] });
    },
  });
};

// Hook para deletar emprego
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", "all"] });
    },
  });
};

// Hook para incrementar visualizações
export const useIncrementJobViews = () => {
  return useMutation({
    mutationFn: incrementJobViews,
  });
};
