import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import NewsCard from "@/components/NewsCard";
import AdCarousel from "@/components/AdCarousel";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { usePostsByCategory } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useMostViewedPosts } from "@/hooks/usePosts";
import { useAdsByPosition } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeSlug } from "@/lib/utils";
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

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { data: categoryPosts, isLoading } = usePostsByCategory(category || "");
  const { data: categories } = useCategories();
  const { data: mostViewed } = useMostViewedPosts(5);
  const { data: sidebarAds } = useAdsByPosition("sidebar");

  // Redirecionar categorias específicas para suas páginas dedicadas
  useEffect(() => {
    if (category === "esportes") {
      navigate("/esportes", { replace: true });
    } else if (category === "clima") {
      navigate("/clima", { replace: true });
    }
  }, [category, navigate]);

  // Normalizar o slug da URL para encontrar a categoria
  const normalizedCategorySlug = category ? normalizeSlug(category) : "";
  const currentCategory = categories?.find(
    (cat) => normalizeSlug(cat.slug) === normalizedCategorySlug
  );

  const categoryNews = categoryPosts?.map(convertPostToNewsArticle) || [];
  const mostViewedArticles = mostViewed?.map(convertPostToNewsArticle) || [];

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

  const categoryName = currentCategory?.name || category || "Categoria";
  const categoryDescription = `Notícias sobre ${categoryName} no N91. Acompanhe as últimas novidades e informações sobre ${categoryName.toLowerCase()}.`;

  return (
    <>
      <SEO
        title={`${categoryName} | N91 - Portal de Notícias`}
        description={categoryDescription}
        keywords={`${categoryName}, notícias, brasil, ${categoryName.toLowerCase()}`}
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
            <li className="text-foreground font-medium">{currentCategory?.name || category}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            {currentCategory?.name || category}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLoading ? "Carregando..." : `${categoryNews.length} notícias nesta categoria`}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : categoryNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryNews.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="animate-fade-in" 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  Nenhuma notícia encontrada nesta categoria.
                </p>
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">
                  Voltar para a página inicial
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-serif font-bold mb-4 pb-2 border-b border-border">
                  Categorias
                </h3>
                <nav className="space-y-1">
                  {categories.map((cat) => {
                    const linkPath = cat.slug === "esportes" 
                      ? "/esportes" 
                      : cat.slug === "clima"
                      ? "/clima"
                      : `/categoria/${cat.slug}`;
                    
                    return (
                      <Link
                        key={cat.id}
                        to={linkPath}
                        className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                          cat.slug === category?.toLowerCase()
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-primary hover:bg-muted"
                        }`}
                      >
                        {cat.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Sidebar Ad */}
            {sidebarAdsConverted.length > 0 && (
              <AdCarousel ads={sidebarAdsConverted} position="sidebar" />
            )}

            {/* Most Read */}
            {mostViewedArticles.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-serif font-bold mb-4 pb-2 border-b border-border">
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

export default CategoryPage;
