import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSetting, useUploadLogo } from "@/hooks/useSettings";
import { useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";

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
      <div className="grid gap-6 max-w-2xl">
        {/* Site Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Site</CardTitle>
            <CardDescription>
              Informações gerais do portal de notícias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo do Site</Label>
                <div className="flex flex-col gap-4">
                  {/* Preview da logo atual */}
                  <div className="flex items-center gap-4">
                    {(logoPreview || logoUrl) && (
                      <div className="relative">
                        <img
                          src={logoPreview || logoUrl || '/imagens/Logo.png'}
                          alt="Logo do site"
                          className="h-16 w-auto object-contain border border-border rounded p-2 bg-muted"
                        />
                      </div>
                    )}
                    {!logoPreview && !logoUrl && !isLoadingLogo && (
                      <div className="h-16 w-32 border border-border rounded p-2 bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Botão de upload */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
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
                        size="sm"
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
                    Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 5MB
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input id="siteName" defaultValue="Portal Barcarena" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição</Label>
                <Textarea
                  id="siteDescription"
                  defaultValue="Últimas notícias de Barcarena"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contato</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  defaultValue="contato@portalbarcarena.com.br"
                />
              </div>
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos</CardTitle>
            <CardDescription>
              Ative ou desative recursos do portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Comentários</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir comentários nas notícias
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Anúncios</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir anúncios no portal
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir inscrição na newsletter
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compartilhamento Social</Label>
                <p className="text-sm text-muted-foreground">
                  Exibir botões de compartilhamento
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              Configurações de otimização para buscadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Título Meta</Label>
                <Input
                  id="metaTitle"
                  defaultValue="Portal Barcarena - Últimas notícias de Barcarena"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de 60 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Descrição Meta</Label>
                <Textarea
                  id="metaDescription"
                  defaultValue="Notícias atualizadas 24 horas. Economia, política, esportes, tecnologia e muito mais."
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de 160 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Palavras-chave</Label>
                <Input
                  id="keywords"
                  defaultValue="notícias, brasil, economia, política, esportes"
                />
              </div>
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
