import MainLayout from "@/layouts/MainLayout";
import NewsCard from "@/components/NewsCard";
import AdCarousel from "@/components/AdCarousel";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { usePostsByCategory } from "@/hooks/usePosts";
import { useAdsByPosition } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Timer, TrendingUp } from "lucide-react";
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
    views: post.views,
  };
};

const SportsPage = () => {
  const { data: sportsPosts, isLoading } = usePostsByCategory("esportes");
  const { data: sidebarAds } = useAdsByPosition("sidebar");
  const { data: bannerAds } = useAdsByPosition("banner");
  const { data: inlineAds } = useAdsByPosition("inline");

  const sportsNews = sportsPosts?.map(convertPostToNewsArticle) || [];
  const featuredSport = sportsNews[0];
  const otherSports = sportsNews.slice(1);

  // Converter ads
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

  // Mock live scores
  const liveScores = [
    { home: "Flamengo", away: "Palmeiras", homeScore: 2, awayScore: 1, time: "78'" },
    { home: "São Paulo", away: "Corinthians", homeScore: 0, awayScore: 0, time: "45'" },
    { home: "Santos", away: "Grêmio", homeScore: 1, awayScore: 2, time: "90+3'" },
  ];

  return (
    <>
      <SEO
        title="Esportes | Portal Barcarena - Últimas notícias de Barcarena"
        description="Acompanhe as últimas notícias de esportes no Brasil e no mundo. Futebol, basquete, vôlei, tênis e muito mais. Notícias esportivas atualizadas 24 horas."
        keywords="esportes, futebol, basquete, vôlei, tênis, notícias esportivas, brasil, copa do mundo, campeonato brasileiro"
        type="website"
      />
      <MainLayout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Esportes</h1>
          </div>

          {/* Live Scores Ticker */}
          <div className="bg-card p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold uppercase tracking-wider text-foreground">Ao Vivo</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveScores.map((match, index) => (
                <div
                  key={index}
                  className="bg-muted/50 p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{match.home}</p>
                      <p className="text-sm font-medium text-foreground">{match.away}</p>
                    </div>
                    <div className="text-center ml-4">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                        <Timer className="h-3 w-3" />
                        {match.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Article */}
          {isLoading ? (
            <Skeleton className="h-96 w-full mb-8" />
          ) : featuredSport ? (
            <div className="mb-8">
              <NewsCard article={featuredSport} variant="featured" />
            </div>
          ) : null}
        </div>

        {/* Ad Banner */}
        {bannerAdsConverted.length > 0 && (
          <AdCarousel ads={bannerAdsConverted} position="banner" autoPlayInterval={5000} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-serif font-bold">Últimas Notícias</h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : otherSports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherSports.map((article, index) => (
                  <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground col-span-2 text-center py-8">
                Nenhuma outra notícia de esportes disponível no momento.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-serif font-bold mb-4 pb-2 border-b border-border flex items-center gap-2">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                Classificação
              </h3>
              <div className="space-y-1">
                {["Flamengo", "Palmeiras", "Atlético-MG", "São Paulo", "Fluminense"].map(
                  (team, index) => (
                    <div
                      key={team}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors rounded-md px-2 -mx-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-md bg-muted text-foreground text-xs flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{team}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        {65 - index * 4} pts
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Sidebar Ad */}
            {sidebarAdsConverted.length > 0 && (
              <AdCarousel ads={sidebarAdsConverted} position="sidebar" />
            )}
          </aside>
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default SportsPage;
