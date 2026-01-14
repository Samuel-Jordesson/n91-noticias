// Serviço para buscar notícias de várias fontes

export interface NewsSource {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

// Mapeamento de categorias do sistema para categorias do NewsAPI
const categoryToNewsAPI: Record<string, string> = {
  "Economia": "business",
  "Negócios": "business",
  "Entretenimento": "entertainment",
  "Cultura": "entertainment",
  "Saúde": "health",
  "Ciência": "science",
  "Esportes": "sports",
  "Tecnologia": "technology",
  "Política": "general",
  "Clima": "general",
  "Internacional": "general",
  "Educação": "general",
};

// Buscar notícias usando NewsAPI
export const fetchNewsFromAPI = async (category?: string): Promise<NewsSource[]> => {
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  
  if (!NEWS_API_KEY) {
    console.warn("NewsAPI key não configurada. Configure VITE_NEWS_API_KEY nas variáveis de ambiente.");
    return [];
  }

  try {
    // Mapear categoria do sistema para categoria do NewsAPI
    const newsAPICategory = category ? categoryToNewsAPI[category] || "general" : undefined;
    
    // Construir URL da API
    let url = `https://newsapi.org/v2/top-headlines?country=br&apiKey=${NEWS_API_KEY}`;
    if (newsAPICategory && newsAPICategory !== "general") {
      url += `&category=${newsAPICategory}`;
    }
    
    // Limitar a 10 resultados por categoria para economizar quota
    url += "&pageSize=10";

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro ao buscar notícias da NewsAPI:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      // Se for erro 429 (quota excedida), retornar array vazio
      if (response.status === 429) {
        console.warn("Quota da NewsAPI excedida");
        return [];
      }
      
      return [];
    }

    const data = await response.json();
    
    if (data.status === "error") {
      console.error("Erro da NewsAPI:", data.message);
      return [];
    }

    // Converter resposta da NewsAPI para formato NewsSource
    const news: NewsSource[] = (data.articles || []).map((article: any) => ({
      title: article.title || "Sem título",
      description: article.description || article.content?.substring(0, 200) || "Sem descrição",
      url: article.url || "",
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: category || article.source?.name || "NewsAPI",
    }));

    return news;
  } catch (error) {
    console.error("Erro ao buscar notícias da NewsAPI:", error);
    return [];
  }
};

// Buscar notícias de RSS feeds brasileiros usando um proxy
export const fetchBrazilianNews = async (): Promise<NewsSource[]> => {
  // Lista de feeds RSS brasileiros
  const rssFeeds = [
    {
      url: "https://g1.globo.com/rss/g1/",
      source: "G1",
    },
    {
      url: "https://www.uol.com.br/feed/",
      source: "UOL",
    },
  ];

  const allNews: NewsSource[] = [];

  for (const feed of rssFeeds) {
    try {
      // Usar um serviço de proxy RSS (como rss2json.com ou similar)
      // Por enquanto, vamos criar notícias de exemplo para teste
      // Você pode integrar um parser RSS real depois
    } catch (error) {
      console.error(`Erro ao buscar feed ${feed.url}:`, error);
    }
  }

  return allNews;
};

// Buscar notícias do Google News (via API alternativa)
export const fetchGoogleNews = async (category?: string): Promise<NewsSource[]> => {
  try {
    // Usar uma API alternativa como NewsAPI ou criar um proxy
    // Por enquanto, retornar array vazio
    return [];
  } catch (error) {
    console.error("Erro ao buscar notícias do Google News:", error);
    return [];
  }
};

// Extrair texto de uma URL (web scraping)
export const extractNewsFromUrl = async (url: string): Promise<string> => {
  try {
    // Usar um serviço de extração de conteúdo (como Mercury Web Parser ou similar)
    // Por enquanto, retornar string vazia
    return "";
  } catch (error) {
    console.error("Erro ao extrair notícia da URL:", error);
    return "";
  }
};

// Buscar notícias recentes e relevantes de múltiplas categorias usando NewsAPI
export const fetchRecentNews = async (categories: string[]): Promise<NewsSource[]> => {
  const allNews: NewsSource[] = [];

  // Buscar notícias da NewsAPI para cada categoria
  // Limitar a 2-3 categorias por vez para não exceder quota (100 req/dia no plano gratuito)
  const categoriesToFetch = categories.slice(0, 3); // Buscar apenas 3 categorias por ciclo
  
  for (const category of categoriesToFetch) {
    try {
      const news = await fetchNewsFromAPI(category);
      
      // Adicionar a categoria original ao source para manter rastreabilidade
      const newsWithCategory = news.map((item) => ({
        ...item,
        source: category, // Manter categoria do sistema
      }));
      
      allNews.push(...newsWithCategory);
      
      // Adicionar delay entre requisições para evitar rate limiting
      if (categoriesToFetch.indexOf(category) < categoriesToFetch.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 segundo entre requisições
      }
    } catch (error) {
      console.error(`Erro ao buscar notícias da categoria ${category}:`, error);
      // Continuar com outras categorias mesmo se uma falhar
    }
  }

  // Se não encontrou notícias da NewsAPI, usar fallback com dados mockados para categorias não buscadas
  if (allNews.length === 0) {
    console.warn("Nenhuma notícia encontrada da NewsAPI, usando fallback...");
    
    // Fallback apenas para as categorias que não foram buscadas
    const fallbackCategories = categories.slice(3);
    const categoryNewsMap: Record<string, string[]> = {
      "Política": [
        "Nova lei aprovada no Congresso Nacional",
        "Eleições municipais: confira os principais candidatos",
      ],
      "Clima": [
        "Previsão do tempo: alerta para chuvas intensas",
        "Temperaturas sobem em várias regiões do país",
      ],
      "Internacional": [
        "Cúpula internacional discute questões globais",
        "País estrangeiro anuncia novo acordo comercial",
      ],
      "Educação": [
        "Universidade lança novo programa de bolsas",
        "Pesquisa educacional revela dados importantes",
      ],
    };

    fallbackCategories.forEach((category) => {
      const newsTitles = categoryNewsMap[category] || [];
      
      newsTitles.forEach((title, index) => {
        allNews.push({
          title: `${title}`,
          description: `Notícia relevante sobre ${category.toLowerCase()}.`,
          url: `https://example.com/news/${category.toLowerCase()}/${index}`,
          publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          source: category,
        });
      });
    });
  }

  // Filtrar notícias muito antigas (últimas 24 horas)
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const recentNews = allNews.filter((news) => {
    const newsDate = new Date(news.publishedAt);
    return newsDate >= oneDayAgo;
  });

  // Limitar a 10 notícias no total para economizar processamento
  return recentNews.slice(0, 10);
};
