import { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TipTapEditor from "@/components/TipTapEditor";
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useAuth";
import { useAllProfiles } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPosts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: posts, isLoading: isLoadingPosts } = usePosts();
  const { data: categories } = useCategories();
  const { data: profile } = useProfile();
  const { data: allProfiles = [] } = useAllProfiles();
  const createPostMutation = useCreatePost();
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !excerpt || !editorContent || !selectedCategory) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Buscar category_id pelo nome ou slug
    const category = categories?.find(
      (cat) => cat.name === selectedCategory || cat.slug === selectedCategory.toLowerCase()
    );

    if (!category) {
      toast.error("Categoria não encontrada");
      return;
    }

    // Usar o autor selecionado ou o usuário logado como padrão
    const authorId = selectedAuthor || profile?.id;
    
    if (!authorId) {
      toast.error("Erro: Selecione um autor ou faça login novamente.");
      return;
    }

    try {
      const postData: any = {
        title,
        excerpt,
        content: editorContent,
        category_id: category.id,
        author_id: authorId, // Usar o autor selecionado ou o usuário logado
        is_breaking: isBreaking,
        is_featured: isFeatured,
        is_published: true,
        published_at: new Date().toISOString(),
      };

      // Só adiciona image_url se houver valor
      if (imageUrl || imagePreview) {
        const finalImageUrl = imageUrl || imagePreview;
        console.log("Salvando imagem:", {
          hasImageUrl: !!imageUrl,
          hasImagePreview: !!imagePreview,
          finalImageUrlLength: finalImageUrl?.length,
          finalImageUrlStart: finalImageUrl?.substring(0, 50),
        });
        postData.image_url = finalImageUrl;
      } else {
        console.log("Nenhuma imagem fornecida");
      }

      await createPostMutation.mutateAsync(postData);

      toast.success("Post criado com sucesso!");
      setIsDialogOpen(false);
      setEditorContent("");
      setImagePreview("");
      setImageUrl("");
      setTitle("");
      setExcerpt("");
      setSelectedCategory("");
      setSelectedAuthor("");
      setIsBreaking(false);
      setIsFeatured(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar post");
    }
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input 
                  id="title" 
                  placeholder="Título da notícia" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Breve resumo da notícia..."
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  required
                />
              </div>
              
              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <TipTapEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  placeholder="Escreva o conteúdo completo da matéria..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Select 
                  value={selectedAuthor || profile?.id || ""} 
                  onValueChange={setSelectedAuthor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProfiles.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name} {author.id === profile?.id ? "(Você)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecione o autor do post. Por padrão, será usado seu nome.
                </p>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagem de Capa <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="URL da imagem ou faça upload"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
                
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImagePreview("")}
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="breaking" 
                    className="rounded" 
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                  />
                  <Label htmlFor="breaking">Marcar como notícia urgente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="featured" 
                    className="rounded" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <Label htmlFor="featured">
                    Marcar como destaque (aparece na seção "Em Destaque")
                  </Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditorContent("");
                    setImagePreview("");
                    setImageUrl("");
                    setTitle("");
                    setExcerpt("");
                    setSelectedCategory("");
                    setSelectedAuthor("");
                    setIsBreaking(false);
                    setIsFeatured(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Posts ({isLoadingPosts ? "..." : filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPosts ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Título
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Categoria
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Autor
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Destaque
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Nenhum post encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {post.image_url ? (
                              <img
                                src={post.image_url}
                                alt=""
                                className="h-10 w-16 object-cover rounded"
                              />
                            ) : (
                              <div className="h-10 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                Sem img
                              </div>
                            )}
                            <div>
                              <p className="font-medium line-clamp-1 max-w-xs">
                                {post.title}
                              </p>
                              {post.is_breaking && (
                                <span className="text-xs text-accent font-medium">
                                  Urgente
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="news-category-badge">
                            {post.categories?.name || "Sem categoria"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {post.profiles?.name || "Desconhecido"}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {post.published_at
                            ? format(new Date(post.published_at), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {post.views.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleFeatured(post)}
                              className={`group transition-colors ${
                                post.is_featured 
                                  ? "text-yellow-500" 
                                  : "text-muted-foreground hover:text-yellow-500"
                              }`}
                              title={post.is_featured ? "Remover dos destaques" : "Adicionar aos destaques"}
                            >
                              <Star 
                                className={`h-5 w-5 transition-all ${
                                  post.is_featured 
                                    ? "fill-current" 
                                    : "group-hover:fill-yellow-500"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
