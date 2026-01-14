# Guia de SEO para Google News - N91

## ✅ Implementações Realizadas

### 1. **Meta Tags Dinâmicas**
- ✅ Componente SEO reutilizável
- ✅ Meta tags por página (title, description, keywords)
- ✅ Open Graph tags completas
- ✅ Twitter Card tags
- ✅ Canonical URLs

### 2. **Structured Data (Schema.org)**
- ✅ JSON-LD para NewsArticle (artigos)
- ✅ JSON-LD para WebSite (página inicial)
- ✅ Dados estruturados para Google News

### 3. **Robots.txt**
- ✅ Configurado para permitir Googlebot-News
- ✅ Sitemap referenciado
- ✅ Áreas administrativas bloqueadas

### 4. **Sitemap.xml**
- ✅ Estrutura básica criada
- ✅ **Implementado**: Endpoint dinâmico `/api/sitemap.xml` que gera todas as URLs de posts, categorias e páginas especiais

### 5. **RSS Feed**
- ✅ Estrutura básica criada
- ✅ **Implementado**: Endpoint dinâmico `/api/rss.xml` que gera os últimos 50 posts em formato RSS 2.0 completo

## 📋 Próximos Passos para Google News

### 1. **Submeter ao Google News Publisher Center**
1. Acesse: https://news.google.com/publisher
2. Adicione seu site
3. Verifique propriedade do domínio
4. Configure categorias e seções

### 2. **Gerar Sitemap Dinâmico** ✅ IMPLEMENTADO
Endpoint `/sitemap.xml` que gera dinamicamente:
- ✅ URLs de todos os posts publicados
- ✅ URLs de categorias
- ✅ URLs de páginas especiais (homepage, esportes, clima)
- ✅ Prioridades e frequências de atualização
- ✅ Lastmod (data de modificação) para posts
- ✅ Cache configurado (1 hora)

### 3. **Gerar RSS Feed Dinâmico** ✅ IMPLEMENTADO
Endpoint `/rss.xml` que gera dinamicamente:
- ✅ Últimos 50 posts publicados
- ✅ Formato RSS 2.0 completo com namespaces
- ✅ Atualização automática
- ✅ Inclui título, descrição, link, autor, categoria, data
- ✅ Suporte a imagens (enclosure)
- ✅ Cache configurado (30 minutos)

### 4. **Melhorias Adicionais**
- [ ] Adicionar breadcrumbs estruturados
- [ ] Implementar paginação com rel="next/prev"
- [ ] Adicionar hreflang tags (se tiver versões em outros idiomas)
- [ ] Otimizar velocidade de carregamento
- [ ] Implementar lazy loading de imagens
- [ ] Adicionar alt text em todas as imagens

## 🔍 Checklist de SEO

### Meta Tags
- ✅ Title único por página
- ✅ Description única por página
- ✅ Keywords relevantes
- ✅ Open Graph completo
- ✅ Twitter Card

### Structured Data
- ✅ NewsArticle schema
- ✅ WebSite schema
- ✅ Organization schema (se necessário)

### Técnico
- ✅ Robots.txt configurado
- ✅ Canonical URLs
- ✅ Sitemap.xml (estrutura básica)
- ✅ RSS Feed (estrutura básica)
- ✅ HTML semântico

### Conteúdo
- ✅ Títulos H1 únicos
- ✅ Estrutura de headings (H1, H2, H3)
- ✅ URLs amigáveis
- ✅ Conteúdo original e relevante

## 📊 Monitoramento

### Ferramentas Recomendadas:
1. **Google Search Console**: Monitorar indexação e performance
2. **Google Analytics**: Acompanhar tráfego e comportamento
3. **Google News Publisher Center**: Gerenciar presença no Google News
4. **PageSpeed Insights**: Otimizar velocidade

### Métricas Importantes:
- Taxa de indexação
- Posições no Google News
- CTR (Click-Through Rate)
- Tempo de carregamento
- Core Web Vitals

## 🚀 Dicas para Melhor Ranking no Google News

1. **Publicar com frequência**: Quanto mais atualizado, melhor
2. **Conteúdo original**: Evitar duplicação
3. **Títulos claros e informativos**: Sem clickbait
4. **Imagens de qualidade**: Pelo menos 1200x675px
5. **Autor identificado**: Sempre incluir autor
6. **Data de publicação precisa**: Usar timestamps corretos
7. **Categorias bem definidas**: Organizar por temas
8. **Links internos**: Conectar artigos relacionados
