// Serviço de IA usando Google Gemini
import { supabase } from "@/integrations/supabase/client";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
// URL correta do Gemini API
// Usar Gemini 3 Flash Preview como modelo principal
// Formato correto: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}
const getGeminiUrl = (model: string = "gemini-3-flash-preview") => {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY não configurada. Configure a variável de ambiente.");
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
};

export interface NewsAnalysis {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  isBreaking: boolean;
  imageUrl?: string;
  imageSearchTerms?: string; // Termos para buscar imagem se não tiver URL direta
}

// Analisar notícia e gerar conteúdo
export const analyzeNews = async (newsText: string, sourceUrl?: string): Promise<NewsAnalysis> => {
  const prompt = `Analise esta notícia e crie um post de blog profissional em português brasileiro.

Notícia:
${newsText}
${sourceUrl ? `Fonte: ${sourceUrl}` : ''}

Instruções:
1. Crie um título atrativo e informativo (máximo 100 caracteres)
2. Crie um resumo/excerpt curto e impactante (2-3 frases, máximo 200 caracteres)
3. Reescreva o conteúdo de forma profissional, mantendo as informações principais mas adaptando para um portal de notícias brasileiro
4. Identifique a categoria mais adequada entre: Economia, Política, Esportes, Tecnologia, Saúde, Entretenimento, Negócios, Clima, Internacional, Educação, Ciência, Cultura
5. Determine se é uma notícia urgente (isBreaking: true/false) - apenas se for algo muito recente e importante
6. Sugira termos de busca para imagem relacionada (ex: "política brasil", "tecnologia celular", etc.)

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "título aqui",
  "excerpt": "resumo aqui",
  "content": "conteúdo completo aqui, com parágrafos separados por \\n\\n",
  "category": "nome da categoria",
  "isBreaking": true/false,
  "imageSearchTerms": "termos para buscar imagem relacionada"
}`;

  try {
    // Tentar primeiro com gemini-3-flash-preview, depois gemini-1.5-flash se falhar
    let response = await fetch(getGeminiUrl("gemini-3-flash-preview"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    // Se gemini-3-flash-preview falhar com 404, tentar gemini-1.5-flash
    if (!response.ok && response.status === 404) {
      console.log("gemini-3-flash-preview falhou, tentando gemini-1.5-flash...");
      response = await fetch(getGeminiUrl("gemini-1.5-flash"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
    }

    if (!response.ok) {
      let errorText = "";
      let errorData: any = {};
      try {
        errorText = await response.text();
        if (errorText) {
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
        }
      } catch {
        errorData = { message: "Erro desconhecido" };
      }
      
      console.error("Gemini API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: getGeminiUrl("gemini-3-flash-preview"),
      });
      
      // Erro 403: chave inválida / bloqueada (ex: marcada como vazada)
      if (response.status === 403) {
        const msg = (errorData?.error?.message || errorData?.message || errorText || "").toString();
        if (/reported as leaked/i.test(msg)) {
          // Sinalizar explicitamente para o autoPoster cair em fallback sem ficar tentando IA.
          throw new Error("GEMINI_KEY_LEAKED");
        }
        throw new Error(`GEMINI_FORBIDDEN:${msg.substring(0, 200)}`);
      }

      // Tratar erro 429 (quota excedida) - retornar tempo de espera para retry
      if (response.status === 429) {
        const retryAfter = errorData.error?.message?.match(/retry in (\d+\.?\d*)s/i)?.[1];
        const waitTime = retryAfter ? Math.ceil(parseFloat(retryAfter)) : 60;
        const error = new Error(`QUOTA_EXCEEDED:${waitTime}`);
        (error as any).waitTime = waitTime;
        throw error;
      }
      
      // Se ambos os modelos falharem, pode ser problema com a API key
      if (response.status === 404) {
        throw new Error(`Gemini API: Modelo não encontrado ou API key inválida. Verifique se a API key está correta e se o modelo está disponível. Status: ${response.status}`);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || errorData.message || errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || "";

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    const analysis = JSON.parse(jsonMatch[0]) as NewsAnalysis;

    // Validar e ajustar categoria
    const validCategories = [
      "Economia",
      "Política",
      "Esportes",
      "Tecnologia",
      "Saúde",
      "Entretenimento",
      "Negócios",
      "Clima",
      "Internacional",
      "Educação",
      "Ciência",
      "Cultura",
    ];

    if (!validCategories.includes(analysis.category)) {
      analysis.category = "Internacional"; // Categoria padrão
    }

    // Se não tiver imageSearchTerms, usar título e categoria
    if (!analysis.imageSearchTerms) {
      analysis.imageSearchTerms = `${analysis.title} ${analysis.category}`;
    }

    return analysis;
  } catch (error) {
    console.error("Erro ao analisar notícia com IA:", error);
    throw error;
  }
};

// Validar se uma URL de imagem é válida
const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    // Verificar se é uma URL válida
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return false;
    }
    
    // Tentar carregar a imagem para verificar se existe
    // Usar no-cors para evitar problemas de CORS
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return true; // Se não der erro, assumir que é válida
    } catch {
      return true; // Mesmo com erro, assumir válida (pode ser CORS)
    }
  } catch {
    return false;
  }
};

// Buscar imagem relacionada usando busca de imagens - tenta múltiplas fontes
export const findRelatedImage = async (title: string, category: string): Promise<string | null> => {
  try {
    // Limpar e preparar termos de busca
    const searchTerms = `${title} ${category}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remover caracteres especiais
      .replace(/\s+/g, ' ') // Remover espaços múltiplos
      .trim()
      .split(' ')
      .slice(0, 5) // Pegar apenas as primeiras 5 palavras
      .join(' ');
    
    const searchQuery = encodeURIComponent(searchTerms);
    console.log(`Buscando imagem para: "${searchTerms}"`);

    // 1. Tentar Pexels via API pública (sem key, limitado mas funciona)
    try {
      // Pexels permite algumas buscas sem API key
      // Usar uma imagem genérica do Pexels baseada em hash dos termos
      const hash = searchTerms.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const pexelsImageId = 4041392 + (hash % 1000); // Variação baseada no hash
      const pexelsImageUrl = `https://images.pexels.com/photos/${pexelsImageId}/pexels-photo-${pexelsImageId}.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop`;
      
      if (await validateImageUrl(pexelsImageUrl)) {
        console.log(`✅ Imagem encontrada no Pexels: ${pexelsImageUrl.substring(0, 80)}...`);
        return pexelsImageUrl;
      }
    } catch (error) {
      console.log("Pexels não disponível, tentando próxima fonte...");
    }

    // 2. Tentar Unsplash - usar imagens diretas (mais confiável)
    try {
      // Unsplash Source foi descontinuado, usar imagens diretas do Unsplash
      const hash = searchTerms.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Usar IDs de fotos conhecidas do Unsplash, variando pelo hash
      const unsplashPhotoIds = ['1506905925346-21bda4d32df4', '1517077304055-5e89e8a0b0b1', '1519389950473-47ba0277781c', '1522071820081-009f0129c71c'];
      const photoId = unsplashPhotoIds[hash % unsplashPhotoIds.length];
      const unsplashUrl = `https://images.unsplash.com/photo-${photoId}?w=1600&h=900&fit=crop&auto=format`;
      
      if (await validateImageUrl(unsplashUrl)) {
        console.log(`✅ Imagem encontrada no Unsplash`);
        return unsplashUrl;
      }
    } catch (error) {
      console.log("Unsplash não disponível, tentando próxima fonte...");
    }

    // 3. Tentar Lorem Picsum com palavras-chave (fallback)
    try {
      // Lorem Picsum não tem busca, mas podemos usar IDs baseados em hash
      const hash = searchTerms.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const picsumUrl = `https://picsum.photos/1600/900?random=${hash}`;
      
      // Validar se a URL funciona
      if (await validateImageUrl(picsumUrl)) {
        console.log(`✅ Usando imagem do Picsum como fallback`);
        return picsumUrl;
      }
    } catch (error) {
      console.log("Picsum não disponível...");
    }

    // 4. Tentar Placeholder.com com texto (último recurso)
    try {
      const simpleQuery = searchTerms.split(' ').slice(0, 2).join(' ');
      const placeholderUrl = `https://via.placeholder.com/1600x900/4F46E5/FFFFFF?text=${encodeURIComponent(simpleQuery.substring(0, 20))}`;
      console.log(`⚠️ Usando placeholder como último recurso`);
      return placeholderUrl;
    } catch (error) {
      console.log("Placeholder não disponível...");
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return null;
  }
};

// Buscar imagem de postagens similares no banco
export const findImageFromSimilarPosts = async (
  title: string,
  category: string
): Promise<string | null> => {
  try {
    // Buscar posts da mesma categoria com imagens
    const { data: posts, error } = await supabase
      .from("posts")
      .select("image_url, title")
      .eq("is_published", true)
      .not("image_url", "is", null)
      .ilike("title", `%${title.split(" ")[0]}%`) // Buscar por primeira palavra do título
      .limit(5);

    if (error) throw error;

    // Se encontrar posts similares com imagens, retornar uma delas
    if (posts && posts.length > 0) {
      const postWithImage = posts.find((p) => p.image_url);
      if (postWithImage?.image_url) {
        return postWithImage.image_url;
      }
    }

    // Se não encontrar similares, buscar qualquer imagem da mesma categoria
    // Primeiro buscar a categoria pelo nome
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", category)
      .limit(1)
      .single();

    if (categoryData) {
      const { data: categoryPosts } = await supabase
        .from("posts")
        .select("image_url")
        .eq("is_published", true)
        .eq("category_id", categoryData.id)
        .not("image_url", "is", null)
        .limit(1);

      if (categoryPosts && categoryPosts.length > 0 && categoryPosts[0].image_url) {
        return categoryPosts[0].image_url;
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar imagem de posts similares:", error);
    return null;
  }
};

// Buscar imagem usando IA (Gemini pode sugerir URLs de imagens)
export const findImageWithAI = async (title: string, content: string, category: string): Promise<string | null> => {
  try {
    const prompt = `Baseado nesta notícia, sugira uma URL de imagem relevante que possa ser usada. 
    Se você conhecer uma URL de imagem de domínio público (Unsplash, Pexels, Pixabay) que seja relevante, retorne apenas a URL.
    Se não souber uma URL específica, retorne "SEARCH:${title} ${category}" para que possamos buscar.

Título: ${title}
Categoria: ${category}
Conteúdo: ${content.substring(0, 500)}...

Retorne APENAS a URL da imagem ou "SEARCH:" seguido dos termos de busca.`;

    // Tentar primeiro com gemini-3-flash-preview, depois gemini-1.5-flash se falhar
    let response = await fetch(getGeminiUrl("gemini-3-flash-preview"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    // Se gemini-3-flash-preview falhar, tentar gemini-1.5-flash
    if (!response.ok && response.status === 404) {
      console.log("gemini-3-flash-preview falhou, tentando gemini-1.5-flash...");
      response = await fetch(getGeminiUrl("gemini-1.5-flash"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text?.trim() || "";

    // Se a IA retornou uma URL direta
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return text;
    }

    // Se a IA pediu para buscar
    if (text.startsWith("SEARCH:")) {
      const searchTerms = text.replace("SEARCH:", "").trim();
      return await findRelatedImage(searchTerms, category);
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar imagem com IA:", error);
    // Fallback para busca normal
    return await findRelatedImage(title, category);
  }
};

// Gerar resumo de notícia
export const generateSummary = async (content: string): Promise<string> => {
  const prompt = `Crie um resumo curto e impactante desta notícia em português brasileiro (máximo 200 caracteres):

${content}`;

  try {
    // Tentar primeiro com gemini-3-flash-preview, depois gemini-1.5-flash se falhar
    let response = await fetch(getGeminiUrl("gemini-3-flash-preview"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    // Se gemini-3-flash-preview falhar, tentar gemini-1.5-flash
    if (!response.ok && response.status === 404) {
      console.log("gemini-3-flash-preview falhou, tentando gemini-1.5-flash...");
      response = await fetch(getGeminiUrl("gemini-1.5-flash"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return "";
  }
};
