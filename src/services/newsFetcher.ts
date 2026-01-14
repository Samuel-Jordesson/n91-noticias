// Serviço para buscar notícias de várias fontes

export interface NewsSource {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

// Buscar notícias usando NewsAPI (requer API key - você pode adicionar depois)
export const fetchNewsFromAPI = async (category?: string): Promise<NewsSource[]> => {
  // Você pode adicionar uma API key do NewsAPI aqui
  // const NEWS_API_KEY = "YOUR_NEWS_API_KEY";
  // const url = `https://newsapi.org/v2/top-headlines?country=br&category=${category}&apiKey=${NEWS_API_KEY}`;
  
  // Por enquanto, retornar array vazio - você pode integrar depois
  return [];
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

// Buscar notícias recentes e relevantes de múltiplas categorias
export const fetchRecentNews = async (categories: string[]): Promise<NewsSource[]> => {
  const allNews: NewsSource[] = [];

  // Gerar notícias de exemplo para cada categoria
  // Em produção, você pode integrar APIs reais (NewsAPI, RSS feeds, etc.)
  
  const categoryNewsMap: Record<string, string[]> = {
    "Economia": [
      "Inflação no Brasil: especialistas analisam impacto na economia",
      "Dólar sobe e atinge nova máxima do ano",
      "Brasil registra crescimento no PIB do último trimestre",
    ],
    "Política": [
      "Nova lei aprovada no Congresso Nacional",
      "Eleições municipais: confira os principais candidatos",
      "Governo anuncia novo pacote de medidas econômicas",
    ],
    "Esportes": [
      "Campeonato Brasileiro: resultados dos jogos de hoje",
      "Seleção Brasileira se prepara para próximo amistoso",
      "Atleta brasileiro conquista medalha em competição internacional",
    ],
    "Tecnologia": [
      "Novo lançamento de smartphone com tecnologia inovadora",
      "Inteligência Artificial: avanços e impactos na sociedade",
      "Startup brasileira recebe investimento milionário",
    ],
    "Saúde": [
      "Ministério da Saúde anuncia nova campanha de vacinação",
      "Pesquisa revela benefícios de hábitos saudáveis",
      "Hospital inaugura nova unidade de tratamento",
    ],
    "Entretenimento": [
      "Festival de música anuncia line-up completo",
      "Filme brasileiro ganha prêmio internacional",
      "Série nacional estreia em plataforma de streaming",
    ],
    "Negócios": [
      "Empresa anuncia expansão e criação de novos empregos",
      "Mercado de ações fecha em alta",
      "Startup brasileira é adquirida por multinacional",
    ],
    "Clima": [
      "Previsão do tempo: alerta para chuvas intensas",
      "Temperaturas sobem em várias regiões do país",
      "Especialistas alertam para mudanças climáticas",
    ],
    "Internacional": [
      "Cúpula internacional discute questões globais",
      "País estrangeiro anuncia novo acordo comercial",
      "Organização internacional lança novo relatório",
    ],
    "Educação": [
      "Universidade lança novo programa de bolsas",
      "Pesquisa educacional revela dados importantes",
      "Escola pública recebe investimento em infraestrutura",
    ],
    "Ciência": [
      "Pesquisadores brasileiros fazem descoberta importante",
      "Nova pesquisa científica publicada em revista internacional",
      "Laboratório anuncia avanço em estudos médicos",
    ],
    "Cultura": [
      "Museu inaugura nova exposição temporária",
      "Festival cultural reúne artistas de todo o país",
      "Livro brasileiro ganha destaque internacional",
    ],
  };

  // Gerar notícias para cada categoria disponível
  categories.forEach((category) => {
    const newsTitles = categoryNewsMap[category] || [];
    
    newsTitles.forEach((title, index) => {
      allNews.push({
        title: `${title}`,
        description: `Notícia relevante sobre ${category.toLowerCase()}. Esta é uma notícia gerada automaticamente para demonstrar o sistema de automação.`,
        url: `https://example.com/news/${category.toLowerCase()}/${index}`,
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Últimas 24h
        source: category,
      });
    });
  });

  // Filtrar notícias muito antigas (últimas 24 horas)
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  return allNews.filter((news) => {
    const newsDate = new Date(news.publishedAt);
    return newsDate >= oneDayAgo;
  });
};
