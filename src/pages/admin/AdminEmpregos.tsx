import { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TipTapEditor from "@/components/TipTapEditor";
import { useAllJobs, useCreateJob, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
import { useProfile } from "@/hooks/useAuth";
import { useAllProfiles } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";

const AdminEmpregos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: jobs, isLoading: isLoadingJobs } = useAllJobs();
  const { data: profile } = useProfile();
  const { data: allProfiles = [] } = useAllProfiles();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !companyName || !editorContent) {
      toast.error("Preencha todos os campos obrigatórios (Título, Empresa e Descrição)");
      return;
    }

    const authorId = selectedAuthor || profile?.id;
    
    if (!authorId) {
      toast.error("Erro: Selecione um autor ou faça login novamente.");
      return;
    }

    try {
      const jobData: any = {
        title,
        company_name: companyName,
        description: editorContent,
        application_link: applicationLink || null,
        location: location || null,
        salary: salary || null,
        employment_type: employmentType || null,
        author_id: authorId,
        is_featured: isFeatured,
        is_published: true,
        published_at: new Date().toISOString(),
      };

      if (imageUrl || imagePreview) {
        jobData.image_url = imageUrl || imagePreview;
      }

      if (editingJob) {
        await updateJobMutation.mutateAsync({ id: editingJob.id, job: jobData });
        toast.success("Emprego atualizado com sucesso!");
      } else {
        await createJobMutation.mutateAsync(jobData);
        toast.success("Emprego criado com sucesso!");
      }

      setIsDialogOpen(false);
      handleCancel();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar/atualizar emprego");
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompanyName(job.company_name);
    setEditorContent(job.description);
    setImageUrl(job.image_url || "");
    setImagePreview("");
    setApplicationLink(job.application_link || "");
    setLocation(job.location || "");
    setSalary(job.salary || "");
    setEmploymentType(job.employment_type || "");
    setIsFeatured(job.is_featured || false);
    setSelectedAuthor(job.author_id || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este emprego?")) return;

    try {
      await deleteJobMutation.mutateAsync(id);
      toast.success("Emprego excluído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir emprego");
    }
  };

  const handleToggleFeatured = async (job: any) => {
    try {
      await updateJobMutation.mutateAsync({
        id: job.id,
        job: {
          is_featured: !job.is_featured,
        },
      });
      toast.success(
        job.is_featured
          ? "Emprego removido dos destaques"
          : "Emprego adicionado aos destaques"
      );
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar emprego");
    }
  };

  const handleCancel = () => {
    setEditingJob(null);
    setEditorContent("");
    setImagePreview("");
    setImageUrl("");
    setTitle("");
    setCompanyName("");
    setApplicationLink("");
    setLocation("");
    setSalary("");
    setEmploymentType("");
    setSelectedAuthor("");
    setIsFeatured(false);
  };

  return (
    <AdminLayout title="Empregos">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Gerenciar Empregos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Crie e gerencie vagas de emprego
            </p>
          </div>
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                handleCancel();
              } else {
                if (profile?.id && !selectedAuthor) {
                  setSelectedAuthor(profile.id);
                }
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Emprego
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 w-[95vw] sm:w-full">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingJob ? "Editar Emprego" : "Criar Novo Emprego"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-2 sm:space-y-3 md:space-y-4 mt-2 sm:mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Vaga *</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Desenvolvedor Full Stack" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Ex: Tech Solutions" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição da Vaga *</Label>
                  <TipTapEditor
                    content={editorContent}
                    onChange={setEditorContent}
                    placeholder="Descreva a vaga, requisitos, benefícios..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input 
                      id="location" 
                      placeholder="Ex: São Paulo, SP" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Salário</Label>
                    <Input 
                      id="salary" 
                      placeholder="Ex: R$ 5.000 - R$ 8.000" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Tipo de Contratação</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLT">CLT</SelectItem>
                        <SelectItem value="PJ">PJ</SelectItem>
                        <SelectItem value="Estágio">Estágio</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Temporário">Temporário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationLink">Link de Candidatura</Label>
                    <Input 
                      id="applicationLink" 
                      type="url"
                      placeholder="https://..." 
                      value={applicationLink}
                      onChange={(e) => setApplicationLink(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
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

                <div className="space-y-2">
                  <Label>Imagem da Vaga <span className="text-muted-foreground text-xs">(opcional)</span></Label>
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
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
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Destacar este emprego
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={createJobMutation.isPending || updateJobMutation.isPending}>
                    {editingJob ? "Atualizar" : "Criar"} Emprego
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      handleCancel();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {isLoadingJobs ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum emprego encontrado" : "Nenhum emprego cadastrado ainda"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {job.image_url && (
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={job.image_url}
                          alt={job.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg line-clamp-1">{job.title}</h3>
                            {job.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {job.company_name}
                            {job.location && ` • ${job.location}`}
                            {job.salary && ` • ${job.salary}`}
                            {job.employment_type && ` • ${job.employment_type}`}
                          </p>
                          <div className="text-xs text-muted-foreground mb-2">
                            {job.published_at
                              ? format(new Date(job.published_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              : "Não publicado"}
                            {job.profiles && ` • ${job.profiles.name}`}
                            {` • ${job.views || 0} visualizações`}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(job)}
                            title={job.is_featured ? "Remover destaque" : "Destacar"}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                job.is_featured ? "text-yellow-500 fill-yellow-500" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(job)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {job.application_link && (
                        <a
                          href={job.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Ver vaga <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmpregos;
