import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Priorizar variável de ambiente customizada, depois verificar se é produção
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_ENV === 'production' ? 'https://n91.com.br' : null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://n91.com.br');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os posts publicados
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        published_at,
        created_at,
        updated_at,
        categories:category_id (slug)
      `)
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (postsError) throw postsError;

    // Buscar categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug')
      .order('name');

    if (categoriesError) throw categoriesError;

    // Função para gerar slug
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 100);
    };

    // URLs estáticas
    const staticUrls = [
      { url: `${siteUrl}/`, priority: "1.0", changefreq: "hourly" },
      { url: `${siteUrl}/esportes`, priority: "0.8", changefreq: "daily" },
      { url: `${siteUrl}/clima`, priority: "0.8", changefreq: "daily" },
    ];

    // URLs de categorias
    const categoryUrls = (categories || []).map((cat: any) => ({
      url: `${siteUrl}/categoria/${cat.slug}`,
      priority: "0.7",
      changefreq: "daily",
    }));

    // URLs de posts
    const postUrls = (posts || []).map((post: any) => {
      const slug = generateSlug(post.title);
      const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
      const lastmod = post.updated_at ? new Date(post.updated_at).toISOString() : publishedDate.toISOString();
      const isRecent = Date.now() - publishedDate.getTime() < 24 * 60 * 60 * 1000;
      const priority = isRecent ? "0.9" : "0.6";

      return {
        url: `${siteUrl}/noticia/${slug}`,
        priority,
        changefreq: "weekly",
        lastmod,
      };
    });

    // Gerar XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${staticUrls.map((item) => `  <url>
    <loc>${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
${categoryUrls.map((item) => `  <url>
    <loc>${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
${postUrls.map((item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);
  } catch (error: any) {
    console.error('Erro ao gerar sitemap:', error);
    res.status(500).json({ error: 'Erro ao gerar sitemap' });
  }
}
