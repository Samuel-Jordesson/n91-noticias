import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/SEO";
import { useJobs } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Briefcase, MapPin, DollarSign, Clock, Eye } from "lucide-react";

const JobsPage = () => {
  const { data: jobs, isLoading } = useJobs();

  return (
    <>
      <SEO
        title="Empregos | N91 - Portal de Notícias"
        description="Encontre as melhores oportunidades de emprego. Vagas atualizadas diariamente em diversas áreas e localidades."
        keywords="empregos, vagas, oportunidades, trabalho, carreira, N91"
        type="website"
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
              <li className="text-foreground font-medium">Empregos</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              Empregos
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? "Carregando..." : `${jobs?.length || 0} vagas disponíveis`}
            </p>
          </header>

          {/* Jobs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link key={job.id} to={`/empregos/${job.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col max-w-md mx-auto">
                    {job.image_url && (
                      <div className="w-full bg-muted" style={{ paddingBottom: 'calc(133.33% * 0.6)', position: 'relative' }}>
                        <div className="absolute inset-0 w-full aspect-[3/4] scale-[0.6] origin-top overflow-hidden">
                          <img
                            src={job.image_url}
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 line-clamp-2">{job.title}</h3>
                          <p className="text-sm font-semibold text-primary mb-2">{job.company_name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {job.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{job.location}</span>
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4 flex-shrink-0" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.employment_type && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{job.employment_type}</span>
                          </div>
                        )}
                      </div>

                      <div 
                        className="text-sm text-muted-foreground mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ 
                          __html: job.description.substring(0, 150) + (job.description.length > 150 ? '...' : '')
                        }}
                      />

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{job.views || 0} visualizações</span>
                        </div>
                        {job.application_link && (
                          <span className="text-xs text-primary font-medium">
                            Candidatar-se →
                          </span>
                        )}
                      </div>

                      {job.published_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Publicado em {format(new Date(job.published_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Nenhuma vaga disponível</h2>
                <p className="text-muted-foreground">
                  Não há vagas de emprego cadastradas no momento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default JobsPage;
