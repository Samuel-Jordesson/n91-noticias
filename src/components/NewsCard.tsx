import { Link } from "react-router-dom";
import { NewsArticle } from "@/types/news";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";
import { generateSlug } from "@/lib/utils";

interface NewsCardProps {
  article: NewsArticle;
  variant?: "default" | "featured" | "compact" | "list" | "text-only";
}

const NewsCard = ({ article, variant = "default" }: NewsCardProps) => {
  const timeAgo = formatDistanceToNow(article.publishedAt, {
    addSuffix: true,
    locale: ptBR,
  });

  const hasImage = article.imageUrl && article.imageUrl.trim() !== "";
  const imageUrl = hasImage ? article.imageUrl : "https://via.placeholder.com/800x450?text=Sem+Imagem";
  const articleSlug = generateSlug(article.title);

  if (variant === "featured") {
    return (
      <Link to={`/noticia/${articleSlug}`} className="block group">
        <article className="relative overflow-hidden rounded-lg news-card-hover">
          <div className="aspect-[16/9] md:aspect-[16/6] lg:aspect-[16/5] xl:aspect-[16/4] overflow-hidden bg-muted">
            {hasImage ? (
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-muted-foreground text-xs md:text-sm">Sem imagem</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-10 xl:p-12">
            {article.isBreaking && (
              <span className="breaking-badge mb-2 md:mb-3 text-xs md:text-sm">
                🔴 Urgente
              </span>
            )}
            <span className="news-category-badge mb-2 md:mb-3 block w-fit text-[10px] md:text-xs">
              {article.category}
            </span>
            <h2 className="news-headline text-lg md:text-2xl lg:text-3xl xl:text-4xl text-white mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
              {article.title}
            </h2>
            <p className="text-white/80 text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 mb-4 md:mb-5 max-w-3xl hidden sm:block">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-2 md:gap-4 text-white/60 text-xs md:text-sm lg:text-base flex-wrap">
              <span className="truncate">{article.author}</span>
              <span>•</span>
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 md:h-4 md:w-4" />
                {article.views.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <Link to={`/noticia/${articleSlug}`} className="block group">
        <article className="flex flex-col sm:flex-row gap-3 md:gap-4 py-3 md:py-4 px-3 md:px-0 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
          {hasImage && (
            <div className="w-full sm:w-32 md:w-48 h-40 sm:h-24 md:h-32 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2 flex-wrap">
              <span className="news-category-badge text-[10px] md:text-xs">
                {article.category}
              </span>
              {article.isBreaking && (
                <span className="text-[10px] md:text-xs font-bold text-destructive">Urgente</span>
              )}
            </div>
            <h3 className="text-sm md:text-base font-bold text-foreground mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground flex-wrap">
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/noticia/${articleSlug}`} className="block group">
        <article className="flex gap-4 py-4 border-b border-border last:border-0 news-card-hover">
          {hasImage && (
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-news-category">
              {article.category}
            </span>
            <h3 className="news-headline text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <span className="news-date block mt-2">{timeAgo}</span>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "text-only") {
    return (
      <Link to={`/noticia/${articleSlug}`} className="block group">
        <article className="p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <span className="news-category-badge text-[10px] px-2 py-0.5">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="text-xs font-bold text-destructive">Urgente</span>
            )}
          </div>
          <h3 className="text-base font-bold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views.toLocaleString("pt-BR")}
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/noticia/${articleSlug}`} className="block group">
      <article className="bg-card rounded-lg overflow-hidden shadow-sm border border-border news-card-hover">
        {hasImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="news-category-badge">{article.category}</span>
            {article.isBreaking && (
              <span className="breaking-badge text-[10px]">Urgente</span>
            )}
          </div>
          <h3 className="news-headline text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="news-date">{timeAgo}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4" />
              {article.views.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default NewsCard;
