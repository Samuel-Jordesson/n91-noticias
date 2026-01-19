import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Image as ImageIcon, ArrowLeft, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { toast } from "sonner";
import TipTapEditor from "@/components/TipTapEditor";
import { usePost, useCreatePost, useUpdatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useAuth";
import { useAllProfiles } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";

const AdminEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("editorSidebarOpen");
    return saved !== "false"; // Default: aberto
  });
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

  const { data: post, isLoading: isLoadingPost } = usePost(id || "");
  const { data: categories } = useCategories();
  const { data: profile } = useProfile();
  const { data: allProfiles = [] } = useAllProfiles();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  // Salvar estado do sidebar no localStorage
  useEffect(() => {
    localStorage.setItem("editorSidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

  // Carregar dados do post quando estiver editando
  useEffect(() => {
    if (isEditing && post) {
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setEditorContent(post.content);
      setImageUrl(post.image_url || "");
      setImagePreview("");
      setSelectedCategory(post.categories?.name || "");
      setSelectedAuthor(post.author_id || "");
      setIsBreaking(post.is_breaking || false);
      setIsFeatured(post.is_featured || false);
    } else if (!isEditing) {
      // Inicializar com o perfil do usuário logado quando criar novo post
      if (profile?.id && !selectedAuthor) {
        setSelectedAuthor(profile.id);
      }
    }
  }, [post, isEditing, profile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        author_id: authorId,
        is_breaking: isBreaking,
        is_featured: isFeatured,
        is_published: true,
      };

      // Só adiciona published_at se for um novo post
      if (!isEditing) {
        postData.published_at = new Date().toISOString();
      }

      // Só adiciona image_url se houver valor
      if (imageUrl || imagePreview) {
        const finalImageUrl = imageUrl || imagePreview;
        postData.image_url = finalImageUrl;
      } else if (isEditing && !imageUrl && !imagePreview) {
        // Se estiver editando e não houver nova imagem, manter a imagem existente
        postData.image_url = post?.image_url || null;
      }

      if (isEditing && id) {
        await updatePostMutation.mutateAsync({ id, post: postData });
        toast.success("Post atualizado com sucesso!");
      } else {
        await createPostMutation.mutateAsync(postData);
        toast.success("Post criado com sucesso!");
      }

      // Navegar de volta para a lista de posts
      navigate("/admin/posts");
    } catch (error: any) {
      toast.error(error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} post`);
    }
  };

  if (isEditing && isLoadingPost) {
    return (
      <AdminLayout title="Editor">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Editar Post" : "Novo Post"}>
      <div className="flex gap-4 min-h-[calc(100vh-180px)]">
        {/* Menu Lateral */}
        <aside
          className={`bg-card border-r border-border transition-all duration-300 overflow-y-auto ${
            sidebarOpen ? "w-80" : "w-0"
          } ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} flex-shrink-0`}
        >
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Resumo */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo *</Label>
              <Textarea
                id="excerpt"
                placeholder="Breve resumo da notícia..."
                rows={4}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
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

            {/* Autor */}
            <div className="space-y-2">
              <Label htmlFor="author">Autor *</Label>
              <Select 
                value={selectedAuthor || ""} 
                onValueChange={(value) => {
                  setSelectedAuthor(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={profile?.name || "Selecionar autor"} />
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
                {selectedAuthor 
                  ? `Autor selecionado: ${allProfiles.find(p => p.id === selectedAuthor)?.name || "Desconhecido"}`
                  : `Por padrão, será usado: ${profile?.name || "seu nome"}`}
              </p>
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Imagem de Capa <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="URL da imagem"
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
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {(imagePreview || (isEditing && post?.image_url && !imagePreview && !imageUrl)) && (
                <div className="mt-2 relative">
                  <img
                    src={imagePreview || post?.image_url}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg border border-border"
                  />
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImagePreview("")}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="breaking" 
                  className="rounded" 
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                />
                <Label htmlFor="breaking" className="cursor-pointer text-sm">
                  Marcar como notícia urgente
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  className="rounded" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <Label htmlFor="featured" className="cursor-pointer text-sm">
                  Marcar como destaque (aparece na seção "Em Destaque")
                </Label>
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header com botão voltar e toggle sidebar */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/posts")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">
                {isEditing ? "Editar Post" : "Criar Novo Post"}
              </h1>
            </div>
            {!sidebarOpen && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="flex-shrink-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Formulário Principal */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 min-h-0">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input 
                    id="title" 
                    placeholder="Título da notícia" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>
                
                {/* Rich Text Editor */}
                <div className="space-y-2 flex-1 flex flex-col min-h-0">
                  <Label>Conteúdo *</Label>
                  <div className="flex-1 min-h-0">
                    <TipTapEditor
                      content={editorContent}
                      onChange={setEditorContent}
                      placeholder="Escreva o conteúdo completo da matéria..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/posts")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {createPostMutation.isPending || updatePostMutation.isPending 
                      ? (isEditing ? "Atualizando..." : "Publicando...") 
                      : (isEditing ? "Atualizar Post" : "Publicar Post")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEditor;
