# Guia de Configuração para Google News

Este guia explica como configurar o portal N91 para aparecer no Google News.

## 📋 Requisitos do Google News

### 1. Estrutura de URL
✅ **Implementado**: URLs amigáveis com slug baseado no título
- Formato: `https://n91.com.br/noticia/titulo-da-noticia`
- URLs são únicas e descritivas

### 2. Meta Tags
✅ **Implementado**: Todas as meta tags necessárias
- `news_keywords`: Palavras-chave da notícia
- `article:published_time`: Data de publicação
- `article:modified_time`: Data de modificação
- `article:author`: Autor da notícia
- `article:section`: Categoria
- `article:tag`: Tags relacionadas

### 3. Structured Data (Schema.org)
✅ **Implementado**: Schema NewsArticle completo
- Headline, description, image
- DatePublished, dateModified
- Author, Publisher
- ArticleSection, Keywords
- BreadcrumbList para navegação

### 4. RSS Feed
⚠️ **Pendente**: Criar endpoint dinâmico
- URL: `https://n91.com.br/rss.xml`
- Deve incluir todas as notícias publicadas nas últimas 24 horas
- Formato RSS 2.0 com namespace do Google News

### 5. Sitemap
⚠️ **Pendente**: Criar sitemap dinâmico
- URL: `https://n91.com.br/sitemap.xml`
- Deve incluir todas as URLs de notícias
- Atualizar diariamente

## 🚀 Passos para Submeter ao Google News

### Passo 1: Criar Conta no Google Publisher Center
1. Acesse: https://publishers.google.com/
2. Faça login com sua conta Google
3. Clique em "Adicionar publicação"
4. Preencha as informações:
   - **Nome**: N91
   - **URL do site**: https://n91.com.br
   - **Idioma**: Português (Brasil)
   - **País**: Brasil

### Passo 2: Verificar Propriedade
1. Google vai pedir verificação do site
2. Adicione a meta tag de verificação no `index.html`:
   ```html
   <meta name="google-site-verification" content="SEU_CODIGO_AQUI" />
   ```

### Passo 3: Configurar RSS Feed
1. No Google Publisher Center, vá em "Feeds"
2. Adicione o feed RSS: `https://n91.com.br/rss.xml`
3. Configure para atualização automática

### Passo 4: Configurar Sitemap
1. No Google Publisher Center, vá em "Sitemaps"
2. Adicione o sitemap: `https://n91.com.br/sitemap.xml`
3. Configure para atualização diária

### Passo 5: Configurar Categorias
1. No Google Publisher Center, vá em "Seções"
2. Adicione as categorias:
   - Economia
   - Política
   - Esportes
   - Tecnologia
   - Saúde
   - Entretenimento
   - Negócios
   - Clima
   - Internacional
   - Educação
   - Ciência
   - Cultura

### Passo 6: Configurar Localização
1. No Google Publisher Center, vá em "Localização"
2. Selecione: Brasil
3. Idioma: Português (Brasil)

## 📝 Checklist de Qualidade

### Conteúdo
- ✅ Títulos descritivos e únicos
- ✅ Conteúdo original e de qualidade
- ✅ Publicação regular (pelo menos 1 notícia por dia)
- ✅ Imagens relevantes e de boa qualidade
- ✅ Autor identificado em cada artigo

### Técnico
- ✅ URLs amigáveis e únicas
- ✅ Meta tags corretas
- ✅ Structured Data (Schema.org)
- ✅ RSS Feed funcional
- ✅ Sitemap atualizado
- ✅ Site responsivo (mobile-friendly)
- ✅ HTTPS habilitado
- ✅ Tempo de carregamento rápido

### SEO
- ✅ Títulos otimizados (50-60 caracteres)
- ✅ Descrições otimizadas (150-160 caracteres)
- ✅ Palavras-chave relevantes
- ✅ Links internos
- ✅ Imagens com alt text
- ✅ Breadcrumbs

## 🔍 Verificações

### Google Search Console
1. Acesse: https://search.google.com/search-console
2. Adicione a propriedade: `https://n91.com.br`
3. Verifique a propriedade
4. Envie o sitemap: `https://n91.com.br/sitemap.xml`
5. Monitore erros e desempenho

### Teste de Structured Data
1. Acesse: https://search.google.com/test/rich-results
2. Teste uma URL de notícia
3. Verifique se o Schema NewsArticle está correto

### Teste de Mobile-Friendly
1. Acesse: https://search.google.com/test/mobile-friendly
2. Teste o site
3. Corrija problemas se houver

## ⚠️ Importante

1. **Conteúdo Original**: Google News só aceita conteúdo original, não pode ser apenas agregador
2. **Publicação Regular**: Publique pelo menos 1 notícia por dia
3. **Qualidade**: Conteúdo deve ser bem escrito e informativo
4. **Imagens**: Use imagens de alta qualidade e relevantes
5. **Autor**: Identifique o autor de cada artigo
6. **Categorias**: Use categorias consistentes

## 📊 Monitoramento

Após a aprovação, monitore:
- Impressões no Google News
- Cliques e CTR
- Posicionamento nas buscas
- Erros no Search Console
- Performance do site

## 🆘 Suporte

Se tiver problemas:
- Google Publisher Center Help: https://support.google.com/news/publisher-center
- Google Search Central: https://developers.google.com/search
