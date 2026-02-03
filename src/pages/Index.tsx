import MainLayout from "@/layouts/MainLayout";
import NewsCard from "@/components/NewsCard";
import AdCarousel from "@/components/AdCarousel";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Link } from "react-router-dom";
import { Trophy, Cloud, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePosts, useMostViewedPosts, useFeaturedPosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useAdsByPosition } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";
import { generateSlug } from "@/lib/utils";
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
    authorId: post.author_id || undefined,
    publishedAt: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
    isBreaking: post.is_breaking,
    views: post.views,
  };
};

const Index = () => {
  const { data: posts, isLoading: isLoadingPosts } = usePosts();
  const { data: mostViewed } = useMostViewedPosts(5);
  const { data: featuredPosts } = useFeaturedPosts(4);
  const { data: categories } = useCategories();
  const { data: sidebarAds } = useAdsByPosition("sidebar");
  const { data: bannerAds } = useAdsByPosition("banner");
  const { data: inlineAds } = useAdsByPosition("inline");

  // Converter posts para NewsArticle
  const newsArticles = posts?.map(convertPostToNewsArticle) || [];
  const mostViewedArticles = mostViewed?.map(convertPostToNewsArticle) || [];
  const featuredArticles = featuredPosts?.map(convertPostToNewsArticle) || [];

  const featuredNews = newsArticles[0];
  const topNews = newsArticles.slice(1, 5); // 4 notícias para o grid
  const latestNews = newsArticles.slice(5);

  // Converter ads do Supabase para o formato esperado
  const convertAds = (ads: any[]) => {
    return ads?.map(ad => ({
      id: ad.id,
      title: ad.title,
      imageUrl: ad.image_url,
      link: ad.link,
      position: ad.position,
      isActive: ad.is_active,
    })) || [];
  };

  const sidebarAdsConverted = convertAds(sidebarAds || []);
  const bannerAdsConverted = convertAds(bannerAds || []);
  const inlineAdsConverted = convertAds(inlineAds || []);

  if (isLoadingPosts) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="space-y-8">
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!featuredNews) {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-serif font-bold mb-4">Nenhuma notícia publicada ainda</h2>
            <p className="text-muted-foreground">Crie seu primeiro post na área administrativa!</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEO
        title="Portal Barcarena - Últimas notícias de Barcarena"
        description="Portal Barcarena - Últimas notícias de Barcarena. Informação de qualidade, atualizada 24 horas sobre política, economia, esportes, tecnologia, ciência, cultura e muito mais."
        keywords="notícias, brasil, economia, política, esportes, tecnologia, ciência, cultura, educação, saúde, internacional, notícias 24h, jornalismo brasileiro"
        type="website"
      />
      <StructuredData type="WebSite" />
      <MainLayout>
      <div className="container py-4 md:py-6 px-4 md:px-6">
        {/* Main Hero Section - Layout inspirado no G1 e agênciaBrasil */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8 lg:items-end">
          {/* Featured Article - Grande à esquerda */}
          <div className="lg:col-span-3 flex flex-col">
            <section className="animate-fade-in mb-4 md:mb-6">
              <NewsCard article={featuredNews} variant="featured" />
            </section>
            
            {/* Notícias Rápidas - Alinhadas embaixo com os posts da direita */}
            {newsArticles.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-auto">
                {newsArticles
                  .filter(article => article.id !== featuredNews.id)
                  .slice(2, 4)
                  .map((article, index) => (
                    <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <Link to={`/noticia/${generateSlug(article.title)}`} className="block group h-full">
                        <article className="h-full p-3 md:p-4 hover:bg-muted/30 transition-all">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="news-category-badge text-[10px] px-2 py-0.5">
                              {article.category}
                            </span>
                            {article.isBreaking && (
                              <span className="text-[10px] md:text-xs font-bold text-destructive">Urgente</span>
                            )}
                          </div>
                          <h3 className="text-xs md:text-sm font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground flex-wrap">
                            <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true, locale: ptBR })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.views.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </article>
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Grid de 4 artigos menores à direita (2x2) - Oculto em mobile, visível em desktop */}
          <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-4">
            {topNews.slice(0, 4).map((article, index) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <NewsCard article={article} variant="default" />
              </div>
            ))}
          </div>
        </div>

        {/* Banner Ad Carousel */}
        {bannerAdsConverted.length > 0 && (
          <AdCarousel ads={bannerAdsConverted} position="banner" autoPlayInterval={5000} />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Latest News List Style */}
            {latestNews.length > 0 && (
              <section className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4 pb-2 border-b border-border">
                  Últimas Notícias
                </h2>
                <div className="bg-card overflow-hidden">
                  {latestNews.map((article, index) => (
                    <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <NewsCard article={article} variant="list" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inline Ad Carousel */}
            {inlineAdsConverted.length > 0 && (
              <div className="mb-6 md:mb-8">
                <AdCarousel ads={inlineAdsConverted} position="inline" />
              </div>
            )}

            {/* Em Destaque Section */}
            {featuredArticles.length > 0 && (
              <section className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-serif font-bold mb-3 md:mb-4 pb-2 border-b border-border">
                  Em Destaque
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {featuredArticles.map((article, index) => (
                    <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 md:space-y-6">
            {/* Special Categories */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <Link
                to="/esportes"
                className="group bg-card p-3 md:p-4 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center space-y-1.5 md:space-y-2">
                  <div className="p-1.5 md:p-2 bg-emerald-50 dark:bg-emerald-950/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 transition-colors">
                    <Trophy className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors">Esportes</span>
                </div>
              </Link>
              <Link
                to="/clima"
                className="group bg-card p-3 md:p-4 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center space-y-1.5 md:space-y-2">
                  <div className="p-1.5 md:p-2 bg-sky-50 dark:bg-sky-950/20 group-hover:bg-sky-100 dark:group-hover:bg-sky-950/30 transition-colors">
                    <Cloud className="h-4 w-4 md:h-5 md:w-5 text-sky-600 dark:text-sky-500" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors">Clima</span>
                </div>
              </Link>
            </div>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="bg-card p-3 md:p-4">
                <h3 className="font-serif font-bold text-sm md:text-base mb-3 md:mb-4 pb-2 border-b border-border">
                  Categorias
                </h3>
                <nav className="space-y-0.5 md:space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={
                        category.slug === "esportes"
                          ? "/esportes"
                          : category.slug === "clima"
                          ? "/clima"
                          : `/categoria/${category.slug}`
                      }
                      className="block py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Sidebar Ad Carousel */}
            {sidebarAdsConverted.length > 0 && (
              <div className="hidden lg:block">
                <AdCarousel ads={sidebarAdsConverted} position="sidebar" />
              </div>
            )}

            {/* Most Read */}
            {mostViewedArticles.length > 0 && (
              <div className="bg-card p-3 md:p-4">
                <h3 className="font-serif font-bold text-sm md:text-base mb-3 md:mb-4 pb-2 border-b border-border">
                  Mais Lidas
                </h3>
                <div className="space-y-0">
                  {mostViewedArticles.map((article) => (
                    <NewsCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default Index;
