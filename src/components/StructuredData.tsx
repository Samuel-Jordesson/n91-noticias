import { useLocation } from "react-router-dom";

interface StructuredDataProps {
  type?: "Article" | "NewsArticle" | "WebSite" | "Organization";
  title?: string;
  description?: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  category?: string;
  keywords?: string;
}

const StructuredData = ({
  type = "WebSite",
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  author,
  publisher = {
    name: "N91",
    logo: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "https://n91.com.br/logo.png",
  },
  category,
  keywords,
}: StructuredDataProps) => {
  const location = useLocation();
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://n91.com.br";
  const currentUrl = `${siteUrl}${location.pathname}`;
  const fullImageUrl = image?.startsWith("http") ? image : image ? `${siteUrl}${image}` : undefined;

  const getStructuredData = () => {
    const baseData: any = {
      "@context": "https://schema.org",
      "@type": type,
    };

    if (type === "NewsArticle" || type === "Article") {
      baseData.headline = title;
      baseData.description = description;
      baseData.url = currentUrl;
      
      if (fullImageUrl) {
        baseData.image = {
          "@type": "ImageObject",
          url: fullImageUrl,
        };
      }

      if (publishedTime) {
        baseData.datePublished = publishedTime;
      }

      if (modifiedTime) {
        baseData.dateModified = modifiedTime;
      }

      if (author) {
        baseData.author = {
          "@type": "Person",
          name: author.name,
          ...(author.url && { url: author.url }),
        };
      }

      if (publisher) {
        baseData.publisher = {
          "@type": "Organization",
          name: publisher.name,
          ...(publisher.logo && {
            logo: {
              "@type": "ImageObject",
              url: publisher.logo,
            },
          }),
        };
      }

      if (category) {
        baseData.articleSection = category;
      }

      if (keywords) {
        baseData.keywords = keywords;
      }
    } else if (type === "WebSite") {
      baseData.name = title || "N91 - Portal de Notícias";
      baseData.url = siteUrl;
      baseData.description = description;
      baseData.potentialAction = {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/busca?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      };
    } else if (type === "Organization") {
      baseData.name = publisher.name;
      baseData.url = siteUrl;
      if (publisher.logo) {
        baseData.logo = publisher.logo;
      }
    }

    return baseData;
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  );
};

export default StructuredData;
