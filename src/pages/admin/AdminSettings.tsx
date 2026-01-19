import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSetting, useUploadLogo } from "@/hooks/useSettings";
import { useRef, useState } from "react";
import { 
  ImageIcon, 
  Upload, 
  Globe, 
  Settings as SettingsIcon, 
  Search,
  Save,
  Sparkles
} from "lucide-react";

const AdminSettings = () => {
  const { data: logoUrl, isLoading: isLoadingLogo } = useSetting('site_logo');
  const uploadLogoMutation = useUploadLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    try {
      await uploadLogoMutation.mutateAsync(file);
      toast.success("Logo atualizada com sucesso!");
      setLogoPreview(""); // Limpar preview após sucesso
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer upload da logo");
      setLogoPreview("");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6 max-w-4xl">
        {/* Logo Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Logo do Site</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Personalize a identidade visual do portal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Preview */}
              <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-border bg-muted/30">
                {(logoPreview || logoUrl) ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={logoPreview || logoUrl || '/imagens/Logo.png'}
                      alt="Logo do site"
                      className="h-20 w-auto object-contain max-w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Preview da logo atual
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="p-4 rounded-full bg-muted">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <p className="text-sm">Nenhuma logo configurada</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLogoMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploadLogoMutation.isPending ? "Enviando..." : "Escolher Nova Logo"}
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setLogoPreview("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos: PNG, JPG, SVG • Tamanho máximo: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Site Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Informações do Site</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Dados básicos do portal de notícias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-sm font-medium">
                  Nome do Site
                </Label>
                <Input 
                  id="siteName" 
                  defaultValue="N91"
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="siteDescription"
                  defaultValue="O portal de notícias mais completo do Brasil"
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  Email de Contato
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  defaultValue="contato@n91.com"
                  className="h-10"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Recursos</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Ative ou desative funcionalidades do portal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Comentários</Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir comentários nas notícias
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Anúncios</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibir anúncios no portal
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Newsletter</Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir inscrição na newsletter
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Compartilhamento Social</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibir botões de compartilhamento
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">SEO</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Otimização para mecanismos de busca
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-sm font-medium">
                  Título Meta
                </Label>
                <Input
                  id="metaTitle"
                  defaultValue="N91 - Portal de Notícias"
                  maxLength={60}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de 60 caracteres
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-sm font-medium">
                  Descrição Meta
                </Label>
                <Textarea
                  id="metaDescription"
                  defaultValue="Notícias atualizadas 24 horas. Economia, política, esportes, tecnologia e muito mais."
                  rows={2}
                  maxLength={160}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de 160 caracteres
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords" className="text-sm font-medium">
                  Palavras-chave
                </Label>
                <Input
                  id="keywords"
                  defaultValue="notícias, brasil, economia, política, esportes"
                  className="h-10"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
