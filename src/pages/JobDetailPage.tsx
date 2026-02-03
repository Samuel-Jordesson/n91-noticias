import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/SEO";
import { useJobBySlug, useIncrementJobViews } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, DollarSign, Clock, ExternalLink, Eye, ArrowLeft, Briefcase, Share2, Facebook, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const JobDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJobBySlug(slug || "");
  const incrementViewsMutation = useIncrementJobViews();

  // Incrementar visualizações quando a página carregar
  useEffect(() => {
    if (job?.id) {
      incrementViewsMutation.mutate(job.id);
    }
  }, [job?.id]);

  // Funções de compartilhamento
  const jobUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/empregos/${slug}` 
    : `https://portalbarcarena.com.br/empregos/${slug}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      toast.success("Link copiado para a área de transferência!");
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareX = () => {
    const text = `${job?.title} - ${job?.company_name}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(jobUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareWhatsApp = () => {
    const text = `${job?.title} - ${job?.company_name}\n${jobUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-6">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="container py-6">
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Vaga não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                A vaga que você está procurando não existe ou foi removida.
              </p>
              <Button onClick={() => navigate("/empregos")}>
                Voltar para Empregos
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEO
        title={`${job.title} - ${job.company_name} | Portal Barcarena - Empregos`}
        description={job.description.replace(/<[^>]*>/g, '').substring(0, 160)}
        keywords={`${job.title}, ${job.company_name}, emprego, vaga, ${job.location || ''}`}
        type="article"
      />
      <MainLayout>
        <div className="container py-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary">
                  Início
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/empregos" className="hover:text-primary">
                  Empregos
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium line-clamp-1">{job.title}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/empregos")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Empregos
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {job.image_url && (
                    <div className="w-full overflow-hidden rounded-lg mb-6 bg-muted aspect-[3/4] max-w-md mx-auto">
                      <img
                        src={job.image_url}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <header className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                      {job.title}
                    </h1>
                    <p className="text-xl font-semibold text-primary mb-4">
                      {job.company_name}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {job.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      {job.employment_type && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{job.employment_type}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{job.views || 0} visualizações</span>
                      </div>
                    </div>
                  </header>

                  <div className="prose max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: job.description }} />
                  </div>

                  {job.application_link && (
                    <div className="pt-6 border-t mb-6">
                      <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto gap-2"
                      >
                        <a
                          href={job.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Candidatar-se para esta vaga
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Share buttons */}
                  <div className="flex items-center gap-2 py-4 border-t">
                    <span className="text-sm font-medium">Compartilhar:</span>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Copiar link
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleShareFacebook} title="Compartilhar no Facebook">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleShareX} title="Compartilhar no X">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleShareWhatsApp} title="Compartilhar no WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  {job.published_at && (
                    <p className="text-sm text-muted-foreground mt-6 pt-6 border-t">
                      Publicado em {format(new Date(job.published_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Informações da Vaga</h3>
                  <div className="space-y-3">
                    {job.company_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                        <p className="text-base font-semibold">{job.company_name}</p>
                      </div>
                    )}
                    {job.location && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Localização</p>
                        <p className="text-base">{job.location}</p>
                      </div>
                    )}
                    {job.salary && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Salário</p>
                        <p className="text-base">{job.salary}</p>
                      </div>
                    )}
                    {job.employment_type && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo de Contratação</p>
                        <p className="text-base">{job.employment_type}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default JobDetailPage;
