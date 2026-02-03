import { useParams, Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import SEO from "@/components/SEO";
import { useProfileById } from "@/hooks/useUsers";
import { useAllPosts } from "@/hooks/usePosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import NewsCard from "@/components/NewsCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateSlug } from "@/lib/utils";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostWithCategory } from "@/services/posts";
import type { NewsArticle } from "@/types/news";

// Converter post do Supabase para NewsArticle
const convertPostToNewsArticle = (post: PostWithCategory): NewsArticle => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.image_url,
    category: post.categories?.name || "Geral",
    author: post.profiles?.name || "Desconhecido",
    publishedAt: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
    isBreaking: post.is_breaking,
    views: post.views || 0,
  };
};

const AuthorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading: isLoadingProfile } = useProfileById(id);
  const { data: allPosts, isLoading: isLoadingPosts } = useAllPosts();

  // Filtrar posts do autor
  const authorPosts = allPosts?.filter(post => post.author_id === id && post.is_published) || [];
  const authorNews = authorPosts.map(convertPostToNewsArticle);

  // Processar redes sociais
  const socialLinks = profile?.social_links && typeof profile.social_links === 'object' 
    ? profile.social_links as Record<string, string>
    : {};

  const socialIcons: Record<string, { icon: any; label: string }> = {
    facebook: { icon: Facebook, label: "Facebook" },
    twitter: { icon: Twitter, label: "Twitter/X" },
    instagram: { icon: Instagram, label: "Instagram" },
    linkedin: { icon: Linkedin, label: "LinkedIn" },
    youtube: { icon: Youtube, label: "YouTube" },
    website: { icon: Globe, label: "Website" },
  };

  // Pegar até 3 redes sociais
  const activeSocialLinks = Object.entries(socialLinks)
    .filter(([_, url]) => url && url.trim() !== "")
    .slice(0, 3)
    .map(([platform, url]) => ({
      platform,
      url,
      ...socialIcons[platform],
    }));

  if (isLoadingProfile) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Autor não encontrado</h1>
            <Link to="/">
              <Button>Voltar para o início</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEO
        title={`${profile.name} | Portal Barcarena`}
        description={profile.bio || `Perfil de ${profile.name} no Portal Barcarena`}
      />
      <MainLayout>
        <div className="container py-6">
          <div className="max-w-4xl mx-auto">
            {/* Botão Voltar */}
            <Link to="/">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>

            {/* Perfil do Autor */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold border-4 border-primary/20">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                    {profile.bio && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">{profile.bio}</p>
                    )}
                    
                    {/* Redes Sociais */}
                    {activeSocialLinks.length > 0 && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {activeSocialLinks.map(({ platform, url, icon: Icon, label }) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            title={label}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm hidden sm:inline">{label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts do Autor */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Posts de {profile.name} ({authorNews.length})
              </h2>

              {isLoadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : authorNews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Este autor ainda não publicou nenhum post.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {authorNews.map((article) => (
                    <NewsCard key={article.id} article={article} variant="default" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default AuthorProfilePage;
