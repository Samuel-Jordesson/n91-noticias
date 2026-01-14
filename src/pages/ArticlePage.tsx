import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import CommentSection from "@/components/CommentSection";
import AdCarousel from "@/components/AdCarousel";
import NewsCard from "@/components/NewsCard";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { usePostBySlug, usePostsByCategory, useIncrementViews } from "@/hooks/usePosts";
import { generateSlug } from "@/lib/utils";
import { usePostComments } from "@/hooks/useComments";
import { useAdsByPosition } from "@/hooks/useAds";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Clock, User, Share2, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PostWithCategory } from "@/services/posts";
import type { NewsArticle, Comment } from "@/types/news";
import type { Database } from "@/integrations/supabase/types";

type CommentRow = Database['public']['Tables']['comments']['Row'];

// Converter comentário do Supabase para Comment
const convertComment = (comment: CommentRow): Comment => {
  return {
    id: comment.id,
    articleId: comment.post_id,
    author: comment.author_name,
    content: comment.content,
    createdAt: new Date(comment.created_at),
    likes: comment.likes || 0,
  };
};

// Converter post do Supabase para NewsArticle
const convertPostToNewsArticle = (post: PostWithCategory): NewsArticle => {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.image_url && post.image_url.trim() !== "" ? post.image_url : undefined,
    category: post.categories?.name || "Geral",
    author: post.profiles?.name || "Desconhecido",
    publishedAt: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
    isBreaking: post.is_breaking,
    views: post.views,
  };
};

const ArticlePage = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = usePostBySlug(slug || "");
  const incrementViews = useIncrementViews();

  // Incrementar visualizações quando a página carregar
  useEffect(() => {
    if (post?.id) {
      incrementViews.mutate(post.id);
    }
  }, [post?.id]);

  // Buscar comentários usando o ID do post
  const { data: comments } = usePostComments(post?.id || "");

  // Buscar posts relacionados da mesma categoria
  const categorySlug = post?.categories?.slug;
  const { data: categoryPosts } = usePostsByCategory(categorySlug || "");
  const relatedPosts = categoryPosts
    ?.filter((p) => p.id !== id && p.is_published)
    .slice(0, 7) || [];

  const article = post ? convertPostToNewsArticle(post) : null;
  const relatedNews = relatedPosts.map(convertPostToNewsArticle);
  const articleComments = comments?.map(convertComment) || [];

  // Debug: verificar se a imagem está sendo recuperada
  useEffect(() => {
    if (post) {
      console.log("Post data:", {
        id: post.id,
        title: post.title,
        image_url: post.image_url,
        image_url_type: typeof post.image_url,
        image_url_length: post.image_url?.length,
      });
    }
  }, [post]);

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
  const inlineAdsConverted = convertAds(inlineAds || []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-6">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Notícia não encontrada</h1>
          <Link to="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareX = () => {
    const text = encodeURIComponent(article.title);
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article.title} - ${window.location.href}`);
    const shareUrl = `https://wa.me/?text=${text}`;
    window.open(shareUrl, "_blank");
  };

  const articleUrl = typeof window !== "undefined" ? window.location.href : "";
  const articleImage = article.imageUrl || "";
  const publishedTimeISO = article.publishedAt.toISOString();
  const modifiedTimeISO = post?.updated_at ? new Date(post.updated_at).toISOString() : publishedTimeISO;

  return (
    <>
      <SEO
        title={`${article.title} | N91`}
        description={article.excerpt || article.title}
        image={articleImage}
        type="article"
        publishedTime={publishedTimeISO}
        modifiedTime={modifiedTimeISO}
        author={article.author}
        category={article.category}
        keywords={`${article.category}, notícias, brasil, ${article.title}`}
        canonicalUrl={articleUrl}
      />
      <StructuredData
        type="NewsArticle"
        title={article.title}
        description={article.excerpt || article.title}
        image={articleImage}
        publishedTime={publishedTimeISO}
        modifiedTime={modifiedTimeISO}
        author={{ name: article.author }}
        category={article.category}
        keywords={`${article.category}, notícias, brasil`}
      />
      <MainLayout>
        <article className="container py-6">
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
              <Link
                to={`/categoria/${article.category.toLowerCase()}`}
                className="hover:text-primary"
              >
                {article.category}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="news-category-badge">{article.category}</span>
                {article.isBreaking && (
                  <span className="breaking-badge">🔴 Urgente</span>
                )}
              </div>

              <h1 className="news-headline text-3xl md:text-4xl mb-4">
                {article.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(article.publishedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views.toLocaleString("pt-BR")} visualizações
                </span>
              </div>

              {/* Share buttons */}
              <div className="flex items-center gap-2 py-4">
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
            </header>

            {/* Featured Image */}
            {article.imageUrl && (
              <figure className="mb-8">
                <div className="w-full aspect-video overflow-hidden rounded-lg bg-muted relative">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onLoad={() => {
                      console.log("Imagem carregada com sucesso:", article.imageUrl);
                    }}
                    onError={(e) => {
                      console.error("Erro ao carregar imagem:", {
                        src: article.imageUrl,
                        error: e,
                      });
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.error-placeholder')) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-placeholder w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 absolute inset-0';
                        errorDiv.innerHTML = '<span class="text-muted-foreground text-sm">Imagem não disponível</span>';
                        parent.appendChild(errorDiv);
                      }
                    }}
                  />
                </div>
                <figcaption className="text-sm text-muted-foreground mt-2">
                  Imagem ilustrativa
                </figcaption>
              </figure>
            )}

            {/* Article Body */}
            <div 
              className="article-content prose prose-xl max-w-none font-serif
                prose-headings:text-foreground prose-headings:font-serif prose-headings:font-bold
                prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-xl
                prose-a:text-primary prose-a:underline prose-a:font-medium prose-a:hover:text-primary/80
                prose-strong:text-foreground prose-strong:font-bold
                prose-em:text-foreground prose-em:italic
                prose-ul:text-foreground/90 prose-ol:text-foreground/90
                prose-li:mb-2 prose-blockquote:border-l-primary prose-blockquote:pl-4"
              style={{ fontFamily: "'Merriweather', 'Georgia', serif", fontSize: '1.25rem' }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Inline Ad */}
            {inlineAdsConverted.length > 0 && (
              <AdCarousel ads={inlineAdsConverted} position="inline" />
            )}

            {/* Comments */}
            <CommentSection comments={articleComments} articleId={article.id} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Sidebar Ad */}
            {sidebarAdsConverted.length > 0 && (
              <AdCarousel ads={sidebarAdsConverted} position="sidebar" />
            )}

            {/* Related News */}
            {relatedNews.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-serif font-bold mb-4 pb-2 border-b border-border">
                  Notícias Relacionadas
                </h3>
                <div className="space-y-0">
                  {relatedNews.slice(0, 3).map((news) => (
                    <NewsCard key={news.id} article={news} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* More from category */}
            {relatedNews.length > 3 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-serif font-bold mb-4 pb-2 border-b border-border">
                  Mais em {article.category}
                </h3>
                <div className="space-y-0">
                  {relatedNews.slice(3, 7).map((news) => (
                    <NewsCard key={news.id} article={news} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>
    </MainLayout>
    </>
  );
};

export default ArticlePage;
