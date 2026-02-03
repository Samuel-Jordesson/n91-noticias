import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
  keywords?: string;
  canonicalUrl?: string;
}

const SEO = ({
  title = "Portal Barcarena - Últimas notícias de Barcarena",
  description = "Portal Barcarena - Últimas notícias de Barcarena. Informação de qualidade, atualizada 24 horas sobre política, economia, esportes, tecnologia e muito mais.",
  image = "/og-image.jpg",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  category,
  keywords = "notícias, brasil, economia, política, esportes, tecnologia, jornalismo, informação",
  canonicalUrl,
}: SEOProps) => {
  const location = useLocation();
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://portalbarcarena.com.br";
  const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  useEffect(() => {
    // Atualizar título
    document.title = title;

    // Meta tags básicas
    updateMetaTag("name", "description", description);
    updateMetaTag("name", "keywords", keywords);
    updateMetaTag("name", "author", "Portal Barcarena");
    updateMetaTag("name", "robots", "index, follow");
    updateMetaTag("name", "googlebot", "index, follow");
    updateMetaTag("name", "news_keywords", keywords);

    // Open Graph
    updateMetaTag("property", "og:title", title);
    updateMetaTag("property", "og:description", description);
    updateMetaTag("property", "og:type", type);
    updateMetaTag("property", "og:url", currentUrl);
    updateMetaTag("property", "og:image", fullImageUrl);
    updateMetaTag("property", "og:site_name", "Portal Barcarena");
    updateMetaTag("property", "og:locale", "pt_BR");

    // Twitter Card
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", title);
    updateMetaTag("name", "twitter:description", description);
    updateMetaTag("name", "twitter:image", fullImageUrl);

    // Article specific
    if (type === "article") {
      if (publishedTime) {
        updateMetaTag("property", "article:published_time", publishedTime);
      }
      if (modifiedTime) {
        updateMetaTag("property", "article:modified_time", modifiedTime);
      }
      if (author) {
        updateMetaTag("property", "article:author", author);
      }
      if (category) {
        updateMetaTag("property", "article:section", category);
        updateMetaTag("property", "article:tag", category);
      }
    }

    // Canonical URL
    updateCanonical(currentUrl);

    // Google News específico
    updateMetaTag("name", "news_keywords", keywords);
    if (type === "article") {
      updateMetaTag("name", "original-source", currentUrl);
    }
  }, [title, description, image, type, publishedTime, modifiedTime, author, category, keywords, currentUrl, fullImageUrl]);

  return null;
};

const updateMetaTag = (attribute: "name" | "property", name: string, content: string) => {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
};

const updateCanonical = (url: string) => {
  let element = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  
  element.href = url;
};

export default SEO;
