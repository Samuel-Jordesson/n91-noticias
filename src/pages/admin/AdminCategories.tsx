import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, FileText, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { useAllPosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories, isLoading } = useCategories();
  const { data: allPosts } = useAllPosts();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Contar posts por categoria
  const postsByCategory = useMemo(() => {
    if (!allPosts || !categories) return {};
    
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = allPosts.filter(post => post.category_id === cat.id).length;
    });
    
    return counts;
  }, [allPosts, categories]);

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPosts = allPosts?.length || 0;

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Por favor, insira um nome para a categoria");
      return;
    }

    try {
      await createCategoryMutation.mutateAsync(categoryName.trim());
      setCategoryName("");
      setIsDialogOpen(false);
    } catch (error: any) {
      // Erro já é tratado no hook
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Por favor, insira um nome para a categoria");
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        name: categoryName.trim(),
      });
      setCategoryName("");
      setEditingCategory(null);
      setIsEditDialogOpen(false);
    } catch (error: any) {
      // Erro já é tratado no hook
    }
  };

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) return;

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
    } catch (error: any) {
      // Erro já é tratado no hook
    }
  };

  return (
    <AdminLayout title="Gerenciar Categorias">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">
            Categorias ({isLoading ? "..." : filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-0">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 sm:h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] sm:min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">
                      Slug
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Posts
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                        {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => {
                      const postCount = postsByCategory[category.id] || 0;
                      return (
                        <tr
                          key={category.id}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FolderTree className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-xs sm:text-sm">
                                  {category.name}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:hidden">
                                  {category.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                            {category.slug}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <Badge 
                              variant={postCount > 0 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {postCount} {postCount === 1 ? "post" : "posts"}
                            </Badge>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 sm:h-10 sm:w-10"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                                onClick={() => handleDeleteCategory(category)}
                                disabled={postCount > 0}
                                title={postCount > 0 ? "Remova os posts antes de apagar" : "Apagar categoria"}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar categoria */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Tecnologia, Esportes..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCategory();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setCategoryName("");
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateCategory}>
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar categoria */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name">Nome da Categoria</Label>
              <Input
                id="edit-category-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Tecnologia, Esportes..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateCategory();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setCategoryName("");
                  setEditingCategory(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateCategory}>
                Atualizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
