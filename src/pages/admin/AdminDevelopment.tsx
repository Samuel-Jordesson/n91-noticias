import { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code, Database, Terminal, FileCode, GitBranch, Bug, Bell, Image as ImageIcon, X } from "lucide-react";
import { useCreateNotification, useUploadNotificationImage } from "@/hooks/useNotifications";
import { toast } from "sonner";

const AdminDevelopment = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createNotificationMutation = useCreateNotification();
  const uploadImageMutation = useUploadNotificationImage();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    try {
      const uploadedUrl = await uploadImageMutation.mutateAsync(file);
      setImageUrl(uploadedUrl);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload da imagem");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createNotificationMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl || null,
      });

      // Limpar formulário
      setTitle("");
      setContent("");
      setImageUrl("");
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      // Erro já é tratado no hook
    }
  };

  return (
    <AdminLayout title="Desenvolvimento">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Área de Desenvolvimento</h1>
            <p className="text-muted-foreground">
              Ferramentas e informações exclusivas para desenvolvedores
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Criar Notificação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Notificação Interna</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Nova atualização disponível"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Descreva o que há de novo..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Imagem (opcional)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      id="image"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou GIF. Máximo 5MB
                    </p>
                    {imagePreview && (
                      <div className="relative mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-auto max-h-48 rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setImageUrl("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createNotificationMutation.isPending || uploadImageMutation.isPending}
                  >
                    {createNotificationMutation.isPending ? "Criando..." : "Criar Notificação"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Database Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Banco de Dados</CardTitle>
                  <CardDescription>Informações do Supabase</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Conectado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">Supabase</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">API Endpoints</CardTitle>
                  <CardDescription>Endpoints disponíveis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">REST API:</span>
                  <span className="font-medium">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GraphQL:</span>
                  <span className="font-medium text-muted-foreground">Não disponível</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Repository */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Repositório</CardTitle>
                  <CardDescription>Controle de versão</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Git:</span>
                  <span className="font-medium">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">main</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Tools */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bug className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ferramentas de Debug</CardTitle>
                  <CardDescription>Utilitários de desenvolvimento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Console do navegador disponível</p>
                <p>React DevTools habilitado</p>
              </div>
            </CardContent>
          </Card>

          {/* Environment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ambiente</CardTitle>
                  <CardDescription>Configurações do sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modo:</span>
                  <span className="font-medium">
                    {import.meta.env.MODE === 'development' ? 'Desenvolvimento' : 'Produção'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Node:</span>
                  <span className="font-medium">v18+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  <CardDescription>Ferramentas úteis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Limpar cache</p>
                <p>• Recarregar dados</p>
                <p>• Ver logs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>
              Detalhes técnicos da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Stack Tecnológico</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• React + TypeScript</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• Supabase</li>
                  <li>• React Query</li>
                  <li>• React Router</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recursos</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Editor de texto rico (TipTap)</li>
                  <li>• Sistema de autenticação</li>
                  <li>• Gerenciamento de posts</li>
                  <li>• Sistema de comentários</li>
                  <li>• Upload de imagens</li>
                  <li>• Dashboard administrativo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDevelopment;
