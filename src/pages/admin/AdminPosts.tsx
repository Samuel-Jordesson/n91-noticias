import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Star, Eye, Calendar, User, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAllPosts, useUpdatePost, useDeletePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPosts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: posts, isLoading: isLoadingPosts } = useAllPosts();
  const { data: categories } = useCategories();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || 
      post.categories?.slug === filterCategory ||
      post.categories?.name.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }) || [];

  const handleEdit = (post: any) => {
    navigate(`/admin/editor/${post.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;

    try {
      await deletePostMutation.mutateAsync(id);
      toast.success("Post excluído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir post");
    }
  };

  const handleToggleFeatured = async (post: any) => {
    try {
      await updatePostMutation.mutateAsync({
        id: post.id,
        post: {
          is_featured: !post.is_featured,
        },
      });
      toast.success(
        post.is_featured
          ? "Post removido dos destaques"
          : "Post adicionado aos destaques!"
      );
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar post");
    }
  };


  return (
    <AdminLayout title="Gerenciar Posts">
      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl h-10 text-sm"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-56 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:outline-none focus:ring-0 rounded-xl h-10 text-sm font-medium text-slate-700 hover:bg-white transition-colors">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-100 bg-white shadow-lg p-1.5 min-w-[var(--radix-select-trigger-width)] [&_svg]:text-[#21366B]">
              <SelectItem 
                value="all" 
                className="text-sm font-medium text-slate-700 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 hover:text-slate-700 focus:bg-slate-50 focus:text-slate-700 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-700 data-[state=checked]:bg-[#21366B]/5 data-[state=checked]:text-[#21366B] pl-8"
              >
                Todas as categorias
              </SelectItem>
              {categories?.map((cat) => (
                <SelectItem 
                  key={cat.id} 
                  value={cat.slug} 
                  className="text-sm font-medium text-slate-700 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 hover:text-slate-700 focus:bg-slate-50 focus:text-slate-700 data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-700 data-[state=checked]:bg-[#21366B]/5 data-[state=checked]:text-[#21366B] pl-8"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => navigate("/admin/editor")}
            className="bg-[#21366B] hover:bg-[#21366B]/90 text-white rounded-xl h-10 px-6 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            Posts ({isLoadingPosts ? "..." : filteredPosts.length})
          </h3>
        </div>

        {isLoadingPosts ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">Nenhum post encontrado</p>
          </div>
        ) : (
          <>
            {/* Header das Colunas */}
            <div className="px-4 py-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-20 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título</span>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</span>
                </div>
                <div className="flex-shrink-0 w-32">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Autor</span>
                </div>
                <div className="flex-shrink-0 w-24">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data</span>
                </div>
                <div className="flex-shrink-0 w-28">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Views</span>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destaque</span>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</span>
                </div>
              </div>
            </div>

            {/* Lista de Posts */}
            <div className="space-y-2">
              {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group p-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Imagem */}
                  <div className="flex-shrink-0">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-[9px] text-slate-400">Sem img</span>
                      </div>
                    )}
                  </div>

                  {/* Título */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-700 group-hover:text-[#21366B] leading-tight transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </div>

                  {/* Categoria */}
                  <div className="flex-shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-[#47B354]/10 text-[#47B354] text-[10px] font-bold uppercase tracking-wider">
                      {post.categories?.name || "Sem categoria"}
                    </span>
                  </div>

                  {/* Autor */}
                  <div className="flex-shrink-0 w-32">
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <User size={12} className="text-[#21366B]" />
                      <span className="truncate">{post.profiles?.name || "Desconhecido"}</span>
                    </div>
                  </div>

                  {/* Data */}
                  <div className="flex-shrink-0 w-24">
                    {post.published_at ? (
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Calendar size={12} className="text-[#21366B]" />
                        <span>
                          {format(new Date(post.published_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>

                  {/* Views */}
                  <div className="flex-shrink-0 w-28">
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Eye size={12} className="text-[#21366B]" />
                      <span>{post.views.toLocaleString("pt-BR")}</span>
                    </div>
                  </div>

                  {/* Destaque */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggleFeatured(post)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.is_featured 
                          ? "text-[#47B354] bg-[#47B354]/10" 
                          : "text-slate-400 hover:text-[#47B354] hover:bg-slate-100"
                      }`}
                      title={post.is_featured ? "Remover dos destaques" : "Adicionar aos destaques"}
                    >
                      <Star 
                        size={16}
                        className={post.is_featured ? "fill-current" : ""}
                      />
                    </button>
                  </div>

                  {/* Ações */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-lg text-slate-400 hover:text-[#21366B] hover:bg-slate-100 transition-colors"
                      title="Editar post"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Excluir post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPosts;
