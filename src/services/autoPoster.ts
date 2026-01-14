// Serviço para criar posts automaticamente usando IA

import { analyzeNews, findRelatedImage, findImageWithAI, findImageFromSimilarPosts } from "./ai";
import { fetchRecentNews, NewsSource } from "./newsFetcher";
import { createPost } from "./posts";
import { getCategories } from "./categories";
import { supabase } from "@/integrations/supabase/client";

// Mapear categorias do sistema para categorias de busca
const categoryMapping: Record<string, string> = {
  Economia: "business",
  Política: "politics",
  Esportes: "sports",
  Tecnologia: "technology",
  Saúde: "health",
  Entretenimento: "entertainment",
  Negócios: "business",
  Clima: "weather",
  Internacional: "world",
  Educação: "education",
  Ciência: "science",
  Cultura: "culture",
};

// Verificar se uma notícia já foi postada
const isNewsAlreadyPosted = async (title: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id")
      .ilike("title", `%${title.substring(0, 50)}%`)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Erro ao verificar se notícia já foi postada:", error);
    return false;
  }
};

// Processar e criar post de uma notícia (versão interna sem logs)
const processAndCreatePostInternal = async (news: NewsSource): Promise<boolean> => {
  try {
    // Verificar se já foi postada
    const alreadyPosted = await isNewsAlreadyPosted(news.title);
    if (alreadyPosted) {
      return false;
    }

    // Analisar notícia com IA
    const analysis = await analyzeNews(news.description || news.title, news.url);

    // Buscar imagem usando os termos sugeridos pela IA ou título/categoria
    // Tentar múltiplas fontes até encontrar uma imagem válida
    let imageUrl = analysis.imageUrl;
    
    if (!imageUrl) {
      const searchAttempts = [
        // 1. Tentar buscar imagem de posts similares no banco (mais rápido e confiável)
        () => findImageFromSimilarPosts(analysis.title, analysis.category),
        
        // 2. Buscar em APIs de imagens com termos sugeridos pela IA
        () => analysis.imageSearchTerms 
          ? findRelatedImage(analysis.imageSearchTerms, analysis.category)
          : null,
        
        // 3. Buscar com IA (pode sugerir URLs diretas)
        () => findImageWithAI(analysis.title, news.description || news.title, analysis.category),
        
        // 4. Buscar com título e categoria
        () => findRelatedImage(analysis.title, analysis.category),
        
        // 5. Buscar apenas com categoria
        () => findRelatedImage(analysis.category, analysis.category),
      ];

      // Tentar cada fonte até encontrar uma imagem válida
      for (const attempt of searchAttempts) {
        try {
          const url = await attempt();
          if (url && url.trim() !== '') {
            // Validar URL antes de usar
            if (url.startsWith('http://') || url.startsWith('https://')) {
              imageUrl = url;
              console.log(`✅ Imagem encontrada: ${url.substring(0, 80)}...`);
              break;
            }
          }
        } catch (error) {
          console.log(`Tentativa de busca de imagem falhou, tentando próxima...`);
          continue;
        }
      }
    }

    // Buscar categoria no banco
    const categories = await getCategories();
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === analysis.category.toLowerCase()
    );

    if (!category) {
      return false;
    }

    // Buscar autor padrão (primeiro admin/editor)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["admin", "editor"])
      .limit(1)
      .single();

    if (!profiles) {
      return false;
    }

    // Criar post
    await createPost({
      title: analysis.title,
      excerpt: analysis.excerpt,
      content: analysis.content,
      image_url: imageUrl,
      category_id: category.id,
      author_id: profiles.id,
      is_breaking: analysis.isBreaking,
      is_published: true,
      is_featured: false,
      published_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    return false;
  }
};

// Interface para logs de execução
export interface AutomationLog {
  type: "info" | "success" | "error" | "warning";
  message: string;
  timestamp: Date;
  data?: any;
}

// Callback para logs em tempo real
type LogCallback = (log: AutomationLog) => void;

// Executar ciclo de automação
export const runAutomationCycle = async (onLog?: LogCallback): Promise<AutomationLog[]> => {
  const logs: AutomationLog[] = [];

  const addLog = (type: AutomationLog["type"], message: string, data?: any) => {
    const log: AutomationLog = {
      type,
      message,
      timestamp: new Date(),
      data,
    };
    logs.push(log);
    if (onLog) onLog(log);
    console.log(`[${type.toUpperCase()}] ${message}`, data || "");
  };

  try {
    addLog("info", "Iniciando ciclo de automação...");
    let aiDisabledReason: "quota" | "key_leaked" | "missing_key" | "forbidden" | null = null;

    // Buscar categorias
    addLog("info", "Buscando categorias...");
    const categories = await getCategories();
    const categoryNames = categories.map((cat) => cat.name);
    addLog("success", `${categories.length} categorias encontradas`, { categories: categoryNames });

    // Buscar notícias recentes de todas as categorias
    addLog("info", "Buscando notícias recentes na internet...");
    const allRecentNews = await fetchRecentNews(categoryNames);

    if (allRecentNews.length === 0) {
      addLog("warning", "Nenhuma notícia recente encontrada");
      return logs;
    }

    // Limitar a 10 notícias para reduzir consumo da API
    const recentNews = allRecentNews.slice(0, 10);

    addLog("success", `${recentNews.length} notícias encontradas (limitado a 10 para reduzir consumo da API) de ${categoryNames.length} categorias`, { 
      news: recentNews.slice(0, 5), // Mostrar apenas as primeiras 5 nos logs
      totalCategories: categoryNames.length,
      totalFound: allRecentNews.length
    });

    // Analisar algumas notícias para determinar relevância e urgência
    // Limitar a 3 notícias para não exceder quota da API (20 req/min no plano gratuito)
    addLog("info", "Analisando relevância e urgência das notícias (limitado a 3 para evitar quota)...");
    const analyzedNews = [];
    
    // Pegar uma amostra diversificada de categorias (1-2 de cada categoria)
    const newsToAnalyze = recentNews.slice(0, 3); // Reduzir para 3 notícias para economizar API
    
    for (let idx = 0; idx < newsToAnalyze.length; idx++) {
      const news = newsToAnalyze[idx];
      try {
        // Verificar se já foi postada
        const alreadyPosted = await isNewsAlreadyPosted(news.title);
        if (alreadyPosted) {
          addLog("info", `Notícia já postada, pulando: ${news.title.substring(0, 40)}...`);
          continue;
        }

        // Adicionar delay entre requisições para evitar rate limiting (3 segundos)
        if (idx > 0) {
          // Se IA está desabilitada (ex: chave vazada), não faz sentido continuar analisando
          if (aiDisabledReason) break;
          addLog("info", "Aguardando 3 segundos antes da próxima análise...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Analisar com IA para determinar relevância (com retry automático se quota excedida)
        addLog("info", `Analisando ${idx + 1}/3: ${news.title.substring(0, 50)}...`);
        let analysis;
        let retries = 0;
        const maxRetries = 1; // Tentar apenas 1 vez após esperar
        
        while (retries <= maxRetries) {
          try {
            analysis = await analyzeNews(news.description || news.title, news.url);
            break; // Sucesso, sair do loop
          } catch (error: any) {
            const errorMessage = error?.message || "";

            // Chave do Gemini marcada como vazada: não adianta tentar de novo
            if (errorMessage.includes("GEMINI_KEY_LEAKED")) {
              aiDisabledReason = "key_leaked";
              throw error;
            }

            // Chave não configurada: também não adianta tentar de novo
            if (errorMessage.includes("VITE_GEMINI_API_KEY")) {
              aiDisabledReason = "missing_key";
              throw error;
            }

            // 403 genérico (bloqueio): parar tentativas de IA
            if (errorMessage.startsWith("GEMINI_FORBIDDEN:")) {
              aiDisabledReason = "forbidden";
              throw error;
            }
            
            // Se for erro de quota, aguardar e tentar novamente
            if (errorMessage.includes("QUOTA_EXCEEDED") && retries < maxRetries) {
              const waitTime = (error as any).waitTime || 60;
              addLog("warning", `⏳ Quota excedida! Aguardando ${waitTime} segundos antes de tentar novamente...`);
              await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
              retries++;
              addLog("info", `Tentando novamente após aguardar...`);
              continue;
            }
            
            // Se não for quota ou já tentou, relançar o erro
            throw error;
          }
        }
        
        // Calcular score de relevância
        let relevanceScore = 0;
        
        // Notícias urgentes têm score muito alto
        if (analysis.isBreaking) {
          relevanceScore += 100;
          addLog("warning", `🔴 NOTÍCIA URGENTE detectada!`, { title: analysis.title });
        }
        
        // Título longo e descritivo indica relevância
        if (analysis.title.length > 30) relevanceScore += 10;
        if (analysis.excerpt.length > 100) relevanceScore += 10;
        
        // Conteúdo substancial
        if (analysis.content.length > 500) relevanceScore += 15;
        
        // Categoria relevante (algumas categorias são mais importantes)
        const importantCategories = ["Política", "Economia", "Saúde", "Internacional"];
        if (importantCategories.includes(analysis.category)) {
          relevanceScore += 5;
        }
        
        analyzedNews.push({
          news,
          analysis,
          relevanceScore,
          priority: analysis.isBreaking ? 100 : relevanceScore,
        });
        
        addLog("info", `Score de relevância: ${relevanceScore}`, {
          title: analysis.title.substring(0, 40),
          category: analysis.category,
          isBreaking: analysis.isBreaking,
        });
      } catch (error: any) {
        console.error("Erro ao analisar notícia:", error);
        const errorMessage = error?.message || "Erro desconhecido";
        
        // Se ainda for erro de quota após retry, parar de tentar mais notícias
        if (errorMessage.includes("QUOTA_EXCEEDED") || errorMessage.includes("429")) {
          aiDisabledReason = "quota";
          const waitTime = error?.waitTime || 60;
          const waitMinutes = Math.ceil(waitTime / 60);
          addLog("error", `⚠️ Quota da API excedida após retry! Aguarde ${waitMinutes} minutos (${waitTime} segundos) antes de executar novamente.`);
          
          // Notificar o scheduler sobre o cooldown
          try {
            const { setQuotaCooldown } = await import("../utils/automationScheduler");
            setQuotaCooldown(waitTime);
            addLog("warning", `⏸️ Automação pausada por ${waitMinutes} minutos devido à quota excedida.`);
          } catch {}
          
          break; // Parar o loop se exceder quota mesmo após retry
        }

        // Se a IA foi bloqueada por chave vazada / forbidden / missing key, parar de tentar analisar
        if (errorMessage.includes("GEMINI_KEY_LEAKED")) {
          aiDisabledReason = "key_leaked";
          addLog("error", "⚠️ Gemini bloqueou a API Key (marcada como vazada). Gere uma nova chave e atualize na Vercel (VITE_GEMINI_API_KEY).");
          break;
        }
        if (errorMessage.includes("VITE_GEMINI_API_KEY")) {
          aiDisabledReason = "missing_key";
          addLog("error", "⚠️ VITE_GEMINI_API_KEY não está configurada. Configure a variável de ambiente para usar IA.");
          break;
        }
        if (errorMessage.startsWith("GEMINI_FORBIDDEN:")) {
          aiDisabledReason = "forbidden";
          addLog("error", "⚠️ Gemini retornou 403 (forbidden). Verifique a API Key e permissões.");
          break;
        }
        
        addLog("error", `Erro ao analisar notícia: ${news.title.substring(0, 40)}... - ${errorMessage.substring(0, 100)}`);
      }
    }

    const getFallbackImageUrl = (query: string) => {
      // Imagem sem depender de IA (endpoint "source" do Unsplash faz redirect para uma imagem aleatória).
      // Observação: algumas imagens podem variar a cada acesso.
      const q = encodeURIComponent(query.trim());
      return `https://source.unsplash.com/1200x675/?${q}`;
    };

    // Se nenhuma notícia foi analisada (quota/erro/IA indisponível), criar post básico sem IA
    if (analyzedNews.length === 0 && recentNews.length > 0) {
      const reasonLabel =
        aiDisabledReason === "quota"
          ? "quota excedida"
          : aiDisabledReason === "key_leaked"
          ? "API Key do Gemini bloqueada"
          : aiDisabledReason === "missing_key"
          ? "API Key do Gemini ausente"
          : aiDisabledReason === "forbidden"
          ? "Gemini 403 (forbidden)"
          : "IA indisponível";

      addLog("warning", `Nenhuma notícia analisada (${reasonLabel}). Criando post básico sem IA...`);
      
      // Pegar a primeira notícia e criar post básico
      const firstNews = recentNews[0];
      
      // Verificar se já foi postada
      const alreadyPosted = await isNewsAlreadyPosted(firstNews.title);
      if (alreadyPosted) {
        addLog("info", `Notícia já postada, pulando: ${firstNews.title.substring(0, 40)}...`);
        return logs;
      }
      
      try {
        // Buscar categoria baseada no source
        const category = categories.find(
          (cat) => cat.name.toLowerCase() === firstNews.source.toLowerCase()
        ) || categories[0]; // Usar primeira categoria como fallback
        
        if (!category) {
          addLog("error", "Nenhuma categoria disponível");
          return logs;
        }
        
        // Buscar autor padrão
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .in("role", ["admin", "editor"])
          .limit(1)
          .single();
        
        if (!profiles) {
          addLog("error", "Nenhum admin/editor encontrado");
          return logs;
        }
        
        // Criar post básico sem análise de IA
        addLog("info", `Criando post básico na categoria: ${category.name}...`);
        
        // Gerar conteúdo HTML básico
        const rawDesc = (firstNews.description || "").trim();
        const excerpt =
          rawDesc.length > 0 ? rawDesc.slice(0, 190) : firstNews.title.substring(0, 190);

        const sourceIsDemo = (firstNews.url || "").includes("example.com/news/");
        const sourceBlock =
          firstNews.url && !sourceIsDemo
            ? `<p><strong>Fonte:</strong> <a href="${firstNews.url}" target="_blank" rel="noopener noreferrer">Ver notícia original</a></p>`
            : "";

        const content = `
<div>
  <p>${rawDesc || firstNews.title}</p>
  <h3>O que sabemos até agora</h3>
  <ul>
    <li>Categoria: ${category.name}</li>
    <li>Publicação: ${new Date(firstNews.publishedAt).toLocaleString("pt-BR")}</li>
    <li>Origem: ${firstNews.source}</li>
  </ul>
  <p>Este conteúdo foi publicado automaticamente porque a análise por IA não estava disponível no momento.</p>
  ${sourceBlock}
</div>
        `.trim();

        const imageUrl = getFallbackImageUrl(`${firstNews.title} ${category.name} Brasil`);
        
        await createPost({
          title: firstNews.title,
          excerpt: excerpt,
          content: content,
          image_url: imageUrl,
          category_id: category.id,
          author_id: profiles.id,
          is_breaking: false,
          is_published: true,
          is_featured: false,
          published_at: new Date().toISOString(),
        });
        
        addLog("success", `✅ Post básico criado e publicado com sucesso na categoria ${category.name}!`, {
          title: firstNews.title,
          category: category.name,
          note: "Post criado sem análise de IA (fallback) e com imagem automática",
          imageUrl,
        });
        
        return logs;
      } catch (error: any) {
        addLog("error", `Erro ao criar post básico: ${error.message}`, { error });
        return logs;
      }
    }
    
    if (analyzedNews.length === 0) {
      addLog("warning", "Nenhuma notícia nova encontrada para processar");
      return logs;
    }

    // Ordenar por prioridade (urgentes primeiro) e depois por score de relevância
    analyzedNews.sort((a, b) => {
      // Notícias urgentes sempre primeiro
      if (a.analysis.isBreaking && !b.analysis.isBreaking) return -1;
      if (!a.analysis.isBreaking && b.analysis.isBreaking) return 1;
      // Depois ordenar por score de relevância
      return b.relevanceScore - a.relevanceScore;
    });

    // Escolher APENAS A MAIS RELEVANTE
    const mostRelevant = analyzedNews[0];
    let successCount = 0;
    let errorCount = 0;

    addLog("success", `📌 Notícia mais relevante selecionada!`, {
      title: mostRelevant.analysis.title,
      category: mostRelevant.analysis.category,
      score: mostRelevant.relevanceScore,
      isBreaking: mostRelevant.analysis.isBreaking,
    });

    const { news, analysis } = mostRelevant;
    
    if (analysis.isBreaking) {
      addLog("warning", "🔴 NOTÍCIA URGENTE - Publicando imediatamente!", { title: analysis.title });
    }

    try {

        // Buscar imagem
        addLog("info", "Buscando imagem relacionada...");
        let imageUrl = analysis.imageUrl;
        if (!imageUrl) {
          const { findImageWithAI, findRelatedImage, findImageFromSimilarPosts } = await import("./ai");
          
          imageUrl = (await findImageWithAI(analysis.title, news.description || news.title, analysis.category)) || undefined;
          if (imageUrl) {
            addLog("success", "Imagem encontrada via IA", { imageUrl });
          } else if (analysis.imageSearchTerms) {
            imageUrl = (await findRelatedImage(analysis.imageSearchTerms, analysis.category)) || undefined;
            if (imageUrl) {
              addLog("success", "Imagem encontrada em API de imagens", { imageUrl });
            }
          }
          
          if (!imageUrl) {
            imageUrl = (await findImageFromSimilarPosts(analysis.title, analysis.category)) || undefined;
            if (imageUrl) {
              addLog("success", "Imagem encontrada em post similar", { imageUrl });
            } else {
              addLog("warning", "Nenhuma imagem encontrada, post será criado sem imagem");
            }
          }
        } else {
          addLog("success", "Imagem sugerida pela IA", { imageUrl });
        }

        // Buscar categoria no banco
        const category = categories.find(
          (cat) => cat.name.toLowerCase() === analysis.category.toLowerCase()
        );

        if (!category) {
          addLog("error", `Categoria não encontrada: ${analysis.category}`);
          errorCount++;
        } else {
          // Buscar autor padrão
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .in("role", ["admin", "editor"])
            .limit(1)
            .single();

          if (!profiles) {
            addLog("error", "Nenhum admin/editor encontrado");
            errorCount++;
          } else {
            // Criar post
            addLog("info", `Criando post na categoria: ${analysis.category}...`);
            await createPost({
              title: analysis.title,
              excerpt: analysis.excerpt,
              content: analysis.content,
              image_url: imageUrl,
              category_id: category.id,
              author_id: profiles.id,
              is_breaking: analysis.isBreaking,
              is_published: true,
              is_featured: false,
              published_at: new Date().toISOString(),
            });

            addLog("success", `✅ Post criado e publicado com sucesso na categoria ${analysis.category}!`, {
              title: analysis.title,
              category: analysis.category,
              hasImage: !!imageUrl,
              isBreaking: analysis.isBreaking,
            });
            successCount++;
          }
        }
      } catch (error: any) {
        addLog("error", `Erro ao processar notícia: ${error.message}`, { error, news: news.title });
        errorCount++;
      }

    addLog("success", `Ciclo concluído! ${successCount} post criado${successCount !== 1 ? 's' : ''}, ${errorCount} erro${errorCount !== 1 ? 's' : ''}.`);
    return logs;
  } catch (error: any) {
    addLog("error", `Erro no ciclo de automação: ${error.message}`, { error });
    return logs;
  }
};
