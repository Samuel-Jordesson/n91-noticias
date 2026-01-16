import { useState } from "react";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories, isLoading } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Slug: {category.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="h-8 sm:h-9"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      className="h-8 sm:h-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
