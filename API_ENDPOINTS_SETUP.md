# Configuração de Endpoints de API (Sitemap e RSS)

## ✅ Endpoints Implementados

### 1. Sitemap Dinâmico
**URL**: `https://n91.com.br/sitemap.xml`

**Funcionalidades**:
- Gera XML dinamicamente com todos os posts publicados
- Inclui URLs de categorias
- Inclui URLs de páginas especiais (homepage, esportes, clima)
- Define prioridades baseadas na recência dos posts
- Inclui lastmod (data de modificação)
- Cache de 1 hora

**Estrutura**:
- Posts recentes (últimas 24h): prioridade 0.9
- Posts antigos: prioridade 0.6
- Categorias: prioridade 0.7
- Páginas principais: prioridade 1.0

### 2. RSS Feed Dinâmico
**URL**: `https://n91.com.br/rss.xml`

**Funcionalidades**:
- Gera RSS 2.0 dinamicamente
- Últimos 50 posts publicados
- Inclui título, descrição, link, autor, categoria, data
- Suporte a imagens (enclosure)
- Cache de 30 minutos

## 🔧 Configuração na Vercel

### Variáveis de Ambiente Necessárias

Na Vercel, configure as seguintes variáveis de ambiente:

1. **VITE_SUPABASE_URL** (já configurada)
   - URL do seu projeto Supabase

2. **VITE_SUPABASE_PUBLISHABLE_KEY** (já configurada)
   - Chave pública/anônima do Supabase

3. **NEXT_PUBLIC_SITE_URL** (opcional, mas recomendado)
   - URL completa do site: `https://n91.com.br`
   - Se não configurada, usa `https://n91.com.br` como padrão

### Como Configurar

1. Acesse o painel da Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione/verifique as variáveis:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anonima
   NEXT_PUBLIC_SITE_URL=https://n91.com.br
   ```
4. Faça um novo deploy

## 📝 Como Funciona

### Sitemap.xml
- Acesse: `https://n91.com.br/sitemap.xml`
- A função serverless busca todos os posts publicados do Supabase
- Gera XML com todas as URLs
- Retorna com Content-Type: `application/xml`
- Cache de 1 hora para performance

### RSS.xml
- Acesse: `https://n91.com.br/rss.xml`
- A função serverless busca os últimos 50 posts do Supabase
- Gera RSS 2.0 completo com todos os metadados
- Retorna com Content-Type: `application/rss+xml`
- Cache de 30 minutos para performance

## 🔍 Verificação

### Testar Sitemap
1. Acesse: `https://n91.com.br/sitemap.xml`
2. Deve retornar XML válido
3. Verifique se todas as URLs estão presentes
4. Teste no Google Search Console: **Sitemaps** → Adicionar sitemap

### Testar RSS Feed
1. Acesse: `https://n91.com.br/rss.xml`
2. Deve retornar RSS válido
3. Teste em um leitor RSS (ex: Feedly)
4. Verifique se os posts aparecem corretamente

## 🚀 Próximos Passos

1. **Submeter Sitemap no Google Search Console**
   - Acesse: https://search.google.com/search-console
   - Vá em **Sitemaps**
   - Adicione: `https://n91.com.br/sitemap.xml`

2. **Configurar RSS no Google Publisher Center**
   - Acesse: https://publishers.google.com/
   - Vá em **Feeds**
   - Adicione: `https://n91.com.br/rss.xml`

3. **Monitorar**
   - Verifique se o Google está indexando as URLs
   - Monitore erros no Search Console
   - Acompanhe o número de URLs indexadas

## ⚠️ Notas Importantes

- Os endpoints são gerados dinamicamente, então sempre retornam dados atualizados
- O cache ajuda na performance, mas os dados são atualizados automaticamente
- Se não houver posts, os endpoints ainda retornam XML válido (com URLs estáticas)
- As URLs usam slugs baseados no título para SEO
