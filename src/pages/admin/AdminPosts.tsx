import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePosts, useUpdatePost, useDeletePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPosts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: posts, isLoading: isLoadingPosts } = usePosts();
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => navigate("/admin/editor")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Post
        </Button>
      </div>

      {/* Posts Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">
            Posts ({isLoadingPosts ? "..." : filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoadingPosts ? (
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-0">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 sm:h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] sm:min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Título
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Autor
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      Data
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Destaque
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                        Nenhum post encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {post.image_url ? (
                              <img
                                src={post.image_url}
                                alt=""
                                className="h-8 w-12 sm:h-10 sm:w-16 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-12 sm:h-10 sm:w-16 bg-muted rounded flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                                Sem img
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-xs sm:text-sm line-clamp-2">
                                {post.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 sm:hidden">
                                <span className="news-category-badge text-[10px]">
                                  {post.categories?.name || "Sem categoria"}
                                </span>
                                {post.is_breaking && (
                                  <span className="text-[10px] text-accent font-medium">
                                    Urgente
                                  </span>
                                )}
                              </div>
                              {post.is_breaking && (
                                <span className="text-[10px] sm:text-xs text-accent font-medium hidden sm:inline-block mt-0.5">
                                  Urgente
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                          <span className="news-category-badge text-xs">
                            {post.categories?.name || "Sem categoria"}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">
                          {post.profiles?.name || "Desconhecido"}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                          {post.published_at
                            ? format(new Date(post.published_at), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "-"}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          {post.views.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleFeatured(post)}
                              className={`group transition-colors ${
                                post.is_featured 
                                  ? "text-[#47B354]" 
                                  : "text-muted-foreground hover:text-[#47B354]"
                              }`}
                              title={post.is_featured ? "Remover dos destaques" : "Adicionar aos destaques"}
                            >
                              <Star 
                                className={`h-4 w-4 sm:h-5 sm:w-5 transition-all ${
                                  post.is_featured 
                                    ? "fill-current" 
                                    : "group-hover:fill-[#47B354]"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 sm:h-10 sm:w-10"
                              onClick={() => handleEdit(post)}
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPosts;
