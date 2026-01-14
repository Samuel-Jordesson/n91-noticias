import { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useAllAds, useCreateAd, useUpdateAd, useDeleteAd } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";

const adPositionSpecs = {
  sidebar: {
    label: "Sidebar",
    width: 300,
    height: 250,
    description: "Exibido na barra lateral direita das páginas",
  },
  banner: {
    label: "Banner Superior",
    width: 728,
    height: 90,
    description: "Exibido no topo das páginas",
  },
  inline: {
    label: "Inline",
    width: 728,
    height: 90,
    description: "Exibido entre o conteúdo dos artigos",
  },
};

const AdminAds = () => {
  const { data: ads = [], isLoading } = useAllAds();
  const createAdMutation = useCreateAd();
  const updateAdMutation = useUpdateAd();
  const deleteAdMutation = useDeleteAd();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleActive = async (id: string) => {
    const ad = ads.find(a => a.id === id);
    if (!ad) return;

    try {
      await updateAdMutation.mutateAsync({
        id,
        ad: { is_active: !ad.is_active },
      });
      toast.success("Status do anúncio atualizado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar anúncio");
    }
  };

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

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !selectedPosition || !link || (!imageUrl && !imagePreview)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const adData: any = {
        title,
        position: selectedPosition as 'sidebar' | 'banner' | 'inline',
        image_url: imageUrl || imagePreview,
        link,
        is_active: isActive,
      };

      if (editingAd) {
        await updateAdMutation.mutateAsync({
          id: editingAd.id,
          ad: adData,
        });
        toast.success("Anúncio atualizado com sucesso!");
      } else {
        await createAdMutation.mutateAsync(adData);
        toast.success("Anúncio criado com sucesso!");
      }

      setIsDialogOpen(false);
      setImagePreview("");
      setSelectedPosition("");
      setTitle("");
      setImageUrl("");
      setLink("");
      setIsActive(true);
      setEditingAd(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar anúncio");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;

    try {
      await deleteAdMutation.mutateAsync(id);
      toast.success("Anúncio excluído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir anúncio");
    }
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setSelectedPosition(ad.position);
    setImageUrl(ad.image_url || "");
    setLink(ad.link);
    setIsActive(ad.is_active);
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingAd(null);
    setImagePreview("");
    setSelectedPosition("");
    setTitle("");
    setImageUrl("");
    setLink("");
    setIsActive(true);
  };

  const getPositionSpec = (position: string) => {
    return adPositionSpecs[position as keyof typeof adPositionSpecs];
  };

  // Group ads by position
  const adsByPosition = {
    sidebar: ads.filter(ad => ad.position === "sidebar"),
    banner: ads.filter(ad => ad.position === "banner"),
    inline: ads.filter(ad => ad.position === "inline"),
  };

  return (
    <AdminLayout title="Gerenciar Anúncios">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Gerencie os anúncios exibidos no portal. Os anúncios são exibidos em formato de slider automático.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Novo Anúncio</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base sm:text-lg md:text-xl">{editingAd ? "Editar Anúncio" : "Criar Novo Anúncio"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAd} className="space-y-2 sm:space-y-3 md:space-y-4 mt-2 sm:mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio</Label>
                <Input
                  id="title"
                  placeholder="Nome identificador"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Posição</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar posição" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(adPositionSpecs).map(([key, spec]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{spec.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {spec.width}x{spec.height}px
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedPosition && (
                  <div className="bg-muted rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        Tamanho recomendado: {getPositionSpec(selectedPosition)?.width}x{getPositionSpec(selectedPosition)?.height}px
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getPositionSpec(selectedPosition)?.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Imagem do Anúncio</Label>
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
                      className="w-full max-h-40 object-cover rounded-lg border border-border"
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

              <div className="space-y-2">
                <Label htmlFor="link">Link de Destino</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createAdMutation.isPending || updateAdMutation.isPending}
                >
                  {editingAd ? "Atualizar" : "Criar"} Anúncio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Position Specs Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        {Object.entries(adPositionSpecs).map(([key, spec]) => (
          <Card key={key} className="bg-muted/50 overflow-hidden">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-xs sm:text-sm md:text-base truncate">{spec.label}</h4>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                    {spec.width} x {spec.height}px
                  </p>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5">
                    {adsByPosition[key as keyof typeof adsByPosition]?.length || 0} anúncios ativos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ads by Position */}
      {Object.entries(adsByPosition).map(([position, positionAds]) => (
        <div key={position} className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate">{adPositionSpecs[position as keyof typeof adPositionSpecs]?.label}</span>
            <span className="text-[10px] sm:text-xs md:text-sm font-normal text-muted-foreground">
              ({positionAds.length} anúncios - slider automático a cada 5s)
            </span>
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full mb-4" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : positionAds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum anúncio nesta posição ainda.</p>
              <p className="text-sm mt-2">Clique em "Novo Anúncio" para criar um.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionAds.map((ad) => (
                <Card key={ad.id} className={!ad.is_active ? "opacity-60" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{ad.title}</CardTitle>
                      <Switch
                        checked={ad.is_active}
                        onCheckedChange={() => handleToggleActive(ad.id)}
                        disabled={updateAdMutation.isPending}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                      {ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-muted-foreground text-sm">Imagem não disponível</span></div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Sem imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tamanho:</span>
                        <span className="font-medium">
                          {adPositionSpecs[ad.position as keyof typeof adPositionSpecs]?.width}x
                          {adPositionSpecs[ad.position as keyof typeof adPositionSpecs]?.height}px
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span
                          className={`font-medium ${
                            ad.is_active ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {ad.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={ad.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ver Link
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleteAdMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminAds;
