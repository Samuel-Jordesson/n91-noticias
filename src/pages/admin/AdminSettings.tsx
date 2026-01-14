import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AdminSettings = () => {
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
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input id="siteName" defaultValue="N91" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição</Label>
                <Textarea
                  id="siteDescription"
                  defaultValue="O portal de notícias mais completo do Brasil"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contato</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  defaultValue="contato@n91.com"
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
                  defaultValue="N91 - Portal de Notícias"
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
